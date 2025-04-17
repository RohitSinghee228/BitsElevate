const express = require('express');
const router = express.Router();
const paymentService = require('../../application/services/PaymentService');
const { authenticateToken } = require('../../infrastructure/security');

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create payment intents for yourself' });
    }
    
    const paymentIntent = await paymentService.createPaymentIntent(courseId, userId);
    res.json({ data: paymentIntent });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const result = await paymentService.confirmPayment(paymentIntentId);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment transactions for a user
router.get('/transactions/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own transactions' });
    }
    
    const transactions = await paymentService.getPaymentTransactions(req.params.userId);
    res.json({ data: transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment transaction by ID
router.get('/transaction/:transactionId', authenticateToken, async (req, res) => {
  try {
    const transaction = await paymentService.getPaymentTransactionById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own transactions' });
    }
    
    res.json({ data: transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process refund
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const transaction = await paymentService.getPaymentTransactionById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only refund your own payments' });
    }
    
    const result = await paymentService.createRefund(transactionId);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 