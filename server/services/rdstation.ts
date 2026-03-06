/**
 * Serviço de Integração com RD Station CRM
 * Documentação: https://developers.rdstation.com/pt-BR/reference/crm
 */

export const RDCrmService = {
  /**
   * Retorna os headers de autenticação padrão para o RD Station CRM
   */
  getHeaders() {
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
    if (!token) throw new Error("RD_STATION_CRM_TOKEN não configurado no .env");

    try {
      const response = await fetch(`https://crm.rdstation.com/api/v1/deals?token=${token}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro RD CRM (Deals): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar deals no RD CRM:", error);
      throw error;
    }
  },

  /**
   * Busca clientes/contatos (Contacts) no CRM
   */
  async getContacts(limit = 20) {
    const token = process.env.RD_STATION_CRM_TOKEN;
    if (!token) throw new Error("RD_STATION_CRM_TOKEN não configurado no .env");

    try {
      const response = await fetch(`https://crm.rdstation.com/api/v1/contacts?token=${token}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro RD CRM (Contacts): ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar contatos no RD CRM:", error);
      throw error;
    }
  }
};
