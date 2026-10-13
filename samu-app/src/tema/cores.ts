export const cores = {
  vermelho: '#E30613',
  vermelhoEscuro: '#A0081D',
  marinho: '#1a2c5b',
  azul: '#1443b3',
  laranja: '#F47A20',
  amarelo: '#FFD700',
  fundo: '#EEF1F6',
  superficie: '#FFFFFF',
  texto: '#0F1B3D',
  textoSecundario: '#5B6580',
  textoSuave: '#8A93AB',
  borda: '#D9DFEA',
  erro: '#B3261E',
  erroFundo: '#FDECEA',
  sucesso: '#1E8E5A',
  sucessoFundo: '#E6F6EE',
  gradiente: ['#c0392b', '#1a2c5b'] as [string, string],
};

export type NomeCategoria =
  | 'vermelho'
  | 'laranja'
  | 'azul'
  | 'verde'
  | 'roxo'
  | 'ambar'
  | 'turquesa';

export const categorias: Record<NomeCategoria, { fundo: string; icone: string }> = {
  vermelho: { fundo: '#FDECEE', icone: '#E30613' },
  laranja: { fundo: '#FEF0E4', icone: '#F47A20' },
  azul: { fundo: '#E8EEFB', icone: '#1443b3' },
  verde: { fundo: '#E6F6EE', icone: '#059669' },
  roxo: { fundo: '#F3EAFB', icone: '#9333EA' },
  ambar: { fundo: '#FEF5E0', icone: '#D97706' },
  turquesa: { fundo: '#E3F5F3', icone: '#0D9488' },
};

export const espacos = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const raios = { sm: 8, md: 12, lg: 16, circulo: 999 };
