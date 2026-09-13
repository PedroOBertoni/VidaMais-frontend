import * as SQLite from "expo-sqlite";
import { Medicamento, MedicamentoInput } from "../types/medicamento";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("vida_mais.db");
  return dbPromise;
}

export async function initDatabase() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS medicamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      laboratorio TEXT,
      validade TEXT NOT NULL,
      indicacao TEXT,
      contraindicacoes TEXT,
      posologia TEXT,
      efeitos_adversos TEXT,
      precaucoes TEXT,
      observacoes TEXT,
      sincronizado INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
  `);
}

export async function listarMedicamentos(): Promise<Medicamento[]> {
  const db = await getDb();
  return db.getAllAsync<Medicamento>(
    "SELECT * FROM medicamentos ORDER BY validade ASC"
  );
}

export async function buscarMedicamento(id: number) {
  const db = await getDb();
  return db.getFirstAsync<Medicamento>(
    "SELECT * FROM medicamentos WHERE id = ?",
    id
  );
}

export async function inserirMedicamento(data: MedicamentoInput) {
  const db = await getDb();
  const agora = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO medicamentos
    (nome, laboratorio, validade, indicacao, contraindicacoes, posologia, efeitos_adversos, precaucoes, observacoes, sincronizado, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    data.nome, data.laboratorio, data.validade, data.indicacao,
    data.contraindicacoes, data.posologia, data.efeitos_adversos,
    data.precaucoes, data.observacoes, agora, agora
  );
  return Number(result.lastInsertRowId);
}

export async function atualizarMedicamento(id: number, data: MedicamentoInput) {
  const db = await getDb();
  await db.runAsync(
    `UPDATE medicamentos SET nome=?, laboratorio=?, validade=?, indicacao=?,
    contraindicacoes=?, posologia=?, efeitos_adversos=?, precaucoes=?,
    observacoes=?, sincronizado=0, updated_at=? WHERE id=?`,
    data.nome, data.laboratorio, data.validade, data.indicacao,
    data.contraindicacoes, data.posologia, data.efeitos_adversos,
    data.precaucoes, data.observacoes, new Date().toISOString(), id
  );
}

export async function excluirMedicamento(id: number) {
  const db = await getDb();
  await db.runAsync("DELETE FROM medicamentos WHERE id = ?", id);
}

export async function marcarSincronizado(id: number) {
  const db = await getDb();
  await db.runAsync("UPDATE medicamentos SET sincronizado=1 WHERE id=?", id);
}

export async function listarNaoSincronizados() {
  const db = await getDb();
  return db.getAllAsync<Medicamento>(
    "SELECT * FROM medicamentos WHERE sincronizado=0"
  );
}
