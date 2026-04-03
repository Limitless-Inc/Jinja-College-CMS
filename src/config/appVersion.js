/**
 * Application version
 * This should match the version in package.json
 * Update this whenever you bump the app version for a new release
 */
export const CURRENT_APP_VERSION = '1.0.0';

/**
 * Fetch version from package.json at runtime
 * Useful for dynamic version detection
 */
export const fetchAppVersion = async () => {
  try {
    const response = await fetch('/package.json');
    const packageJson = await response.json();
    return packageJson.version;
  } catch (error) {
    console.warn('Failed to fetch version from package.json:', error);
    return CURRENT_APP_VERSION;
  }
};
