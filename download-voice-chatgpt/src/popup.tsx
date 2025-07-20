import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import "./popup.css";

// Arbor - Easygoing and versatile

// Breeze - Animated and earnest

// Cove - Composed and direct

// Ember - Confident and optimistic

// Juniper - Open and upbeat

// Maple - Cheerful and candid

// Sol - Savvy and relaxed

// Spruce - Calm and affirming

// Vale - Bright and inquisitive

// Shimmer - Optional

const listVoices = [
  {
    name: "Breeze (Nữ)",
    value: "breeze",
    available: true,
  },
  {
    name: "Cove (Nam)",
    value: "cove",
    available: true,
  },
  {
    name: "Ember (Nam)",
    value: "ember",
    available: true,
  },
  {
    name: "Juniper (Nữ)",
    value: "juniper",
    available: true,
  },
  {
    name: "Maple (Nữ)",
    value: "maple",
    available: true,
  },
  {
    name: "Shimmer (Nữ)",
    value: "shimmer",
    available: true,
  },
  {
    name: "Sol (Not Work)",
    value: "sol",
    available: true,
  },
  {
    name: "Spruce (Not Work)",
    value: "spruce",
    available: true,
  },
  {
    name: "Vale (Nữ)",
    value: "vale",
    available: true,
  },
  {
    name: "Orbit (Nam)",
    value: "orbit",
    available: true,
  },
  {
    name: "Arbor (Not Work)",
    value: "arbor",
    available: true,
  },
  {
    name: "Fable (Not Work)",
    value: "fable",
    available: true,
  },
  {
    name: "Nova (Not Work)",
    value: "nova",
    available: true,
  },
  {
    name: "Echo (Not Work)",
    value: "echo",
    available: true,
  },
  {
    name: "Ridge (Nam)",
    value: "ridge",
    available: true,
  },
  {
    name: "Reef (Nam)",
    value: "reef",
    available: true,
  },
  {
    name: "Rainbow (Not Work)",
    value: "rainbow",
    available: true,
  },
  {
    name: "Harp (Nữ)",
    value: "harp",
    available: true,
  },
  {
    name: "Glimmer (Nữ)",
    value: "glimmer",
    available: true,
  },
  {
    name: "Fathom (Nam)",
    value: "fathom",
    available: true,
  },
];

const SELECTED_VOICE_KEY = "selectedVoice";
const ACCESS_TOKEN_KEY = "accessToken";

