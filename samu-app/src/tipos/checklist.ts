export type Situacao = 'P' | 'Q' | 'F';

export interface VeiculoDisponivel {
  tipoVeiculo: string;
  tipo: string;
  modelo: string;
  placa: string;
  imagemUrl?: string | null;
  descricao?: string | null;
}

export interface ItemDoPadrao {
  id: number;
  tipoVeiculo: string;
  sessaoVeiculo: string;
  nomeItem: string;
}

export interface ItemAvaliado extends ItemDoPadrao {
  situacao: Situacao;
}

export interface ItemSalvo {
  id: number;
  idItem?: number;
  nomeItem: string;
  sessao: string;
  situacao?: Situacao;
}

export interface ChecklistRealizado {
  id: number;
  registradoPor: string;
  cpf: string;
  status: string;
  tipo: string;
  tipoVeiculo: string;
  placa: string;
  descricaoVeiculo?: string | null;
  observacoes: string;
  dataCriacao: string;
  recebidoPor?: string;
  momentoFinalizado?: string;
  itens: ItemSalvo[];
}

export type ItensPorSessao = Record<string, ItemAvaliado[]>;
