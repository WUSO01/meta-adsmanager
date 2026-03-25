import { SCRAPE_STOREAGE_KEY, SCRAPE_STATS_KEY, EDIT_KEY, ACT_KEY } from "@/shares/constants"
import { Message, RowData, TableStats, EditItem, PageStats } from "@/shares/types"
import { storage } from "@/utils/storeage";
import { NestedData } from "@/store/useAppStore";
import { mergeEdits, getMissingDates, hasDataForRange } from "@/utils/merge";
import { getLevelDataFromRows, parseCurrency, processNumber } from "@/utils";

// ─────────────────────────────────────────────
// 统计计算（在 Service Worker 中执行，不占用 UI 线程）
// ─────────────────────────────────────────────

function calcStats(rows: RowData[]): TableStats {
  let totalAmountSpent = 0;
  let totalImpressions = 0;
  let totalResults = 0;

  for (const row of rows) {
    if (typeof row.amount_spent === 'number') {
      totalAmountSpent += row.amount_spent;
    } else if (typeof row.amount_spent === 'string') {
      totalAmountSpent += parseCurrency(row.amount_spent as string);
    }
    if (typeof row.impressions === 'number') {
      totalImpressions += row.impressions;
    }
    if (row.results && typeof row.results.value === 'number') {
      totalResults += row.results.value;
    }
  }

  return {
    totalAmountSpent: processNumber(totalAmountSpent),
    totalImpressions,
    totalResults: processNumber(totalResults),
    count: rows.length,
  };
}

/**
 * 处理 COMPUTE_TABLE_DATA：从 storage 读取数据，在 SW 中完成
 * mergeEdits + getLevelDataFromRows + calcStats，然后返回结果。
 * 这样可以将计算完全从 UI 线程（sidepanel）卸载到后台。
 */
async function handleComputeTableData(
  request: Extract<Message, { type: 'COMPUTE_TABLE_DATA' }>
): Promise<Extract<Message, { type: 'COMPUTE_TABLE_DATA_RESULT' }>> {
  const { level, range, act } = request;

  const [rawData, rawEdits] = await Promise.all([
    storage.get<NestedData>(SCRAPE_STOREAGE_KEY),
    storage.get<EditItem>(EDIT_KEY),
  ]);

  const data: NestedData = rawData || {};
  const edits: EditItem = rawEdits || {};

  const missingDates = getMissingDates(data, range);
  const noData = !hasDataForRange(data, range);

  if (noData) {
    return {
      type: 'COMPUTE_TABLE_DATA_RESULT',
      tableData: [],
      stats: { totalAmountSpent: 0, totalImpressions: 0, totalResults: 0, count: 0 },
      missingDates,
      noData: true,
    };
  }

  const merged = mergeEdits(data, edits, range);
  const tableData = getLevelDataFromRows(merged, level).filter((row) => !act || row.act === act);
  const stats = calcStats(tableData);

  return {
    type: 'COMPUTE_TABLE_DATA_RESULT',
    tableData,
    stats,
    missingDates,
    noData: tableData.length === 0,
  };
}

/**
 * 处理background中接受的消息
 */
export const handleMessage = async (
  request: Message,
  sendResponse: (response: Message) => void
) => {
  switch (request.type) {
    case 'SCRAPING_FINISHED': {
      const { act, payload, time = 'all', statsKey, pageStats } = request
      console.log(`数据抓取完成，存储 key: ${time}，抓取的数据为：`, request.payload)
      // 保存抓取的数据
      await storage.deepMerge(SCRAPE_STOREAGE_KEY, { [time]: payload })

      // 保存抓取当时的页面总统计（按 time + act 维度）
      if (statsKey && pageStats) {
        await storage.deepMerge<Record<string, PageStats>>(SCRAPE_STATS_KEY, {
          [statsKey]: pageStats,
        })
      }
      // 保存账户
      const acts: string[] = await storage.get(ACT_KEY) || []
      if (!acts.includes(request.act)) {
        await storage.set(ACT_KEY, [...acts, act])
      }
      sendResponse({
        type: 'SCRAPING_STORED'
      })
      break
    }

    case 'COMPUTE_TABLE_DATA': {
      const result = await handleComputeTableData(request);
      sendResponse(result);
      break;
    }

    default:
  }
}
