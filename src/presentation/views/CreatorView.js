const { render } = require('../../infrastructure/templateEngine');

class CreatorView {
    static async renderDashboard(req, res) {
        try {
            const data = {
                title: 'Creator Dashboard',
                user: req.user,
                createdCourses: [], // This will be populated from the application layer
                earnings: {}, // This will be populated from the application layer
                analytics: {} // This will be populated from the application layer
            };
            
            return render(res, 'creator-dashboard', data);
        } catch (error) {
            console.error('Error rendering creator dashboard:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async renderCourseManagement(req, res) {
        try {
            const { courseId } = req.params;
            const data = {
                title: 'Course Management',
                user: req.user,
                course: null, // This will be populated from the application layer
                students: [], // This will be populated from the application layer
                content: [] // This will be populated from the application layer
            };
            
            return render(res, 'course-management', data);
        } catch (error) {
            console.error('Error rendering course management:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = CreatorView; 