# 🚨 Como Resolver o Erro 401 (Unauthorized) no MordomoPay

Se você está vendo o erro 401 no console, isso significa que o Supabase está bloqueando o acesso do Dashboard. Siga estes 2 passos simples para resolver:

## Passo 1: Use a Chave Correta (Anon Public Key)
O Dashboard **não pode** usar a "service_role" key por segurança.
1. Vá no painel do seu Supabase.
2. Clique em **Project Settings** (ícone de engrenagem) > **API**.
3. Procure por **`anon` `public`**.
4. Copie essa chave e cole no seu arquivo `js/config.js` ou na tela de configurações do dashboard.

## Passo 2: Liberar a Tabela no Banco de Dados (SQL)
Mesmo com a chave certa, o Supabase bloqueia leituras por padrão (RLS).
1. No painel do Supabase, vá em **SQL Editor**.
2. Clique em **New Query**.
3. Cole o conteúdo do arquivo `fix_permissions.sql` que enviei.
4. Clique em **Run**.

---
### Por que isso acontece?
O Supabase é "seguro por padrão". Ele exige que você diga explicitamente: *"Sim, eu permito que meu dashboard procure usuários pelo número de celular"*. Sem o Passo 2, ele retornará 401 mesmo que a senha esteja certa.
