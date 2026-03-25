import { formatCurrency } from '@/utils';
import type { RowData, TableStats } from '@/shares/types';

interface TableFooterStatsProps {
  tableData: RowData[];
  stats: TableStats;
  noData: boolean;
}

export const TableFooterStats = ({ tableData, stats, noData }: TableFooterStatsProps) => {
  if (noData || tableData.length === 0) return null;

  const { totalClick, totalCompleteRegistration } = tableData.reduce(
    (acc, row) => {
      acc.totalClick += row.click || 0;
      acc.totalCompleteRegistration += row.complete_registration || 0;
      return acc;
    },
    { totalClick: 0, totalCompleteRegistration: 0 }
  );

  const avgPerCompleteRegistration = totalCompleteRegistration > 0
    ? stats.totalAmountSpent / totalCompleteRegistration
    : 0;

  return (
    <div className="mt-2 flex gap-6 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm">
      <div>
        <span className="text-slate-500">共 </span>
        <span className="font-semibold text-slate-800">{stats.count}</span>
        <span className="text-slate-500"> 条</span>
      </div>
      <div>
        <span className="text-slate-500">总花费：</span>
        <span className="font-semibold text-emerald-600">{formatCurrency(stats.totalAmountSpent)}</span>
      </div>
      <div>
        <span className="text-slate-500">总展示：</span>
        <span className="font-semibold text-blue-600">{stats.totalImpressions.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-slate-500">总成效：</span>
        <span className="font-semibold text-orange-600">{stats.totalResults.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-slate-500">单次成效费用：</span>
        <span className="font-semibold text-rose-600">
          {stats.totalResults > 0 ? formatCurrency(stats.totalAmountSpent / stats.totalResults) : '-'}
        </span>
      </div>
      <div>
        <span className="text-slate-500">总点击量：</span>
        <span className="font-semibold text-fuchsia-600">{totalClick.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-slate-500">总完成注册：</span>
        <span className="font-semibold text-cyan-600">{totalCompleteRegistration.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-slate-500">单次注册费用：</span>
        <span className="font-semibold text-violet-600">
          {totalCompleteRegistration > 0 ? formatCurrency(avgPerCompleteRegistration) : '-'}
        </span>
      </div>
    </div>
  );
};
