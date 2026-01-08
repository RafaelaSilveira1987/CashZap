// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 [APP] Inicializando aplicação...');
    
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
    // Toggle Sidebar
    const toggleBtn = document.getElementById('toggleSidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn) toggleBtn.onclick = () => sidebar.classList.toggle('collapsed');
    if (mobileToggle) mobileToggle.onclick = () => sidebar.classList.toggle('active');

    // Navegação entre Abas
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('data-page');
            navigateToPage(pageId);
            
            // Fechar sidebar no mobile após clicar
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
            }
        };
    });

    // Tema
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
    
    // Atualizar Menu Ativo
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Atualizar Título da Página
    const titles = {
        'dashboard': 'Dashboard',
        'receitas': 'Minhas Receitas',
        'despesas': 'Minhas Despesas',
        'transacoes': 'Histórico de Transações',
        'categorias': 'Categorias',
        'relatorios': 'Relatórios Financeiros',
        'usuarios': 'Gestão de Usuários',
        'configuracoes': 'Configurações do Sistema'
    };
    document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard';

    // Mostrar/Esconder Páginas (Simulação de SPA)
    const contentArea = document.getElementById('content');
    
    // Se for dashboard, carrega a estrutura padrão
    if (pageId === 'dashboard') {
        renderDashboardLayout();
        loadDashboardData();
    } else {
        // Para outras abas, renderiza um layout de tabela genérico ou específico
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
                    <div class="card-content">
                        <h3>Receitas</h3>
                        <p class="card-value" id="totalReceitas">R$ 0,00</p>
                    </div>
                </div>
                <div class="card card-despesas">
                    <div class="card-icon"><i class="fas fa-arrow-down"></i></div>
                    <div class="card-content">
                        <h3>Despesas</h3>
                        <p class="card-value" id="totalDespesas">R$ 0,00</p>
                    </div>
                </div>
                <div class="card card-saldo">
                    <div class="card-icon"><i class="fas fa-wallet"></i></div>
                    <div class="card-content">
                        <h3>Saldo</h3>
                        <p class="card-value" id="saldo">R$ 0,00</p>
                    </div>
                </div>
                <div class="card card-saude">
                    <div class="card-icon"><i class="fas fa-heart-pulse"></i></div>
                    <div class="card-content">
                        <h3>Saúde Financeira</h3>
                        <div class="health-meter">
                            <div class="health-bar"><div class="health-fill" id="healthFill" style="width: 0%"></div></div>
                            <p class="card-value" id="healthScore">0%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="charts-section">
                <div class="chart-container">
                    <h3>Despesas por Categoria</h3>
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>Tendências Mensais</h3>
                    <canvas id="trendChart"></canvas>
                </div>
            </div>

            <div class="transactions-section">
                <div class="section-header">
                    <h3>Transações Recentes</h3>
                </div>
                <div class="table-container">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Tipo</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody id="transactionsBody">
                            <tr><td colspan="5" class="no-data">Carregando...</td></tr>
                        </tbody>
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
                <div class="section-header">
                    <h3>Listagem de ${pageId.charAt(0).toUpperCase() + pageId.slice(1)}</h3>
                </div>
                <div class="table-container">
                    <table class="transactions-table">
                        <thead>
                            <tr id="tableHeader">
                                <th>Carregando...</th>
                            </tr>
                        </thead>
                        <tbody id="pageTableBody">
                            <tr><td class="no-data">Buscando informações no banco de dados...</td></tr>
                        </tbody>
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
        
        // 1. Atualizar Cards
        updateSummaryCards(transactions);
        
        // 2. Renderizar Gráficos
        renderDashboardCharts(transactions);
        
        // 3. Listar Transações Recentes
        renderRecentTransactionsTable(transactions);
        
    } catch (err) {
        console.error('❌ [DATA] Erro ao carregar dashboard:', err);
    }
}

