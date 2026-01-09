// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 [APP] Inicializando MordomoPay...');
    
    if (typeof initSupabase === 'function') {
        initSupabase();
    }

    // Verificar se o usuário está logado no localStorage
    const savedUser = localStorage.getItem('mordomoPay_user');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            CONFIG.currentUser = userData;
            showDashboard();
        } catch (e) {
            console.error('Erro ao carregar usuário salvo:', e);
            showLoginModal();
        }
    } else {
        showLoginModal();
    }

    setupEventListeners();
}

function setupEventListeners() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn) toggleBtn.onclick = () => sidebar.classList.toggle('collapsed');
    if (mobileToggle) mobileToggle.onclick = () => sidebar.classList.toggle('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            navigateToPage(pageId);
            if (window.innerWidth <= 1024) sidebar.classList.remove('active');
        };
    });

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.onclick = () => {
            const newTheme = CONFIG.theme === 'light' ? 'dark' : 'light';
            saveTheme(newTheme);
            updateThemeUI();
            if (typeof updateChartColors === 'function') updateChartColors();
        };
    }
}

// ========== AUTENTICAÇÃO E LOGOUT ==========

async function handleLogin() {
    const userInput = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    if (!userInput || !password) {
        showLoginError('Preencha todos os campos');
        return;
    }

    try {
        let query = supabaseClient.from('usuarios').select('*');
        if (userInput.includes('@')) {
            query = query.eq('email', userInput);
        } else {
            query = query.eq('celular', userInput.replace(/\D/g, ''));
        }

        const { data: users, error } = await query;
        if (error) throw error;

        if (!users || users.length === 0) {
            showLoginError('Usuário não encontrado. Cadastre-se via WhatsApp!');
            return;
        }

        const user = users[0];
        if (user.senha !== password) {
            showLoginError('Senha incorreta');
            return;
        }

        // Sucesso no Login
        saveUser(user.id, user.nome, user.celular);
        showDashboard();
        if (typeof showNotification === 'function') showNotification('Bem-vindo ao MordomoPay!', 'success');
    } catch (err) {
        console.error(err);
        showLoginError('Erro ao conectar com o servidor');
    }
}

function handleLogout() {
    console.log('🚪 [APP] Realizando logout...');
    localStorage.removeItem('mordomoPay_user');
    // Resetar CONFIG
    CONFIG.currentUser = { id: null, name: null, phone: null };
    // Recarregar a página para limpar o estado e mostrar o login
    window.location.reload();
}

function redirectToWhatsAppSignup() {
    const phone = "553298416669"; // Substitua pelo número do seu bot
    const text = encodeURIComponent("Olá! Gostaria de me cadastrar no MordomoPay.");
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
}

// ========== TRANSIÇÕES E NAVEGAÇÃO ==========

function showDashboard() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.remove('active');
    
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = CONFIG.currentUser.name;
    
    updateThemeUI();
    navigateToPage('dashboard');
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.classList.add('active');
}

function showLoginError(msg) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = msg;
        errorDiv.style.display = 'block';
    } else {
        alert(msg);
    }
}

function navigateToPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    const titles = {
        'dashboard': 'Dashboard',
        'receitas': 'Minhas Receitas',
        'despesas': 'Minhas Despesas',
        'transacoes': 'Histórico de Transações',
        'categorias': 'Categorias',
        'relatorios': 'Relatórios Financeiros',
        'usuarios': 'Gestão de Usuários',
        'configuracoes': 'Configurações'
    };
    document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard';

    const contentArea = document.getElementById('content');
    if (pageId === 'dashboard') {
        renderDashboardLayout();
        loadDashboardData();
    } else {
        renderGenericPageLayout(pageId);
        loadPageSpecificData(pageId);
    }
}

// ========== LAYOUTS E DADOS (MANTIDOS) ==========

