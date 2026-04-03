/**
 * Parse assigned classes from string format to array
 * Handles formats like "Form 1" or "Form 1, Form 2, Form 3"
 * @param {string} assignedClasses - Comma or dash separated class names
 * @returns {array} Array of class names
 */
export const parseAssignedClasses = (assignedClasses) => {
  if (!assignedClasses) return [];
  if (Array.isArray(assignedClasses)) return assignedClasses;
  
  // Split by comma or dash and trim whitespace
  return assignedClasses
    .split(/[,\-]/)
    .map(c => c.trim())
    .filter(c => c.length > 0);
};

/**
 * Check if a class name matches assigned classes
 * @param {string} className - The class to check
 * @param {string} assignedClasses - Comma or dash separated assigned classes
 * @returns {boolean} True if className is in assignedClasses
 */
export const classMatches = (className, assignedClasses) => {
  if (!className || !assignedClasses) return false;
  
  const assigned = parseAssignedClasses(assignedClasses);
  return assigned.some(
    assignedClass =>
      assignedClass.toLowerCase() === className.toLowerCase().trim()
  );
};
