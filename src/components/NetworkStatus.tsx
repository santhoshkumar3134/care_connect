import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from './ui';

export const NetworkStatus: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Keep banner for a moment to show restoration
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner && isOnline) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-300 ${showBanner ? 'translate-y-0' : '-translate-y-full'
                }`}
        >
            <div className={`p-2 flex items-center justify-center gap-2 text-sm font-medium ${isOnline ? 'bg-green-500 text-white' : 'bg-neutral-800 text-white'
                }`}>
                {isOnline ? (
                    <>
                        <RefreshCw className="h-4 w-4 animate-spin-once" />
                        <span>Connection restored</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="h-4 w-4" />
                        <span>You are currently offline. Changes will be saved locally.</span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 h-auto py-0.5 px-2 ml-2 text-xs"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
