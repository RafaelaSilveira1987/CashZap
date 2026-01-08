// ========== FUNÇÕES DE TRANSIÇÃO DE TELA ==========

function showDashboard() {
    console.log('🖥️ [UI] Mostrando Dashboard...');
    const loginModal = document.getElementById('loginModal');
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    if (loginModal) loginModal.style.display = 'none';
    if (dashboardContainer) {
        dashboardContainer.style.display = 'flex';
        // Inicializar componentes do dashboard
        if (typeof initializeUI === 'function') initializeUI();
        if (typeof loadDashboardData === 'function') loadDashboardData();
    }
}

function showLoginModal() {
    console.log('👤 [UI] Mostrando Tela de Login...');
    const loginModal = document.getElementById('loginModal');
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    if (loginModal) loginModal.style.display = 'flex';
    if (dashboardContainer) dashboardContainer.style.display = 'none';
}

// ========== LOGIN ATUALIZADO COM CORREÇÃO ==========

async function handleLogin() {
    console.log('🔐 [LOGIN] Iniciando login...');
    
    const userInputField = document.getElementById('loginUser');
    const passwordField = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    
    if (!userInputField || !passwordField) {
        console.error('❌ [LOGIN] Campos de login não encontrados no DOM');
        return;
    }

    const userInput = userInputField.value.trim();
    const password = passwordField.value;
    
    if (errorDiv) errorDiv.style.display = 'none';
    
    if (!userInput || !password) {
        showLoginError('Preencha todos os campos');
        return;
    }
    
    try {
        // Buscar usuário por celular ou email
        let query = supabaseClient.from('usuarios').select('*');
        
        if (userInput.includes('@')) {
            query = query.eq('email', userInput);
        } else {
            const celularLimpo = userInput.replace(/\D/g, '');
            query = query.eq('celular', celularLimpo);
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
        console.log('✅ [LOGIN] Login bem-sucedido para:', user.nome);
        
        // Salvar no CONFIG e LocalStorage (ajuste conforme sua config.js)
        if (typeof saveUser === 'function') {
            saveUser(user.id, user.nome, user.celular);
        }
        
        if (typeof showNotification === 'function') {
            showNotification('Bem-vindo(a) de volta!', 'success');
        }
        
        // Chamar a função de transição corrigida
        showDashboard();
        
    } catch (error) {
        console.error('❌ [LOGIN] Erro:', error);
        showLoginError('Erro ao realizar login. Tente novamente.');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    } else {
        alert(message);
    }
}
