// ========== LOGIN E CADASTRO ATUALIZADO ==========

async function handleLogin() {
    console.log('🔐 [LOGIN] Iniciando login...');
    
    const userInput = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    if (errorDiv) errorDiv.style.display = 'none';
    
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
            // Remover caracteres especiais do celular para bater com o banco (apenas números)
            const celularLimpo = userInput.replace(/\D/g, '');
            query = query.eq('celular', celularLimpo);
        }
        
        const { data: users, error } = await query;
        
        if (error) {
            console.error('❌ [LOGIN] Erro ao buscar usuário:', error);
            showLoginError('Erro ao buscar usuário no banco de dados');
            return;
        }
        
        if (!users || users.length === 0) {
            console.error('❌ [LOGIN] Usuário não encontrado');
            showLoginError('Usuário não encontrado. Cadastre-se via WhatsApp primeiro!');
            return;
        }
        
        const user = users[0];
        console.log('✅ [LOGIN] Usuário encontrado:', user.nome);
        
        // Validar senha
        if (!user.senha) {
            console.error('❌ [LOGIN] Usuário sem senha definida');
            showLoginError('Usuário sem senha definida. Entre em contato com o suporte.');
            return;
        }

        if (user.senha !== password) {
            console.error('❌ [LOGIN] Senha incorreta');
            showLoginError('Senha incorreta');
            return;
        }
        
        // Login bem-sucedido
        console.log('✅ [LOGIN] Login bem-sucedido');
        saveUser(user.id, user.nome, user.celular);
        
        if (typeof showNotification === 'function') {
            showNotification('Login realizado com sucesso!', 'success');
        }
        
        showDashboard();
        
    } catch (error) {
        console.error('❌ [LOGIN] Erro inesperado:', error);
        showLoginError('Ocorreu um erro ao tentar fazer login');
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
