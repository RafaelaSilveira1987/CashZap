# Integração Conversacional: Typebot + N8N + GranaZap

Este manual descreve como configurar o **Typebot** como o agente frontal para o GranaZap, permitindo um cadastro amigável e registro de transações via chat.

## 🏗️ Arquitetura do Fluxo

1. **Typebot**: Interface de chat (WhatsApp/Web) que coleta dados do usuário.
2. **N8N**: Orquestrador que recebe os dados do Typebot e processa a lógica.
3. **Supabase**: Banco de dados que armazena usuários e transações.
4. **Dashboard**: Interface web para visualização dos dados.

---

## 🤖 Passo 1: Configurar o Typebot

Crie um novo Typebot com o seguinte fluxo:

### 1.1 Fluxo de Cadastro
- **Pergunta (Texto)**: "Olá! Bem-vindo ao GranaZap. Qual é o seu nome completo?" -> Variável `{{nome}}`
- **Pergunta (Email)**: "Ótimo, {{nome}}! Qual é o seu melhor e-mail?" -> Variável `{{email}}`
- **Pergunta (Senha)**: "Agora, crie uma senha segura para acessar seu dashboard:" -> Variável `{{senha}}`
- **Webhook (POST)**: Enviar para o N8N
  - URL: `https://seu-n8n.com/webhook/typebot-cadastro`
  - Body:
    ```json
    {
      "nome": "{{nome}}",
      "email": "{{email}}",
      "senha": "{{senha}}",
      "celular": "{{user_phone}}"
    }
    ```

### 1.2 Fluxo de Transações
- **Pergunta (Texto)**: "O que você deseja registrar hoje? (Ex: entrada 100 Salário)" -> Variável `{{mensagem}}`
- **Webhook (POST)**: Enviar para o N8N
  - URL: `https://seu-n8n.com/webhook/typebot-transacao`
  - Body:
    ```json
    {
      "mensagem": "{{mensagem}}",
      "celular": "{{user_phone}}"
    }
    ```

---

## 🤖 Passo 2: Configurar o N8N

Importe ou ajuste seu fluxo `ControleFinanceiro.json` para incluir os novos Webhooks:

### 2.1 Webhook de Cadastro
- **Caminho**: `/webhook/typebot-cadastro`
- **Lógica**:
  1. Recebe Nome, Email, Senha e Celular.
  2. Verifica se o celular já existe no Supabase.
  3. Se não existe, insere na tabela `usuarios`.
  4. Retorna mensagem de sucesso para o Typebot.

### 2.2 Webhook de Transação
- **Caminho**: `/webhook/typebot-transacao`
- **Lógica**:
  1. Recebe a mensagem (ex: "saida 50 Almoço").
  2. Identifica o usuário pelo celular.
  3. Processa a transação (Tipo, Valor, Descrição).
  4. Insere no Supabase.
  5. Retorna o novo saldo para o Typebot.

---

## 🔐 Passo 3: Segurança e Senhas

Com o Typebot coletando a senha no cadastro:
1. O N8N deve salvar essa senha diretamente no campo `senha` da tabela `usuarios`.
2. O Dashboard usará essa senha para o login.
3. **Importante**: Certifique-se de que a conexão entre Typebot e N8N seja via HTTPS.

---

## 📱 Passo 4: Conectar ao WhatsApp

1. No Typebot, vá em **Settings** -> **WhatsApp**.
2. Conecte sua conta (via Evolution API ou integração nativa).
3. Agora, quando o usuário chamar no WhatsApp, o Typebot iniciará a conversa guiada.

---

## 💡 Vantagens do Typebot
- **Conversacional**: Mais amigável que comandos de texto puros.
- **Validação**: O Typebot valida se o e-mail é real antes de enviar ao N8N.
- **Multimídia**: Você pode enviar áudios, imagens e botões.
- **Histórico**: O Typebot mantém o contexto da conversa.

---

**Com essa configuração, seu GranaZap se torna um assistente financeiro inteligente e fácil de usar!** 🚀
