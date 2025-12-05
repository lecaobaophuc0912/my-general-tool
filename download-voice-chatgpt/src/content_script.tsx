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
            "accessToken"
          )
      );
      for (const script of scripts) {
        const text = script.textContent || "";
        if (text.includes("accessToken")) {
          const tokenPart = text.split(`"accessToken":`);
          if (tokenPart.length > 1) {
            // Lấy phần sau chuỗi đó, rồi tách tiếp theo \\" để lấy giá trị token
            let afterKey = tokenPart[1];
            // Xóa ký tự " đầu tiên của afterKey rồi gán lại chính nó
            if (afterKey.startsWith('"')) {
              afterKey = afterKey.substring(1);
            }

            afterKey = afterKey.split(`",`)[0];

            foundToken = afterKey;
          }
        }
      }
      console.log("foundToken", foundToken);
      sendResponse({ accessToken: foundToken || null });
    } catch (e) {
      sendResponse({ accessToken: null });
    }
    return true; // Để cho phép async sendResponse
  }
});
