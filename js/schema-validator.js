// ========== VALIDADOR DE ESQUEMA DO SUPABASE ==========
console.log('📋 [SCHEMA] Iniciando validador de esquema...');

// Definição do esquema esperado (baseado no SQL do usuário)
const EXPECTED_SCHEMA = {
    usuarios: {
        fields: ['id', 'created_at', 'nome', 'email', 'celular', 'aceite_termos', 'data_aceite_termos', 'ultima_atualizacao', 'status'],
        primaryKey: 'id',
        description: 'Tabela de usuários do sistema'
    },
    categoria_trasacoes: {
        fields: ['id', 'created_at', 'descricao', 'usuario_id'],
        primaryKey: 'id',
        description: 'Tabela de categorias de transações'
    },
    transacoes: {
        fields: ['id', 'created_at', 'data', 'valor', 'descricao', 'recebedor', 'mes', 'categoria_id', 'tipo', 'usuario_id', 'pagador'],
        primaryKey: 'id',
        description: 'Tabela de transações financeiras'
    }
};

// Função para validar a estrutura do banco de dados
async function validateDatabaseSchema() {
    console.log('🔍 [SCHEMA] Iniciando validação do esquema...');
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [SCHEMA] Supabase não configurado');
        return { success: false, message: 'Supabase não configurado' };
    }
    
    const results = {
        success: true,
        tables: {},
        errors: []
    };
    
    // Validar cada tabela
    for (const [tableName, schema] of Object.entries(EXPECTED_SCHEMA)) {
        console.log(`\n📊 [SCHEMA] Validando tabela: ${tableName}`);
        
        try {
            // Tentar buscar um registro para validar a estrutura
            const { data, error } = await supabaseClient
                .from(tableName)
                .select('*')
                .limit(1);
            
            if (error) {
                console.error(`❌ [SCHEMA] Erro ao validar ${tableName}:`, error.message);
                results.tables[tableName] = {
                    exists: false,
                    error: error.message
                };
                results.errors.push(`Tabela ${tableName} não acessível: ${error.message}`);
                results.success = false;
            } else {
                // Validar campos
                if (data && data.length > 0) {
                    const actualFields = Object.keys(data[0]);
                    const missingFields = schema.fields.filter(f => !actualFields.includes(f));
                    const extraFields = actualFields.filter(f => !schema.fields.includes(f));
                    
                    results.tables[tableName] = {
                        exists: true,
                        recordCount: 'Pelo menos 1',
                        expectedFields: schema.fields,
                        actualFields: actualFields,
                        missingFields: missingFields,
                        extraFields: extraFields,
                        valid: missingFields.length === 0
                    };
                    
                    console.log(`✅ [SCHEMA] Tabela ${tableName} validada`);
                    console.log(`   Campos esperados: ${schema.fields.join(', ')}`);
                    console.log(`   Campos encontrados: ${actualFields.join(', ')}`);
                    
                    if (missingFields.length > 0) {
                        console.warn(`   ⚠️ Campos faltando: ${missingFields.join(', ')}`);
                        results.errors.push(`Tabela ${tableName} faltam campos: ${missingFields.join(', ')}`);
                        results.success = false;
                    }
                    
                    if (extraFields.length > 0) {
                        console.log(`   ℹ️ Campos extras: ${extraFields.join(', ')}`);
                    }
                } else {
                    results.tables[tableName] = {
                        exists: true,
                        recordCount: 0,
                        warning: 'Tabela vazia'
                    };
                    console.log(`⚠️ [SCHEMA] Tabela ${tableName} existe mas está vazia`);
                }
            }
        } catch (error) {
            console.error(`❌ [SCHEMA] Erro inesperado ao validar ${tableName}:`, error);
            results.tables[tableName] = {
                exists: false,
                error: error.message
            };
            results.errors.push(`Erro inesperado em ${tableName}: ${error.message}`);
            results.success = false;
        }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(50));
    console.log('📋 [SCHEMA] RESUMO DA VALIDAÇÃO');
    console.log('='.repeat(50));
    
    if (results.success) {
        console.log('✅ Esquema validado com sucesso!');
    } else {
        console.error('❌ Problemas encontrados no esquema:');
        results.errors.forEach(error => console.error(`   - ${error}`));
    }
    
    return results;
}

