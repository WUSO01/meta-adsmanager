import { EDIT_KEY, SCRAPE_STATS_KEY, SCRAPE_STOREAGE_KEY } from "@/shares/constants";
import type { DateRange, EditItem, Level, Message, PageStats, RowData } from "@/shares/types";
import type { NestedData } from "@/store/useAppStore";
import Extract from "@/utils/extract/extract";
import { hasDataForRange, mergeEdits } from "@/utils/merge";
import dayjs from "dayjs";
import { formatCurrency, parseCurrency, processNumber, removeAfterComma, sleep } from "../utils";

let latestEditsCache: EditItem = {}
let observer: MutationObserver | null = null
let rafId: number | null = null


/**
 * 从页面底部 footerRow 中读取当前页面展示的统计数据
 */
function extractPageStats(): PageStats {
  const footer = document.querySelector('[data-pagelet="FixedDataTableNew_footerRow"]');

  const readCell = (surfaceSuffix: string): string => {
    const cell = footer?.querySelector(`span[data-surface$="${surfaceSuffix}"]`);
    const el = cell?.querySelector('[geotextcolor="value"], span[data-interactable] ,._3dfi') as HTMLElement | null;
    return el?.textContent?.trim() ?? '';
  };

  const amountSpentText = readCell('table_cell:spend');
  const impressionsText = readCell('table_cell:impressions');
  const resultsText = readCell('table_cell:forAttributionWindow(results,default)');
  const completeRegText = readCell('table_cell:forAttributionWindow(actions:omni_complete_registration,default)');
  const clicksText = readCell('table_cell:clicks');

  return {
    totalAmountSpent: parseCurrency(amountSpentText),
    totalImpressions: parseCurrency(impressionsText),
    totalResults: parseCurrency(resultsText),
    totalCompleteRegistration: parseCurrency(completeRegText),
    totalClicks: parseCurrency(clicksText),
    count: 0,
  };
}

function resolveBasePageStats(storedStats: PageStats | undefined, hasScrapedDataForCurrentRange: boolean) {
  const livePageStats = extractPageStats()

  // 当前范围没有抓取数据：直接使用页面原始统计
  if (!hasScrapedDataForCurrentRange) {
    return livePageStats
  }

  // 当前范围已抓取：必须以抓取时快照为基准（即使是 0），
  // 避免在 observer 多次触发时基于已 patch 结果重复叠加。
  if (storedStats) {
    return storedStats
  }

  // 当前范围已抓取但没有对应统计快照时，不回写 footer，避免重复累加
  return null
}


/**
 * 根据当前时间范围、账户、层级，生成统计快照 storage key
 */
function getStoredStatsKey(range: DateRange | undefined, act?: string, level?: Level) {
  const timeKey = !range ? 'all' : range.start === range.end ? range.start : 'all'
  return `${timeKey}__${act || ''}__${level || ''}`
}

function getCurrentActFromUrl() {
  const url = new URL(window.location.href)
  return url.searchParams.get('act') || ''
}

function getCurrentLevelFromUrl(): Level | undefined {
  const pathname = new URL(window.location.href).pathname
  if (pathname.endsWith('/campaigns')) return 'campaigns'
  if (pathname.endsWith('/adsets')) return 'adsets'
  if (pathname.endsWith('/ads')) return 'ads'
  return undefined
}

/**
 * 对一组 RowData 做聚合统计，单次 O(n) 遍历
 */
function calcStats(rows: RowData[]): PageStats {
  let totalAmountSpent = 0;
  let totalImpressions = 0;
  let totalResults = 0;
  let totalCompleteRegistration = 0;
  let totalClicks = 0;

  for (const row of rows) {
    if (typeof row.amount_spent === 'number') {
      totalAmountSpent += row.amount_spent;
    } else if (typeof row.amount_spent === 'string') {
      totalAmountSpent += parseCurrency(row.amount_spent);
    }

    if (typeof row.impressions === 'number') {
      totalImpressions += row.impressions;
    }

    if (row.results && typeof row.results.value === 'number') {
      totalResults += row.results.value;
    }

    if (typeof row.complete_registration === 'number') {
      totalCompleteRegistration += row.complete_registration;
    }

    if (typeof row.click === 'number') {
      totalClicks += row.click;
    }
  }

  return {
    totalAmountSpent: processNumber(totalAmountSpent),
    totalImpressions,
    totalResults: processNumber(totalResults),
    totalCompleteRegistration,
    totalClicks,
    count: rows.length,
  };
}

