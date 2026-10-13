import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { URL_BASE_API, TEMPO_LIMITE_REQUISICAO } from '../config/ambiente';
import {
  limparUsuario,
  obterUsuarioEmMemoria,
  salvarUsuario,
} from '../utilitarios/armazenamento';
import { emitirEvento } from '../utilitarios/eventosSessao';
import { solicitarRenovacao } from './renovacao';

const clienteHttp = axios.create({
  baseURL: URL_BASE_API,
  headers: { 'Content-Type': 'application/json' },
  timeout: TEMPO_LIMITE_REQUISICAO,
});

const ROTAS_SEM_TOKEN = ['/auth/login', '/auth/refresh', '/auth/logout'];
const METODOS_DE_ESCRITA = ['post', 'put', 'patch', 'delete'];

clienteHttp.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const url = config.url || '';
  if (ROTAS_SEM_TOKEN.some((rota) => url.includes(rota))) {
    return config;
  }

  const usuario = obterUsuarioEmMemoria();
  if (usuario?.token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${usuario.token}`;
  }

  const metodo = (config.method || '').toLowerCase();
  if (usuario?.roles?.includes('ROLE_VISUALIZADOR') && METODOS_DE_ESCRITA.includes(metodo)) {
    return Promise.reject({
      isAxiosError: true,
      config,
      response: {
        status: 403,
        data: { error: 'Usuário de demonstração: somente leitura' },
      },
    });
  }

  return config;
});

let renovacaoEmAndamento = false;
let filaDeEspera: Array<(novoToken: string | null) => void> = [];

function resolverFila(novoToken: string | null) {
  filaDeEspera.forEach((retorno) => retorno(novoToken));
  filaDeEspera = [];
}

async function encerrarSessao() {
  await limparUsuario();
  emitirEvento('sessao-encerrada');
}

clienteHttp.interceptors.response.use(
  (resposta) => resposta,
  async (erro: AxiosError) => {
    const original = erro.config as (AxiosRequestConfig & { _tentou?: boolean }) | undefined;
    const status = erro.response?.status;
    const url = original?.url ?? '';

    if (status === 402) {
      emitirEvento('unidade-suspensa');
      return Promise.reject(erro);
    }

    const podeRenovar =
      status === 401 &&
      original &&
      !original._tentou &&
      !ROTAS_SEM_TOKEN.some((rota) => url.includes(rota));

    if (!podeRenovar || !original) {
      return Promise.reject(erro);
    }

    const usuario = obterUsuarioEmMemoria();
    if (!usuario?.refreshToken) {
      await encerrarSessao();
      return Promise.reject(erro);
    }

    original._tentou = true;

    if (renovacaoEmAndamento) {
      return new Promise((resolver, rejeitar) => {
        filaDeEspera.push((novoToken) => {
          if (!novoToken) return rejeitar(erro);
          original.headers = { ...original.headers, Authorization: `Bearer ${novoToken}` };
          resolver(clienteHttp(original));
        });
      });
    }

    renovacaoEmAndamento = true;
    try {
      const { token, refreshToken } = await solicitarRenovacao(usuario.refreshToken);
      await salvarUsuario({ ...usuario, token, refreshToken });
      resolverFila(token);

      original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
      return clienteHttp(original);
    } catch (e) {
      resolverFila(null);
      await encerrarSessao();
      return Promise.reject(e);
    } finally {
      renovacaoEmAndamento = false;
    }
  },
);

export default clienteHttp;
