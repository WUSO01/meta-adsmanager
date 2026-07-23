import { beforeEach, describe, expect, it } from 'vitest'
import type { RowData } from '@/shares/types'
import Extract from './extract'

function insertCampaignRow(budgetContent: string) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <span
      data-surface-wrapper="1"
      data-surface="/am/table/table_row:120251938592500111unit"
    >
      <span
        data-surface-wrapper="1"
        data-surface="/am/table/table_row:120251938592500111unit/table_cell:forObjectType(budget,CAMPAIGN_GROUP)"
        style="display: contents;"
      >
        ${budgetContent}
      </span>
    </span>
  `
  document.body.appendChild(wrapper)
}

describe('budget extraction with Meta DOM variants', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('extracts a numeric budget from the new nested DOM', () => {
    insertCampaignRow(`
      <div>
        <div>
          <span>
            <div class="x1rg5ohu">
              <div class="xt0psk2">
                <div data-visualcompletion="ignore"></div>
                $1,025.00
              </div>
            </div>
          </span>
        </div>
        <div class="ellipsis _1ha4">
          <div>单日</div>
        </div>
      </div>
    `)

    const extract = new Extract()
    const { data } = extract.extractCampaignData()

    expect((data[0] as RowData).budget).toEqual({
      value: 1025,
      type: '单日',
    })
  })

  it('keeps an inherited budget as text', () => {
    insertCampaignRow(`
      <div>
        <div>
          <span>使用广告系列预算</span>
        </div>
      </div>
    `)

    const extract = new Extract()
    const { data } = extract.extractCampaignData()

    expect((data[0] as RowData).budget).toBe('使用广告系列预算')
  })

  it('extracts the main and secondary text from the new compound DOM', () => {
    const cell = document.createElement('span')
    cell.innerHTML = `
      <div>
        <div>
          <span>
            <div class="x1rg5ohu">
              <div class="xt0psk2">—</div>
            </div>
          </span>
        </div>
        <div class="ellipsis _1ha4">
          <div>单次购物</div>
        </div>
      </div>
    `

    const extract = new Extract()

    expect(extract.extractCompoundValue(cell)).toEqual({
      main: '—',
      sub: '单次购物',
    })
  })
})
