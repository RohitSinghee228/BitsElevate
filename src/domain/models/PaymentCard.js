const mongoose = require('mongoose');

const paymentCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardToken: {
    type: String,
    required: true
  },
  last4: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  expirationMonth: {
    type: String,
    required: true
  },
  expirationYear: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PaymentCard', paymentCardSchema); 