import type { Client, Retailer, Distribution } from '../types';

interface MatrixViewProps {
  clients: Client[];
  retailers: Retailer[];
  distributions: Distribution[];
  onCellClick: (client: Client, retailer: Retailer) => void;
  onRetailerClick: (retailer: Retailer) => void;
}

export function MatrixView({ clients, retailers, distributions, onCellClick, onRetailerClick }: MatrixViewProps) {
  const physicalRetailers = retailers.filter(r => r.category === 'Physical');
  const digitalRetailers = retailers.filter(r => r.category === 'Digital');

  const getDistribution = (clientId: string, retailerId: string) => {
    return distributions.find(d => d.clientId === clientId && d.retailerId === retailerId);
  };

  const getCellColor = (status: string | undefined) => {
    if (!status) return 'bg-white hover:bg-gray-50';
    switch (status) {
      case 'shelves':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'shelves-screens':
        return 'bg-green-500 hover:bg-green-600';
      case 'x-client':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-white hover:bg-gray-50';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Live':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Projected':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Recruiting':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-20 bg-gray-50 border-r-2 border-gray-300 px-4 py-3 text-left">
                <div className="text-sm font-semibold text-gray-700">Client Status</div>
              </th>
              <th colSpan={physicalRetailers.length} className="border-r-2 border-gray-300 px-4 py-3 text-center bg-emerald-50">
                <div className="text-sm font-semibold text-emerald-900">Physical</div>
              </th>
              <th colSpan={digitalRetailers.length} className="px-4 py-3 text-center bg-orange-50">
                <div className="text-sm font-semibold text-orange-900">Digital</div>
              </th>
            </tr>
            <tr className="bg-gray-100 border-t border-gray-200">
              <th className="sticky left-0 z-20 bg-gray-100 border-r-2 border-gray-300 px-4 py-2"></th>
              {physicalRetailers.map(retailer => (
                <th 
                  key={retailer.id} 
                  className="px-2 py-2 text-xs font-medium text-gray-700 border-l border-gray-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                  onClick={() => onRetailerClick(retailer)}
                >
                  <div className="whitespace-nowrap">{retailer.name}</div>
                </th>
              ))}
              <th className="border-l-2 border-gray-300"></th>
              {digitalRetailers.map(retailer => (
                <th 
                  key={retailer.id} 
                  className="px-2 py-2 text-xs font-medium text-gray-700 border-l border-gray-200 cursor-pointer hover:bg-orange-100 transition-colors"
                  onClick={() => onRetailerClick(retailer)}
                >
                  <div className="whitespace-nowrap">{retailer.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={client.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="sticky left-0 z-10 bg-inherit border-r-2 border-gray-300 px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadgeColor(client.status)}`}>
                        {client.status}
                      </span>
                      {client.statusDate && (
                        <span className="text-xs text-gray-500">{client.statusDate}</span>
                      )}
                    </div>
                  </div>
                </td>
                {physicalRetailers.map(retailer => {
                  const dist = getDistribution(client.id, retailer.id);
                  return (
                    <td
                      key={retailer.id}
                      className="border-l border-gray-200 p-0 cursor-pointer transition-all"
                      onClick={() => onCellClick(client, retailer)}
                    >
                      <div className={`h-16 flex items-center justify-center ${getCellColor(dist?.status)}`}>
                        {dist?.notes && (
                          <span className="text-xs text-white font-medium px-2 py-1 bg-black/20 rounded">
                            {dist.notes}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="border-l-2 border-gray-300 p-0"></td>
                {digitalRetailers.map(retailer => {
                  const dist = getDistribution(client.id, retailer.id);
                  return (
                    <td
                      key={retailer.id}
                      className="border-l border-gray-200 p-0 cursor-pointer transition-all"
                      onClick={() => onCellClick(client, retailer)}
                    >
                      <div className={`h-16 flex items-center justify-center ${getCellColor(dist?.status)}`}>
                        {dist?.notes && (
                          <span className="text-xs text-white font-medium px-2 py-1 bg-black/20 rounded">
                            {dist.notes}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}