
import React, { useState } from 'react';

interface ClientFormProps {
  onAdd: (name: string, phone: string) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onAdd }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onAdd(name, phone);
    setName('');
    setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1">USUÁRIO DO CLIENTE</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome ou usuário"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 ml-1">TELEFONE</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(00) 00000-0000"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        ADICIONAR CADASTRO
      </button>
    </form>
  );
};

export default ClientForm;
