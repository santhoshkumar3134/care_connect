/**
 * Retries a promise-returning function with exponential backoff.
 * 
 * @param fn The function to retry
 * @param maxRetries Maximum number of retries (default: 3)
 * @param baseDelay Base delay in ms (default: 1000)
 * @returns The result of the function
 */
export const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> => {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${i + 1} failed. Retrying in ${baseDelay * (i + 1)}ms...`, error);

            // Don't wait on the last attempt
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, baseDelay * (i + 1)));
            }
        }
    }

    throw lastError || new Error('Operation failed after max retries');
};