/**
 * 将统计数据回写到页面底部 footerRow
 * 
 * 流程：
 * 1. 读取页面 footer 上的原始统计值（页面完整数据）
 * 2. 计算已抓取行的统计（scraped stats）
 * 3. 计算编辑后行的统计（edited stats）
 * 4. diff = edited - scraped（仅抓取到的部分的变化量）
 * 5. 最终值 = 页面原始值 + diff（将变化量叠加到完整数据上）
 */
function applyStatsToPage(basePageStats: PageStats, scrapedRows: RowData[], editedRows: RowData[]) {
  const footer = document.querySelector('[data-pagelet="FixedDataTableNew_footerRow"]');
  if (!footer) return;

  const scrapedStats = calcStats(scrapedRows);
  const editedStats = calcStats(editedRows);

  const diffAmountSpent = processNumber(editedStats.totalAmountSpent - scrapedStats.totalAmountSpent);
  const diffImpressions = editedStats.totalImpressions - scrapedStats.totalImpressions;
  const diffResults = processNumber(editedStats.totalResults - scrapedStats.totalResults);
  const diffCompleteReg = editedStats.totalCompleteRegistration - scrapedStats.totalCompleteRegistration;
  const diffClicks = editedStats.totalClicks - scrapedStats.totalClicks;

  const finalAmountSpent = processNumber(basePageStats.totalAmountSpent + diffAmountSpent);
  const finalImpressions = basePageStats.totalImpressions + diffImpressions;
  const finalResults = processNumber(basePageStats.totalResults + diffResults);
  const finalCompleteReg = basePageStats.totalCompleteRegistration + diffCompleteReg;
  const finalClicks = basePageStats.totalClicks + diffClicks;


  const patchFooterCell = (surfaceSuffix: string, text: string) => {
    const cell = footer.querySelector(`span[data-surface$="${surfaceSuffix}"]`);

    if (!cell) return;
    // 优先找带 geotextcolor 的主值元素，其次找 _3dfi（货币格式），最后找 data-interactable
    const el = (
      cell.querySelector('[geotextcolor="value"]') ??
      cell.querySelector('.x1rg5ohu') ??
      cell.querySelector('span[data-interactable]')
    ) as HTMLElement | null;
    if (el) el.textContent = text;
  };

  // 单次成效费用
  const cost_per_result = formatCurrency(finalAmountSpent / finalImpressions)
  // 单次注册费用
  const per_complete_registration = formatCurrency(finalAmountSpent / finalCompleteReg)

  patchFooterCell('table_cell:spend', formatCurrency(finalAmountSpent));
  patchFooterCell('table_cell:impressions', formatCurrency(finalImpressions, false));
  patchFooterCell('table_cell:forAttributionWindow(results,default)', formatCurrency(finalResults, false));
  patchFooterCell('table_cell:forAttributionWindow(actions:omni_complete_registration,default)', formatCurrency(finalCompleteReg, false));
  patchFooterCell('table_cell:clicks', formatCurrency(finalClicks, false));
  patchFooterCell('forAttributionWindow(cost_per_result,default)', cost_per_result)
  patchFooterCell('forAttributionWindow(cost_per_action_type:omni_complete_registration,default)', per_complete_registration)
}

/**
 * 抓取可视范围的表格数据
 * 支持边滚动变抓取
 * @param level 抓取的层级
 * @returns 
 */
