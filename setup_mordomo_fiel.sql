-- ========== SCHEMA MORDOMO FIEL - MORDOMOPAY ==========

-- 1. Metas Financeiras
CREATE TABLE IF NOT EXISTS metas_financeiras (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  valor_alvo DECIMAL(10,2),
  valor_atual DECIMAL(10,2) DEFAULT 0,
  prazo DATE,
  categoria TEXT,
  versiculo TEXT,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Dízimos e Ofertas
CREATE TABLE IF NOT EXISTS dizimos_ofertas (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  valor DECIMAL(10,2),
  data DATE DEFAULT CURRENT_DATE,
  tipo TEXT, -- 'dizimo', 'oferta', 'missoes'
  status TEXT DEFAULT 'pago',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Badges/Conquistas
CREATE TABLE IF NOT EXISTS badges (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  nome TEXT,
  descricao TEXT,
  icone TEXT,
  data_conquista TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Alertas Configurados
CREATE TABLE IF NOT EXISTS alertas_gastos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  categoria_id INTEGER,
  limite_valor DECIMAL(10,2),
  periodo TEXT, -- 'diario', 'semanal', 'mensal'
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========== POLÍTICAS DE SEGURANÇA (RLS) ==========

-- Habilitar RLS em todas as novas tabelas
ALTER TABLE metas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE dizimos_ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_gastos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso (Permitir tudo para usuários autenticados via Anon Key por enquanto, conforme o dashboard atual)
-- Nota: Em produção, o ideal é filtrar por auth.uid() ou usuario_id

CREATE POLICY "Permitir acesso total metas" ON metas_financeiras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total dizimos" ON dizimos_ofertas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total badges" ON badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso total alertas" ON alertas_gastos FOR ALL USING (true) WITH CHECK (true);
