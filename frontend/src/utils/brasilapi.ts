// Lightweight helpers for BrasilAPI (free)
// Banks: https://brasilapi.com.br/api/banks/v1
// CNPJ:  https://brasilapi.com.br/api/cnpj/v1/{cnpj}

export interface Bank {
  ispb: string;
  name: string;
  code: number | null;
  fullName: string;
}

let banksCache: Bank[] | null = null;
let banksMapByCode: Record<string, Bank> | null = null;

export async function fetchBanks(): Promise<Bank[]> {
  if (banksCache) return banksCache;
  const res = await fetch('https://brasilapi.com.br/api/banks/v1');
  if (!res.ok) return [];
  const data: Bank[] = await res.json();
  banksCache = data;
  banksMapByCode = Object.fromEntries(
    data.filter(b => b.code !== null).map(b => [String(b.code), b])
  );
  return data;
}

export async function getBankByCode(code: string | number): Promise<Bank | null> {
  const key = String(code).replace(/\D/g, '');
  if (!key) return null;
  if (!banksMapByCode) await fetchBanks();
  return (banksMapByCode as Record<string, Bank>)[key] || null;
}

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  descricao_situacao_cadastral?: string;
  data_inicio_atividade?: string;
  natureza_juridica?: string;
  porte?: string;
  situacao_cadastral?: number;
}

export async function fetchCNPJ(cnpj: string): Promise<CNPJData | null> {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return null;
  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data || null;
}
