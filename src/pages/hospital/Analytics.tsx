import React from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatusDot';
import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { ANALYTICS_DATA } from '../../data/mockData';

export default function HospitalAnalytics() {
  return (
    <RoleLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Emergency response performance metrics</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Emergencies (Jun)" value={191} icon={<AlertTriangle size={18} />} color="red" trend={{ value: '7%', up: true }} />
          <StatCard label="Avg Response Time" value="8.2 min" icon={<Clock size={18} />} color="orange" trend={{ value: '12%', up: false }} />
          <StatCard label="Bed Occupancy" value="82%" icon={<Activity size={18} />} color="blue" trend={{ value: '3%', up: true }} />
          <StatCard label="Patient Satisfaction" value="4.7/5" icon={<TrendingUp size={18} />} color="green" trend={{ value: '0.2', up: true }} />
        </div>

        {/* Emergency Trends */}
        <Card>
          <CardHeader title="Emergency Trends" subtitle="Last 6 months by type" />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ANALYTICS_DATA.emergencyTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} dot={false} name="Total" />
              <Line type="monotone" dataKey="cardiac" stroke="#ef4444" strokeWidth={2} dot={false} name="Cardiac" />
              <Line type="monotone" dataKey="trauma" stroke="#f59e0b" strokeWidth={2} dot={false} name="Trauma" />
              <Line type="monotone" dataKey="stroke" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Stroke" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Response time histogram */}
          <Card>
            <CardHeader title="Response Time Distribution" subtitle="Number of cases per window" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ANALYTICS_DATA.responseTime} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} name="Cases" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Bed occupancy over time */}
          <Card>
            <CardHeader title="Bed Occupancy" subtitle="This week (% occupied)" />
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ANALYTICS_DATA.bedOccupancy} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="generalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="icuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[50, 100]} unit="%" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="general" stroke="#059669" fill="url(#generalGrad)" strokeWidth={2} name="General" />
                <Area type="monotone" dataKey="icu" stroke="#8b5cf6" fill="url(#icuGrad)" strokeWidth={2} name="ICU" />
                <Area type="monotone" dataKey="ventilators" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 2" name="Ventilators" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Monthly summary table */}
        <Card>
          <CardHeader title="Monthly Summary" subtitle="Emergency breakdown by type" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Month', 'Total', 'Cardiac', 'Trauma', 'Stroke', 'Other'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ANALYTICS_DATA.emergencyTrends.map(row => (
                  <tr key={row.month} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-slate-800">{row.month}</td>
                    <td className="py-2.5 pr-4 font-bold text-emerald-700">{row.total}</td>
                    <td className="py-2.5 pr-4 text-red-600">{row.cardiac}</td>
                    <td className="py-2.5 pr-4 text-orange-600">{row.trauma}</td>
                    <td className="py-2.5 pr-4 text-purple-600">{row.stroke}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{row.other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
