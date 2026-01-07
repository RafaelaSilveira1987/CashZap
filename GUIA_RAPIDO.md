# 🚀 Guia Rápido de Início

## Passo 1: Configurar o Supabase (5 minutos)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute os scripts do arquivo `docs/manual_configuracao_fluxo.md` (seção 3.2)
4. Anote a **URL do projeto** e a **chave anon** (em Project Settings > API)

## Passo 2: Configurar o N8N (10 minutos)

1. Acesse sua instância do N8N
2. Importe o arquivo `ControleFinanceiro_RG_DNAICLUB.json`
3. Crie uma credencial do Supabase com a URL e chave do Passo 1
4. Configure a credencial em todos os nós do Supabase no fluxo
5. Configure o webhook da sua API do WhatsApp (Evolution API)
6. Ative o fluxo

## Passo 3: Hospedar o Dashboard (2 minutos)

### Opção A: Servidor Local (Teste)
```bash
cd dashboard-financeiro
python3 -m http.server 8000
```
Acesse: `http://localhost:8000`

### Opção B: Netlify (Produção)
1. Arraste a pasta `dashboard-financeiro` para [app.netlify.com/drop](https://app.netlify.com/drop)
2. Pronto! Seu dashboard está online

### Opção C: Vercel
```bash
npm i -g vercel
cd dashboard-financeiro
vercel
```

## Passo 4: Primeiro Acesso (1 minuto)

1. Abra o dashboard no navegador
2. Faça login com qualquer identificador (ex: `admin`)
3. Vá em **Configurações** (ícone de engrenagem)
4. Cole a **URL do Supabase** e a **chave anon**
5. Clique em **Salvar Configurações**
6. Faça logout e entre novamente com um ID de usuário válido

## Passo 5: Criar Primeiro Usuário (Manual)

Se ainda não tiver usuários cadastrados via WhatsApp:

1. No Supabase, vá em **Table Editor** > `usuarios`
2. Clique em **Insert row**
3. Preencha:
   - `nome`: Seu nome
   - `telefone`: Seu número (ex: 5511999999999)
   - `status`: ativo
4. Salve e anote o `id` gerado
5. Use esse `id` para fazer login no dashboard

## ✅ Pronto!

Agora você pode:
- ✅ Registrar transações pelo WhatsApp
- ✅ Visualizar no dashboard em tempo real
- ✅ Criar categorias personalizadas
- ✅ Gerar relatórios financeiros
- ✅ Adicionar mais usuários

## 📚 Documentação Completa

- **Configuração detalhada**: `docs/manual_configuracao_fluxo.md`
- **Uso do dashboard**: `docs/manual_uso_dashboard.md`
- **Informações gerais**: `README.md`

## 🆘 Problemas Comuns

### "Supabase não configurado"
- Verifique se a URL e a chave estão corretas
- Certifique-se de usar a chave **anon** (não a service_role)

### "Usuário não encontrado"
- Crie um usuário manualmente no Supabase (Passo 5)
- Ou envie uma mensagem pelo WhatsApp para criar automaticamente

### Dashboard não carrega dados
- Abra o Console do navegador (F12) e verifique erros
- Confirme que as tabelas foram criadas corretamente no Supabase
- Verifique as políticas de RLS (Row Level Security)

## 💡 Dicas

- Use o tema escuro para economizar bateria em dispositivos móveis
- Configure filtros personalizados para análises específicas
- Exporte relatórios regularmente para backup
- Desative usuários inativos para manter a base organizada

---

**Tempo total estimado**: 20 minutos ⏱️
