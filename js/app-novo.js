console.log('🚀 [APP] Inicializando aplicacao...');

// ========== INICIALIZAÇÃO ==========

function initializeApp() {
    console.log('🔧 [APP] Inicializando aplicação...');
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [APP] Supabase não configurado');
        return;
    }
    
    // Verificar se usuário está logado
    if (CONFIG.currentUser.id) {
        console.log('✅ [APP] Usuário logado:', CONFIG.currentUser.name);
        showDashboard();
    } else {
        console.log('👤 [APP] Usuario nao logado, mostrando tela de login');
        showLoginModal();
    }
    
    // Configurar event listeners
    setupSidebar();
    setupTheme();
    setupPeriodFilters();
    setupForms();
}

// ========== SIDEBAR ==========

function setupSidebar() {
    console.log('[SIDEBAR] Configurando sidebar...');
    const toggleBtn = document.getElementById('toggleSidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn) {
        console.log('   Botao toggle encontrado');
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[SIDEBAR] Toggle clicado');
            sidebar.classList.toggle('collapsed');
        });
    }
    
    if (mobileToggle) {
        console.log('   Botao mobile encontrado');
        mobileToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[SIDEBAR] Mobile toggle clicado');
            sidebar.classList.toggle('active');
        });
    }
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// ========== TEMA ==========

function setupTheme() {
    console.log('🌛 [THEME] Configurando tema...');
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        console.log('   Botao de tema encontrado');
        updateThemeButton();
        
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🌛 [THEME] Clique no botao de tema detectado');
            const newTheme = CONFIG.theme === 'light' ? 'dark' : 'light';
            console.log('   Alternando para:', newTheme);
            saveTheme(newTheme);
            updateThemeButton();
            if (typeof updateChartColors === 'function') {
                updateChartColors();
            }
        });
    } else {
        console.warn('   ⚠️ Botao de tema nao encontrado');
    }
}

function updateThemeButton() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (CONFIG.theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Tema Claro';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Tema Escuro';
    }
}

// ========== FILTROS DE PERÍODO ==========

function setupPeriodFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const customDateRange = document.getElementById('customDateRange');
    const applyDateRangeBtn = document.getElementById('applyDateRange');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            
            if (period === 'custom') {
                customDateRange.style.display = 'flex';
            } else {
                customDateRange.style.display = 'none';
                CONFIG.period.type = period;
                loadDashboardData();
            }
        });
    });
    
    if (applyDateRangeBtn) {
        applyDateRangeBtn.addEventListener('click', function() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (!startDate || !endDate) {
                showNotification('Selecione as datas inicial e final', 'error');
                return;
            }
            
            CONFIG.period.type = 'custom';
            CONFIG.period.startDate = startDate;
            CONFIG.period.endDate = endDate;
            
            loadDashboardData();
        });
    }
}

// ========== NAVEGAÇÃO ==========

function showPage(pageName) {
    console.log('📄 [NAV] Navegando para:', pageName);
    
    // Ocultar todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Mostrar página selecionada
    const page = document.getElementById(pageName + 'Page');
    if (page) {
        page.style.display = 'block';
    }
    
    // Atualizar nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item')?.classList.add('active');
    
    // Atualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'receitas': 'Receitas',
        'despesas': 'Despesas',
        'transacoes': 'Transações',
        'categorias': 'Categorias',
        'relatorios': 'Relatórios',
        'usuarios': 'Usuários',
        'configuracoes': 'Configurações'
    };
    
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
    
    // Carregar dados da página
    loadPageData(pageName);
}

async function loadPageData(pageName) {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        switch(pageName) {
            case 'dashboard':
                await loadDashboardData();
                break;
            case 'receitas':
                await loadReceitasData();
                break;
            case 'despesas':
                await loadDespesasData();
                break;
            case 'transacoes':
                await loadTransacoesData();
                break;
            case 'usuarios':
                await loadUsuariosData();
                break;
        }
    } catch (error) {
        console.error('Erro ao carregar dados da página:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
}

// ========== LOGIN E CADASTRO ==========

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';
    initializeUI();
    loadDashboardData();
}

