/** 广告层级 */
export type Level = "campaigns" | "adsets" | "ads";

/**
 * 统一的广告数据格式（广告系列、广告组、广告合并）
 */
export interface RowData {
  /** 广告ID */
  id: string;
  /** DOM 抓取顺序（从 0 开始），用于还原列表顺序 */
  order?: number;
  /** 账户ID， 地址栏抓取 */
  act: string
  /** 层级 */
  level: Level;
  /** 状态 */
  status: string;
  /** 名称 */
  name: string;
  /** 投放 */
  delivery: string;
  /** 操作 */
  recommendations: string;
  /** 
   * 预算
   * 广告系列：
   *  $0.00
   *  单日预算
   * 
   * 广告组 | 广告：
   *  使用广告系列预算
   */
  budget: { value: number; type: string } | string
  /** 成效 */
  results: { value: number; type: string };
  /** 单次成效费用 */
  cost_per_result: { value: number; type: string };
  /** 已经花费金额 */
  amount_spent: number
  /** 展示次数 */
  impressions: number;
  /** 完成注册次数 */
  complete_registration: number;
  /** 单次完成注册费用 */
  per_complete_registration: number;
  /** 点击量 */
  click: number;
}

export interface PageStats {
  totalAmountSpent: number;
  totalImpressions: number;
  totalResults: number;
  totalCompleteRegistration: number;
  totalClicks: number;
  count: number;
}

export type Message =
  | { type: 'INIT' }
  | { type: 'START_SCRAPING'; level: Level; time?: string; act: string; statsKey?: string; pageStats?: PageStats }
  | { type: 'UPDATE_DAY'; date: string; payload: Partial<RowData> }
  | { type: 'SCRAPING_FINISHED'; payload: Record<string, RowData>; time?: string; act: string; statsKey?: string; pageStats?: PageStats }
  | { type: 'SCRAPING_STORED' }
  | { type: 'COMPUTE_TABLE_DATA'; level: Level; range?: DateRange; act?: string }
  | { type: 'COMPUTE_TABLE_DATA_RESULT'; tableData: RowData[]; stats: TableStats; missingDates: string[]; noData: boolean }
// | { type: 'SYNC_TO_PAGE' }

export interface TableStats {
  totalAmountSpent: number;
  totalImpressions: number;
  totalResults: number;
  count: number;
}

export interface EditItem {
  [date: string]: {
    [id: string]: Partial<RowData>
  }
}

/**
 * 时间范围
 */
export type DateRange = {
  start: string
  end: string
}
