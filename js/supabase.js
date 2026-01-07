// ========== CLIENTE SUPABASE ==========
console.log('🗄️ [SUPABASE] Iniciando módulo Supabase...');

let supabaseClient = null;

// Inicializar cliente Supabase
function initSupabase() {
    console.log('🔌 [SUPABASE] Tentando inicializar cliente...');
    
    if (!CONFIG.supabase.url || !CONFIG.supabase.key) {
        console.error('❌ [SUPABASE] Credenciais ausentes!');
        console.error('   URL:', CONFIG.supabase.url ? '✓ Presente' : '✗ Vazia');
        console.error('   Key:', CONFIG.supabase.key ? '✓ Presente' : '✗ Vazia');
        return false;
    }
    
    try {
        console.log('📝 [SUPABASE] Criando cliente com:');
        console.log('   URL:', CONFIG.supabase.url);
        console.log('   Key (primeiros 20 chars):', CONFIG.supabase.key.substring(0, 20) + '...');
        
        supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
        
        console.log('✅ [SUPABASE] Cliente criado com sucesso!');
        console.log('   supabaseClient:', supabaseClient ? 'Inicializado' : 'Falha');
        
        return true;
    } catch (error) {
        console.error('❌ [SUPABASE] Erro ao inicializar:', error);
        return false;
    }
}

// Verificar se o Supabase está configurado
function isSupabaseConfigured() {
    const configured = supabaseClient !== null;
    console.log('🔍 [SUPABASE] Verificando configuração:', configured ? '✅ Configurado' : '❌ Não configurado');
    return configured;
}

// ========== TRANSAÇÕES ==========

// Buscar todas as transações do usuário
async function getTransactions(userId, startDate = null, endDate = null) {
    console.log('📊 [TRANSAÇÕES] Buscando transações do usuário:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [TRANSAÇÕES] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        let query = supabaseClient
            .from('transacoes')
            .select('*, categoria_trasacoes!transacoes_categoria_id_fkey(descricao)')
            .eq('usuario_id', userId)
            .order('data', { ascending: false });
        
        if (startDate) {
            console.log('   Filtro: data >= ', startDate);
            query = query.gte('data', startDate);
        }
        
        if (endDate) {
            console.log('   Filtro: data <= ', endDate);
            query = query.lte('data', endDate);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('❌ [TRANSAÇÕES] Erro na query:', error);
            throw error;
        }
        
        console.log('✅ [TRANSAÇÕES] Encontradas', data?.length || 0, 'transações');
        return data || [];
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao buscar:', error);
        throw error;
    }
}

// Buscar transações por tipo
async function getTransactionsByType(userId, type, startDate = null, endDate = null) {
    console.log('📊 [TRANSAÇÕES] Buscando transações do tipo:', type, 'para usuário:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [TRANSAÇÕES] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        let query = supabaseClient
            .from('transacoes')
            .select('*, categoria_trasacoes!transacoes_categoria_id_fkey(descricao)')
            .eq('usuario_id', userId)
            .eq('tipo', type)
            .order('data', { ascending: false });
        
        if (startDate) {
            query = query.gte('data', startDate);
        }
        
        if (endDate) {
            query = query.lte('data', endDate);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('❌ [TRANSAÇÕES] Erro na query:', error);
            throw error;
        }
        
        console.log('✅ [TRANSAÇÕES] Encontradas', data?.length || 0, 'transações do tipo', type);
        return data || [];
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao buscar por tipo:', error);
        throw error;
    }
}

// Inserir nova transação
async function insertTransaction(transaction) {
    console.log('➕ [TRANSAÇÕES] Inserindo nova transação:', transaction);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [TRANSAÇÕES] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('transacoes')
            .insert([transaction])
            .select();
        
        if (error) {
            console.error('❌ [TRANSAÇÕES] Erro ao inserir:', error);
            throw error;
        }
        
        console.log('✅ [TRANSAÇÕES] Transação inserida com ID:', data[0]?.id);
        return data[0];
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao inserir transação:', error);
        throw error;
    }
}

// Atualizar transação
async function updateTransaction(id, userId, updates) {
    console.log('✏️ [TRANSAÇÕES] Atualizando transação:', id, 'do usuário:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [TRANSAÇÕES] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('transacoes')
            .update(updates)
            .eq('id', id)
            .eq('usuario_id', userId)
            .select();
        
        if (error) {
            console.error('❌ [TRANSAÇÕES] Erro ao atualizar:', error);
            throw error;
        }
        
        console.log('✅ [TRANSAÇÕES] Transação atualizada');
        return data[0];
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao atualizar transação:', error);
        throw error;
    }
}

