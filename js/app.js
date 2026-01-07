// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Verificar se o usuário está logado
    if (!CONFIG.currentUser.id) {
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
    const toggleBtn = document.getElementById('toggleSidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

// ========== TEMA ==========

function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        // Atualizar ícone e texto do botão
        updateThemeButton();
        
        themeToggle.addEventListener('click', function() {
            const newTheme = CONFIG.theme === 'light' ? 'dark' : 'light';
            saveTheme(newTheme);
            updateThemeButton();
            updateChartColors();
        });
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

function showLoginModal() {
    showModal('loginModal');
}

// ========== FORMULÁRIOS ==========

function setupForms() {
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
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

async function handleLogin(e) {
    e.preventDefault();
    
    const userInput = document.getElementById('loginUser').value.trim();
    
    if (!userInput) {
        showNotification('Digite um ID ou telefone', 'error');
        return;
    }
    
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
        // Permitir login sem verificação para configurar o Supabase
        saveUser(userInput, userInput);
        hideModal('loginModal');
        initializeApp();
        showNotification('Configure o Supabase nas configurações', 'info');
        return;
    }
    
    try {
        // Tentar buscar usuário por ID
        let user = null;
        
        if (!isNaN(userInput)) {
            user = await getUserById(parseInt(userInput));
        } else {
            user = await getUserByPhone(userInput);
        }
        
        if (user && user.status === 'ativo') {
            saveUser(user.id, user.nome || user.telefone);
            hideModal('loginModal');
            initializeApp();
            showNotification('Login realizado com sucesso!', 'success');
        } else if (user && user.status !== 'ativo') {
            showNotification('Usuário inativo. Entre em contato com o administrador.', 'error');
        } else {
            showNotification('Usuário não encontrado', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro ao fazer login', 'error');
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
        const { startDate, endDate } = getPeriodDates(CONFIG.period.type);
        
        const receitas = await getTransactionsByType(
            CONFIG.currentUser.id,
            'entrada',
            startDate ? startDate.toISOString() : null,
            endDate ? endDate.toISOString() : null
        );
        
        renderTransactionsTable(receitas, 'receitasBody');
    } catch (error) {
        console.error('Erro ao carregar receitas:', error);
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
            <td>${t.categoria_trasacoes?.descricao || 'Sem categoria'}</td>
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