function renderDashboardLayout() {
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <div class="page active" id="dashboard-page">
            <!-- Módulo de Sabedoria -->
            <div id="sabedoria-container" class="full-width mb-4"></div>

            <div class="summary-cards">
                <div class="card card-receitas">
                    <div class="card-icon"><i class="fas fa-arrow-up"></i></div>
                    <div class="card-content"><h3>Receitas</h3><p class="card-value" id="totalReceitas">R$ 0,00</p></div>
                </div>
                <div class="card card-despesas">
                    <div class="card-icon"><i class="fas fa-arrow-down"></i></div>
                    <div class="card-content"><h3>Despesas</h3><p class="card-value" id="totalDespesas">R$ 0,00</p></div>
                </div>
                <div class="card card-saldo">
                    <div class="card-icon"><i class="fas fa-wallet"></i></div>
                    <div class="card-content"><h3>Saldo</h3><p class="card-value" id="saldo">R$ 0,00</p></div>
                </div>
                <div class="card card-saude">
                    <div class="card-icon"><i class="fas fa-heart-pulse"></i></div>
                    <div class="card-content"><h3>Saúde Financeira</h3>
                        <div class="health-meter">
                            <div class="health-bar"><div class="health-fill" id="healthFill" style="width: 0%"></div></div>
                            <p class="card-value" id="healthScore">0%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Metas Financeiras -->
            <div class="card goals-card mb-4" style="display: block;">
                <div class="card-header">
                    <h3><i class="fas fa-bullseye"></i> Metas de Mordomia</h3>
                </div>
                <div id="goals-container" class="card-body">
                    <p class="no-data">Carregando metas...</p>
                </div>
            </div>

            <div class="charts-section">
                <div class="chart-container"><h3>Despesas por Categoria</h3><canvas id="categoryChart"></canvas></div>
                <div class="chart-container"><h3>Tendências Mensais</h3><canvas id="trendChart"></canvas></div>
            </div>
            <div class="transactions-section">
                <div class="section-header"><h3>Transações Recentes</h3></div>
                <div class="table-container">
                    <table class="transactions-table">
                        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr></thead>
                        <tbody id="transactionsBody"><tr><td colspan="5" class="no-data">Carregando...</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderGenericPageLayout(pageId) {
    const contentArea = document.getElementById('content');
    if (pageId === 'configuracoes') {
        contentArea.innerHTML = `
            <div class="page active" id="configuracoes-page">
                <div class="page-header"><h2>Configurações</h2></div>
                <div class="card mb-4" style="display: block;">
                    <div class="card-header"><h3><i class="fas fa-medal"></i> Minhas Conquistas</h3></div>
                    <div id="badges-container" class="card-body"></div>
                </div>
                <div class="card" style="display: block;">
                    <div class="card-header"><h3>Perfil e Sistema</h3></div>
                    <div class="card-body">
                        <div class="table-container">
                            <table class="transactions-table">
                                <tbody id="pageTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        contentArea.innerHTML = `
            <div class="page active">
                <div class="transactions-section">
                    <div class="section-header"><h3>${pageId.toUpperCase()}</h3></div>
                    <div class="table-container">
                        <table class="transactions-table">
                            <thead id="tableHeader"><tr><th>Carregando...</th></tr></thead>
                            <tbody id="pageTableBody"><tr><td class="no-data">Buscando informações...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}

async function loadDashboardData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    try {
        const userId = CONFIG.currentUser.id;
        const transactions = await getTransactions(userId);
        updateSummaryCards(transactions);
        renderDashboardCharts(transactions);
        renderRecentTransactionsTable(transactions);

        // Novos Módulos Mordomo Fiel
        if (typeof renderSabedoriaUI === 'function') renderSabedoriaUI();
        if (typeof renderMetasUI === 'function') await renderMetasUI();
        if (typeof renderCalculadoraDizimoUI === 'function') renderCalculadoraDizimoUI();
        if (typeof renderProjecaoUI === 'function') renderProjecaoUI(transactions);
        
        // Análise de IA e Alertas
        if (typeof analisarGastosIA === 'function') {
            const { sugestoes, alertas } = analisarGastosIA(transactions);
            if (typeof renderAlertasUI === 'function') renderAlertasUI(alertas, sugestoes);
        }
    } catch (err) { console.error(err); }
}

async function loadPageSpecificData(pageId) {
    const userId = CONFIG.currentUser.id;
    const header = document.getElementById('tableHeader');
    const tbody = document.getElementById('pageTableBody');
    try {
        if (pageId === 'transacoes' || pageId === 'receitas' || pageId === 'despesas') {
            let data = await getTransactions(userId);
            if (pageId === 'receitas') data = data.filter(t => t.tipo === 'entrada' || t.tipo === 'receita');
            if (pageId === 'despesas') data = data.filter(t => t.tipo === 'saida' || t.tipo === 'despesa');
            header.innerHTML = `<tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th></tr>`;
            tbody.innerHTML = data.length ? data.map(t => `
                <tr>
                    <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    <td>${t.descricao}</td>
                    <td>${t.categoria_trasacoes?.descricao || '---'}</td>
                    <td><span class="badge ${t.tipo === 'entrada' || t.tipo === 'receita' ? 'receita' : 'despesa'}">${t.tipo}</span></td>
                    <td class="${t.tipo === 'entrada' || t.tipo === 'receita' ? 'text-success' : 'text-danger'}">${formatCurrency(t.valor)}</td>
                </tr>
            `).join('') : '<tr><td colspan="5" class="no-data">Nenhum registro encontrado</td></tr>';
        } else if (pageId === 'categorias') {
            const data = await getCategories(userId);
            header.innerHTML = `<tr><th>ID</th><th>Descrição</th><th>Criado em</th></tr>`;
            tbody.innerHTML = data.length ? data.map(c => `
                <tr><td>${c.id}</td><td>${c.descricao}</td><td>${new Date(c.created_at).toLocaleDateString('pt-BR')}</td></tr>
            `).join('') : '<tr><td colspan="3" class="no-data">Nenhuma categoria encontrada</td></tr>';
        } else if (pageId === 'usuarios') {
            const { data, error } = await supabaseClient.from('usuarios').select('*');
            header.innerHTML = `<tr><th>Nome</th><th>Email</th><th>Celular</th><th>Status</th></tr>`;
            tbody.innerHTML = data.length ? data.map(u => `
                <tr><td>${u.nome}</td><td>${u.email}</td><td>${u.celular}</td><td>${u.status}</td></tr>
            `).join('') : '<tr><td colspan="4" class="no-data">Nenhum usuário encontrado</td></tr>';
        } else if (pageId === 'configuracoes') {
            if (typeof renderBadgesUI === 'function') await renderBadgesUI();
            tbody.innerHTML = `
                <tr><td>Nome do Usuário</td><td>${CONFIG.currentUser.name}</td></tr>
                <tr><td>ID do Usuário</td><td>${CONFIG.currentUser.id}</td></tr>
                <tr><td>Tema Atual</td><td>${CONFIG.theme}</td></tr>
                <tr><td>Versão do Sistema</td><td>1.1.0 (Mordomo Fiel)</td></tr>
            `;
        } else if (pageId === 'relatorios') {
            header.innerHTML = `<tr><th>Mês/Ano</th><th>Receitas</th><th>Despesas</th><th>Saldo</th></tr>`;
            const transactions = await getTransactions(userId);
            const monthly = {};
            transactions.forEach(t => {
                const date = new Date(t.data);
                const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
                if (!monthly[key]) monthly[key] = { r: 0, d: 0 };
                if (t.tipo === 'entrada' || t.tipo === 'receita') monthly[key].r += t.valor;
                else monthly[key].d += t.valor;
            });
            tbody.innerHTML = Object.keys(monthly).map(k => `
                <tr><td>${k}</td><td class="text-success">${formatCurrency(monthly[k].r)}</td><td class="text-danger">${formatCurrency(monthly[k].d)}</td><td>${formatCurrency(monthly[k].r - monthly[k].d)}</td></tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

function updateSummaryCards(transactions) {
    let r = 0, d = 0;
    transactions.forEach(t => {
        const v = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada' || t.tipo === 'receita') r += v;
        else d += v;
    });
    const s = r - d;
    const h = r > 0 ? Math.min(100, Math.max(0, Math.round((s / r) * 100))) : 0;
    document.getElementById('totalReceitas').textContent = formatCurrency(r);
    document.getElementById('totalDespesas').textContent = formatCurrency(d);
    document.getElementById('saldo').textContent = formatCurrency(s);
    document.getElementById('healthScore').textContent = `${h}%`;
    if (document.getElementById('healthFill')) document.getElementById('healthFill').style.width = `${h}%`;
}

function renderDashboardCharts(transactions) {
    const catData = {};
    transactions.filter(t => t.tipo === 'saida' || t.tipo === 'despesa').forEach(t => {
        const c = t.categoria_trasacoes?.descricao || 'Outros';
        catData[c] = (catData[c] || 0) + parseFloat(t.valor);
    });
    if (typeof createCategoryChart === 'function') createCategoryChart(catData);

    const trendData = {};
    transactions.forEach(t => {
        const date = new Date(t.data);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!trendData[key]) trendData[key] = { receitas: 0, despesas: 0 };
        const v = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada' || t.tipo === 'receita') trendData[key].receitas += v;
        else trendData[key].despesas += v;
    });
    if (typeof createTrendChart === 'function') createTrendChart(trendData);
}

function renderRecentTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;
    tbody.innerHTML = transactions.slice(0, 8).map(t => `
        <tr>
            <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
            <td>${t.descricao}</td>
            <td>${t.categoria_trasacoes?.descricao || '---'}</td>
            <td><span class="badge ${t.tipo === 'entrada' || t.tipo === 'receita' ? 'receita' : 'despesa'}">${t.tipo}</span></td>
            <td class="${t.tipo === 'entrada' || t.tipo === 'receita' ? 'text-success' : 'text-danger'}">${formatCurrency(t.valor)}</td>
        </tr>
    `).join('');
}

function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0); }
function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', CONFIG.theme);
    const i = document.querySelector('#themeToggle i');
    if (i) i.className = CONFIG.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
