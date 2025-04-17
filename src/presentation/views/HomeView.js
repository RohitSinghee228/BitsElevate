const { render } = require('../../infrastructure/templateEngine');

class HomeView {
    static async renderHome(req, res) {
        try {
            const data = {
                title: 'EduPulse - Home',
                user: req.user || null,
                courses: [], // This will be populated from the application layer
                featuredCourses: [] // This will be populated from the application layer
            };
            
            return render(res, 'home', data);
        } catch (error) {
            console.error('Error rendering home view:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async renderCourseDetails(req, res) {
        try {
            const { courseId } = req.params;
            const data = {
                title: 'Course Details',
                user: req.user || null,
                course: null, // This will be populated from the application layer
                enrolled: false // This will be populated from the application layer
            };
            
            return render(res, 'course-details', data);
        } catch (error) {
            console.error('Error rendering course details:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = HomeView; 