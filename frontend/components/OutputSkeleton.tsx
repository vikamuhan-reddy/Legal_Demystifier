import React from 'react';
import { SummaryIcon, KeyIcon, WarningIcon, ChatIcon } from './icons.tsx';

const OutputSkeleton: React.FC = () => {
    return (
        <div className="max-w-4xl w-full mx-auto animate-fade-in">
          <div className="bg-secondary/50 p-6 rounded-lg border border-border min-h-[500px] flex flex-col">
            {/* Tabs Skeleton */}
            <div className="flex border-b border-border animate-pulse">
                <div className="flex-1 flex items-center justify-center gap-2 p-3">
                    <SummaryIcon className="w-5 h-5 text-muted" />
                    <div className="hidden sm:block h-4 bg-muted rounded-full w-24"></div>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 p-3">
                    <KeyIcon className="w-5 h-5 text-muted" />
                    <div className="hidden sm:block h-4 bg-muted rounded-full w-20"></div>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 p-3">
                    <WarningIcon className="w-5 h-5 text-muted" />
                    <div className="hidden sm:block h-4 bg-muted rounded-full w-28"></div>
                </div>
                 <div className="flex-1 flex items-center justify-center gap-2 p-3">
                    <ChatIcon className="w-5 h-5 text-muted" />
                    <div className="hidden sm:block h-4 bg-muted rounded-full w-24"></div>
                </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="py-6 flex-grow animate-pulse">
                <div className="h-6 bg-muted rounded-full w-3/4 mb-6"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-muted rounded-full w-full"></div>
                    <div className="h-4 bg-muted rounded-full w-5/6"></div>
                    <div className="h-4 bg-muted rounded-full w-full"></div>
                    <div className="h-4 bg-muted rounded-full w-3/4"></div>
                    <div className="h-4 bg-muted rounded-full w-4/6"></div>
                </div>
            </div>

            {/* Action Bar Skeleton */}
            <div className="mt-4 pt-4 border-t border-border flex justify-between items-center animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                </div>
            </div>
          </div>
        </div>
    );
};

export default OutputSkeleton;