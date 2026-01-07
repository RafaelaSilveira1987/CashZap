# Manual de Configuração: Fluxo N8N e Canal de Atendimento

**Autor:** Manus AI
**Data:** 2026-01-07

## 1. Visão Geral do Sistema

Este manual descreve como configurar o fluxo de automação no N8N e integrá-lo a um canal de atendimento único (WhatsApp) para servir a múltiplos usuários. A solução utiliza a **Evolution API** como ponte entre o WhatsApp e o **N8N**, com o **Supabase** atuando como o cérebro e banco de dados central.

## 2. Configuração do Canal (WhatsApp)

Para ter um canal único atendendo várias pessoas, você deve utilizar uma API de integração. Recomendamos a **Evolution API**.

### 2.1. Passos na Evolution API
1.  **Criar Instância:** Crie uma nova instância (ex: `Atendimento_Financeiro`).
2.  **Conectar WhatsApp:** Escaneie o QR Code com o número que será o "contato único".
3.  **Configurar Webhook:**
    *   **URL:** Insira a URL do Webhook gerada pelo seu nó de entrada no N8N.
    *   **Eventos:** Selecione `MESSAGES_UPSERT` (para receber novas mensagens).
    *   **Habilitar:** Marque como ativo.

## 3. Configuração do Fluxo no N8N

O fluxo deve ser capaz de identificar o usuário pelo número de telefone e isolar seus dados.

### 3.1. Nó de Entrada (Webhook)
O Webhook recebe o JSON da Evolution API. O dado mais importante é o número do remetente:
-   **Caminho:** `body.data.key.remoteJid` (geralmente no formato `553298416669@s.whatsapp.net`).

### 3.2. Lógica de Identificação (Multiusuário)
Para que o fluxo funcione para várias pessoas, siga esta lógica:

1.  **Extração do Número:** Use um nó `Set` ou `Code` para limpar o número, removendo o `@s.whatsapp.net`.
2.  **Consulta ao Banco:** Use um nó `Supabase` para buscar na tabela `usuarios` onde o campo `celular` é igual ao número extraído.
3.  **Validação de Acesso:**
    *   Se o usuário **não existir**: Envie uma mensagem automática solicitando o cadastro ou informando que o acesso não está autorizado.
    *   Se o usuário **estiver inativo**: Informe que a conta está bloqueada.
    *   Se o usuário **existir e estiver ativo**: Capture o `id` do usuário para usar em todas as próximas etapas.

### 3.3. Registro de Transações
Ao inserir uma transação (nó `Supabase: Insert`), você **DEVE** sempre preencher o campo `usuario_id` com o ID recuperado na etapa anterior. Isso garante que, no dashboard, a Rafaela veja apenas os dados dela e o João veja apenas os dele.

## 4. Manual de Uso para o Usuário Final

Como o contato é único, o usuário interage de forma natural:

1.  **Comando de Texto:** "Gastei 50 reais com almoço hoje".
2.  **Processamento IA:** O N8N usa um nó de IA (como OpenAI ou Groq) para extrair:
    *   **Valor:** 50.00
    *   **Descrição:** Almoço
    *   **Tipo:** saida
    *   **Data:** Data atual
3.  **Confirmação:** O bot responde: "✅ Registrado: Almoço - R$ 50,00".

## 5. Resolução de Problemas de Acesso

Se um usuário não consegue acessar o dashboard, verifique:

| Problema                | Causa Provável                               | Solução                                                                 |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| Login falha             | Número de celular diferente no banco         | Verifique se o campo `celular` tem o número EXATO (incluindo DDI e DDD). |
| Erro de Supabase        | Credenciais incorretas no `config.js`        | Revise a URL e a API Key no arquivo ou na tela de configurações.        |
| Dados não aparecem      | `usuario_id` incorreto na transação          | Verifique se o fluxo N8N está gravando o ID correto do usuário.         |
| Usuário não encontrado  | RLS (Row Level Security) bloqueando          | Desative o RLS temporariamente para teste ou configure as políticas.    |

## 6. Dicas para Escalar
-   **Menu Inicial:** Configure uma mensagem de "Boas-vindas" automática para novos números.
-   **Categorias:** Permita que o usuário crie categorias via chat enviando "Criar categoria Lazer".
-   **Relatórios:** Adicione um comando "Resumo do dia" que retorna os totais via WhatsApp.
