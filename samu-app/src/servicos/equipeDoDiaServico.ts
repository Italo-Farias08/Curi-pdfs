import clienteHttp from './clienteHttp';

export interface EquipeDoDia {
  id: number;
  nome: string;
  usuarioId?: number | null;
  registradoPor: string;
  tipoVeiculo: string;
  tipoPlantao: string;
  funcao: string;
  dataRegOuEdit: string;
  avulso?: boolean;
}

export interface VeiculoDaFrota {
  id: number;
  tipo: string;
  tipoVeiculo: string;
  modelo: string;
  placa: string;
  imagemUrl?: string;
  descricao?: string;
}

export type TipoEscala = 'H24' | 'H07_19' | 'H19_07' | 'COMERCIAL';

export const TIPOS_ESCALA: { value: TipoEscala; label: string }[] = [
  { value: 'H24', label: '24h' },
  { value: 'H07_19', label: '07h-19h' },
  { value: 'H19_07', label: '19h-07h (+1)' },
  { value: 'COMERCIAL', label: 'Horário Comercial' },
];

export interface EscalaDoDia {
  usuarioId: number;
  nome: string;
  roles: string[];
  tipoEscala: TipoEscala;
}

const lista = <T>(dados: unknown): T[] => (Array.isArray(dados) ? (dados as T[]) : []);

export const equipeDoDiaServico = {
  async listarPorData(data: string): Promise<EquipeDoDia[]> {
    const { data: resposta } = await clienteHttp.get('/api/equipe-do-dia/por-data', {
      params: { data },
    });
    return lista<EquipeDoDia>(resposta);
  },

  async criar(payload: unknown): Promise<void> {
    await clienteHttp.post('/api/equipe-do-dia', payload);
  },

  async atualizar(id: number, payload: unknown): Promise<void> {
    await clienteHttp.put(`/api/equipe-do-dia/${id}`, payload);
  },

  async deletar(id: number): Promise<void> {
    await clienteHttp.delete(`/api/equipe-do-dia/${id}`);
  },

  async escalaDoDia(data: string): Promise<EscalaDoDia[]> {
    const { data: resposta } = await clienteHttp.get('/api/escala-mensal/dia', {
      params: { data },
    });
    return lista<EscalaDoDia>(resposta);
  },

  async veiculos(): Promise<VeiculoDaFrota[]> {
    const { data } = await clienteHttp.get('/veiculos/listar-todos');
    return lista<VeiculoDaFrota>(data);
  },
};

/** Funções de plantão (role -> rótulo), igual ao web (useFuncaoElegivel). */
export const ROLES_ELEGIVEIS: Record<string, string> = {
  ROLE_ASSISTENTE: 'Assistente',
  ROLE_TECNICO: 'Técnico',
  ROLE_ENFERMEIRO: 'Enfermeiro',
  ROLE_MEDICO: 'Médico',
  ROLE_CONDUTOR: 'Condutor',
};

export const funcoesElegiveis = (roles?: string[]): string[] =>
  (roles || []).filter((r) => ROLES_ELEGIVEIS[r]).map((r) => ROLES_ELEGIVEIS[r]);