const downloadFile = (
  token: string,
  conversationId: string,
  messageId: string,
  voice: string,
  documentInject?: any
) => {
  let document = documentInject || window.document;

  return new Promise((resolve, reject) => {
    if (!token || !conversationId || !messageId) {
      alert("Please enter access token, conversation id and message id");
      return;
    }
    token = `Bearer ${token}`;
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
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [currentMessageId, setCurrentMessageId] = useState<string>();
  const [selectVoice, setSelectVoice] = useState<string>("");
  const [isShowAddToken, setIsShowAddToken] = useState<boolean>(false);
  const [currentToken, setCurrentToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case "setMessageId":
          chrome.storage.local.get(
            [SELECTED_VOICE_KEY, ACCESS_TOKEN_KEY],
            (result) => {
              setCurrentMessageId(message.id);
              setCurrentConversationId(message.conversationId);
              setSelectVoice(result[SELECTED_VOICE_KEY] || "breeze");
              setCurrentToken(result[ACCESS_TOKEN_KEY] || "");
            }
          );

          break;
        case "onDownloadVoiceAction":
          chrome.storage.local.get(
            [SELECTED_VOICE_KEY, ACCESS_TOKEN_KEY],
            (result) => {
              setIsLoading(true);
              setSelectVoice(result[SELECTED_VOICE_KEY] || "breeze");
              setCurrentToken(result[ACCESS_TOKEN_KEY] || "");
              setCurrentConversationId(message?.conversationId);
              downloadFile(
                result[ACCESS_TOKEN_KEY],
                message.conversationId || "",
                message.id || "",
                result[SELECTED_VOICE_KEY]
              )
                .then(() => {
                  setIsLoading(false);
                })
                .catch((err) => {
                  setIsLoading(false);
                });
            }
          );
        default:
          break;
      }
    });
  }, [count]);
  const getV4Id = (url: string): string | undefined => {
    const match = url.match(/\/c\/([\w-]+)$/);
    return match ? match[1] : undefined;
  };
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0]?.url;
      const conversationId = url ? getV4Id(url) : undefined;
      setCurrentConversationId(conversationId);
    });

    chrome.storage.local.get([SELECTED_VOICE_KEY], (result) => {
      setSelectVoice(result[SELECTED_VOICE_KEY] || "breeze");
      chrome.storage.local.set({
        [SELECTED_VOICE_KEY]: result[SELECTED_VOICE_KEY] || "breeze",
      });
    });
    chrome.storage.local.get([ACCESS_TOKEN_KEY], (result) => {
      setCurrentToken(result[ACCESS_TOKEN_KEY] || "");
      chrome.storage.local.set({
        [ACCESS_TOKEN_KEY]: result[ACCESS_TOKEN_KEY] || "",
      });
    });
  }, []);

  const handleSelectVoice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectVoice(event.target.value);
    chrome.storage.local.set({ [SELECTED_VOICE_KEY]: event.target.value });
  };

  const handleChangeToken = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentToken(event.target.value);
    chrome.storage.local.set({ [ACCESS_TOKEN_KEY]: event.target.value });
  };

  const handleClickDownload = useCallback(async () => {
    if (!currentToken || !currentConversationId || !currentMessageId) {
      alert("Please enter access token, conversation id and message id");
      return;
    }
    setIsLoading(true);
    try {
      await downloadFile(
        currentToken,
        currentConversationId || "",
        currentMessageId || "",
        selectVoice
      );
    } catch (error) {}
    setIsLoading(false);
  }, [
    isShowAddToken,
    currentToken,
    currentConversationId,
    currentMessageId,
    selectVoice,
  ]);

  return (
    <>
      <div className="popup-container">
        {isLoading ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255,255,255,0.7)",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
            }}
          >
            <div className="popup-spinner" />
            <p style={{ marginTop: 12 }}>Đang tải...</p>
          </div>
        ) : null}
        <h2>Tải xuống giọng nói</h2>
        {isShowAddToken ? (
          <div>
            <label className="popup-label" htmlFor="access-token">
              Access Token:
            </label>
            <textarea
              id="access-token"
              rows={4}
              className="popup-input"
              placeholder="Nhập access token"
              value={currentToken}
              onChange={(evt) => handleChangeToken(evt as any)}
            ></textarea>
          </div>
        ) : (
          <>
            <label className="popup-label">Cuộc hội thoại hiện tại:</label>
            <div style={{ marginBottom: 12, color: "#555", fontSize: 14 }}>
              {currentConversationId || "Không có"}
            </div>
            <label className="popup-label" htmlFor="messageId">
              Message hiện tại:
            </label>
            <div className="popup-btn-row" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="popup-input"
                id="messageId"
                placeholder="Nhập message id"
                value={currentMessageId || ""}
                onChange={(evt) => setCurrentMessageId(evt.target.value)}
                style={{ marginBottom: 0 }}
              />
              <button
                className="popup-btn"
                style={{ width: 90, background: "#e53935" }}
                onClick={() => setCurrentMessageId("")}
                type="button"
              >
                Xóa
              </button>
            </div>
            <label className="popup-label" htmlFor="voice">
              Chọn giọng đọc:
            </label>
            <select
              className="popup-select"
              id="voice"
              value={selectVoice}
              onChange={handleSelectVoice}
            >
              {listVoices
                .filter((voice) => voice.available)
                .map((voice) => (
                  <option key={voice.value} value={voice.value}>
                    {voice.name}
                  </option>
                ))}
            </select>
          </>
        )}
        <div className="popup-btn-row">
          {!isShowAddToken ? (
            <button
              className="popup-btn"
              onClick={() => handleClickDownload()}
              type="button"
            >
              Tải xuống
            </button>
          ) : null}
          <button
            className="popup-btn"
            style={{ background: isShowAddToken ? "#757575" : "#43a047" }}
            onClick={() => setIsShowAddToken(!isShowAddToken)}
            type="button"
          >
            {isShowAddToken ? "Ẩn thêm token" : "Hiện thêm token"}
          </button>
          {isShowAddToken && (
            <button
              className="popup-btn"
              style={{ background: "#1976d2" }}
              onClick={async () => {
                // Gửi message sang content script để lấy token
                setIsLoading(true);
                chrome.tabs.query(
                  { active: true, currentWindow: true },
                  (tabs) => {
                    if (tabs[0]?.id) {
                      console.log("tabs[0].id", tabs[0].id);
                      chrome.tabs.sendMessage(
                        tabs[0].id,
                        { action: "extractAccessToken" },
                        (response) => {
                          setIsLoading(false);
                          if (response && response.accessToken) {
                            setCurrentToken(response.accessToken);
                            // Fill vào textarea nếu có
                            const textarea = document.getElementById(
                              "access-token"
                            ) as HTMLTextAreaElement;
                            if (textarea) textarea.value = response.accessToken;
                            chrome.storage.local.set({
                              [ACCESS_TOKEN_KEY]: response.accessToken,
                            });
                          } else {
                            alert("Không tìm thấy accessToken trên trang!");
                          }
                        }
                      );
                    } else {
                      setIsLoading(false);
                    }
                  }
                );
              }}
              type="button"
            >
              Tự động lấy token
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
