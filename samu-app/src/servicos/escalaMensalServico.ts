import clienteHttp from './clienteHttp';

export type TipoEscala = 'H24' | 'H07_19' | 'H19_07' | 'COMERCIAL';

export const TIPOS_DA_ESCALA: { value: TipoEscala; label: string; curto: string; cor: string; fundo: string }[] = [
  { value: 'H24', label: '24h', curto: '24h', cor: '#BE123C', fundo: '#FFE4E6' },
  { value: 'H07_19', label: '07h-19h', curto: '07-19', cor: '#B45309', fundo: '#FEF3C7' },
  { value: 'H19_07', label: '19h-07h (+1)', curto: '19-07', cor: '#4338CA', fundo: '#E0E7FF' },
  { value: 'COMERCIAL', label: 'Horário Comercial', curto: 'COM', cor: '#047857', fundo: '#D1FAE5' },
];

export interface EscalaMensal {
  id: number;
  usuarioId: number;
  nomeUsuario: string;
  data: string;
  tipoEscala: TipoEscala;
  trocaSolicitada?: boolean;
  origemTrocaTipo?: 'TROCA' | 'REPASSE' | null;
  origemTrocaCom?: string | null;
}

export interface DiaEscala {
  data: string;
  tipoEscala: TipoEscala;
}

const lista = <T>(dados: unknown): T[] => (Array.isArray(dados) ? (dados as T[]) : []);

export const escalaMensalServico = {
  async listarPorMes(ano: number, mes: number): Promise<EscalaMensal[]> {
    const { data } = await clienteHttp.get('/api/escala-mensal/mes', { params: { ano, mes } });
    return lista<EscalaMensal>(data);
  },

  async solicitarTroca(id: number): Promise<void> {
    await clienteHttp.put(`/api/escala-mensal/${id}/solicitar-troca`);
  },

  async cancelarTroca(id: number): Promise<void> {
    await clienteHttp.put(`/api/escala-mensal/${id}/cancelar-troca`);
  },

  async assumirTroca(id: number): Promise<void> {
    await clienteHttp.put(`/api/escala-mensal/${id}/assumir-troca`);
  },

  async registrarMes(
    usuarioId: number,
    ano: number,
    mes: number,
    dias: DiaEscala[],
    registradoPor?: string,
  ): Promise<EscalaMensal[]> {
    const { data } = await clienteHttp.put(`/api/escala-mensal/usuario/${usuarioId}/mes`, {
      ano,
      mes,
      dias,
      registradoPor,
    });
    return lista<EscalaMensal>(data);
  },
};