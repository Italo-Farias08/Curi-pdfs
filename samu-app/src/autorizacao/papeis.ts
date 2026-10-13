const SUPERADMIN = ['ROLE_SUPERADMIN'];
const AREA_ADMIN = ['ROLE_ADMIN', 'ROLE_SUPERADMIN'];
const GESTAO = ['ROLE_ADMIN', 'ROLE_SUPERADMIN'];
const CONDUTOR = ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_CONDUTOR'];
const CLINICO = [
  'ROLE_ADMIN',
  'ROLE_SUPERADMIN',
  'ROLE_ENFERMEIRO',
  'ROLE_MEDICO',
  'ROLE_TECNICO',
  'ROLE_ASSISTENTE',
];
const INDICADORES_PLANTAO = [
  'ROLE_ADMIN',
  'ROLE_SUPERADMIN',
  'ROLE_ENFERMEIRO',
  'ROLE_MEDICO',
  'ROLE_ASSISTENTE',
];
const ENFERMAGEM = [
  'ROLE_ADMIN',
  'ROLE_SUPERADMIN',
  'ROLE_ENFERMEIRO',
  'ROLE_MEDICO',
  'ROLE_TECNICO',
];
const LIBERACAO_FARMACIA = ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_ENFERMEIRO', 'ROLE_MEDICO'];
const EQUIPE_DO_DIA = [
  'ROLE_ADMIN',
  'ROLE_SUPERADMIN',
  'ROLE_ENFERMEIRO',
  'ROLE_MEDICO',
  'ROLE_ASSISTENTE',
];
const OPERACIONAL = [
  'ROLE_ADMIN',
  'ROLE_SUPERADMIN',
  'ROLE_ENFERMEIRO',
  'ROLE_MEDICO',
  'ROLE_TECNICO',
  'ROLE_CONDUTOR',
  'ROLE_ASSISTENTE',
];

const VISUALIZADOR = 'ROLE_VISUALIZADOR';

export type NomeTela =
  | 'Inicio'
  | 'Perfil'
  | 'Treinamento'
  | 'DiarioDeBordo'
  | 'ChecklistVeiculo'
  | 'ChecklistFarmacia'
  | 'Reposicao'
  | 'LiberacaoFarmacia'
  | 'LiberadosFarmacia'
  | 'RelatorioFarmacia'
  | 'RegistroOcorrencia'
  | 'IndicadoresPlantao'
  | 'IndicadoresPeriodo'
  | 'EscalaMensal'
  | 'EquipeDoDia'
  | 'TrocaPlantao'
  | 'Notificacao'
  | 'ConfiguracaoBase'
  | 'Backup'
  | 'PainelFrota'
  | 'ViagensPorPlaca'
  | 'AbastecimentosPorPlaca'
  | 'PainelAbastecimentos'
  | 'PendenciasChecklist'
  | 'ChecklistsConcluidos'
  | 'UsuariosSistema'
  | 'ConfiguracaoNotificacoes'
  | 'CadastrarVeiculo'
  | 'Hospitais'
  | 'ItensChecklistVeiculo'
  | 'SessoesChecklistVeiculo'
  | 'PadroesChecklistVeiculo'
  | 'ItensFarmacia'
  | 'SessoesFarmacia'
  | 'GrupoSessoesFarmacia'
  | 'PadroesFarmacia';

export const PAPEIS_POR_TELA: Record<NomeTela, string[] | null> = {
  Inicio: null,
  Perfil: null,
  Treinamento: null,
  DiarioDeBordo: CONDUTOR,
  ChecklistVeiculo: [...CONDUTOR, VISUALIZADOR],
  ChecklistFarmacia: [...ENFERMAGEM, VISUALIZADOR],
  Reposicao: ENFERMAGEM,
  LiberacaoFarmacia: LIBERACAO_FARMACIA,
  LiberadosFarmacia: GESTAO,
  RelatorioFarmacia: GESTAO,
  RegistroOcorrencia: [...CLINICO, VISUALIZADOR],
  IndicadoresPlantao: [...INDICADORES_PLANTAO, VISUALIZADOR],
  IndicadoresPeriodo: GESTAO,
  EscalaMensal: [...OPERACIONAL, VISUALIZADOR],
  EquipeDoDia: [...EQUIPE_DO_DIA, VISUALIZADOR],
  TrocaPlantao: OPERACIONAL,
  Notificacao: GESTAO,
  ConfiguracaoBase: GESTAO,
  Backup: GESTAO,
  PainelFrota: [...GESTAO, VISUALIZADOR],
  ViagensPorPlaca: GESTAO,
  AbastecimentosPorPlaca: GESTAO,
  PainelAbastecimentos: GESTAO,
  PendenciasChecklist: GESTAO,
  ChecklistsConcluidos: GESTAO,
  UsuariosSistema: AREA_ADMIN,
  ConfiguracaoNotificacoes: GESTAO,
  CadastrarVeiculo: GESTAO,
  Hospitais: GESTAO,
  ItensChecklistVeiculo: GESTAO,
  SessoesChecklistVeiculo: GESTAO,
  PadroesChecklistVeiculo: GESTAO,
  ItensFarmacia: GESTAO,
  SessoesFarmacia: GESTAO,
  GrupoSessoesFarmacia: GESTAO,
  PadroesFarmacia: GESTAO,
};

export const PAPEIS_SUPERADMIN = SUPERADMIN;

export function telaAutorizada(tela: NomeTela, papeisDoUsuario: string[] = []): boolean {
  const exigidos = PAPEIS_POR_TELA[tela];
  if (!exigidos) return true;
  return exigidos.some((papel) => papeisDoUsuario.includes(papel));
}
