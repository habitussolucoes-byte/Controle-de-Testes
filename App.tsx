
import React, { useState, useEffect, useMemo } from 'react';
import { Client, FilterType, AppSettings } from './types';
import Header from './components/Header';
import ClientForm from './components/ClientForm';
import ClientCard from './components/ClientCard';
import AdminPanel from './components/AdminPanel';

const DEFAULT_SETTINGS: AppSettings = {
  whatsappMessage: "Olá {nome}, tudo bem? Sou da equipe de atendimento e estou entrando em contato."
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('gestor_clientes_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('gestor_clientes_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<FilterType>('pending');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Filtros extras para a aba de chamados
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Persistence
  useEffect(() => {
    localStorage.setItem('gestor_clientes_data', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('gestor_clientes_settings', JSON.stringify(settings));
  }, [settings]);

  // Cálculo de anos disponíveis com base nos dados
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    clients.forEach(c => {
      const year = new Date(c.createdAt).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [clients]);

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

  const importClients = (newClients: Client[]) => {
    setClients(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const uniqueNewClients = newClients.filter(c => !existingIds.has(c.id));
      return [...prev, ...uniqueNewClients];
    });
  };

  const markAsCalled = (id: string) => {
    setClients(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'called', calledAt: Date.now() } : c
    ));
  };

  const removeClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const filteredClients = useMemo(() => {
    let result = clients.filter(c => c.status === activeTab);

    // Aplicar filtros de tempo na aba de chamados
    if (activeTab === 'called') {
      if (monthFilter !== 'all') {
        result = result.filter(c => {
          const date = new Date(c.createdAt);
          return date.getMonth().toString() === monthFilter;
        });
      }
      if (yearFilter !== 'all') {
        result = result.filter(c => {
          const date = new Date(c.createdAt);
          return date.getFullYear().toString() === yearFilter;
        });
      }
    }

    // Aplicar ordenação
    result.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.createdAt - a.createdAt;
      } else {
        return a.createdAt - b.createdAt;
      }
    });

    return result;
  }, [clients, activeTab, monthFilter, yearFilter, sortOrder]);

  const pendingCount = clients.filter(c => c.status === 'pending').length;
  const calledCount = clients.filter(c => c.status === 'called').length;

  const resetFilters = () => {
    setMonthFilter('all');
    setYearFilter('all');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col pb-20">
      <Header onOpenAdmin={() => setIsAdminOpen(true)} />
      
      {isAdminOpen && (
        <AdminPanel 
          settings={settings} 
          clients={clients}
          onSave={setSettings} 
          onImport={importClients}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      <main className="flex-1 p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`p-3 rounded-2xl transition-all duration-300 flex flex-col items-center ${
              activeTab === 'pending' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <span className="text-2xl font-bold">{pendingCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider">Aguardando</span>
          </button>
          <button 
            onClick={() => setActiveTab('called')}
            className={`p-3 rounded-2xl transition-all duration-300 flex flex-col items-center ${
              activeTab === 'called' 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            <span className="text-2xl font-bold">{calledCount}</span>
            <span className="text-xs font-medium uppercase tracking-wider">Chamados</span>
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Novo Cadastro</h2>
            <ClientForm onAdd={addClient} />
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-slate-700 text-lg">
                {activeTab === 'pending' ? 'Fila de Espera' : 'Histórico de Chamados'}
              </h2>
              <span className="text-xs text-slate-400">{filteredClients.length} registros</span>
            </div>

            {/* Ferramentas de Filtro e Ordenação (Apenas aba Chamados) */}
            {activeTab === 'called' && clients.some(c => c.status === 'called') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex gap-2">
                  <select 
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="flex-[2] bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="all">TODOS OS MESES</option>
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index.toString()}>{month.toUpperCase()}</option>
                    ))}
                  </select>

                  <select 
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="all">ANO</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="w-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl px-3 py-2.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all uppercase tracking-wider"
                >
                  <svg className={`w-3.5 h-3.5 text-emerald-500 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  {sortOrder === 'desc' ? 'Ordenar: Mais Novos' : 'Ordenar: Mais Antigos'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-50 border-dashed">
                <p className="text-slate-400 text-sm">
                  {monthFilter !== 'all' || yearFilter !== 'all' ? 'Nenhum registro encontrado para estes filtros.' : 'Nenhum registro por aqui.'}
                </p>
                {(monthFilter !== 'all' || yearFilter !== 'all') && (
                  <button 
                    onClick={resetFilters}
                    className="mt-4 text-emerald-600 text-xs font-bold uppercase underline tracking-widest"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              filteredClients.map(client => (
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

      <footer className="py-6 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold opacity-50">
        &copy; 2025 Controle de Testes
      </footer>
    </div>
  );
};

export default App;
