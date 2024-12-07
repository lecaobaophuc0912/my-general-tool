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
    name: "Breeze",
    value: "breeze",
    available: true,
  },
  {
    name: "Cove",
    value: "cove",
    available: true,
  },
  {
    name: "Ember",
    value: "ember",
    available: true,
  },
  {
    name: "Juniper",
    value: "juniper",
    available: true,
  },
  {
    name: "Maple",
    value: "maple",
    available: true,
  },
  {
    name: "Shimmer",
    value: "shimmer",
    available: true,
  },
  {
    name: "Sol (No sure)",
    value: "sol",
    available: true,
  },
  {
    name: "Spruce (No sure)",
    value: "spruce",
    available: true,
  },
  {
    name: "Vale (No sure)",
    value: "vale",
    available: true,
  },
  {
    name: "Arbor (No sure)",
    value: "arbor",
    available: true,
  },
]

const SELECTED_VOICE_KEY = 'selectedVoice';
const ACCESS_TOKEN_KEY = 'accessToken';

const downloadFile = (token: string, conversationId: string, messageId: string, voice: string, documentInject?: any) => {
  let document = documentInject || window.document;

  return new Promise((resolve, reject) => {
    if (!token || !conversationId || !messageId) {
      alert('Please enter access token, conversation id and message id');
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

const Popup = () => {
  const [count, setCount] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>();
  const [currentConversationId, setCurrentConversationId] = useState<string>();
  const [currentMessageId, setCurrentMessageId] = useState<string>();
  const [selectVoice, setSelectVoice] = useState<string>("");
  const [isShowAddToken, setIsShowAddToken] = useState<boolean>(false);
  const [currentToken, setCurrentToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);



  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'setMessageId':
          chrome.storage.local.get([SELECTED_VOICE_KEY, ACCESS_TOKEN_KEY], (result) => {
            setCurrentMessageId(message.id);
            setCurrentConversationId(message.conversationId);
            setSelectVoice(result[SELECTED_VOICE_KEY] || 'breeze');
            setCurrentToken(result[ACCESS_TOKEN_KEY] || '');
          });

          break;
        case 'onDownloadVoiceAction':
          chrome.storage.local.get([SELECTED_VOICE_KEY, ACCESS_TOKEN_KEY], (result) => {
            setIsLoading(true);
            setSelectVoice(result[SELECTED_VOICE_KEY] || 'breeze');
            setCurrentToken(result[ACCESS_TOKEN_KEY] || '');
            setCurrentConversationId(message?.conversationId);
            downloadFile(result[ACCESS_TOKEN_KEY], message.conversationId || '', message.id || '', result[SELECTED_VOICE_KEY]).then(() => {
              setIsLoading(false);
            }).catch((err) => {
              setIsLoading(false);
            });
          });
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
      setSelectVoice(result[SELECTED_VOICE_KEY] || 'breeze');
      chrome.storage.local.set({ [SELECTED_VOICE_KEY]: result[SELECTED_VOICE_KEY] || 'breeze' });
    });
    chrome.storage.local.get([ACCESS_TOKEN_KEY], (result) => {
      setCurrentToken(result[ACCESS_TOKEN_KEY] || '');
      chrome.storage.local.set({ [ACCESS_TOKEN_KEY]: result[ACCESS_TOKEN_KEY] || '' });
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
    setIsLoading(true);
    try {
      await downloadFile(currentToken, currentConversationId || '', currentMessageId || '', selectVoice);
    } catch (error) {
    }
    setIsLoading(false);


  }, [isShowAddToken, currentToken, currentConversationId, currentMessageId, selectVoice]);

  return (
    <>
      <div className="px-2 d-flex flex-column justify-content-between align-items-center" style={{
        width: "100vw",
        height: "100vh",
      }}>
        {isLoading ? <div
          className="loading-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent background
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div className="spinner" style={{ textAlign: "center" }}>
            {/* Spinner Animation */}
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "6px solid #f3f3f3",
                borderTop: "6px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p style={{ color: "#fff", marginTop: "10px", fontSize: "16px" }}>
              Loading...
            </p>
          </div>
        </div> : null}

        {isShowAddToken ?
          <div className="w-full">
            <h3 className="w-full" style={{
              textAlign: 'center'
            }}>Add Token</h3>


            <div className="px-2 mt-2 w-full">
              <span className="mr-1 fs-6  bold">Access Token:</span>
              <div className="d-flex" style={{
                width: "90%",
              }}>
                <textarea rows={10} className="mr-2 flex-1 w-full" placeholder="Enter access token" value={currentToken} onChange={(evt) => {
                  handleChangeToken(evt as any);
                }}></textarea>
              </div>

            </div>
          </div>
          : <div className="w-full">
            <h3 className="w-full" style={{
              textAlign: 'center'
            }}>Download Voice</h3>

            <div className="px-2">
              <div className="mr-1 fs-6 bold">Current conversation:</div>
              <div className="italic fs-7" style={{
                color: "blue",
              }}>{currentConversationId}</div>

            </div>

            <div className="px-2 mt-2 w-full">
              <div className="mr-1 fs-6  bold">Current Message:</div>
              {currentMessageId ? <div>
                <div className="italic fs-7 w-80" style={{
                  color: "violet",
                }}>{currentMessageId}</div>
              </div>
                : <div className="d-flex w-full">
                  <input type="text" style={{
                    width: "70%",
                  }} className="mr-2 flex-1" placeholder="Enter message id" onChange={(evt) => {
                    handleSelectVoice(evt as any);
                  }} />
                  <button onClick={() => {
                    setCurrentMessageId('');
                  }}>Clear</button>
                </div>}

            </div>

            <div className="px-2 w-full mt-4">
              <span className="fs-6 bold">Choose a voice:</span>
              <select className="w-75" value={selectVoice} onChange={handleSelectVoice}>
                {listVoices
                  .filter((voice) => voice.available)
                  .map((voice) => (
                    <option key={voice.value} value={voice.value}>
                      {voice.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>}

        <div className="tw-flex justify-content-between align-items-center">
          {!isShowAddToken ? <button
            className="my-4 mx-2"
            onClick={() => handleClickDownload()}
            style={{ marginRight: "5px" }}
          >
            Download
          </button> : false}
          <button
            className="my-4 mx-2"
            onClick={() => {
              setIsShowAddToken(!isShowAddToken);
            }}
            style={{ marginRight: "5px" }}
          >
            {isShowAddToken ? 'Hide add token' : 'Show add token'}
          </button>
        </div>
      </div >

    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
