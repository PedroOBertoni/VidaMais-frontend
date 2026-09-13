import { useCallback, useEffect, useState } from "react";
import { initDatabase, listarMedicamentos } from "../database/database";
import { Medicamento } from "../types/medicamento";

export function useMedicamentos() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    await initDatabase();
    setMedicamentos(await listarMedicamentos());
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  return { medicamentos, loading, recarregar: carregar };
}