function updateSummaryCards(transactions) {
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    transactions.forEach(t => {
        const valor = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada' || t.tipo === 'receita') totalReceitas += valor;
        else if (t.tipo === 'saida' || t.tipo === 'despesa') totalDespesas += valor;
    });
    
    const saldo = totalReceitas - totalDespesas;
    const healthScore = totalReceitas > 0 ? Math.min(100, Math.max(0, Math.round((saldo / totalReceitas) * 100))) : 0;

    document.getElementById('totalReceitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('totalDespesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('saldo').textContent = formatCurrency(saldo);
    document.getElementById('healthScore').textContent = `${healthScore}%`;
    
    const healthFill = document.getElementById('healthFill');
    if (healthFill) healthFill.style.width = `${healthScore}%`;
}

function renderDashboardCharts(transactions) {
    // Gráfico de Categorias
    const categoryData = {};
    transactions.filter(t => t.tipo === 'saida' || t.tipo === 'despesa').forEach(t => {
        const cat = t.categoria_trasacoes?.descricao || 'Outros';
        categoryData[cat] = (categoryData[cat] || 0) + parseFloat(t.valor);
    });
    
    if (typeof createCategoryChart === 'function') createCategoryChart(categoryData);

    // Gráfico de Tendências
    const trendData = {};
    transactions.forEach(t => {
        const date = new Date(t.data);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!trendData[key]) trendData[key] = { receitas: 0, despesas: 0 };
        const valor = parseFloat(t.valor) || 0;
        if (t.tipo === 'entrada' || t.tipo === 'receita') trendData[key].receitas += valor;
        else trendData[key].despesas += valor;
    });

    if (typeof createTrendChart === 'function') createTrendChart(trendData);
}

function renderRecentTransactionsTable(transactions) {
    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Nenhuma transação encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.slice(0, 8).map(t => `
        <tr>
            <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
            <td>${t.descricao}</td>
            <td>${t.categoria_trasacoes?.descricao || 'Sem categoria'}</td>
            <td><span class="badge ${t.tipo === 'entrada' || t.tipo === 'receita' ? 'receita' : 'despesa'}">${t.tipo}</span></td>
            <td class="${t.tipo === 'entrada' || t.tipo === 'receita' ? 'text-success' : 'text-danger'}">${formatCurrency(t.valor)}</td>
        </tr>
    `).join('');
}

async function loadPageSpecificData(pageId) {
    const userId = CONFIG.currentUser.id;
    const header = document.getElementById('tableHeader');
    const tbody = document.getElementById('pageTableBody');
    
    try {
        if (pageId === 'receitas' || pageId === 'despesas') {
            const type = pageId === 'receitas' ? 'entrada' : 'saida';
            const data = await getTransactionsByType(userId, type);
            
            header.innerHTML = `<th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th>`;
            tbody.innerHTML = data.length ? data.map(t => `
                <tr>
                    <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
                    <td>${t.descricao}</td>
                    <td>${t.categoria_trasacoes?.descricao || '---'}</td>
                    <td class="${pageId === 'receitas' ? 'text-success' : 'text-danger'}">${formatCurrency(t.valor)}</td>
                </tr>
            `).join('') : '<tr><td colspan="4" class="no-data">Nenhum registro encontrado</td></tr>';
        }
        // Adicionar outras abas conforme necessário...
    } catch (err) {
        console.error(`Erro ao carregar dados de ${pageId}:`, err);
    }
}

// ========== AUXILIARES ==========

function showDashboard() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('userName').textContent = CONFIG.currentUser.name;
    updateThemeUI();
    navigateToPage('dashboard');
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', CONFIG.theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = CONFIG.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

async function handleLogin() {
    const userInput = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    try {
        let query = supabaseClient.from('usuarios').select('*');
        if (userInput.includes('@')) query = query.eq('email', userInput);
        else query = query.eq('celular', userInput.replace(/\D/g, ''));

        const { data: users, error } = await query;
        if (error) throw error;
        if (!users || users.length === 0 || users[0].senha !== password) {
            alert('Usuário ou senha incorretos');
            return;
        }

        saveUser(users[0].id, users[0].nome, users[0].celular);
        showDashboard();
    } catch (err) {
        console.error(err);
        alert('Erro ao realizar login');
    }
}

function handleLogout() {
    localStorage.removeItem('granaZap_user');
    location.reload();
}
