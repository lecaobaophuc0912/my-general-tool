// juniper, sky, cove, ember, breeze, maple
let voice = "cove";
let message_id = "682554ee-0dc6-xxxx-9daa-xxxxxxxxx";
let conversation_id = "xxxxxxx-8444-8003-adb0-xxxxxxxx";
let token = "Bearer xxx";
let anchor = document.createElement("a");
document.body.appendChild(anchor);
let file = `https://chatgpt.com/backend-api/synthesize?message_id=${message_id}&conversation_id=${conversation_id}&voice=${voice}&format=aac`;

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
  });
