const mongoose = require('mongoose');

const userEnrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  currentStep: {
    type: Number,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
});

// Create a compound index to ensure a user can only enroll once in a course
userEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('UserEnrollment', userEnrollmentSchema); 