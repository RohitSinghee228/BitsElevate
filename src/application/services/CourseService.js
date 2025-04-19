const Course = require('../../domain/models/Course');
const User = require('../../domain/models/User');
const UserEnrollment = require('../../domain/models/UserEnrollment');
const PaymentTransaction = require('../../domain/models/PaymentTransaction');

class CourseService {
  // Internal helper to convert courseContent to a format compatible with the database
  _prepareCourseDataForStorage(courseData) {
    if (!courseData) return courseData;
    
    // Create a clone of the courseData
    const courseDataObj = {...courseData};
    
    // If courseContent exists, transform it to the format we need for storage
    if (courseDataObj.courseContent && Array.isArray(courseDataObj.courseContent)) {
      // We'll store all data in the courseContent field only
      courseDataObj.courseContent = courseDataObj.courseContent.map((content, index) => ({
        videoLink: content.videoLink,
        instructions: Array.isArray(content.instructions) ? content.instructions : []
      }));
    }
    
    return courseDataObj;
  }

  async createCourse(courseData) {
    try {
      // Prepare data for storage
      const preparedData = this._prepareCourseDataForStorage(courseData);
      
      const course = new Course(preparedData);
      await course.save();
      
      return course;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  async getCourseById(id) {
    try {
      const course = await Course.findById(id)
        .populate('instructor', 'firstName lastName email')
        .populate('studentsEnrolled', 'firstName lastName email');
      
      if (!course) return null;
      
      return course;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      throw error;
    }
  }

  async getAllCourses() {
    try {
      const courses = await Course.find()
        .populate('instructor', 'firstName lastName email')
        .populate('studentsEnrolled', 'firstName lastName email');
      
      return courses;
    } catch (error) {
      console.error('Error getting all courses:', error);
      throw error;
    }
  }

  async updateCourse(id, updateData) {
    try {
      // Prepare data for storage
      const preparedData = this._prepareCourseDataForStorage(updateData);
      
      const updatedCourse = await Course.findByIdAndUpdate(id, preparedData, { new: true })
        .populate('instructor', 'firstName lastName email')
        .populate('studentsEnrolled', 'firstName lastName email');
      
      return updatedCourse;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  async deleteCourse(id) {
    return await Course.findByIdAndDelete(id);
  }

  async enrollStudent(courseId, userId, transactionId) {
    try {
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
    } catch (error) {
      console.error('Error enrolling student:', error);
      throw error;
    }
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
    
    return enrollments.map(enrollment => {
      // Just return the course object with enrollment info
      const courseObj = enrollment.courseId ? enrollment.courseId.toObject() : {};
      
      // Make sure name field exists (use title as fallback)
      if (courseObj.title && !courseObj.name) {
        courseObj.name = courseObj.title;
      }
      
      return {
        ...courseObj,
        progress: enrollment.currentStep,
        enrollmentId: enrollment._id
      };
    });
  }

  async getUserCompletedCourses(userId) {
    const enrollments = await UserEnrollment.find({ userId, completed: true })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'firstName lastName email' }
      });
    
    return enrollments.map(enrollment => {
      // Just return the course object with enrollment info
      const courseObj = enrollment.courseId ? enrollment.courseId.toObject() : {};
      
      // Make sure name field exists (use title as fallback)
      if (courseObj.title && !courseObj.name) {
        courseObj.name = courseObj.title;
      }
      
      return {
        ...courseObj,
        completedAt: enrollment.completedAt,
        enrollmentId: enrollment._id
      };
    });
  }

  async getUserEnrollmentForCourse(userId, courseId) {
    const enrollment = await UserEnrollment.findOne({ userId, courseId })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'firstName lastName email' }
      });
    
    return enrollment;
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
    
    // Create new course content entry
    if (!course.courseContent) {
      course.courseContent = [];
    }
    
    course.courseContent.push({
      videoLink: lessonData.videoUrl || '',
      instructions: lessonData.content ? lessonData.content.split('\n') : []
    });
    
    await course.save();
    return course;
  }

  async updateLesson(courseId, lessonId, updateData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Find the content item by index (using lessonId as index)
    const index = parseInt(lessonId, 10);
    if (isNaN(index) || index < 0 || !course.courseContent || index >= course.courseContent.length) {
      throw new Error('Lesson not found');
    }

    // Update the content
    course.courseContent[index] = {
      ...course.courseContent[index],
      videoLink: updateData.videoUrl || course.courseContent[index].videoLink,
      instructions: updateData.content ? updateData.content.split('\n') : course.courseContent[index].instructions
    };
    
    await course.save();
    return course;
  }

  async deleteLesson(courseId, lessonId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Find the content item by index (using lessonId as index)
    const index = parseInt(lessonId, 10);
    if (isNaN(index) || index < 0 || !course.courseContent || index >= course.courseContent.length) {
      throw new Error('Lesson not found');
    }
    
    // Remove the content item
    course.courseContent.splice(index, 1);
    
    await course.save();
    return course;
  }
}

module.exports = new CourseService(); 