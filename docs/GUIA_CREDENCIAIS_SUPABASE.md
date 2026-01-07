# Guia Visual: Como Encontrar suas Credenciais do Supabase

## 🎯 Objetivo
Este guia mostra exatamente onde encontrar a **URL** e a **API Key** do seu projeto Supabase para configurar o dashboard.

## 📍 Passo 1: Acessar o Painel do Supabase

1. Abra [supabase.com](https://supabase.com) e faça login
2. Selecione seu projeto na lista
3. Você será levado ao painel principal

## 🔑 Passo 2: Encontrar as Credenciais

### Localização no Painel:
- No menu lateral esquerdo, clique em **Project Settings** (ícone de engrenagem)
- Na página que abrir, clique na aba **API** (ou **Configuration** em alguns projetos)

### Você verá uma seção chamada "Project API keys"

## 📋 Passo 3: Copiar as Informações

Na seção **Project API keys**, você encontrará:

### 1️⃣ **Project URL** (ou **Supabase URL**)
```
Exemplo: https://ktjpphfxulkymobkjvqo.supabase.co
```
- Este é o endereço do seu servidor Supabase
- **Copie e cole** esta URL no campo "URL do Supabase" do dashboard

### 2️⃣ **anon public** (ou **Public API Key**)
```
Exemplo: sb_secret_vt_34shHD2vjIdn4rso3lg_Xc-KgTdW
```
- Esta é a chave pública que permite acesso ao banco de dados
- **Copie e cole** esta chave no campo "Chave Anon do Supabase" do dashboard

## ⚠️ IMPORTANTE: Qual Chave Usar?

No painel do Supabase, você verá **duas chaves**:

| Chave                    | Uso                                          | Use no Dashboard? |
| ------------------------ | -------------------------------------------- | ----------------- |
| **anon public**          | Acesso público (seguro para frontend)       | ✅ **SIM**         |
| **service_role secret**  | Acesso administrativo (apenas backend)      | ❌ **NÃO**         |

**Use SEMPRE a chave `anon public` no dashboard!**

## 🔍 Verificação: Como Saber se está Correto

Após colar as credenciais no dashboard, abra o **Console do Navegador** (F12) e procure por:

```
✅ [CONFIG] Configurações carregadas com sucesso!
🔌 [SUPABASE] Tentando inicializar cliente...
📝 [SUPABASE] Criando cliente com:
   URL: https://ktjpphfxulkymobkjvqo.supabase.co
   Key (primeiros 20 chars): sb_secret_vt_34shHD2...
✅ [SUPABASE] Cliente criado com sucesso!
```

Se vir esses logs com **✅**, significa que a conexão está funcionando!

## ❌ Se Vir Erros

Se vir mensagens como:

```
❌ [SUPABASE] Credenciais ausentes!
   URL: ✗ Vazia
   Key: ✗ Vazia
```

Significa que as credenciais não foram salvas. Verifique:

1. Se você clicou em **"Salvar Configurações"** após preencher os campos
2. Se o navegador permite o uso de `localStorage` (alguns navegadores em modo privado não permitem)
3. Se você usou a chave **`anon public`** e não a `service_role secret`

## 🧪 Teste de Conexão

Para testar se a conexão está funcionando:

1. Abra o Console (F12)
2. Digite: `isSupabaseConfigured()`
3. Se retornar `true`, a conexão está OK
4. Se retornar `false`, há um problema com as credenciais

## 📞 Próximos Passos

Após confirmar que as credenciais estão corretas:

1. Faça login com o número de celular de um usuário cadastrado
2. Se conseguir acessar, o sistema está funcionando perfeitamente!
3. Se não conseguir, verifique os logs no Console para mensagens de erro específicas

---

**Dúvida?** Consulte os logs no Console (F12) - eles indicarão exatamente onde está o problema!
