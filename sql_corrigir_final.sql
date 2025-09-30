-- Script corrigido para resolver o erro de chave estrangeira e associar plantas

-- Etapa 1: Verificar os usuários disponíveis
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Etapa 2: Verificar e corrigir a restrição de chave estrangeira
DO $$
BEGIN
    -- Remover a restrição antiga se existir
    ALTER TABLE public.plants DROP CONSTRAINT IF EXISTS plants_user_id_fkey;
    
    -- Criar a restrição correta apontando para auth.users
    ALTER TABLE public.plants 
    ADD CONSTRAINT plants_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id);
    
    RAISE NOTICE 'Restrição de chave estrangeira corrigida com sucesso';
END
$$;

-- Etapa 3: Substituir o ID abaixo pelo seu ID de usuário da primeira consulta
-- Defina aqui o ID do seu usuário (copie da primeira consulta)
UPDATE plants
SET user_id = '2df713ba-73cc-4da0-aa3d-22c775928cbb'  -- ⚠️ SUBSTITUA COM SEU ID REAL DE USUÁRIO
WHERE user_id IS NULL;

-- Etapa 4: Verificar se as plantas foram atribuídas
SELECT id, scientific_name, common_name
FROM plants
WHERE user_id = '2df713ba-73cc-4da0-aa3d-22c775928cbb';  -- ⚠️ SUBSTITUA COM O MESMO ID ACIMA