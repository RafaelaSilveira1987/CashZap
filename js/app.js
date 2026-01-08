// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 [APP] Inicializando aplicacao...');
    
    // Configurar botoes de login e configuracao
    setupLoginButtons();
    
    // Verificar se o usuario esta logado
    if (!CONFIG.currentUser.id) {
        console.log('👤 [APP] Usuario nao logado, mostrando tela de login');
        showLoginModal();
        return;
    }
    
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
        showNotification('Configure o Supabase nas configurações', 'error');
    }
    
    // Inicializar interface
    initializeUI();
    
    // Carregar dados iniciais
    loadDashboardData();
}

function initializeUI() {
    // Configurar nome do usuário
    document.getElementById('userName').textContent = CONFIG.currentUser.name;
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar sidebar
    setupSidebar();
    
    // Configurar tema
    setupTheme();
    
    // Configurar filtros de período
    setupPeriodFilters();
    
    // Configurar modais
    setupModals();
    
    // Configurar formulários
    setupForms();
    
    // Configurar botões
    setupButtons();
}

// ========== NAVEGAÇÃO ==========

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

function navigateToPage(pageName) {
    // Atualizar menu ativo
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });
    
    // Atualizar página ativa
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const activePage = document.getElementById(`${pageName}-page`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
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
            case 'categorias':
                await loadCategoriasData();
                break;
            case 'relatorios':
                await loadRelatoriosData();
                break;
            case 'usuarios':
                await loadUsuariosData();
                break;
            case 'configuracoes':
                await loadConfiguracoesData();
                break;
        }
    } catch (error) {
        console.error('Erro ao carregar dados da página:', error);
        showNotification('Erro ao carregar dados', 'error');
    }
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
        // Atualizar ícone e texto do botão
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

// ========== MODAIS ==========

function setupModals() {
    // Modal de transação
    const transactionModal = document.getElementById('transactionModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => hideModal('transactionModal'));
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => hideModal('transactionModal'));
    }
    
    // Modal de categoria
    const categoryModal = document.getElementById('categoryModal');
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
    
    if (closeCategoryModal) {
        closeCategoryModal.addEventListener('click', () => hideModal('categoryModal'));
    }
    
    if (cancelCategoryBtn) {
        cancelCategoryBtn.addEventListener('click', () => hideModal('categoryModal'));
    }
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function setupLoginButtons() {
    console.log('🔘 [APP] Configurando botoes de login...');
    
    const configBeforeLoginBtn = document.getElementById('configBeforeLoginBtn');
    if (configBeforeLoginBtn) {
        configBeforeLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('⚙️ [APP] Abrindo modal de configuracao antes do login');
            hideModal('loginModal');
            showModal('configBeforeLoginModal');
        });
    }
    
    const closeConfigBeforeLoginModal = document.getElementById('closeConfigBeforeLoginModal');
    if (closeConfigBeforeLoginModal) {
        closeConfigBeforeLoginModal.addEventListener('click', function() {
            console.log('❌ [APP] Fechando modal de configuracao');
            hideModal('configBeforeLoginModal');
            showModal('loginModal');
        });
    }
    
    const cancelConfigBeforeLoginBtn = document.getElementById('cancelConfigBeforeLoginBtn');
    if (cancelConfigBeforeLoginBtn) {
        cancelConfigBeforeLoginBtn.addEventListener('click', function() {
            console.log('❌ [APP] Cancelando configuracao');
            hideModal('configBeforeLoginModal');
            showModal('loginModal');
        });
    }
    
    const configBeforeLoginForm = document.getElementById('configBeforeLoginForm');
    if (configBeforeLoginForm) {
        configBeforeLoginForm.addEventListener('submit', handleConfigBeforeLogin);
    }
}

async function handleConfigBeforeLogin(e) {
    e.preventDefault();
    console.log('💾 [APP] Salvando configuracoes antes do login...');
    
    const url = document.getElementById('configBeforeLoginUrl').value.trim();
    const key = document.getElementById('configBeforeLoginKey').value.trim();
    
    if (!url || !key) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    try {
        saveSupabaseConfig(url, key);
        showNotification('Configuracoes salvas com sucesso!', 'success');
        console.log('✅ [APP] Configuracoes salvas, voltando ao login');
        
        setTimeout(() => {
            hideModal('configBeforeLoginModal');
            showModal('loginModal');
        }, 1000);
    } catch (error) {
        console.error('❌ [APP] Erro ao salvar configuracoes:', error);
        showNotification('Erro ao salvar configuracoes', 'error');
    }
}

