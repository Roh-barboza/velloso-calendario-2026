/**
 * Serviço de Integração com RD Station CRM
 * Documentação: https://developers.rdstation.com/pt-BR/reference/crm
 */

export const RDCrmService = {
  /**
   * Retorna os headers de autenticação padrão para o RD Station CRM
   */
  getHeaders() {
    const token = process.env.RD_STATION_CRM_TOKEN;
    if (!token) {
      console.warn("⚠️ Token do RD Station CRM não configurado no arquivo .env");
    }
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  },

  /**
   * Busca oportunidades/negócios (Deals) no CRM
   */
  async getDeals(limit = 20) {
    const token = process.env.RD_STATION_CRM_TOKEN;
    if (!token) return null;

    try {
      // A API do RD CRM geralmente passa o token na URL como query param: ?token=SEU_TOKEN
      const response = await fetch(`https://crm.rdstation.com/api/v1/deals?token=${token}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro RD CRM: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar deals no RD CRM:", error);
      throw error;
    }
  },

  /**
   * Cria uma nova oportunidade (Deal) no CRM
   */
  async createDeal(dealData: { name: string; contact_name: string; contact_email?: string }) {
    const token = process.env.RD_STATION_CRM_TOKEN;
    if (!token) return null;

    try {
      const response = await fetch(`https://crm.rdstation.com/api/v1/deals?token=${token}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          deal: {
            name: dealData.name,
            contacts: [
              {
                name: dealData.contact_name,
                emails: dealData.contact_email ? [{ email: dealData.contact_email }] : []
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar Deal RD CRM: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar deal no RD CRM:", error);
      throw error;
    }
  }
};
