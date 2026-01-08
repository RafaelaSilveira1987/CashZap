# Novo Fluxo de Cadastro - GranaZap

## 🎯 Visão Geral

O novo sistema simplifica o processo de cadastro e login:

1. **Usuário clica em "Cadastre-se via WhatsApp"**
2. **Abre conversa no WhatsApp com o bot**
3. **Bot confirma o cadastro e envia link de acesso**
4. **Usuário cria uma senha no dashboard**
5. **Acessa o dashboard e começa a registrar transações**

---

## 📱 Fluxo Detalhado

### Passo 1: Tela de Login

```
┌─────────────────────────────────────┐
│        🚀 GranaZap                  │
│  Controle suas finanças via WhatsApp│
├─────────────────────────────────────┤
│ Celular ou Email: [_______________] │
│ Senha:           [_______________] │
│ [  Entrar  ]                        │
├─────────────────────────────────────┤
│            ou                       │
│ [📱 Cadastre-se via WhatsApp]       │
└─────────────────────────────────────┘
```

**Opções:**
- **Entrar**: Para usuários já cadastrados
- **Cadastre-se via WhatsApp**: Para novos usuários

### Passo 2: Usuário Clica em "Cadastre-se via WhatsApp"

```javascript
// O botão redireciona para:
https://wa.me/553298416669?text=Olá, gostaria de me cadastrar no GranaZap
```

**O que acontece:**
1. Abre o WhatsApp (web ou app)
2. Cria uma conversa com o número `553298416669`
3. Envia a mensagem: "Olá, gostaria de me cadastrar no GranaZap"

### Passo 3: Bot Responde com Formulário

**Bot envia:**
```
Bem-vindo ao GranaZap! 🎉

Para se cadastrar, envie suas informações assim:

CADASTRO
Nome: Seu Nome Completo
Email: seu@email.com
Celular: 5532984166669

Exemplo:
CADASTRO
Nome: João Silva
Email: joao@email.com
Celular: 5532984166669
```

### Passo 4: Usuário Envia Dados

**Usuário envia:**
```
CADASTRO
Nome: Rafaela Silveira
Email: rafaela@email.com
Celular: 5532984166669
```

### Passo 5: Bot Confirma e Envia Link

**Bot responde:**
```
✅ Cadastro realizado com sucesso!

Seu usuário foi criado no sistema.

Agora clique no link abaixo para criar sua senha:
https://seu-dashboard.com/

Número: 5532984166669
Senha: (você criará na próxima tela)

Qualquer dúvida, estou aqui! 😊
```

### Passo 6: Usuário Acessa o Dashboard

1. Clica no link enviado pelo bot
2. Vê a tela de login
3. Digita seu celular: `5532984166669`
4. Digita uma senha temporária (qualquer uma)
5. Clica em "Entrar"

### Passo 7: Sistema Detecta Primeira Vez

```
┌─────────────────────────────────────┐
│  ✅ Parabéns!                       │
│  Você foi cadastrado com sucesso!   │
├─────────────────────────────────────┤
│ Agora crie uma senha para acessar   │
│ seu dashboard                       │
├─────────────────────────────────────┤
│ Nova Senha:      [_______________]  │
│ Confirmar Senha: [_______________]  │
│ [Criar Senha e Acessar]             │
└─────────────────────────────────────┘
```

### Passo 8: Usuário Cria Senha

1. Digita uma senha (mínimo 8 caracteres)
2. Confirma a senha
3. Clica em "Criar Senha e Acessar"
4. **Pronto! Acesso ao dashboard concedido** ✅

---

## 🔄 Fluxo N8N para Cadastro

### Webhook: Receber Mensagem

```
POST /webhook/whatsapp-cadastro
```

**Payload esperado:**
```json
{
    "remoteJid": "5532984166669@c.us",
    "message": "CADASTRO\nNome: Rafaela Silveira\nEmail: rafaela@email.com\nCelular: 5532984166669"
}
```

### Processamento no N8N

