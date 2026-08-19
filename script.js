/* =========================================================
   AI NANDU - FINAL FRONTEND SCRIPT
   Existing AI/API functionality preserved
   Gemini-style + Functions panel
   ========================================================= */

const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const stopBtn = document.getElementById("stop-btn");
const chatBox = document.getElementById("chat-box");
const newChatBtn = document.getElementById("new-chat-btn");
const clearChatBtn = document.getElementById("clear-chat-btn");
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const fileInput = document.getElementById("file-input");
const attachBtn = document.getElementById("attach-btn");
const attachmentPreview = document.getElementById("attachment-preview");
const historyList = document.getElementById("history-list");

let conversation = [];
let isSending = false;
let abortController = null;
let pendingAttachment = null;

const STORAGE_KEY = "myAIConversation";
const THEME_KEY = "aiNanduTheme";

/* =========================================================
   DYNAMIC FUNCTIONS PANEL CSS
   No extra CSS file change required
   ========================================================= */

const functionsCSS = document.createElement("style");

functionsCSS.textContent = `
    .nandu-functions-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.28);
        backdrop-filter: blur(2px);
        z-index: 1998;
        opacity: 0;
        pointer-events: none;
        transition: opacity .22s ease;
    }

    .nandu-functions-overlay.show {
        opacity: 1;
        pointer-events: auto;
    }

    .nandu-functions-panel {
        position: fixed;
        left: 22px;
        bottom: 88px;
        width: 360px;
        max-width: calc(100vw - 30px);
        background: rgba(255,255,255,.97);
        border: 1px solid #e5e7eb;
        border-radius: 22px;
        box-shadow: 0 20px 60px rgba(0,0,0,.20);
        padding: 15px;
        z-index: 1999;
        opacity: 0;
        transform: translateY(15px) scale(.96);
        pointer-events: none;
        transition: opacity .22s ease, transform .22s ease;
    }

    .nandu-functions-panel.show {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
    }

    .nandu-functions-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 5px 13px;
    }

    .nandu-functions-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 17px;
        font-weight: 700;
        color: #111827;
    }

    .nandu-functions-title img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: contain;
    }

    .nandu-functions-close {
        width: 32px;
        height: 32px;
        border: 0;
        border-radius: 50%;
        background: #f3f4f6;
        cursor: pointer;
        font-size: 20px;
        color: #4b5563;
    }

    .nandu-functions-close:hover {
        background: #e5e7eb;
    }

    .nandu-functions-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 9px;
    }

    .nandu-function-item {
        min-height: 76px;
        border: 1px solid #e5e7eb;
        background: #fff;
        border-radius: 15px;
        cursor: pointer;
        padding: 12px;
        text-align: left;
        transition: .18s ease;
        display: flex;
        align-items: center;
        gap: 11px;
    }

    .nandu-function-item:hover {
        transform: translateY(-2px);
        border-color: #93c5fd;
        background: #eff6ff;
        box-shadow: 0 7px 18px rgba(37,99,235,.10);
    }

    .nandu-function-icon {
        width: 42px;
        height: 42px;
        min-width: 42px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #eff6ff;
        font-size: 21px;
    }

    .nandu-function-text strong {
        display: block;
        font-size: 14px;
        color: #111827;
        margin-bottom: 3px;
    }

    .nandu-function-text span {
        display: block;
        font-size: 11px;
        color: #6b7280;
        line-height: 1.3;
    }

    .nandu-search-box {
        margin-top: 11px;
        display: none;
        gap: 7px;
    }

    .nandu-search-box.show {
        display: flex;
    }

    .nandu-search-input {
        flex: 1;
        border: 1px solid #d1d5db;
        outline: none;
        border-radius: 11px;
        padding: 10px 12px;
        font-size: 14px;
    }

    .nandu-search-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37,99,235,.10);
    }

    .nandu-search-go {
        border: 0;
        border-radius: 11px;
        background: #2563eb;
        color: #fff;
        padding: 0 14px;
        cursor: pointer;
    }

    .nandu-camera-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.72);
        z-index: 3000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 15px;
    }

    .nandu-camera-modal.show {
        display: flex;
    }

    .nandu-camera-card {
        width: 520px;
        max-width: 100%;
        background: #fff;
        border-radius: 20px;
        padding: 15px;
        box-shadow: 0 25px 80px rgba(0,0,0,.35);
    }

    .nandu-camera-card video {
        width: 100%;
        max-height: 60vh;
        object-fit: cover;
        background: #111827;
        border-radius: 14px;
    }

    .nandu-camera-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .nandu-camera-actions button {
        flex: 1;
        border: 0;
        border-radius: 11px;
        padding: 11px;
        cursor: pointer;
        font-weight: 600;
    }

    .nandu-camera-capture {
        background: #2563eb;
        color: #fff;
    }

    .nandu-camera-cancel {
        background: #f3f4f6;
        color: #111827;
    }

    .nandu-theme-dark {
        background: #111827 !important;
        color: #f9fafb !important;
    }

    .nandu-theme-dark .nandu-functions-panel {
        background: #1f2937;
        border-color: #374151;
    }

    .nandu-theme-dark .nandu-functions-title,
    .nandu-theme-dark .nandu-function-text strong {
        color: #f9fafb;
    }

    .nandu-theme-dark .nandu-function-item {
        background: #111827;
        border-color: #374151;
    }

    .nandu-theme-dark .nandu-function-item:hover {
        background: #1e3a5f;
        border-color: #2563eb;
    }

    .nandu-theme-dark .nandu-function-text span {
        color: #9ca3af;
    }

    .nandu-theme-dark .nandu-function-icon {
        background: #1e3a5f;
    }

    .nandu-theme-dark .nandu-functions-close {
        background: #374151;
        color: #fff;
    }

    @media (max-width: 600px) {
        .nandu-functions-panel {
            left: 10px;
            right: 10px;
            bottom: 75px;
            width: auto;
            max-width: none;
            border-radius: 19px;
        }

        .nandu-functions-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .nandu-function-item {
            min-height: 70px;
            padding: 9px;
        }

        .nandu-function-icon {
            width: 37px;
            height: 37px;
            min-width: 37px;
            font-size: 18px;
        }

        .nandu-function-text strong {
            font-size: 13px;
        }

        .nandu-function-text span {
            font-size: 10px;
        }
    }
`;

