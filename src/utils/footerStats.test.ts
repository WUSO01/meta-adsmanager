import { describe, expect, it } from 'vitest'
import type { RowData } from '@/shares/types'
import { collectPairedRows } from './footerStats'

function row(id: string, amountSpent: number) {
  return {
    id,
    amount_spent: amountSpent,
  } as RowData
}

describe('collectPairedRows', () => {
  it('deduplicates visible IDs and excludes edits without a scraped baseline', () => {
    const scrapedData = {
      first: row('first', 10),
      third: row('third', 30),
    }
    const editedData = new Map([
      ['first', row('first', 15)],
      ['second', row('second', 200)],
      ['third', row('third', 35)],
    ])

    const result = collectPairedRows(
      ['first', 'first', 'second', 'third'],
      editedData,
      scrapedData
    )

    expect(result.scrapedRows.map(item => item.id)).toEqual(['first', 'third'])
    expect(result.editedRows.map(item => item.id)).toEqual(['first', 'third'])
    expect(result.editedRows.reduce((total, item) => total + item.amount_spent, 0)).toBe(50)
  })
})
