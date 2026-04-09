/**
 * Rotas do servidor Express
 * Google Sheets: leitura das planilhas de Processos, Calendário e Vendas
 */
import { Router } from "express";
import { GoogleSheetsService } from "./services/googleSheets";

export const sheetsRouter = Router();

// GET /api/sheets/processos
sheetsRouter.get("/processos", async (_req, res) => {
  try {
    const data = await GoogleSheetsService.getProcessos();
    res.json({ success: true, data, message: "Processos carregados com sucesso" });
  } catch (error) {
    console.error("Erro ao ler planilha de Processos:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Erro ao ler planilha de Processos",
    });
  }
});

// GET /api/sheets/calendario
sheetsRouter.get("/calendario", async (_req, res) => {
  try {
    const data = await GoogleSheetsService.getCalendario();
    res.json({ success: true, data, message: "Calendário carregado com sucesso" });
  } catch (error) {
    console.error("Erro ao ler planilha de Calendário:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Erro ao ler planilha de Calendário",
    });
  }
});

// GET /api/sheets/vendas
sheetsRouter.get("/vendas", async (_req, res) => {
  try {
    const data = await GoogleSheetsService.getVendas();
    res.json({ success: true, data, message: "Vendas carregadas com sucesso" });
  } catch (error) {
    console.error("Erro ao ler planilha de Vendas:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Erro ao ler planilha de Vendas",
    });
  }
});