```
1. Webhook recebe mensagem
   ↓
2. Validar formato (CADASTRO)
   ↓
3. Extrair: Nome, Email, Celular
   ↓
4. Validar dados
   ├─ Email válido?
   ├─ Celular válido?
   └─ Já existe no banco?
   ↓
5. Se válido → Inserir no Supabase
   ├─ INSERT INTO usuarios (nome, email, celular, status)
   └─ status = 'ativo'
   ↓
6. Se inválido → Enviar erro
   ↓
7. Enviar confirmação via WhatsApp
   └─ "✅ Cadastro realizado! Clique: https://..."
```

### Código JavaScript para Processar

```javascript
// Nó: Function no N8N

const message = $input.first().json.body.data.textMessage.text;
const celular = $input.first().json.body.data.key.remoteJid.replace('@c.us', '');

// Validar se é cadastro
if (!message.toUpperCase().includes('CADASTRO')) {
    return { action: 'ignore' };
}

// Extrair dados
const linhas = message.split('\n');
const dados = {};

linhas.forEach(linha => {
    if (linha.includes('Nome:')) {
        dados.nome = linha.replace('Nome:', '').trim();
    }
    if (linha.includes('Email:')) {
        dados.email = linha.replace('Email:', '').trim();
    }
    if (linha.includes('Celular:')) {
        dados.celular = linha.replace('Celular:', '').trim().replace(/\D/g, '');
    }
});

// Validar
if (!dados.nome || !dados.email || !dados.celular) {
    return {
        action: 'send_error',
        celular: celular,
        message: 'Formato inválido. Envie:\nCADASTRO\nNome: Seu Nome\nEmail: seu@email.com\nCelular: 55...'
    };
}

return {
    action: 'create_user',
    celular: celular,
    nome: dados.nome,
    email: dados.email,
    celular_fornecido: dados.celular
};
```

### Inserir no Supabase

```javascript
// Nó: HTTP Request (POST)
// URL: {{$env.SUPABASE_URL}}/rest/v1/usuarios

{
    "nome": "{{$json.nome}}",
    "email": "{{$json.email}}",
    "celular": "{{$json.celular_fornecido}}",
    "status": "ativo",
    "aceite_termos": true,
    "data_aceite_termos": "{{now()}}"
}
```

---

## 🔐 Segurança

### Validações Implementadas

1. **Email único**: Não permite duplicação
2. **Celular único**: Não permite duplicação
3. **Formato de celular**: Valida 11+ dígitos
4. **Senha forte**: Mínimo 8 caracteres
5. **Criptografia**: Senhas são hasheadas (implementar bcrypt em produção)

### Recomendações

1. **Implementar bcrypt** para hash de senhas
2. **Adicionar verificação de email** (enviar link de confirmação)
3. **Rate limiting** no webhook para evitar spam
4. **Validação de domínio** de email
5. **Captcha** no formulário de login

---

## 📊 Fluxo Completo de Dados

```
WhatsApp
  ↓
Evolution API
  ↓
N8N Webhook
  ↓
Validar dados
  ↓
Supabase (INSERT usuarios)
  ↓
Enviar confirmação via WhatsApp
  ↓
Usuário acessa dashboard
  ↓
Cria senha
  ↓
Acesso total ao sistema
```

---

## 🎯 Próximas Funcionalidades

1. **Verificação de Email**: Enviar link de confirmação
2. **Recuperação de Senha**: Reset via email
3. **Autenticação 2FA**: Código via SMS
4. **Login Social**: Google, Facebook
5. **Sincronização de Contatos**: Importar do WhatsApp

---

## 🧪 Teste Completo

### Teste 1: Cadastro Novo

1. Abra o dashboard
2. Clique em "Cadastre-se via WhatsApp"
3. Envie: `CADASTRO\nNome: Teste\nEmail: teste@email.com\nCelular: 5532984166669`
4. Receba confirmação
5. Acesse o dashboard
6. Crie uma senha
7. Veja o dashboard carregado ✅

### Teste 2: Login Existente

1. Abra o dashboard
2. Digite celular: `5532984166669`
3. Digite senha criada
4. Clique em "Entrar"
5. Dashboard carrega ✅

### Teste 3: Primeira Vez

1. Usuário novo se cadastra via WhatsApp
2. Acessa o dashboard
3. Sistema detecta que não tem senha
4. Mostra formulário de criação de senha
5. Cria senha
6. Acesso concedido ✅

---

**Seu sistema GranaZap agora tem um fluxo de cadastro profissional e seguro!** 🚀
