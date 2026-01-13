import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  onRetry: () => void;
}

export function OfflineBanner({ onRetry }: OfflineBannerProps) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <WifiOff className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                Offline Mode Active
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                All features work normally. Changes are saved locally and will be lost on refresh.
              </p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Connect to Server
          </button>
        </div>
      </div>
    </div>
  );
}
