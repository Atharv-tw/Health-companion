'use client';

import { useState } from 'react';
import { EmergencyContact } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, X, ShieldAlert } from 'lucide-react';

interface SOSButtonProps {
  initialContacts: EmergencyContact[];
}

export default function SOSButton({ initialContacts }: SOSButtonProps) {
  const [status, setStatus] = useState<'IDLE' | 'CONFIRM' | 'ACTIVE'>('IDLE');
  
  const handleTrigger = async () => {
    // Optionally call API to log the event
    try {
        await fetch('/api/sos/trigger', { method: 'POST' });
    } catch (e) { console.error(e); }
    
    setStatus('ACTIVE');
  };

  if (status === 'IDLE') {
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setStatus('CONFIRM')}
          className="w-full aspect-square max-w-[200px] rounded-full bg-red-100 border-4 border-red-500 flex flex-col items-center justify-center gap-1 hover:bg-red-200 transition-all shadow-xl hover:scale-105 active:scale-95 group mx-auto"
        >
          <ShieldAlert className="h-16 w-16 text-red-600 group-hover:text-red-700 transition-colors" />
          <span className="text-2xl font-bold text-red-700">SOS</span>
        </button>
        <span className="text-sm text-red-600 font-medium uppercase tracking-wider">Tap for Help</span>
      </div>
    );
  }

  if (status === 'CONFIRM') {
    return (
      <div className="flex flex-col items-center gap-6 p-6 bg-red-50 border border-red-200 rounded-xl animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-2">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto" />
            <h2 className="text-2xl font-bold text-red-900">Emergency?</h2>
            <p className="text-red-700">Are you sure you want to trigger SOS mode?</p>
        </div>
        
        <div className="flex flex-col w-full gap-3">
            <Button 
                variant="destructive" 
                size="lg" 
                className="w-full text-lg h-14 bg-red-600 hover:bg-red-700"
                onClick={handleTrigger}
            >
                YES, I NEED HELP
            </Button>
            <Button 
                variant="outline" 
                size="lg"
                className="w-full h-12"
                onClick={() => setStatus('IDLE')}
            >
                Cancel
            </Button>
        </div>
      </div>
    );
  }

  // ACTIVE MODE
  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-red-50 border-2 border-red-500 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-red-600 uppercase tracking-widest">Emergency Mode</h2>
            <p className="text-red-900 font-medium">Contacting your safety network...</p>
        </div>

        <div className="w-full space-y-3">
            {initialContacts.map(contact => (
                <a
                    key={contact.id}
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-3 p-3 bg-white border-2 border-red-100 rounded-lg hover:bg-red-50 transition-colors shadow-sm group"
                >
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-200 flex-shrink-0">
                        <Phone className="h-5 w-5" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                        <p className="text-sm text-gray-500 truncate">{contact.relationship} • {contact.phone}</p>
                    </div>
                </a>
            ))}
            
            <a
                href="tel:112"
                className="flex items-center gap-3 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
            >
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="text-left min-w-0 flex-1">
                    <p className="font-bold truncate">Emergency Services</p>
                    <p className="text-sm text-white/80 truncate">Local Ambulance/Police • 112</p>
                </div>
            </a>
        </div>

        <Button variant="ghost" className="text-gray-500 hover:text-gray-900" onClick={() => setStatus('IDLE')}>
            <X className="h-4 w-4 mr-2" /> Deactivate Emergency Mode
        </Button>
    </div>
  );
}
