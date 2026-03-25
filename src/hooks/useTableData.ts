import { useState, useEffect, useRef } from 'react';
import { Level, RowData, TableStats, Message } from '@/shares/types';
import { useAppStore } from '@/store/useAppStore';

export type { TableStats };

/**
 * 提取三个表格公共的数据加载逻辑。
 *
 * 优化：将 mergeEdits / getLevelDataFromRows / calcStats 等纯计算
 * 全部转移到 Service Worker 中执行，避免在 UI 渲染线程中做同步重计算，
 * 从而减少 sidepanel 的 jank / 掉帧。
 *
 * 流程：
 *   1. 监听 store 中 data / edits / range 的变化
 *   2. 变化时向 SW 发送 COMPUTE_TABLE_DATA 消息
 *   3. SW 读取 storage，完成 merge + filter + stats 后通过 sendResponse 返回
 *   4. 将结果写入本地 state，触发组件重渲染
 */
export function useTableData<T extends RowData>(level: Level) {
  const dateRange = useAppStore(s => s.range);
  // 只订阅版本号/引用，用于触发重新请求；实际数据由 SW 从 storage 直接读取
  const dataVersion = useAppStore(s => s.data);
  const editsVersion = useAppStore(s => s.edits);
  const selectedAct = useAppStore(s => s.selectedAct);
  const [tableData, setTableData] = useState<T[]>([]);
  const [noData, setNoData] = useState(false);
  const [missingDates, setMissingDates] = useState<string[]>([]);
  const [stats, setStats] = useState<TableStats>({
    totalAmountSpent: 0,
    totalImpressions: 0,
    totalResults: 0,
    count: 0,
  });

  // 用于取消过期请求（当新请求发出时，忽略旧请求的回调）
  const requestIdRef = useRef(0);

  useEffect(() => {
    const currentId = ++requestIdRef.current;

    chrome.runtime.sendMessage<Message, Extract<Message, { type: 'COMPUTE_TABLE_DATA_RESULT' }>>(
      { type: 'COMPUTE_TABLE_DATA', level, range: dateRange, act: selectedAct },
      (response) => {
        // 忽略过期的回调
        if (currentId !== requestIdRef.current) return;
        if (chrome.runtime.lastError) {
          console.warn('[useTableData] SW compute error:', chrome.runtime.lastError.message);
          return;
        }
        if (!response || response.type !== 'COMPUTE_TABLE_DATA_RESULT') return;

        setNoData(response.noData);
        setMissingDates(response.missingDates);
        setTableData(response.tableData as T[]);
        setStats(response.stats);
      }
    );
  // dataVersion / editsVersion 引用变化 → store 数据有更新 → 重新请求
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataVersion, editsVersion, dateRange, level, selectedAct]);

  return { tableData, noData, stats, missingDates };
}
