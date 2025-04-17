const express = require('express');
const router = express.Router();
const courseService = require('../../application/services/CourseService');
const { authenticateToken } = require('../../infrastructure/security');

// Public routes
router.get('/courseManagement/getAll', async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json({ data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/courseManagement/:id', async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ data: course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected routes
router.post('/courseManagement/create', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only instructors can create courses' });
    }

    const courseData = {
      ...req.body,
      instructor: req.user.id
    };
    const course = await courseService.createCourse(courseData);
    res.status(201).json({ data: course });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/courseManagement/update/:id', authenticateToken, async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the course instructor can update the course' });
    }

    const updatedCourse = await courseService.updateCourse(req.params.id, req.body);
    res.json({ data: updatedCourse });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/courseManagement/:id', authenticateToken, async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the course instructor can delete the course' });
    }

    await courseService.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Course enrollment
router.post('/courseManagement/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId, userId, transactionId } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only enroll yourself in courses' });
    }
    
    const result = await courseService.enrollStudent(courseId, userId, transactionId);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/courseManagement/cancelEnrollment', authenticateToken, async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only cancel your own enrollments' });
    }
    
    const result = await courseService.cancelEnrollment(courseId, userId);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Course progress and completion
router.post('/courseManagement/completedCourse', authenticateToken, async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own progress' });
    }
    
    const result = await courseService.markCourseAsCompleted(userId, courseId);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/courseManagement/saveProgress', authenticateToken, async (req, res) => {
  try {
    const { userId, courseId, step } = req.body;
    
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own progress' });
    }
    
    const result = await courseService.updateCourseProgress(userId, courseId, step);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Course enrollment queries
router.get('/courseManagement/enrolledCourses/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own enrolled courses' });
    }
    
    const courses = await courseService.getUserEnrolledCourses(req.params.userId);
    res.json({ data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/courseManagement/completedCourses/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own completed courses' });
    }
    
    const courses = await courseService.getUserCompletedCourses(req.params.userId);
    res.json({ data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/courseManagement/enrolledCourses/:userId/:courseId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only view your own enrollment details' });
    }
    
    const enrollment = await courseService.getUserEnrollmentForCourse(req.params.userId, req.params.courseId);
    res.json({ data: enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lesson management
router.post('/courseManagement/:id/lessons', authenticateToken, async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the course instructor can add lessons' });
    }

    const updatedCourse = await courseService.addLesson(req.params.id, req.body);
    res.status(201).json({ data: updatedCourse });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/courseManagement/:id/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the course instructor can update lessons' });
    }

    const updatedCourse = await courseService.updateLesson(
      req.params.id,
      req.params.lessonId,
      req.body
    );
    res.json({ data: updatedCourse });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/courseManagement/:id/lessons/:lessonId', authenticateToken, async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the course instructor can delete lessons' });
    }

    const updatedCourse = await courseService.deleteLesson(req.params.id, req.params.lessonId);
    res.json({ data: updatedCourse });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 