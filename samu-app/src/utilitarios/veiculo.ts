export function identificacaoDaViatura(
  descricao?: string | null,
  alternativa?: string | null,
): string {
  return descricao?.trim() || alternativa?.trim() || '';
}

export function identificacaoVeiculo(checklist: {
  descricaoVeiculo?: string | null;
  tipoVeiculo?: string | null;
}): string {
  return identificacaoDaViatura(checklist.descricaoVeiculo, checklist.tipoVeiculo);
}
