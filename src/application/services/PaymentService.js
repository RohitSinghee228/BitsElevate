const externalServices = require('../../infrastructure/external-services');
const Course = require('../../domain/models/Course');
const User = require('../../domain/models/User');
const PaymentTransaction = require('../../domain/models/PaymentTransaction');
const UserEnrollment = require('../../domain/models/UserEnrollment');
const PaymentCard = require('../../domain/models/PaymentCard');
const CourseService = require('./CourseService');

// Extract Stripe and Mailgun instances
const stripe = externalServices.stripe;
const mailgun = externalServices.mailgun;

class PaymentService {
  async createPaymentIntent(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create payment intent (real or mock depending on STRIPE_ENABLED)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: course._id.toString(),
        userId: user._id.toString()
      }
    });

    if (process.env.STRIPE_ENABLED === 'false') {
      console.log('Mock mode: Created simulated payment intent:', paymentIntent.id);
    }

    // Create a pending payment transaction
    const transaction = new PaymentTransaction({
      userId: user._id,
      courseId: course._id,
      amount: course.price,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id
    });
    await transaction.save();

    return {
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      transactionId: paymentIntent.id
    };
  }

  async confirmPayment(paymentIntentId) {
    // For mock mode, we'll auto-confirm any payment
    if (process.env.STRIPE_ENABLED === 'false') {
      console.log('Mock mode: Auto-confirming payment:', paymentIntentId);
      
      // Get transaction to extract courseId and userId
      const transaction = await PaymentTransaction.findOne({ transactionId: paymentIntentId });
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      const courseId = transaction.courseId;
      const userId = transaction.userId;
      
      // Update transaction status
      transaction.status = 'completed';
      await transaction.save();
      
      const course = await Course.findById(courseId);
      const user = await User.findById(userId);
      
      // Enroll student in course
      await CourseService.enrollStudent(courseId, userId, paymentIntentId);
      
      // Send confirmation email
      await this.sendEnrollmentConfirmationEmail(user, course);
      
      return {
        success: true,
        course: course,
        user: user,
        transaction: transaction
      };
    } else {
      // Normal Stripe flow
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }
  
      const { courseId, userId } = paymentIntent.metadata;
      const course = await Course.findById(courseId);
      const user = await User.findById(userId);
  
      // Update transaction status
      const transaction = await PaymentTransaction.findOne({ transactionId: paymentIntentId });
      if (transaction) {
        transaction.status = 'completed';
        await transaction.save();
      }
  
      // Enroll student in course using CourseService
      await CourseService.enrollStudent(courseId, userId, paymentIntentId);
  
      // Send confirmation email
      await this.sendEnrollmentConfirmationEmail(user, course);
  
      return {
        success: true,
        course: course,
        user: user,
        transaction: transaction
      };
    }
  }

  async getPaymentTransactions(userId) {
    return await PaymentTransaction.find({ userId })
      .populate('courseId')
      .populate('userId', 'firstName lastName email');
  }

  async getPaymentTransactionById(transactionId) {
    return await PaymentTransaction.findOne({ transactionId })
      .populate('courseId')
      .populate('userId', 'firstName lastName email');
  }

  async createRefund(transactionId) {
    const transaction = await PaymentTransaction.findOne({ transactionId });
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'completed') {
      throw new Error('Cannot refund an incomplete transaction');
    }

    // Process refund in Stripe (real or mock)
    let refund;
    if (process.env.STRIPE_ENABLED === 'false') {
      console.log('Mock mode: Processing simulated refund for transaction:', transactionId);
      refund = {
        id: `mock_refund_${Date.now()}`,
        status: 'succeeded'
      };
    } else {
      refund = await stripe.refunds.create({
        payment_intent: transactionId
      });
    }

    // Update transaction status
    transaction.status = 'refunded';
    await transaction.save();

    // Remove the enrollment
    await CourseService.cancelEnrollment(transaction.courseId, transaction.userId);

    return {
      success: true,
      refund: refund,
      transaction: transaction
    };
  }

  async sendEnrollmentConfirmationEmail(user, course) {
    if (!process.env.MAILGUN_ENABLED || process.env.MAILGUN_ENABLED !== 'true') {
      console.log('Email sending is disabled');
      return;
    }

    if (!mailgun) {
      console.log('Mailgun is not properly configured');
      return;
    }

    try {
      const emailContent = {
        from: `EduPulse <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: user.email,
        subject: 'Course Enrollment Confirmation',
        text: `Dear ${user.firstName},\n\nYou have successfully enrolled in the course "${course.title}".\n\nThank you for choosing EduPulse!`,
        html: `
          <h1>Course Enrollment Confirmation</h1>
          <p>Dear ${user.firstName},</p>
          <p>You have successfully enrolled in the course <strong>${course.title}</strong>.</p>
          <p>Thank you for choosing EduPulse!</p>
        `
      };

      await mailgun.messages.create(process.env.MAILGUN_DOMAIN, emailContent);
      console.log('Enrollment confirmation email sent to', user.email);
    } catch (error) {
      console.error('Failed to send enrollment confirmation email:', error);
    }
  }

  async saveCard(userId, token, cardDetails = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // For mock mode (STRIPE_ENABLED=false), we'll accept any token
      let card;
      if (process.env.STRIPE_ENABLED === 'false') {
        // Use provided card details if available (directly from frontend)
        if (cardDetails && cardDetails.last4 && cardDetails.brand) {
          console.log('Mock mode: Using card details from frontend:', cardDetails);
          card = {
            last4: cardDetails.last4,
            brand: cardDetails.brand,
            exp_month: cardDetails.exp_month || new Date().getMonth() + 1,
            exp_year: cardDetails.exp_year || new Date().getFullYear() + 3
          };
        } else {
          // Fallback to token-based detection for test cards
          // Check if it's a known test card from the token
          let testCardLast4 = '4242';  // Default to a test card
          let brand = 'Visa';
          
          // Special handling for frontend-provided metadata
          // The token might have special format like tok_visa_4242 or similar
          if (token.includes('4242')) {
            testCardLast4 = '4242';
            brand = 'Visa';
          } else if (token.includes('5555')) {
            testCardLast4 = '5555';
            brand = 'Mastercard';
          } else if (token.includes('3782')) {
            testCardLast4 = '3782';
            brand = 'Amex';
          } else if (token.includes('6011')) {
            testCardLast4 = '6011';
            brand = 'Discover';
          } else {
            // Generate random card data if no recognized pattern
            const cardBrands = ['Visa', 'Mastercard', 'Amex', 'Discover'];
            brand = cardBrands[Math.floor(Math.random() * cardBrands.length)];
            
            // Always use numeric last4
            testCardLast4 = Math.floor(1000 + Math.random() * 9000).toString();
          }
          
          // Current month and a future year for expiration
          const now = new Date();
          const expMonth = now.getMonth() + 1; // 1-12
          const expYear = now.getFullYear() + 2 + Math.floor(Math.random() * 5); // 2-7 years in future
          
          card = {
            last4: testCardLast4,
            brand: brand,
            exp_month: expMonth,
            exp_year: expYear
          };
          
          console.log('Mock mode: Created mock card:', card);
        }
      } else {
        // Check if Stripe is configured
        if (!stripe) {
          throw new Error('Stripe is not properly configured');
        }

        // Retrieve the token details from Stripe
        const tokenDetails = await stripe.tokens.retrieve(token);
        card = tokenDetails.card;
      }

      // Check if the user already has this card
      const existingCard = await PaymentCard.findOne({ 
        userId, 
        last4: card.last4,
        brand: card.brand,
        expirationMonth: card.exp_month.toString(),
        expirationYear: card.exp_year.toString()
      });

      if (existingCard) {
        throw new Error('This card is already saved to your account');
      }

      // If this is the first card, make it default
      const isDefault = !(await PaymentCard.findOne({ userId }));

      // Save the card to the database
      const paymentCard = new PaymentCard({
        userId,
        cardToken: token,
        last4: card.last4,
        brand: card.brand,
        expirationMonth: card.exp_month.toString(),
        expirationYear: card.exp_year.toString(),
        isDefault
      });

      await paymentCard.save();
      console.log('Card saved to database:', {
        id: paymentCard._id,
        last4: paymentCard.last4,
        brand: paymentCard.brand,
        expirationMonth: paymentCard.expirationMonth,
        expirationYear: paymentCard.expirationYear
      });
      
      return { 
        message: 'Card saved successfully',
        card: {
          id: paymentCard._id,
          last4: paymentCard.last4,
          brand: paymentCard.brand,
          exp_month: parseInt(paymentCard.expirationMonth),
          exp_year: parseInt(paymentCard.expirationYear),
          isDefault: paymentCard.isDefault
        }
      };
    } catch (error) {
      console.error('Error saving card:', error);
      throw new Error(`Failed to save card: ${error.message}`);
    }
  }

  async getUserCards(userId) {
    console.log('[PaymentService] Fetching cards for user:', userId);
    const cards = await PaymentCard.find({ userId })
      .select('-cardToken') // Don't send the token back to the client
      .sort({ isDefault: -1, createdAt: -1 });
    
    console.log('[PaymentService] Raw cards from database:', JSON.stringify(cards));
      
    // Format cards to match what the frontend expects
    const formattedCards = cards.map(card => ({
      id: card._id.toString(),
      last4: card.last4,
      brand: card.brand,
      exp_month: parseInt(card.expirationMonth),
      exp_year: parseInt(card.expirationYear),
      isDefault: card.isDefault
    }));
    
    console.log('[PaymentService] Formatted cards for frontend:', JSON.stringify(formattedCards));
    
    return formattedCards;
  }

  async setDefaultCard(userId, cardId) {
    // First, set all user's cards to non-default
    await PaymentCard.updateMany({ userId }, { isDefault: false });
    
    // Then set the selected card as default
    const card = await PaymentCard.findOneAndUpdate(
      { _id: cardId, userId },
      { isDefault: true },
      { new: true }
    );

    if (!card) {
      throw new Error('Card not found');
    }

    return card;
  }

  async deleteCard(userId, cardId) {
    const card = await PaymentCard.findOne({ _id: cardId, userId });
    
    if (!card) {
      throw new Error('Card not found');
    }

    // Use deleteOne instead of remove (which is deprecated)
    await PaymentCard.deleteOne({ _id: cardId });

    // If this was the default card and there are other cards, make another one default
    if (card.isDefault) {
      const anotherCard = await PaymentCard.findOne({ userId });
      if (anotherCard) {
        anotherCard.isDefault = true;
        await anotherCard.save();
      }
    }

    return { message: 'Card deleted successfully' };
  }
}

module.exports = new PaymentService(); 