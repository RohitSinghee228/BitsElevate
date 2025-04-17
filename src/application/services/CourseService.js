const Course = require('../../domain/models/Course');
const User = require('../../domain/models/User');
const UserEnrollment = require('../../domain/models/UserEnrollment');
const PaymentTransaction = require('../../domain/models/PaymentTransaction');

class CourseService {
  async createCourse(courseData) {
    const course = new Course(courseData);
    await course.save();
    return course;
  }

  async getCourseById(id) {
    return await Course.findById(id)
      .populate('instructor', 'firstName lastName email')
      .populate('studentsEnrolled', 'firstName lastName email');
  }

  async getAllCourses() {
    return await Course.find()
      .populate('instructor', 'firstName lastName email')
      .populate('studentsEnrolled', 'firstName lastName email');
  }

  async updateCourse(id, updateData) {
    return await Course.findByIdAndUpdate(id, updateData, { new: true })
      .populate('instructor', 'firstName lastName email')
      .populate('studentsEnrolled', 'firstName lastName email');
  }

  async deleteCourse(id) {
    return await Course.findByIdAndDelete(id);
  }

  async enrollStudent(courseId, userId, transactionId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is already enrolled
    if (course.studentsEnrolled.includes(userId)) {
      throw new Error('User is already enrolled in this course');
    }

    // Add student to course
    course.studentsEnrolled.push(userId);
    await course.save();

    // Create enrollment record
    const enrollment = new UserEnrollment({
      userId,
      courseId,
      transactionId,
      currentStep: 0,
      completed: false
    });
    await enrollment.save();

    return course;
  }

  async cancelEnrollment(courseId, userId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove student from course
    course.studentsEnrolled = course.studentsEnrolled.filter(
      student => student.toString() !== userId
    );
    await course.save();

    // Remove enrollment record
    await UserEnrollment.findOneAndDelete({ userId, courseId });

    return { message: 'Enrollment cancelled successfully' };
  }

  async getUserEnrolledCourses(userId) {
    const enrollments = await UserEnrollment.find({ userId, completed: false })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'firstName lastName email' }
      });
    
    return enrollments.map(enrollment => ({
      ...enrollment.courseId.toObject(),
      progress: enrollment.currentStep,
      enrollmentId: enrollment._id
    }));
  }

  async getUserCompletedCourses(userId) {
    const enrollments = await UserEnrollment.find({ userId, completed: true })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'firstName lastName email' }
      });
    
    return enrollments.map(enrollment => ({
      ...enrollment.courseId.toObject(),
      completedAt: enrollment.completedAt,
      enrollmentId: enrollment._id
    }));
  }

  async getUserEnrollmentForCourse(userId, courseId) {
    return await UserEnrollment.findOne({ userId, courseId })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'firstName lastName email' }
      });
  }

  async updateCourseProgress(userId, courseId, step) {
    const enrollment = await UserEnrollment.findOne({ userId, courseId });
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    enrollment.currentStep = step;
    await enrollment.save();
    return enrollment;
  }

  async markCourseAsCompleted(userId, courseId) {
    const enrollment = await UserEnrollment.findOne({ userId, courseId });
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    enrollment.completed = true;
    enrollment.completedAt = new Date();
    await enrollment.save();
    return enrollment;
  }

  async addLesson(courseId, lessonData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    course.lessons.push(lessonData);
    await course.save();
    return course;
  }

  async updateLesson(courseId, lessonId, updateData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const lessonIndex = course.lessons.findIndex(lesson => lesson._id.toString() === lessonId);
    if (lessonIndex === -1) {
      throw new Error('Lesson not found');
    }

    course.lessons[lessonIndex] = { ...course.lessons[lessonIndex].toObject(), ...updateData };
    await course.save();
    return course;
  }

  async deleteLesson(courseId, lessonId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    course.lessons = course.lessons.filter(lesson => lesson._id.toString() !== lessonId);
    await course.save();
    return course;
  }
}

module.exports = new CourseService(); 