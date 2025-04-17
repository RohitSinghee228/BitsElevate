const User = require('../../domain/models/User');
const { hashPassword, verifyPassword, generateToken } = require('../../infrastructure/security');

class UserService {
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role } = userData;
      
      console.log('Received registration data:', { email, firstName, lastName, role });
      
      if (!email || !password || !firstName || !lastName) {
        throw new Error('All fields are required');
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create new user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'student' // Default to student if no role provided
      });

      console.log('Creating user with role:', user.role);
      
      await user.save();
      
      // Return user without password
      const userObject = user.toObject();
      delete userObject.password;
      
      return userObject;
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found. Please check your email or register');
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid password. Please try again');
      }

      const token = generateToken(user);
      
      // Convert to object to remove password
      const userObject = user.toObject();
      delete userObject.password;
      
      return { user: userObject, token };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findById(id).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Get user error:', error.message);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
      }
      
      const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Update user error:', error.message);
      throw error;
    }
  }

  async enrollInCourse(userId, courseId) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledCourses: courseId } },
        { new: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      console.error('Enroll in course error:', error.message);
      throw error;
    }
  }
  
  async getAllUsers() {
    try {
      return await User.find().select('-password');
    } catch (error) {
      console.error('Get all users error:', error.message);
      throw error;
    }
  }
  
  async deleteUser(id) {
    try {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        throw new Error('User not found');
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Delete user error:', error.message);
      throw error;
    }
  }
  
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Get user by email error:', error.message);
      throw error;
    }
  }
}

module.exports = new UserService(); 