document.head.appendChild(functionsCSS);


/* =========================================================
   CREATE FUNCTIONS PANEL
   ========================================================= */

const functionsOverlay = document.createElement("div");
functionsOverlay.className = "nandu-functions-overlay";

const functionsPanel = document.createElement("div");
functionsPanel.className = "nandu-functions-panel";

functionsPanel.innerHTML = `
    <div class="nandu-functions-head">
        <div class="nandu-functions-title">
            <img src="logo.png" alt="AI Nandu">
            <span>AI Nandu</span>
        </div>
        <button class="nandu-functions-close" type="button">×</button>
    </div>

    <div class="nandu-functions-grid">

        <button class="nandu-function-item" data-tool="camera" type="button">
            <div class="nandu-function-icon">📷</div>
            <div class="nandu-function-text">
                <strong>Camera</strong>
                <span>Take a photo</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="gallery" type="button">
            <div class="nandu-function-icon">🖼️</div>
            <div class="nandu-function-text">
                <strong>Photos</strong>
                <span>Choose an image</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="files" type="button">
            <div class="nandu-function-icon">📎</div>
            <div class="nandu-function-text">
                <strong>Files</strong>
                <span>Upload documents</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="drive" type="button">
            <div class="nandu-function-icon">📁</div>
            <div class="nandu-function-text">
                <strong>Drive</strong>
                <span>Google Drive</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="search" type="button">
            <div class="nandu-function-icon">🔍</div>
            <div class="nandu-function-text">
                <strong>Search</strong>
                <span>Search with AI</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="code" type="button">
            <div class="nandu-function-icon">💻</div>
            <div class="nandu-function-text">
                <strong>Code</strong>
                <span>Build & debug</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="learn" type="button">
            <div class="nandu-function-icon">📚</div>
            <div class="nandu-function-text">
                <strong>Learn</strong>
                <span>Explain anything</span>
            </div>
        </button>

        <button class="nandu-function-item" data-tool="settings" type="button">
            <div class="nandu-function-icon">⚙️</div>
            <div class="nandu-function-text">
                <strong>Settings</strong>
                <span>Customize AI</span>
            </div>
        </button>

    </div>

    <div class="nandu-search-box">
        <input
            class="nandu-search-input"
            type="text"
            placeholder="What do you want to search?"
        >
        <button class="nandu-search-go" type="button">Go</button>
    </div>
`;

