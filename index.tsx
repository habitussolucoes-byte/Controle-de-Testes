
// Fix: Added types for better development and to satisfy TS compiler in .tsx environment
interface Client {
    id: string;
    name: string;
    phone: string;
    createdAt: number;
    status: 'pending' | 'called';
    calledAt?: number;
}

interface AppState {
    clients: Client[];
    settings: {
        whatsappMessage: string;
    };
    activeTab: 'pending' | 'called';
    isAdminOpen: boolean;
    filters: {
        month: string;
        year: string;
        sort: 'asc' | 'desc';
    };
}

// Estado Global
let state: AppState = {
    clients: JSON.parse(localStorage.getItem('gestor_data') || '[]'),
    settings: JSON.parse(localStorage.getItem('gestor_settings') || '{"whatsappMessage": "Olá {nome}, tudo bem?"}'),
    activeTab: 'pending',
    isAdminOpen: false,
    filters: {
        month: 'all',
        year: 'all',
        sort: 'desc'
    }
};

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Persistência
const save = () => {
    localStorage.setItem('gestor_data', JSON.stringify(state.clients));
    localStorage.setItem('gestor_settings', JSON.stringify(state.settings));
};

// Lógica de Negócio
// Fix: Added explicit type for Set and casting to satisfy arithmetic operation in sort
const getYears = () => {
    const years = new Set<number>();
    state.clients.forEach(c => years.add(new Date(c.createdAt).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
};

// Funções de Ação (Expostas globalmente para o HTML)
// Fix: Used (window as any) to assign global functions and satisfy Window type checks
(window as any).changeTab = (tab: 'pending' | 'called') => {
    state.activeTab = tab;
    render();
};

(window as any).toggleAdmin = () => {
    state.isAdminOpen = !state.isAdminOpen;
    render();
};

(window as any).addClient = (e: Event) => {
    e.preventDefault();
    // Fix: Cast elements to HTMLInputElement to access .value property
    const name = (document.getElementById('name') as HTMLInputElement).value;
    const phone = (document.getElementById('phone') as HTMLInputElement).value;
    
    state.clients.unshift({
        id: Date.now().toString(),
        name,
        phone,
        createdAt: Date.now(),
        status: 'pending'
    });
    
    save();
    render();
};

(window as any).markAsCalled = (id: string) => {
    state.clients = state.clients.map(c => 
        c.id === id ? { ...c, status: 'called', calledAt: Date.now() } : c
    );
    save();
    render();
};

(window as any).removeClient = (id: string) => {
    if(confirm('Deseja marcar como ASSINOU e remover este cliente?')) {
        state.clients = state.clients.filter(c => c.id !== id);
        save();
        render();
    }
};

(window as any).applyFilter = (type: 'month' | 'year' | 'sort', value: string) => {
    (state.filters as any)[type] = value;
    render();
};

(window as any).toggleSort = () => {
    state.filters.sort = state.filters.sort === 'desc' ? 'asc' : 'desc';
    render();
};

(window as any).saveSettings = () => {
    // Fix: Cast element to HTMLTextAreaElement to access .value property
    state.settings.whatsappMessage = (document.getElementById('wa-msg') as HTMLTextAreaElement).value;
    state.isAdminOpen = false;
    save();
    render();
};

// Renderização
const render = () => {
    // Fix: Cast root to HTMLElement to avoid null checks and satisfy innerHTML property
    const root = document.getElementById('root') as HTMLElement;
    const pendingCount = state.clients.filter(c => c.status === 'pending').length;
    const calledCount = state.clients.filter(c => c.status === 'called').length;

    // Filtragem para a aba "Chamados"
    let displayList = state.clients.filter(c => c.status === state.activeTab);
    
    if (state.activeTab === 'called') {
        if (state.filters.month !== 'all') {
            displayList = displayList.filter(c => new Date(c.createdAt).getMonth().toString() === state.filters.month);
        }
        if (state.filters.year !== 'all') {
            displayList = displayList.filter(c => new Date(c.createdAt).getFullYear().toString() === state.filters.year);
        }
    }

    displayList.sort((a, b) => state.filters.sort === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

    root.innerHTML = `
        <div class="max-w-md mx-auto min-h-screen flex flex-col bg-slate-50">
            <!-- Header -->
            <header class="bg-indigo-600 pt-10 pb-12 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
                <div class="relative flex justify-between items-center text-white">
                    <div>
                        <h1 class="text-2xl font-black">Gestão VIP</h1>
                        <p class="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Controle de Atendimento</p>
                    </div>
                    <button onclick="toggleAdmin()" class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    </button>
                </div>
            </header>

            <main class="flex-1 -mt-6 px-4 space-y-6">
                <!-- Tabs -->
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="changeTab('pending')" class="p-4 rounded-3xl transition-all duration-300 flex flex-col items-center ${state.activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}">
                        <span class="text-2xl font-black">${pendingCount}</span>
                        <span class="text-[10px] font-bold uppercase">Aguardando</span>
                    </button>
                    <button onclick="changeTab('called')" class="p-4 rounded-3xl transition-all duration-300 flex flex-col items-center ${state.activeTab === 'called' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-100'}">
                        <span class="text-2xl font-black">${calledCount}</span>
                        <span class="text-[10px] font-bold uppercase">Chamados</span>
                    </button>
                </div>

                <!-- Formulário -->
                ${state.activeTab === 'pending' ? `
                    <section class="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 animate-in">
                        <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Novo Cliente</h2>
                        <form onsubmit="addClient(event)" class="space-y-4">
                            <input type="text" id="name" placeholder="Nome / Usuário" class="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" required>
                            <input type="tel" id="phone" placeholder="WhatsApp (DDD + Número)" class="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium" required>
                            <button type="submit" class="w-full bg-indigo-600 text-white font-black p-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase text-xs tracking-widest">Adicionar na Fila</button>
                        </form>
                    </section>
                ` : ''}

                <!-- Filtros do Histórico -->
                ${state.activeTab === 'called' ? `
                    <section class="space-y-3 animate-in">
                        <div class="flex gap-2">
                            <select onchange="applyFilter('month', this.value)" class="flex-[2] bg-white p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 outline-none">
                                <option value="all">TODOS OS MESES</option>
                                ${MONTHS.map((m, i) => {
                                    // Fix: Compare string to string by converting index i to string
                                    const isSelected = state.filters.month === i.toString() ? 'selected' : '';
                                    return `<option value="${i}" ${isSelected}>${m.toUpperCase()}</option>`;
                                }).join('')}
                            </select>
                            <select onchange="applyFilter('year', this.value)" class="flex-1 bg-white p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 outline-none">
                                <option value="all">ANOS</option>
                                ${getYears().map(y => `<option value="${y}" ${state.filters.year == y.toString() ? 'selected' : ''}>${y}</option>`).join('')}
                            </select>
                        </div>
                        <button onclick="toggleSort()" class="w-full bg-white p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Ordenar: ${state.filters.sort === 'desc' ? 'Mais Recentes' : 'Mais Antigos'}
                        </button>
                    </section>
                ` : ''}

                <!-- Lista -->
                <section class="space-y-4 pb-10">
                    <div class="flex justify-between items-center px-1">
                        <h3 class="text-xs font-black text-slate-700 uppercase tracking-widest">${state.activeTab === 'pending' ? 'Na Fila' : 'Histórico'}</h3>
                        <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">${displayList.length}</span>
                    </div>
                    ${displayList.length === 0 ? `
                        <div class="py-12 text-center text-slate-400 text-xs font-medium bg-white rounded-3xl border border-dashed border-slate-200">
                            Nenhum cliente por aqui.
                        </div>
                    ` : displayList.map(c => renderCard(c)).join('')}
                </section>
            </main>

            <!-- Modal Admin -->
            ${state.isAdminOpen ? `
                <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div class="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-xl font-black text-slate-800">Painel Admin</h2>
                            <button onclick="toggleAdmin()" class="p-2 bg-slate-50 rounded-full text-slate-400"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div class="space-y-4">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mensagem do WhatsApp</label>
                            <textarea id="wa-msg" class="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 h-32 outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-500/20">${state.settings.whatsappMessage}</textarea>
                            <p class="text-[10px] text-slate-400 italic">Use {nome} para incluir o nome do cliente automaticamente.</p>
                            <button onclick="saveSettings()" class="w-full bg-indigo-600 text-white font-black p-4 rounded-2xl shadow-lg uppercase text-xs tracking-widest">Salvar Configurações</button>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};

const renderCard = (client: Client) => {
    const hoursWaiting = (Date.now() - client.createdAt) / (1000 * 60 * 60);
    const isCritical = client.status === 'pending' && hoursWaiting >= 2;
    const timeStr = new Date(client.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const waLink = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(state.settings.whatsappMessage.replace('{nome}', client.name))}`;

    return `
        <div class="bg-white border p-5 rounded-3xl transition-all ${isCritical ? 'border-red-500 bg-red-50/30 shadow-xl shadow-red-100' : 'border-slate-100 shadow-sm'} relative overflow-hidden group">
            ${isCritical ? '<div class="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl">ALERTA 2H+</div>' : ''}
            
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="font-black text-slate-800 text-lg leading-tight">${client.name}</h4>
                    <p class="text-sm font-bold text-slate-400 mt-0.5">${client.phone}</p>
                </div>
                <div class="bg-slate-50 px-2 py-1 rounded-lg text-[10px] font-black text-slate-500 border border-slate-100">
                    ${timeStr}
                </div>
            </div>

            <div class="flex gap-2">
                ${client.status === 'pending' ? `
                    <button onclick="markAsCalled('${client.id}')" class="flex-1 bg-indigo-600 text-white text-[10px] font-black py-3 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Já Chamei</button>
                ` : `
                    <button onclick="removeClient('${client.id}')" class="flex-1 bg-emerald-600 text-white text-[10px] font-black py-3 rounded-2xl uppercase tracking-widest active:scale-95 transition-all">Assinou</button>
                `}
                <a href="${waLink}" target="_blank" class="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl active:scale-90 transition-all">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
            </div>
        </div>
    `;
};

// Loop de Verificação de Tempo (1 minuto)
setInterval(() => render(), 60000);

// Início
render();
