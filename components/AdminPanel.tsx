
import React, { useState, useRef } from 'react';
import { AppSettings, Client } from '../types';

interface AdminPanelProps {
  settings: AppSettings;
  clients: Client[];
  onSave: (newSettings: AppSettings) => void;
  onImport: (newClients: Client[]) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, clients, onSave, onImport, onClose }) => {
  const [message, setMessage] = useState(settings.whatsappMessage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ whatsappMessage: message });
    onClose();
  };

  const exportToCSV = () => {
    const headers = ['id', 'name', 'phone', 'createdAt', 'status', 'calledAt'];
    const csvContent = [
      headers.join(','),
      ...clients.map(c => [
        c.id,
        `"${c.name.replace(/"/g, '""')}"`,
        c.phone,
        c.createdAt,
        c.status,
        c.calledAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clientes_controle_testes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const importedClients: Client[] = [];

      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Basic CSV parsing (handles simple commas)
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length >= 4) {
          importedClients.push({
            id: parts[0] || crypto.randomUUID(),
            name: parts[1]?.replace(/^"|"$/g, '') || 'Importado',
            phone: parts[2] || '',
            createdAt: parseInt(parts[3]) || Date.now(),
            status: (parts[4] as 'pending' | 'called') || 'pending',
            calledAt: parts[5] ? parseInt(parts[5]) : undefined
          });
        }
      }

      if (importedClients.length > 0) {
        onImport(importedClients);
        alert(`${importedClients.length} clientes importados com sucesso!`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800">Painel Admin</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-8">
          {/* Seção de Configurações */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Configurações</h3>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mensagem do WhatsApp</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium h-24 resize-none"
                placeholder="Ex: Olá {nome}..."
              />
              <p className="text-[10px] text-slate-400 italic">Dica: Use <b>{"{nome}"}</b> para o nome automático.</p>
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
            >
              SALVAR MENSAGEM
            </button>
          </section>

          {/* Seção de Dados */}
          <section className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Gestão de Dados</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exportToCSV}
                className="bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-slate-600 font-bold py-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 group"
              >
                <svg className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-[10px]">EXPORTAR CSV</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border-2 border-slate-100 hover:border-emerald-100 hover:bg-emerald-50 text-slate-600 font-bold py-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 group"
              >
                <svg className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-[10px]">IMPORTAR CSV</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
              className="hidden"
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
