# Manual de Uso: Dashboard de Controle Financeiro

**Autor:** Manus AI
**Data:** 2026-01-07

## 1. Introdução

Bem-vindo ao Dashboard de Controle Financeiro! Esta ferramenta foi projetada para fornecer uma visão completa e interativa das suas finanças, permitindo que você acompanhe receitas, despesas e o desempenho financeiro geral de múltiplos usuários cadastrados através do fluxo de WhatsApp.

Este manual guiará você por todas as funcionalidades do dashboard, desde a configuração inicial até a análise de relatórios avançados.

## 2. Primeiro Acesso e Configuração

Para utilizar o dashboard, o primeiro passo é conectar a interface ao seu banco de dados Supabase, onde todas as informações financeiras estão armazenadas.

### 2.1. Configuração do Supabase

Na primeira vez que você abrir o dashboard, será apresentado a uma tela de login. Como o sistema ainda não está conectado ao banco de dados, você pode fazer um login inicial para acessar a área de configurações.

1.  **Login Inicial:** Na tela de login, digite qualquer identificador (ex: `admin`) e pressione "Entrar".
2.  **Acessar Configurações:** No menu lateral esquerdo, clique em **Configurações** (<i class="fas fa-cog"></i>).
3.  **Preencher Credenciais:** Na seção "Conexão com Supabase", você encontrará dois campos:
    *   **URL do Supabase:** Insira a URL do seu projeto Supabase. Você pode encontrá-la em `Project Settings` > `API` no seu painel do Supabase.
    *   **Chave Anon do Supabase:** Insira a chave pública (anon key) do seu projeto. Ela está localizada na mesma página, sob `Project API keys`.
4.  **Salvar:** Clique no botão **Salvar Configurações**. O dashboard irá se conectar ao Supabase e recarregar os dados.

Após salvar, o sistema está pronto. Faça o logout e entre novamente com um ID de usuário válido.

### 2.2. Login de Usuário

Com o Supabase configurado, o login validará as informações do usuário diretamente do banco de dados.

-   **Login:** Na tela de login, insira o **ID do usuário** ou o **número de telefone** associado à sua conta no sistema. Clique em "Entrar".
-   **Logout:** Para sair, clique no botão **Sair** (<i class="fas fa-sign-out-alt"></i>) na parte inferior do menu lateral.

## 3. Visão Geral do Dashboard

A página principal, ou **Dashboard**, oferece um resumo completo da sua saúde financeira para o período selecionado.

### 3.1. Filtros de Período

No canto superior direito, você pode filtrar os dados exibidos em todo o dashboard por:

-   **Hoje:** Mostra os dados do dia atual.
-   **Semana:** Mostra os dados da semana corrente.
-   **Mês:** Mostra os dados do mês corrente (padrão).
-   **Personalizado:** Permite selecionar um intervalo de datas específico.

### 3.2. Cards de Resumo

Os cards fornecem uma visão rápida das métricas mais importantes:

| Card                | Ícone                               | Descrição                                                                                             |
| ------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Receitas**        | <i class="fas fa-arrow-up"></i>    | Soma de todas as transações de entrada no período selecionado.                                        |
| **Despesas**        | <i class="fas fa-arrow-down"></i>  | Soma de todas as transações de saída no período selecionado.                                          |
| **Saldo**           | <i class="fas fa-wallet"></i>      | A diferença entre receitas e despesas (`Receitas - Despesas`).                                          |
| **Saúde Financeira**| <i class="fas fa-heart-pulse"></i> | Uma pontuação de 0 a 100 que indica a sustentabilidade de suas finanças, com base na proporção do seu saldo. |

### 3.3. Gráficos Interativos

-   **Despesas por Categoria:** Um gráfico de pizza que mostra a distribuição percentual de suas despesas entre as diferentes categorias.
-   **Tendências Mensais:** Um gráfico de barras que compara as receitas e despesas totais dos últimos seis meses, permitindo identificar padrões sazonais.

### 3.4. Transações Recentes

Uma tabela exibe as últimas 10 transações (entradas e saídas) registradas no período, oferecendo acesso rápido para edição ou exclusão.

## 4. Seções do Dashboard

O menu lateral permite navegar entre as diferentes seções do sistema.

### 4.1. Receitas e Despesas

As páginas **Receitas** e **Despesas** listam todas as transações do tipo correspondente. A partir daqui, você pode:

-   **Adicionar:** Clicar em "Nova Receita" ou "Nova Despesa" para abrir o modal de criação.
-   **Editar:** Clicar no ícone de lápis (<i class="fas fa-edit"></i>) para modificar uma transação existente.
-   **Excluir:** Clicar no ícone de lixeira (<i class="fas fa-trash"></i>) para remover uma transação.

### 4.2. Transações

Esta página exibe **todas** as transações, tanto receitas quanto despesas. Inclui filtros adicionais para refinar a busca por tipo de transação ou por categoria.

### 4.3. Categorias

Gerencie as categorias usadas para classificar suas transações. Você pode:

-   **Adicionar:** Clicar em "Nova Categoria" para criar uma nova.
-   **Excluir:** Clicar no ícone de lixeira para remover uma categoria. (Atenção: isso pode não ser possível se a categoria estiver em uso por alguma transação).

### 4.4. Relatórios

Esta seção fornece uma análise mais profunda de suas finanças:

-   **Balanço Mensal:** Resumo de receitas, despesas e saldo do mês corrente.
-   **Análise por Categoria:** Gráfico de barras detalhando o total gasto em cada categoria no mês.
-   **Fluxo de Caixa:** Gráfico de linha mostrando a evolução de receitas, despesas e saldo ao longo dos últimos seis meses.

### 4.5. Usuários (Acesso de Administrador)

Esta página é destinada à gestão de todos os usuários do sistema. Aqui, um administrador pode:

-   Visualizar todos os usuários cadastrados.
-   Verificar o status de cada um (`ativo` ou `inativo`).
-   Ativar ou desativar o acesso de um usuário ao sistema clicando no ícone de toggle (<i class="fas fa-toggle-on"></i>).

### 4.6. Configurações

Além da configuração do Supabase, esta página exibe estatísticas gerais do sistema, como o número total de usuários, transações e categorias, fornecendo uma visão administrativa do uso da plataforma.

## 5. Tema Visual

O dashboard inclui um seletor de tema. Na parte inferior do menu lateral, clique no botão **Tema Escuro** (<i class="fas fa-moon"></i>) ou **Tema Claro** (<i class="fas fa-sun"></i>) para alternar entre os modos de visualização, adaptando a interface à sua preferência.
