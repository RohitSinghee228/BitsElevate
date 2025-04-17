const { stripe, mailgun } = require('../../infrastructure/external-services');
const Course = require('../../domain/models/Course');
const User = require('../../domain/models/User');
const PaymentTransaction = require('../../domain/models/PaymentTransaction');
const UserEnrollment = require('../../domain/models/UserEnrollment');
const CourseService = require('./CourseService');

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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: course._id.toString(),
        userId: user._id.toString()
      }
    });

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

    // Process refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transactionId
    });

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
    if (!process.env.MAILGUN_ENABLED) {
      console.log('Email sending is disabled');
      return;
    }

    try {
      await mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
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
      });
    } catch (error) {
      console.error('Failed to send enrollment confirmation email:', error);
    }
  }
}

module.exports = new PaymentService(); 