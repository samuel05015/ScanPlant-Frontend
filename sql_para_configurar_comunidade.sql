-- Relações no Supabase para permitir a integração com a comunidade

-- 1. Criar uma tabela de profiles para associar aos usuários
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar uma política de segurança para a tabela profiles
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Usuários podem ver todos os perfis'
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Usuários podem ver todos os perfis"
            ON public.profiles
            FOR SELECT
            USING (true);
        RAISE NOTICE 'Política "Usuários podem ver todos os perfis" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Usuários podem ver todos os perfis" já existe, pulando...';
    END IF;
END
$$;

-- 3. Criar política de segurança para que os usuários possam atualizar seus próprios perfis
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Usuários podem atualizar seus próprios perfis'
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Usuários podem atualizar seus próprios perfis"
            ON public.profiles
            FOR UPDATE
            USING (auth.uid() = id);
        RAISE NOTICE 'Política "Usuários podem atualizar seus próprios perfis" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Usuários podem atualizar seus próprios perfis" já existe, pulando...';
    END IF;
END
$$;

-- 4. Criar política de segurança para que os usuários possam inserir seus próprios perfis
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Usuários podem inserir seus próprios perfis'
        AND tablename = 'profiles'
    ) THEN
        CREATE POLICY "Usuários podem inserir seus próprios perfis"
            ON public.profiles
            FOR INSERT
            WITH CHECK (auth.uid() = id);
        RAISE NOTICE 'Política "Usuários podem inserir seus próprios perfis" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Usuários podem inserir seus próprios perfis" já existe, pulando...';
    END IF;
END
$$;

-- 5. Verificar se a restrição já existe e criar apenas se não existir
DO $$
BEGIN
    -- Verificar se a restrição já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'plants_user_id_fkey' 
        AND conrelid = 'public.plants'::regclass
    ) THEN
        -- Criar a restrição apenas se não existir
        ALTER TABLE IF EXISTS public.plants
        ADD CONSTRAINT plants_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id);
        RAISE NOTICE 'Restrição plants_user_id_fkey criada com sucesso';
    ELSE
        RAISE NOTICE 'Restrição plants_user_id_fkey já existe, pulando...';
    END IF;
END
$$;

-- 6. Criar política de segurança para que todos os usuários possam ver todas as plantas
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Todos podem ver todas as plantas'
        AND tablename = 'plants'
    ) THEN
        CREATE POLICY "Todos podem ver todas as plantas"
            ON public.plants
            FOR SELECT
            USING (true);
        RAISE NOTICE 'Política "Todos podem ver todas as plantas" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Todos podem ver todas as plantas" já existe, pulando...';
    END IF;
END
$$;

-- 7. Criar política de segurança para que os usuários possam inserir suas próprias plantas
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Usuários podem inserir suas próprias plantas'
        AND tablename = 'plants'
    ) THEN
        CREATE POLICY "Usuários podem inserir suas próprias plantas"
            ON public.plants
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Política "Usuários podem inserir suas próprias plantas" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Usuários podem inserir suas próprias plantas" já existe, pulando...';
    END IF;
END
$$;

-- 8. Criar política de segurança para que os usuários possam atualizar suas próprias plantas
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Usuários podem atualizar suas próprias plantas'
        AND tablename = 'plants'
    ) THEN
        CREATE POLICY "Usuários podem atualizar suas próprias plantas"
            ON public.plants
            FOR UPDATE
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Usuários podem atualizar suas próprias plantas" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Usuários podem atualizar suas próprias plantas" já existe, pulando...';
    END IF;
END
$$;

-- 9. Criar política de segurança para que os usuários possam excluir suas próprias plantas
DO $$
BEGIN
    -- Verificar se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Usuários podem excluir suas próprias plantas'
        AND tablename = 'plants'
    ) THEN
        CREATE POLICY "Usuários podem excluir suas próprias plantas"
            ON public.plants
            FOR DELETE
            USING (auth.uid() = user_id);
        RAISE NOTICE 'Política "Usuários podem excluir suas próprias plantas" criada com sucesso';
    ELSE
        RAISE NOTICE 'Política "Usuários podem excluir suas próprias plantas" já existe, pulando...';
    END IF;
END
$$;

-- 10. Habilitar o RLS (Row Level Security) nas tabelas
DO $$
DECLARE
    plants_rls_enabled boolean;
    profiles_rls_enabled boolean;
BEGIN
    -- Verificar se RLS está habilitado para plants
    SELECT relrowsecurity INTO plants_rls_enabled
    FROM pg_class
    WHERE relname = 'plants' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Habilitar RLS para plants se não estiver habilitado
    IF plants_rls_enabled IS NULL OR NOT plants_rls_enabled THEN
        ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para tabela plants';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para tabela plants';
    END IF;
    
    -- Verificar se RLS está habilitado para profiles
    SELECT relrowsecurity INTO profiles_rls_enabled
    FROM pg_class
    WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Habilitar RLS para profiles se não estiver habilitado
    IF profiles_rls_enabled IS NULL OR NOT profiles_rls_enabled THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para tabela profiles';
    ELSE
        RAISE NOTICE 'RLS já está habilitado para tabela profiles';
    END IF;
END
$$;