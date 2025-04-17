const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

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

    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    });

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
  emailService
}; 