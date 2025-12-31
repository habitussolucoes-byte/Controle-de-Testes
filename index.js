(function() {
    const STORAGE_KEY = 'gestor_vip_final_v7';
    
    let state = {
        clients: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'),
        activeTab: 'pending',
        filterDate: 'all', // all, week, month, year
        sortBy: 'newest' // newest, oldest
    };

    const save = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.clients));
    };

    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const formatFullDate = (ts) => new Date(ts).toLocaleDateString('pt-BR') + ' ' + new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formatTime = (ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const getWaitTime = (createdAt) => {
        const diff = Date.now() - createdAt;
        const remaining = TWO_HOURS - diff;
        if (remaining <= 0) return "Tempo esgotado";
        const mins = Math.floor(remaining / 60000);
        const hrs = Math.floor(mins / 60);
        return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
    };

    // Lógica de Filtro de Data
    const isWithinPeriod = (ts, period) => {
        const date = new Date(ts);
        const now = new Date();
        if (period === 'all') return true;
        if (period === 'year') return date.getFullYear() === now.getFullYear();
        if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        if (period === 'week') {
            const oneDay = 24 * 60 * 60 * 1000;
            const diff = now - date;
            return diff < (7 * oneDay);
        }
        return true;
    };

    // Função de Exportação CSV
    const exportToCSV = (data) => {
        const headers = ["Nome", "Telefone", "Data Cadastro", "Status", "IBO Atualizado"];
        const rows = data.map(c => [
            c.name,
            c.phone,
            formatFullDate(c.createdAt),
            c.status === 'pending' ? 'Fila' : 'Chamado',
            c.iboUpdated ? 'Sim' : 'Não'
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `clientes_vip_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const render = () => {
        const app = document.getElementById('app');
        if (!app) return;

        // Filtragem Inicial por Aba
        let filtered = state.clients.filter(c => c.status === state.activeTab);

        // Aplica Filtros de Data (apenas na aba Chamados)
        if (state.activeTab === 'called') {
            filtered = filtered.filter(c => isWithinPeriod(c.createdAt, state.filterDate));
        }

        // Aplica Ordenação
        filtered.sort((a, b) => {
            return state.sortBy === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
        });

        const counts = {
            pending: state.clients.filter(c => c.status === 'pending').length,
            called: state.clients.filter(c => c.status === 'called').length
        };

        app.innerHTML = `
            <div class="max-w-md mx-auto min-h-screen flex flex-col pb-10 bg-slate-50">
                <header class="bg-slate-900 text-white p-8 rounded-b-[3rem] shadow-xl">
                    <div class="flex justify-between items-center">
                        <div>
                            <h1 class="text-2xl font-black text-amber-300 italic tracking-tighter">GESTOR VIP</h1>
                            <p class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Gestão de Atendimento</p>
                        </div>
                        ${state.activeTab === 'called' && filtered.length > 0 ? `
                            <button data-action="export" class="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl active:scale-95 transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </button>
                        ` : ''}
                    </div>
                </header>

                <div class="flex gap-3 px-6 -mt-8">
                    <button data-tab="pending" class="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${state.activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}">
                        Fila (${counts.pending})
                    </button>
                    <button data-tab="called" class="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${state.activeTab === 'called' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}">
                        Chamados (${counts.called})
                    </button>
                </div>

                <main class="p-6 flex-1">
                    ${state.activeTab === 'pending' ? `
                        <form id="add-form" class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 animate-in">
                            <h2 class="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Novo Cliente</h2>
                            <div class="space-y-3">
                                <input id="name" type="text" placeholder="Nome do Usuário" required class="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-indigo-100 transition-all">
                                <input id="phone" type="tel" placeholder="Telefone" required class="w-full bg-slate-50 p-4 rounded-2xl outline-none text-sm font-bold border-2 border-transparent focus:border-indigo-100 transition-all">
                                <button type="submit" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg active:scale-95 transition-transform">Adicionar na Fila</button>
                            </div>
                        </form>
                    ` : `
                        <div class="mb-6 space-y-4 animate-in">
                            <div class="flex flex-wrap gap-2">
                                ${['all', 'week', 'month', 'year'].map(p => `
                                    <button data-filter-date="${p}" class="px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${state.filterDate === p ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border border-slate-100'}">
                                        ${p === 'all' ? 'Tudo' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
                                    </button>
                                `).join('')}
                            </div>
                            <div class="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100">
                                <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Ordenar por:</span>
                                <div class="flex gap-1">
                                    <button data-sort="newest" class="px-3 py-1.5 rounded-lg text-[9px] font-bold ${state.sortBy === 'newest' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}">Mais Recente</button>
                                    <button data-sort="oldest" class="px-3 py-1.5 rounded-lg text-[9px] font-bold ${state.sortBy === 'oldest' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}">Mais Antigo</button>
                                </div>
                            </div>
                        </div>
                    `}

                    <div id="list" class="space-y-4">
                        ${filtered.length === 0 ? `
                            <div class="text-center py-20 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <p class="text-slate-300 font-black text-[10px] uppercase tracking-widest">Nenhum registro</p>
                            </div>
                        ` : filtered.map(c => {
                            const isOverdue = c.status === 'pending' && (Date.now() - c.createdAt >= TWO_HOURS);
                            return `
                                <div class="bg-white p-5 rounded-[2rem] border-2 transition-all animate-in ${isOverdue ? 'border-red-500 bg-red-50' : 'border-slate-100'}">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="max-w-[180px]">
                                            <h3 class="font-black text-slate-800 truncate">${c.name}</h3>
                                            <p class="text-xs font-bold text-slate-400">${c.phone}</p>
                                        </div>
                                        <div class="text-right">
                                            <div class="bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-black text-slate-500">${formatTime(c.createdAt)}</div>
                                            ${c.status === 'pending' ? `<div class="text-[9px] font-black mt-1 uppercase ${isOverdue ? 'text-red-600 animate-pulse' : 'text-indigo-500'}">${getWaitTime(c.createdAt)}</div>` : ''}
                                        </div>
                                    </div>

                                    ${c.status === 'called' ? `
                                        <div class="mb-4 flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border ${c.iboUpdated ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'}">
                                            <input type="checkbox" id="ibo-${c.id}" data-id="${c.id}" data-action="toggle-ibo" ${c.iboUpdated ? 'checked' : ''} class="w-7 h-7 accent-emerald-600">
                                            <label for="ibo-${c.id}" class="text-[10px] font-black text-slate-600 uppercase select-none">IBO ATUALIZADO</label>
                                        </div>
                                    ` : ''}

                                    <div class="flex gap-2">
                                        ${c.status === 'pending' ? `
                                            <button data-id="${c.id}" data-action="call" class="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl text-[10px] uppercase shadow-md active:scale-95 transition-all">Já Chamei</button>
                                        ` : `
                                            <button data-id="${c.id}" data-action="delete" class="flex-1 ${c.iboUpdated ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'} font-black py-4 rounded-3xl text-[10px] uppercase shadow-md active:scale-95 transition-all">
                                                Assinou (Excluir)
                                            </button>
                                        `}
                                        <button data-phone="${c.phone}" data-action="copy" class="bg-slate-100 text-slate-500 p-4 rounded-3xl active:scale-90 transition-all">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </main>
            </div>
        `;
    };

    // --- ESCUTADOR DE EVENTOS GLOBAL ---
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-action], [data-tab], [data-filter-date], [data-sort]');
        if (!target) return;

        // Troca de Aba
        if (target.dataset.tab) {
            state.activeTab = target.dataset.tab;
            render();
            return;
        }

        // Filtros de Data
        if (target.dataset.filterDate) {
            state.filterDate = target.dataset.filterDate;
            render();
            return;
        }

        // Ordenação
        if (target.dataset.sort) {
            state.sortBy = target.dataset.sort;
            render();
            return;
        }

        const action = target.dataset.action;
        const id = target.dataset.id;

        // Exportação
        if (action === 'export') {
            const dataToExport = state.clients
                .filter(c => c.status === 'called')
                .filter(c => isWithinPeriod(c.createdAt, state.filterDate));
            exportToCSV(dataToExport);
            return;
        }

        const clientIndex = state.clients.findIndex(c => String(c.id) === String(id));
        const client = state.clients[clientIndex];

        if (action === 'call' && client) {
            client.status = 'called';
            save();
            render();
        } 
        else if (action === 'toggle-ibo' && client) {
            client.iboUpdated = target.checked;
            save();
            render();
        } 
        else if (action === 'delete' && client) {
            if (!client.iboUpdated) {
                alert("AVISO: Marque 'IBO ATUALIZADO' para habilitar a exclusão.");
                return;
            }
            state.clients.splice(clientIndex, 1);
            save();
            render();
        } 
        else if (action === 'copy') {
            const phone = target.dataset.phone;
            navigator.clipboard.writeText(phone).then(() => {
                const original = target.innerHTML;
                target.innerHTML = '<span class="text-[9px]">OK!</span>';
                setTimeout(() => target.innerHTML = original, 1000);
            });
        }
    });

    // --- ESCUTADOR DE FORMULÁRIO ---
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'add-form') {
            e.preventDefault();
            const nameInp = document.getElementById('name');
            const phoneInp = document.getElementById('phone');
            
            const name = nameInp.value.trim();
            const phone = phoneInp.value.replace(/\D/g, '');

            if (!name || phone.length < 8) {
                alert('Preencha nome e telefone corretamente.');
                return;
            }

            const newClient = {
                id: "ID_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
                name: name,
                phone: phone,
                createdAt: Date.now(),
                status: 'pending',
                iboUpdated: false
            };

            state.clients.unshift(newClient);
            save();
            render();
        }
    });

    setInterval(() => {
        if (state.activeTab === 'pending') render();
    }, 20000);

    render();
})();