import { RowData } from "@/shares/types"
import { useAppStore } from "@/store/useAppStore"
import { EditOutlined } from "@ant-design/icons"
import { processNumber } from "@/utils"
import { Form, InputNumber, message, Modal } from "antd"
import { useMemo, useState } from "react"
import _ from 'lodash'

interface EditItemProps {
  data: RowData
  /** 需要更新的字段 */
  field: keyof typeof relationMap
  formatter?: (value: string | number | undefined) => string
  parser?: (displayValue: string | undefined) => number
}

type UpdateField = {
  /** 被联动更新的字段 */
  field: keyof RowData
  /** 依赖的字段路径（从 data 中取值） */
  deps: string
  /** 计算规则：(当前输入值, 依赖值) => 新值 */
  compute: (inputValue: number, depsValue: number) => number
}

const relationMap = {
  /**
   * 更改成效 → 更新单次成效费用
   * 单次成效费用 = 已花费金额 / 成效
   */
  results: {
    label: '成效',
    tooltip: '更新成效会更新单次成效费用（已花费金额 / 成效）',
    path: 'results.value',
    updateFields: [
      {
        field: 'cost_per_result' as keyof RowData,
        deps: 'amount_spent',
        compute: (inputValue: number, depsValue: number) =>
          inputValue !== 0 ? processNumber(depsValue / inputValue) : 0,
      },
    ] as UpdateField[],
    compute: (value: number) => Math.trunc(value),
  },

  /**
   * 更改单次成效费用 → 更新成效
   * 成效 = 已花费金额 / 单次成效费用
   */
  cost_per_result: {
    label: '单次成效费用',
    tooltip: '更新单次成效费用会更新成效（已花费金额 / 单次成效费用）',
    path: 'cost_per_result.value',
    updateFields: [
      {
        field: 'results' as keyof RowData,
        deps: 'amount_spent',
        compute: (inputValue: number, depsValue: number) =>
          inputValue !== 0 ? Math.trunc(depsValue / inputValue) : 0,
      },
    ] as UpdateField[],
    compute: (value: number) => processNumber(value),
  },

  /**
   * 更改完成注册次数 → 更新单次完成注册费用
   * 单次完成注册费用 = 已花费金额 / 完成注册次数
   */
  complete_registration: {
    label: '完成注册次数',
    tooltip: '更新完成注册次数会更新单次完成注册费用（已花费金额 / 完成注册次数）',
    path: 'complete_registration',
    updateFields: [
      {
        field: 'per_complete_registration' as keyof RowData,
        deps: 'amount_spent',
        compute: (inputValue: number, depsValue: number) =>
          inputValue !== 0 ? processNumber(depsValue / inputValue) : 0,
      },
    ] as UpdateField[],
    compute: (value: number) => Math.trunc(value),
  },

  /**
   * 更改单次完成注册费用 → 更新完成注册次数
   * 完成注册次数 = 已花费金额 / 单次完成注册费用
   */
  per_complete_registration: {
    label: '单次完成注册费用',
    tooltip: '更新单次完成注册费用会更新完成注册次数（已花费金额 / 单次完成注册费用）',
    path: 'per_complete_registration',
    updateFields: [
      {
        field: 'complete_registration' as keyof RowData,
        deps: 'amount_spent',
        compute: (inputValue: number, depsValue: number) =>
          inputValue !== 0 ? Math.trunc(depsValue / inputValue) : 0,
      },
    ] as UpdateField[],
    compute: (value: number) => processNumber(value),
  },

  /**
   * 更改已花费金额 → 更新单次成效费用 和 单次完成注册费用
   * 单次成效费用 = 已花费金额 / 成效
   * 单次完成注册费用 = 已花费金额 / 完成注册次数
   */
  amount_spent: {
    label: '花费金额',
    tooltip: '更新花费金额会更新单次成效费用（花费金额 / 成效）和单次完成注册费用（花费金额 / 完成注册次数）',
    path: 'amount_spent',
    updateFields: [
      {
        field: 'cost_per_result' as keyof RowData,
        deps: 'results.value',
        compute: (inputValue: number, depsValue: number) =>
          depsValue !== 0 ? processNumber(inputValue / depsValue) : 0,
      },
      {
        field: 'per_complete_registration' as keyof RowData,
        deps: 'complete_registration',
        compute: (inputValue: number, depsValue: number) =>
          depsValue !== 0 ? processNumber(inputValue / depsValue) : 0,
      },
    ] as UpdateField[],
    compute: (value: number) => processNumber(value),
  },

  // 以下字段无联动
  impressions: {
    label: '展示次数',
    path: 'impressions',
    compute: (value: number) => Math.trunc(value),
  },
  click: {
    label: '点击量',
    path: 'click',
    compute: (value: number) => Math.trunc(value),
  },
  budget: {
    label: '预算',
    path: 'budget.value',
  },
}