function showLoginModal() {
    showModal('loginModal');
}

// ========== FORMULÁRIOS ==========

function setupForms() {
    console.log('📋 [FORMS] Configurando formulários...');
    
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('   Adicionando evento submit ao formulário de login');
        loginForm.addEventListener('submit', function(e) {
            console.log('🔐 [FORMS] Evento submit disparado');
            handleLogin(e);
        });
    } else {
        console.warn('   ⚠️ Formulário de login não encontrado');
    }
    
    // Formulário de transação
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', handleTransactionSubmit);
    }
    
    // Formulário de categoria
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }
}


async function forceLogin(phoneNumber) {
    console.log("\n" + "=".repeat(60));
    console.log("Forcando login via console");
    console.log("=".repeat(60));
    console.log("Numero:", phoneNumber);
    
    if (!phoneNumber) {
        console.error("Numero nao fornecido");
        return;
    }
    
    if (!isSupabaseConfigured()) {
        console.error("Supabase nao configurado");
        return;
    }
    
    try {
        console.log("Buscando usuario...");
        const user = await getUserByPhone(phoneNumber);
        
        if (!user) {
            console.error("Usuario nao encontrado");
            return;
        }
        
        console.log("Usuario encontrado:", user);
        
        if (user.status !== "ativo") {
            console.error("Usuario nao ativo:", user.status);
            return;
        }
        
        console.log("Salvando usuario...");
        saveUser(user.id, user.nome || user.celular);
        
        console.log("Ocultando modal...");
        hideModal("loginModal");
        
        console.log("Inicializando aplicacao...");
        initializeUI();
        loadDashboardData();
        
        showNotification("Login realizado!", "success");
        console.log("Login concluido!");
    } catch (error) {
        console.error("Erro:", error);
    }
}

window.forceLogin = forceLogin;

async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 [LOGIN] Iniciando processo de login...');
    
    const userInput = document.getElementById('loginUser').value.trim();
    console.log('   Entrada do usuário:', userInput);
    
    if (!userInput) {
        console.error('❌ [LOGIN] Entrada vazia');
        showNotification('Digite um ID ou telefone', 'error');
        return;
    }
    
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
        console.error('❌ [LOGIN] Supabase não configurado');
        showNotification('Supabase não inicializado. Verifique as configurações.', 'error');
        return;
    }
    
    try {
        let user = null;
        console.log('🔍 [LOGIN] Procurando usuário...');
        
        // Tentar buscar por ID (se for apenas números e pequeno)
        if (!isNaN(userInput) && userInput.length < 5) {
            console.log('   Tentando buscar por ID:', userInput);
            try {
                user = await getUserById(parseInt(userInput));
                if (user) {
                    console.log('✅ [LOGIN] Usuário encontrado por ID:', user);
                }
            } catch (e) {
                console.log('   ID não encontrado, tentando celular...');
                user = null;
            }
        }
        
        // Se não encontrou por ID, tentar por Celular (número completo)
        if (!user) {
            console.log('   Tentando buscar por celular:', userInput);
            try {
                user = await getUserByPhone(userInput);
                if (user) {
                    console.log('✅ [LOGIN] Usuário encontrado por celular:', user);
                } else {
                    console.error('❌ [LOGIN] Usuário não encontrado por celular');
                }
            } catch (error) {
                console.error('❌ [LOGIN] Erro ao buscar por celular:', error.message);
                throw error;
            }
        }
        
        // Validar status do usuário
        if (user) {
            console.log('📋 [LOGIN] Verificando status do usuário:', user.status);
            
            if (user.status === 'ativo') {
                console.log('✅ [LOGIN] Usuário ativo, realizando login...');
                saveUser(user.id, user.nome || user.celular);
                console.log('💾 [LOGIN] Usuário salvo no localStorage');
                
                hideModal('loginModal');
                console.log('🚀 [LOGIN] Inicializando aplicação...');
                initializeApp();
                showNotification('Login realizado com sucesso!', 'success');
                console.log('✅ [LOGIN] Login concluído com sucesso!');
            } else if (user.status === 'inativo') {
                console.warn('⚠️ [LOGIN] Usuário inativo');
                showNotification('Usuário inativo. Entre em contato com o administrador.', 'error');
            } else if (user.status === 'bloqueado') {
                console.warn('⚠️ [LOGIN] Usuário bloqueado');
                showNotification('Usuário bloqueado. Entre em contato com o administrador.', 'error');
            } else if (user.status === 'excluido') {
                console.warn('⚠️ [LOGIN] Usuário excluído');
                showNotification('Usuário excluído do sistema.', 'error');
            } else {
                console.warn('⚠️ [LOGIN] Status desconhecido:', user.status);
                showNotification('Status do usuário desconhecido.', 'error');
            }
        } else {
            console.error('❌ [LOGIN] Usuário não encontrado');
            showNotification('Usuário não encontrado', 'error');
        }
    } catch (error) {
        console.error('❌ [LOGIN] Erro durante o login:', error);
        console.error('   Detalhes:', error.message);
        showNotification('Erro ao fazer login: ' + error.message, 'error');
    }
}

