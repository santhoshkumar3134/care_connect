import { useState, useCallback } from 'react';
import { logger, ErrorSeverity } from '../services/errorLogging';

export const useErrorHandler = () => {
    const [error, setError] = useState<Error | null>(null);

    const handleError = useCallback((err: unknown) => {
        // Normalize error
        const normalizedError = err instanceof Error ? err : new Error(String(err));

        console.error('Error caught by useErrorHandler:', normalizedError);
        setError(normalizedError);

        logger.log({
            message: 'Error caught by useErrorHandler',
            error: normalizedError,
            severity: ErrorSeverity.ERROR
        });
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        error,
        handleError,
        clearError,
        // Helper to throw error during render to be caught by ErrorBoundary
        throwError: (err: unknown) => {
            throw err instanceof Error ? err : new Error(String(err));
        }
    };
};
