import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { storage } from "@/utils/storeage";
import { DateRange, EditItem, RowData } from "@/shares/types";
import { SCRAPE_STATS_KEY } from "@/shares/constants";

/** 嵌套存储结构：{ [timeKey]: { [adId]: RowData } } */
export type NestedData = Record<string, Record<string, RowData>>

interface AppState {
  data: NestedData;
  edits: EditItem;
  range?: DateRange
  acts: string[]
  selectedAct?: string

  setData: (data: Record<string, RowData>) => void;
  /**
   * 修改数据
   * @param id 
   * @param date 时间
   * @param patch 要更改的数据
   * @returns 
   */
  updateEdit: (id: string, date: string, patch: Partial<RowData>) => Promise<void>;
  setRange: (range?: DateRange) => void;
  setActs: (acts: string[]) => void;
  setSelectedAct: (act?: string) => void;
  /** 清除全部缓存数据（data） */
  clearCache: () => Promise<void>;
  /** 撤销全部修改（edits） */
  resetAllEdits: () => Promise<void>;
  /** 删除某个 timeKey 的数据（data + edits） */
  deleteTimeKey: (timeKey: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    immer((set) => ({
      data: {},
      edits: {},
      history: [],
      acts: [],
      selectedAct: undefined,

      setData: (data) => {
        set((state) => {
          state.data = {
            ...state.data,
            ...data,
          };
        });

        // 同步 storage（merge）
        storage.merge("data", data);
      },

      setRange: (date) => {
        set(state => {
          state.range = date
        })
      },

      setActs: (acts) => {
        set((state) => {
          state.acts = acts
          if (state.selectedAct && !acts.includes(state.selectedAct)) {
            state.selectedAct = undefined
          }
        })
      },

      setSelectedAct: (act) => {
        set((state) => {
          state.selectedAct = act
        })
      },

      updateEdit: async (id, date, patch) => {

        set((state) => {
          if (!state.edits?.[date]) {
            state.edits[date] = {}
          }

          state.edits[date][id] = {
            ...((state.edits[date][id] || {}) as any),
            ...patch,
          };

        });

        // 精准同步
        await storage.deepMerge("edits", {
          [date]: {
            [id]: patch,
          }
        });

      },

      clearCache: async () => {
        set((state) => {
          state.data = {};
        });
        await storage.set("data", {});
        await storage.set("edits", {});
        await storage.set("acts", []);
        await storage.set(SCRAPE_STATS_KEY, {});
      },

      resetAllEdits: async () => {
        set((state) => {
          state.edits = {};
        });
        await storage.set("edits", {});
      },

      deleteTimeKey: async (timeKey) => {
        set((state) => {
          delete state.data[timeKey];
          if (state.edits[timeKey]) {
            delete state.edits[timeKey];
          }
        });

        const [data, edits, pageStats] = await Promise.all([
          storage.get<NestedData>("data"),
          storage.get<EditItem>("edits"),
          storage.get<Record<string, unknown>>(SCRAPE_STATS_KEY),
        ]);

        if (data) delete data[timeKey];
        if (edits && edits[timeKey]) delete edits[timeKey];

        const nextPageStats = { ...(pageStats || {}) }
        Object.keys(nextPageStats).forEach((k) => {
          if (k.startsWith(`${timeKey}__`)) {
            delete nextPageStats[k]
          }
        })

        await Promise.all([
          storage.set("data", data ?? {}),
          storage.set("edits", edits ?? {}),
          storage.set(SCRAPE_STATS_KEY, nextPageStats),
        ]);
      },
    }))
  )
);