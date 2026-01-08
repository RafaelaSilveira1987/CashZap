// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 [APP] Inicializando aplicação...');
    
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
        };
    }
}

// ========== AUTENTICAÇÃO ==========

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
    loadDashboardData();
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
}

function showLoginError(msg) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
}

// ========== NAVEGAÇÃO E DADOS ==========

function navigateToPage(pageId) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    document.getElementById('pageTitle').textContent = pageId.charAt(0).toUpperCase() + pageId.slice(1);
    
    // Aqui você pode adicionar lógica para carregar dados específicos de cada página
    if (pageId === 'dashboard') loadDashboardData();
}

async function loadDashboardData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    console.log('📊 [APP] Carregando dados do dashboard...');
    // Chamar funções de outros arquivos (supabase.js, charts.js)
    try {
        await updateSummaryCards();
        await renderCharts();
        await loadRecentTransactions();
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
    }
}

function updateThemeUI() {
    document.documentElement.setAttribute('data-theme', CONFIG.theme);
    const icon = document.querySelector('#themeToggle i');
    if (icon) icon.className = CONFIG.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
