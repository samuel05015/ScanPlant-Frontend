-- Consultas úteis para debug e verificação

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('plants', 'profiles');

-- 2. Verificar as colunas da tabela plants
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'plants';

-- 3. Verificar se a restrição de chave estrangeira existe
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE conname = 'plants_user_id_fkey';

-- 4. Verificar políticas existentes
SELECT tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename IN ('plants', 'profiles');

-- 5. Verificar se o RLS está habilitado
SELECT c.relname as tablename, c.relrowsecurity
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
AND c.relname IN ('plants', 'profiles')
AND c.relkind = 'r';

-- 6. Verificar conteúdo da tabela plants
SELECT id, scientific_name, common_name, user_id
FROM plants
LIMIT 10;

-- 7. Verificar se os usuários existem
SELECT id, email
FROM auth.users
LIMIT 10;

-- 8. Inserir um profile para o usuário atual (útil para testes)
INSERT INTO profiles (id, name)
VALUES (auth.uid(), 'Nome de Usuário de Teste')
ON CONFLICT (id) 
DO UPDATE SET name = 'Nome de Usuário de Teste', updated_at = now();