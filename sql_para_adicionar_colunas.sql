-- Adicionar todas as colunas faltantes em uma única transação SQL

-- Verifique se a extensão uuid-ossp está disponível
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- Adicionar coluna para a frequência de rega em dias
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS watering_frequency_days INTEGER;

-- Adicionar coluna para o texto de frequência de rega
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS watering_frequency_text TEXT;

-- Adicionar coluna de anotações
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Adicionar coluna para controle de lembretes
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT false;

-- Adicionar coluna para ID da notificação agendada
ALTER TABLE plants 
ADD COLUMN IF NOT EXISTS reminder_notification_id TEXT;

COMMIT;