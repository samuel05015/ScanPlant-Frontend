import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
// IMPORTANTE: Você precisa substituir essas URLs e chaves pelas suas próprias
// Acesse https://supabase.com para criar seu projeto
const supabaseUrl = 'https://jrskbdqzjocgabbimvdi.supabase.co'; // Ex: https://xyzcompany.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyc2tiZHF6am9jZ2FiYmltdmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTU4MjcsImV4cCI6MjA3MjU3MTgyN30.28rIapf9J3flI4Bh-neM2_KsvX9nh-zw8LEel0Gl9S4'; // Sua chave pública (anon key)

// Criando o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções de autenticação
export const auth = {
  // Login com email e senha
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Registro de novo usuário
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Reset de senha
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Obter usuário atual
  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  // Listener para mudanças de autenticação
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Funções do banco de dados
export const database = {
  // Inserir dados
  insert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    return { data: result, error };
  },

  // Buscar dados
  select: async (table, columns = '*', filters = {}) => {
    let query = supabase.from(table).select(columns);
    
    // Aplicar filtros se existirem
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });
    
    const { data, error } = await query;
    return { data, error };
  },

  // Atualizar dados
  update: async (table, data, filters) => {
    let query = supabase.from(table).update(data);
    
    // Aplicar filtros
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });
    
    const { data: result, error } = await query.select();
    return { data: result, error };
  },

  // Deletar dados
  delete: async (table, filters) => {
    let query = supabase.from(table).delete();
    
    // Aplicar filtros
    Object.keys(filters).forEach(key => {
      query = query.eq(key, filters[key]);
    });
    
    const { error } = await query;
    return { error };
  }
};

// Funções de storage (para imagens)
export const storage = {
  // Upload de arquivo
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Download de arquivo
  download: async (bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    return { data, error };
  },

  // Obter URL pública
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Deletar arquivo
  remove: async (bucket, paths) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    return { data, error };
  }
};

export default supabase;