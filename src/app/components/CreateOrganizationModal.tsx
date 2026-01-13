import { X, Building2 } from 'lucide-react';
import { useState } from 'react';

interface CreateOrganizationModalProps {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateOrganizationModal({
  onClose,
  onCreate,
}: CreateOrganizationModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onCreate(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Create Organization</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34A16E] focus:border-transparent"
                placeholder="My Company"
                required
                autoFocus
              />
              <p className="mt-1 text-sm text-gray-500">
                You'll be the admin of this organization and can invite team members.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white py-2 px-4 rounded-lg hover:from-[#2d8a5e] hover:to-[#246b4a] transition-colors font-medium disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Organization'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
