import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("pessoaDB.db");

export async function criarTabela() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS playlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      uri TEXT NOT NULL
    );
  `);
}

export async function carregarDados() {
  await criarTabela();
  return await db.getAllAsync("SELECT * FROM playlist;");
}

export async function inserir(nome, uri) {
  if (!nome || !uri) {
    throw new Error("Nome e URI são obrigatórios para inserção.");
  }
  await criarTabela();
  return await db.runAsync(
    "INSERT INTO playlist (nome, uri) VALUES (?, ?);",
    [nome, uri]
  );
}

export async function remover(id) {
  if (!id) {
    throw new Error("É necessário fornecer um ID válido para remoção.");
  }
  await criarTabela();
  return await db.runAsync("DELETE FROM playlist WHERE id = ?;", [id]);
}

export async function limparBanco() {
  return await db.runAsync("DROP TABLE IF EXISTS playlist;");
}