async function scrapeAllVirtualRows(level: Level) {
  let noNewDataCount = 0;
  const MAX_NO_NEW_DATA = 3;
  const allAdsDataMap = new Map<string, RowData>();
  const orderedIds: string[] = [];
  const extract = new Extract()

  const extractMap: Partial<Record<Level, () => { data: RowData[], domElements: Element[] }>> = {
    campaigns: () => extract.extractCampaignData(),
    adsets: () => extract.extractAdsetData(),
    ads: () => extract.extractAds(),
  }

  while (noNewDataCount < MAX_NO_NEW_DATA) {
    let currentVisibleData: Array<RowData> = [];
    let domElements: Element[] = [];

    const extractor = extractMap[level]
    if (extractor) {
      const { data, domElements: elements } = extractor()
      currentVisibleData = data
      domElements = elements
    }

    let addedNew = false;
    const visibleDataMap = new Map<string, RowData>(currentVisibleData.map((item) => [item.id, item]));

    // 以当前可视 DOM 顺序为准写入，确保最终返回顺序与页面一致
    domElements.forEach((element) => {
      const id = getRowIdBySurface(element)
      if (!id) return

      const item = visibleDataMap.get(id)
      if (!item) return

      if (!allAdsDataMap.has(id)) {
        orderedIds.push(id)
        addedNew = true
      }

      allAdsDataMap.set(id, item)
    })

    if (addedNew) {
      noNewDataCount = 0;
    } else {
      noNewDataCount++;
    }

    if (domElements.length > 0) {
      const lastRow = domElements[domElements.length - 1];
      lastRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

    await sleep(1200);
  }

  return orderedIds
    .map((id) => allAdsDataMap.get(id))
    .filter((item): item is RowData => Boolean(item));
}

/**
 * 解析当前页面 URL 中的 date 参数，返回时间范围。
 * - 无 date 或包含 "maximum" → undefined（对应 "all"）
 * - 单日（start === end）→ { start, end }
 * - 多日范围 → { start, end }
 */
function getPageDateRange(): DateRange | undefined {
  const { searchParams } = new URL(window.location.href)
  const dateParam = searchParams.get('date')
  if (!dateParam || dateParam.includes('maximum')) return undefined

  // 去除日期后面可能附带的 ,xxx 后缀（如 2025-03-10_2025-02-01,123456）
  const normalDate = removeAfterComma(dateParam)
  const parts = normalDate.split('_')
  const [start, end] = parts

  // 超过 7 天的范围视同 all，返回 undefined
  const diff = Math.abs(dayjs(end).diff(dayjs(start), 'day'))
  if (diff > 7) {
    return undefined
  } else if (diff === 1) {
    // 如果只有一天，就用起始日期
    return {
      start,
      end: start
    }
  }

  return { start, end }
}

function toText(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value)
}

function getRowIdBySurface(element: Element | null) {
  const rowSurface = element?.getAttribute('data-surface')
  const idMatch = rowSurface?.match(/table_row:(\d+)unit/)
  return idMatch?.[1]
}

function patchByCellSuffix(element: Element, suffix: string, value: unknown) {
  const cell = element.querySelector(`span[data-surface$="${suffix}"]`)
  if (!cell) return

  const mainEl = cell.querySelector('[geotextcolor="value"]') as HTMLElement | null
  if (mainEl) {
    mainEl.textContent = toText(value)
    return
  }

  const linkEl = cell.querySelector('a') as HTMLElement | null
  if (linkEl) {
    linkEl.textContent = toText(value)
    return
  }
}

function applyPatchToRowElement(element: Element, patch: Partial<RowData>) {
  // 成效更新
  if (patch.results && typeof patch.results === 'object' && 'value' in patch.results) {
    patchByCellSuffix(element, 'table_cell:forAttributionWindow(results,default)', formatCurrency(patch.results.value, false))
  }

  // 单次成效费用更新
  if (patch.cost_per_result && typeof patch.cost_per_result === 'object' && 'value' in patch.cost_per_result) {
    patchByCellSuffix(element, 'table_cell:forAttributionWindow(cost_per_result,default)', formatCurrency(patch.cost_per_result.value))
  }

  // 已花费金额更新
  if (typeof patch.amount_spent === 'number') {
    patchByCellSuffix(element, 'table_cell:spend', formatCurrency(patch.amount_spent))
  }

  // 展示次数更新
  if (typeof patch.impressions === 'number') {
    patchByCellSuffix(element, 'table_cell:impressions', formatCurrency(patch.impressions, false))
  }

  // 完成注册次数更新
  if (typeof patch.complete_registration === 'number') {
    patchByCellSuffix(element, 'table_cell:forAttributionWindow(actions:omni_complete_registration,default)', formatCurrency(patch.complete_registration, false))
  }

  // 单次完成注册费用更新
  if (typeof patch.per_complete_registration === 'number') {
    patchByCellSuffix(element, 'table_cell:forAttributionWindow(cost_per_action_type:omni_complete_registration,default)', formatCurrency(patch.per_complete_registration))
  }

  // 点击量更新
  if (typeof patch.click === 'number') {
    patchByCellSuffix(element, 'table_cell:clicks', formatCurrency(patch.click, false))
  }

  // 预算更新
  if (patch.budget && typeof patch.budget === 'object' && 'value' in patch.budget) {
    // 只有广告系列的预算可以编辑
    patchByCellSuffix(element, 'table_cell:forObjectType(budget,CAMPAIGN_GROUP)', formatCurrency(patch.budget.value))
  }
}