/**
 * 将计算后的值写入 patch，兼容 number 类型字段和带 value 的对象字段
 */
function applyToPatch(
  patch: Partial<RowData>,
  data: RowData,
  field: keyof RowData,
  newValue: number
) {
  const originItem = data[field]
  if (typeof originItem === 'number') {
    patch[field] = newValue as any
  } else {
    patch[field] = {
      ...(originItem as any),
      value: newValue,
    }
  }
}

/**
 * 可以自定的数据
 * 目前仅支持数据编辑，并且支持编辑的就那么几项
 */
export const EditItem = (props: EditItemProps) => {
  const { data, field, formatter, parser } = props
  const { path } = relationMap[field]

  const [form] = Form.useForm()

  const updateEdit = useAppStore(s => s.updateEdit)
  const dateRange = useAppStore(s => s.range)
  const edits = useAppStore(s => s.edits)

  const [open, setOpen] = useState(false)

  const defaultValue = useMemo(() => {
    const value = _.get(data, path) || 0
    return value
  }, [data, field])

  /** 判断当前字段在当前日期范围内是否被编辑过 */
  const isEdited = useMemo(() => {
    if (!dateRange) {
      return !!(edits?.['all']?.[data.id] && field in (edits['all'][data.id] ?? {}))
    }
    const { start, end } = dateRange
    const dates = Object.keys(edits ?? {})
    return dates.some(
      date => date >= start && date <= end && field in (edits[date]?.[data.id] ?? {})
    )
  }, [data.id, field, dateRange, edits])

  /**
   *  1. 更改成效会更新单次成效费用，已花费金额  / 成效
   *  2. 更改单次成效费用会更新成效，已花费金额  / 单次成效费用
   *  3. 更改完成注册次数会更新单次完成注册费用， 已花费金额  / 完成注册次数
   *  4. 更改单次完成注册费用会更新完成注册次数， 已花费金额  / 单次完成注册费用
   *  5. 更新已花金额，会更新单次成效费用和单次完成注册费用，已花费金额 / 成效，已花费金额  / 完成注册次数
   */
  const handleOk = () => {
    let date = ''

    if (!dateRange) {
      date = 'all'
    } else {
      if (dateRange.start !== dateRange.end) {
        message.warning('仅支持单独修改某一天的值')
      } else {
        date = dateRange.start
      }
    }

    if (!date) return

    const { value } = form?.getFieldsValue()

    const patch: Partial<RowData> = {}

    const config = relationMap[field] as {
      path: string
      updateFields?: UpdateField[]
      compute?: (value: number) => number
    }

    const { updateFields, compute } = config

    // 处理所有联动字段
    if (updateFields && updateFields.length > 0) {
      for (const uf of updateFields) {
        const depsValue = (_.get(data, uf.deps) as number) || 0
        const newValue = uf.compute(value, depsValue)
        applyToPatch(patch, data, uf.field, newValue)
      }
    }

    // 处理当前字段本身
    const computedValue = compute ? compute(value) : value
    applyToPatch(patch, data, field as keyof RowData, computedValue)

    setOpen(false)
    updateEdit(data.id, date, patch)
  }

  return (
    <>
      <div>
        <span style={isEdited ? { color: '#faad14', fontWeight: 600 } : {}}>
          {defaultValue}
        </span>
        <span
          className="pl-[3px] cursor-pointer"
          onClick={() => {
            setOpen(true)
            form?.setFieldValue('value', defaultValue)
          }}
        >
          <EditOutlined />
        </span>
      </div>
      <Modal
        width={400}
        title={`更新${relationMap[field]?.label}`}
        open={open}
        onCancel={() => {
          setOpen(false)
        }}
        onOk={handleOk}
      >
        <Form
          form={form}
          initialValues={{
            value: defaultValue
          }}
        >
          <Form.Item
            name="value"
            label={relationMap[field]?.label}
            tooltip={(relationMap[field] as any)?.tooltip}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={formatter}
              parser={parser}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
