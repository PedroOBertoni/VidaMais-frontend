import { supabase } from "./supabase";
import { listarNaoSincronizados, marcarSincronizado } from "../database/database";

export async function sincronizar() {
  if (!supabase) return { ok: false, message: "Supabase não configurado." };

  const pendentes = await listarNaoSincronizados();

  for (const item of pendentes) {
    const { error } = await supabase.from("medicamentos").upsert({
      nome: item.nome,
      laboratorio: item.laboratorio,
      validade: item.validade,
      indicacao: item.indicacao,
      contraindicacoes: item.contraindicacoes,
      posologia: item.posologia,
      efeitos_adversos: item.efeitos_adversos,
      precaucoes: item.precaucoes,
      observacoes: item.observacoes,
      updated_at: item.updated_at ?? new Date().toISOString(),
    });
    if (error) return { ok: false, message: error.message };
    await marcarSincronizado(item.id);
  }

  return { ok: true, message: `${pendentes.length} registro(s) sincronizado(s).` };
}
