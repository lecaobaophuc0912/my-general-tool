chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "extractAccessToken") {
    try {
      let foundToken = "";
      const scripts = Array.from(
        document.getElementsByTagName("script")
      ).filter(
        (script) =>
          script.textContent &&
          script.textContent.includes(
            "window.__reactRouterContext.streamController.enqueue"
          )
      );
      for (const script of scripts) {
        const text = script.textContent || "";
        if (text.includes("accessToken")) {
          // Tìm vị trí xuất hiện đầu tiên của chuỗi \"accessToken\",
          const tokenPart = text.split('\\"accessToken\\",');
          if (tokenPart.length > 1) {
            // Lấy phần sau chuỗi đó, rồi tách tiếp theo \\" để lấy giá trị token
            const afterKey = tokenPart[1];
            const tokenSplit = afterKey.split('\\"');
            if (tokenSplit.length > 1) {
              foundToken = tokenSplit[1];
            }
          }
        }
      }
      sendResponse({ accessToken: foundToken || null });
    } catch (e) {
      sendResponse({ accessToken: null });
    }
    return true; // Để cho phép async sendResponse
  }
});
