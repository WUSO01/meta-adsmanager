import { beforeEach, describe, expect, it } from 'vitest'
import { getCellValueText, patchByCellSuffix } from './domPatch'

const ROW_ID = '120248856198980629'

function insertRow(cellHtml: string) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <span
      data-surface-wrapper="1"
      data-surface="/am/table/table_row:${ROW_ID}unit"
    >
      ${cellHtml}
    </span>
  `
  document.body.appendChild(wrapper)
  return wrapper.querySelector(`span[data-surface$="table_row:${ROW_ID}unit"]`)!
}

function cell(surfaceSuffix: string, content: string) {
  return `
    <span
      data-surface-wrapper="1"
      data-surface="/am/table/table_row:${ROW_ID}unit/${surfaceSuffix}"
      style="display: contents;"
    >
      ${content}
    </span>
  `
}

function footerCell(surfaceSuffix: string, main: string, sub: string) {
  return `
    <span
      data-surface-wrapper="1"
      data-surface="/am/table/table_row:-1/${surfaceSuffix}"
      style="display: contents;"
    >
      <div class="_1b33 _av2o">
        <div data-hover="tooltip" data-tooltip-display="overflow">
          ${main}
        </div>
        <div class="ellipsis _1ha4">
          <div>${sub}</div>
        </div>
      </div>
    </span>
  `
}

describe('patchByCellSuffix', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('updates a compound value in the new Meta DOM and preserves its secondary text', () => {
    const suffix = 'table_cell:forAttributionWindow(results,default)'
    const row = insertRow(cell(suffix, `
      <div>
        <div class="_1b33 _av2o">
          <div>
            <div>
              <div data-hover="tooltip" data-tooltip-display="overflow">2</div>
              <div class="ellipsis _1ha4">
                <div>网站购物</div>
              </div>
            </div>
          </div>
        </div>
        <div data-visualcompletion="ignore"></div>
      </div>
    `))

    expect(patchByCellSuffix(row, suffix, '9')).toBe(true)

    const targetCell = row.querySelector(`span[data-surface$="${suffix}"]`)!
    expect(targetCell.querySelector('[data-hover="tooltip"]')?.textContent).toBe('9')
    expect(targetCell.querySelector('.ellipsis._1ha4')?.textContent?.trim()).toBe('网站购物')
  })

  it('updates the deeply nested main value from the supplied new DOM shape', () => {
    const suffix = 'table_cell:forAttributionWindow(cost_per_result,default)'
    const row = insertRow(cell(suffix, `
      <div>
        <div class="_1b33 _av2o">
          <div data-hover="tooltip" data-tooltip-display="overflow">
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
      </div>
    `))

    expect(patchByCellSuffix(row, suffix, '$12.50')).toBe(true)

    const value = row.querySelector<HTMLElement>('.x1rg5ohu .xt0psk2')!
    expect(value.textContent).toBe('$12.50')
    expect(value.style.textDecoration).toBe('underline dotted')
  })

  it('updates the new campaign budget value without removing the budget type', () => {
    const suffix = 'table_cell:forObjectType(budget,CAMPAIGN_GROUP)'
    const row = insertRow(cell(suffix, `
      <div>
        <div>
          <div data-visualcompletion="ignore"></div>
          <div class="_1b33 _av2o">
            <div data-hover="tooltip" data-tooltip-display="overflow">
              <span class="x108nfp6">$388.00</span>
            </div>
            <div class="ellipsis _1ha4">
              <div>单日</div>
            </div>
          </div>
        </div>
      </div>
    `))

    expect(patchByCellSuffix(row, suffix, '$500.00')).toBe(true)
    expect(row.querySelector('.x108nfp6')?.textContent).toBe('$500.00')
    expect(row.querySelector('.ellipsis._1ha4')?.textContent?.trim()).toBe('单日')
  })

  it('updates spend inside the nested spend_sla surface without changing its action icon', () => {
    const suffix = 'table_cell:spend'
    const row = insertRow(cell(suffix, `
      <div>
        <div aria-label="前往预算概览" role="button">
          <svg><path></path></svg>
        </div>
        <div data-visualcompletion="ignore">
          <span
            data-surface-wrapper="1"
            data-surface="/am/table/table_row:${ROW_ID}unit/table_cell:spend/spend_sla"
          >
            <div>
              <div data-hover="tooltip" data-tooltip-display="overflow">
                <span><span class="_3dfi _3dfj">$53.60</span></span>
              </div>
            </div>
          </span>
        </div>
      </div>
    `))

    expect(patchByCellSuffix(row, suffix, '$88.00')).toBe(true)
    expect(row.querySelector('span._3dfi')?.textContent).toBe('$88.00')
    expect(row.querySelector('[aria-label="前往预算概览"]')).not.toBeNull()
  })

  it('continues to update the legacy geotextcolor structure', () => {
    const suffix = 'table_cell:impressions'
    const row = insertRow(cell(suffix, `
      <div geotextcolor="value">
        <span>3,490</span>
      </div>
    `))

    expect(patchByCellSuffix(row, suffix, '4,200')).toBe(true)
    expect(row.querySelector('[geotextcolor="value"] span')?.textContent).toBe('4,200')
  })

  it('reads and updates the supplied new footer DOM structure', () => {
    const footer = document.createElement('div')
    footer.dataset.pagelet = 'FixedDataTableNew_footerRow'
    footer.innerHTML = `
      ${footerCell(
        'table_cell:forAttributionWindow(results,default)',
        '<span data-interactable="|mouseover|">474</span>',
        '网站购物'
      )}
      ${footerCell(
        'table_cell:forAttributionWindow(cost_per_result,default)',
        '<span><span class="_3dfi _3dfj">$16.70</span></span>',
        '单次购物'
      )}
      ${footerCell(
        'table_cell:spend',
        '<span class="_3dfi _3dfj">$734.77</span>',
        '总花费'
      )}
      ${footerCell(
        'table_cell:impressions',
        '116,494',
        '共计'
      )}
    `
    document.body.appendChild(footer)

    expect(getCellValueText(footer, 'table_cell:forAttributionWindow(results,default)')).toBe('474')
    expect(getCellValueText(footer, 'table_cell:forAttributionWindow(cost_per_result,default)')).toBe('$16.70')
    expect(getCellValueText(footer, 'table_cell:spend')).toBe('$734.77')
    expect(getCellValueText(footer, 'table_cell:impressions')).toBe('116,494')

    expect(patchByCellSuffix(footer, 'table_cell:spend', '$800.00', { decorate: false })).toBe(true)
    expect(patchByCellSuffix(footer, 'table_cell:impressions', '120,000', { decorate: false })).toBe(true)
    expect(
      patchByCellSuffix(
        footer,
        'table_cell:forAttributionWindow(cost_per_result,default)',
        '$18.00',
        { decorate: false }
      )
    ).toBe(true)

    expect(getCellValueText(footer, 'table_cell:spend')).toBe('$800.00')
    expect(getCellValueText(footer, 'table_cell:impressions')).toBe('120,000')
    expect(getCellValueText(footer, 'table_cell:forAttributionWindow(cost_per_result,default)')).toBe('$18.00')
    expect(footer.querySelector<HTMLElement>('span._3dfi')?.style.textDecoration).toBe('')
    expect(footer.querySelectorAll('.ellipsis._1ha4')[2].textContent?.trim()).toBe('总花费')
  })
})
