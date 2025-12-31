
// Estado Global da Aplicação
let state = {
    clients: JSON.parse(localStorage.getItem('gestor_clientes_data') || '[]'),
    settings: JSON.parse(localStorage.getItem('gestor_clientes_settings') || '{"whatsappMessage": "Olá {nome}, tudo bem? Sou da equipe de atendimento e estou entrando em contato."}'),
    activeTab: 'pending',
    isAdminOpen: false,
    filters: {
        month: 'all',
        year: 'all',
        sort: 'desc'
    }
};

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Funções de Utilidade
const saveState = () => {
    localStorage.setItem('gestor_clientes_data', JSON.stringify(state.clients));
    localStorage.setItem('gestor_clientes_settings', JSON.stringify(state.settings));
};

const getAvailableYears = () => {
    const years = new Set<string>();
    state.clients.forEach((c: any) => years.add(new Date(c.createdAt).getFullYear().toString()));
    // Fix: Cast strings to numbers for arithmetic operation to fix line 26 error
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
};

// Componentes e Renderização
const render = () => {
    const root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = `
        <div class="max-w-md mx-auto min-h-screen flex flex-col pb-10">
            ${renderHeader()}
            <main class="flex-1 p-4 space-y-6">
                ${renderTabs()}
                ${state.activeTab === 'pending' ? renderForm() : ''}
                ${renderClientList()}
            </main>
            <footer class="py-6 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold opacity-50">
                &copy; 2025 Controle de Testes
            </footer>
        </div>
        ${state.isAdminOpen ? renderAdminPanel() : ''}
    `;
    attachEventListeners();
};

const renderHeader = () => `
    <header class="bg-indigo-600 pt-8 pb-10 px-6 rounded-b-[40px] shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
        <div class="relative flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-black text-white tracking-tight text-shadow-sm">Controle de Testes</h1>
                <p class="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-0.5">Gestão Operacional</p>
            </div>
            <button id="open-admin" class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 active:scale-90 transition-transform">
                <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
    </header>
`;

const renderTabs = () => {
    const pendingCount = state.clients.filter((c: any) => c.status === 'pending').length;
    const calledCount = state.clients.filter((c: any) => c.status === 'called').length;
    return `
        <div class="grid grid-cols-2 gap-4">
            <button id="tab-pending" class="p-3 rounded-2xl transition-all duration-300 flex flex-col items-center ${state.activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white text-slate-500 border border-slate-100'}">
                <span class="text-2xl font-bold">${pendingCount}</span>
                <span class="text-xs font-medium uppercase tracking-wider">Aguardando</span>
            </button>
            <button id="tab-called" class="p-3 rounded-2xl transition-all duration-300 flex flex-col items-center ${state.activeTab === 'called' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' : 'bg-white text-slate-500 border border-slate-100'}">
                <span class="text-2xl font-bold">${calledCount}</span>
                <span class="text-xs font-medium uppercase tracking-wider">Chamados</span>
            </button>
        </div>
    `;
};

const renderForm = () => `
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 animate-in">
        <h2 class="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[2px]">Novo Cadastro</h2>
        <form id="client-form" class="space-y-4">
            <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-400 ml-1">USUÁRIO DO CLIENTE</label>
                <input type="text" id="input-name" placeholder="Nome do usuário" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium" required>
            </div>
            <div class="space-y-1">
                <label class="text-[10px] font-black text-slate-400 ml-1">TELEFONE</label>
                <input type="tel" id="input-phone" placeholder="(00) 00000-0000" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium" required>
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white font-black py-3 rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest text-xs">
                Adicionar Cadastro
            </button>
        </form>
    </div>
`;

