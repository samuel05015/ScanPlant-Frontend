-- Script para corrigir problemas nas plantas já cadastradas

-- 1. Listar todos os usuários para encontrar o ID do seu usuário
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Verificar plantas com user_id NULL
SELECT id, scientific_name, common_name
FROM plants
WHERE user_id IS NULL;

-- 3. Verificar se há usuários sem perfil
SELECT a.id, a.email 
FROM auth.users a
LEFT JOIN profiles p ON a.id = p.id
WHERE p.id IS NULL;

-- 4. Criar um perfil para usuários que não têm
INSERT INTO profiles (id, name, created_at, updated_at)
SELECT u.id, u.email, now(), now()
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 5. Verificar a restrição de chave estrangeira
SELECT conname, conrelid::regclass AS tabela, confrelid::regclass AS referencia,
       pg_get_constraintdef(oid) AS definicao
FROM pg_constraint
WHERE conname = 'plants_user_id_fkey';

-- 6. Remover a restrição de chave estrangeira incorreta (se necessário)
-- Primeiro verificamos se a restrição está apontando para a tabela errada
DO $$
DECLARE
    constraint_definition text;
BEGIN
    SELECT pg_get_constraintdef(oid) INTO constraint_definition
    FROM pg_constraint
    WHERE conname = 'plants_user_id_fkey';
    
    IF constraint_definition IS NOT NULL AND constraint_definition NOT LIKE '%auth.users%' THEN
        -- A restrição existe e não está apontando para auth.users
        RAISE NOTICE 'Removendo restrição incorreta plants_user_id_fkey';
        ALTER TABLE public.plants DROP CONSTRAINT IF EXISTS plants_user_id_fkey;
        
        -- Criar a restrição correta
        ALTER TABLE public.plants 
        ADD CONSTRAINT plants_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id);
        
        RAISE NOTICE 'Restrição corrigida para apontar para auth.users';
    ELSIF constraint_definition IS NULL THEN
        -- A restrição não existe
        RAISE NOTICE 'Criando restrição plants_user_id_fkey';
        ALTER TABLE public.plants 
        ADD CONSTRAINT plants_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id);
    ELSE
        RAISE NOTICE 'Restrição já está correta';
    END IF;
END
$$;

-- 7. Atribuir plantas sem usuário para o seu usuário
-- COPIE O SEU ID DE USUÁRIO DA PRIMEIRA CONSULTA E COLE ABAIXO
DO $$
DECLARE
    -- ATENÇÃO: SUBSTITUA ESTE UUID PELO SEU ID DE USUÁRIO REAL
    user_id_default UUID := '2df713ba-73cc-4da0-aa3d-22c775928cbb'; -- ⚠️ SUBSTITUA ESTE VALOR
BEGIN
    -- Verificar se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_default) THEN
        RAISE EXCEPTION 'ID de usuário % não existe', user_id_default;
    END IF;

    -- Atualizar plantas sem usuário para o usuário padrão
    UPDATE plants
    SET user_id = user_id_default
    WHERE user_id IS NULL;

    RAISE NOTICE 'Plantas atualizadas com sucesso para o usuário %', user_id_default;
END
$$;

-- 8. Verificar se todas as plantas agora têm user_id
SELECT COUNT(*) 
FROM plants 
WHERE user_id IS NULL;

-- 9. Verificar plantas atribuídas ao seu usuário
-- Substitua o UUID abaixo pelo seu ID de usuário para verificar suas plantas
SELECT id, scientific_name, common_name, user_id
FROM plants
WHERE user_id = '2df713ba-73cc-4da0-aa3d-22c775928cbb' -- ⚠️ SUBSTITUA ESTE VALOR
LIMIT 20;

-- 10. Verificar todas as plantas (independente do usuário)
SELECT id, scientific_name, common_name, user_id
FROM plants
LIMIT 20;