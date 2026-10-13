import axios from 'axios';
import clienteHttp from './clienteHttp';
import { solicitarRenovacao } from './renovacao';
import { URL_BASE_API } from '../config/ambiente';
import {
  carregarUsuario,
  limparUsuario,
  obterUsuarioEmMemoria,
  salvarUsuario,
} from '../utilitarios/armazenamento';
import { decodificarToken, tokenExpirado } from '../utilitarios/jwt';
import type { RespostaLogin, UsuarioAutenticado } from '../tipos/autenticacao';

export async function entrar(username: string, password: string): Promise<UsuarioAutenticado> {
  const { data } = await clienteHttp.post<RespostaLogin>('/auth/login', { username, password });

  const decodificado = decodificarToken(data.token);
  const usuario: UsuarioAutenticado = {
    id: data.id != null ? String(data.id) : null,
    nomeCompleto: data.nome ?? '',
    username: data.username ?? '',
    cpf: data.cpf ?? '',
    telefone: data.telefone ?? '',
    email: data.email ?? '',
    imagemUrl: data.imagemUrl ?? '',
    roles: decodificado.roles?.length ? decodificado.roles : (data.roles ?? []),
    tenantId: data.tenantId ?? null,
    tenantNome: data.tenantNome ?? '',
    tenantCidade: data.tenantCidade ?? '',
    tenantEstado: data.tenantEstado ?? '',
    token: data.token,
    refreshToken: data.refreshToken,
  };

  await salvarUsuario(usuario);
  return usuario;
}

export async function restaurarSessao(): Promise<UsuarioAutenticado | null> {
  let usuario = await carregarUsuario();
  if (!usuario) return null;

  if (!usuario.token || tokenExpirado(usuario.token)) {
    if (!usuario.refreshToken) {
      await limparUsuario();
      return null;
    }
    try {
      const { token, refreshToken } = await solicitarRenovacao(usuario.refreshToken);
      usuario = { ...usuario, token, refreshToken };
      await salvarUsuario(usuario);
    } catch (erro) {
      const status = (erro as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || status === 400) {
        await limparUsuario();
        return null;
      }
      return usuario;
    }
  }

  return usuario;
}

export async function sair(): Promise<void> {
  const usuario = obterUsuarioEmMemoria();
  try {
    if (usuario?.refreshToken) {
      await axios.post(
        `${URL_BASE_API}/auth/logout`,
        { refreshToken: usuario.refreshToken },
        { timeout: 10000 },
      );
    }
  } catch {
  } finally {
    await limparUsuario();
  }
}

export async function reenviarConfirmacao(login: string): Promise<string> {
  const { data } = await axios.post<{ mensagem: string }>(
    `${URL_BASE_API}/usuarios/reenviar-confirmacao`,
    { login },
    { timeout: 20000 },
  );
  return data.mensagem;
}

export async function solicitarRecuperacaoSenha(email: string): Promise<void> {
  await clienteHttp.post('/password/forgot-password', { email });
}
