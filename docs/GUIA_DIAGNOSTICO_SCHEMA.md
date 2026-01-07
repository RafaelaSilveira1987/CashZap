# Guia de Diagnóstico: Validação de Esquema do Banco de Dados

## 🎯 Objetivo

Este guia mostra como usar as ferramentas de diagnóstico integradas no dashboard para validar se o banco de dados está configurado corretamente.

## 🚀 Como Usar

### Passo 1: Abrir o Console do Navegador
1. Pressione **F12** no seu navegador
2. Clique na aba **Console**
3. Você verá vários logs de inicialização

### Passo 2: Executar o Relatório Completo

No console, digite:
```javascript
diagnosticReport()
```

Pressione **Enter** e aguarde alguns segundos.

Este comando fará:
- ✅ Verificar se o Supabase está configurado
- ✅ Validar a estrutura de todas as tabelas
- ✅ Verificar o status do RLS
- ✅ Listar todos os usuários cadastrados
- ✅ Gerar um relatório completo

## 📋 Comandos Disponíveis

### 1. Validar Esquema
```javascript
validateSchema()
```
**O que faz**: Verifica se todas as tabelas e campos esperados existem no banco de dados.

**Resultado esperado**:
```
✅ Esquema validado com sucesso!
```

**Se der erro**:
```
❌ Problemas encontrados no esquema:
   - Tabela transacoes não acessível: permission denied
```

### 2. Listar Usuários
```javascript
listUsers()
```
**O que faz**: Mostra todos os usuários cadastrados no banco.

**Resultado esperado**:
```
✅ 1 usuário(s) encontrado(s):
   1. ID: 1, Nome: rafaela, Celular: 553298416669, Status: ativo
```

**Se der erro**:
```
❌ Erro ao listar usuários: row level security policy
```

### 3. Testar Busca de Usuário
```javascript
testUserSearch('553298416669')
```
**O que faz**: Tenta buscar um usuário específico pelo celular.

**Resultado esperado**:
```
✅ Usuário encontrado por celular: {
  id: 1,
  nome: "rafaela",
  email: "rafaelasilveira1987@gmail.com",
  celular: "553298416669",
  status: "ativo"
}
```

### 4. Verificar RLS
```javascript
checkRLS()
```
**O que faz**: Verifica se o Row Level Security está bloqueando o acesso.

**Resultado esperado (sem RLS)**:
```
✅ RLS não está bloqueando acesso
```

**Resultado esperado (com RLS)**:
```
⚠️ RLS está ativo e pode estar bloqueando acesso
```

## 🔧 Resolvendo Problemas Comuns

### Problema 1: "Tabela não acessível"
```
❌ Tabela usuarios não acessível: permission denied
```

**Causa**: RLS está ativo e bloqueando a chave `anon`.

**Solução**:
1. No Supabase, vá em **Table Editor** > `usuarios`
2. Clique em **RLS disabled** (ou desative o RLS)
3. Repita para `transacoes` e `categoria_trasacoes`
4. Execute novamente: `validateSchema()`

### Problema 2: "Usuário não encontrado"
```
❌ Erro ao buscar por celular: No rows found
```

**Causa**: O número de celular não existe ou está diferente.

**Solução**:
1. Execute: `listUsers()`
2. Verifique se o celular está exatamente igual (incluindo DDI)
3. Se não aparecer nenhum usuário, crie um manualmente no Supabase

### Problema 3: "Supabase não configurado"
```
❌ [SCHEMA] Supabase não configurado
```

**Causa**: As credenciais não foram salvas.

**Solução**:
1. Clique em **"Configurar Supabase Primeiro"** na tela de login
2. Preencha a URL e a chave
3. Clique em **"Salvar e Voltar"**
4. Tente novamente

## 📊 Interpretando o Relatório Completo

Quando você executa `diagnosticReport()`, você verá algo assim:

```javascript
{
  timestamp: "2026-01-07T18:30:00.000Z",
  supabase: {
    configured: true,
    url: "https://ktjpphfxulkymobkjvqo.supabase.co"
  },
  schema: {
    success: true,
    tables: {
      usuarios: {
        exists: true,
        recordCount: "Pelo menos 1",
        valid: true
      },
      categoria_trasacoes: {
        exists: true,
        recordCount: "Pelo menos 1",
        valid: true
      },
      transacoes: {
        exists: true,
        recordCount: "Pelo menos 1",
        valid: true
      }
    },
    errors: []
  },
  rls: {
    rlsActive: false,
    message: "Acesso permitido"
  },
  users: [
    {
      id: 1,
      nome: "rafaela",
      email: "rafaelasilveira1987@gmail.com",
      celular: "553298416669",
      status: "ativo"
    }
  ],
  ready: true
}
```

### ✅ Tudo OK se:
- `schema.success`: `true`
- `rls.rlsActive`: `false`
- `users`: Array com pelo menos 1 usuário
- `ready`: `true`

### ❌ Há problemas se:
- `schema.success`: `false`
- `rls.rlsActive`: `true`
- `users`: Array vazio
- `ready`: `false`

## 🎯 Próximos Passos

Após validar que tudo está OK:

1. Volte à tela de login
2. Digite o número de celular: `553298416669`
3. Clique em **Entrar**
4. Você deve ter acesso ao dashboard com sucesso!

## 💡 Dicas

- **Salve o relatório**: Você pode copiar o resultado de `diagnosticReport()` e salvar em um arquivo para referência
- **Teste frequentemente**: Se tiver problemas, execute `diagnosticReport()` para ter um diagnóstico rápido
- **Verifique os logs**: Todos os comandos geram logs detalhados no console para ajudar na depuração

---

**Precisa de ajuda?** Copie o resultado de `diagnosticReport()` e envie para análise!
