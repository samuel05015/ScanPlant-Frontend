-- Script simplificado para corrigir plantas sem usuário

-- 1. Execute esta consulta para ver os usuários disponíveis
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. COPIE O SEU ID DA CONSULTA ACIMA E SUBSTITUA NO CÓDIGO ABAIXO (DENTRO DAS ASPAS)

-- 3. Execute este código para transferir as plantas sem usuário para você
UPDATE plants
SET user_id = '2df713ba-73cc-4da0-aa3d-22c775928cbb' -- ⚠️ SUBSTITUA ESTE VALOR PELO SEU ID
WHERE user_id IS NULL;

-- 4. Verifique se as plantas foram transferidas corretamente
SELECT id, scientific_name, common_name
FROM plants
WHERE user_id = '2df713ba-73cc-4da0-aa3d-22c775928cbb'; -- ⚠️ SUBSTITUA ESTE VALOR PELO SEU ID