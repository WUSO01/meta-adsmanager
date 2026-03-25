import { deepMerge } from "./merge";

/*
 * 封装chrome.storage的方法
 */
export const storage = {
  async get<T>(key: string): Promise<T> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (res: Record<string, T>) => {
        resolve(res[key]);
      });
    });
  },

  async set<T>(key: string, value: T) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  },

  async merge<T>(key: string, patch: Partial<T>) {
    const oldData = await this.get<T>(key);

    const merged = {
      ...oldData,
      ...patch,
    };

    await this.set(key, merged);
  },

  async deepMerge<T>(key: string, patch: Partial<T>) {
    const oldData = await this.get<T>(key);

    const merged = deepMerge(oldData || {}, patch);

    await this.set(key, merged);
  },

  async append<T>(key: string, item: T) {
    const old = await this.get<T[]>(key);

    await this.set(key, [...(old || []), item]);
  },
};

