
import React, { useState, useEffect, useMemo } from 'react';
import { Client, AppSettings, ClientStatus } from './types';
import Header from './components/Header';
import ClientForm from './components/ClientForm';
import ClientCard from './components/ClientCard';
import AdminPanel from './components/AdminPanel';

const DEFAULT_SETTINGS: AppSettings = {
  whatsappMessage: "Olá {nome}, tudo bem? Sou da equipe de atendimento e estou entrando em contato."
};

const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('gestor_vip_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('gestor_vip_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<ClientStatus>('pending');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Atualiza o tempo atual a cada minuto para o alerta de 2 horas
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Persistência
  useEffect(() => {
    localStorage.setItem('gestor_vip_data', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('gestor_vip_settings', JSON.stringify(settings));
  }, [settings]);

  const addClient = (name: string, phone: string) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name,
      phone,
      createdAt: Date.now(),
      status: 'pending'
    };
    setClients(prev => [newClient, ...prev]);
  };

  const markAsCalled = (id: string) => {
    setClients(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'called', calledAt: Date.now() } : c
    ));
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const displayClients = useMemo(() => {
    return clients
      .filter(c => c.status === activeTab)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [clients, activeTab]);

  const counts = {
    pending: clients.filter(c => c.status === 'pending').length,
    called: clients.filter(c => c.status === 'called').length
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50 pb-10">
      <Header onOpenAdmin={() => setIsAdminOpen(true)} />
      
      <main className="flex-1 -mt-6 px-4 space-y-6">
        {/* Navegação por Abas */}
        {/* Fix: changed 'class' to 'className' */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-3xl transition-all duration-300 flex flex-col items-center ${
              activeTab === 'pending' 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <span className="text-2xl font-black">{counts.pending}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Aguardando</span>
          </button>
          <button 
            onClick={() => setActiveTab('called')}
            className={`p-4 rounded-3xl transition-all duration-300 flex flex-col items-center ${
              activeTab === 'called' 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' 
                : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            <span className="text-2xl font-black">{counts.called}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Chamados</span>
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="animate-in">
            <ClientForm onAdd={addClient} />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {activeTab === 'pending' ? 'Fila de Espera' : 'Histórico'}
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
              {displayClients.length} registros
            </span>
          </div>

          <div className="space-y-3">
            {displayClients.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-[32px] border border-dashed border-slate-200">
                Nenhum registro por aqui.
              </div>
            ) : (
              displayClients.map(client => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  currentTime={currentTime}
                  settings={settings}
                  onCall={() => markAsCalled(client.id)}
                  onDelete={() => removeClient(client.id)}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {isAdminOpen && (
        <AdminPanel 
          settings={settings}
          clients={clients}
          onSave={setSettings}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      <footer className="py-6 text-center text-slate-300 text-[10px] uppercase font-bold tracking-widest">
        &copy; 2025 Gestor VIP • v2.0
      </footer>
    </div>
  );
};

export default App;
