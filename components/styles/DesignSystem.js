// Design System Profissional - ScanPlant App

// Paleta de Cores Profissional
export const Colors = {
  // Cores Primárias (Verde Claro Moderno)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Verde claro principal
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Cores Neutras (Escala de Cinza)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Cores de Sistema
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Cores de Fundo
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    dark: '#1f2937',
  },
  
  // Cores de Texto
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    muted: '#a1a1aa',
  },
  
  // Cores de Borda
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
};

// Tipografia Profissional
export const Typography = {
  // Tamanhos de Fonte
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Pesos de Fonte
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Altura da Linha
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Estilos Pré-definidos
  styles: {
    h1: {
      fontSize: 30,
      fontWeight: '700',
      lineHeight: 36,
      color: Colors.text.primary,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 30,
      color: Colors.text.primary,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 26,
      color: Colors.text.primary,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      color: Colors.text.primary,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: Colors.text.primary,
    },
    bodyMedium: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
      color: Colors.text.primary,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: Colors.text.secondary,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      color: Colors.text.tertiary,
    },
  },
};

// Espaçamento Consistente
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 80,
  '5xl': 96,
};

// Bordas e Raios
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Sombras
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Ícones Profissionais (símbolos minimalistas)
export const Icons = {
  // Navegação
  back: '‹',
  forward: '›',
  up: '⌃',
  down: '⌄',
  close: '✕',
  
  // Ações
  add: '+',
  remove: '−',
  edit: '✎',
  delete: '⌫',
  save: '✓',
  cancel: '✕',
  rotate: '↻',
  
  // Interface
  menu: '≡',
  search: '⌕',
  filter: '⚙',
  settings: '⚙',
  
  // Conteúdo
  image: '▢',
  camera: '⌘',
  gallery: '▦',
  location: '⌖',
  calendar: '▣',
  collection: '⊞',
  users: '⋙',
  community: '▦',
  
  // Plantas
  plant: '❋',
  leaf: '❋',
  flower: '✿',
  tree: '♦',
  identify: '❋',
  
  // Estados
  success: '✓',
  warning: '!',
  error: '✕',
  info: 'i',
  loading: '○',
};

// Componentes Base
export const BaseStyles = {
  // Container Principal
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  // Container com Padding
  containerPadded: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.md,
  },
  
  // Card
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  
  // Botão Primário
  buttonPrimary: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  // Botão Secundário
  buttonSecondary: {
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  
  // Input
  input: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.light,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    minHeight: 44,
  },
  
  // Header
  header: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  // Lista
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  
  // Item da Lista
  listItem: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  
  // Separador
  separator: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: Spacing.sm,
  },
  
  // Centro
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Linha
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Coluna
  column: {
    flexDirection: 'column',
  },
};

// Utilitários
export const Utils = {
  // Criar sombra personalizada
  createShadow: (elevation) => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.1 + (elevation * 0.02),
    shadowRadius: elevation,
    elevation,
  }),
  
  // Criar gradiente (para uso com react-native-linear-gradient)
  gradients: {
    primary: [Colors.primary[400], Colors.primary[600]],
    neutral: [Colors.neutral[50], Colors.neutral[100]],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    error: ['#ef4444', '#dc2626'],
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Icons,
  BaseStyles,
  Utils,
};