document.body.appendChild(functionsOverlay);
document.body.appendChild(functionsPanel);


/* =========================================================
   CAMERA MODAL
   ========================================================= */

const cameraModal = document.createElement("div");
cameraModal.className = "nandu-camera-modal";

cameraModal.innerHTML = `
    <div class="nandu-camera-card">
        <video id="nandu-camera-video" autoplay playsinline></video>

        <div class="nandu-camera-actions">
            <button class="nandu-camera-capture" type="button">
                📸 Capture
            </button>

            <button class="nandu-camera-cancel" type="button">
                Cancel
            </button>
        </div>
    </div>
`;

document.body.appendChild(cameraModal);

const cameraVideo = document.getElementById("nandu-camera-video");

let cameraStream = null;


/* =========================================================
   FUNCTIONS PANEL OPEN/CLOSE
   ========================================================= */

function openFunctionsPanel() {
    functionsOverlay.classList.add("show");
    functionsPanel.classList.add("show");
}

function closeFunctionsPanel() {
    functionsOverlay.classList.remove("show");
    functionsPanel.classList.remove("show");

    const searchBox = functionsPanel.querySelector(".nandu-search-box");
    searchBox?.classList.remove("show");
}

function toggleFunctionsPanel() {
    if (functionsPanel.classList.contains("show")) {
        closeFunctionsPanel();
    } else {
        openFunctionsPanel();
    }
}

functionsOverlay.addEventListener("click", closeFunctionsPanel);

functionsPanel
    .querySelector(".nandu-functions-close")
    .addEventListener("click", closeFunctionsPanel);


/* =========================================================
   CHANGE ATTACH BUTTON TO PLUS
   ========================================================= */

if (attachBtn) {
    attachBtn.textContent = "+";
    attachBtn.title = "Functions";
    attachBtn.setAttribute("aria-label", "Open functions");
    attachBtn.style.fontSize = "25px";
    attachBtn.style.fontWeight = "500";

    attachBtn.onclick = (event) => {
        event.preventDefault();
        toggleFunctionsPanel();
    };
}


/* =========================================================
   INPUT / BASIC ELEMENTS
   ========================================================= */

function loadSaved() {
    try {
        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );

        if (Array.isArray(saved)) {
            conversation = saved.filter(m =>
                m &&
                (m.role === "user" || m.role === "assistant") &&
                typeof m.content === "string" &&
                m.content.trim()
            );
        }
    } catch {
        conversation = [];
    }
}


function saveConversation() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(conversation)
        );
    } catch (e) {
        console.error("Save error:", e);
    }
}


