/**
 * Serviço de Integração com RD Station
 * Esta camada rodará no backend para conversar com a API do RD Station de forma segura.
 */

export const RDStationService = {
  /**
   * Envia um novo lead ou atualiza um existente no RD Station
   */
  async createOrUpdateLead(email: string, name: string, tags: string[] = []) {
    const publicToken = process.env.VITE_RD_STATION_PUBLIC_TOKEN;
    
    if (!publicToken) {
      console.warn("⚠️ Token do RD Station não configurado no arquivo .env");
      return null;
    }

    try {
      const response = await fetch(`https://events.rdstation.com.br/api/v1.2/conversions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token_rdstation: publicToken,
          identificador: 'intranet-velloso',
          email: email,
          name: name,
          tags: tags.join(','),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro RD Station: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao integrar com RD Station:", error);
      throw error;
    }
  }
};
