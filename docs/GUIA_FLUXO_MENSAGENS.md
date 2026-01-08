# Guia de Fluxo de Mensagens - GranaZap

## 📱 Como o Sistema Funciona

### Fluxo Geral

```
Usuário envia mensagem no WhatsApp
    ↓
Evolution API recebe
    ↓
Envia para N8N via Webhook
    ↓
N8N processa a mensagem
    ↓
Verifica se usuário existe
    ↓
Se NÃO existe → Envia link de cadastro
Se SIM existe → Processa transação
    ↓
Insere no Supabase
    ↓
Dashboard atualiza em tempo real
    ↓
Bot envia confirmação via WhatsApp
```

---

## 💬 Tipos de Mensagens Suportadas

### 1. Registrar Receita (Entrada)

**Formato:**
```
entrada 100 Salário
entrada 50.50 Freelance
entrada 1000 Venda
```

**Resposta do Bot:**
```
✅ Receita registrada!
Valor: R$ 100,00
Descrição: Salário
Saldo atual: R$ 403,00
```

**O que acontece:**
1. Bot extrai: tipo=entrada, valor=100, descrição=Salário
2. Busca o usuário pelo número de celular
3. Insere no Supabase com `tipo='entrada'`
4. Atualiza o saldo
5. Dashboard mostra a transação instantaneamente

---

### 2. Registrar Despesa (Saída)

**Formato:**
```
saida 50 Alimentação
saida 30.50 Transporte
saida 100 Aluguel
```

**Resposta do Bot:**
```
✅ Despesa registrada!
Valor: R$ 50,00
Descrição: Alimentação
Categoria: Alimentação
Saldo atual: R$ 353,00
```

**O que acontece:**
1. Bot extrai: tipo=saida, valor=50, descrição=Alimentação
2. Tenta identificar a categoria automaticamente
3. Insere no Supabase com `tipo='saida'`
4. Atualiza o saldo
5. Dashboard mostra a despesa por categoria

---

### 3. Consultar Saldo

**Formato:**
```
saldo
```

**Resposta do Bot:**
```
💰 Seu Saldo Atual

Receitas: R$ 440,00
Despesas: R$ 37,00
Saldo: R$ 403,00

Acesse o dashboard para mais detalhes:
https://seu-dashboard.com
```

---

### 4. Últimas Transações

**Formato:**
```
últimas
últimas 5
```

**Resposta do Bot:**
```
📊 Últimas Transações

1️⃣ entrada R$ 440,00 - Freelance (06/01)
2️⃣ saida R$ 37,00 - Ração para animais (06/01)

Veja todas no dashboard!
```

---

### 5. Cadastro Novo

**Formato:**
```
cadastro
oi
olá
```

**Resposta do Bot:**
```
👋 Bem-vindo ao GranaZap!

Para começar, você precisa se cadastrar:
https://seu-dashboard.com/signup

Após se cadastrar, você pode:
• Registrar receitas: entrada 100 Salário
• Registrar despesas: saida 50 Alimentação
• Ver seu saldo: saldo
• Ver últimas transações: últimas

Dúvidas? Envie "ajuda"
```

---

## 🤖 Lógica de Processamento no N8N

### Passo 1: Receber Mensagem

```javascript
// Webhook recebe:
{
    "event": "messages.upsert",
    "data": {
        "key": {
            "remoteJid": "5532984166669@c.us",
            "fromMe": false,
            "id": "3EB0..."
        },
        "message": {
            "conversation": "entrada 100 Salário"
        },
        "status": "PENDING"
    }
}
```

### Passo 2: Extrair Informações

```javascript
const celular = "5532984166669";
const mensagem = "entrada 100 Salário";
const timestamp = new Date().toISOString();
```

### Passo 3: Validar Formato

```javascript
const regex = /^(entrada|saida|saldo|últimas|cadastro|ajuda)\s*(.*)$/i;
const match = mensagem.match(regex);

if (!match) {
    // Enviar mensagem de erro
    return { error: "Formato não reconhecido" };
}

const comando = match[1].toLowerCase();
const parametros = match[2];
```

### Passo 4: Buscar Usuário

```javascript
const usuario = await supabase
    .from('usuarios')
    .select('*')
    .eq('celular', celular)
    .single();

if (!usuario) {
    // Enviar link de cadastro
    return { action: "send_signup_link", celular };
}
```

### Passo 5: Processar Comando

```javascript
switch(comando) {
    case 'entrada':
    case 'saida':
        return await processarTransacao(usuario, comando, parametros);
    case 'saldo':
        return await enviarSaldo(usuario);
    case 'últimas':
        return await enviarUltimas(usuario, parametros);
    case 'cadastro':
    case 'oi':
    case 'olá':
        return await enviarBemVindo(usuario);
    default:
        return await enviarAjuda(usuario);
}
```

---

## 📊 Exemplo Completo: Registrar Transação

### Mensagem Enviada
```
entrada 100 Salário
```

### Processamento no N8N

**1. Webhook recebe:**
```json
{
    "remoteJid": "5532984166669@c.us",
    "message": "entrada 100 Salário"
}
```

**2. Extrair dados:**
```javascript
tipo = "entrada"
valor = 100
descricao = "Salário"
celular = "5532984166669"
```

**3. Validar:**
```javascript
✓ Tipo válido (entrada ou saida)
✓ Valor é número
✓ Descrição não vazia
```

**4. Buscar usuário:**
```sql
SELECT * FROM usuarios WHERE celular = '5532984166669'
-- Resultado: ID = 1, nome = "Rafaela"
```

