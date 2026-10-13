import clienteHttp from './clienteHttp';

export interface VeiculoDoPainel {
  id: string;
  modelo: string;
  placa: string;
  km: string;
  motorista: string;
  cpfMotorista: string;
  statusDoVeiculo: string;
  situacao: string;
  idMapa: string | number;
  tipo?: string;
  destino?: string;
  imagemUrl?: string;
  exibirEmOcorrencia?: boolean;
}

export const frotaServico = {
  async listar(): Promise<VeiculoDoPainel[]> {
    const { data } = await clienteHttp.get('/veiculos/listar-todos');
    return Array.isArray(data) ? (data as VeiculoDoPainel[]) : [];
  },

  async mudarStatus(placa: string, payload: unknown): Promise<void> {
    await clienteHttp.put(`/veiculos/${encodeURIComponent(placa)}/mudar-status`, payload);
  },

  async definirExibicaoEmOcorrencia(id: string | number, exibir: boolean): Promise<void> {
    await clienteHttp.put(`/veiculos/${id}/exibir-em-ocorrencia`, { exibirEmOcorrencia: exibir });
  },

  async fecharMapa(idMapa: string | number, payload: unknown): Promise<void> {
    await clienteHttp.put(`/mapa-veiculo/${idMapa}/fechar-mapa`, payload);
  },
};