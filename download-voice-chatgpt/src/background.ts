const SELECTED_VOICE_KEY = 'selectedVoice';
const ACCESS_TOKEN_KEY = 'accessToken';



var activeTab: chrome.tabs.TabActiveInfo;

chrome.runtime.onInstalled.addListener(() => {
  // Tạo context menu tùy chỉnh
  // chrome.contextMenus.create({
  //   id: "getMessage",
  //   title: "Get Message", // Tiêu đề trong menu chuột phải
  //   contexts: ["all"], // Áp dụng cho mọi phần tử
  // } as any);

  chrome.contextMenus.create({
    id: "downloadVoice",
    title: "Download Voice", // Tiêu đề trong menu chuột phải
    contexts: ["all"], // Áp dụng cho mọi phần tử
  } as any);
});

chrome.tabs.onActivated.addListener(function (tab) {
  activeTab = tab;
  console.debug(activeTab);
});

// Lắng nghe khi người dùng chọn item trong context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // browser.browserAction.openPopup();
  switch (info.menuItemId) {
    case 'getMessage':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {

        chrome.tabs.create({
          url: 'popup.html', // Path to your popup HTML file
        }, (tab) => {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: handleSetMessage,
          } as any);
        });


      });
      break;

    case 'downloadVoice':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const token = chrome.storage.local.get(ACCESS_TOKEN_KEY, (result) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0]?.id || activeTab.tabId },
            function: handleDownloadVoice,
            args: [{
              tabId: tabs[0]?.id || activeTab.tabId,
            }]
          } as any, () => {

          });
        });
      });
      break;

    default:
      break;
  }
});

function handleDownloadVoice(data: { tabId: string, resetBadgeAndTitle: () => void }) {
  chrome.runtime.sendMessage({ action: "startLoading" });
  const getV4Id = (url: string): string | undefined => {
    const match = url.match(/\/c\/([\w-]+)$/);
    return match ? match[1] : undefined;
  };
  const downloadFile = (token: string, conversationId: string, messageId: string, voice: string, documentInject?: any) => {
    let document = documentInject || window.document;

    return new Promise((resolve, reject) => {
      if (!token || !conversationId || !messageId) {
        alert('Please enter access token, conversation id and message id');
        reject();
        return;
      }
      token =
        `Bearer ${token}`;
      let anchor = document.createElement("a");
      document.body.appendChild(anchor);
      let file = `https://chatgpt.com/backend-api/synthesize?message_id=${messageId}&conversation_id=${conversationId}&voice=${voice}&format=aac`;

      let headers = new Headers();
      headers.append("Authorization", token);

      fetch(file, { headers })
        .then((response) => response.blob())
        .then((blobby) => {
          let objectUrl = window.URL.createObjectURL(blobby);

          anchor.href = objectUrl;
          anchor.download = `${voice}-${new Date().getTime()}.mp3`;
          anchor.click();

          window.URL.revokeObjectURL(objectUrl);
          resolve(true);
        }).catch((err) => {
          reject(err);
        });
    });
  }

  const selectedElement = window.document?.getSelection()?.focusNode?.parentElement; // Lấy phần tử hiện tại được focus (hoặc có thể dùng cách khác để lấy phần tử mục tiêu)
  const elementId = selectedElement?.id || "No ID"; // Lấy ID của phần tử
  // Gửi ID phần tử này tới popup của extension
  const parentDiv = selectedElement?.closest('[data-message-id]');
  let elementMessageId: any = null;
  if (parentDiv) {
    // Lấy giá trị của data-message-id
    elementMessageId = parentDiv.getAttribute('data-message-id');
  }
  const conversationId = getV4Id(window.location.href);
  chrome.storage.local.get(['accessToken', 'selectedVoice'], (result) => {
    downloadFile(result['accessToken'], conversationId || '', elementMessageId || '', result['selectedVoice'], window.document).then(() => {
      console.log('success');
      chrome.runtime.sendMessage({ action: "stopLoading" });
    }).catch((err: any) => {
      console.error('error', err);
      chrome.runtime.sendMessage({ action: "stopLoading" });
    });
  });

}



function handleSetMessage() {
  const selectedElement = document?.getSelection()?.focusNode?.parentElement; // Lấy phần tử hiện tại được focus (hoặc có thể dùng cách khác để lấy phần tử mục tiêu)
  const elementId = selectedElement?.id || "No ID"; // Lấy ID của phần tử
  // Gửi ID phần tử này tới popup của extension
  const parentDiv = selectedElement?.closest('[data-message-id]');
  let elementMessageId: any = null;
  const getV4Id = (url: string): string | undefined => {
    const match = url.match(/\/c\/([\w-]+)$/);
    return match ? match[1] : undefined;
  };
  const conversationId = getV4Id(window.location.href);

  if (parentDiv) {
    // Lấy giá trị của data-message-id
    elementMessageId = parentDiv.getAttribute('data-message-id');
  }
  chrome.runtime.sendMessage({ action: "setMessageId", id: elementMessageId, conversationId: conversationId });  // Nếu không tìm thấy phần tử cha có data-message-id

}


var activeTabId: number;

chrome.tabs.onActivated.addListener(function (activeInfo) {
  activeTabId = activeInfo.tabId;
});

function getActiveTab(callback: (tabId: chrome.tabs.Tab) => void) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var tab = tabs[0];

    if (tab) {
      callback(tab);
    } else {
      chrome.tabs.get(activeTabId, function (tab) {
        if (tab) {
          callback(tab);
        } else {
          console.log('No active tab identified.');
        }
      });

    }
  });

}

let loadingInterval: any = null; // Giữ trạng thái của loading interval

// Hiển thị trạng thái loading
function startLoading() {
  const states = ["", ".", "..", "..."]; // Trạng thái của badge
  let currentIndex = 0;

  chrome.action.setBadgeBackgroundColor({ color: "#fcf22b" }); // Màu xanh dương
  chrome.action.setTitle({ title: "Loading data..." }); // Tooltip loading

  // Tạo hiệu ứng badge animation
  loadingInterval = setInterval(() => {
    chrome.action.setBadgeText({ text: states[currentIndex] }); // Cập nhật dấu chấm
    currentIndex = (currentIndex + 1) % states.length; // Quay vòng trạng thái
  }, 500); // Cập nhật mỗi 500ms
}

// Kết thúc loading
function stopLoading() {
  if (loadingInterval) {
    clearInterval(loadingInterval); // Dừng vòng lặp
    loadingInterval = null;
  }
  chrome.action.setBadgeText({ text: "" }); // Xóa badge
  chrome.action.setTitle({ title: "Extension Ready" }); // Reset tiêu đề
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startLoading") {
    startLoading();
    sendResponse({ status: "Loading started" });
  } else if (message.action === "stopLoading") {
    stopLoading();
    sendResponse({ status: "Loading stopped" });
  }
});

