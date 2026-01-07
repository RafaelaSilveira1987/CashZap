// Cliente Supabase
let supabaseClient = null;

// Inicializar cliente Supabase
function initSupabase() {
    if (!CONFIG.supabase.url || !CONFIG.supabase.key) {
        console.warn('Supabase não configurado');
        return false;
    }
    
    try {
        supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
        return true;
    } catch (error) {
        console.error('Erro ao inicializar Supabase:', error);
        return false;
    }
}

// Verificar se o Supabase está configurado
function isSupabaseConfigured() {
    return supabaseClient !== null;
}

// ========== TRANSAÇÕES ==========

// Buscar todas as transações do usuário
async function getTransactions(userId, startDate = null, endDate = null) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        let query = supabaseClient
            .from('transacoes')
            .select('*, categoria_trasacoes(descricao)')
            .eq('usuario_id', userId)
            .order('data', { ascending: false });
        
        if (startDate) {
            query = query.gte('data', startDate);
        }
        
        if (endDate) {
            query = query.lte('data', endDate);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        throw error;
    }
}

// Buscar transações por tipo
async function getTransactionsByType(userId, type, startDate = null, endDate = null) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        let query = supabaseClient
            .from('transacoes')
            .select('*, categoria_trasacoes(descricao)')
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
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar transações por tipo:', error);
        throw error;
    }
}

// Inserir nova transação
async function insertTransaction(transaction) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('transacoes')
            .insert([transaction])
            .select();
        
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao inserir transação:', error);
        throw error;
    }
}

// Atualizar transação
async function updateTransaction(id, userId, updates) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('transacoes')
            .update(updates)
            .eq('id', id)
            .eq('usuario_id', userId)
            .select();
        
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        throw error;
    }
}

// Excluir transação
async function deleteTransaction(id, userId) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { error } = await supabaseClient
            .from('transacoes')
            .delete()
            .eq('id', id)
            .eq('usuario_id', userId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        throw error;
    }
}

// ========== CATEGORIAS ==========

// Buscar todas as categorias do usuário
async function getCategories(userId) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('categoria_trasacoes')
            .select('*')
            .eq('usuario_id', userId)
            .order('descricao', { ascending: true });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
    }
}

// Inserir nova categoria
async function insertCategory(category) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('categoria_trasacoes')
            .insert([category])
            .select();
        
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao inserir categoria:', error);
        throw error;
    }
}

// Excluir categoria
async function deleteCategory(id, userId) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { error } = await supabaseClient
            .from('categoria_trasacoes')
            .delete()
            .eq('id', id)
            .eq('usuario_id', userId);
        
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        throw error;
    }
}

// ========== USUÁRIOS ==========

// Buscar usuário por ID
async function getUserById(userId) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
    }
}

// Buscar usuário por telefone
async function getUserByPhone(phone) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('telefone', phone)
            .single();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Erro ao buscar usuário por telefone:', error);
        throw error;
    }
}

// Buscar todos os usuários (admin)
async function getAllUsers() {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
    }
}

// Inserir novo usuário
async function insertUser(user) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .insert([user])
            .select();
        
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao inserir usuário:', error);
        throw error;
    }
}

// Atualizar status do usuário
async function updateUserStatus(userId, status) {
    if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado');
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .update({ status })
            .eq('id', userId)
            .select();
        
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erro ao atualizar status do usuário:', error);
        throw error;
    }
}

// ========== ESTATÍSTICAS ==========

// Calcular totais de receitas e despesas
async function calculateTotals(userId, startDate = null, endDate = null) {
    try {
        const transactions = await getTransactions(userId, startDate, endDate);
        
        const receitas = transactions
            .filter(t => t.tipo === 'entrada')
            .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);
        
        const despesas = transactions
            .filter(t => t.tipo === 'saida')
            .reduce((sum, t) => sum + parseFloat(t.valor || 0), 0);
        
        const saldo = receitas - despesas;
        
        return { receitas, despesas, saldo };
    } catch (error) {
        console.error('Erro ao calcular totais:', error);
        return { receitas: 0, despesas: 0, saldo: 0 };
    }
}

// Calcular despesas por categoria
async function calculateExpensesByCategory(userId, startDate = null, endDate = null) {
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
        
        return byCategory;
    } catch (error) {
        console.error('Erro ao calcular despesas por categoria:', error);
        return {};
    }
}

// Calcular tendências mensais (últimos 6 meses)
async function calculateMonthlyTrends(userId) {
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
        
        return monthlyData;
    } catch (error) {
        console.error('Erro ao calcular tendências mensais:', error);
        return {};
    }
}

// Calcular saúde financeira (0-100)
function calculateFinancialHealth(receitas, despesas) {
    if (receitas === 0) return 0;
    
    const saldo = receitas - despesas;
    const percentualSaldo = (saldo / receitas) * 100;
    
    // Score baseado no percentual de saldo
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

// Inicializar Supabase ao carregar
initSupabase();