function scrollToBottom() {
    requestAnimationFrame(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}


function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


function renderMarkdown(text) {
    if (typeof marked === "undefined") {
        return escapeHtml(text).replace(/\n/g, "<br>");
    }

    marked.setOptions({
        breaks: true,
        gfm: true
    });

    const raw = marked.parse(text);

    return DOMPurify.sanitize(raw, {
        ADD_ATTR: ["target", "rel"]
    });
}


/* =========================================================
   CODE BLOCKS
   ========================================================= */

function enhanceCodeBlocks(container) {

    container.querySelectorAll("pre code").forEach(code => {

        try {
            if (window.hljs) {
                hljs.highlightElement(code);
            }
        } catch {}

        const pre = code.parentElement;

        if (
            pre.parentElement &&
            pre.parentElement.classList.contains("code-container")
        ) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "code-container";

        const header = document.createElement("div");
        header.className = "code-header";

        const language = [...code.classList]
            .find(c => c.startsWith("language-"))
            ?.replace("language-", "") || "code";

        header.innerHTML = `
            <span>${escapeHtml(language)}</span>
        `;

        const copy = document.createElement("button");

        copy.className = "copy-code-btn";
        copy.textContent = "Copy";

        copy.onclick = async () => {

            try {
                await navigator.clipboard.writeText(
                    code.textContent
                );

                copy.textContent = "Copied!";

                setTimeout(() => {
                    copy.textContent = "Copy";
                }, 1200);

            } catch {
                copy.textContent = "Failed";
            }
        };

        header.appendChild(copy);

        pre.replaceWith(wrapper);

        wrapper.appendChild(header);
        wrapper.appendChild(pre);
    });


    container.querySelectorAll("a").forEach(a => {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
    });
}


/* =========================================================
   WELCOME
   ========================================================= */

function removeWelcome() {
    chatBox.querySelector(".welcome")?.remove();
}


function showWelcome() {

    chatBox.innerHTML = `
        <div class="welcome">

            <div class="welcome-icon">
                <img
                    src="logo.png"
                    alt="AI Nandu"
                    style="
                        width:70px;
                        height:70px;
                        object-fit:contain;
                        border-radius:50%;
                    "
                >
            </div>

            <h1>How can I help you today?</h1>

            <p>
                Ask AI Nandu anything, write code,
                learn something new, or have a conversation.
            </p>

            <div class="suggestions">

                <button
                    class="suggestion"
                    data-message="Write a Python program for me."
                >
                    💻 Write Python code
                </button>

                <button
                    class="suggestion"
                    data-message="Explain HTML in simple language."
                >
                    📚 Explain HTML
                </button>

                <button
                    class="suggestion"
                    data-message="Help me solve a math problem."
                >
                    🧮 Solve a math problem
                </button>

                <button
                    class="suggestion"
                    data-message="Tell me the latest important technology information."
                >
                    🔍 Search information
                </button>

            </div>

        </div>
    `;

    attachSuggestions();
}


/* =========================================================
   USER MESSAGE
   ========================================================= */

function addUserMessage(text) {

    removeWelcome();

    const row = document.createElement("div");
    row.className = "message-row user-row";

    const inner = document.createElement("div");
    inner.className = "message-inner";

    const avatar = document.createElement("div");
    avatar.className = "avatar user-avatar";
    avatar.textContent = "👤";

    const content = document.createElement("div");
    content.className = "message-content user-content";
    content.textContent = text;

    inner.append(avatar, content);
    row.appendChild(inner);

    chatBox.appendChild(row);

    scrollToBottom();
}


/* =========================================================
   AI MESSAGE
   ========================================================= */

function createAIMessage() {

    removeWelcome();

    const row = document.createElement("div");
    row.className = "message-row bot-row";

    const inner = document.createElement("div");
    inner.className = "message-inner";

    const avatar = document.createElement("div");
    avatar.className = "avatar bot-avatar";

    const logo = document.createElement("img");
    logo.src = "logo.png";
    logo.alt = "AI Nandu";
    logo.style.width = "26px";
    logo.style.height = "26px";
    logo.style.objectFit = "contain";
    logo.style.borderRadius = "50%";

    avatar.appendChild(logo);

    const content = document.createElement("div");
    content.className = "message-content markdown-content";

    content.innerHTML = `
        <div class="typing">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    const actions = document.createElement("div");
    actions.className = "message-actions hidden";

    const regen = document.createElement("button");
    regen.textContent = "↻ Regenerate";
    regen.className = "action-btn";
    regen.onclick = regenerateLast;

    const copy = document.createElement("button");
    copy.textContent = "Copy";
    copy.className = "action-btn";

    copy.onclick = async () => {

        try {

            await navigator.clipboard.writeText(
                content.dataset.raw || ""
            );

            copy.textContent = "Copied!";

            setTimeout(() => {
                copy.textContent = "Copy";
            }, 1200);

        } catch {
            copy.textContent = "Failed";
        }
    };

    actions.append(regen, copy);

    inner.append(avatar, content);

    row.appendChild(inner);
    row.appendChild(actions);

    chatBox.appendChild(row);

    return {
        row,
        content,
        actions,
        copy
    };
}


/* =========================================================
   RESPONSE
   ========================================================= */

async function typeResponse(target, text) {

    target.dataset.raw = text;

    target.innerHTML = renderMarkdown(text);

    enhanceCodeBlocks(target);

    scrollToBottom();
}


/* =========================================================
   SOURCES
   ========================================================= */

function addSources(row, sources) {

    if (!Array.isArray(sources) || !sources.length) {
        return;
    }

    const box = document.createElement("div");

    box.className = "sources";

    box.innerHTML = "<strong>Sources</strong>";

    sources.forEach(source => {

        if (!source?.url) return;

        const a = document.createElement("a");

        a.href = source.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";

        a.textContent =
            source.title || source.url;

        box.appendChild(a);
    });

    row.appendChild(box);
}


/* =========================================================
   RENDER CONVERSATION
   ========================================================= */

function renderConversation() {

    chatBox.innerHTML = "";

    if (!conversation.length) {
        showWelcome();
        return;
    }

    conversation.forEach(m => {

        if (m.role === "user") {

            addUserMessage(m.content);

        } else {

            const msg = createAIMessage();

            msg.content.innerHTML =
                renderMarkdown(m.content);

            msg.content.dataset.raw =
                m.content;

            enhanceCodeBlocks(msg.content);

            msg.actions.classList.remove("hidden");
        }
    });

    scrollToBottom();
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    if (isSending) return;

    const text = input.value.trim();

    if (!text && !pendingAttachment) {
        return;
    }

    isSending = true;

    abortController = new AbortController();

    sendBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");

    input.disabled = true;

    const finalText =
        text ||
        "Please analyze the attached file.";

    addUserMessage(finalText);

    conversation.push({
        role: "user",
        content: finalText
    });

    saveConversation();

    input.value = "";
    input.style.height = "auto";

    const ai = createAIMessage();

    try {

        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                messages: conversation
            }),

            signal: abortController.signal
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error ||
                `Server error ${response.status}`
            );
        }

        const reply =
            String(data?.reply || "").trim();

        if (!reply) {
            throw new Error(
                "AI ne koi response nahi diya."
            );
        }

        await typeResponse(
            ai.content,
            reply
        );

        ai.actions.classList.remove("hidden");

        addSources(
            ai.row,
            data.sources
        );

        conversation.push({
            role: "assistant",
            content: reply
        });

        saveConversation();

        updateHistory();

    } catch (error) {

        if (error.name === "AbortError") {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            console.error(error);

            ai.content.innerHTML = `
                <div class="error-box">
                    ❌ ${escapeHtml(error.message)}
                </div>
            `;
        }

    } finally {

        isSending = false;
        abortController = null;

        input.disabled = false;

        sendBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");

        input.focus();

        pendingAttachment = null;

        if (attachmentPreview) {
            attachmentPreview.innerHTML = "";
        }

        if (fileInput) {
            fileInput.value = "";
        }

        scrollToBottom();
    }
}


/* =========================================================
   STOP GENERATION
   ========================================================= */

function stopGeneration() {

    if (abortController) {
        abortController.abort();
    }
}


/* =========================================================
   REGENERATE
   ========================================================= */

async function regenerateLast() {

    if (isSending || !conversation.length) {
        return;
    }

    const lastUserIndex =
        [...conversation]
            .map(m => m.role)
            .lastIndexOf("user");

    if (lastUserIndex < 0) {
        return;
    }

    conversation =
        conversation.slice(
            0,
            lastUserIndex + 1
        );

    saveConversation();

    renderConversation();

    await sendMessageFromHistory();
}


/* =========================================================
   SEND FROM HISTORY
   ========================================================= */

async function sendMessageFromHistory() {

    isSending = true;

    abortController =
        new AbortController();

    sendBtn.classList.add("hidden");
    stopBtn.classList.remove("hidden");

    input.disabled = true;

    const ai = createAIMessage();

    try {

        const response = await fetch(
            "/api/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                    "Accept":
                        "application/json"
                },

                body: JSON.stringify({
                    messages: conversation
                }),

                signal:
                    abortController.signal
            }
        );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error ||
                "Server error."
            );
        }

        const reply =
            String(
                data?.reply || ""
            ).trim();

        if (!reply) {
            throw new Error(
                "Empty AI response."
            );
        }

        await typeResponse(
            ai.content,
            reply
        );

        ai.actions.classList.remove(
            "hidden"
        );

        addSources(
            ai.row,
            data.sources
        );

        conversation.push({
            role: "assistant",
            content: reply
        });

        saveConversation();

        updateHistory();

    } catch (error) {

        if (error.name === "AbortError") {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            ai.content.innerHTML = `
                <div class="error-box">
                    ❌ ${escapeHtml(error.message)}
                </div>
            `;
        }

    } finally {

        isSending = false;
        abortController = null;

        input.disabled = false;

        sendBtn.classList.remove("hidden");
        stopBtn.classList.add("hidden");

        input.focus();
    }
}


/* =========================================================
   CLEAR / NEW CHAT
   ========================================================= */

function clearAll() {

    conversation = [];

    localStorage.removeItem(
        STORAGE_KEY
    );

    renderConversation();

    updateHistory();

    input.value = "";

    input.focus();
}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function attachSuggestions() {

    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.onclick = () => {

                input.value =
                    button.dataset.message || "";

                input.focus();

                sendMessage();
            };
        });
}


/* =========================================================
   CHAT HISTORY
   ========================================================= */

function updateHistory() {

    if (!historyList) return;

    historyList.innerHTML = "";

    const userMessages =
        conversation
            .filter(m => m.role === "user")
            .slice(-10)
            .reverse();

    userMessages.forEach(m => {

        const item =
            document.createElement("button");

        item.className =
            "history-item";

        item.textContent =
            m.content.slice(0, 45);

        item.title =
            m.content;

        item.onclick = () => {

            document
                .querySelector(".chat-area")
                ?.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
        };

        historyList.appendChild(item);
    });
}


/* =========================================================
   FILE HANDLING
   ========================================================= */

function setAttachment(file) {

    if (!file) return;

    pendingAttachment = file;

    if (!attachmentPreview) return;

    attachmentPreview.innerHTML = `
        📎 ${escapeHtml(file.name)}
        <button
            type="button"
            id="remove-attachment"
        >
            ×
        </button>
    `;

    document
        .getElementById("remove-attachment")
        ?.addEventListener(
            "click",
            () => {

                pendingAttachment = null;

                if (fileInput) {
                    fileInput.value = "";
                }

                attachmentPreview.innerHTML = "";
            }
        );
}


fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];

        setAttachment(file);
    }
);


/* =========================================================
   FUNCTIONS
   ========================================================= */

const functionItems =
    functionsPanel.querySelectorAll(
        ".nandu-function-item"
    );

functionItems.forEach(item => {

    item.addEventListener(
        "click",
        async () => {

            const tool =
                item.dataset.tool;

            if (tool === "camera") {
                closeFunctionsPanel();
                openCamera();
            }

            else if (tool === "gallery") {

                closeFunctionsPanel();

                const imagePicker =
                    document.createElement("input");

                imagePicker.type = "file";
                imagePicker.accept = "image/*";

                imagePicker.onchange = () => {

                    const file =
                        imagePicker.files?.[0];

                    setAttachment(file);
                };

                imagePicker.click();
            }

            else if (tool === "files") {

                closeFunctionsPanel();

                fileInput?.click();
            }

            else if (tool === "drive") {

                alert(
                    "Google Drive connection ke liye Google OAuth / Drive API setup required hai."
                );
            }

            else if (tool === "search") {

                const searchBox =
                    functionsPanel.querySelector(
                        ".nandu-search-box"
                    );

                searchBox.classList.toggle(
                    "show"
                );

                searchBox
                    .querySelector(
                        ".nandu-search-input"
                    )
                    ?.focus();
            }

            else if (tool === "code") {

                input.value =
                    "Help me write, explain, debug or improve this code:";

                closeFunctionsPanel();

                input.focus();

            }

            else if (tool === "learn") {

                input.value =
                    "Explain this topic to me step by step in simple language:";

                closeFunctionsPanel();

                input.focus();

            }

            else if (tool === "settings") {

                closeFunctionsPanel();

                openSettings();
            }
        }
    );
});


/* =========================================================
   SEARCH
   ========================================================= */

const searchInput =
    functionsPanel.querySelector(
        ".nandu-search-input"
    );

const searchGo =
    functionsPanel.querySelector(
        ".nandu-search-go"
    );

function useSearch() {

    const query =
        searchInput?.value.trim();

    if (!query) return;

    input.value =
        `Search and explain this for me: ${query}`;

    closeFunctionsPanel();

    input.focus();
}

searchGo?.addEventListener(
    "click",
    useSearch
);

searchInput?.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            e.preventDefault();
            useSearch();
        }
    }
);


/* =========================================================
   CAMERA
   ========================================================= */

async function openCamera() {

    cameraModal.classList.add("show");

    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                },
                audio: false
            });

        cameraVideo.srcObject =
            cameraStream;

    } catch (error) {

        cameraModal.classList.remove("show");

        alert(
            "Camera open nahi ho saka. Browser me camera permission allow karein."
        );

        console.error(error);
    }
}


function closeCamera() {

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(track =>
                track.stop()
            );

        cameraStream = null;
    }

    cameraVideo.srcObject = null;

    cameraModal.classList.remove(
        "show"
    );
}


cameraModal
    .querySelector(
        ".nandu-camera-cancel"
    )
    .addEventListener(
        "click",
        closeCamera
    );


cameraModal
    .querySelector(
        ".nandu-camera-capture"
    )
    .addEventListener(
        "click",
        () => {

            if (!cameraVideo.videoWidth) {
                return;
            }

            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                cameraVideo.videoWidth;

            canvas.height =
                cameraVideo.videoHeight;

            const ctx =
                canvas.getContext("2d");

            ctx.drawImage(
                cameraVideo,
                0,
                0,
                canvas.width,
                canvas.height
            );

            canvas.toBlob(
                blob => {

                    if (!blob) return;

                    const file =
                        new File(
                            [blob],
                            `camera-photo-${Date.now()}.jpg`,
                            {
                                type:
                                    "image/jpeg"
                            }
                        );

                    setAttachment(file);

                    closeCamera();
                },
                "image/jpeg",
                .92
            );
        }
    );


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {

    const dark =
        document.body.classList.contains(
            "nandu-theme-dark"
        );

    const result =
        confirm(
            dark
                ? "Dark mode ON hai. OK dabao Light Mode ke liye."
                : "Light mode ON hai. OK dabao Dark Mode ke liye."
        );

    if (result) {
        toggleTheme();
    }
}


function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );

    if (theme === "dark") {

        document.body.classList.add(
            "nandu-theme-dark"
        );
    }
}


function toggleTheme() {

    document.body.classList.toggle(
        "nandu-theme-dark"
    );

    localStorage.setItem(
        THEME_KEY,
        document.body.classList.contains(
            "nandu-theme-dark"
        )
            ? "dark"
            : "light"
    );
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);

stopBtn?.addEventListener(
    "click",
    stopGeneration
);


input?.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            sendMessage();
        }
    }
);


input?.addEventListener(
    "input",
    () => {

        input.style.height =
            "auto";

        input.style.height =
            Math.min(
                input.scrollHeight,
                160
            ) + "px";
    }
);


newChatBtn?.addEventListener(
    "click",
    clearAll
);


clearChatBtn?.addEventListener(
    "click",
    clearAll
);


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

menuBtn?.addEventListener(
    "click",
    e => {

        e.stopPropagation();

        sidebar.classList.toggle(
            "open"
        );
    }
);


document.addEventListener(
    "click",
    e => {

        if (
            window.innerWidth <= 768 &&
            sidebar &&
            sidebar.classList.contains(
                "open"
            ) &&
            !sidebar.contains(e.target) &&
            !menuBtn?.contains(e.target)
        ) {

            sidebar.classList.remove(
                "open"
            );
        }
    }
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    e => {

        if (e.key === "Escape") {

            closeFunctionsPanel();
            closeCamera();

            sidebar?.classList.remove(
                "open"
            );
        }
    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

loadTheme();

loadSaved();

renderConversation();

updateHistory();

input?.focus();

console.log(
    "AI Nandu final frontend loaded successfully."
);
