import { Network } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Network className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Loading Triive...</p>
        <p className="mt-1 text-sm text-gray-500">Syncing your distribution data</p>
      </div>
    </div>
  );
}
