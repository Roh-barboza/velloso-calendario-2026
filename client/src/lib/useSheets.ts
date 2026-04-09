/**
 * Hooks para leitura das planilhas do Google Sheets via tRPC
 */
import { trpc } from "@/lib/trpc";

/**
 * Lê a planilha de Processos
 */
export function useProcessos() {
  const query = trpc.sheets.getProcessos.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    retry: 2,
  });

  return {
    processos: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.data?.message,
    refetch: query.refetch,
  };
}

/**
 * Lê a planilha de Calendário e converte para o formato usado pelo app
 */
export function useCalendarioSheets() {
  const query = trpc.sheets.getCalendario.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutos de cache
    retry: 2,
  });

  return {
    rows: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.data?.message,
    refetch: query.refetch,
  };
}

/**
 * Lê a planilha de Vendas do Mês
 */
export function useVendas() {
  const query = trpc.sheets.getVendas.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    retry: 2,
  });

  return {
    vendas: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.data?.message,
    refetch: query.refetch,
  };
}
