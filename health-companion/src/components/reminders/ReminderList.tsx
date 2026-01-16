'use client';

import { useEffect, useState } from 'react';
import { Reminder } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Trash2, Plus, Clock, Pill, GlassWater, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReminderListProps {
  initialReminders: Reminder[];
}

export default function ReminderList({ initialReminders }: ReminderListProps) {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sync local state with props when they change
  useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [type, setType] = useState<'MEDICINE' | 'WATER' | 'SLEEP' | 'CUSTOM'>('MEDICINE');

  const fetchReminders = async () => {
    try {
      const res = await fetch('/api/reminders');
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (e) {
      console.error("Refresh failed", e);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !currentStatus } : r));
    
    try {
      const res = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch (error) {
      console.error('Toggle failed', error);
      // Revert on failure
      fetchReminders();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    
    // Optimistic update
    setReminders(prev => prev.filter(r => r.id !== id));

    try {
      const res = await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch (error) {
      console.error('Delete failed', error);
      fetchReminders();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          schedule: {
            frequency: 'daily',
            times: [time],
            days: [], 
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error details:', errorData);
        throw new Error('Failed to create');
      }

      setTitle('');
      setIsAdding(false);
      
      // Refresh local data immediately
      await fetchReminders();
      router.refresh();
    } catch (err) {
      console.error('Reminder creation error:', err);
      alert('Failed to create reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'MEDICINE': return <Pill className="h-5 w-5 text-pink-500" />;
      case 'WATER': return <GlassWater className="h-5 w-5 text-blue-500" />;
      case 'SLEEP': return <Moon className="h-5 w-5 text-indigo-500" />;
      default: return <Bell className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Section */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full h-12 border-dashed border-2" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add New Reminder
        </Button>
      ) : (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">New Reminder</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                  >
                    <option value="MEDICINE">Medicine</option>
                    <option value="WATER">Water</option>
                    <option value="SLEEP">Sleep</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="e.g., Take Vitamin D" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Reminder'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="grid gap-4">
        {reminders.length === 0 && !isAdding && (
             <div className="text-center py-10 text-gray-500">
                <p>No reminders set. Add one to stay on track!</p>
              </div>
        )}
        
        {reminders.map((reminder) => (
          <Card key={reminder.id} className={`flex flex-row items-center p-4 transition-opacity ${!reminder.enabled ? 'opacity-60' : ''}`}>
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-4 shrink-0">
              {getIcon(reminder.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{reminder.title}</h4>
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <Clock className="h-3 w-3" />
                <span>
                  {(reminder.schedule as any)?.times?.[0]} 
                  {((reminder.schedule as any)?.frequency === 'daily') ? ' • Daily' : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
               {/* Simple Toggle Button */}
               <Button 
                size="sm" 
                variant={reminder.enabled ? "default" : "outline"}
                className={reminder.enabled ? "bg-green-600 hover:bg-green-700" : ""}
                onClick={() => handleToggle(reminder.id, reminder.enabled)}
               >
                 {reminder.enabled ? 'ON' : 'OFF'}
               </Button>
               
               <Button size="icon" variant="ghost" className="text-gray-400 hover:text-red-500" onClick={() => handleDelete(reminder.id)}>
                 <Trash2 className="h-4 w-4" />
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
