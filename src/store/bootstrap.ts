import { hydrateStore, subscribeStorage } from "./sync";

let inited = false;

export async function initStore() {
  if (inited) return;

  await hydrateStore();
  subscribeStorage();

  inited = true;
}
