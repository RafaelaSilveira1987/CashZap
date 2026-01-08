# Dashboard de Controle Financeiro - MordomoPay

Sistema completo de controle financeiro multiusuário com integração WhatsApp, N8N e Supabase.

## 📋 Visão Geral

Este projeto fornece uma solução completa para gerenciamento financeiro através de:

- **Dashboard Web Interativo**: Interface moderna e responsiva para visualização e análise de dados financeiros
- **Fluxo N8N**: Automação de processos via WhatsApp para registro de transações
- **Banco de Dados Supabase**: Armazenamento seguro e escalável com isolamento por usuário

## 🚀 Características

### Dashboard Web
- ✅ Interface responsiva (desktop e mobile)
- ✅ Tema claro e escuro
- ✅ Gráficos interativos (Chart.js)
- ✅ Filtros por período (dia, semana, mês, personalizado)
- ✅ Gestão de receitas e despesas
- ✅ Categorização de transações
- ✅ Relatórios financeiros
- ✅ Medidor de saúde financeira
- ✅ Gestão de múltiplos usuários
- ✅ Sistema de login simples

### Arquitetura Multiusuário
- ✅ Isolamento de dados por `usuario_id`
- ✅ Canal único de WhatsApp para todos os usuários
- ✅ Identificação automática por número de telefone
- ✅ Controle de status (ativo/inativo)

## 📁 Estrutura do Projeto

```
dashboard-financeiro/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos completos
├── js/
│   ├── config.js           # Configurações e utilitários
│   ├── supabase.js         # Integração com Supabase
│   ├── charts.js           # Gráficos Chart.js
│   └── app.js              # Lógica principal da aplicação
├── docs/
│   ├── manual_configuracao_fluxo.md  # Manual de configuração do N8N
│   └── manual_uso_dashboard.md       # Manual de uso do dashboard
└── README.md               # Este arquivo
```

## 🔧 Instalação e Configuração

### 1. Configurar o Banco de Dados

Siga o **Manual de Configuração do Fluxo** (`docs/manual_configuracao_fluxo.md`) para:

1. Criar as tabelas no Supabase
2. Configurar as políticas de segurança (RLS)
3. Obter as credenciais de acesso

### 2. Configurar o Fluxo N8N

1. Importe o arquivo `ControleFinanceiro_RG_DNAICLUB.json` no N8N
2. Configure as credenciais do Supabase
3. Configure o webhook da API do WhatsApp
4. Ative o fluxo

### 3. Configurar o Dashboard

1. Hospede os arquivos em um servidor web (Apache, Nginx, etc.)
2. Acesse o dashboard pelo navegador
3. Na primeira vez, faça login com qualquer identificador
4. Vá em **Configurações** e insira:
   - URL do Supabase
   - Chave Anon do Supabase
5. Salve e faça login novamente com um ID de usuário válido

## 📖 Documentação

- **[Manual de Configuração do Fluxo](docs/manual_configuracao_fluxo.md)**: Guia completo para configurar o sistema multiusuário no N8N
- **[Manual de Uso do Dashboard](docs/manual_uso_dashboard.md)**: Instruções detalhadas de todas as funcionalidades

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Gráficos**: Chart.js
- **Banco de Dados**: Supabase (PostgreSQL)
- **Automação**: N8N
- **Comunicação**: WhatsApp Business API (Evolution API)

## 📊 Estrutura do Banco de Dados

### Tabela: usuarios
- `id`: Identificador único
- `nome`: Nome do usuário
- `telefone`: Número de telefone (único)
- `status`: Status (ativo/inativo)
- `created_at`: Data de criação

### Tabela: categoria_trasacoes
- `id`: Identificador único
- `descricao`: Nome da categoria
- `usuario_id`: Referência ao usuário

### Tabela: transacoes
- `id`: Identificador único
- `descricao`: Descrição da transação
- `valor`: Valor monetário
- `data`: Data da transação
- `mes`: Mês (1-12)
- `tipo`: Tipo (entrada/saida)
- `pagador`: Pagador ou recebedor
- `categoria_id`: Referência à categoria
- `usuario_id`: Referência ao usuário

## 🔐 Segurança

- Row Level Security (RLS) habilitado no Supabase
- Isolamento de dados por usuário
- Credenciais armazenadas localmente (localStorage)
- Conexão segura via HTTPS (recomendado)

## 🌐 Hospedagem

O dashboard pode ser hospedado em qualquer servidor web estático:

- **Netlify**: Deploy gratuito e automático
- **Vercel**: Ideal para projetos frontend
- **GitHub Pages**: Hospedagem gratuita via repositório
- **Servidor próprio**: Apache, Nginx, etc.

## 📱 Responsividade

O dashboard é totalmente responsivo e funciona em:

- 💻 Desktop (1920x1080 e superiores)
- 💻 Laptop (1366x768 e superiores)
- 📱 Tablet (768x1024)
- 📱 Smartphone (375x667 e superiores)

## 🎨 Temas

- **Tema Claro**: Interface clara e moderna
- **Tema Escuro**: Ideal para ambientes com pouca luz

## 🤝 Suporte

Para dúvidas ou problemas:

1. Consulte os manuais em `docs/`
2. Verifique a documentação do Supabase
3. Consulte a documentação do N8N

## 📄 Licença

Este projeto é fornecido como está, sem garantias. Use por sua conta e risco.

## 👨‍💻 Autor

**Manus AI** - 2026

---

**Nota**: Lembre-se de manter suas credenciais do Supabase em segurança e nunca compartilhá-las publicamente.