function waitForRowsAndApply(retries = 20, interval = 300) {
  const extract = new Extract()
  if (extract.rowWrappers.length > 0) {
    applyTodayFromCache()
    return
  }
  if (retries <= 0) return
  setTimeout(() => waitForRowsAndApply(retries - 1, interval), interval)
}

/**
 * 打开页面的时候数据回填
 */
function syncTodayEditsOnLoad() {
  chrome.storage.local.get([EDIT_KEY], (res) => {
    const edits = (res?.[EDIT_KEY] || {}) as EditItem
    latestEditsCache = edits
    waitForRowsAndApply()
  })
}

/**
 * 实时监听插件对数据的修改，及时同步到页面中
 */
function subscribeRealtimeEditsSync() {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return

    // 若抓取数据（data）被清空，说明用户执行了「清除缓存」，
    // 此时直接刷新页面，让 Meta 重新渲染原始值
    const dataChange = changes[SCRAPE_STOREAGE_KEY]
    if (dataChange) {
      const newData = dataChange.newValue
      if (!newData || Object.keys(newData).length === 0) {
        window.location.reload()
        return
      }
    }

    const editChange = changes[EDIT_KEY]
    if (!editChange) return

    const edits = (editChange.newValue || {}) as EditItem
    latestEditsCache = edits
    applyTodayFromCache()
  })
}

/** 获取虚拟列表容器元素，找不到时回退到 document.body */
function getTableContainer(): Element {
  return document.querySelector('span[data-non-int-surface="/am/int:_/table/int:AdsPEManagementTableInnerContainer.react"]') ?? document.body
}

/**
 * 同步数据，并将统计数据回写到页面 footer
 */