// Função para testar busca de usuário
async function testUserSearch(searchValue) {
    console.log(`\n🧪 [SCHEMA] Testando busca de usuário: ${searchValue}`);
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [SCHEMA] Supabase não configurado');
        return null;
    }
    
    try {
        // Tentar buscar por ID se for número pequeno
        if (!isNaN(searchValue) && searchValue.length < 5) {
            console.log(`   Tentando buscar por ID: ${searchValue}`);
            const { data, error } = await supabaseClient
                .from('usuarios')
                .select('*')
                .eq('id', parseInt(searchValue))
                .single();
            
            if (!error && data) {
                console.log('✅ Usuário encontrado por ID:', data);
                return data;
            }
        }
        
        // Tentar buscar por celular
        console.log(`   Tentando buscar por celular: ${searchValue}`);
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('*')
            .eq('celular', searchValue)
            .single();
        
        if (error) {
            console.error('❌ Erro ao buscar por celular:', error.message);
            return null;
        }
        
        console.log('✅ Usuário encontrado por celular:', data);
        return data;
    } catch (error) {
        console.error('❌ Erro ao testar busca:', error);
        return null;
    }
}

// Função para listar todos os usuários
async function listAllUsers() {
    console.log('\n📋 [SCHEMA] Listando todos os usuários...');
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [SCHEMA] Supabase não configurado');
        return [];
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('id, nome, email, celular, status')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('❌ Erro ao listar usuários:', error.message);
            return [];
        }
        
        console.log(`✅ ${data.length} usuário(s) encontrado(s):`);
        data.forEach((user, index) => {
            console.log(`   ${index + 1}. ID: ${user.id}, Nome: ${user.nome}, Celular: ${user.celular}, Status: ${user.status}`);
        });
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        return [];
    }
}

// Função para verificar RLS
async function checkRLSStatus() {
    console.log('\n🔐 [SCHEMA] Verificando status do RLS...');
    
    if (!isSupabaseConfigured()) {
        console.error('❌ [SCHEMA] Supabase não configurado');
        return null;
    }
    
    try {
        // Tentar fazer uma query simples
        const { data, error } = await supabaseClient
            .from('usuarios')
            .select('count(*)', { count: 'exact' });
        
        if (error && error.message.includes('row level security')) {
            console.warn('⚠️ RLS está ativo e pode estar bloqueando acesso');
            return { rlsActive: true, message: 'RLS está ativo - pode precisar de políticas' };
        } else if (error) {
            console.error('❌ Erro ao verificar RLS:', error.message);
            return { rlsActive: null, error: error.message };
        } else {
            console.log('✅ RLS não está bloqueando acesso');
            return { rlsActive: false, message: 'Acesso permitido' };
        }
    } catch (error) {
        console.error('❌ Erro ao verificar RLS:', error);
        return null;
    }
}

// Função para gerar relatório completo
async function generateFullDiagnosticReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 RELATÓRIO COMPLETO DE DIAGNÓSTICO');
    console.log('='.repeat(60));
    
    console.log('\n1️⃣ Verificando Configuração do Supabase...');
    console.log(`   URL: ${CONFIG.supabase.url}`);
    console.log(`   Key: ${CONFIG.supabase.key.substring(0, 20)}...`);
    console.log(`   Cliente inicializado: ${isSupabaseConfigured() ? '✅ Sim' : '❌ Não'}`);
    
    console.log('\n2️⃣ Validando Esquema do Banco...');
    const schemaResults = await validateDatabaseSchema();
    
    console.log('\n3️⃣ Verificando RLS...');
    const rlsStatus = await checkRLSStatus();
    
    console.log('\n4️⃣ Listando Usuários Disponíveis...');
    const users = await listAllUsers();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL');
    console.log('='.repeat(60));
    
    const report = {
        timestamp: new Date().toISOString(),
        supabase: {
            configured: isSupabaseConfigured(),
            url: CONFIG.supabase.url
        },
        schema: schemaResults,
        rls: rlsStatus,
        users: users,
        ready: schemaResults.success && users.length > 0
    };
    
    console.log('Relatório:', report);
    return report;
}

// Expor funções globalmente para uso no console
window.validateSchema = validateDatabaseSchema;
window.testUserSearch = testUserSearch;
window.listUsers = listAllUsers;
window.checkRLS = checkRLSStatus;
window.diagnosticReport = generateFullDiagnosticReport;

console.log('✅ [SCHEMA] Validador de esquema carregado!');
console.log('📝 Funções disponíveis no console:');
console.log('   - validateSchema()        : Validar estrutura do banco');
console.log('   - testUserSearch(valor)   : Testar busca de usuário');
console.log('   - listUsers()             : Listar todos os usuários');
console.log('   - checkRLS()              : Verificar status do RLS');
console.log('   - diagnosticReport()      : Gerar relatório completo');