function redirectToWhatsAppSignup() {
    console.log('📱 [SIGNUP] Redirecionando para WhatsApp...');
    const whatsappNumber = '553298416669';
    const message = 'Olá, gostaria de me cadastrar no GranaZap';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

async function handleLogin() {
    console.log('🔐 [LOGIN] Iniciando login...');
    
    const userInput = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    errorDiv.style.display = 'none';
    
    if (!userInput || !password) {
        showLoginError('Preencha todos os campos');
        return;
    }
    
    if (!isSupabaseConfigured()) {
        showLoginError('Supabase não configurado');
        return;
    }
    
    try {
        console.log('🔍 [LOGIN] Buscando usuário...');
        
        // Buscar usuário por celular ou email
        let query = supabaseClient
            .from('usuarios')
            .select('*');
        
        // Verificar se é celular ou email
        if (userInput.includes('@')) {
            query = query.eq('email', userInput);
        } else {
            // Remover caracteres especiais do celular
            const celularLimpo = userInput.replace(/\D/g, '');
            query = query.eq('celular', celularLimpo);
        }
        
        const { data: users, error } = await query;
        
        if (error) {
            console.error('❌ [LOGIN] Erro ao buscar usuário:', error);
            showLoginError('Erro ao buscar usuário');
            return;
        }
        
        if (!users || users.length === 0) {
            console.error('❌ [LOGIN] Usuário não encontrado');
            showLoginError('Usuário não encontrado. Cadastre-se via WhatsApp primeiro!');
            return;
        }
        
        const user = users[0];
        console.log('✅ [LOGIN] Usuário encontrado:', user.nome);
        
        // Verificar se usuário tem senha definida
        if (!user.senha) {
            console.log('🔐 [LOGIN] Primeira vez - mostrar tela de criação de senha');
            showSetPasswordForm(user);
            return;
        }
        
        // Validar senha (em produção, usar hash bcrypt)
        if (user.senha !== password) {
            console.error('❌ [LOGIN] Senha incorreta');
            showLoginError('Senha incorreta');
            return;
        }
        
        // Login bem-sucedido
        console.log('✅ [LOGIN] Login bem-sucedido');
        saveUser(user.id, user.nome, user.celular);
        showNotification('Login realizado com sucesso!', 'success');
        showDashboard();
        
    } catch (error) {
        console.error('❌ [LOGIN] Erro:', error);
        showLoginError('Erro ao fazer login: ' + error.message);
    }
}

function showSetPasswordForm(user) {
    console.log('🔐 [PASSWORD] Mostrando formulário de criação de senha');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('setPasswordForm').style.display = 'block';
    document.getElementById('setPasswordForm').dataset.userId = user.id;
    document.getElementById('setPasswordForm').dataset.userName = user.nome;
    document.getElementById('setPasswordForm').dataset.userCelular = user.celular;
}

async function handleSetPassword() {
    console.log('🔐 [PASSWORD] Criando senha...');
    
    const form = document.getElementById('setPasswordForm');
    const userId = form.dataset.userId;
    const userName = form.dataset.userName;
    const userCelular = form.dataset.userCelular;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!newPassword || !confirmPassword) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('A senha deve ter no mínimo 8 caracteres', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('As senhas não correspondem', 'error');
        return;
    }
    
    try {
        console.log('💾 [PASSWORD] Salvando senha no Supabase...');
        
        const { error } = await supabaseClient
            .from('usuarios')
            .update({ senha: newPassword })
            .eq('id', userId);
        
        if (error) {
            console.error('❌ [PASSWORD] Erro ao salvar:', error);
            showNotification('Erro ao salvar senha', 'error');
            return;
        }
        
        console.log('✅ [PASSWORD] Senha criada com sucesso');
        saveUser(userId, userName, userCelular);
        showNotification('Senha criada com sucesso!', 'success');
        
        // Mostrar dashboard
        setTimeout(() => {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('setPasswordForm').style.display = 'none';
            showDashboard();
        }, 1500);
        
    } catch (error) {
        console.error('❌ [PASSWORD] Erro:', error);
        showNotification('Erro ao criar senha: ' + error.message, 'error');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    showNotification(message, 'error');
}

function handleLogout() {
    console.log('🚪 [LOGOUT] Fazendo logout...');
    clearUser();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('setPasswordForm').style.display = 'none';
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPassword').value = '';
    showLoginModal();
}

// ========== CARREGAMENTO DE DADOS ==========

async function loadDashboardData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        const { startDate, endDate } = getPeriodDates(CONFIG.period.type);
        
        // Calcular totais
        const totals = await calculateTotals(
            CONFIG.currentUser.id,
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        
        // Atualizar cards
        document.getElementById('totalReceitas').textContent = formatCurrency(totals.receitas);
        document.getElementById('totalDespesas').textContent = formatCurrency(totals.despesas);
        document.getElementById('saldo').textContent = formatCurrency(totals.saldo);
        
        // Calcular e atualizar saúde financeira
        const healthScore = calculateFinancialHealth(totals.receitas, totals.despesas);
        document.getElementById('healthScore').textContent = healthScore;
        document.getElementById('healthFill').style.width = `${healthScore}%`;
        document.getElementById('healthLabel').textContent = getHealthMessage(healthScore);
        
        // Carregar despesas por categoria
        const expensesByCategory = await calculateExpensesByCategory(
            CONFIG.currentUser.id,
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        createCategoryChart(expensesByCategory);
        
        // Carregar tendências mensais
        const monthlyTrends = await calculateMonthlyTrends(CONFIG.currentUser.id);
        createTrendChart(monthlyTrends);
        
        // Carregar transações recentes
        const transactions = await getTransactions(
            CONFIG.currentUser.id,
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        renderTransactionsTable(transactions.slice(0, 10), 'transactionsBody');
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dados do dashboard', 'error');
    }
}

async function loadReceitasData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        console.log('📥 [APP] Carregando receitas...');
        const { startDate, endDate } = getPeriodDates(CONFIG.period.type);
        
        const receitas = await getTransactionsByType(
            CONFIG.currentUser.id,
            'entrada',
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        
        console.log('✅ [APP] Receitas carregadas:', receitas.length);
        renderTransactionsTable(receitas, 'receitasBody');
    } catch (error) {
        console.error('❌ [APP] Erro ao carregar receitas:', error);
        showNotification('Erro ao carregar receitas', 'error');
    }
}

async function loadDespesasData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        const { startDate, endDate } = getPeriodDates(CONFIG.period.type);
        
        const despesas = await getTransactionsByType(
            CONFIG.currentUser.id,
            'saida',
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        
        renderTransactionsTable(despesas, 'despesasBody');
    } catch (error) {
        console.error('Erro ao carregar despesas:', error);
        showNotification('Erro ao carregar despesas', 'error');
    }
}

