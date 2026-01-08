// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 [APP] Inicializando MordomoPay...');
    
    if (typeof initSupabase === 'function') {
        initSupabase();
    }

    if (!CONFIG.currentUser.id) {
        showLoginModal();
    } else {
        showDashboard();
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

// ========== NAVEGAÇÃO ENTRE ABAS ==========

function navigateToPage(pageId) {
    console.log(`📂 [NAV] Navegando para: ${pageId}`);
    
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

function renderDashboardLayout() {
    const contentArea = document.getElementById('content');
    contentArea.innerHTML = `
        <div class="page active" id="dashboard-page">
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

// ========== CARREGAMENTO DE DADOS ==========

async function loadDashboardData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    try {
        const userId = CONFIG.currentUser.id;
        const transactions = await getTransactions(userId);
        updateSummaryCards(transactions);
        renderDashboardCharts(transactions);
        renderRecentTransactionsTable(transactions);
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
            header.innerHTML = `<tr><th>Configuração</th><th>Valor</th></tr>`;
            tbody.innerHTML = `
                <tr><td>Nome do Usuário</td><td>${CONFIG.currentUser.name}</td></tr>
                <tr><td>ID do Usuário</td><td>${CONFIG.currentUser.id}</td></tr>
                <tr><td>Tema Atual</td><td>${CONFIG.theme}</td></tr>
                <tr><td>Versão do Sistema</td><td>1.0.0 (MordomoPay)</td></tr>
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

// ========== AUXILIARES ==========

function updateSummaryCards(transactions) {
    let r = 0, d = 0;
    transactions.forEach(t => {
        if (t.tipo === 'entrada' || t.tipo === 'receita') r += t.valor;
        else d += t.valor;
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
        catData[c] = (catData[c] || 0) + t.valor;
    });
    if (typeof createCategoryChart === 'function') createCategoryChart(catData);

    const trendData = {};
    transactions.forEach(t => {
        const date = new Date(t.data);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!trendData[key]) trendData[key] = { receitas: 0, despesas: 0 };
        if (t.tipo === 'entrada' || t.tipo === 'receita') trendData[key].receitas += t.valor;
        else trendData[key].despesas += t.valor;
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

function showDashboard() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('userName').textContent = CONFIG.currentUser.name;
    updateThemeUI();
    navigateToPage('dashboard');
}

function showLoginModal() { document.getElementById('loginModal').classList.add('active'); }
function formatCurrency(v) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0); }
function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', CONFIG.theme);
    const i = document.querySelector('#themeToggle i');
    if (i) i.className = CONFIG.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

async function handleLogin() {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPassword').value;
    try {
        let q = supabaseClient.from('usuarios').select('*');
        if (u.includes('@')) q = q.eq('email', u);
        else q = q.eq('celular', u.replace(/\D/g, ''));
        const { data: users, error } = await q;
        if (error || !users || users.length === 0 || users[0].senha !== p) {
            alert('Usuário ou senha incorretos');
            return;
        }
        saveUser(users[0].id, users[0].nome, users[0].celular);
        showDashboard();
    } catch (err) { alert('Erro ao realizar login'); }
}

function handleLogout() { localStorage.removeItem('mordomoPay_user'); location.reload(); }
