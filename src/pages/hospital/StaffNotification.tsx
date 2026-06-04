import React, { useState } from 'react';
import { Bell, Send, Users, CheckCircle, Clock } from 'lucide-react';
import { RoleLayout } from '../../components/layout/RoleLayout';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STAFF_GROUPS = [
  { id: 'doctors', label: 'All Doctors', count: 12, icon: '👨‍⚕️' },
  { id: 'nurses', label: 'Nursing Team', count: 34, icon: '👩‍⚕️' },
  { id: 'icu', label: 'ICU Staff', count: 8, icon: '🏥' },
  { id: 'emergency', label: 'Emergency Dept', count: 15, icon: '🚨' },
  { id: 'admin', label: 'Administration', count: 6, icon: '📋' },
  { id: 'blood', label: 'Blood Bank', count: 3, icon: '🩸' },
];

const QUICK_MESSAGES = [
  'Code Blue – all hands on deck',
  'ICU bed prepared – incoming critical patient',
  'Blood Bank: reserve O+ units urgently',
  'Emergency team to reception in 5 minutes',
  'Trauma bay activation required',
];

interface NotifLog {
  id: string;
  groups: string[];
  message: string;
  time: string;
  read: boolean;
}

export default function StaffNotification() {
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<NotifLog[]>([
    { id: '1', groups: ['Doctors', 'ICU Staff'], message: 'Incoming cardiac patient – ETA 6 minutes', time: '8 min ago', read: true },
    { id: '2', groups: ['Nursing Team'], message: 'ICU Bay 3 needs immediate preparation', time: '23 min ago', read: true },
    { id: '3', groups: ['Blood Bank'], message: 'Reserve 2 units of B+ urgently', time: '1 hr ago', read: true },
  ]);

  const toggleGroup = (id: string) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    if (!message.trim() || selectedGroups.length === 0) {
      toast.error('Select at least one group and enter a message');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    const groupLabels = STAFF_GROUPS.filter(g => selectedGroups.includes(g.id)).map(g => g.label);
    setLogs(prev => [{
      id: Date.now().toString(),
      groups: groupLabels,
      message,
      time: 'Just now',
      read: false,
    }, ...prev]);
    toast.success(`📣 Notification sent to ${groupLabels.join(', ')}`);
    setMessage('');
    setSelectedGroups([]);
    setSending(false);
  };

  return (
    <RoleLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Staff Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">Alert hospital staff for incoming emergencies</p>
        </div>

        {/* Compose */}
        <Card>
          <CardHeader title="Send Alert" icon={<Bell size={16} />} />

          {/* Staff groups */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 mb-2 block">Select Staff Groups</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STAFF_GROUPS.map(group => (
                <button
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                    selectedGroups.includes(group.id)
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="text-lg">{group.icon}</span>
                  <div>
                    <div className="text-xs font-medium">{group.label}</div>
                    <div className="text-xs opacity-60">{group.count} staff</div>
                  </div>
                  {selectedGroups.includes(group.id) && <CheckCircle size={14} className="ml-auto text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick messages */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 mb-2 block">Quick Templates</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_MESSAGES.map(msg => (
                <button
                  key={msg}
                  onClick={() => setMessage(msg)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    message === msg
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 mb-2 block">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your emergency alert message..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {selectedGroups.length > 0
                ? `${STAFF_GROUPS.filter(g => selectedGroups.includes(g.id)).reduce((sum, g) => sum + g.count, 0)} staff will be notified`
                : 'No groups selected'}
            </div>
            <Button variant="primary" loading={sending} onClick={handleSend}>
              {!sending && <Send size={14} />}
              Send Alert
            </Button>
          </div>
        </Card>

        {/* Notification log */}
        <Card>
          <CardHeader title="Notification Log" subtitle="Recent alerts sent" />
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className={`p-3 rounded-xl border ${log.read ? 'bg-slate-50 border-slate-100' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex flex-wrap gap-1">
                    {log.groups.map(g => (
                      <Badge key={g} variant="green" size="sm">{g}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                    <Clock size={10} /> {log.time}
                  </div>
                </div>
                <p className="text-sm text-slate-700">{log.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RoleLayout>
  );
}
