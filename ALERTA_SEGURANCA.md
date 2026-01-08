# ⚠️ ALERTA DE SEGURANÇA: CHAVE INCORRETA DETECTADA

O erro que você está vendo (**401 Unauthorized / Forbidden use of secret API key**) acontece porque você está usando a **Service Role Key** no navegador.

### Por que isso é perigoso?
A chave que começa com `sb_secret_...` dá acesso total para apagar ou modificar qualquer dado do seu banco sem restrições. O Supabase bloqueia o uso dela em sites (browsers) para proteger seus dados.

### Como corrigir agora:
1. Vá no painel do Supabase > **Project Settings** > **API**.
2. Procure pela chave chamada **`anon` `public`**. Ela é a única que funciona no Dashboard.
3. Copie essa chave.
4. Abra o arquivo `js/config.js` e substitua o valor da `key` por essa nova chave.

### Exemplo do que mudar:
❌ **Errado (NÃO USE):** `sb_secret_vt_34shHD2...`
✅ **Correto (USE ESTA):** `eyJhbGciOiJIUzI1NiIsInR5cCI6...` (Chave Anon Public)

---
**Após trocar a chave, o erro 401 desaparecerá instantaneamente!**
