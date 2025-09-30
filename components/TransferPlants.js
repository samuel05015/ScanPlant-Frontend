import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { auth, supabase } from './supabase';

export default function TransferPlants() {
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      // Verificar se o usuário está autenticado
      const { data: userData } = await auth.getCurrentUser();
      if (!userData?.user?.id) {
        Alert.alert('Erro', 'Você precisa estar logado para transferir plantas.');
        return;
      }

      // Verificar quantas plantas não têm usuário
      const { data: orphanedPlants, error: countError } = await supabase
        .from('plants')
        .select('id')
        .is('user_id', null);

      if (countError) {
        throw countError;
      }

      const orphanCount = orphanedPlants?.length || 0;

      if (orphanCount === 0) {
        Alert.alert('Informação', 'Não há plantas sem dono para transferir.');
        return;
      }

      // Confirmar a transferência
      Alert.alert(
        'Transferir Plantas',
        `Existem ${orphanCount} plantas sem dono. Deseja transferi-las para sua conta?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Transferir', 
            onPress: async () => {
              try {
                // Fazer a transferência
                const { data, error } = await supabase
                  .from('plants')
                  .update({ user_id: userData.user.id })
                  .is('user_id', null);

                if (error) {
                  throw error;
                }

                Alert.alert(
                  'Sucesso', 
                  `${orphanCount} plantas foram transferidas para sua conta!`,
                  [{ text: 'OK' }]
                );
              } catch (transferError) {
                console.error('Erro na transferência:', transferError);
                Alert.alert('Erro', `Falha ao transferir plantas: ${transferError.message}`);
              } finally {
                setLoading(false);
              }
            }
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Erro ao verificar plantas sem dono:', error);
      Alert.alert('Erro', `Falha ao verificar plantas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleTransfer}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Transferir plantas da comunidade</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.helpText}>
        Esta opção transfere todas as plantas sem dono para a sua conta.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#22C55E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  helpText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  }
});