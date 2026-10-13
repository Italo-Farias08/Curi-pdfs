import type {
  ChecklistRealizado,
  ItemAvaliado,
  ItemDoPadrao,
  ItensPorSessao,
  Situacao,
} from '../tipos/checklist';

export const ROTULO_SITUACAO: Record<Situacao, string> = {
  P: 'Perfeito',
  Q: 'Quebrado',
  F: 'Faltando',
};

export function agruparPorSessao(itens: ItemDoPadrao[]): ItensPorSessao {
  const agrupado: ItensPorSessao = {};
  itens.forEach((item) => {
    if (!agrupado[item.sessaoVeiculo]) agrupado[item.sessaoVeiculo] = [];
    agrupado[item.sessaoVeiculo].push({ ...item, situacao: 'P' });
  });
  return agrupado;
}

const chaveDoItem = (sessao: string, nome: string) =>
  `${(sessao || '').trim().toLowerCase()}||${(nome || '').trim().toLowerCase()}`;

export function sobreporSituacoesSalvas(
  itensDoPadrao: ItensPorSessao,
  checklist: ChecklistRealizado,
): ItensPorSessao {
  const salvas = new Map<string, Situacao>();
  checklist.itens.forEach((item) => {
    if (item.situacao) salvas.set(chaveDoItem(item.sessao, item.nomeItem), item.situacao);
  });

  const resultado: ItensPorSessao = {};
  const casados = new Set<string>();

  Object.entries(itensDoPadrao).forEach(([sessao, itens]) => {
    resultado[sessao] = itens.map((item) => {
      const chave = chaveDoItem(sessao, item.nomeItem);
      const salva = salvas.get(chave);
      if (salva) casados.add(chave);
      return { ...item, situacao: salva ?? 'P' };
    });
  });

  checklist.itens.forEach((item) => {
    if (!item.situacao || casados.has(chaveDoItem(item.sessao, item.nomeItem))) return;
    if (!resultado[item.sessao]) resultado[item.sessao] = [];
    resultado[item.sessao].push({
      id: item.idItem ?? item.id,
      tipoVeiculo: checklist.tipoVeiculo,
      sessaoVeiculo: item.sessao,
      nomeItem: item.nomeItem,
      situacao: item.situacao,
    });
  });

  return resultado;
}

export function itensComProblema(itensPorSessao: ItensPorSessao): ItemAvaliado[] {
  return Object.values(itensPorSessao)
    .flat()
    .filter((item) => item.situacao !== 'P');
}

export function contarProblemas(itens: ItemAvaliado[]): number {
  return itens.filter((item) => item.situacao !== 'P').length;
}
