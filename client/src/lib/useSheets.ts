/**
 * Hooks para leitura das planilhas do Google Sheets via API REST
 */
import { useState, useEffect } from "react";

export interface SheetRow {
  [key: string]: string;
}

interface SheetResponse {
  success: boolean;
  data: SheetRow[];
  message: string;
}

function useSheetQuery(endpoint: string) {
  const [data, setData] = useState<SheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [refetchCount, setRefetchCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);

    fetch(`/api/sheets/${endpoint}`)
      .then((res) => res.json() as Promise<SheetResponse>)
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setData(json.data);
        } else {
          setIsError(true);
          setError(json.message);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setIsError(true);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, refetchCount]);

  const refetch = () => setRefetchCount((c) => c + 1);

  return { data, isLoading, isError, error, refetch };
}

/**
 * Lê a planilha de Processos
 */
export function useProcessos() {
  const query = useSheetQuery("processos");
  return {
    processos: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Lê a planilha de Calendário
 */
export function useCalendarioSheets() {
  const query = useSheetQuery("calendario");
  return {
    rows: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Lê a planilha de Vendas do Mês
 */
export function useVendas() {
  const query = useSheetQuery("vendas");
  return {
    vendas: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
