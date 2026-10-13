const DESLOCAMENTO_BRASILIA_MS = -3 * 60 * 60 * 1000;

const doisDigitos = (valor: number) => String(valor).padStart(2, '0');

export function momentoAtualBrasilia(): string {
  const agora = new Date(Date.now() + DESLOCAMENTO_BRASILIA_MS);
  const dia = doisDigitos(agora.getUTCDate());
  const mes = doisDigitos(agora.getUTCMonth() + 1);
  const ano = agora.getUTCFullYear();
  const hora = doisDigitos(agora.getUTCHours());
  const minuto = doisDigitos(agora.getUTCMinutes());
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

export function formatarDataSegura(texto?: string | null): string {
  if (!texto) return 'Data não informada';

  let data: Date;
  if (texto.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(texto)) {
    data = new Date(texto);
  } else if (texto.includes('/')) {
    const [parteData, parteHora] = texto.split(' ');
    const [dia, mes, ano] = parteData.split('/');
    data = new Date(`${ano}-${mes}-${dia}T${parteHora || '00:00:00'}`);
  } else {
    data = new Date(texto);
  }

  if (isNaN(data.getTime())) return texto;

  const dia = doisDigitos(data.getDate());
  const mes = doisDigitos(data.getMonth() + 1);
  const hora = doisDigitos(data.getHours());
  const minuto = doisDigitos(data.getMinutes());
  return `${dia}/${mes}/${data.getFullYear()} ${hora}:${minuto}`;
}
