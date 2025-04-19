const stripe = process.env.STRIPE_ENABLED === 'false' 
  ? createMockStripeService() 
  : require('stripe')(process.env.STRIPE_SECRET_KEY);
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

// Create a mock Stripe service for development/testing
function createMockStripeService() {
  console.log('Using mock Stripe service - payments will be simulated');
  return {
    paymentIntents: {
      create: async (options) => ({
        id: `mock_payment_${Date.now()}`,
        client_secret: `mock_secret_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        status: 'requires_confirmation',
        metadata: options.metadata
      }),
      retrieve: async (id) => ({
        id,
        status: 'succeeded',
        metadata: id.startsWith('mock_payment_') ? JSON.parse(id.split('mock_payment_')[1] || '{}') : {}
      }),
      confirm: async (id) => ({
        id,
        status: 'succeeded'
      })
    },
    refunds: {
      create: async (options) => ({
        id: `mock_refund_${Date.now()}`,
        payment_intent: options.payment_intent,
        status: 'succeeded'
      })
    },
    tokens: {
      retrieve: async (token) => ({
        id: token,
        card: {
          id: `card_${Date.now()}`,
          last4: '4242',
          brand: 'Visa',
          exp_month: 12,
          exp_year: 2030
        }
      })
    }
  };
}

const setupExternalServices = () => {
  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Stripe secret key not found. Payment processing will be disabled.');
  }

  // Initialize Mailgun
  if (process.env.MAILGUN_ENABLED === 'true') {
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.warn('Mailgun configuration missing. Email services will be disabled.');
    }
  }
};

const stripeService = {
  createPaymentIntent: async (amount, currency = 'usd') => {
    return await stripe.paymentIntents.create({
      amount,
      currency,
    });
  },
  
  confirmPayment: async (paymentIntentId) => {
    return await stripe.paymentIntents.confirm(paymentIntentId);
  }
};

const emailService = {
  sendEmail: async (to, subject, text) => {
    if (process.env.MAILGUN_ENABLED !== 'true') {
      console.log('Email sending is disabled');
      return;
    }

    try {
      await mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }
};

module.exports = {
  setupExternalServices,
  stripeService,
  emailService,
  stripe,  // Export the raw Stripe instance for direct use
  mailgun: mg  // Export the configured Mailgun client
}; 