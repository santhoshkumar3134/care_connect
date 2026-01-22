import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui';
import { logger, ErrorSeverity } from '../services/errorLogging';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    constructor(props: Props) {
        super(props);
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Uncaught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        logger.log({
            message: 'Uncaught error in component tree',
            error,
            severity: ErrorSeverity.CRITICAL,
            context: { componentStack: errorInfo.componentStack }
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-neutral-200">
                        <div className="bg-red-50 p-6 flex justify-center">
                            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center animate-bounce-slow">
                                <AlertTriangle className="h-10 w-10 text-red-600" />
                            </div>
                        </div>

                        <div className="p-6 text-center space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
                            <p className="text-gray-500 text-sm">
                                We're sorry, but an unexpected error occurred. Our team has been notified.
                            </p>

                            {this.state.error && (
                                <div className="bg-red-50 p-3 rounded-lg text-left overflow-auto max-h-32">
                                    <p className="text-xs font-mono text-red-700 break-all">
                                        {this.state.error.toString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1 bg-primary hover:bg-primary/90"
                                    icon={RefreshCw}
                                >
                                    Reload Page
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={this.handleGoHome}
                                    className="flex-1"
                                    icon={Home}
                                >
                                    Go Home
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
