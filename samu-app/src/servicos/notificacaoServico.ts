import clienteHttp from './clienteHttp';

export const notificacaoServico = {
  async listarPendentesPorDestinatario<T>(nomeCompleto: string): Promise<T[]> {
    const { data } = await clienteHttp.get<T[]>(
      `/api/notificacoes/pendentes/destinatario/${encodeURIComponent(nomeCompleto)}`,
    );
    return Array.isArray(data) ? data : [];
  },

  async receber<T = unknown>(id: number, momentoRecebido: string): Promise<T> {
    const { data } = await clienteHttp.post<T>(`/api/notificacoes/${id}/receber`, {
      momentoRecebido,
    });
    return data;
  },
};
