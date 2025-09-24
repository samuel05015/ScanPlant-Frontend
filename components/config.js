// MIGRAÇÃO PARA SUPABASE
// Este arquivo agora usa Supabase em vez do Firebase
import { supabase, auth, database, storage } from './supabase';

// Objeto compatível com Firebase para facilitar a migração
const firebase = {
  // Autenticação
  auth: () => ({
    signInWithEmailAndPassword: auth.signIn,
    createUserWithEmailAndPassword: auth.signUp,
    sendPasswordResetEmail: auth.resetPassword,
    signOut: auth.signOut,
    onAuthStateChanged: auth.onAuthStateChange,
    currentUser: null // Será atualizado dinamicamente
  }),

  // Database (simulando Realtime Database do Firebase)
  database: () => ({
    ref: (path) => ({
      push: async (data) => {
        const table = path.split('/')[0]; // Primeira parte do path como nome da tabela
        return await database.insert(table, data);
      },
      set: async (data) => {
        const table = path.split('/')[0];
        return await database.insert(table, data);
      },
      once: async (eventType) => {
        if (eventType === 'value') {
          const table = path.split('/')[0];
          const result = await database.select(table);
          return {
            val: () => result.data
          };
        }
      },
      on: (eventType, callback) => {
        // Para implementar listeners em tempo real, seria necessário usar subscriptions do Supabase
        console.log('Real-time listeners precisam ser implementados com Supabase subscriptions');
      }
    })
  }),

  // Storage
  storage: () => ({
    ref: (path) => ({
      put: async (file) => {
        const bucket = 'plants'; // Nome do bucket padrão
        return await storage.upload(bucket, path, file);
      },
      getDownloadURL: async () => {
        const bucket = 'plants';
        return storage.getPublicUrl(bucket, path);
      }
    })
  })
};

// Exportar tanto o objeto firebase compatível quanto o supabase original
export { supabase };
export default firebase;