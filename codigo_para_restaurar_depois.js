// Use este código para restaurar as funcionalidades de lembretes depois de adicionar as colunas no Supabase
// Substitua o bloco atual do plantRecord por este

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
    reminder_enabled: reminderEnabled,
    notes: notes,
    user_id: auth.currentUser?.id,
};

// E depois descomente o bloco de código para agendar notificações:

if (reminderEnabled && reminderFrequencyDays && insertedPlant?.id) {
  try {
    const notificationId = await scheduleWateringReminder(insertedPlant, reminderFrequencyDays);
    const { error: updateError } = await database.update('plants', { reminder_notification_id: notificationId }, { id: insertedPlant.id });
    if (updateError) {
      console.error('Erro ao salvar notification_id no Supabase:', updateError);
    }
  } catch (notificationError) {
    console.error('Falha ao agendar lembrete de rega:', notificationError);
    Alert.alert('Aviso', 'Planta salva, mas não foi possível agendar o lembrete de rega.');
  }
}