async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) {
        showNotification('Configure o Supabase e faça login', 'error');
        return;
    }
    
    const id = document.getElementById('transactionId').value;
    const descricao = document.getElementById('descricao').value.trim();
    const valor = parseFloat(document.getElementById('valor').value);
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    const categoria_id = parseInt(document.getElementById('categoria').value);
    const pagador = document.getElementById('pagador').value.trim();
    
    if (!descricao || !valor || !data || !tipo || !categoria_id) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const dataObj = new Date(data);
    const mes = dataObj.getMonth() + 1;
    
    const transaction = {
        descricao,
        valor,
        data,
        mes,
        tipo,
        categoria_id,
        pagador,
        usuario_id: CONFIG.currentUser.id
    };
    
    try {
        if (id) {
            // Atualizar transação existente
            await updateTransaction(parseInt(id), CONFIG.currentUser.id, transaction);
            showNotification('Transação atualizada com sucesso!', 'success');
        } else {
            // Inserir nova transação
            await insertTransaction(transaction);
            showNotification('Transação criada com sucesso!', 'success');
        }
        
        hideModal('transactionModal');
        document.getElementById('transactionForm').reset();
        
        // Recarregar dados
        const currentPage = document.querySelector('.nav-item.active').getAttribute('data-page');
        loadPageData(currentPage);
    } catch (error) {
        console.error('Erro ao salvar transação:', error);
        showNotification('Erro ao salvar transação', 'error');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) {
        showNotification('Configure o Supabase e faça login', 'error');
        return;
    }
    
    const descricao = document.getElementById('categoryName').value.trim();
    
    if (!descricao) {
        showNotification('Digite o nome da categoria', 'error');
        return;
    }
    
    const category = {
        descricao,
        usuario_id: CONFIG.currentUser.id
    };
    
    try {
        await insertCategory(category);
        showNotification('Categoria criada com sucesso!', 'success');
        
        hideModal('categoryModal');
        document.getElementById('categoryForm').reset();
        
        // Recarregar categorias
        await loadCategoriasData();
        await loadCategoriesIntoSelect();
    } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        showNotification('Erro ao salvar categoria', 'error');
    }
}

// ========== BOTÕES ==========

function setupButtons() {
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Botões de adicionar transação
    const addTransactionBtns = [
        document.getElementById('addTransactionBtn'),
        document.getElementById('addReceitaBtn'),
        document.getElementById('addDespesaBtn')
    ];
    
    addTransactionBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                openTransactionModal();
            });
        }
    });
    
    // Botão de adicionar categoria
    const addCategoriaBtn = document.getElementById('addCategoriaBtn');
    if (addCategoriaBtn) {
        addCategoriaBtn.addEventListener('click', function() {
            openCategoryModal();
        });
    }
    
    // Botão de salvar configurações do Supabase
    const saveSupabaseConfigBtn = document.getElementById('saveSupabaseConfig');
    if (saveSupabaseConfigBtn) {
        saveSupabaseConfigBtn.addEventListener('click', handleSaveSupabaseConfig);
    }
    
    // Botão de exportar relatório
    const exportReportBtn = document.getElementById('exportReportBtn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', handleExportReport);
    }
}

function handleLogout() {
    clearUser();
    location.reload();
}

