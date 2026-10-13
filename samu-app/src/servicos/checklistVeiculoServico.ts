import clienteHttp from './clienteHttp';
import type { ChecklistRealizado, ItemDoPadrao, VeiculoDisponivel } from '../tipos/checklist';

const lista = <T>(dados: unknown): T[] => (Array.isArray(dados) ? (dados as T[]) : []);

export const checklistVeiculoServico = {
  async veiculosDisponiveis(): Promise<VeiculoDisponivel[]> {
    const { data } = await clienteHttp.get(
      '/api/padrao-checklist-motorista/checklists-disponiveis-por-placa',
    );
    return lista<VeiculoDisponivel>(data).sort((a, b) => a.tipo.localeCompare(b.tipo));
  },

  async itensPorPlaca(placa: string): Promise<ItemDoPadrao[]> {
    const { data } = await clienteHttp.get(
      `/api/padrao-checklist-motorista/por-placa/${encodeURIComponent(placa)}`,
    );
    return lista<ItemDoPadrao>(data);
  },

  async pendentesPorCpf(cpf: string): Promise<ChecklistRealizado[]> {
    const { data } = await clienteHttp.get(`/api/checklist-motorista-realizado/por-cpf/${cpf}`);
    return lista<ChecklistRealizado>(data).sort((a, b) => a.id - b.id);
  },

  async realizadosPorCpf(cpf: string): Promise<ChecklistRealizado[]> {
    const { data } = await clienteHttp.get(
      `/api/checklist-motorista-realizado/por-cpf-realizados-top-15/${cpf}`,
    );
    return lista<ChecklistRealizado>(data).sort((a, b) => b.id - a.id);
  },

  async criar(payload: unknown): Promise<void> {
    await clienteHttp.post('/api/checklist-motorista-realizado', payload);
  },

  async atualizar(id: number, payload: unknown): Promise<void> {
    await clienteHttp.put(`/api/checklist-motorista-realizado/${id}`, payload);
  },

  async excluir(id: number): Promise<void> {
    await clienteHttp.delete(`/api/checklist-motorista-realizado/${id}`);
  },
};
