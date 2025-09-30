import React from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { auth, supabase } from './supabase';
import TransferPlants from './TransferPlants';

export default function DebugAuthScreen() {
  const [statusMessage, setStatusMessage] = React.useState('Verificando status...');
  const [userDetails, setUserDetails] = React.useState(null);
  const [sessionValid, setSessionValid] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  
  const checkAuth = async () => {
    setLoading(true);
    try {
      setStatusMessage('Verificando autenticação...');
      
      // Verificar a sessão atual
      const { data: session } = await supabase.auth.getSession();
      console.log('Sessão:', JSON.stringify(session));
      
      if (session?.session) {
        setSessionValid(true);
        setStatusMessage('Sessão ativa encontrada');
        
        // Obter detalhes do usuário
        const { data: userData } = await auth.getCurrentUser();
        console.log('Dados do usuário:', JSON.stringify(userData));
        
        if (userData?.user) {
          setUserDetails(userData.user);
          setStatusMessage('Usuário autenticado com sucesso');
        } else {
          setStatusMessage('Sessão existe mas não foi possível obter detalhes do usuário');
        }
      } else {
        setSessionValid(false);
        setStatusMessage('Nenhuma sessão ativa encontrada. Você precisa fazer login.');
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setStatusMessage(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const testSavePlant = async () => {
    setLoading(true);
    try {
      setStatusMessage('Testando salvar planta...');
      
      // Obter usuário atual
      const { data: userData } = await auth.getCurrentUser();
      if (!userData?.user?.id) {
        throw new Error('Usuário não está logado!');
      }
      
      // Criar objeto de teste
      const testPlant = {
        scientific_name: 'Test Plant',
        common_name: 'Planta de Teste',
        wiki_description: 'Esta é uma planta de teste.',
        care_instructions: 'Teste de instruções de cuidado.',
        family: 'Testaceae',
        genus: 'Testum',
        latitude: -23.5505,
        longitude: -46.6333,
        city: 'São Paulo',
        location_name: 'Teste de Localização',
        image_data: '',
        watering_frequency_days: 7,
        watering_frequency_text: 'Uma vez por semana',
        reminder_enabled: false,
        notes: 'Planta criada para teste',
        user_id: userData.user.id,
      };
      
      // Tentar inserir
      const { data: insertedPlants, error } = await supabase
        .from('plants')
        .insert(testPlant)
        .select();
      
      if (error) {
        throw error;
      }
      
      const insertedPlant = insertedPlants?.[0];
      
      if (insertedPlant) {
        setStatusMessage(`Teste bem-sucedido! Planta criada com ID: ${insertedPlant.id}`);
        
        // Verificar se foi associada ao usuário correto
        const { data: checkPlant, error: checkError } = await supabase
          .from('plants')
          .select('user_id')
          .eq('id', insertedPlant.id)
          .single();
        
        if (checkError) {
          setStatusMessage(`Planta criada, mas erro ao verificar: ${checkError.message}`);
        } else if (checkPlant.user_id === userData.user.id) {
          setStatusMessage(`Teste 100% bem-sucedido! Planta associada corretamente ao usuário ${userData.user.id}`);
        } else {
          setStatusMessage(`ATENÇÃO: Planta criada mas associada ao usuário ${checkPlant.user_id} em vez de ${userData.user.id}`);
        }
      } else {
        setStatusMessage('Planta criada, mas não retornou dados');
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      setStatusMessage(`Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  React.useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Diagnóstico de Autenticação</Text>
      
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>Status:</Text>
        <Text style={styles.statusText}>{statusMessage}</Text>
        <Text style={[styles.statusIndicator, { color: sessionValid ? 'green' : 'red' }]}>
          {sessionValid ? '✓ LOGADO' : '✗ NÃO LOGADO'}
        </Text>
      </View>
      
      {userDetails && (
        <View style={styles.userBox}>
          <Text style={styles.sectionTitle}>Informações do Usuário</Text>
          <Text style={styles.userDetail}><Text style={styles.label}>ID:</Text> {userDetails.id}</Text>
          <Text style={styles.userDetail}><Text style={styles.label}>Email:</Text> {userDetails.email}</Text>
          <Text style={styles.userDetail}><Text style={styles.label}>Confirmado:</Text> {userDetails.email_confirmed_at ? 'Sim' : 'Não'}</Text>
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button title="Verificar Novamente" onPress={checkAuth} disabled={loading} />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Testar Salvar Planta" 
          onPress={() => {
            Alert.alert(
              'Teste de Salvamento', 
              'Isso irá criar uma planta de teste na sua conta. Deseja continuar?',
              [
                {text: 'Cancelar', style: 'cancel'},
                {text: 'OK', onPress: testSavePlant},
              ]
            );
          }} 
          disabled={loading || !sessionValid} 
          color="#22C55E"
        />
      </View>
      
      <Text style={styles.helpText}>
        Se estiver com problemas, tente fazer logout e login novamente. Se o problema persistir, 
        verifique se há problemas com a conexão Supabase ou com as permissões do banco de dados.
      </Text>
      
      {sessionValid && (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Ferramentas de Correção</Text>
          <TransferPlants />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#1E293B',
  },
  statusBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#475569',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 12,
  },
  statusIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E293B',
  },
  userDetail: {
    fontSize: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 8,
  },
  helpText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1E293B',
  }
});