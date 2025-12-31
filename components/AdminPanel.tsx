
import React, { useState } from 'react';
import { AppSettings, Client } from '../types';

interface AdminPanelProps {
  settings: AppSettings;
  clients: Client[];
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, clients, onSave, onClose }) => {
  const [message, setMessage] = useState(settings.whatsappMessage);

  const handleExportCSV = () => {
    const headers = ['ID', 'Nome', 'Telefone', 'Criado Em', 'Status'];
    const rows = clients.map(c => [
      c.id,
      `"${c.name}"`,
      c.phone,
      new Date(c.createdAt).toLocaleString(),
      c.status
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-800">Configurações</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Texto de Abordagem</label>
            <textarea 
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 h-32 outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
            />
            <p className="text-[9px] text-slate-400 italic">Dica: Use <b>{'{nome}'}</b> para o nome do cliente.</p>
          </div>

          {/* Fix: changed 'class' to 'className' */}
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => { onSave({ whatsappMessage: message }); onClose(); }}
              className="w-full bg-indigo-600 text-white font-black p-4 rounded-2xl shadow-lg uppercase text-xs tracking-widest"
            >
              Salvar Ajustes
            </button>
            <button 
              onClick={handleExportCSV}
              className="w-full bg-white border-2 border-slate-100 text-slate-600 font-black p-4 rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-50 transition-colors"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