async function applyTodayFromCache() {
  if (observer) observer.disconnect()

  try {
    const range = getPageDateRange()
    const rawData = await chrome.storage.local.get([SCRAPE_STOREAGE_KEY, SCRAPE_STATS_KEY])
    const allData: NestedData = rawData[SCRAPE_STOREAGE_KEY] || {}
    const allPageStats: Record<string, PageStats> = rawData[SCRAPE_STATS_KEY] || {}
    const hasScrapedDataForCurrentRange = hasDataForRange(allData, range)

    // 多日范围
    if (range && range.start !== range.end) {
      // 若该范围内没有任何抓取数据，不对页面做 patch
      const hasAnyData = Object.keys(allData).some(k => {
        if (k === 'all') return false
        return Object.keys(allData[k] || {}).length > 0
      })
      if (!hasAnyData) return

      // scraped：无 edits 合并的纯抓取数据
      const scrapedMerged = mergeEdits(allData, {}, range)
      // edited：带 edits 覆盖的最终数据
      const editedMerged = mergeEdits(allData, latestEditsCache, range)
      const dataMap = new Map<string, RowData>(Object.entries(editedMerged))

      const extract = new Extract()
      const rowWrappers = Array.from(extract.rowWrappers)
      const scrapedRows: RowData[] = []
      const editedRows: RowData[] = []

      const act = getCurrentActFromUrl() || Object.values(editedMerged)[0]?.act || ''
      const currentLevel = getCurrentLevelFromUrl() || 'campaigns'
      const storedStatsKey = getStoredStatsKey(range, act, currentLevel)
      const basePageStats = resolveBasePageStats(allPageStats[storedStatsKey], hasScrapedDataForCurrentRange)
      if (!basePageStats) return

      rowWrappers.forEach((element) => {
        const id = getRowIdBySurface(element)
        if (!id) return
        const editedRow = dataMap.get(id)
        if (!editedRow) return
        applyPatchToRowElement(element, editedRow)
        editedRows.push(editedRow)
        const scrapedRow = scrapedMerged[id]
        if (scrapedRow) scrapedRows.push(scrapedRow)
      })

      applyStatsToPage(basePageStats, scrapedRows, editedRows)

    } else if (range) {
      // 单日
      if (Object.keys(allData[range.start] || {}).length === 0) return

      const scrapedMerged = mergeEdits(allData, {}, range)
      const editedMerged = mergeEdits(allData, latestEditsCache, range)
      const dataMap = new Map<string, RowData>(Object.entries(editedMerged))

      const extract = new Extract()
      const rowWrappers = Array.from(extract.rowWrappers)
      const scrapedRows: RowData[] = []
      const editedRows: RowData[] = []

      const act = getCurrentActFromUrl() || Object.values(editedMerged)[0]?.act || ''
      const currentLevel = getCurrentLevelFromUrl() || 'campaigns'
      const storedStatsKey = getStoredStatsKey(range, act, currentLevel)
      const basePageStats = resolveBasePageStats(allPageStats[storedStatsKey], hasScrapedDataForCurrentRange)
      if (!basePageStats) return

      rowWrappers.forEach((element) => {
        const id = getRowIdBySurface(element)
        if (!id) return
        const editedRow = dataMap.get(id)
        if (!editedRow) return
        applyPatchToRowElement(element, editedRow)
        editedRows.push(editedRow)
        const scrapedRow = scrapedMerged[id]
        if (scrapedRow) scrapedRows.push(scrapedRow)
      })

      applyStatsToPage(basePageStats, scrapedRows, editedRows)

    } else {
      // all
      if (Object.keys(allData['all'] || {}).length === 0) return

      const scrapedMerged = mergeEdits(allData, {}, undefined)
      const editedMerged = mergeEdits(allData, latestEditsCache, undefined)
      const dataMap = new Map<string, RowData>(Object.entries(editedMerged))

      const extract = new Extract()
      const rowWrappers = Array.from(extract.rowWrappers)
      const scrapedRows: RowData[] = []
      const editedRows: RowData[] = []

      const act = getCurrentActFromUrl() || Object.values(editedMerged)[0]?.act || ''
      const currentLevel = getCurrentLevelFromUrl() || 'campaigns'
      const storedStatsKey = getStoredStatsKey(range, act, currentLevel)
      const basePageStats = resolveBasePageStats(allPageStats[storedStatsKey], hasScrapedDataForCurrentRange)
      if (!basePageStats) return

      rowWrappers.forEach((element) => {
        const id = getRowIdBySurface(element)
        if (!id) return
        const editedRow = dataMap.get(id)
        if (!editedRow) return
        applyPatchToRowElement(element, editedRow)
        editedRows.push(editedRow)
        const scrapedRow = scrapedMerged[id]
        if (scrapedRow) scrapedRows.push(scrapedRow)
      })

      applyStatsToPage(basePageStats, scrapedRows, editedRows)
    }
  } finally {
    if (observer) {
      observer.observe(getTableContainer(), {
        childList: true,
        subtree: true,
      })
    }
  }
}

function scheduleApplyToday() {
  if (rafId !== null) return

  rafId = window.requestAnimationFrame(() => {
    rafId = null
    applyTodayFromCache()
  })
}

/**
 * 监听页面滚动
 * 列表使用的虚拟列表，只会渲染可视窗口对应的列表DOM
 */
function subscribeVirtualListSync() {
  if (observer) return

  observer = new MutationObserver(() => {
    scheduleApplyToday()
  })

  observer.observe(getTableContainer(), {
    childList: true,
    subtree: true,
  })

  window.addEventListener(
    'scroll',
    () => {
      scheduleApplyToday()
    },
    { passive: true }
  )
}

syncTodayEditsOnLoad()
subscribeRealtimeEditsSync()
subscribeVirtualListSync()

chrome.runtime.onMessage.addListener((request: Message, _, sendResponse) => {
  if (request.type === 'START_SCRAPING') {
    const { level, time, act, statsKey } = request

    const forwardToBackground = async () => {
      const pageStats = extractPageStats()
      const data = await scrapeAllVirtualRows(level)
      const rowsData: Record<string, RowData> = {}

      data.forEach((item, index) => {
        rowsData[item.id] = {
          ...item,
          act,
          order: index,
        }
      })

      const backgroundResponse = await chrome.runtime.sendMessage<Message>({
        type: "SCRAPING_FINISHED",
        payload: rowsData,
        time,
        act,
        statsKey: statsKey || `${time || 'all'}__${act}__${level}`,
        pageStats,
      });

      sendResponse(backgroundResponse);
    };

    forwardToBackground();
  }

  return true; // 保持消息通道开启
}); 