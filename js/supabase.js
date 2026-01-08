// ========== CLIENTE SUPABASE ==========
console.log('🗄️ [SUPABASE] Iniciando módulo Supabase...');

let supabaseClient = null;

// Inicializar cliente Supabase
function initSupabase() {
    // Se já estiver inicializado, não cria nova instância
    if (supabaseClient) {
        console.log('🔌 [SUPABASE] Cliente já inicializado, pulando...');
        return true;
    }

    console.log('🔌 [SUPABASE] Tentando inicializar cliente...');
    
    if (!CONFIG.supabase.url || !CONFIG.supabase.key) {
        console.error('❌ [SUPABASE] Credenciais ausentes!');
        return false;
    }
    
    try {
        // Criar cliente apenas uma vez
        supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
        console.log('✅ [SUPABASE] Cliente criado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ [SUPABASE] Erro ao inicializar:', error);
        return false;
    }
}

// Verificar se o Supabase está configurado
function isSupabaseConfigured() {
    return supabaseClient !== null;
}

// ========== TRANSAÇÕES ==========

async function getTransactions(userId, startDate = null, endDate = null) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');
    try {
        let query = supabaseClient
            .from('transacoes')
            .select('*, categoria_trasacoes!transacoes_categoria_id_fkey(descricao)')
            .eq('usuario_id', userId)
            .order('data', { ascending: false });
        
        if (startDate) query = query.gte('data', startDate);
        if (endDate) query = query.lte('data', endDate);
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao buscar:', error);
        throw error;
    }
}

async function getTransactionsByType(userId, type, startDate = null, endDate = null) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');
    try {
        let query = supabaseClient
            .from('transacoes')
            .select('*, categoria_trasacoes!transacoes_categoria_id_fkey(descricao)')
            .eq('usuario_id', userId)
            .eq('tipo', type)
            .order('data', { ascending: false });
        
        if (startDate) query = query.gte('data', startDate);
        if (endDate) query = query.lte('data', endDate);
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ [TRANSAÇÕES] Erro ao buscar por tipo:', error);
        throw error;
    }
}

// ========== CATEGORIAS ==========

async function getCategories(userId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');
    try {
        const { data, error } = await supabaseClient
            .from('categoria_trasacoes')
            .select('*')
            .eq('usuario_id', userId)
            .order('descricao', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('❌ [CATEGORIAS] Erro ao buscar:', error);
        throw error;
    }
}

// ========== USUÁRIOS ==========

async function getUserById(userId) {
    if (!isSupabaseConfigured()) throw new Error('Supabase não configurado');
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('❌ [USUÁRIOS] Erro ao buscar por ID:', error);
        throw error;
    }
}

// Inicialização automática ao carregar o script
if (typeof CONFIG !== 'undefined') {
    initSupabase();
}
