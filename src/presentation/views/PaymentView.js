const { render } = require('../../infrastructure/templateEngine');

class PaymentView {
    static async renderCheckout(req, res) {
        try {
            const { courseId } = req.params;
            const data = {
                title: 'Checkout',
                user: req.user,
                course: null, // This will be populated from the application layer
                price: 0, // This will be populated from the application layer
                paymentMethods: [] // This will be populated from the application layer
            };
            
            return render(res, 'checkout', data);
        } catch (error) {
            console.error('Error rendering checkout:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async renderPaymentHistory(req, res) {
        try {
            const data = {
                title: 'Payment History',
                user: req.user,
                transactions: [], // This will be populated from the application layer
                subscriptions: [] // This will be populated from the application layer
            };
            
            return render(res, 'payment-history', data);
        } catch (error) {
            console.error('Error rendering payment history:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = PaymentView; 