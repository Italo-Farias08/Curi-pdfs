import type { NomeTela } from '../autorizacao/papeis';

export type ParametrosAutenticacao = {
  Apresentacao: undefined;
  Login: { mensagem?: string } | undefined;
  EsqueciSenha: undefined;
};

export type ParametrosPrincipal = Record<NomeTela, undefined> & {
  UnidadeSuspensa: undefined;
};