// Quando as colunas estiverem adicionadas no Supabase, você pode restaurar este código

const plantRecord = {
    scientific_name: plantData.scientific_name,
    common_name: plantData.common_name,
    wiki_description: plantData.description,
    care_instructions: plantData.care_instructions,
    family: plantData.family,
    genus: plantData.genus,
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    city: cityName,
    location_name: exactLocation,
    image_data: imageDataUrl,
    watering_frequency_days: reminderEnabled ? reminderFrequencyDays : plantData.watering_frequency_days,
    watering_frequency_text: plantData.watering_frequency_text,
    reminder_enabled: reminderEnabled, // Restaurado após adicionar a coluna
    notes: notes, // Restaurado após adicionar a coluna
    user_id: auth.currentUser?.id,
};