function openTransactionModal(transaction = null) {
    const modal = document.getElementById('transactionModal');
    const form = document.getElementById('transactionForm');
    const title = document.getElementById('modalTitle');
    
    // Resetar formulário
    form.reset();
    
    if (transaction) {
        // Editar transação existente
        title.textContent = 'Editar Transação';
        document.getElementById('transactionId').value = transaction.id;
        document.getElementById('descricao').value = transaction.descricao;
        document.getElementById('valor').value = transaction.valor;
        document.getElementById('data').value = formatDateInput(transaction.data);
        document.getElementById('tipo').value = transaction.tipo;
        document.getElementById('categoria').value = transaction.categoria_id;
        document.getElementById('pagador').value = transaction.pagador || '';
    } else {
        // Nova transação
        title.textContent = 'Nova Transação';
        document.getElementById('transactionId').value = '';
        document.getElementById('data').value = formatDateInput(new Date());
    }
    
    // Carregar categorias no select
    loadCategoriesIntoSelect();
    
    showModal('transactionModal');
}

function openCategoryModal() {
    const form = document.getElementById('categoryForm');
    form.reset();
    showModal('categoryModal');
}

async function loadCategoriesIntoSelect() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        const categories = await getCategories(CONFIG.currentUser.id);
        
        const selects = [
            document.getElementById('categoria'),
            document.getElementById('filterCategoria')
        ];
        
        selects.forEach(select => {
            if (!select) return;
            
            // Manter primeira opção
            const firstOption = select.options[0];
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.descricao;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function handleSaveSupabaseConfig() {
    const url = document.getElementById('supabaseUrl').value.trim();
    const key = document.getElementById('supabaseKey').value.trim();
    
    if (!url || !key) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }
    
    saveSupabaseConfig(url, key);
    initSupabase();
    
    showNotification('Configurações salvas com sucesso!', 'success');
    
    // Recarregar dados
    loadDashboardData();
}

function handleExportReport() {
    showNotification('Funcionalidade de exportação em desenvolvimento', 'info');
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
        const { startDate, endDate } = getPeriodDates(CONFIG.period.type);
        
        const transactions = await getTransactions(
            CONFIG.currentUser.id,
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        
        renderTransactionsTable(transactions, 'allTransactionsBody', true);
        
        // Configurar filtros
        setupTransactionFilters(transactions);
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        showNotification('Erro ao carregar transações', 'error');
    }
}

function setupTransactionFilters(allTransactions) {
    const filterTipo = document.getElementById('filterTipo');
    const filterCategoria = document.getElementById('filterCategoria');
    
    const applyFilters = () => {
        const tipo = filterTipo.value;
        const categoria = filterCategoria.value;
        
        let filtered = allTransactions;
        
        if (tipo !== 'all') {
            filtered = filtered.filter(t => t.tipo === tipo);
        }
        
        if (categoria !== 'all') {
            filtered = filtered.filter(t => t.categoria_id === parseInt(categoria));
        }
        
        renderTransactionsTable(filtered, 'allTransactionsBody', true);
    };
    
    filterTipo.addEventListener('change', applyFilters);
    filterCategoria.addEventListener('change', applyFilters);
}

async function loadCategoriasData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        const categories = await getCategories(CONFIG.currentUser.id);
        renderCategoriesGrid(categories);
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        showNotification('Erro ao carregar categorias', 'error');
    }
}

async function loadRelatoriosData() {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        // Dados do mês atual
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const totals = await calculateTotals(
            CONFIG.currentUser.id,
            startOfMonth.toISOString(),
            endOfMonth.toISOString()
        );
        
        document.getElementById('reportReceitas').textContent = formatCurrency(totals.receitas);
        document.getElementById('reportDespesas').textContent = formatCurrency(totals.despesas);
        document.getElementById('reportSaldo').textContent = formatCurrency(totals.saldo);
        
        // Despesas por categoria
        const expensesByCategory = await calculateExpensesByCategory(
            CONFIG.currentUser.id,
            startOfMonth.toISOString(),
            endOfMonth.toISOString()
        );
        createReportCategoryChart(expensesByCategory);
        
        // Fluxo de caixa
        const monthlyTrends = await calculateMonthlyTrends(CONFIG.currentUser.id);
        createReportFlowChart(monthlyTrends);
        
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        showNotification('Erro ao carregar relatórios', 'error');
    }
}

async function loadUsuariosData() {
    if (!isSupabaseConfigured()) return;
    
    try {
        const users = await getAllUsers();
        renderUsersTable(users);
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários', 'error');
    }
}

