// Estado Inicial
let state = {
    clients: JSON.parse(localStorage.getItem('vip_clients') || '[]'),
    activeTab: 'pending'
};

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

// Salvar no Storage
const save = () => {
    localStorage.setItem('vip_clients', JSON.stringify(state.clients));
};

// Funções de Negócio
window.addClient = (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');

    const cleanPhone = phoneInput.value.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
        alert('Por favor, insira um número de telefone válido.');
        return;
    }

    // Verificar Duplicidade
    const existingIndex = state.clients.findIndex(c => c.phone === cleanPhone);
    if (existingIndex !== -1) {
        const confirmMsg = `O número ${cleanPhone} já está cadastrado como "${state.clients[existingIndex].name}". Deseja excluir o registro antigo e manter o novo?`;
        if (confirm(confirmMsg)) {
            state.clients.splice(existingIndex, 1);
        } else {
            return;
        }
    }

    const newClient = {
        id: Date.now(),
        name: nameInput.value,
        phone: cleanPhone,
        createdAt: Date.now(),
        status: 'pending'
    };

    state.clients.unshift(newClient);
    save();
    render();
    nameInput.value = '';
    phoneInput.value = '';
};

window.markAsCalled = (id) => {
    state.clients = state.clients.map(c => 
        c.id === id ? { ...c, status: 'called' } : c
    );
    save();
    render();
};

window.deleteClient = (id) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
        state.clients = state.clients.filter(c => c.id !== id);
        save();
        render();
    }
};

window.switchTab = (tab) => {
    state.activeTab = tab;
    render();
};

// Formatação do tempo restante
const getRemainingTime = (createdAt) => {
    const elapsed = Date.now() - createdAt;
    const remaining = TWO_HOURS_MS - elapsed;

    if (remaining <= 0) return "Tempo esgotado";

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `Faltam ${hours}h ${minutes}min`;
    }
    return `Faltam ${minutes}min`;
};

// Componentes Visuais
const renderCard = (client) => {
    const elapsed = Date.now() - client.createdAt;
    const isOverdue = client.status === 'pending' && elapsed >= TWO_HOURS_MS;
    const timeCreated = new Date(client.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const remainingText = client.status === 'pending' ? getRemainingTime(client.createdAt) : '';

    return `
        <div class="bg-white p-5 rounded-[2.5rem] shadow-sm border transition-all animate-in ${isOverdue ? 'border-red-500 bg-red-50 shadow-red-100 shadow-xl' : 'border-slate-100'}">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-black text-lg ${isOverdue ? 'text-red-900' : 'text-slate-800'}">${client.name}</h3>
                    <p class="text-xs font-bold text-slate-400 mt-0.5">${client.phone}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <div class="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Início: ${timeCreated}
                    </div>
                    ${client.status === 'pending' ? `
                        <div class="text-[9px] font-black uppercase tracking-wider ${isOverdue ? 'text-red-600 animate-pulse' : 'text-indigo-500'}">
                            ${remainingText}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="flex gap-2 mt-4">
                ${client.status === 'pending' ? `
                    <button onclick="markAsCalled(${client.id})" class="flex-1 bg-indigo-600 text-white font-black py-4 rounded-3xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Já Chamei
                    </button>
                ` : `
                    <button onclick="deleteClient(${client.id})" class="flex-1 bg-red-500 text-white font-black py-4 rounded-3xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Excluir
                    </button>
                `}
                <a href="https://wa.me/55${client.phone.replace(/\D/g, '')}" target="_blank" class="w-14 h-14 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded-3xl active:scale-90 transition-all">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.675 1.438 5.662 1.439h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
            </div>
        </div>
    `;
};

const render = () => {
    const app = document.getElementById('app');
    const filteredClients = state.clients.filter(c => c.status === state.activeTab);
    const counts = {
        pending: state.clients.filter(c => c.status === 'pending').length,
        called: state.clients.filter(c => c.status === 'called').length
    };

    app.innerHTML = `
        <div class="max-w-md mx-auto flex flex-col min-h-screen">
            <header class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white pt-10 pb-12 px-6 rounded-b-[3rem] shadow-2xl border-b border-white/5">
                <h1 class="text-2xl font-black tracking-tight text-amber-200">Gestor VIP de Testes</h1>
                <p class="text-indigo-300 text-[10px] uppercase font-bold tracking-[0.2em] mt-1 opacity-90">Painel Operacional</p>
            </header>

            <nav class="flex gap-4 px-4 -mt-6">
                <button onclick="switchTab('pending')" class="flex-1 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${state.activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'}">
                    Fila (${counts.pending})
                </button>
                <button onclick="switchTab('called')" class="flex-1 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all ${state.activeTab === 'called' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-100'}">
                    Chamados (${counts.called})
                </button>
            </nav>

            <main class="flex-1 p-4 space-y-6">
                ${state.activeTab === 'pending' ? `
                    <section class="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Novo Cadastro</h2>
                        <form onsubmit="addClient(event)" class="space-y-4">
                            <input id="name" type="text" placeholder="Nome do Usuário" required class="w-full bg-slate-50 border-none p-4 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                            <input id="phone" type="tel" placeholder="Telefone (apenas números)" oninput="this.value = this.value.replace(/\\D/g, '')" required class="w-full bg-slate-50 border-none p-4 rounded-2xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                            <button type="submit" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Adicionar</button>
                        </form>
                    </section>
                ` : ''}

                <div class="space-y-4">
                    <div class="flex justify-between items-center px-1">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            ${state.activeTab === 'pending' ? 'Aguardando Atendimento' : 'Histórico de Chamadas'}
                        </span>
                        <span class="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">${filteredClients.length}</span>
                    </div>
                    ${filteredClients.length === 0 ? `
                        <div class="py-12 text-center text-slate-400 text-xs font-bold border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                            Nenhum cliente por aqui.
                        </div>
                    ` : filteredClients.map(c => renderCard(c)).join('')}
                </div>
            </main>

            <footer class="p-6 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                Gestão de Clientes &copy; 2025
            </footer>
        </div>
    `;
};

// Auto-Refresh a cada 1 minuto para atualizar o cronômetro
setInterval(() => render(), 60000);

render();