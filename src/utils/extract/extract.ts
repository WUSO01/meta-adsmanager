import { Level, RowData } from "@/shares/types";
import { parseCurrency } from "..";

export default class Extract {
  public rowWrappers: NodeListOf<Element> = [] as unknown as any
  public element: Element | null = null
  public iderify: string = ''

  constructor() {
    this.init()
  }

  init() {
    this.rowWrappers = document.querySelectorAll('span[data-surface-wrapper="1"][data-surface*="table_row:"][data-surface$="unit"]');
  }

  /**
   * 提取广告系列数据
   */
  extractCampaignData() {
    const datas: RowData[] = []
    this.iderify = 'CAMPAIGN_GROUP'

    this.rowWrappers.forEach(element => {
      this.element = element
      const commonData = this.getCommonData('campaigns')
      if (commonData) {
        // 预算
        const budgetCell = this.extractCompoundValue(this.getCell('table_cell:forObjectType(budget,CAMPAIGN_GROUP)'))
        const budget = {
          value: parseCurrency(budgetCell.main),
          type: budgetCell.sub
        }
        datas.push({
          ...commonData,
          budget
        } as RowData)
      }
    })

    return {
      data: datas,
      domElements: Array.from(this.rowWrappers)
    }
  }

  /**
   * 提取广告组数据
   */
  extractAdsetData() {
    const datas: RowData[] = []
    this.iderify = 'CAMPAIGN'

    this.rowWrappers.forEach(element => {
      this.element = element
      const commonData = this.getCommonData('adsets')

      if (commonData) {
        datas.push(commonData as RowData)
      }

    })

    return {
      data: datas,
      domElements: Array.from(this.rowWrappers)
    }
  }

  /**
   * 提取广告数据
   */
  extractAds() {
    const datas: RowData[] = []
    this.iderify = 'ADGROUP'

    this.rowWrappers.forEach(element => {
      this.element = element
      const commonData = this.getCommonData('ads')

      if (commonData) {
        // 广告的名称需要重新抓取
        const nameCell = this.getCell('table_cell:forObjectType(name,ADGROUP)')
        const name = nameCell?.querySelector('ellipsis _13is')?.textContent.trim() || ''

        datas.push({
          ...commonData,
          name
        } as RowData)
      }

    })

    return {
      data: datas,
      domElements: Array.from(this.rowWrappers)
    }
  }

  /**
   * 提取包含主副两行文本的单元格（例如：成效的值和类型）
   */
  extractCompoundValue(cellElement: Element | null) {
    if (!cellElement) return { main: "", sub: "" };
    // 主文本通常在带有 geotextcolor="value" 的 div 中
    const mainEl = cellElement.querySelector('[geotextcolor="value"]');
    // 副文本通常带有特定的截断 class: ellipsis _1ha4
    const subEl = cellElement.querySelector('.ellipsis._1ha4');

    return {
      main: mainEl ? mainEl.textContent.trim() : "",
      sub: subEl ? subEl.textContent.trim() : ""
    };
  };

  getCell(surfaceSuffix: string) {
    return this.element!.querySelector(`span[data-surface$="${surfaceSuffix}"]`)
  }

  /**
   * 获取通用值
   */
  getCommonData(level: Level) {
    const obj: Partial<RowData> = {}
    const rowSurface = this.element?.getAttribute('data-surface');
    const idMatch = rowSurface?.match(/table_row:(\d+)unit/);

    if (!idMatch) return null

    obj.id = idMatch[1]
    obj.level = level

    // 获取状态
    const statusCell = this.getCell(`forObjectType(toggle,${this.iderify})`);
    if (!statusCell) {
      obj.status = '关闭'
    } else {
      const checkbox = statusCell.querySelector('input[type="checkbox"]');
      obj.status = (checkbox && checkbox.getAttribute('aria-checked') === 'true') ? "开启" : "关闭";
    }

    // 名称
    const nameCell = this.getCell(`table_cell:forObjectType(name,${this.iderify})`)
    if (!nameCell) {
      obj.name = ''
    } else {
      // 过滤掉旁边悬浮的编辑/对比图标，直接抓取 a 标签内的文本
      const nameLink = nameCell.querySelector('a');
      obj.name =  nameLink ? nameLink.textContent.trim() : '';
    }

    // 投放状态
    const deliveryCell = this.getCell(`table_cell:forObjectType(delivery,${this.iderify})`);
    obj.delivery = deliveryCell ? deliveryCell.textContent.trim() : ''

    // 操作
    const recCell = this.getCell('table_cell:recommendations_guidance')
    obj.recommendations = recCell ? recCell.textContent.trim() : ''

    // 成效
    const resultsData = this.extractCompoundValue(this.getCell('table_cell:forAttributionWindow(results,default)'))
    obj.results = {
      value: parseCurrency(resultsData.main),
      type: resultsData.sub
    }

    // 预算
    const budgetCell = this.getCell(`table_cell:forObjectType(budget,${this.iderify})`)
    obj.budget = budgetCell ? budgetCell.textContent.trim() : ''

    // 单次成效费用
    const cprData = this.extractCompoundValue(this.getCell('table_cell:forAttributionWindow(cost_per_result,default)'));
    obj.cost_per_result = { value: parseCurrency(cprData.main), type: cprData.sub };

    // 已花费金额
    const spendCell = this.getCell('table_cell:spend');
    const spendText = spendCell ? spendCell.textContent.trim() : '';
    obj.amount_spent = parseCurrency(spendText);

    // 展示次数
    const impressionsCell = this.getCell('table_cell:impressions');
    const impressionsText = impressionsCell ? impressionsCell.textContent.trim() : '';
    obj.impressions = parseCurrency(impressionsText)

    // 完成注册次数
    const complete_registration = this.getCell('table_cell:forAttributionWindow(actions:omni_complete_registration,default)')?.textContent?.trim() || ''
    obj.complete_registration = parseCurrency(complete_registration)

    // 单次注册费用
    const per_complete_registration = this.getCell('table_cell:forAttributionWindow(cost_per_action_type:omni_complete_registration,default)')?.textContent?.trim() || ''
    obj.per_complete_registration = parseCurrency(per_complete_registration)

    // 点击量（全部）
    const click = this.getCell('table_cell:clicks')?.textContent?.trim() || ''
    obj.click = parseCurrency(click)

    return obj
  }
}
