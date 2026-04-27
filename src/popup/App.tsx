import { Level } from '@/shares/types'
import { useAppStore } from '@/store/useAppStore'
import { Button, Input, message, Popconfirm, Spin, Switch } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { getLevelDataFromRows } from '@/utils'

export default function App() {
  const data = useAppStore(s => s.data)
  const edits = useAppStore(s => s.edits)
  const deleteTimeKey = useAppStore(s => s.deleteTimeKey)
  const syncEnabled = useAppStore(s => s.syncEnabled)
  const setSyncEnabled = useAppStore(s => s.setSyncEnabled)
  const [spinning, setSpinning] = useState(false)

  const [verified, setVerified] = useState<boolean | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'CHECK_VERIFY' }, (res) => {
      if (res?.type === 'CHECK_VERIFY_RESULT') {
        setVerified(res.verified)
      }
    })
  }, [])

  const handleVerify = () => {
    if (!codeInput.trim()) {
      message.warning('请输入验证码')
      return
    }
    setVerifyLoading(true)
    chrome.runtime.sendMessage(
      { type: 'SUBMIT_VERIFY', code: codeInput.trim().toUpperCase() },
      (res) => {
        setVerifyLoading(false)
        if (res?.type === 'SUBMIT_VERIFY_RESULT') {
          if (res.success) {
            message.success(res.message)
            setVerified(true)
          } else {
            message.error(res.message)
          }
        }
      }
    )
  }

  const buttons = [
    { level: 'campaigns', label: '抓取广告系列' },
    { level: 'adsets', label: '抓取广告组' },
    { level: 'ads', label: '抓取广告' },
  ]

  /**
   * 抓取数据 
   */
  const handleScrape = async (level: Level) => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.url || !tab.id) {
        message.warning('请在 Meta 广告管理器页面使用')
        return;
      }

      const { pathname, searchParams } = new URL(tab.url)

      if (!pathname.endsWith(level)) {
        message.warning('请切换到对应的选项卡再抓取')
        return
      }

      setSpinning(true)

      const act = searchParams.get('act') || ''

      const dateParam = searchParams.get('date')
      let time: string = 'all'

      if (dateParam) {
        // 值分为两种： 2026-03-15_2026-03-16 和 2026-03-15_2026-03-16,xxxx
        const [date, preset] = dateParam?.split(',')
        // 存在预设值，比如在广告页面时期下拉框选择过去七天，过去一周等
        if (preset) {
          time = 'all'
        } else {
          // 广告页日期下拉选择固定时间，会将后面一天也带上
          // eg: 选择查看2026-03-15号，地址栏的日期为：2026-03-15_2026-03-16
          time = date.split('_')[0]
        }
      }
      const statsKey = `${time}__${act}__${level}`
      await chrome.tabs.sendMessage(tab.id, {
        type: 'START_SCRAPING',
        level,
        time,
        act,
        statsKey,
      });
    } catch (_) {
      message.error('抓取失败')
    } finally {
      setSpinning(false)
    }
  }

  /**
   * 新窗口打开
   */
  const handleOpen = () => {
    chrome.windows.create({
      url: chrome.runtime.getURL("src/sidepanel/index.html"),
      type: "popup",
      width: 1400,
      height: 900
    });
  }

  // 按时间分组，统计每个时间段各层级的数量，并标记高亮状态
  // 优先级：编辑过 > 抓取过
  const timeStats = useMemo(() => {
    return Object.entries(data)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([timeKey, dateMap]) => {
        const hasEdits = !!(edits[timeKey] && Object.keys(edits[timeKey]).length > 0)
        const hasData = Object.keys(dateMap).length > 0
        const highlight: 'edited' | 'scraped' | 'none' =
          hasEdits ? 'edited' : hasData ? 'scraped' : 'none'
        return {
          timeKey,
          campaigns: getLevelDataFromRows(dateMap, 'campaigns').length,
          adsets: getLevelDataFromRows(dateMap, 'adsets').length,
          ads: getLevelDataFromRows(dateMap, 'ads').length,
          highlight,
        }
      })
  }, [data, edits])

  if (verified === null) {
    return (
      <div className="flex items-center justify-center w-[380px] h-[200px]">
        <Spin />
      </div>
    )
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 w-[380px]">
        <div className="min-h-screen bg-white shadow-lg ring-1 ring-slate-200">
          <div className="px-5 pb-4 pt-5">
            <h1 className="text-2xl font-bold text-slate-900">Facebook 广告管理</h1>
            <p className="mt-1 text-sm text-slate-500">请输入验证码以继续使用</p>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">验证码有效期为 15 天</p>
              <Input
                placeholder="请输入验证码"
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                onPressEnter={handleVerify}
                className="!w-60 text-center !text-lg tracking-widest"
                maxLength={6}
                autoFocus
              />
              <Button
                type="primary"
                loading={verifyLoading}
                onClick={handleVerify}
                className="w-60"
              >
                验证
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Spin spinning={spinning}>
      <div className="min-h-screen bg-slate-50 text-slate-900 w-[380px]">
        <div className="min-h-screen bg-white shadow-lg ring-1 ring-slate-200">
          <div className="px-5 pb-4 pt-5">
            <h1 className="text-2xl font-bold text-slate-900">Facebook 广告管理</h1>
            <p className="mt-1 text-sm text-slate-500">自定义你的广告数据</p>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
              <div>
                <span className="text-sm font-medium text-slate-700">同步到页面</span>
                <p className="text-xs text-slate-400">{syncEnabled ? '编辑数据将实时同步到广告页面' : '已暂停同步，页面显示原始数据'}</p>
              </div>
              <Switch
                checked={syncEnabled}
                onChange={setSyncEnabled}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </div>

            <div className="mt-4 p-[10px] flex justify-around rounded-xl bg-slate-100 p-1">
              {buttons.map(item => (
                <Button
                  key={item.level}
                  type="primary"
                  onClick={() => handleScrape(item.level as Level)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">已获取的数据</h2>
                <Button
                  size="small"
                  type="link"
                  onClick={handleOpen}
                >
                  数据管理
                </Button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {/* 上次获取数据时间: <span className="font-semibold text-slate-900">{dayjs(lastUpdated).format('YYYY/MM/DD HH:mm')}</span> */}
              </p>
              {/* <p className="mt-1 text-sm text-slate-500">
              上次修改数据时间: <span className="font-semibold text-slate-900">Mar 15, 2026</span>
            </p> */}
            </div>

            <div className="mt-4 space-y-2">
              {timeStats.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">暂无数据</p>
              ) : (
                timeStats.map(({ timeKey, campaigns, adsets, ads, highlight }) => (
                  <div
                    key={timeKey}
                    className={[
                      'rounded-xl border px-4 py-3',
                      highlight === 'edited'
                        ? 'border-red-300 bg-red-50'
                        : highlight === 'scraped'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-100 bg-slate-50',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xs font-semibold text-slate-400">{timeKey}</div>
                      {highlight === 'edited' && (
                        <span className="text-[10px] font-semibold text-red-500 bg-red-100 rounded px-1 py-0.5">已编辑</span>
                      )}
                      {highlight === 'scraped' && (
                        <span className="text-[10px] font-semibold text-blue-500 bg-blue-100 rounded px-1 py-0.5">已抓取</span>
                      )}
                      <Popconfirm
                        title="删除该日期数据"
                        description="将同时删除抓取数据及编辑数据，无法恢复，确认删除？"
                        okText="删除"
                        okButtonProps={{ danger: true }}
                        cancelText="取消"
                        onConfirm={() => deleteTimeKey(timeKey)}
                      >
                        <Button
                          size="small"
                          type="text"
                          danger
                          className="ml-auto !text-[10px] !h-5 !px-1"
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex-1 text-center rounded-lg bg-orange-500 text-white text-xs py-1">
                        <div className="font-bold text-sm">{campaigns}</div>
                        <div>广告系列</div>
                      </span>
                      <span className="flex-1 text-center rounded-lg bg-emerald-500 text-white text-xs py-1">
                        <div className="font-bold text-sm">{adsets}</div>
                        <div>广告组</div>
                      </span>
                      <span className="flex-1 text-center rounded-lg bg-rose-500 text-white text-xs py-1">
                        <div className="font-bold text-sm">{ads}</div>
                        <div>广告</div>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Spin>
  )
}
