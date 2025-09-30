-- Script para encontrar o ID do usuário atual

-- Execute esta consulta para listar todos os usuários e seus IDs
SELECT id, email 
FROM auth.users 
ORDER BY created_at DESC;

-- Para descobrir o ID do usuário atual (quando logado como esse usuário),
-- execute esta consulta:
SELECT 
  auth.uid() as seu_id_de_usuario,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as seu_email;