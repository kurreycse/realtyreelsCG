import crypto from "node:crypto";
import http from "node:http";
import net from "node:net";

const appUrl = new URL(process.env.APP_URL || "http://localhost:5173/");
const debugPort = process.env.CHROME_DEBUG_PORT || "9222";
const matchText = process.env.MATCH_TEXT || "";

const targets = await new Promise((resolve, reject) => {
  http.get(`http://127.0.0.1:${debugPort}/json`, (response) => {
    let body = "";
    response.on("data", (chunk) => {
      body += chunk;
    });
    response.on("end", () => resolve(JSON.parse(body)));
  }).on("error", reject);
});

const page = targets.find((target) => target.type === "page" && target.url.includes(appUrl.host));
if (!page) throw new Error("Local app page is not open in Chrome.");

const url = new URL(page.webSocketDebuggerUrl);
const socket = net.createConnection({ host: url.hostname, port: Number(url.port) });
const key = crypto.randomBytes(16).toString("base64");

let buffer = Buffer.alloc(0);
let handshaken = false;
let nextId = 0;
const pending = new Map();
const events = [];

function encodeFrame(text) {
  const payload = Buffer.from(text);
  const header = [];
  header.push(0x81);
  if (payload.length < 126) {
    header.push(0x80 | payload.length);
  } else if (payload.length < 65536) {
    header.push(0x80 | 126, (payload.length >> 8) & 255, payload.length & 255);
  } else {
    throw new Error("Frame too large for this checker.");
  }
  const mask = crypto.randomBytes(4);
  const masked = Buffer.alloc(payload.length);
  for (let index = 0; index < payload.length; index += 1) {
    masked[index] = payload[index] ^ mask[index % 4];
  }
  return Buffer.concat([Buffer.from(header), mask, masked]);
}

function readFrame() {
  if (buffer.length < 2) return null;
  const second = buffer[1];
  let offset = 2;
  let length = second & 0x7f;
  if (length === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  }
  const masked = Boolean(second & 0x80);
  const maskLength = masked ? 4 : 0;
  if (buffer.length < offset + maskLength + length) return null;
  let payload = buffer.subarray(offset + maskLength, offset + maskLength + length);
  if (masked) {
    const mask = buffer.subarray(offset, offset + 4);
    payload = Buffer.from(payload.map((byte, index) => byte ^ mask[index % 4]));
  }
  buffer = buffer.subarray(offset + maskLength + length);
  return payload.toString();
}

function pump() {
  if (!handshaken) {
    const marker = buffer.indexOf("\r\n\r\n");
    if (marker === -1) return;
    const header = buffer.subarray(0, marker).toString();
    if (!header.includes("101")) throw new Error(`DevTools handshake failed: ${header}`);
    buffer = buffer.subarray(marker + 4);
    handshaken = true;
  }

  let frame = readFrame();
  while (frame) {
    const message = JSON.parse(frame);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(message.error);
      else resolve(message.result);
    } else if (message.method === "Runtime.consoleAPICalled") {
      events.push({
        type: message.params.type,
        args: message.params.args.map((arg) => arg.value ?? arg.description ?? arg.type).slice(0, 5),
      });
    } else if (message.method === "Log.entryAdded") {
      events.push({
        type: message.params.entry.level,
        args: [message.params.entry.text],
      });
    }
    frame = readFrame();
  }
}

socket.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  pump();
});

await new Promise((resolve) => socket.once("connect", resolve));
socket.write([
  `GET ${url.pathname} HTTP/1.1`,
  `Host: ${url.host}`,
  "Upgrade: websocket",
  "Connection: Upgrade",
  `Sec-WebSocket-Key: ${key}`,
  "Sec-WebSocket-Version: 13",
  `Origin: ${appUrl.origin}`,
  "",
  "",
].join("\r\n"));

await new Promise((resolve) => {
  const timer = setInterval(() => {
    if (handshaken) {
      clearInterval(timer);
      resolve();
    }
  }, 20);
});

function cdp(method, params = {}) {
  const id = ++nextId;
  socket.write(encodeFrame(JSON.stringify({ id, method, params })));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
}

async function evaluate(expression) {
  const result = await cdp("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed.");
  }
  return result.result.value;
}

await cdp("Runtime.enable");
await cdp("Log.enable");
await cdp("Page.enable");
await cdp("Page.navigate", { url: appUrl.href });
await new Promise((resolve) => setTimeout(resolve, 3500));

const before = await evaluate(`(() => {
  const matchText = ${JSON.stringify(matchText)};
  const article = matchText
    ? Array.from(document.querySelectorAll("article")).find((candidate) => candidate.innerText.toLowerCase().includes(matchText.toLowerCase()))
    : null;

  return {
    text: document.body.innerText.slice(0, 1200),
    matchedArticleText: article ? article.innerText.slice(0, 600) : null,
    matchedArticleHasPlayButton: article ? Array.from(article.querySelectorAll("button")).some((button) => /play/i.test(button.innerText)) : null,
    matchedArticleReactProps: article ? (() => {
      const fiberKey = Object.keys(article).find((key) => key.startsWith("__reactFiber$"));
      let fiber = fiberKey ? article[fiberKey] : null;
      while (fiber) {
        const name = fiber.elementType?.name || fiber.type?.name || null;
        if (name === "ListingCard") {
          return {
            title: fiber.memoizedProps?.property?.title || null,
            videoRef: fiber.memoizedProps?.property?.videoRef || null,
            hasVideoUrl: Boolean(fiber.memoizedProps?.property?.videoUrl),
            videoUrlStart: fiber.memoizedProps?.property?.videoUrl?.slice(0, 120) || null,
          };
        }
        fiber = fiber.return;
      }
      return null;
    })() : null,
    playButtons: Array.from(document.querySelectorAll("button")).filter((button) => /play/i.test(button.innerText)).map((button) => button.innerText.trim()),
    videos: document.querySelectorAll("video").length
  };
})()`);

