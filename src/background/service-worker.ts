import { handleMessage } from "./message";
import { Message } from "@/shares/types";

chrome.runtime.onMessage.addListener((request: Message, _sender, sendResponse) => {
  // 调用异步处理，必须同步返回 true 以保持消息通道开启，等待 sendResponse
  handleMessage(request, sendResponse);
  return true;
});

chrome.tabs.onUpdated.addListener(async (tabId, _, tab) => {
  if (!tab.url) return

  const url = new URL(tab.url);

  if (url.origin === 'https://adsmanager.facebook.com') {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'src/sidepanel/index.html',
      enabled: true
    });
  } else {
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});
