# Manual Completo: Integração WhatsApp + N8N + GranaZap Dashboard

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Configurar Evolution API](#passo-1-configurar-evolution-api)
4. [Passo 2: Configurar N8N](#passo-2-configurar-n8n)
5. [Passo 3: Criar Fluxos de Mensagens](#passo-3-criar-fluxos-de-mensagens)
6. [Passo 4: Testar Integração](#passo-4-testar-integração)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     USUÁRIO (WhatsApp)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EVOLUTION API                             │
│              (Gerenciador de WhatsApp)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        N8N                                   │
│         (Processamento de Mensagens e Lógica)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│              (Banco de Dados PostgreSQL)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   DASHBOARD GRANAZAP                         │
│              (Visualização em Tempo Real)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Pré-requisitos

Você precisará de:

1. **Evolution API** (já configurada ou em execução)
   - URL base: `https://sua-evolution-api.com`
   - API Key: `sua-chave-api`

2. **N8N** (instalado e rodando)
   - URL: `https://seu-n8n.com`
   - Acesso administrativo

3. **Supabase** (projeto já criado)
   - URL do projeto
   - Chave API pública (anon)

4. **Número de WhatsApp** (dedicado para o bot)
   - Deve estar vinculado à Evolution API

---

## 🔧 Passo 1: Configurar Evolution API

### 1.1 Instalar Evolution API

Se ainda não tiver, instale via Docker:

```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e EVOLUTION_API_URL=http://localhost:8080 \
  -e EVOLUTION_API_KEY=sua-chave-super-secreta \
  atendai/evolution-api:latest
```

### 1.2 Conectar Número de WhatsApp

1. Acesse `http://localhost:8080` (ou sua URL)
2. Clique em **"Conectar"** ou **"Add Instance"**
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a conexão ser estabelecida
5. Copie o `instance_name` (ex: `granazap_bot`)

### 1.3 Configurar Webhook

1. No painel da Evolution API, vá em **Webhooks**
2. Configure:
   - **URL**: `https://seu-n8n.com/webhook/whatsapp-messages`
   - **Eventos**: `messages`, `status_instance`
   - **Método**: POST

---

## 🤖 Passo 2: Configurar N8N

### 2.1 Criar Credenciais

1. Acesse seu N8N
2. Vá em **Credentials** (Credenciais)
3. Clique em **+ New** (Novo)
4. Escolha **HTTP Request**
5. Preencha:
   - **Name**: `Evolution API`
   - **Base URL**: `https://sua-evolution-api.com`
   - **Headers**: 
     - `apikey`: `sua-chave-api`
     - `Content-Type`: `application/json`

6. Repita para **Supabase**:
   - **Name**: `Supabase`
   - **Base URL**: `https://seu-projeto.supabase.co`
   - **Headers**:
     - `Authorization`: `Bearer sua-chave-anon`
     - `Content-Type`: `application/json`

### 2.2 Criar Webhook para Receber Mensagens

1. Crie um novo workflow no N8N
2. Adicione um nó **Webhook**
3. Configure:
   - **Method**: POST
   - **Path**: `/webhook/whatsapp-messages`
   - **Save** (Salvar)
4. Copie a URL completa do webhook

---

## 📨 Passo 3: Criar Fluxos de Mensagens

### 3.1 Fluxo 1: Receber Mensagem e Processar

```
Webhook (Recebe mensagem)
    ↓
Extrair dados (número, texto, timestamp)
    ↓
Validar formato da mensagem
    ↓
Buscar usuário no Supabase
    ↓
Se não existe → Enviar link de cadastro
    ↓
Se existe → Processar comando
```

### 3.2 Fluxo 2: Registrar Transação

**Formato de mensagem esperado:**
```
entrada 100 Salário
saida 50 Alimentação
```

**Processamento:**
1. Extrair tipo (entrada/saida), valor e descrição
2. Validar formato
3. Inserir no Supabase
4. Enviar confirmação via WhatsApp

### 3.3 Exemplo de Nó N8N para Processar Mensagem

```javascript
// Nó: Function
// Descrição: Parsear mensagem de transação

const message = $input.first().json.body.data.textMessage.text;
const sender = $input.first().json.body.data.key.remoteJid;

// Extrair tipo, valor e descrição
const regex = /^(entrada|saida)\s+([0-9.]+)\s+(.+)$/i;
const match = message.match(regex);

if (!match) {
    return {
        valid: false,
        error: "Formato inválido. Use: entrada 100 Salário"
    };
}

return {
    valid: true,
    tipo: match[1].toLowerCase(),
    valor: parseFloat(match[2]),
    descricao: match[3],
    celular: sender.replace('@c.us', ''),
    timestamp: new Date().toISOString()
};
```

### 3.4 Exemplo de Nó N8N para Inserir no Supabase

```javascript
// Nó: HTTP Request
// Método: POST
// URL: {{$env.SUPABASE_URL}}/rest/v1/transacoes

{
    "usuario_id": "{{$json.usuario_id}}",
    "tipo": "{{$json.tipo}}",
    "valor": "{{$json.valor}}",
    "descricao": "{{$json.descricao}}",
    "categoria_id": "{{$json.categoria_id}}",
    "data": "{{$json.timestamp}}",
    "origem": "whatsapp"
}
```

---

## 🧪 Passo 4: Testar Integração

### 4.1 Teste Manual

1. **Envie uma mensagem** para o número do bot:
   ```
   entrada 100 Salário
   ```

2. **Verifique os logs** do N8N
3. **Confirme no Supabase** que a transação foi inserida
4. **Abra o Dashboard** e veja a transação aparecer em tempo real

### 4.2 Teste de Cadastro

1. **Usuário novo envia mensagem**
2. **Bot responde** com link de cadastro:
   ```
   Olá! Você não está cadastrado.
   Clique aqui para se cadastrar: https://seu-dashboard.com/signup
   ```

3. **Usuário se cadastra** na página
4. **Tenta novamente** enviar uma transação
5. **Desta vez funciona!**

---

## 📝 Fluxo Completo de Mensagens

### Mensagem 1: Usuário Novo

```
👤 Usuário: "Oi, como funciona?"

🤖 Bot: "Olá! Bem-vindo ao GranaZap!
Para começar, você precisa se cadastrar.
Clique aqui: https://seu-dashboard.com/signup

Após se cadastrar, você pode enviar transações assim:
entrada 100 Salário
saida 50 Alimentação"
```

### Mensagem 2: Usuário Registrado - Entrada

```
👤 Usuário: "entrada 440 Freelance"

🤖 Bot: "✅ Receita registrada!
Valor: R$ 440,00
Descrição: Freelance
Saldo atual: R$ 403,00"
```

### Mensagem 3: Usuário Registrado - Saída

```
👤 Usuário: "saida 37 Ração para animais"

🤖 Bot: "✅ Despesa registrada!
Valor: R$ 37,00
Descrição: Ração para animais
Categoria: Animais
Saldo atual: R$ 366,00"
```

---

## 🔄 Fluxo N8N Recomendado

### Workflow Principal

```
┌─ Webhook (Recebe mensagem)
│
├─ IF: Mensagem contém "cadastro"?
│  └─ Enviar link de cadastro
│
├─ IF: Usuário existe no Supabase?
│  ├─ NÃO → Enviar link de cadastro
│  └─ SIM → Continuar
│
├─ Parsear mensagem (tipo, valor, descrição)
│
├─ Validar formato
│  ├─ INVÁLIDO → Enviar mensagem de erro
│  └─ VÁLIDO → Continuar
│
├─ Buscar categoria por descrição (IA)
│
├─ Inserir transação no Supabase
│
├─ Calcular novo saldo
│
└─ Enviar confirmação via WhatsApp
```

---

## 🛠️ Troubleshooting

### Problema: Webhook não recebe mensagens

**Solução:**
1. Verifique se a URL do webhook está correta na Evolution API
2. Teste com: `curl -X POST https://seu-n8n.com/webhook/whatsapp-messages -d '{"test": "ok"}'`
3. Verifique os logs do N8N

### Problema: Mensagens não são processadas

**Solução:**
1. Verifique se o N8N está rodando
2. Verifique as credenciais do Supabase
3. Veja os logs de erro no N8N

### Problema: Transações não aparecem no Dashboard

**Solução:**
1. Verifique se a transação foi inserida no Supabase
2. Limpe o cache do navegador (Ctrl+F5)
3. Verifique se o usuário_id está correto

### Problema: Bot não responde

**Solução:**
1. Verifique se a instância do WhatsApp está conectada
2. Verifique os logs da Evolution API
3. Teste a conexão com um simples "ping"

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** do N8N
2. **Verifique os logs** da Evolution API
3. **Verifique o Supabase** para ver se os dados foram inseridos
4. **Teste manualmente** cada componente

---

## 🎓 Próximos Passos

Agora que você tem a integração funcionando:

1. **Melhorar o reconhecimento de categorias** com IA
2. **Adicionar comandos** como "saldo", "últimas transações"
3. **Implementar relatórios** via WhatsApp
4. **Adicionar suporte a múltiplos usuários** em um único chat de grupo

---

**Parabéns! Seu sistema GranaZap está pronto para crescer!** 🚀
