# Guia de Importação: GranaZap no Typebot

Este guia explica como importar o arquivo JSON para o seu Typebot e realizar as configurações finais.

## 📥 Passo 1: Importação

1. Acesse o seu painel do **Typebot**.
2. Clique em **"Create a typebot"** -> **"Import a file"**.
3. Selecione o arquivo `GranaZap_Typebot_Import.json` que está na raiz deste projeto.
4. O fluxo será carregado automaticamente com todos os grupos, blocos e variáveis.

## ⚙️ Passo 2: Configurar Webhooks

O arquivo importado contém URLs de exemplo (`https://seu-n8n.com/...`). Você **precisa** atualizar essas URLs com os endereços reais do seu N8N:

1. Localize os blocos de **Webhook** no fluxo.
2. Substitua a URL pela URL do seu Webhook no N8N.
3. Certifique-se de que o N8N esteja configurado para receber esses POSTs.

## 📱 Passo 3: Conectar ao WhatsApp

1. Vá na aba **"Share"** (Compartilhar) do seu Typebot.
2. Escolha **"WhatsApp"**.
3. Siga as instruções para conectar via **Evolution API** ou integração nativa.
4. Certifique-se de que a variável `{{user_phone}}` esteja sendo capturada corretamente.

## 🧪 Passo 4: Testar

1. Abra o chat no WhatsApp.
2. Siga o fluxo de cadastro.
3. Verifique se os dados estão chegando no **Supabase**.
4. Tente registrar uma transação e veja se o saldo retorna corretamente.

---

**Dica**: Você pode personalizar as mensagens e emojis dentro do Typebot para que fiquem com a "cara" da sua marca! 🚀
