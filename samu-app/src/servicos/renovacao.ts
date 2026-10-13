import axios from 'axios';
import { URL_BASE_API, TEMPO_LIMITE_REQUISICAO } from '../config/ambiente';
import type { RespostaRenovacao } from '../tipos/autenticacao';

export async function solicitarRenovacao(refreshToken: string): Promise<RespostaRenovacao> {
  const { data } = await axios.post<RespostaRenovacao>(
    `${URL_BASE_API}/auth/refresh`,
    { refreshToken },
    { timeout: TEMPO_LIMITE_REQUISICAO },
  );
  return data;
}
