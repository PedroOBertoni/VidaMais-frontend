export type Medicamento = {
  id: number;
  sync_id: string;
  nome: string;
  laboratorio: string;
  validade: string;
  indicacao: string;
  contraindicacoes: string;
  posologia: string;
  efeitos_adversos: string;
  precaucoes: string;
  observacoes: string;
  sincronizado?: number;
  created_at?: string;
  updated_at?: string;
};

export type MedicamentoInput = Omit<Medicamento, "id" | "sync_id" | "sincronizado" | "created_at" | "updated_at">;

export type StatusValidade = "vencido" | "proximo" | "valido";

export function getStatusValidade(validade: string): StatusValidade {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(`${validade}T00:00:00`);
  const diff = Math.ceil((data.getTime() - hoje.getTime()) / 86400000);

  if (diff < 0) return "vencido";
  if (diff <= 30) return "proximo";
  return "valido";
}

export function diasRestantes(validade: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(`${validade}T00:00:00`);
  return Math.ceil((data.getTime() - hoje.getTime()) / 86400000);
}

export function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function converterDataParaISO(data: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!match) return null;

  const [, dia, mes, ano] = match;
  const dataValidada = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (
    dataValidada.getFullYear() !== Number(ano) ||
    dataValidada.getMonth() !== Number(mes) - 1 ||
    dataValidada.getDate() !== Number(dia)
  ) return null;

  return `${ano}-${mes}-${dia}`;
}
