import { useAppStore } from "@/store/useAppStore"
import { useMemo } from "react"

/**
 * 存在修改项的日期 
 */
export const useEditedDates = () => {
  const edits = useAppStore(s => s.edits)

  const list = useMemo(() => {
    return Object.keys(edits).filter(item => item !== 'all')
  }, [edits])

  return list
}

/**
 * 已抓取数据的日期
 */
export const useFetchedDates = () => {
  const data = useAppStore(s => s.data)

  const list = useMemo(() => {
    return Object.keys(data)
  }, [data])

  return list
}
