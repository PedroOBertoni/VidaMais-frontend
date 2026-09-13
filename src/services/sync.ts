import { garantirUsuarioAutenticado, supabase } from "./supabase";
import {
  listarExclusoesPendentes,
  listarNaoSincronizados,
  marcarSincronizado,
  removerExclusaoPendente,
  salvarMedicamentoRemoto,
} from "../database/database";

export async function sincronizar() {
  if (!supabase) return { ok: false, message: "Supabase não configurado." };

  try {
    const usuario = await garantirUsuarioAutenticado();
    if (!usuario) return { ok: false, message: "Não foi possível autenticar no Supabase." };

    const exclusoes = await listarExclusoesPendentes();
    for (const item of exclusoes) {
      const { error } = await supabase.from("medicamentos").delete().eq("sync_id", item.sync_id);
      if (error) return { ok: false, message: error.message };
      await removerExclusaoPendente(item.sync_id);
    }

    const pendentes = await listarNaoSincronizados();

    for (const item of pendentes) {
      const { error } = await supabase.from("medicamentos").upsert({
        sync_id: item.sync_id,
        user_id: usuario.id,
        nome: item.nome,
        laboratorio: item.laboratorio,
        validade: item.validade,
        indicacao: item.indicacao,
        contraindicacoes: item.contraindicacoes,
        posologia: item.posologia,
        efeitos_adversos: item.efeitos_adversos,
        precaucoes: item.precaucoes,
        observacoes: item.observacoes,
        created_at: item.created_at,
        updated_at: item.updated_at ?? new Date().toISOString(),
      }, { onConflict: "sync_id" });
      if (error) return { ok: false, message: error.message };
      await marcarSincronizado(item.id);
    }

    const { data: remotos, error } = await supabase
      .from("medicamentos")
      .select("sync_id,nome,laboratorio,validade,indicacao,contraindicacoes,posologia,efeitos_adversos,precaucoes,observacoes,created_at,updated_at");
    if (error) return { ok: false, message: error.message };
    for (const item of remotos ?? []) await salvarMedicamentoRemoto({ ...item, sincronizado: 1 });

    return { ok: true, message: `${pendentes.length} registro(s) enviado(s) e ${remotos?.length ?? 0} recebido(s).` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Falha inesperada na sincronização." };
  }
}
