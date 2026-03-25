import { useState } from "react"
import { Button, DatePicker, Select, Tabs, Tooltip } from 'antd'
import type { DatePickerProps, TabsProps } from 'antd';
import { Level } from "@/shares/types"
import { AdsetTable } from "../components/AdsetTable";
import { CampaignsTable } from "../components/CampaignsTable";
import { useAppStore } from "@/store/useAppStore";
import { RangePickerProps } from "antd/es/date-picker";
import dayjs, { Dayjs } from "dayjs";
import { DATE_FORMAT } from "@/shares/constants";
import { useEditedDates, useFetchedDates } from "@/hooks/useEditedDates";
import { AdsTable } from "@/components/AdsTable";

const { RangePicker } = DatePicker;

function App() {
  const editedDates = useEditedDates()
  const fetchedDates = useFetchedDates()
  const acts = useAppStore(s => s.acts)
  const selectedAct = useAppStore(s => s.selectedAct)
  const clearCache = useAppStore(s => s.clearCache)
  const resetAllEdits = useAppStore(s => s.resetAllEdits)
  const setRange = useAppStore(s => s.setRange)
  const setSelectedAct = useAppStore(s => s.setSelectedAct)

  const [selectKey, setSelectKey] = useState<Level>('campaigns')

  const items: TabsProps['items'] = [
    {
      key: 'campaigns',
      label: '广告系列',
      children: (
        <CampaignsTable />
      ),
    },
    {
      key: 'adsets',
      label: '广告组',
      children: (
        <AdsetTable />
      ),
    },
    {
      key: 'ads',
      label: '广告',
      children: (
        <AdsTable />
      ),
    },
  ]

  const onDateChange: RangePickerProps['onChange'] = (_, dateStrings) => {
    if (!dateStrings) {
      setRange(undefined)
      return
    }
    const [startDate, endDate] = dateStrings
    if (startDate && endDate) {
      setRange({
        start: startDate,
        end: endDate
      })
    } else {
      setRange(undefined)
    }
  };

  const cellRender: DatePickerProps<Dayjs>['cellRender'] = (current, info) => {
    if (info.type !== 'date') {
      return info.originNode;
    }

    if (typeof current === 'number' || typeof current === 'string') {
      return <div className="ant-picker-cell-inner">{current}</div>;
    }

    const dateStr = dayjs(current).format(DATE_FORMAT)
    const edited = editedDates.includes(dateStr)
    const fetched = fetchedDates.includes(dateStr)

    const color = edited ? 'red' : fetched ? 'blue' : undefined
    const tooltipTitle = edited ? '存在修改值' : fetched ? '已抓取数据' : undefined

    return (
      <div
        className="ant-picker-cell-inner"
        style={color ? { color } : {}}
      >
        <Tooltip title={tooltipTitle}>
          {current.date()}
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="p-2">
      <Tabs
        type="card"
        activeKey={selectKey}
        items={items}
        tabBarExtraContent={
          {
            left: (
              <div className="pr-[10px]">
                <Select
                  placeholder="选择账户"
                  value={acts.length === 0 ? '__EMPTY__' : (selectedAct ?? '__ALL__')}
                  disabled={acts.length === 0}
                  style={{ minWidth: 220 }}
                  options={acts.length === 0
                    ? [{ label: '暂无账户', value: '__EMPTY__' }]
                    : [
                      { label: '全部账户', value: '__ALL__' },
                      ...acts.map(act => ({ label: act, value: act })),
                    ]}
                  onChange={(value) => {
                    if (value === '__EMPTY__') return
                    setSelectedAct(value === '__ALL__' ? undefined : value)
                  }}
                />
              </div>
            ),
            right: (
              <div className="flex gap-1">
                <Button danger onClick={clearCache}>清除缓存</Button>
                <Button danger onClick={resetAllEdits}>撤销全部更改</Button>
                <RangePicker
                  cellRender={cellRender}
                  format={DATE_FORMAT}
                  onChange={onDateChange}
                />
              </div>
            )
          }
        }
        onChange={(key) => setSelectKey(key as Level)}
      />
    </div>
  )
}

export default App

