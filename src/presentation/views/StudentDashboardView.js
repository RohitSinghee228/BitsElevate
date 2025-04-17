const { render } = require('../../infrastructure/templateEngine');

class StudentDashboardView {
    static async renderDashboard(req, res) {
        try {
            const data = {
                title: 'Student Dashboard',
                user: req.user,
                enrolledCourses: [], // This will be populated from the application layer
                progress: {}, // This will be populated from the application layer
                certificates: [] // This will be populated from the application layer
            };
            
            return render(res, 'student-dashboard', data);
        } catch (error) {
            console.error('Error rendering student dashboard:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async renderCourseProgress(req, res) {
        try {
            const { courseId } = req.params;
            const data = {
                title: 'Course Progress',
                user: req.user,
                course: null, // This will be populated from the application layer
                progress: {}, // This will be populated from the application layer
                assignments: [] // This will be populated from the application layer
            };
            
            return render(res, 'course-progress', data);
        } catch (error) {
            console.error('Error rendering course progress:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = StudentDashboardView; 