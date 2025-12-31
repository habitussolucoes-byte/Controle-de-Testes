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

window.openWhatsApp = function(phone, message) {
  const encodedMessage = encodeURIComponent(message);
  const waApp = `whatsapp://send?phone=${phone}&text=${encodedMessage}`;
  const waWeb = `https://wa.me/${phone}?text=${encodedMessage}`;

  window.location.href = waApp;

  setTimeout(() => {
    window.open(waWeb, "_blank");
  }, 1000);
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
                        ${timeCreated}
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
                    <button onclick="markAsCalled(${client.id})" class="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-3xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Já Chamei
                    </button>
                ` : `
                    <button onclick="deleteClient(${client.id})" class="flex-[2] bg-red-500 text-white font-black py-4 rounded-3xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        Excluir
                    </button>
                `}
                <button onclick="openWhatsApp('55${client.phone.replace(/\D/g, '')}', 'Olá!')">
Abrir WhatsApp
</button>
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