// Excluir transação
async function deleteTransaction(id, userId) {
    console.log('🗑️ [TRANSAÇÕES] Excluindo transação:', id, 'do usuário:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [TRANSAÇÕES] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { error } = await supabaseClient
            .from('transacoes')
            .delete()
            .eq('id', id)
            .eq('usuario_id', userId);
        
        if (error) {
            console.error('❌ [TRANSAÇÕES] Erro ao excluir:', error);
            throw error;
        }
        
        console.log('✅ [TRANSAÇÕES] Transação excluída');
        return true;
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao excluir transação:', error);
        throw error;
    }
}

// ========== CATEGORIAS ==========

// Buscar todas as categorias do usuário
async function getCategories(userId) {
    console.log('🏷️ [CATEGORIAS] Buscando categorias do usuário:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [CATEGORIAS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('categoria_trasacoes')
            .select('*')
            .eq('usuario_id', userId)
            .order('descricao', { ascending: true });
        
        if (error) {
            console.error('❌ [CATEGORIAS] Erro na query:', error);
            throw error;
        }
        
        console.log('✅ [CATEGORIAS] Encontradas', data?.length || 0, 'categorias');
        return data || [];
    } catch (error) {
        console.error('❌ [CATEGORIAS] Erro ao buscar:', error);
        throw error;
    }
}

// Inserir nova categoria
async function insertCategory(category) {
    console.log('➕ [CATEGORIAS] Inserindo nova categoria:', category);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [CATEGORIAS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('categoria_trasacoes')
            .insert([category])
            .select();
        
        if (error) {
            console.error('❌ [CATEGORIAS] Erro ao inserir:', error);
            throw error;
        }
        
        console.log('✅ [CATEGORIAS] Categoria inserida com ID:', data[0]?.id);
        return data[0];
    } catch (error) {
        console.error('❌ [CATEGORIAS] Erro ao inserir categoria:', error);
        throw error;
    }
}

// Excluir categoria
async function deleteCategory(id, userId) {
    console.log('🗑️ [CATEGORIAS] Excluindo categoria:', id, 'do usuário:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [CATEGORIAS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { error } = await supabaseClient
            .from('categoria_trasacoes')
            .delete()
            .eq('id', id)
            .eq('usuario_id', userId);
        
        if (error) {
            console.error('❌ [CATEGORIAS] Erro ao excluir:', error);
            throw error;
        }
        
        console.log('✅ [CATEGORIAS] Categoria excluída');
        return true;
    } catch (error) {
        console.error('❌ [CATEGORIAS] Erro ao excluir categoria:', error);
        throw error;
    }
}

// ========== USUÁRIOS ==========

// Buscar usuário por ID
async function getUserById(userId) {
    console.log('👤 [USUÁRIOS] Buscando usuário por ID:', userId);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [USUÁRIOS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) {
            console.error('❌ [USUÁRIOS] Erro ao buscar por ID:', error);
            throw error;
        }
        
        console.log('✅ [USUÁRIOS] Usuário encontrado:', data?.nome || data?.email);
        return data;
    } catch (error) {
        console.error('❌ [USUÁRIOS] Erro ao buscar usuário por ID:', error);
        throw error;
    }
}

// Buscar usuário por celular
async function getUserByPhone(phone) {
    console.log('👤 [USUÁRIOS] Buscando usuário por celular:', phone);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [USUÁRIOS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        console.log('   Query: SELECT * FROM usuarios WHERE celular = ?', phone);
        
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('celular', phone)
            .single();
        
        if (error) {
            console.error('❌ [USUÁRIOS] Erro ao buscar por celular:', error);
            console.error('   Detalhes do erro:', error.message);
            throw error;
        }
        
        console.log('✅ [USUÁRIOS] Usuário encontrado:', data?.nome || data?.email);
        console.log('   ID:', data?.id);
        console.log('   Status:', data?.status);
        return data;
    } catch (error) {
        console.error('❌ [USUÁRIOS] Erro ao buscar usuário por telefone:', error);
        throw error;
    }
}

// Buscar todos os usuários (admin)
async function getAllUsers() {
    console.log('👥 [USUÁRIOS] Buscando todos os usuários');
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [USUÁRIOS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ [USUÁRIOS] Erro ao buscar todos:', error);
            throw error;
        }
        
        console.log('✅ [USUÁRIOS] Encontrados', data?.length || 0, 'usuários');
        return data || [];
    } catch (error) {
        console.error('❌ [USUÁRIOS] Erro ao buscar usuários:', error);
        throw error;
    }
}

// Inserir novo usuário
async function insertUser(user) {
    console.log('➕ [USUÁRIOS] Inserindo novo usuário:', user);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [USUÁRIOS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert([user])
            .select();
        
        if (error) {
            console.error('❌ [USUÁRIOS] Erro ao inserir:', error);
            throw error;
        }
        
        console.log('✅ [USUÁRIOS] Usuário inserido com ID:', data[0]?.id);
        return data[0];
    } catch (error) {
        console.error('❌ [USUÁRIOS] Erro ao inserir usuário:', error);
        throw error;
    }
}

