// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 [APP] Inicializando aplicação...');
    
    // Inicializar Supabase
    if (typeof initSupabase === 'function') {
        initSupabase();
    }

    // Verificar se o usuário está logado
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

    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateToPage(page);
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

// ========== AUTENTICAÇÃO ==========

async function handleLogin() {
    const userInput = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value;
    
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
            showLoginError('Usuário não encontrado');
            return;
        }

        const user = users[0];
        if (user.senha !== password) {
            showLoginError('Senha incorreta');
            return;
        }

        // Sucesso
        saveUser(user.id, user.nome, user.celular);
        showDashboard();
        showNotification('Bem-vindo!', 'success');
    } catch (err) {
        console.error(err);
        showLoginError('Erro ao conectar com o servidor');
    }
}

function handleLogout() {
    localStorage.removeItem('granaZap_user');
    location.reload();
}

// ========== TRANSIÇÕES DE TELA ==========

function showDashboard() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('userName').textContent = CONFIG.currentUser.name;
    updateThemeUI();
    loadDashboardData();
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
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

// ========== NAVEGAÇÃO E CARREGAMENTO DE DADOS ==========

function navigateToPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    document.getElementById('pageTitle').textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    
    if (pageId === 'dashboard') loadDashboardData();
}

async function loadDashboardData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    console.log('📊 [APP] Carregando dados do dashboard...');
    try {
        await updateSummaryCards();
        await renderDashboardCharts();
        await loadRecentTransactions();
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
    }
}

// ========== FUNÇÕES DE INTERFACE (PONTE COM SUPABASE/CHARTS) ==========

async function updateSummaryCards() {
    const userId = CONFIG.currentUser.id;
    const transactions = await getTransactions(userId);
    
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    transactions.forEach(t => {
        if (t.tipo === 'receita') totalReceitas += t.valor;
        else if (t.tipo === 'despesa') totalDespesas += t.valor;
    });
    
    const saldo = totalReceitas - totalDespesas;
    const healthScore = totalReceitas > 0 ? Math.min(100, Math.round((saldo / totalReceitas) * 100)) : 0;

    document.getElementById('totalReceitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('totalDespesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('saldo').textContent = formatCurrency(saldo);
    document.getElementById('healthScore').textContent = `${healthScore}%`;
    document.getElementById('healthFill').style.width = `${healthScore}%`;
}

async function renderDashboardCharts() {
    const userId = CONFIG.currentUser.id;
    const transactions = await getTransactions(userId);
    
    // Processar dados para gráfico de categorias
    const categoryData = {};
    transactions.filter(t => t.tipo === 'despesa').forEach(t => {
        const cat = t.categoria_trasacoes?.descricao || 'Outros';
        categoryData[cat] = (categoryData[cat] || 0) + t.valor;
    });
    
    if (typeof createCategoryChart === 'function') {
        createCategoryChart(categoryData);
    }

    // Processar dados para gráfico de tendências (simplificado)
    const trendData = {};
    transactions.forEach(t => {
        const date = new Date(t.data);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!trendData[key]) trendData[key] = { receitas: 0, despesas: 0 };
        if (t.tipo === 'receita') trendData[key].receitas += t.valor;
        else trendData[key].despesas += t.valor;
    });

    if (typeof createTrendChart === 'function') {
        createTrendChart(trendData);
    }
}

async function loadRecentTransactions() {
    const userId = CONFIG.currentUser.id;
    const transactions = await getTransactions(userId);
    const tbody = document.getElementById('transactionsBody');
    
    if (!tbody) return;
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Nenhuma transação encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.slice(0, 5).map(t => `
        <tr>
            <td>${new Date(t.data).toLocaleDateString()}</td>
            <td>${t.descricao}</td>
            <td>${t.categoria_trasacoes?.descricao || 'Sem categoria'}</td>
            <td><span class="badge ${t.tipo}">${t.tipo}</span></td>
            <td class="${t.tipo === 'receita' ? 'text-success' : 'text-danger'}">${formatCurrency(t.valor)}</td>
        </tr>
    `).join('');
}

function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', CONFIG.theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = CONFIG.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
