const express = require('express');
const router = express.Router();
const paymentService = require('../../application/services/PaymentService');
const { authenticateToken } = require('../../infrastructure/security');
const PaymentTransaction = require('../../domain/models/PaymentTransaction');

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

// Save a payment card
router.post('/cards', authenticateToken, async (req, res) => {
  try {
    const { token, userId, cardDetails } = req.body;
    
    console.log('[PAYMENT ROUTE] Save card request received:', { 
      token, 
      userId,
      cardDetails: cardDetails ? `${cardDetails.brand} ending in ${cardDetails.last4}` : 'No card details provided'
    });
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      console.log('[PAYMENT ROUTE] Authorization failed: user can only save cards for themselves');
      return res.status(403).json({ message: 'You can only save cards for yourself' });
    }
    
    console.log('[PAYMENT ROUTE] Authorization passed, calling saveCard service');
    const result = await paymentService.saveCard(userId, token, cardDetails);
    console.log('[PAYMENT ROUTE] saveCard result:', result);
    
    res.json({ data: result });
  } catch (error) {
    console.error('[PAYMENT ROUTE] Error saving card:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Get user's payment cards - support both singular and plural endpoint paths
router.get('/cards/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own cards' });
    }
    
    const cards = await paymentService.getUserCards(userId);
    res.json({ data: cards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Support singular endpoint for backward compatibility
router.get('/card/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('[PAYMENT ROUTE] Fetching card (singular) for user:', userId);
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own cards' });
    }
    
    const cards = await paymentService.getUserCards(userId);
    // For the singular endpoint, return the default card or the first one
    const defaultCard = cards.find(card => card.isDefault) || cards[0] || null;
    
    console.log('[PAYMENT ROUTE] Retrieved card:', defaultCard);
    res.json({ data: defaultCard });
  } catch (error) {
    console.error('[PAYMENT ROUTE] Error fetching card:', error);
    res.status(500).json({ message: error.message });
  }
});

// Set a card as default
router.put('/cards/:userId/:cardId/default', authenticateToken, async (req, res) => {
  try {
    const { userId, cardId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own cards' });
    }
    
    const card = await paymentService.setDefaultCard(userId, cardId);
    res.json({ data: card });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a payment card
router.delete('/cards/:userId/:cardId', authenticateToken, async (req, res) => {
  try {
    const { userId, cardId } = req.params;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own cards' });
    }
    
    const result = await paymentService.deleteCard(userId, cardId);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all payment transactions (admin only)
router.get('/transactions/all', authenticateToken, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Get all transactions from the database
    const transactions = await PaymentTransaction.find()
      .populate('courseId')
      .populate('userId', 'firstName lastName email');
    
    res.json({ data: transactions });
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ message: error.message });
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

// Process transaction for course purchase
router.post('/transactions', authenticateToken, async (req, res) => {
  try {
    const { userId, courseId, amount } = req.body;
    
    console.log('[PAYMENT ROUTE] Transaction request received:', { 
      userId, courseId, amount
    });
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only create transactions for yourself' });
    }
    
    // Create a direct payment transaction
    const transaction = new PaymentTransaction({
      userId,
      courseId,
      amount: parseFloat(amount),
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      transactionId: `direct_payment_${Date.now()}`
    });
    
    await transaction.save();
    console.log('[PAYMENT ROUTE] Transaction created:', transaction);
    
    res.json({ data: transaction });
  } catch (error) {
    console.error('[PAYMENT ROUTE] Error creating transaction:', error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 