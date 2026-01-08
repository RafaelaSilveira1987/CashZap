# Manual Final do Usuário - Dashboard GranaZap

## 🎯 Bem-vindo ao GranaZap!

Este é o seu guia completo para usar o dashboard de controle financeiro integrado ao seu fluxo de WhatsApp via N8N.

---

## 📋 Índice

1. [Primeiro Acesso](#primeiro-acesso)
2. [Tela de Login](#tela-de-login)
3. [Dashboard Principal](#dashboard-principal)
4. [Gerenciando Receitas e Despesas](#gerenciando-receitas-e-despesas)
5. [Visualizando Relatórios](#visualizando-relatórios)
6. [Gerenciando Usuários](#gerenciando-usuários)
7. [Configurações](#configurações)
8. [Dicas e Truques](#dicas-e-truques)

---

## 🚀 Primeiro Acesso

### Passo 1: Acessar o Dashboard
1. Abra seu navegador e acesse: `https://cash-zap.vercel.app` (ou a URL do seu servidor)
2. Você verá a tela de login do GranaZap

### Passo 2: Configurar o Supabase (Primeira Vez)
Se for a primeira vez, você precisa configurar a conexão com o banco de dados:

1. Clique em **"Configurar Supabase Primeiro"**
2. Preencha:
   - **URL do Supabase**: Cole a URL do seu projeto (ex: `https://seu-projeto.supabase.co`)
   - **Chave Anon do Supabase**: Cole a chave pública (começa com `eyJ...`)
3. Clique em **"Salvar e Voltar"**

### Passo 3: Fazer Login
1. Digite seu número de celular (ex: `553298416669`)
2. Clique em **"Entrar"**
3. Pronto! Você está no dashboard

---

## 🔐 Tela de Login

### Campos
- **Usuário (ID ou Telefone)**: Digite seu número de celular cadastrado no sistema

### Botões
- **Entrar**: Faz login com o número digitado
- **Configurar Supabase Primeiro**: Permite configurar as credenciais antes de fazer login

### Se Esquecer o Número
Entre em contato com o administrador do sistema para confirmar seu número cadastrado.

---

## 📊 Dashboard Principal

Após fazer login, você verá a tela principal com:

### Cards de Resumo (Topo)
1. **Receitas**: Total de dinheiro que entrou
2. **Despesas**: Total de dinheiro que saiu
3. **Saldo**: Receitas - Despesas
4. **Saúde Financeira**: Indicador de 0-100 da sua situação financeira

### Gráficos
- **Despesas por Categoria**: Pizza mostrando onde seu dinheiro está indo
- **Tendências Mensais**: Linha mostrando a evolução ao longo do tempo

### Tabela de Transações Recentes
Mostra as últimas transações com:
- Data
- Descrição
- Categoria
- Tipo (Receita ou Despesa)
- Valor
- Ações (Editar/Deletar)

---

## 💰 Gerenciando Receitas e Despesas

### Adicionar uma Nova Transação

1. Clique em **"Nova Transação"** (botão azul no topo)
2. Preencha os campos:
   - **Data**: Quando a transação aconteceu
   - **Valor**: Quanto foi
   - **Descrição**: O que foi (ex: "Salário", "Compra de alimentos")
   - **Tipo**: Escolha "Receita" (entrada) ou "Despesa" (saída)
   - **Categoria**: Selecione a categoria apropriada
   - **Pagador/Recebedor**: Quem pagou ou recebeu (opcional)
3. Clique em **"Salvar"**

### Editar uma Transação

1. Na tabela de transações, clique no ícone de **lápis** (editar)
2. Modifique os dados necessários
3. Clique em **"Salvar"**

### Deletar uma Transação

1. Na tabela de transações, clique no ícone de **lixeira** (deletar)
2. Confirme a exclusão

### Criar uma Nova Categoria

1. Clique em **"Categorias"** no menu lateral
2. Clique em **"Nova Categoria"**
3. Digite o nome (ex: "Alimentação", "Transporte")
4. Clique em **"Salvar"**

---

## 📈 Visualizando Relatórios

### Acessar Relatórios
1. Clique em **"Relatórios"** no menu lateral

### Filtrar por Período
No topo do dashboard, você pode escolher:
- **Hoje**: Apenas transações de hoje
- **Semana**: Últimos 7 dias
- **Mês**: Mês atual
- **Personalizado**: Escolha as datas específicas

### Entender os Gráficos
- **Pizza**: Mostra a proporção de cada categoria
- **Linha**: Mostra a tendência ao longo do tempo

---

## 👥 Gerenciando Usuários

### Visualizar Usuários (Admin)
1. Clique em **"Usuários"** no menu lateral
2. Você verá uma lista de todos os usuários do sistema

### Informações Mostradas
- ID do usuário
- Nome
- Email
- Celular
- Status (Ativo/Inativo)

---

## ⚙️ Configurações

### Acessar Configurações
1. Clique em **"Configurações"** no menu lateral

### Opções Disponíveis

#### Conexão com Supabase
- **URL do Supabase**: URL do seu servidor
- **Chave Anon do Supabase**: Chave de acesso público
- Clique em **"Salvar Configurações"** após fazer mudanças

#### Informações do Sistema
- Total de usuários
- Versão do sistema
- Última atualização

---

## 💡 Dicas e Truques

### 1. Usar o Console para Debug
Se algo não funcionar, abra o Console (F12) e procure por mensagens de erro. Isso ajuda a diagnosticar problemas.

### 2. Limpar Cache
Se o dashboard não atualizar:
- Pressione **Ctrl+F5** (Windows) ou **Cmd+Shift+R** (Mac)

### 3. Tema Escuro
- Clique no ícone de lua (🌙) no canto inferior esquerdo para alternar entre temas claro e escuro

### 4. Logout
- Clique em **"Sair"** no canto inferior esquerdo para fazer logout

### 5. Exportar Dados
- Os dados são salvos automaticamente no Supabase
- Você pode usar ferramentas externas para exportar em CSV/Excel

### 6. Sincronizar com WhatsApp
- As transações enviadas via WhatsApp aparecem automaticamente no dashboard
- Não é necessário adicionar manualmente

---

## 🆘 Troubleshooting

### "Usuário não encontrado"
- Verifique se o número de celular está correto
- Confirme com o administrador se você está cadastrado

### "Supabase não configurado"
- Clique em "Configurar Supabase Primeiro"
- Verifique se a URL e chave estão corretas

### Dashboard não carrega dados
- Limpe o cache (Ctrl+F5)
- Verifique sua conexão com a internet
- Abra o Console (F12) e procure por erros

### Botão "Entrar" não funciona
- Abra o Console (F12)
- Digite: `forceLogin('seu-numero-aqui')`
- Pressione Enter

---

## 📞 Suporte

Se encontrar problemas que não consegue resolver:

1. **Abra o Console** (F12)
2. **Copie os logs** (Ctrl+A, Ctrl+C)
3. **Entre em contato** com o administrador do sistema
4. **Envie os logs** junto com a descrição do problema

---

## 🎓 Próximos Passos

Agora que você conhece o dashboard:

1. **Explore as funcionalidades**: Teste cada seção
2. **Adicione suas transações**: Comece a registrar suas finanças
3. **Analise seus dados**: Use os gráficos para entender seus gastos
4. **Integre com WhatsApp**: Use o fluxo N8N para enviar transações via WhatsApp

---

**Parabéns! Você está pronto para usar o GranaZap!** 🎉

Para dúvidas sobre a configuração do fluxo N8N, consulte o arquivo `manual_fluxo_e_canal.md`.
