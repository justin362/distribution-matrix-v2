import { X, BarChart3, Users, Store, TrendingUp, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { Client, Retailer, Distribution, AnalyticsData, DailySnapshot } from '../types';

interface DashboardProps {
  onClose: () => void;
  clients: Client[];
  retailers: Retailer[];
  distributions: Distribution[];
  analyticsData?: AnalyticsData | null;
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Live: '#3b82f6',
  Projected: '#f97316',
  Recruiting: '#a855f7',
};

export function Dashboard({
  onClose,
  clients,
  retailers,
  distributions,
  analyticsData,
}: DashboardProps) {
  // Calculate current metrics from props (fallback if no analytics data)
  const totalClients = clients.length;
  const totalRetailers = retailers.length;
  const activeDistributions = distributions.filter(d => d.status && d.status !== '').length;
  const possibleDistributions = totalClients * totalRetailers;
  const distributionCoverage = possibleDistributions > 0
    ? Math.round((activeDistributions / possibleDistributions) * 100)
    : 0;

  // Client status breakdown
  const clientsByStatus = clients.reduce((acc, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(clientsByStatus).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name] || '#94a3b8',
  }));

  // Use analytics history if available, otherwise generate placeholder
  const historyData = analyticsData?.history && analyticsData.history.length > 0
    ? [...analyticsData.history].reverse().slice(-14)
    : generatePlaceholderHistory();

  function generatePlaceholderHistory(): DailySnapshot[] {
    const result: DailySnapshot[] = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      result.push({
        date: date.toISOString().split('T')[0],
        totalClients: totalClients,
        totalRetailers: totalRetailers,
        totalDistributions: activeDistributions,
        clientsByStatus,
        distributionCoverage,
      });
    }

    return result;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-4xl bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] text-white p-6 shadow-lg z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Analytics Dashboard</h2>
                <p className="text-emerald-100 text-sm mt-0.5">Track your distribution metrics and growth</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-emerald-500 p-1.5 rounded">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-emerald-900">Total Clients</span>
              </div>
              <div className="text-3xl font-bold text-emerald-700">{totalClients}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 p-1.5 rounded">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-900">Total Retailers</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">{totalRetailers}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-[#F19C6B] p-1.5 rounded">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-orange-900">Distributions</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">{activeDistributions}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-500 p-1.5 rounded">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-purple-900">Coverage</span>
              </div>
              <div className="text-3xl font-bold text-purple-700">{distributionCoverage}%</div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#34A16E]" />
              Distribution Growth Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString();
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalDistributions"
                    stroke="#34A16E"
                    strokeWidth={2}
                    dot={{ fill: '#34A16E', strokeWidth: 2 }}
                    name="Distributions"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalClients"
                    stroke="#F19C6B"
                    strokeWidth={2}
                    dot={{ fill: '#F19C6B', strokeWidth: 2 }}
                    name="Clients"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Client Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#34A16E]" />
                Client Pipeline
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#34A16E]" />
                Distribution Coverage
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Coverage</span>
                    <span className="text-sm font-bold text-[#34A16E]">{distributionCoverage}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#34A16E] to-[#2d8a5e] rounded-full transition-all duration-500"
                      style={{ width: `${distributionCoverage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status Breakdown</h4>
                  <div className="space-y-2">
                    {Object.entries(clientsByStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[status] || '#94a3b8' }}
                          />
                          <span className="text-sm text-gray-600">{status}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{possibleDistributions}</div>
                      <div className="text-xs text-gray-500">Possible Pairs</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-[#34A16E]">{activeDistributions}</div>
                      <div className="text-xs text-emerald-700">Active Distributions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
