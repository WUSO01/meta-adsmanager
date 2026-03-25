import { DateRange, EditItem, RowData } from "@/shares/types";
import { NestedData } from "@/store/useAppStore";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

export function deepMerge(target: any, source: any) {
  const result = { ...target };

  for (const key in source) {
    if (
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

/** 需要在多日范围内累加（而非覆盖）的数值字段 */
const ADDITIVE_FIELDS: Array<keyof RowData> = ['impressions', 'amount_spent'];

/**
 * 将 src 中的一条 RowData 累加合并到 target 上。
 * - ADDITIVE_FIELDS 中的字段：数值累加
 * - results.value：累加
 * - cost_per_result：保留最新值（无意义累加）
 * - 其余字段：用 src 覆盖（取最新值）
 */
function accumulateRow(target: RowData, src: RowData): RowData {
  const merged: any = { ...target };

  for (const key of ADDITIVE_FIELDS) {
    const tVal = typeof (target as any)[key] === 'number' ? (target as any)[key] : 0;
    const sVal = typeof (src as any)[key] === 'number' ? (src as any)[key] : 0;
    merged[key] = tVal + sVal;
  }

  // results.value 累加
  if (src.results != null) {
    merged.results = {
      ...src.results,
      value: ((target as any).results?.value ?? 0) + (src.results.value ?? 0),
    };
  }

  // cost_per_result 不做累加，保留最新值
  if (src.cost_per_result != null) {
    merged.cost_per_result = src.cost_per_result;
  }

  return merged as RowData;
}

/**
 * 判断指定时间范围在 data 中是否有对应的抓取数据
 */
export function hasDataForRange(data: NestedData, range?: DateRange): boolean {
  if (!range) {
    return Object.keys(data['all'] || {}).length > 0
  } else if (range.start === range.end) {
    return Object.keys(data[range.start] || {}).length > 0
  } else {
    return Object.keys(data).some(k => {
      if (k === 'all') return false
      return dayjs(k).isBetween(range.start, range.end, 'day', '[]') &&
        Object.keys(data[k] || {}).length > 0
    })
  }
}

/**
 * 检测多日范围内哪些日期缺少抓取数据
 * 返回缺失的日期字符串数组（YYYY-MM-DD），无 range 或单日时返回空数组
 */
export function getMissingDates(data: NestedData, range?: DateRange): string[] {
  if (!range || range.start === range.end) return []

  const missing: string[] = []
  let cursor = dayjs(range.start)
  const end = dayjs(range.end)

  while (!cursor.isAfter(end)) {
    const dateStr = cursor.format('YYYY-MM-DD')
    const hasData = Object.keys(data[dateStr] || {}).length > 0
    if (!hasData) {
      missing.push(dateStr)
    }
    cursor = cursor.add(1, 'day')
  }

  return missing
}

/**
 * 合并编辑数据与抓取数据，按日期范围返回最终的扁平化数据。
 *
 * 逻辑规则：
 * - 无 range：取 'all' 抓取数据，再用 edits['all'] 覆盖
 * - 单日：以该日抓取数据为基础，用该日 edits 覆盖
 * - 多日范围：逐天遍历，每天优先取 edits[date]（以当天抓取数据为基础合并 edit 字段），
 *   没有 edit 则直接取抓取数据，两者都没有则跳过（视为 0）。
 *   每天的数值字段（impressions / amount_spent / results.value）累加到最终结果。
 */
export function mergeEdits(data: NestedData, edits: EditItem, range?: DateRange) {
  // ── 无 range：取 all 数据，再应用 all edits ──
  if (!range) {
    const result: Record<string, RowData> = {}
    Object.assign(result, data['all'] || {})
    const allEdits = edits['all'] || {}
    for (const adId in allEdits) {
      if (!result[adId]) result[adId] = {} as RowData
      result[adId] = { ...result[adId], ...allEdits[adId] }
    }
    return result
  }

  // ── 单日：以抓取数据为基础，用 edits 覆盖 ──
  if (range.start === range.end) {
    const result: Record<string, RowData> = {}
    Object.assign(result, data[range.start] || {})
    const dayEdits = edits[range.start] || {}
    for (const adId in dayEdits) {
      if (!result[adId]) result[adId] = {} as RowData
      result[adId] = { ...result[adId], ...dayEdits[adId] }
    }
    return result
  }

  // ── 多日范围：逐天遍历，每天 edits 优先，累加数值字段 ──
  const result: Record<string, RowData> = {}

  let cursor = dayjs(range.start)
  const end = dayjs(range.end)

  while (!cursor.isAfter(end)) {
    const dateStr = cursor.format('YYYY-MM-DD')

    const scraped: Record<string, RowData> = data[dateStr] || {}
    const dayEdits = edits[dateStr] || {}

    // 该天所有涉及的 adId（抓取 + edit 的并集）
    const allIds = new Set([...Object.keys(scraped), ...Object.keys(dayEdits)])

    if (allIds.size === 0) {
      // 该天无任何数据，跳过
      cursor = cursor.add(1, 'day')
      continue
    }

    for (const adId of allIds) {
      // 以抓取数据为基础，再用 edit 字段覆盖，得到该天该 ad 的最终数据
      const baseRow = scraped[adId] || {} as RowData
      const editRow = dayEdits[adId] || {}
      const dayRow = { ...baseRow, ...editRow } as RowData

      if (!result[adId]) {
        // 首次出现：直接记录
        result[adId] = { ...dayRow }
      } else {
        // 已存在：累加数值字段，其余取最新值
        result[adId] = accumulateRow(result[adId], dayRow)
      }
    }

    cursor = cursor.add(1, 'day')
  }

  return result
}
