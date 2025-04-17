const { render } = require('../../infrastructure/templateEngine');

class AdminView {
    static async renderDashboard(req, res) {
        try {
            const data = {
                title: 'Admin Dashboard',
                user: req.user,
                platformStats: {}, // This will be populated from the application layer
                recentActivities: [], // This will be populated from the application layer
                userManagement: {} // This will be populated from the application layer
            };
            
            return render(res, 'admin-dashboard', data);
        } catch (error) {
            console.error('Error rendering admin dashboard:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async renderUserManagement(req, res) {
        try {
            const data = {
                title: 'User Management',
                user: req.user,
                users: [], // This will be populated from the application layer
                roles: [], // This will be populated from the application layer
                permissions: {} // This will be populated from the application layer
            };
            
            return render(res, 'user-management', data);
        } catch (error) {
            console.error('Error rendering user management:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AdminView; 