/**
 * 返回节点中实际承载文本的最深层元素。
 * Meta 经常在数值外增加多个 span，同时把视觉占位节点混在同一层。
 */
function findTextLeaf(root: HTMLElement): HTMLElement {
  let current = root

  while (true) {
    const textChildren = Array.from(current.children).filter((child): child is HTMLElement => {
      if (!(child instanceof HTMLElement)) return false
      if (child.matches('[data-visualcompletion="ignore"]')) return false
      return Boolean(child.textContent?.trim())
    })

    if (textChildren.length === 0) return current
    current = textChildren[textChildren.length - 1]
  }
}

/**
 * 定位 Meta 表格单元格中实际展示主值的元素。
 *
 * 兼容：
 * - 旧版 [geotextcolor="value"]
 * - 名称字段的 a 标签
 * - 新版复合字段（主值是 .ellipsis._1ha4 的前一个兄弟节点）
 * - 新版普通数值字段（带 tooltip 语义属性的值容器）
 */
function findCellValueElement(cell: Element): HTMLElement | null {
  const legacyValue = cell.querySelector<HTMLElement>('[geotextcolor="value"]')
  if (legacyValue) return findTextLeaf(legacyValue)

  const link = cell.querySelector<HTMLElement>('a')
  if (link) return link

  const secondaryText = cell.querySelector<HTMLElement>('.ellipsis._1ha4')
  const compoundMain = secondaryText?.previousElementSibling
  if (compoundMain instanceof HTMLElement && compoundMain.textContent?.trim()) {
    return findTextLeaf(compoundMain)
  }

  const tooltipValues = Array.from(
    cell.querySelectorAll<HTMLElement>('[data-hover="tooltip"][data-tooltip-display="overflow"]')
  )
  const mainValue = tooltipValues.find(element => !element.closest('.ellipsis._1ha4'))

  return mainValue ? findTextLeaf(mainValue) : null
}

const DECORATED_SUFFIXES = new Set([
  'table_cell:forAttributionWindow(results,default)',
  'table_cell:forAttributionWindow(cost_per_result,default)',
  'table_cell:forAttributionWindow(cost_per_action_type:omni_complete_registration,default)',
  'table_cell:forAttributionWindow(actions:omni_complete_registration,default)',
])

function getCell(element: Element, suffix: string): Element | null {
  return element.querySelector(`span[data-surface$="${suffix}"]`)
}

/**
 * 读取 data-surface 对应单元格的主值文本。
 */
export function getCellValueText(element: Element, suffix: string): string {
  const cell = getCell(element, suffix)
  if (!cell) return ''

  return findCellValueElement(cell)?.textContent?.trim() || ''
}

interface PatchCellOptions {
  /** 是否为修改值增加下划线标记，footer 回写时应关闭 */
  decorate?: boolean
}

/**
 * 根据 data-surface 后缀更新一行中的单元格显示值。
 * 返回是否成功找到并更新了目标元素。
 */
export function patchByCellSuffix(
  element: Element,
  suffix: string,
  value: unknown,
  options: PatchCellOptions = {}
): boolean {
  const cell = getCell(element, suffix)
  if (!cell) return false

  const valueElement = findCellValueElement(cell)
  if (!valueElement) return false

  if (options.decorate !== false && DECORATED_SUFFIXES.has(suffix)) {
    valueElement.style.textDecoration = value === '—' ? 'none' : 'underline dotted'
  }

  valueElement.textContent = value === null || value === undefined ? '' : String(value)
  return true
}