async function loadTransacoesData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        const transactions = await getTransactions(CONFIG.currentUser.id);
        renderTransactionsTable(transactions, 'transacoesBody');
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        showNotification('Erro ao carregar transações', 'error');
    }
}

async function loadUsuariosData() {
    if (!isSupabaseConfigured()) return;
    
    try {
        const { data: usuarios, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        const tbody = document.getElementById('usuariosBody');
        tbody.innerHTML = '';
        
        usuarios.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>${user.celular}</td>
                <td><span class="badge badge-${user.status === 'ativo' ? 'success' : 'danger'}">${user.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários', 'error');
    }
}

// ========== FUNÇÕES AUXILIARES ==========

function renderTransactionsTable(transactions, tableId) {
    const tbody = document.getElementById(tableId);
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Nenhuma transação encontrada</td></tr>';
        return;
    }
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const categoryName = transaction.categoria_trasacoes?.descricao || 'Sem categoria';
        const isReceita = transaction.tipo === 'entrada';
        
        row.innerHTML = `
            <td>${formatDate(transaction.data)}</td>
            <td>${transaction.descricao}</td>
            <td>${categoryName}</td>
            <td><span class="badge badge-${isReceita ? 'success' : 'danger'}">${isReceita ? 'Receita' : 'Despesa'}</span></td>
            <td style="color: ${isReceita ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: bold;">
                ${isReceita ? '+' : '-'} ${formatCurrency(transaction.valor)}
            </td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="editTransaction(${transaction.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTransaction(${transaction.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function initializeUI() {
    console.log('⚙️ [UI] Inicializando interface...');
    setupSidebar();
    setupTheme();
    setupPeriodFilters();
    setupForms();
}

function setupForms() {
    console.log('📋 [FORMS] Configurando formulários...');
}

function getPeriodDates(period) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    switch(period) {
        case 'today':
            return {
                startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
            };
        case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            return {
                startDate: weekStart,
                endDate: now
            };
        case 'month':
            return { startDate: startOfMonth, endDate: endOfMonth };
        case 'custom':
            return {
                startDate: CONFIG.period.startDate ? new Date(CONFIG.period.startDate) : startOfMonth,
                endDate: CONFIG.period.endDate ? new Date(CONFIG.period.endDate) : endOfMonth
            };
        default:
            return { startDate: startOfMonth, endDate: endOfMonth };
    }
}

function calculateFinancialHealth(receitas, despesas) {
    if (receitas === 0) return 0;
    const ratio = (receitas - despesas) / receitas;
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function getHealthMessage(score) {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    if (score >= 20) return 'Preocupante';
    return 'Crítico';
}

// ========== INICIALIZAR AO CARREGAR ==========
window.addEventListener('DOMContentLoaded', initializeApp);
