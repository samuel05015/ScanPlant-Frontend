-- Caso precise criar a tabela plants do zero

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    scientific_name TEXT,
    common_name TEXT,
    wiki_description TEXT,
    care_instructions TEXT,
    family TEXT,
    genus TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city TEXT,
    location_name TEXT,
    image_data TEXT,
    watering_frequency_days INTEGER,
    watering_frequency_text TEXT,
    user_id UUID REFERENCES auth.users(id),
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT false,
    reminder_notification_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);