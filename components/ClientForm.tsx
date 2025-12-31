
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
    <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
      <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Novo Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do Usuário" 
          className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all" 
          required 
        />
        <input 
          type="tel" 
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Telefone (DDD + Número)" 
          className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-sm transition-all" 
          required 
        />
        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white font-black p-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase text-xs tracking-[2px]"
        >
          Adicionar na Fila
        </button>
      </form>
    </section>
  );
};

export default ClientForm;
