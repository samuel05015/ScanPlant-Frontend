# Sistema de Chat - ScanPlant

Este sistema permite que os usuários do aplicativo ScanPlant conversem entre si para trocar informações e dúvidas sobre plantas.

## Configuração do Banco de Dados

Para utilizar o sistema de chat, você precisa configurar as tabelas necessárias no seu banco de dados Supabase. Siga estas instruções:

1. Acesse o painel de administração do Supabase
2. Vá até a seção "SQL Editor"
3. Crie uma nova consulta
4. Copie e cole o conteúdo do arquivo `chat_tables_setup.sql` fornecido neste repositório
5. Execute o script SQL

Isso irá criar todas as tabelas necessárias, funções e políticas de segurança para o sistema de chat funcionar corretamente.

## Estrutura do Sistema de Chat

O sistema de chat é composto por:

- **Tela de Lista de Usuários (`UserListScreen.js`)**: Permite iniciar conversas com outros usuários
- **Tela de Lista de Chats (`ChatListScreen.js`)**: Mostra todas as conversas ativas do usuário
- **Tela de Chat (`ChatScreen.js`)**: Interface para trocar mensagens com outros usuários

## Funcionalidades Principais

- **Ver plantas de outros usuários**: No topo da tela de chat, você verá uma galeria com as plantas do outro usuário
- **Iniciar conversas**: Você pode iniciar conversas a partir da lista de usuários
- **Chat em tempo real**: As mensagens são atualizadas instantaneamente usando as capacidades de tempo real do Supabase
- **Notificação de mensagens não lidas**: As conversas com mensagens não lidas são destacadas

## Como Usar

1. Na tela inicial, toque no botão "Chat"
2. Selecione um usuário com quem deseja conversar
3. Na tela de chat, você verá as plantas do outro usuário no topo
4. Troque mensagens com o outro usuário para tirar dúvidas sobre plantas

## Solução de Problemas

Se você encontrar mensagens de erro sobre "tabelas de chat não existem", certifique-se de executar o script SQL fornecido no painel do Supabase.

Para verificar se as tabelas foram criadas corretamente, você pode executar esta consulta no SQL Editor do Supabase:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND (
  table_name = 'chats' OR 
  table_name = 'chat_participants' OR 
  table_name = 'messages'
);
```

Isso deve retornar as três tabelas necessárias para o sistema de chat funcionar.