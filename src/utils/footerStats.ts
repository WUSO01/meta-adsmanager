import type { RowData } from '@/shares/types'

/**
 * 为 footer 差量计算收集原始/编辑成对存在的可见行，并按 ID 去重。
 */
export function collectPairedRows(
  visibleIds: Iterable<string>,
  editedData: Map<string, RowData>,
  scrapedData: Record<string, RowData>
) {
  const scrapedRows: RowData[] = []
  const editedRows: RowData[] = []
  const seenIds = new Set<string>()

  for (const id of visibleIds) {
    if (seenIds.has(id)) continue
    seenIds.add(id)

    const scrapedRow = scrapedData[id]
    const editedRow = editedData.get(id)
    if (!scrapedRow || !editedRow) continue

    scrapedRows.push(scrapedRow)
    editedRows.push(editedRow)
  }

  return { scrapedRows, editedRows }
}
