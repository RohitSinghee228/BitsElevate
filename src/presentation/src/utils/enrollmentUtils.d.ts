/**
 * Checks if a user is enrolled in a specific course
 * @param userId - The ID of the user
 * @param courseId - The ID of the course
 * @returns Whether the user is enrolled
 */
export declare function checkUserEnrollment(userId: string, courseId: string): Promise<boolean>;

/**
 * Force refresh the enrollment status in local storage
 * This can be called after completing a payment to ensure
 * the UI reflects the current enrollment status
 * @param userId - User ID
 * @param courseId - Course ID
 * @returns Current enrollment status
 */
export declare function refreshEnrollmentStatus(userId: string, courseId: string): Promise<boolean>;

/**
 * Get cached enrollment status (with auto-refresh if older than maxAge)
 * @param userId - User ID
 * @param courseId - Course ID
 * @param maxAge - Maximum age of cached status in milliseconds (default 5 minutes)
 * @returns Enrollment status
 */
export declare function getCachedEnrollmentStatus(
  userId: string, 
  courseId: string, 
  maxAge?: number
): Promise<boolean>; 