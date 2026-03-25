import { NestedData } from "./useAppStore";
import { useAppStore } from "./useAppStore";
import { EDIT_KEY, SCRAPE_STOREAGE_KEY, ACT_KEY } from "@/shares/constants";

let isHydrating = false; // 防止循环更新

const storageKey = [SCRAPE_STOREAGE_KEY, EDIT_KEY, ACT_KEY]

/**
 * 初始化时同步storeage中的数据到store中
 */
export async function hydrateStore() {
  isHydrating = true;

  return new Promise<void>((resolve) => {
    chrome.storage.local.get(storageKey,
      (res: any) => {
        const acts = (res[ACT_KEY] || []) as string[]

        useAppStore.setState((state) => ({
          data: (res.data || {}) as NestedData,
          edits: res.edits || {},
          acts,
          selectedAct: state.selectedAct && acts.includes(state.selectedAct) ? state.selectedAct : undefined,
        }));

        isHydrating = false;
        resolve();
      }
    );
  });
}

/**
 * 监听storeage的变化
 */
export function subscribeStorage() {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || isHydrating) return;

    if (changes.data) {
      useAppStore.setState({
        data: (changes.data.newValue || {}) as NestedData,
      });
    }

    if (changes.edits) {
      useAppStore.setState({
        edits: changes.edits.newValue || {} as any,
      });
    }


    if (changes[ACT_KEY]) {
      const acts = (changes[ACT_KEY].newValue || []) as string[]
      useAppStore.setState((state) => ({
        acts,
        selectedAct: state.selectedAct && acts.includes(state.selectedAct) ? state.selectedAct : undefined,
      }))
    }
  });
}