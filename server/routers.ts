import { router, publicProcedure } from "./_core/trpc";
import { RDCrmService } from "./services/rdstation";
import { GoogleSheetsService } from "./services/googleSheets";

export const appRouter = router({
  // Rotas de autenticação
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("session");
      return { success: true } as const;
    }),
  }),

  // Rotas de CRM (RD Station)
  crm: router({
    /**
     * Busca contatos do RD Station CRM
     */
    getContacts: publicProcedure.query(async () => {
      try {
        const data = await RDCrmService.getContacts(100);
        return {
          success: true,
          data: data,
          message: "Contatos carregados com sucesso"
        };
      } catch (error) {
        console.error("Erro ao buscar contatos do CRM:", error);
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Erro ao buscar contatos"
        };
      }
    }),

    /**
     * Busca deals/oportunidades do RD Station CRM
     */
    getDeals: publicProcedure.query(async () => {
      try {
        const data = await RDCrmService.getDeals(100);
        return {
          success: true,
          data: data,
          message: "Deals carregados com sucesso"
        };
      } catch (error) {
        console.error("Erro ao buscar deals do CRM:", error);
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Erro ao buscar deals"
        };
      }
    }),
  }),

  // Rotas do Google Sheets
  sheets: router({
    /**
     * Lê a planilha de Processos
     */
    getProcessos: publicProcedure.query(async () => {
      try {
        const data = await GoogleSheetsService.getProcessos();
        return {
          success: true,
          data,
          message: "Processos carregados com sucesso",
        };
      } catch (error) {
        console.error("Erro ao ler planilha de Processos:", error);
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Erro ao ler planilha de Processos",
        };
      }
    }),

    /**
     * Lê a planilha de Calendário (aniversários e eventos)
     */
    getCalendario: publicProcedure.query(async () => {
      try {
        const data = await GoogleSheetsService.getCalendario();
        return {
          success: true,
          data,
          message: "Calendário carregado com sucesso",
        };
      } catch (error) {
        console.error("Erro ao ler planilha de Calendário:", error);
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Erro ao ler planilha de Calendário",
        };
      }
    }),

    /**
     * Lê a planilha de Vendas do Mês
     */
    getVendas: publicProcedure.query(async () => {
      try {
        const data = await GoogleSheetsService.getVendas();
        return {
          success: true,
          data,
          message: "Vendas carregadas com sucesso",
        };
      } catch (error) {
        console.error("Erro ao ler planilha de Vendas:", error);
        return {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : "Erro ao ler planilha de Vendas",
        };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