// Atualizar status do usuário
async function updateUserStatus(userId, status) {
    console.log('✏️ [USUÁRIOS] Atualizando status do usuário:', userId, 'para:', status);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [USUÁRIOS] Supabase não configurado');
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .update({ status })
            .eq('id', userId)
            .select();
        
        if (error) {
            console.error('❌ [USUÁRIOS] Erro ao atualizar:', error);
            throw error;
        }
        
        console.log('✅ [USUÁRIOS] Status atualizado');
        return data[0];
    } catch (error) {
        console.error('❌ [USUÁRIOS] Erro ao atualizar status:', error);
        throw error;
    }
}

// ========== ESTATÍSTICAS ==========

// Calcular totais de receitas e despesas
async function calculateTotals(userId, startDate = null, endDate = null) {
    console.log('💰 [STATS] Calculando totais do usuário:', userId);
    
    try {
        const transactions = await getTransactions(userId, startDate, endDate);
        
        const receitas = transactions
            .filter(t => t.tipo === 'entrada')
            .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);
        
        const despesas = transactions
            .filter(t => t.tipo === 'saida')
            .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);
        
        const saldo = receitas - despesas;
        
        console.log('✅ [STATS] Totais calculados:', { receitas, despesas, saldo });
        return { receitas, despesas, saldo };
    } catch (error) {
        console.error('❌ [STATS] Erro ao calcular totais:', error);
        return { receitas: 0, despesas: 0, saldo: 0 };
    }
}

// Calcular despesas por categoria
async function calculateExpensesByCategory(userId, startDate = null, endDate = null) {
    console.log('📊 [STATS] Calculando despesas por categoria');
    
    try {
        const transactions = await getTransactionsByType(userId, 'saida', startDate, endDate);
        
        const byCategory = {};
        
        transactions.forEach(t => {
            const categoryName = t.categoria_trasacoes?.descricao || 'Sem categoria';
            if (!byCategory[categoryName]) {
                byCategory[categoryName] = 0;
            }
            byCategory[categoryName] += parseFloat(t.valor || 0);
        });
        
        console.log('✅ [STATS] Despesas por categoria:', byCategory);
        return byCategory;
    } catch (error) {
        console.error('❌ [STATS] Erro ao calcular despesas por categoria:', error);
        return {};
    }
}

// Calcular tendências mensais (últimos 6 meses)
async function calculateMonthlyTrends(userId) {
    console.log('📈 [STATS] Calculando tendências mensais');
    
    try {
        const today = new Date();
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        
        const transactions = await getTransactions(userId, sixMonthsAgo.toISOString(), today.toISOString());
        
        const monthlyData = {};
        
        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = { receitas: 0, despesas: 0 };
        }
        
        // Agregar transações
        transactions.forEach(t => {
            const date = new Date(t.data);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (monthlyData[key]) {
                if (t.tipo === 'entrada') {
                    monthlyData[key].receitas += parseFloat(t.valor || 0);
                } else {
                    monthlyData[key].despesas += parseFloat(t.valor || 0);
                }
            }
        });
        
        console.log('✅ [STATS] Tendências calculadas:', monthlyData);
        return monthlyData;
    } catch (error) {
        console.error('❌ [STATS] Erro ao calcular tendências mensais:', error);
        return {};
    }
}

// Calcular saúde financeira (0-100)
function calculateFinancialHealth(receitas, despesas) {
    if (receitas === 0) return 0;
    
    const saldo = receitas - despesas;
    const percentualSaldo = (saldo / receitas) * 100;
    
    let score = 0;
    
    if (percentualSaldo >= 30) {
        score = 100;
    } else if (percentualSaldo >= 20) {
        score = 80;
    } else if (percentualSaldo >= 10) {
        score = 60;
    } else if (percentualSaldo >= 0) {
        score = 40;
    } else if (percentualSaldo >= -20) {
        score = 20;
    } else {
        score = 10;
    }
    
    return Math.min(100, Math.max(0, score));
}

// Obter mensagem de saúde financeira
function getHealthMessage(score) {
    if (score >= 80) {
        return 'Excelente! Continue assim!';
    } else if (score >= 60) {
        return 'Bom! Você está no caminho certo.';
    } else if (score >= 40) {
        return 'Atenção! Controle seus gastos.';
    } else if (score >= 20) {
        return 'Cuidado! Suas despesas estão altas.';
    } else {
        return 'Crítico! Revise urgentemente suas finanças.';
    }
}

// ========== INICIALIZAÇÃO ==========
console.log('🚀 [SUPABASE] Inicializando Supabase ao carregar o módulo...');
initSupabase();
console.log('✅ [SUPABASE] Módulo Supabase carregado!');
