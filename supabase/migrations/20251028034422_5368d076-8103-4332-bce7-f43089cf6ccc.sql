-- Criar tabela de cotações
CREATE TABLE public.cotacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_doc TEXT,
  cliente_codigo TEXT,
  numero_cotacao TEXT NOT NULL UNIQUE,
  data_cotacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantidade_total INTEGER NOT NULL DEFAULT 0,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da cotação
CREATE TABLE public.cotacao_itens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cotacao_id UUID NOT NULL REFERENCES public.cotacoes(id) ON DELETE CASCADE,
  codigo_produto TEXT NOT NULL,
  nome_produto TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotacao_itens ENABLE ROW LEVEL SECURITY;

-- Políticas para cotacoes
CREATE POLICY "Usuários podem ver suas próprias cotações"
  ON public.cotacoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias cotações"
  ON public.cotacoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias cotações"
  ON public.cotacoes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias cotações"
  ON public.cotacoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para cotacao_itens
CREATE POLICY "Usuários podem ver itens de suas cotações"
  ON public.cotacao_itens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cotacoes
      WHERE cotacoes.id = cotacao_itens.cotacao_id
      AND cotacoes.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar itens em suas cotações"
  ON public.cotacao_itens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cotacoes
      WHERE cotacoes.id = cotacao_itens.cotacao_id
      AND cotacoes.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar itens de suas cotações"
  ON public.cotacao_itens
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.cotacoes
      WHERE cotacoes.id = cotacao_itens.cotacao_id
      AND cotacoes.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar itens de suas cotações"
  ON public.cotacao_itens
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.cotacoes
      WHERE cotacoes.id = cotacao_itens.cotacao_id
      AND cotacoes.user_id = auth.uid()
    )
  );

-- Criar índices para melhor performance
CREATE INDEX idx_cotacoes_user_id ON public.cotacoes(user_id);
CREATE INDEX idx_cotacoes_data ON public.cotacoes(data_cotacao DESC);
CREATE INDEX idx_cotacao_itens_cotacao_id ON public.cotacao_itens(cotacao_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cotacoes_updated_at
  BEFORE UPDATE ON public.cotacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();