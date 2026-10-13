import type { NomeCategoria } from '../tema/cores';
import type { NomeTela } from '../autorizacao/papeis';
import type { NomeIcone } from './servicos';

export interface ItemDeMenu {
  rotulo: string;
  tela: NomeTela;
}

export interface GrupoDeMenu {
  titulo: string;
  icone: NomeIcone;
  categoria: NomeCategoria;
  papeis: string[];
  itens: ItemDeMenu[];
}

const ADMIN = ['ROLE_ADMIN', 'ROLE_SUPERADMIN'];

export const GRUPOS_DE_MENU: GrupoDeMenu[] = [
  {
    titulo: 'Serviços Digitais',
    icone: 'school',
    categoria: 'ambar',
    papeis: [],
    itens: [{ rotulo: 'Treinamento', tela: 'Treinamento' }],
  },
  {
    titulo: 'Visualização',
    icone: 'eye-outline',
    categoria: 'azul',
    papeis: ['ROLE_VISUALIZADOR'],
    itens: [
      { rotulo: 'Painel Frota', tela: 'PainelFrota' },
      { rotulo: 'Registro Ocorrências', tela: 'RegistroOcorrencia' },
      { rotulo: 'Indicadores por Plantão', tela: 'IndicadoresPlantao' },
      { rotulo: 'Equipe do Dia', tela: 'EquipeDoDia' },
      { rotulo: 'Checklist', tela: 'ChecklistFarmacia' },
      { rotulo: 'Checklist do Veículo', tela: 'ChecklistVeiculo' },
      { rotulo: 'Escala Mensal', tela: 'EscalaMensal' },
    ],
  },
  {
    titulo: 'Usuários Sistema',
    icone: 'shield-check',
    categoria: 'vermelho',
    papeis: ADMIN,
    itens: [{ rotulo: 'Área Usuários', tela: 'UsuariosSistema' }],
  },
  {
    titulo: 'Condutor',
    icone: 'car',
    categoria: 'laranja',
    papeis: [...ADMIN, 'ROLE_CONDUTOR'],
    itens: [
      { rotulo: 'Diário de Bordo', tela: 'DiarioDeBordo' },
      { rotulo: 'Checklist do Veículo', tela: 'ChecklistVeiculo' },
    ],
  },
  {
    titulo: 'Ocorrências',
    icone: 'clipboard-text',
    categoria: 'vermelho',
    papeis: [...ADMIN, 'ROLE_ASSISTENTE', 'ROLE_ENFERMEIRO', 'ROLE_MEDICO'],
    itens: [
      { rotulo: 'Registro Ocorrências', tela: 'RegistroOcorrencia' },
      { rotulo: 'Indicadores por Plantão', tela: 'IndicadoresPlantao' },
    ],
  },
  {
    titulo: 'ADM',
    icone: 'cog',
    categoria: 'roxo',
    papeis: ADMIN,
    itens: [
      { rotulo: 'Ocorrências Indicadores', tela: 'IndicadoresPeriodo' },
      { rotulo: 'Equipe do Dia', tela: 'EquipeDoDia' },
      { rotulo: 'Notificação', tela: 'Notificacao' },
      { rotulo: 'Config. de Notificações', tela: 'ConfiguracaoNotificacoes' },
      { rotulo: 'Config. da Base', tela: 'ConfiguracaoBase' },
    ],
  },
  {
    titulo: 'Escala',
    icone: 'calendar-month',
    categoria: 'turquesa',
    papeis: [
      ...ADMIN,
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_TECNICO',
      'ROLE_CONDUTOR',
      'ROLE_ASSISTENTE',
    ],
    itens: [
      { rotulo: 'Escala Mensal', tela: 'EscalaMensal' },
      { rotulo: 'Troca de Plantão', tela: 'TrocaPlantao' },
    ],
  },
  {
    titulo: 'Enfermeiro',
    icone: 'stethoscope',
    categoria: 'verde',
    papeis: [...ADMIN, 'ROLE_ENFERMEIRO', 'ROLE_MEDICO'],
    itens: [
      { rotulo: 'Equipe do Dia', tela: 'EquipeDoDia' },
      { rotulo: 'Registro Ocorrências', tela: 'RegistroOcorrencia' },
      { rotulo: 'Checklist', tela: 'ChecklistFarmacia' },
      { rotulo: 'Reposição', tela: 'Reposicao' },
      { rotulo: 'Liberação', tela: 'LiberacaoFarmacia' },
    ],
  },
  {
    titulo: 'Técnico',
    icone: 'medical-bag',
    categoria: 'verde',
    papeis: [...ADMIN, 'ROLE_TECNICO'],
    itens: [
      { rotulo: 'Registro Ocorrências', tela: 'RegistroOcorrencia' },
      { rotulo: 'Checklist', tela: 'ChecklistFarmacia' },
      { rotulo: 'Reposição', tela: 'Reposicao' },
    ],
  },
  {
    titulo: 'Frota',
    icone: 'truck',
    categoria: 'azul',
    papeis: ADMIN,
    itens: [
      { rotulo: 'Veículos', tela: 'CadastrarVeiculo' },
      { rotulo: 'Hospitais', tela: 'Hospitais' },
      { rotulo: 'Painel Frota', tela: 'PainelFrota' },
      { rotulo: 'Viagens por Placa', tela: 'ViagensPorPlaca' },
      { rotulo: 'Abastecimentos por Placa', tela: 'AbastecimentosPorPlaca' },
      { rotulo: 'Painel Abastecimentos', tela: 'PainelAbastecimentos' },
      { rotulo: 'Pendências', tela: 'PendenciasChecklist' },
      { rotulo: 'Concluídos', tela: 'ChecklistsConcluidos' },
    ],
  },
  {
    titulo: 'Farmácia',
    icone: 'pill',
    categoria: 'verde',
    papeis: ADMIN,
    itens: [
      { rotulo: 'Liberação', tela: 'LiberacaoFarmacia' },
      { rotulo: 'Liberados', tela: 'LiberadosFarmacia' },
      { rotulo: 'Relatório', tela: 'RelatorioFarmacia' },
    ],
  },
  {
    titulo: 'Checklist VT',
    icone: 'clipboard-check',
    categoria: 'laranja',
    papeis: ADMIN,
    itens: [
      { rotulo: 'Itens', tela: 'ItensChecklistVeiculo' },
      { rotulo: 'Sessões para Checklist', tela: 'SessoesChecklistVeiculo' },
      { rotulo: 'Padrões checklists', tela: 'PadroesChecklistVeiculo' },
    ],
  },
  {
    titulo: 'Checklist Farm',
    icone: 'clipboard-list',
    categoria: 'roxo',
    papeis: ADMIN,
    itens: [
      { rotulo: 'Itens', tela: 'ItensFarmacia' },
      { rotulo: 'Sessões para checklist', tela: 'SessoesFarmacia' },
      { rotulo: 'Grupo de Sessões para checklist', tela: 'GrupoSessoesFarmacia' },
      { rotulo: 'Padrões checklists', tela: 'PadroesFarmacia' },
    ],
  },
  {
    titulo: 'Backup',
    icone: 'database',
    categoria: 'azul',
    papeis: ADMIN,
    itens: [{ rotulo: 'Exportar Dados', tela: 'Backup' }],
  },
];

export function gruposDoUsuario(papeis: string[]): GrupoDeMenu[] {
  return GRUPOS_DE_MENU.filter(
    (grupo) => grupo.papeis.length === 0 || grupo.papeis.some((papel) => papeis.includes(papel)),
  );
}
