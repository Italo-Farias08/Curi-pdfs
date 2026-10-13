import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UsuarioAutenticado } from '../tipos/autenticacao';

const CHAVE_TOKEN = 'samu_token';
const CHAVE_RENOVACAO = 'samu_refresh_token';
const CHAVE_USUARIO = 'samu_usuario';

let usuarioEmMemoria: UsuarioAutenticado | null = null;

export function obterUsuarioEmMemoria(): UsuarioAutenticado | null {
  return usuarioEmMemoria;
}

export async function carregarUsuario(): Promise<UsuarioAutenticado | null> {
  try {
    const [token, refreshToken, bruto] = await Promise.all([
      SecureStore.getItemAsync(CHAVE_TOKEN),
      SecureStore.getItemAsync(CHAVE_RENOVACAO),
      AsyncStorage.getItem(CHAVE_USUARIO),
    ]);

    if (!bruto) {
      usuarioEmMemoria = null;
      return null;
    }

    const perfil = JSON.parse(bruto) as UsuarioAutenticado;
    usuarioEmMemoria = {
      ...perfil,
      token: token ?? undefined,
      refreshToken: refreshToken ?? undefined,
    };
    return usuarioEmMemoria;
  } catch {
    usuarioEmMemoria = null;
    return null;
  }
}

export async function salvarUsuario(usuario: UsuarioAutenticado): Promise<void> {
  usuarioEmMemoria = usuario;
  const { token, refreshToken, ...perfil } = usuario;

  await Promise.all([
    token
      ? SecureStore.setItemAsync(CHAVE_TOKEN, token)
      : SecureStore.deleteItemAsync(CHAVE_TOKEN),
    refreshToken
      ? SecureStore.setItemAsync(CHAVE_RENOVACAO, refreshToken)
      : SecureStore.deleteItemAsync(CHAVE_RENOVACAO),
    AsyncStorage.setItem(CHAVE_USUARIO, JSON.stringify(perfil)),
  ]);
}

export async function limparUsuario(): Promise<void> {
  usuarioEmMemoria = null;
  await Promise.all([
    SecureStore.deleteItemAsync(CHAVE_TOKEN).catch(() => undefined),
    SecureStore.deleteItemAsync(CHAVE_RENOVACAO).catch(() => undefined),
    AsyncStorage.removeItem(CHAVE_USUARIO).catch(() => undefined),
  ]);
}
