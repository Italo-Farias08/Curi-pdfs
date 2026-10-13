import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NomeCategoria } from '../tema/cores';
import type { NomeTela } from '../autorizacao/papeis';

export type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface ServicoDoInicio {
  titulo: string;
  rotulo: string;
  icone: NomeIcone;
  categoria: NomeCategoria;
  tela: NomeTela;
  papeis: string[];
}

export const SERVICOS_DO_INICIO: ServicoDoInicio[] = [
  {
    titulo: 'Controle de Acesso',
    rotulo: 'Área Usuários',
    icone: 'shield-check',
    categoria: 'vermelho',
    tela: 'UsuariosSistema',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Notificações',
    rotulo: 'Notificação',
    icone: 'bell',
    categoria: 'ambar',
    tela: 'Notificacao',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Definições da Base',
    rotulo: 'Config. da Base',
    icone: 'cog',
    categoria: 'roxo',
    tela: 'ConfiguracaoBase',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Registro Ocorrência',
    rotulo: 'Registro Ocorrências',
    icone: 'clipboard-text',
    categoria: 'vermelho',
    tela: 'RegistroOcorrencia',
    papeis: [
      'ROLE_ADMIN',
      'ROLE_SUPERADMIN',
      'ROLE_ASSISTENTE',
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_TECNICO',
      'ROLE_VISUALIZADOR',
    ],
  },
  {
    titulo: 'Ind. por Plantão',
    rotulo: 'Indicadores por Plantão',
    icone: 'chart-bar',
    categoria: 'azul',
    tela: 'IndicadoresPlantao',
    papeis: [
      'ROLE_ADMIN',
      'ROLE_SUPERADMIN',
      'ROLE_ASSISTENTE',
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_VISUALIZADOR',
    ],
  },
  {
    titulo: 'Painel Indicadores',
    rotulo: 'Ocorrências Indicadores',
    icone: 'view-dashboard',
    categoria: 'azul',
    tela: 'IndicadoresPeriodo',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Mapa do Veículo',
    rotulo: 'Diário de Bordo',
    icone: 'map-marker',
    categoria: 'turquesa',
    tela: 'DiarioDeBordo',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_CONDUTOR'],
  },
  {
    titulo: 'Checklist Condutor',
    rotulo: 'Checklist do Veículo',
    icone: 'car',
    categoria: 'laranja',
    tela: 'ChecklistVeiculo',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_CONDUTOR', 'ROLE_VISUALIZADOR'],
  },
  {
    titulo: 'Checklist Medicamentos',
    rotulo: 'Checklist',
    icone: 'stethoscope',
    categoria: 'verde',
    tela: 'ChecklistFarmacia',
    papeis: [
      'ROLE_ADMIN',
      'ROLE_SUPERADMIN',
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_TECNICO',
      'ROLE_VISUALIZADOR',
    ],
  },
  {
    titulo: 'Reposição Med.',
    rotulo: 'Reposição',
    icone: 'pill',
    categoria: 'verde',
    tela: 'Reposicao',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_ENFERMEIRO', 'ROLE_MEDICO', 'ROLE_TECNICO'],
  },
  {
    titulo: 'Liberação Farmácia',
    rotulo: 'Liberação',
    icone: 'store',
    categoria: 'verde',
    tela: 'LiberacaoFarmacia',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_ENFERMEIRO', 'ROLE_MEDICO'],
  },
  {
    titulo: 'Deslocamentos',
    rotulo: 'Viagens por Placa',
    icone: 'routes',
    categoria: 'turquesa',
    tela: 'ViagensPorPlaca',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Abastecimentos',
    rotulo: 'Abastecimentos por Placa',
    icone: 'gas-station',
    categoria: 'laranja',
    tela: 'AbastecimentosPorPlaca',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Painel Abastecimento',
    rotulo: 'Painel Abastecimentos',
    icone: 'gauge',
    categoria: 'laranja',
    tela: 'PainelAbastecimentos',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Checklist Pend.',
    rotulo: 'Pendências',
    icone: 'clipboard-alert',
    categoria: 'ambar',
    tela: 'PendenciasChecklist',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Checklists Concluídos',
    rotulo: 'Concluídos',
    icone: 'clipboard-check',
    categoria: 'verde',
    tela: 'ChecklistsConcluidos',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Equipe do Dia',
    rotulo: 'Equipe do Dia',
    icone: 'account-group',
    categoria: 'roxo',
    tela: 'EquipeDoDia',
    papeis: [
      'ROLE_ADMIN',
      'ROLE_SUPERADMIN',
      'ROLE_ASSISTENTE',
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_VISUALIZADOR',
    ],
  },
  {
    titulo: 'Escala Mensal',
    rotulo: 'Escala Mensal',
    icone: 'calendar-month',
    categoria: 'turquesa',
    tela: 'EscalaMensal',
    papeis: [
      'ROLE_ADMIN',
      'ROLE_SUPERADMIN',
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_TECNICO',
      'ROLE_CONDUTOR',
      'ROLE_ASSISTENTE',
      'ROLE_VISUALIZADOR',
    ],
  },
  {
    titulo: 'Troca de Plantão',
    rotulo: 'Troca de Plantão',
    icone: 'swap-horizontal',
    categoria: 'azul',
    tela: 'TrocaPlantao',
    papeis: [
      'ROLE_ADMIN',
      'ROLE_SUPERADMIN',
      'ROLE_ENFERMEIRO',
      'ROLE_MEDICO',
      'ROLE_TECNICO',
      'ROLE_CONDUTOR',
      'ROLE_ASSISTENTE',
    ],
  },
  {
    titulo: 'Painel Frota',
    rotulo: 'Painel Frota',
    icone: 'truck',
    categoria: 'azul',
    tela: 'PainelFrota',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN', 'ROLE_VISUALIZADOR'],
  },
  {
    titulo: 'Med. Liberados',
    rotulo: 'Liberados',
    icone: 'package-variant-closed',
    categoria: 'verde',
    tela: 'LiberadosFarmacia',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Relatório Farmácia',
    rotulo: 'Relatório',
    icone: 'file-chart',
    categoria: 'roxo',
    tela: 'RelatorioFarmacia',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Backup dos Dados',
    rotulo: 'Exportar Dados',
    icone: 'database',
    categoria: 'azul',
    tela: 'Backup',
    papeis: ['ROLE_ADMIN', 'ROLE_SUPERADMIN'],
  },
  {
    titulo: 'Treinamento',
    rotulo: 'Treinamento',
    icone: 'school',
    categoria: 'ambar',
    tela: 'Treinamento',
    papeis: [],
  },
];

export function servicosDoUsuario(papeis: string[]): ServicoDoInicio[] {
  return SERVICOS_DO_INICIO.filter(
    (servico) =>
      servico.papeis.length === 0 || servico.papeis.some((papel) => papeis.includes(papel)),
  );
}