const supabaseDebug = matchText ? await evaluate(`(async () => {
  try {
    const { supabase } = await import("/src/app/supabaseClient.ts");
    const propertySelect = \`
      id,
      title,
      status,
      featured,
      created_at,
      property_media(storage_path,media_type,upload_status,is_primary)
    \`;
    const { data, error } = await supabase
      .from("properties")
      .select("id,title,status,property_media(storage_path,media_type,upload_status,is_primary)")
      .ilike("title", ${JSON.stringify(`%${matchText}%`)})
      .limit(1);
    const media = data?.[0]?.property_media?.filter((item) => item.media_type === "VIDEO") || [];
    const paths = media.map((item) => item.storage_path).filter(Boolean);
    const signed = paths.length
      ? await supabase.storage.from("property-videos").createSignedUrls(paths, 600)
      : { data: [], error: null };
    const full = await supabase
      .from("properties")
      .select(propertySelect)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    const mapped = (full.data || []).map((row) => {
      const video = row.property_media?.find((item) => item.media_type === "VIDEO" && item.upload_status !== "DELETED" && item.is_primary) ||
        row.property_media?.find((item) => item.media_type === "VIDEO" && item.upload_status !== "DELETED");
      return { id: row.id, title: row.title, videoRef: video?.storage_path || "" };
    });
    const isHttpVideoUrl = (value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    };
    const isSignableVideoPath = (value) => !isHttpVideoUrl(value) && (value.includes("/") || /\\.(mp4|webm|mov|m4v)$/i.test(value));
    const batchPaths = Array.from(new Set(mapped.map((item) => item.videoRef).filter((path) => path && isSignableVideoPath(path))));
    const batchSigned = batchPaths.length
      ? await supabase.storage.from("property-videos").createSignedUrls(batchPaths, 600)
      : { data: [], error: null };
    const batchSignedUrls = new Map();
    batchSigned.data?.forEach((item) => {
      if (item.path && item.signedUrl) batchSignedUrls.set(item.path, item.signedUrl);
    });
    const mappedMatch = mapped.find((item) => item.title.toLowerCase().includes(${JSON.stringify(matchText.toLowerCase())}));

    return {
      queryError: error ? { message: error.message, code: error.code } : null,
      property: data?.[0] ? { id: data[0].id, title: data[0].title, status: data[0].status } : null,
      media,
      signedError: signed.error ? { message: signed.error.message, name: signed.error.name } : null,
      signed: (signed.data || []).map((item) => ({ path: item.path, hasSignedUrl: Boolean(item.signedUrl), error: item.error || null })),
      fullLoadError: full.error ? { message: full.error.message, code: full.error.code } : null,
      mappedMatch,
      batchPathCount: batchPaths.length,
      batchPaths,
      batchSignedError: batchSigned.error ? { message: batchSigned.error.message, name: batchSigned.error.name } : null,
      batchSigned: (batchSigned.data || []).map((item) => ({ path: item.path, hasSignedUrl: Boolean(item.signedUrl), error: item.error || null })),
      mappedMatchHasUrl: mappedMatch ? batchSignedUrls.has(mappedMatch.videoRef) : false,
    };
  } catch (error) {
    return { thrown: String(error), message: error?.message || null };
  }
})()`) : null;

await evaluate(`(() => {
  const matchText = ${JSON.stringify(matchText)};
  const root = matchText
    ? Array.from(document.querySelectorAll("article")).find((candidate) => candidate.innerText.toLowerCase().includes(matchText.toLowerCase()))
    : document;
  const button = Array.from((root || document).querySelectorAll("button")).find((candidate) => /^play$/i.test(candidate.innerText.trim()) || /play walkthrough/i.test(candidate.innerText));
  if (button) {
    button.click();
    return true;
  }
  const media = (root || document).querySelector("video, img");
  if (!media) return false;
  media.click();
  return true;
})()`);

await new Promise((resolve) => setTimeout(resolve, 3000));

const after = await evaluate(`(async () => {
  const video = document.querySelector("article video, video");
  if (video && video.paused) {
    try { await video.play(); } catch (error) {}
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    videoCount: document.querySelectorAll("video").length,
    hasVideo: Boolean(video),
    paused: video ? video.paused : null,
    readyState: video ? video.readyState : null,
    currentTime: video ? Number(video.currentTime.toFixed(2)) : null,
    duration: video && Number.isFinite(video.duration) ? Number(video.duration.toFixed(2)) : null,
    srcHost: video && video.currentSrc ? new URL(video.currentSrc).host : null,
    srcPathIncludesObject: video && video.currentSrc ? video.currentSrc.includes("/storage/v1/object/sign/property-videos/") : false
  };
})()`);

console.log(JSON.stringify({ before, supabaseDebug, after, events }, null, 2));
socket.end();