**5. Identificar categoria:**
```javascript
// IA ou busca por palavra-chave
"Salário" → Categoria: "Renda"
```

**6. Inserir no Supabase:**
```sql
INSERT INTO transacoes (
    usuario_id, tipo, valor, descricao, 
    categoria_id, data, origem
) VALUES (
    1, 'entrada', 100, 'Salário', 
    2, '2026-01-06T14:05:06', 'whatsapp'
)
```

**7. Calcular novo saldo:**
```javascript
receitas_anteriores = 340
receitas_novas = 340 + 100 = 440
despesas = 37
saldo = 440 - 37 = 403
```

**8. Enviar confirmação:**
```
✅ Receita registrada!
Valor: R$ 100,00
Descrição: Salário
Saldo atual: R$ 403,00
```

**9. Dashboard atualiza:**
- Card de receitas: R$ 440,00 ✓
- Saldo: R$ 403,00 ✓
- Tabela de transações: nova linha ✓
- Gráfico de tendências: atualizado ✓

---

## ⚙️ Configuração de Categorias Automáticas

O sistema pode identificar categorias automaticamente:

```javascript
const categoriasMap = {
    // Renda
    "salário": "Renda",
    "freelance": "Renda",
    "venda": "Renda",
    "bônus": "Renda",
    
    // Alimentação
    "alimentação": "Alimentação",
    "comida": "Alimentação",
    "restaurante": "Alimentação",
    "supermercado": "Alimentação",
    "padaria": "Alimentação",
    
    // Transporte
    "transporte": "Transporte",
    "uber": "Transporte",
    "táxi": "Transporte",
    "gasolina": "Transporte",
    "ônibus": "Transporte",
    
    // Saúde
    "saúde": "Saúde",
    "farmácia": "Saúde",
    "médico": "Saúde",
    "dentista": "Saúde",
    
    // Animais
    "ração": "Animais",
    "veterinário": "Animais",
    "pet": "Animais",
    "cachorro": "Animais",
    "gato": "Animais"
};

function identificarCategoria(descricao) {
    const desc = descricao.toLowerCase();
    for (let [palavra, categoria] of Object.entries(categoriasMap)) {
        if (desc.includes(palavra)) {
            return categoria;
        }
    }
    return "Outros";
}
```

---

## 🔐 Validações Importantes

### 1. Validar Celular

```javascript
const celularLimpo = celular.replace(/\D/g, '');
if (celularLimpo.length < 11) {
    return { error: "Celular inválido" };
}
```

### 2. Validar Valor

```javascript
const valor = parseFloat(parametros);
if (isNaN(valor) || valor <= 0) {
    return { error: "Valor deve ser um número positivo" };
}
if (valor > 1000000) {
    return { error: "Valor muito alto. Limite: R$ 1.000.000,00" };
}
```

### 3. Validar Descrição

```javascript
if (!descricao || descricao.trim().length === 0) {
    return { error: "Descrição não pode estar vazia" };
}
if (descricao.length > 100) {
    return { error: "Descrição muito longa (máx 100 caracteres)" };
}
```

---

## 📈 Estatísticas em Tempo Real

Quando uma transação é registrada, o dashboard atualiza:

1. **Cards de Resumo**
   - Total de Receitas
   - Total de Despesas
   - Saldo
   - Saúde Financeira

2. **Gráficos**
   - Despesas por Categoria
   - Tendências Mensais

3. **Tabela de Transações**
   - Nova linha aparece no topo
   - Ordenada por data (mais recente primeiro)

---

## 🎯 Fluxo de Cadastro Completo

### Passo 1: Usuário Novo Envia Mensagem

```
👤 Usuário: "oi"
```

### Passo 2: Bot Verifica se Existe

```
N8N busca no Supabase:
SELECT * FROM usuarios WHERE celular = '5532984166669'
Resultado: Não encontrado
```

### Passo 3: Bot Envia Link de Cadastro

```
🤖 Bot: "Bem-vindo ao GranaZap!
Para começar, clique aqui: https://seu-dashboard.com/signup"
```

### Passo 4: Usuário Clica no Link

```
Abre a página de cadastro
Preenche: Nome, Email, Celular, Senha
Clica em "Criar Conta"
```

### Passo 5: Dados Salvos no Supabase

```sql
INSERT INTO usuarios (
    nome, email, celular, status, aceite_termos
) VALUES (
    'Rafaela', 'rafaela@email.com', '5532984166669', 'ativo', true
)
```

### Passo 6: Usuário Tenta Novamente

```
👤 Usuário: "entrada 100 Salário"
```

### Passo 7: Desta Vez Funciona!

```
N8N busca no Supabase:
SELECT * FROM usuarios WHERE celular = '5532984166669'
Resultado: Encontrado! ID = 2

Insere transação:
INSERT INTO transacoes (usuario_id, ...) VALUES (2, ...)

🤖 Bot: "✅ Receita registrada!
Valor: R$ 100,00
Saldo atual: R$ 100,00"
```

### Passo 8: Dashboard Mostra Dados

```
Dashboard atualiza em tempo real:
- Receitas: R$ 100,00
- Saldo: R$ 100,00
- Tabela mostra a transação
```

---

## 🚀 Próximas Melhorias

1. **Reconhecimento de Voz**: Converter áudio para texto
2. **IA para Categorização**: Usar ML para categorizar automaticamente
3. **Relatórios Automáticos**: Enviar resumo semanal/mensal
4. **Alertas**: Notificar quando atingir limite de gastos
5. **Múltiplos Usuários**: Suportar grupos com divisão de despesas

---

**Seu sistema GranaZap está pronto para revolucionar o controle financeiro!** 💰🚀
