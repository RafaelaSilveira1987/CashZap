// ========== CORREÇÃO FINAL DO FORMULÁRIO DE LOGIN ==========
// Este arquivo garante que o formulário de login seja encontrado e configurado corretamente

console.log('🔧 [FORM-FIX] Iniciando correção de formulário...');

// Aguardar um pouco para garantir que o DOM está pronto
setTimeout(() => {
    console.log('⏱️ [FORM-FIX] Verificando formulário de login...');
    
    const loginForm = document.getElementById('loginForm');
    const loginUser = document.getElementById('loginUser');
    const loginBtn = document.querySelector('button[type="submit"]');
    
    if (loginForm) {
        console.log('✅ [FORM-FIX] Formulário encontrado');
        
        // Remover listeners anteriores (se houver)
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        // Adicionar novo listener
        newForm.addEventListener('submit', function(e) {
            console.log('🔐 [FORM-FIX] Evento submit disparado');
            e.preventDefault();
            
            const userInput = document.getElementById('loginUser').value.trim();
            console.log('   Entrada:', userInput);
            
            if (userInput) {
                console.log('   Chamando forceLogin...');
                forceLogin(userInput);
            } else {
                console.warn('   Entrada vazia');
                showNotification('Digite um número de telefone', 'error');
            }
        });
        
        console.log('✅ [FORM-FIX] Listener adicionado com sucesso');
    } else {
        console.warn('⚠️ [FORM-FIX] Formulário não encontrado');
    }
    
    // Também adicionar listener ao botão direto
    if (loginBtn) {
        console.log('✅ [FORM-FIX] Botão encontrado, adicionando listener direto');
        
        loginBtn.addEventListener('click', function(e) {
            console.log('🔐 [FORM-FIX] Clique no botão detectado');
            e.preventDefault();
            
            const userInput = document.getElementById('loginUser').value.trim();
            console.log('   Entrada:', userInput);
            
            if (userInput) {
                console.log('   Chamando forceLogin...');
                forceLogin(userInput);
            } else {
                console.warn('   Entrada vazia');
                showNotification('Digite um número de telefone', 'error');
            }
        });
    }
    
    console.log('✅ [FORM-FIX] Correção de formulário concluída');
}, 500);
