import { Table } from 'antd';
import type { TableProps } from 'antd';
import { RowData } from '@/shares/types';
import { useTableData } from '../hooks/useTableData';
import {
  statusColumn,
  deliveryColumn,
  recommendationsColumn,
  resultsColumn,
  costPerResultColumn,
  amountSpentColumn,
  impressionsColumn,
  completeRegistrationColumn,
  perCompleteRegistrationColumn,
  clickColumn,
  budgetColumn,
} from './tableColumns';
import { TableFooterStats } from './TableFooterStats';

const columns: TableProps<RowData>['columns'] = [
  statusColumn(),
  {
    key: 'name',
    dataIndex: 'name',
    title: '广告组',
    fixed: 'left',
  },
  deliveryColumn(),
  recommendationsColumn(),
  resultsColumn(),
  costPerResultColumn(),
  amountSpentColumn(),
  completeRegistrationColumn(),
  perCompleteRegistrationColumn(),
  impressionsColumn(),
  clickColumn(),
  budgetColumn(),
];

export const AdsetTable = () => {
  const { tableData, noData, stats, missingDates } = useTableData<RowData>('adsets');

  return (
    <div>
      {missingDates.length > 0 && (
        <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-800">
          <span className="font-semibold">⚠ 数据不完整：</span>
          {' '}以下日期缺少抓取数据，统计结果可能不准确：{' '}
          <span className="font-mono font-semibold">{missingDates.join('、')}</span>
        </div>
      )}
      <Table<RowData>
        rowKey="id"
        bordered
        scroll={{ x: 'max-content', y: 600 }}
        columns={columns}
        dataSource={tableData}
        pagination={false}
        locale={noData ? { emptyText: '当前时间段暂无抓取数据' } : undefined}
      />
      <TableFooterStats tableData={tableData} stats={stats} noData={noData} />
    </div>
  );
};
