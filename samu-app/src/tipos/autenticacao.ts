export type Papel =
  | 'ROLE_SUPERADMIN'
  | 'ROLE_ADMIN'
  | 'ROLE_SECRETARIO'
  | 'ROLE_SUPORTE'
  | 'ROLE_USUARIO';

export interface UsuarioAutenticado {
  id?: string | null;
  nomeCompleto?: string;
  username?: string;
  roles?: string[];
  cpf?: string;
  telefone?: string;
  email?: string;
  imagemUrl?: string;
  tenantId?: number | null;
  tenantNome?: string;
  tenantCidade?: string;
  tenantEstado?: string;
  token?: string;
  refreshToken?: string;
}

export interface RespostaLogin {
  token: string;
  refreshToken: string;
  nome: string;
  username: string;
  cpf: string;
  email: string;
  telefone: string;
  imagemUrl: string;
  id: number;
  tenantId: number | null;
  tenantNome: string;
  tenantCidade: string;
  tenantEstado: string;
  roles: string[];
}

export interface RespostaRenovacao {
  token: string;
  refreshToken: string;
}

export interface Notificacao {
  id: number;
  mensagem: string;
  assunto?: string | null;
  criadoPor: string;
  enviadoPara: string;
  nomeCompleto: string;
  recebidoPor?: string | null;
  momentoCriacao: string;
  momentoRecebido: string | null;
  tipoEvento?: string | null;
  loteEnvioId?: string | null;
  origemEnvio?: string | null;
  referenciaId?: number | null;
}
