/**
 * 各表格共用的列渲染工厂函数
 */
import { Switch } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { RowData } from '@/shares/types';
import { EditItem } from './EditItem';

/** 关/开 Switch 列 */
export function statusColumn(
  overrides?: Partial<ColumnType<RowData>>
): ColumnType<RowData> {
  return {
    key: 'status',
    dataIndex: 'status',
    title: '关/开',
    fixed: 'left',
    render: (_, record) => (
      <Switch checked={record.status === '开启'} disabled />
    ),
    ...overrides,
  };
}

/** 投放列 */
export function deliveryColumn(): ColumnType<RowData> {
  return { key: 'delivery', dataIndex: 'delivery', title: '投放' };
}

/** 操作列 */
export function recommendationsColumn(): ColumnType<RowData> {
  return { key: 'recommendations', dataIndex: 'recommendations', title: '操作' };
}

/** 成效列（带 EditItem） */
export function resultsColumn(): ColumnType<RowData> {
  return {
    key: 'results',
    dataIndex: 'results',
    title: '成效',
    render: (_, record) => (
      <>
        <EditItem data={record} field="results" />
        <div className="text-[#1c2b33a6]">{record.results.type}</div>
      </>
    ),
  };
}

/** 单次成效费用列（带 EditItem） */
export function costPerResultColumn(): ColumnType<RowData> {
  return {
    key: 'cost_per_result',
    dataIndex: 'cost_per_result',
    title: '单次成效费用',
    render: (_, record) => (
      <>
        <EditItem data={record} field="cost_per_result" />
        <div className="text-[#1c2b33a6]">{record.cost_per_result.type}</div>
      </>
    ),
  };
}

/** 已花费金额列（带 EditItem） */
export function amountSpentColumn(): ColumnType<RowData> {
  return {
    key: 'amount_spent',
    dataIndex: 'amount_spent',
    title: '已花费金额',
    render: (_, record) => <EditItem data={record} field="amount_spent" />,
  };
}

/** 展示次数列（带 EditItem） */
export function impressionsColumn(): ColumnType<RowData> {
  return {
    key: 'impressions',
    dataIndex: 'impressions',
    title: '展示次数',
    render: (_, record) => <EditItem data={record} field="impressions" />,
  };
}

/** 完成注册次数列（带 EditItem） */
export function completeRegistrationColumn(): ColumnType<RowData> {
  return {
    key: 'complete_registration',
    dataIndex: 'complete_registration',
    title: '完成注册次数',
    render: (_, record) => <EditItem data={record} field="complete_registration" />,
  };
}

/** 单次完成注册费用列（带 EditItem） */
export function perCompleteRegistrationColumn(): ColumnType<RowData> {
  return {
    key: 'per_complete_registration',
    dataIndex: 'per_complete_registration',
    title: '单次完成注册费用',
    render: (_, record) => <EditItem data={record} field="per_complete_registration" />,
  };
}

/** 点击量列（带 EditItem） */
export function clickColumn(): ColumnType<RowData> {
  return {
    key: 'click',
    dataIndex: 'click',
    title: '点击量（全部）',
    render: (_, record) => <EditItem data={record} field="click" />,
  };
}

/** 预算（带 EditItem） */
export function budgetColumn(): ColumnType<RowData> {
  return {
    key: 'budget',
    dataIndex: 'budget',
    title: '预算',
    render: (_, record) => {
      const { budget } = record

      if (typeof budget === 'string') return <div>{budget}</div>

      return (
        <>
          <EditItem data={record} field="budget" />
          <div className="text-[#1c2b33a6]">{budget.type}</div>
        </>
      )
    }
  };
}