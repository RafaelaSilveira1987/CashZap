# Guia de Configuração do Agente Typebot - GranaZap

Este guia detalha como estruturar as perguntas e a lógica do seu agente no Typebot para garantir a melhor experiência.

## 📋 Estrutura do Bot

### 1. Início e Identificação
- **Bubble**: "Olá! Eu sou o assistente do GranaZap. 🚀"
- **Bubble**: "Vou te ajudar a controlar suas finanças de forma simples."
- **Input (Text)**: "Para começar, como posso te chamar?" -> `{{nome}}`

### 2. Verificação de Cadastro
- **Webhook (GET)**: Consultar N8N se o celular `{{user_phone}}` já existe.
- **Condition**:
  - Se **Existe**: Pular para [Menu Principal]
  - Se **Não Existe**: Continuar para [Cadastro]

### 3. Fluxo de Cadastro
- **Bubble**: "Vi que você ainda não tem conta. Vamos criar uma agora!"
- **Input (Email)**: "Qual o seu melhor e-mail?" -> `{{email}}`
- **Input (Password)**: "Crie uma senha para acessar seu dashboard web:" -> `{{senha}}`
- **Webhook (POST)**: Enviar `{{nome}}`, `{{email}}`, `{{senha}}`, `{{user_phone}}` para o N8N.
- **Bubble**: "Pronto! Sua conta foi criada. Agora você já pode registrar seus gastos."

### 4. Menu Principal (Opções)
- **Buttons**:
  - "💰 Registrar Ganho/Gasto"
  - "📊 Ver Saldo"
  - "📅 Últimas Transações"
  - "🌐 Acessar Dashboard"

### 5. Lógica de Registro
- **Input (Text)**: "O que você quer registrar? (Ex: entrada 100 Salário ou saida 50 Almoço)" -> `{{mensagem}}`
- **Webhook (POST)**: Enviar `{{mensagem}}` e `{{user_phone}}` para o N8N.
- **Bubble**: "Registrado com sucesso! ✅ Seu novo saldo é `{{novo_saldo}}`."

---

## ⚙️ Configurações Técnicas no Typebot

### Variáveis Sugeridas
- `nome`: Nome do usuário
- `email`: E-mail do usuário
- `senha`: Senha de acesso
- `user_phone`: Número do WhatsApp (capturado automaticamente)
- `mensagem`: Comando de transação
- `novo_saldo`: Retorno do N8N

### Webhooks (Exemplo de Configuração)
- **URL**: `https://seu-n8n.com/webhook/typebot`
- **Method**: POST
- **Headers**:
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "type": "transaction",
    "phone": "{{user_phone}}",
    "content": "{{mensagem}}"
  }
  ```

---

## 🎨 Dicas de Design
- Use **Emojis** para tornar a conversa leve.
- Use **Botões** sempre que possível para facilitar a navegação.
- Adicione um **atraso (typing)** entre as mensagens para parecer mais humano.
- No final de cada registro, ofereça o link do dashboard: `https://seu-dashboard.com`

---

**Com o Typebot, o GranaZap deixa de ser apenas um bot e se torna um verdadeiro Agente Financeiro!** 🤖💰
