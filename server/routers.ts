import { router, publicProcedure } from "./_core/trpc";
import { RDCrmService } from "./services/rdstation";

export const appRouter = router({
  // Rotas de autenticação
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("session");
      return { success: true } as const;
    }),
  }),

  // Rotas de CRM
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
});

export type AppRouter = typeof appRouter;
