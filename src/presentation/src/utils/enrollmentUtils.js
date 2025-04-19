/**
 * Utility functions related to course enrollment
 */

/**
 * Checks if a user is enrolled in a specific course
 * @param {string} userId - The ID of the user
 * @param {string} courseId - The ID of the course
 * @returns {Promise<boolean>} - Whether the user is enrolled
 */
export const checkUserEnrollment = async (userId, courseId) => {
  if (!userId || !courseId) {
    console.error("Missing userId or courseId for enrollment check");
    return false;
  }

  try {
    console.log(`Checking enrollment for user ${userId} in course ${courseId}`);
    const response = await fetch(
      `http://localhost:3001/api/courses/courseManagement/enrolledCourses/${userId}/${courseId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("Enrollment data received:", data);
      return !!data.data; // Convert to boolean
    } else {
      console.error("Error checking enrollment:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Exception checking enrollment:", error);
    return false;
  }
};

/**
 * Force refresh the enrollment status in local storage
 * This can be called after completing a payment to ensure
 * the UI reflects the current enrollment status
 */
export const refreshEnrollmentStatus = async (userId, courseId) => {
  if (!userId || !courseId) return false;
  
  const isEnrolled = await checkUserEnrollment(userId, courseId);
  
  // Store the enrollment status for this course
  const enrollmentKey = `enrollment_${userId}_${courseId}`;
  localStorage.setItem(enrollmentKey, JSON.stringify({
    enrolled: isEnrolled,
    timestamp: Date.now()
  }));
  
  return isEnrolled;
};

/**
 * Get cached enrollment status (with auto-refresh if older than maxAge)
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {number} maxAge - Maximum age of cached status in milliseconds (default 5 minutes)
 */
export const getCachedEnrollmentStatus = async (userId, courseId, maxAge = 300000) => {
  if (!userId || !courseId) return false;
  
  const enrollmentKey = `enrollment_${userId}_${courseId}`;
  const cachedData = localStorage.getItem(enrollmentKey);
  
  if (cachedData) {
    const { enrolled, timestamp } = JSON.parse(cachedData);
    const age = Date.now() - timestamp;
    
    // If cache is fresh, use it
    if (age < maxAge) {
      console.log(`Using cached enrollment status for ${courseId}: ${enrolled}`);
      return enrolled;
    }
  }
  
  // Cache is stale or doesn't exist, refresh it
  return await refreshEnrollmentStatus(userId, courseId);
}; 