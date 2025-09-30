import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function GroqTestScreen() {
  const [result, setResult] = useState('Clique para testar');
  const [loading, setLoading] = useState(false);
  
  const testGroqAPI = async () => {
    setLoading(true);
    try {
      const GROQ_API_KEY = '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';
      const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
      
      console.log('Testando API da Groq...');
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Responda de forma breve'
            },
            {
              role: 'user',
              content: 'Olá, você está funcionando?'
            }
          ],
        }),
      });
      
      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API Groq: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Resposta completa:', JSON.stringify(data));
      
      const content = (data.choices?.[0]?.message?.content || '').trim();
      setResult(`Sucesso! Resposta: ${content}`);
    } catch (error) {
      console.error('Erro no teste da API:', error);
      setResult(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teste da API da Groq</Text>
      <Text style={styles.result}>{result}</Text>
      <Button 
        title={loading ? "Testando..." : "Testar API da Groq"} 
        onPress={testGroqAPI} 
        disabled={loading} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  result: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
    minHeight: 100,
    textAlign: 'center',
  },
});