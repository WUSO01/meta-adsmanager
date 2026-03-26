import { Level, RowData } from "@/shares/types";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export const parseCurrency = (value?: string): number => {
  if (typeof value !== 'string') return 0;
  const normalized = value?.trim().replace(/\$/g, '').replace(/,/g, '');
  const n = Number(normalized);
  return Number.isNaN(n) ? 0 : n;
};


export const formatCurrency = (value?: number | string, dollar = true): string => {
  if (typeof value === 'string' || !value) return '—'
  if (value === 0 || !isFinite(value)) return '—'
  let result = Number(value || 0).toLocaleString('en-US', {
    style: dollar ? 'currency' : undefined,
    currency: dollar ? 'USD' : undefined
  });

  return result
};

export const processNumber = (num: number) => {
  return parseFloat(num.toFixed(2));
}

/**
 * 通过level筛选对应的数据 
 * @returns 
 */
export const getLevelDataFromRows = (row: Record<string, RowData>, level: Level) => {
  return Object.values(row)
    .filter(item => item.level === level)
    .sort((a, b) => {
      const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
      const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
      return aOrder - bOrder
    })
}

/**
 * 移除字符串中逗号及其后面的所有内容
 * @param str - 输入字符串，格式如 "YYYY-MM-DD_YYYY-MM-DD,xxxx"
 * @returns 移除逗号后部分的字符串，如 "YYYY-MM-DD_YYYY-MM-DD"
 */
export const removeAfterComma = (str: string): string => {
  return str.split(',')[0];
}
