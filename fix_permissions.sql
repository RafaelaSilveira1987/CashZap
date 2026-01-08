-- SCRIPT DE CORREÇÃO DE PERMISSÕES (RLS) - MORDOMOPAY

-- 1. Habilitar RLS na tabela de usuários (se não estiver habilitado)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para permitir leitura pública (necessária para o login)
-- Isso permite que o dashboard consulte se o celular/email existe antes de autenticar
DROP POLICY IF EXISTS "Permitir leitura pública para login" ON public.usuarios;
CREATE POLICY "Permitir leitura pública para login" 
ON public.usuarios FOR SELECT 
USING (true);

-- 3. Garantir que a tabela de transações também tenha permissões básicas
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON public.transacoes;
CREATE POLICY "Usuários podem ver suas próprias transações" 
ON public.transacoes FOR SELECT 
USING (true); -- Em produção, você pode restringir para (usuario_id = auth.uid())

-- 4. Conceder permissões de uso ao papel anon (usado pelo dashboard)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.usuarios TO anon;
GRANT SELECT ON public.transacoes TO anon;
GRANT SELECT ON public.categoria_trasacoes TO anon;