async function loadConfiguracoesData() {
    // Carregar configurações atuais
    document.getElementById('supabaseUrl').value = CONFIG.supabase.url;
    document.getElementById('supabaseKey').value = CONFIG.supabase.key;
    
    if (!isSupabaseConfigured()) return;
    
    try {
        // Estatísticas gerais
        const users = await getAllUsers();
        const categories = await getCategories(CONFIG.currentUser.id);
        const transactions = await getTransactions(CONFIG.currentUser.id);
        
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalTransactions').textContent = transactions.length;
        document.getElementById('totalCategories').textContent = categories.length;
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// ========== RENDERIZAÇÃO DE TABELAS ==========

function renderTransactionsTable(transactions, tbodyId, showAllColumns = false) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${showAllColumns ? 7 : 6}" class="no-data">Nenhuma transação encontrada</td></tr>`;
        return;
    }
    
    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td>${formatDate(t.data)}</td>
            <td>${t.descricao}</td>
            <td>${t.categoria_trasacoes?.descricao || (Array.isArray(t.categoria_trasacoes) ? t.categoria_trasacoes[0]?.descricao : 'Sem categoria')}</td>
            ${showAllColumns ? `<td><span class="badge badge-${t.tipo}">${t.tipo === 'entrada' ? 'Receita' : 'Despesa'}</span></td>` : ''}
            ${showAllColumns ? `<td>${t.pagador || '-'}</td>` : ''}
            <td style="color: ${t.tipo === 'entrada' ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                ${t.tipo === 'entrada' ? '+' : '-'} ${formatCurrency(t.valor)}
            </td>
            <td>
                <button class="btn-icon" onclick="editTransaction(${t.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteTransactionConfirm(${t.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderCategoriesGrid(categories) {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    if (categories.length === 0) {
        grid.innerHTML = '<p class="no-data">Nenhuma categoria encontrada</p>';
        return;
    }
    
    grid.innerHTML = categories.map(cat => `
        <div class="category-card">
            <div class="category-info">
                <h4>${cat.descricao}</h4>
                <p>ID: ${cat.id}</p>
            </div>
            <button class="btn-icon" onclick="deleteCategoryConfirm(${cat.id})" title="Excluir">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function renderUsersTable(users) {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">Nenhum usuário encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.id}</td>
            <td>${u.nome || '-'}</td>
            <td>${u.celular || '-'}</td>
            <td><span class="badge badge-${u.status}">${u.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td>${formatDate(u.created_at)}</td>
            <td>
                <button class="btn-icon" onclick="toggleUserStatus(${u.id}, '${u.status}')" title="Alterar Status">
                    <i class="fas fa-toggle-${u.status === 'ativo' ? 'on' : 'off'}"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ========== AÇÕES DE TRANSAÇÕES ==========

async function editTransaction(id) {
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        const transactions = await getTransactions(CONFIG.currentUser.id);
        const transaction = transactions.find(t => t.id === id);
        
        if (transaction) {
            openTransactionModal(transaction);
        }
    } catch (error) {
        console.error('Erro ao buscar transação:', error);
        showNotification('Erro ao buscar transação', 'error');
    }
}

async function deleteTransactionConfirm(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
        return;
    }
    
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        await deleteTransaction(id, CONFIG.currentUser.id);
        showNotification('Transação excluída com sucesso!', 'success');
        
        // Recarregar dados
        const currentPage = document.querySelector('.nav-item.active').getAttribute('data-page');
        loadPageData(currentPage);
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        showNotification('Erro ao excluir transação', 'error');
    }
}

// ========== AÇÕES DE CATEGORIAS ==========

async function deleteCategoryConfirm(id) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
        return;
    }
    
    if (!isSupabaseConfigured() || !CONFIG.currentUser.id) return;
    
    try {
        await deleteCategory(id, CONFIG.currentUser.id);
        showNotification('Categoria excluída com sucesso!', 'success');
        
        await loadCategoriasData();
        await loadCategoriesIntoSelect();
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        showNotification('Erro ao excluir categoria', 'error');
    }
}

// ========== AÇÕES DE USUÁRIOS ==========

async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    
    if (!confirm(`Tem certeza que deseja ${newStatus === 'ativo' ? 'ativar' : 'desativar'} este usuário?`)) {
        return;
    }
    
    if (!isSupabaseConfigured()) return;
    
    try {
        await updateUserStatus(userId, newStatus);
        showNotification('Status atualizado com sucesso!', 'success');
        
        await loadUsuariosData();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showNotification('Erro ao atualizar status', 'error');
    }
}
