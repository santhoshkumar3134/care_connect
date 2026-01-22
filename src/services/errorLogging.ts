// Simple Error Logging Service
// In a real app, this would send data to Sentry, LogRocket, or Datadog

export enum ErrorSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
}

interface ErrorLogParams {
    message: string;
    error?: Error | unknown;
    severity?: ErrorSeverity;
    context?: Record<string, any>;
}

class ErrorLoggingService {
    private static instance: ErrorLoggingService;
    private logs: any[] = [];

    private constructor() { }

    public static getInstance(): ErrorLoggingService {
        if (!ErrorLoggingService.instance) {
            ErrorLoggingService.instance = new ErrorLoggingService();
        }
        return ErrorLoggingService.instance;
    }

    public log({ message, error, severity = ErrorSeverity.ERROR, context }: ErrorLogParams): void {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            severity,
            error: error instanceof Error ? error.stack : error,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // 1. Log to Console (Dev Mode)
        const consoleMethod = severity === ErrorSeverity.CRITICAL ? 'error' : severity;
        console[consoleMethod as 'log' | 'warn' | 'error'](`[${severity.toUpperCase()}] ${message}`, logEntry);

        // 2. Store locally (for debug dump)
        this.logs.push(logEntry);
        if (this.logs.length > 100) this.logs.shift(); // Keep last 100

        // 3. Send to Backend (Mock)
        // In production: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
    }

    public getLogs() {
        return this.logs;
    }
}

export const logger = ErrorLoggingService.getInstance();
