'use client';

import { useState } from 'react';
import { EmergencyContact } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Phone, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
}

export default function EmergencyContacts({ contacts }: EmergencyContactsProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/sos/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, relationship }),
      });
      if (!res.ok) throw new Error('Failed');
      
      setName(''); setPhone(''); setEmail(''); setRelationship('');
      setIsAdding(false);
      router.refresh();
    } catch (error) {
      alert('Failed to add contact (Max 3 allowed)');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm('Remove contact?')) return;
    await fetch(`/api/sos/contacts/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Emergency Contacts</CardTitle>
        {contacts.length < 3 && !isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Contact
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 border rounded-md bg-gray-50 space-y-3">
            <div className="space-y-1">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <Label>Phone</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} required type="tel" />
                </div>
                <div className="space-y-1">
                    <Label>Relation</Label>
                    <Input value={relationship} onChange={e => setRelationship(e.target.value)} placeholder="e.g. Mom" />
                </div>
            </div>
            <div className="space-y-1">
                <Label>Email (Optional)</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
            </div>
            <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={loading}>Save</Button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="space-y-3">
          {contacts.length === 0 && !isAdding && <p className="text-gray-500 text-sm">No contacts added.</p>}
          
          {contacts.map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                        <User className="h-4 w-4 text-gray-400" />
                        {contact.name} 
                        {contact.relationship && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{contact.relationship}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {contact.phone}
                        </div>
                        {contact.email && (
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {contact.email}
                            </div>
                        )}
                    </div>
                </div>
                <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(contact.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