const renderClientList = () => {
    let list = state.clients.filter((c: any) => c.status === state.activeTab);
    
    if (state.activeTab === 'called') {
        if (state.filters.month !== 'all') list = list.filter((c: any) => new Date(c.createdAt).getMonth().toString() === state.filters.month);
        if (state.filters.year !== 'all') list = list.filter((c: any) => new Date(c.createdAt).getFullYear().toString() === state.filters.year);
    }

    list.sort((a: any, b: any) => state.filters.sort === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

    return `
        <div class="space-y-4">
            <div class="flex flex-col gap-3">
                <div class="flex justify-between items-center px-1">
                    <h2 class="font-black text-slate-700 text-sm uppercase tracking-widest">${state.activeTab === 'pending' ? 'Fila de Espera' : 'Histórico'}</h2>
                    <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">${list.length} registros</span>
                </div>
                ${state.activeTab === 'called' ? renderFilters() : ''}
            </div>
            <div class="space-y-3">
                ${list.length === 0 ? '<div class="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 text-xs">Nenhum registro encontrado.</div>' : list.map((c: any) => renderClientCard(c)).join('')}
            </div>
        </div>
    `;
};

const renderFilters = () => `
    <div class="space-y-2 animate-in">
        <div class="flex gap-2">
            <select id="filter-month" class="flex-[2] bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl px-2 py-2.5 outline-none">
                <option value="all">MESES</option>
                ${MONTHS.map((m, i) => `<option value="${i}" ${state.filters.month === i.toString() ? 'selected' : ''}>${m.toUpperCase()}</option>`).join('')}
            </select>
            <select id="filter-year" class="flex-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl px-2 py-2.5 outline-none">
                <option value="all">ANO</option>
                ${getAvailableYears().map(y => `<option value="${y}" ${state.filters.year === y ? 'selected' : ''}>${y}</option>`).join('')}
            </select>
        </div>
        <button id="toggle-sort" class="w-full bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-xl py-2.5 uppercase tracking-widest">
            Ordenar: ${state.filters.sort === 'desc' ? 'Mais Novos' : 'Mais Antigos'}
        </button>
    </div>
`;

const renderClientCard = (client: any) => {
    const diffHours = (Date.now() - client.createdAt) / (1000 * 60 * 60);
    const isOverdue = client.status === 'pending' && diffHours >= 2;
    const date = new Date(client.createdAt);
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="bg-white border rounded-3xl p-4 transition-all ${isOverdue ? 'border-red-500 bg-red-50/50 shadow-xl shadow-red-100' : 'border-slate-100 shadow-sm'} relative overflow-hidden">
            ${isOverdue ? '<div class="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase">Atrasado 2h+</div>' : ''}
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-black text-slate-800 text-lg leading-tight">${client.name}</h3>
                    <p class="text-sm font-bold text-slate-400 mt-1">${client.phone}</p>
                </div>
                <div class="text-right">
                    <span class="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">${timeStr}</span>
                </div>
            </div>
            <div class="flex gap-2">
                ${client.status === 'pending' 
                    ? `<button onclick="markAsCalled('${client.id}')" class="flex-1 bg-indigo-600 text-white text-[10px] font-black py-3 rounded-2xl uppercase tracking-widest active:scale-95 transition-transform">Já Chamei</button>`
                    : `<button onclick="deleteClient('${client.id}')" class="flex-1 bg-emerald-600 text-white text-[10px] font-black py-3 rounded-2xl uppercase tracking-widest active:scale-95 transition-transform">Assinou (Remover)</button>`
                }
                <a href="https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(state.settings.whatsappMessage.replace('{nome}', client.name))}" target="_blank" class="w-12 h-12 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-2xl active:scale-90 transition-transform">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
            </div>
        </div>
    `;
};

const renderAdminPanel = () => `
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in">
        <div class="bg-white w-full max-w-md rounded-t-[40px] sm:rounded-[40px] shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-black text-slate-800 tracking-tight">Painel Admin</h2>
                <button id="close-admin" class="p-2 bg-slate-100 rounded-full text-slate-400"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div class="space-y-8">
                <div class="space-y-4">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-2">Configurações</h3>
                    <textarea id="admin-msg" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium h-24 focus:ring-2 focus:ring-indigo-500/20 outline-none">${state.settings.whatsappMessage}</textarea>
                    <button id="save-settings" class="w-full bg-indigo-600 text-white font-black py-3 rounded-2xl uppercase text-[10px] tracking-widest">Salvar Configurações</button>
                </div>
                <div class="space-y-4">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-2">Gestão de Dados</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <button id="export-csv" class="border-2 border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors">
                            <span class="text-indigo-500 font-bold text-xs">EXPORTAR</span>
                        </button>
                        <button id="trigger-import" class="border-2 border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-50 transition-colors">
                            <span class="text-emerald-500 font-bold text-xs">IMPORTAR</span>
                        </button>
                    </div>
                    <input type="file" id="import-csv" accept=".csv" class="hidden">
                </div>
            </div>
        </div>
    </div>
`;

// Lógica de Atendimento
// Fix: Use type assertion to assign properties to window to fix line 206 and 212 errors
(window as any).markAsCalled = (id: string) => {
    state.clients = state.clients.map((c: any) => c.id === id ? { ...c, status: 'called', calledAt: Date.now() } : c);
    saveState();
    render();
};

(window as any).deleteClient = (id: string) => {
    state.clients = state.clients.filter((c: any) => c.id !== id);
    saveState();
    render();
};

// Eventos
const attachEventListeners = () => {
    document.getElementById('tab-pending')?.addEventListener('click', () => { state.activeTab = 'pending'; render(); });
    document.getElementById('tab-called')?.addEventListener('click', () => { state.activeTab = 'called'; render(); });
    document.getElementById('open-admin')?.addEventListener('click', () => { state.isAdminOpen = true; render(); });
    document.getElementById('close-admin')?.addEventListener('click', () => { state.isAdminOpen = false; render(); });

    document.getElementById('client-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        // Fix: Cast elements to HTMLInputElement to fix line 231 and 232 errors
        const nameInput = document.getElementById('input-name') as HTMLInputElement;
        const phoneInput = document.getElementById('input-phone') as HTMLInputElement;
        state.clients.unshift({
            id: crypto.randomUUID(),
            name: nameInput.value,
            phone: phoneInput.value,
            createdAt: Date.now(),
            status: 'pending'
        });
        saveState();
        render();
    });

    // Fix: Cast e.target to HTMLSelectElement to fix line 240 and 241 errors
    document.getElementById('filter-month')?.addEventListener('change', (e) => { state.filters.month = (e.target as HTMLSelectElement).value; render(); });
    document.getElementById('filter-year')?.addEventListener('change', (e) => { state.filters.year = (e.target as HTMLSelectElement).value; render(); });
    document.getElementById('toggle-sort')?.addEventListener('click', () => { state.filters.sort = state.filters.sort === 'desc' ? 'asc' : 'desc'; render(); });

    document.getElementById('save-settings')?.addEventListener('click', () => {
        // Fix: Cast element to HTMLTextAreaElement to fix line 245 error
        const adminMsgElement = document.getElementById('admin-msg') as HTMLTextAreaElement;
        state.settings.whatsappMessage = adminMsgElement.value;
        state.isAdminOpen = false;
        saveState();
        render();
    });

    document.getElementById('export-csv')?.addEventListener('click', () => {
        const headers = ['id', 'nome', 'telefone', 'criado_em', 'status', 'chamado_em'];
        const csv = [headers.join(','), ...state.clients.map((c: any) => [c.id, `"${c.name}"`, c.phone, c.createdAt, c.status, c.calledAt || ''].join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dados_controle_testes_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    });

    document.getElementById('trigger-import')?.addEventListener('click', () => document.getElementById('import-csv')?.click());
    document.getElementById('import-csv')?.addEventListener('change', (e) => {
        // Fix: Cast e.target to HTMLInputElement to fix line 264 error
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            // Fix: Cast result to string to fix line 268 error
            const result = event.target?.result as string;
            const lines = result.split('\n').slice(1);
            const imported = lines.filter(l => l.trim()).map(line => {
                const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                return {
                    id: parts[0] || crypto.randomUUID(),
                    name: (parts[1] || '').replace(/"/g, ''),
                    phone: parts[2] || '',
                    createdAt: parseInt(parts[3]) || Date.now(),
                    status: parts[4] || 'pending',
                    calledAt: parts[5] ? parseInt(parts[5]) : undefined
                };
            });
            state.clients = [...state.clients, ...imported.filter(i => !state.clients.find((c: any) => c.id === i.id))];
            saveState();
            render();
            alert('Importação concluída!');
        };
        reader.readAsText(file);
    });
};

// Timer para atualizar alertas em tempo real
setInterval(() => render(), 60000);

// Inicialização
render();
