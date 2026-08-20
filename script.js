/* =========================================================
   AI JARVIS / AI NANDU
   FINAL FRONTEND SCRIPT.JS
   =========================================================
   COPY THIS ENTIRE FILE
   REPLACE YOUR OLD script.js
   SAVE
   ========================================================= */

"use strict";


/* =========================================================
   ELEMENTS
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

const attachmentPreview =
    document.getElementById("attachment-preview");

const historyList =
    document.getElementById("history-list");


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "myAIConversation";
const THEME_KEY = "aiNanduTheme";


/* =========================================================
   STATE
   ========================================================= */

let conversation = [];

let isSending = false;

let abortController = null;

let pendingAttachment = null;

let cameraStream = null;


/* =========================================================
   SAFE HELPERS
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}


function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = String(text ?? "");

    return div.innerHTML;
}


function scrollToBottom() {

    requestAnimationFrame(() => {

        if (chatBox) {
            chatBox.scrollTop =
                chatBox.scrollHeight;
        }

    });
}


/* =========================================================
   MARKDOWN
   ========================================================= */

function renderMarkdown(text) {

    text = String(text ?? "");

    if (
        typeof window.marked === "undefined"
    ) {

        return escapeHtml(text)
            .replace(/\n/g, "<br>");
    }

    try {

        window.marked.setOptions({
            breaks: true,
            gfm: true
        });

        const raw =
            window.marked.parse(text);

        if (
            typeof window.DOMPurify !== "undefined"
        ) {

            return window.DOMPurify.sanitize(
                raw,
                {
                    ADD_ATTR: [
                        "target",
                        "rel"
                    ]
                }
            );
        }

        return raw;

    } catch (error) {

        console.error(
            "Markdown error:",
            error
        );

        return escapeHtml(text)
            .replace(/\n/g, "<br>");
    }
}


/* =========================================================
   DYNAMIC CSS
   ========================================================= */

const style = document.createElement("style");

style.id = "ai-jarvis-final-style";

style.textContent = `

/* =====================================================
   FUNCTIONS OVERLAY
   ===================================================== */

.jarvis-functions-overlay {

    position: fixed;

    inset: 0;

    background:
        rgba(0,0,0,.34);

    backdrop-filter:
        blur(3px);

    -webkit-backdrop-filter:
        blur(3px);

    z-index: 1998;

    opacity: 0;

    pointer-events: none;

    transition:
        opacity .22s ease;
}


.jarvis-functions-overlay.show {

    opacity: 1;

    pointer-events: auto;
}


/* =====================================================
   FUNCTIONS PANEL
   ===================================================== */

.jarvis-functions-panel {

    position: fixed;

    top: 102px;

    right: 22px;

    width: 362px;

    max-width:
        calc(100vw - 30px);

    max-height:
        calc(100vh - 125px);

    overflow-y: auto;

    padding: 16px;

    background:
        rgba(8,17,31,.97);

    border:
        1px solid rgba(59,130,246,.75);

    border-radius: 22px;

    box-shadow:
        0 25px 80px rgba(0,0,0,.50),
        0 0 35px rgba(37,99,235,.14);

    z-index: 1999;

    opacity: 0;

    transform:
        translateY(-12px)
        scale(.97);

    pointer-events: none;

    transition:
        opacity .22s ease,
        transform .22s ease;
}


.jarvis-functions-panel.show {

    opacity: 1;

    transform:
        translateY(0)
        scale(1);

    pointer-events: auto;
}


/* =====================================================
   FUNCTIONS HEADER
   ===================================================== */

.jarvis-functions-head {

    display: flex;

    align-items: center;

    justify-content:
        space-between;

    padding:
        2px 4px 15px;
}


.jarvis-functions-heading {

    display: flex;

    align-items: center;

    gap: 10px;
}


.jarvis-functions-heading-icon {

    width: 36px;

    height: 36px;

    border-radius: 50%;

    object-fit: contain;

    box-shadow:
        0 0 15px
        rgba(59,130,246,.30);
}


.jarvis-functions-heading-text strong {

    display: block;

    color: #ffffff;

    font-size: 20px;

    font-weight: 700;

    line-height: 1.2;
}


.jarvis-functions-heading-text span {

    display: block;

    color: #94a3b8;

    font-size: 12px;

    margin-top: 3px;
}


.jarvis-functions-close {

    width: 36px;

    height: 36px;

    border: 0;

    border-radius: 50%;

    background:
        rgba(255,255,255,.07);

    color: #cbd5e1;

    cursor: pointer;

    font-size: 24px;

    line-height: 1;

    transition:
        background .18s ease,
        transform .18s ease;
}


.jarvis-functions-close:hover {

    background:
        rgba(255,255,255,.13);

    transform:
        rotate(5deg);
}


/* =====================================================
   FUNCTION GRID
   ===================================================== */

.jarvis-functions-grid {

    display: grid;

    grid-template-columns:
        1fr;

    gap: 9px;
}


.jarvis-function-item {

    width: 100%;

    min-height: 72px;

    display: flex;

    align-items: center;

    gap: 13px;

    position: relative;

    padding:
        12px 14px;

    border:
        1px solid
        rgba(148,163,184,.16);

    border-radius: 15px;

    background:
        linear-gradient(
            135deg,
            rgba(15,27,45,.98),
            rgba(8,18,32,.98)
        );

    color: #ffffff;

    text-align: left;

    cursor: pointer;

    transition:
        transform .18s ease,
        border-color .18s ease,
        background .18s ease,
        box-shadow .18s ease;
}


.jarvis-function-item:hover {

    transform:
        translateX(-2px);

    border-color:
        rgba(96,165,250,.55);

    background:
        linear-gradient(
            135deg,
            rgba(18,38,65,1),
            rgba(10,25,45,1)
        );

    box-shadow:
        0 8px 25px
        rgba(37,99,235,.13);
}


.jarvis-function-icon {

    width: 43px;

    height: 43px;

    min-width: 43px;

    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 13px;

    background:
        rgba(37,99,235,.13);

    border:
        1px solid
        rgba(59,130,246,.12);

    font-size: 22px;
}


.jarvis-function-text {

    flex: 1;

    min-width: 0;
}


.jarvis-function-text strong {

    display: block;

    color: #f8fafc;

    font-size: 15px;

    font-weight: 650;

    margin-bottom: 4px;
}


.jarvis-function-text span {

    display: block;

    color: #94a3b8;

    font-size: 12px;

    line-height: 1.35;
}


.jarvis-function-arrow {

    color: #cbd5e1;

    font-size: 22px;

    margin-left: auto;

    transition:
        transform .18s ease;
}


.jarvis-function-item:hover
.jarvis-function-arrow {

    transform:
        translateX(3px);
}


/* =====================================================
   SEARCH
   ===================================================== */

.jarvis-search-box {

    display: none;

    gap: 8px;

    margin-top: 10px;

    padding-top: 10px;

    border-top:
        1px solid
        rgba(148,163,184,.12);
}


.jarvis-search-box.show {

    display: flex;
}


.jarvis-search-input {

    flex: 1;

    min-width: 0;

    border:
        1px solid
        rgba(148,163,184,.22);

    background:
        rgba(15,23,42,.95);

    color: #ffffff;

    outline: none;

    border-radius: 11px;

    padding:
        11px 12px;

    font-size: 13px;
}


.jarvis-search-input::placeholder {

    color: #64748b;
}


.jarvis-search-input:focus {

    border-color:
        #3b82f6;

    box-shadow:
        0 0 0 3px
        rgba(59,130,246,.12);
}


.jarvis-search-go {

    border: 0;

    border-radius: 11px;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #7c3aed
        );

    color: #ffffff;

    padding:
        0 15px;

    font-weight: 600;

    cursor: pointer;
}


/* =====================================================
   CAMERA
   ===================================================== */

.jarvis-camera-modal {

    position: fixed;

    inset: 0;

    z-index: 3000;

    display: none;

    align-items: center;

    justify-content: center;

    padding: 15px;

    background:
        rgba(0,0,0,.78);

    backdrop-filter:
        blur(4px);
}


.jarvis-camera-modal.show {

    display: flex;
}


.jarvis-camera-card {

    width: 540px;

    max-width: 100%;

    padding: 15px;

    border-radius: 20px;

    background:
        #0b1220;

    border:
        1px solid
        rgba(96,165,250,.35);

    box-shadow:
        0 30px 90px
        rgba(0,0,0,.55);
}


.jarvis-camera-card video {

    width: 100%;

    max-height: 65vh;

    object-fit: cover;

    background: #020617;

    border-radius: 15px;
}


.jarvis-camera-actions {

    display: flex;

    gap: 8px;

    margin-top: 12px;
}


.jarvis-camera-actions button {

    flex: 1;

    border: 0;

    border-radius: 11px;

    padding: 12px;

    cursor: pointer;

    font-weight: 600;
}


.jarvis-camera-capture {

    color: #ffffff;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #7c3aed
        );
}


.jarvis-camera-cancel {

    color: #e2e8f0;

    background:
        #1e293b;
}


/* =====================================================
   ATTACHMENT PREVIEW
   ===================================================== */

#attachment-preview {

    display: flex;

    align-items: center;

    gap: 7px;

    flex-wrap: wrap;
}


.jarvis-attachment-chip {

    display: inline-flex;

    align-items: center;

    gap: 8px;

    max-width: 100%;

    padding:
        7px 10px;

    border-radius: 10px;

    background:
        rgba(37,99,235,.13);

    border:
        1px solid
        rgba(59,130,246,.30);

    color: #dbeafe;

    font-size: 12px;
}


.jarvis-remove-attachment {

    border: 0;

    background: transparent;

    color: #94a3b8;

    cursor: pointer;

    font-size: 18px;

    line-height: 1;
}


/* =====================================================
   CODE CONTAINER
   ===================================================== */

.code-container {

    overflow: hidden;

    margin:
        12px 0;

    border:
        1px solid
        rgba(148,163,184,.18);

    border-radius: 12px;

    background:
        #020617;
}


.code-header {

    display: flex;

    align-items: center;

    justify-content:
        space-between;

    padding:
        8px 10px;

    background:
        #0f172a;

    border-bottom:
        1px solid
        rgba(148,163,184,.14);

    color: #94a3b8;

    font-size: 11px;

    text-transform:
        uppercase;

    letter-spacing:
        .04em;
}


.code-header button {

    border: 0;

    border-radius: 7px;

    padding:
        5px 9px;

    background:
        #1e293b;

    color: #e2e8f0;

    cursor: pointer;

    font-size: 11px;
}


.code-header button:hover {

    background:
        #334155;
}


.code-container pre {

    margin: 0;

    padding: 14px;

    overflow-x: auto;
}


/* =====================================================
   ERROR
   ===================================================== */

.error-box {

    padding: 10px 12px;

    border-radius: 10px;

    color: #fecaca;

    background:
        rgba(127,29,29,.30);

    border:
        1px solid
        rgba(248,113,113,.25);
}


/* =====================================================
   TYPING
   ===================================================== */

.typing {

    display: inline-flex;

    align-items: center;

    gap: 5px;

    padding:
        7px 2px;
}


.typing span {

    width: 7px;

    height: 7px;

    border-radius: 50%;

    background:
        #60a5fa;

    animation:
        jarvisTyping 1s
        infinite ease-in-out;
}


.typing span:nth-child(2) {

    animation-delay:
        .15s;
}


.typing span:nth-child(3) {

    animation-delay:
        .30s;
}


@keyframes jarvisTyping {

    0%, 60%, 100% {
        transform: translateY(0);
        opacity: .45;
    }

    30% {
        transform: translateY(-4px);
        opacity: 1;
    }
}


/* =====================================================
   HIDDEN
   ===================================================== */

.hidden {

    display: none !important;
}


/* =====================================================
   DARK BODY
   ===================================================== */

body.nandu-theme-dark {

    background:
        #020617 !important;

    color:
        #f8fafc !important;
}


/* =====================================================
   MOBILE
   ===================================================== */

@media (max-width: 700px) {

    .jarvis-functions-panel {

        top: 75px;

        left: 10px;

        right: 10px;

        width: auto;

        max-width: none;

        max-height:
            calc(100vh - 90px);

        border-radius: 19px;
    }

    .jarvis-function-item {

        min-height: 66px;

        padding:
            10px 11px;
    }

    .jarvis-function-icon {

        width: 39px;

        height: 39px;

        min-width: 39px;

        font-size: 19px;
    }

    .jarvis-function-text strong {

        font-size: 14px;
    }

    .jarvis-function-text span {

        font-size: 11px;
    }

}


@media (max-width: 430px) {

    .jarvis-functions-panel {

        top: 65px;

        padding: 12px;
    }

    .jarvis-functions-heading-text strong {

        font-size: 18px;
    }

    .jarvis-functions-heading-text span {

        font-size: 11px;
    }

}


/* =====================================================
   MOBILE SIDEBAR
   ===================================================== */

@media (max-width: 768px) {

    #sidebar {

        transition:
            transform .25s ease;
    }

    #sidebar.open {

        transform:
            translateX(0) !important;
    }

}


/* =====================================================
   FUNCTION BUTTON STYLE
   ===================================================== */

#functions-btn,
#functions-button {

    cursor: pointer;
}


/* =====================================================
   SUGGESTIONS
   ===================================================== */

.suggestion {

    cursor: pointer;
}


/* =====================================================
   SOURCE BOX
   ===================================================== */

.sources {

    margin-top: 10px;

    display: flex;

    flex-direction: column;

    gap: 5px;

    padding:
        10px 12px;

    border-radius: 11px;

    background:
        rgba(15,23,42,.50);

    border:
        1px solid
        rgba(148,163,184,.12);

    font-size: 12px;
}


.sources strong {

    color:
        #cbd5e1;

    margin-bottom: 2px;
}


.sources a {

    color:
        #60a5fa;

    text-decoration: none;

    overflow-wrap:
        anywhere;
}


.sources a:hover {

    text-decoration: underline;
}

`;

document.head.appendChild(style);


/* =========================================================
   FUNCTIONS OVERLAY
   ========================================================= */

const functionsOverlay =
    document.createElement("div");

functionsOverlay.className =
    "jarvis-functions-overlay";


/* =========================================================
   FUNCTIONS PANEL
   ========================================================= */

const functionsPanel =
    document.createElement("div");

functionsPanel.className =
    "jarvis-functions-panel";


functionsPanel.innerHTML = `

    <div class="jarvis-functions-head">

        <div class="jarvis-functions-heading">

            <img
                src="logo.png"
                class="jarvis-functions-heading-icon"
                alt="AI Assistant"
            >

            <div class="jarvis-functions-heading-text">

                <strong>Functions</strong>

                <span>
                    Choose a tool to get started
                </span>

            </div>

        </div>

        <button
            type="button"
            class="jarvis-functions-close"
            aria-label="Close"
        >
            ×
        </button>

    </div>


    <div class="jarvis-functions-grid">


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="camera"
        >

            <div class="jarvis-function-icon">
                📷
            </div>

            <div class="jarvis-function-text">

                <strong>Camera</strong>

                <span>
                    Take a photo
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="images"
        >

            <div class="jarvis-function-icon">
                🖼️
            </div>

            <div class="jarvis-function-text">

                <strong>Images</strong>

                <span>
                    Upload or generate images
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="files"
        >

            <div class="jarvis-function-icon">
                📎
            </div>

            <div class="jarvis-function-text">

                <strong>Files</strong>

                <span>
                    Upload files from device
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="drive"
        >

            <div class="jarvis-function-icon">
                📁
            </div>

            <div class="jarvis-function-text">

                <strong>Drive</strong>

                <span>
                    Access files from Google Drive
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="search"
        >

            <div class="jarvis-function-icon">
                🔍
            </div>

            <div class="jarvis-function-text">

                <strong>Search</strong>

                <span>
                    Search on the web
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="code"
        >

            <div class="jarvis-function-icon">
                💻
            </div>

            <div class="jarvis-function-text">

                <strong>Code</strong>

                <span>
                    Write, explain & debug code
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="learn"
        >

            <div class="jarvis-function-icon">
                📚
            </div>

            <div class="jarvis-function-text">

                <strong>Learn</strong>

                <span>
                    Explain any topic
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


        <button
            type="button"
            class="jarvis-function-item"
            data-tool="settings"
        >

            <div class="jarvis-function-icon">
                ⚙️
            </div>

            <div class="jarvis-function-text">

                <strong>Settings</strong>

                <span>
                    Customize your experience
                </span>

            </div>

            <div class="jarvis-function-arrow">
                →
            </div>

        </button>


    </div>


    <div class="jarvis-search-box">

        <input
            class="jarvis-search-input"
            type="text"
            placeholder="What do you want to search?"
        >

        <button
            type="button"
            class="jarvis-search-go"
        >
            Go
        </button>

    </div>

`;


document.body.appendChild(
    functionsOverlay
);

document.body.appendChild(
    functionsPanel
);


/* =========================================================
   CAMERA MODAL
   ========================================================= */

const cameraModal =
    document.createElement("div");

cameraModal.className =
    "jarvis-camera-modal";


cameraModal.innerHTML = `

    <div class="jarvis-camera-card">

        <video
            id="jarvis-camera-video"
            autoplay
            playsinline
        ></video>

        <div class="jarvis-camera-actions">

            <button
                type="button"
                class="jarvis-camera-capture"
            >
                📸 Capture
            </button>

            <button
                type="button"
                class="jarvis-camera-cancel"
            >
                Cancel
            </button>

        </div>

    </div>

`;


document.body.appendChild(
    cameraModal
);


const cameraVideo =
    document.getElementById(
        "jarvis-camera-video"
    );


/* =========================================================
   FUNCTIONS PANEL OPEN / CLOSE
   ========================================================= */

function openFunctionsPanel() {

    functionsOverlay.classList.add(
        "show"
    );

    functionsPanel.classList.add(
        "show"
    );
}


function closeFunctionsPanel() {

    functionsOverlay.classList.remove(
        "show"
    );

    functionsPanel.classList.remove(
        "show"
    );

    const searchBox =
        functionsPanel.querySelector(
            ".jarvis-search-box"
        );

    searchBox?.classList.remove(
        "show"
    );
}


function toggleFunctionsPanel() {

    if (
        functionsPanel.classList.contains(
            "show"
        )
    ) {

        closeFunctionsPanel();

    } else {

        openFunctionsPanel();
    }
}


functionsOverlay.addEventListener(
    "click",
    closeFunctionsPanel
);


functionsPanel
    .querySelector(
        ".jarvis-functions-close"
    )
    .addEventListener(
        "click",
        closeFunctionsPanel
    );


/* =========================================================
   FUNCTIONS BUTTONS
   SUPPORT MULTIPLE HTML IDs
   ========================================================= */

const possibleFunctionButtons = [
    "#functions-btn",
    "#functions-button",
    ".functions-btn",
    ".functions-button"
];


possibleFunctionButtons.forEach(
    selector => {

        document
            .querySelectorAll(selector)
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        toggleFunctionsPanel();
                    }
                );

            });

    }
);


/* =========================================================
   ATTACH BUTTON
   ========================================================= */

if (attachBtn) {

    attachBtn.textContent = "+";

    attachBtn.title =
        "Functions";

    attachBtn.setAttribute(
        "aria-label",
        "Open functions"
    );

    attachBtn.style.fontSize =
        "25px";

    attachBtn.style.fontWeight =
        "500";

    attachBtn.onclick = event => {

        event.preventDefault();

        toggleFunctionsPanel();
    };
}


/* =========================================================
   LOAD SAVED CONVERSATION
   ========================================================= */

function loadSaved() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );


        if (Array.isArray(saved)) {

            conversation =
                saved.filter(message => {

                    return (
                        message &&
                        (
                            message.role ===
                                "user" ||
                            message.role ===
                                "assistant"
                        ) &&
                        typeof message.content ===
                            "string" &&
                        message.content.trim()
                    );

                });

        }

    } catch (error) {

        console.error(
            "Conversation load error:",
            error
        );

        conversation = [];
    }
}


/* =========================================================
   SAVE CONVERSATION
   ========================================================= */

function saveConversation() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(conversation)
        );

    } catch (error) {

        console.error(
            "Conversation save error:",
            error
        );
    }
}


/* =========================================================
   WELCOME
   ========================================================= */

function removeWelcome() {

    chatBox
        ?.querySelector(
            ".welcome"
        )
        ?.remove();
}


function showWelcome() {

    if (!chatBox) return;

    chatBox.innerHTML = `

        <div class="welcome">

            <div class="welcome-icon">

                <img
                    src="logo.png"
                    alt="AI Assistant"
                    style="
                        width:70px;
                        height:70px;
                        object-fit:contain;
                        border-radius:50%;
                    "
                >

            </div>


            <h1>
                How can I help you today?
            </h1>


            <p>
                I'm your AI Assistant.
                Ask me anything, write code,
                learn something new,
                or have a conversation.
            </p>


            <div class="suggestions">


                <button
                    class="suggestion"
                    data-message="Explain quantum computing in simple words."
                >

                    📚

                    <span>

                        <strong>
                            Explain
                        </strong>

                        <small>
                            Explain anything simply
                        </small>

                    </span>

                </button>


                <button
                    class="suggestion"
                    data-message="Write a Python program to sort a list."
                >

                    💻

                    <span>

                        <strong>
                            Write
                        </strong>

                        <small>
                            Create or fix code
                        </small>

                    </span>

                </button>


                <button
                    class="suggestion"
                    data-message="Help me create an image prompt for a futuristic city."
                >

                    🖼️

                    <span>

                        <strong>
                            Create
                        </strong>

                        <small>
                            Create something new
                        </small>

                    </span>

                </button>


                <button
                    class="suggestion"
                    data-message="Create a 30 day plan to learn AI."
                >

                    🎓

                    <span>

                        <strong>
                            Study
                        </strong>

                        <small>
                            Learn step by step
                        </small>

                    </span>

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

    if (!chatBox) return;

    removeWelcome();


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "message-row user-row";


    const inner =
        document.createElement(
            "div"
        );

    inner.className =
        "message-inner";


    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "avatar user-avatar";

    avatar.textContent =
        "👤";


    const content =
        document.createElement(
            "div"
        );

    content.className =
        "message-content user-content";

    content.textContent =
        text;


    inner.append(
        avatar,
        content
    );


    row.appendChild(
        inner
    );


    chatBox.appendChild(
        row
    );


    scrollToBottom();
}


/* =========================================================
   AI MESSAGE
   ========================================================= */

function createAIMessage() {

    removeWelcome();


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "message-row bot-row";


    const inner =
        document.createElement(
            "div"
        );

    inner.className =
        "message-inner";


    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "avatar bot-avatar";


    const logo =
        document.createElement(
            "img"
        );

    logo.src =
        "logo.png";

    logo.alt =
        "AI Assistant";

    logo.style.width =
        "26px";

    logo.style.height =
        "26px";

    logo.style.objectFit =
        "contain";

    logo.style.borderRadius =
        "50%";


    avatar.appendChild(
        logo
    );


    const content =
        document.createElement(
            "div"
        );

    content.className =
        "message-content markdown-content";


    content.innerHTML = `

        <div class="typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "message-actions hidden";


    const regenerate =
        document.createElement(
            "button"
        );

    regenerate.textContent =
        "↻ Regenerate";

    regenerate.className =
        "action-btn";


    regenerate.onclick =
        regenerateLast;


    const copy =
        document.createElement(
            "button"
        );

    copy.textContent =
        "Copy";

    copy.className =
        "action-btn";


    copy.onclick =
        async () => {

            try {

                await navigator.clipboard.writeText(
                    content.dataset.raw || ""
                );

                copy.textContent =
                    "Copied!";

                setTimeout(() => {

                    copy.textContent =
                        "Copy";

                }, 1200);

            } catch {

                copy.textContent =
                    "Failed";
            }

        };


    actions.append(
        regenerate,
        copy
    );


    inner.append(
        avatar,
        content
    );


    row.appendChild(
        inner
    );


    row.appendChild(
        actions
    );


    chatBox.appendChild(
        row
    );


    scrollToBottom();


    return {
        row,
        content,
        actions,
        copy
    };
}


/* =========================================================
   ENHANCE CODE BLOCKS
   ========================================================= */

function enhanceCodeBlocks(container) {

    if (!container) return;


    container
        .querySelectorAll(
            "pre code"
        )
        .forEach(code => {

            try {

                if (
                    window.hljs
                ) {

                    window.hljs
                        .highlightElement(
                            code
                        );
                }

            } catch (error) {

                console.warn(
                    "Highlight error:",
                    error
                );
            }


            const pre =
                code.parentElement;


            if (!pre) return;


            if (
                pre.parentElement &&
                pre.parentElement.classList.contains(
                    "code-container"
                )
            ) {

                return;
            }


            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.className =
                "code-container";


            const header =
                document.createElement(
                    "div"
                );

            header.className =
                "code-header";


            const language =
                [...code.classList]
                    .find(
                        c =>
                            c.startsWith(
                                "language-"
                            )
                    )
                    ?.replace(
                        "language-",
                        ""
                    ) ||
                    "code";


            const languageLabel =
                document.createElement(
                    "span"
                );

            languageLabel.textContent =
                language;


            const copy =
                document.createElement(
                    "button"
                );

            copy.type =
                "button";

            copy.textContent =
                "Copy";


            copy.onclick =
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            code.textContent
                        );

                        copy.textContent =
                            "Copied!";

                        setTimeout(() => {

                            copy.textContent =
                                "Copy";

                        }, 1200);

                    } catch {

                        copy.textContent =
                            "Failed";
                    }

                };


            header.append(
                languageLabel,
                copy
            );


            pre.replaceWith(
                wrapper
            );


            wrapper.append(
                header,
                pre
            );

        });


    container
        .querySelectorAll(
            "a"
        )
        .forEach(a => {

            a.target =
                "_blank";

            a.rel =
                "noopener noreferrer";

        });
}


/* =========================================================
   TYPE RESPONSE
   ========================================================= */

async function typeResponse(
    target,
    text
) {

    if (!target) return;


    target.dataset.raw =
        text;


    target.innerHTML =
        renderMarkdown(text);


    enhanceCodeBlocks(
        target
    );


    scrollToBottom();
}


/* =========================================================
   SOURCES
   ========================================================= */

function addSources(
    row,
    sources
) {

    if (
        !row ||
        !Array.isArray(sources) ||
        !sources.length
    ) {

        return;
    }


    const box =
        document.createElement(
            "div"
        );

    box.className =
        "sources";


    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        "Sources";


    box.appendChild(
        title
    );


    sources.forEach(
        source => {

            if (
                !source ||
                !source.url
            ) {

                return;
            }


            const link =
                document.createElement(
                    "a"
                );

            link.href =
                source.url;

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";

            link.textContent =
                source.title ||
                source.url;


            box.appendChild(
                link
            );

        }
    );


    row.appendChild(
        box
    );
}


/* =========================================================
   RENDER CONVERSATION
   ========================================================= */

function renderConversation() {

    if (!chatBox) return;


    chatBox.innerHTML =
        "";


    if (!conversation.length) {

        showWelcome();

        return;
    }


    conversation.forEach(
        message => {

            if (
                message.role ===
                "user"
            ) {

                addUserMessage(
                    message.content
                );

            } else {

                const msg =
                    createAIMessage();


                msg.content.innerHTML =
                    renderMarkdown(
                        message.content
                    );


                msg.content.dataset.raw =
                    message.content;


                enhanceCodeBlocks(
                    msg.content
                );


                msg.actions.classList.remove(
                    "hidden"
                );
            }

        }
    );


    scrollToBottom();
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    if (isSending) {
        return;
    }


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (
        !text &&
        !pendingAttachment
    ) {

        return;
    }


    isSending =
        true;


    abortController =
        new AbortController();


    sendBtn?.classList.add(
        "hidden"
    );

    stopBtn?.classList.remove(
        "hidden"
    );


    input.disabled =
        true;


    let finalText =
        text;


    if (
        !finalText &&
        pendingAttachment
    ) {

        finalText =
            `Please analyze the attached file: ${pendingAttachment.name}`;
    }


    if (
        finalText &&
        pendingAttachment
    ) {

        finalText +=
            `\n\n[Attached file: ${pendingAttachment.name}]`;
    }


    addUserMessage(
        finalText
    );


    conversation.push({
        role: "user",
        content: finalText
    });


    saveConversation();


    input.value =
        "";

    input.style.height =
        "auto";


    const ai =
        createAIMessage();


    try {

        /*
         ====================================================
         IMPORTANT:
         BACKEND API IS NOT CHANGED
         ====================================================
        */

        const response =
            await fetch(
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
                        messages:
                            conversation
                    }),

                    signal:
                        abortController.signal
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Server ne valid JSON response nahi diya."
            );
        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Server error ${response.status}`
            );
        }


        const reply =
            String(
                data?.reply || ""
            ).trim();


        if (!reply) {

            throw new Error(
                "AI ne koi response nahi diya."
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

        console.error(
            "Send error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            ai.content.innerHTML = `

                <div class="error-box">

                    ❌
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}

                </div>

            `;

        }

    } finally {

        isSending =
            false;


        abortController =
            null;


        input.disabled =
            false;


        sendBtn?.classList.remove(
            "hidden"
        );


        stopBtn?.classList.add(
            "hidden"
        );


        pendingAttachment =
            null;


        if (
            attachmentPreview
        ) {

            attachmentPreview.innerHTML =
                "";

        }


        if (fileInput) {

            fileInput.value =
                "";
        }


        input.focus();

        scrollToBottom();
    }
}


/* =========================================================
   STOP GENERATION
   ========================================================= */

function stopGeneration() {

    if (
        abortController
    ) {

        abortController.abort();
    }
}


/* =========================================================
   REGENERATE
   ========================================================= */

async function regenerateLast() {

    if (
        isSending ||
        !conversation.length
    ) {

        return;
    }


    const lastUserIndex =
        [...conversation]
            .map(
                message =>
                    message.role
            )
            .lastIndexOf(
                "user"
            );


    if (
        lastUserIndex < 0
    ) {

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

    if (
        isSending
    ) {

        return;
    }


    isSending =
        true;


    abortController =
        new AbortController();


    sendBtn?.classList.add(
        "hidden"
    );

    stopBtn?.classList.remove(
        "hidden"
    );


    input.disabled =
        true;


    const ai =
        createAIMessage();


    try {

        const response =
            await fetch(
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
                        messages:
                            conversation
                    }),

                    signal:
                        abortController.signal
                }
            );


        let data;


        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Invalid server response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Server error ${response.status}`
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

        console.error(
            "Regenerate error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            ai.content.innerHTML = `

                <div class="error-box">

                    ❌
                    ${escapeHtml(
                        error.message
                    )}

                </div>

            `;
        }

    } finally {

        isSending =
            false;


        abortController =
            null;


        input.disabled =
            false;


        sendBtn?.classList.remove(
            "hidden"
        );


        stopBtn?.classList.add(
            "hidden"
        );


        input.focus();
    }
}


/* =========================================================
   NEW CHAT / CLEAR
   ========================================================= */

function clearAll() {

    if (isSending) {

        stopGeneration();
    }


    conversation =
        [];


    localStorage.removeItem(
        STORAGE_KEY
    );


    renderConversation();

    updateHistory();


    if (input) {

        input.value =
            "";

        input.style.height =
            "auto";

        input.focus();
    }


    pendingAttachment =
        null;


    if (
        attachmentPreview
    ) {

        attachmentPreview.innerHTML =
            "";
    }


    if (fileInput) {

        fileInput.value =
            "";
    }
}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function attachSuggestions() {

    document
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        if (!input)
                            return;


                        input.value =
                            button.dataset.message ||
                            "";


                        input.focus();


                        sendMessage();
                    };

            }
        );
}


/* =========================================================
   CHAT HISTORY
   ========================================================= */

function updateHistory() {

    if (!historyList) {
        return;
    }


    historyList.innerHTML =
        "";


    const userMessages =
        conversation
            .filter(
                message =>
                    message.role ===
                    "user"
            )
            .slice(-10)
            .reverse();


    userMessages.forEach(
        message => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "history-item";


            item.textContent =
                message.content
                    .replace(
                        /\n/g,
                        " "
                    )
                    .slice(
                        0,
                        45
                    );


            item.title =
                message.content;


            item.onclick =
                () => {

                    if (
                        chatBox
                    ) {

                        chatBox.scrollTo({
                            top: 0,
                            behavior:
                                "smooth"
                        });

                    }

                };


            historyList.appendChild(
                item
            );

        }
    );
}


/* =========================================================
   ATTACHMENT
   ========================================================= */

function setAttachment(file) {

    if (!file) {
        return;
    }


    pendingAttachment =
        file;


    if (!attachmentPreview) {
        return;
    }


    attachmentPreview.innerHTML = `

        <div class="jarvis-attachment-chip">

            📎

            <span>
                ${escapeHtml(
                    file.name
                )}
            </span>

            <button
                type="button"
                class="jarvis-remove-attachment"
                aria-label="Remove attachment"
            >
                ×
            </button>

        </div>

    `;


    attachmentPreview
        .querySelector(
            ".jarvis-remove-attachment"
        )
        ?.addEventListener(
            "click",
            () => {

                pendingAttachment =
                    null;


                if (fileInput) {

                    fileInput.value =
                        "";
                }


                attachmentPreview.innerHTML =
                    "";

            }
        );
}


/* =========================================================
   FILE INPUT
   ========================================================= */

fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];


        if (file) {

            setAttachment(
                file
            );
        }

    }
);


/* =========================================================
   FUNCTION ITEMS
   ========================================================= */

const functionItems =
    functionsPanel.querySelectorAll(
        ".jarvis-function-item"
    );


functionItems.forEach(
    item => {

        item.addEventListener(
            "click",
            async () => {

                const tool =
                    item.dataset.tool;


                /* =========================================
                   CAMERA
                   ========================================= */

                if (
                    tool ===
                    "camera"
                ) {

                    closeFunctionsPanel();

                    openCamera();

                    return;
                }


                /* =========================================
                   IMAGES
                   ========================================= */

                if (
                    tool ===
                    "images"
                ) {

                    closeFunctionsPanel();


                    const imagePicker =
                        document.createElement(
                            "input"
                        );


                    imagePicker.type =
                        "file";


                    imagePicker.accept =
                        "image/*";


                    imagePicker.onchange =
                        () => {

                            const file =
                                imagePicker.files?.[0];


                            if (file) {

                                setAttachment(
                                    file
                                );
                            }

                        };


                    imagePicker.click();


                    return;
                }


                /* =========================================
                   FILES
                   ========================================= */

                if (
                    tool ===
                    "files"
                ) {

                    closeFunctionsPanel();

                    fileInput?.click();

                    return;
                }


                /* =========================================
                   DRIVE
                   ========================================= */

                if (
                    tool ===
                    "drive"
                ) {

                    alert(
                        "Google Drive connect karne ke liye Google OAuth / Drive API setup required hai."
                    );

                    return;
                }


                /* =========================================
                   SEARCH
                   ========================================= */

                if (
                    tool ===
                    "search"
                ) {

                    const searchBox =
                        functionsPanel.querySelector(
                            ".jarvis-search-box"
                        );


                    searchBox?.classList.toggle(
                        "show"
                    );


                    searchBox
                        ?.querySelector(
                            ".jarvis-search-input"
                        )
                        ?.focus();


                    return;
                }


                /* =========================================
                   CODE
                   ========================================= */

                if (
                    tool ===
                    "code"
                ) {

                    closeFunctionsPanel();


                    input.value =
                        "Help me write, explain, debug or improve this code:";


                    input.focus();


                    return;
                }


                /* =========================================
                   LEARN
                   ========================================= */

                if (
                    tool ===
                    "learn"
                ) {

                    closeFunctionsPanel();


                    input.value =
                        "Explain this topic to me step by step in simple language:";


                    input.focus();


                    return;
                }


                /* =========================================
                   SETTINGS
                   ========================================= */

                if (
                    tool ===
                    "settings"
                ) {

                    closeFunctionsPanel();

                    openSettings();

                    return;
                }

            }
        );

    }
);


/* =========================================================
   SEARCH
   ========================================================= */

const searchInput =
    functionsPanel.querySelector(
        ".jarvis-search-input"
    );


const searchGo =
    functionsPanel.querySelector(
        ".jarvis-search-go"
    );


function useSearch() {

    const query =
        searchInput?.value.trim();


    if (!query) {
        return;
    }


    if (!input) {
        return;
    }


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
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            useSearch();
        }

    }
);


/* =========================================================
   CAMERA
   ========================================================= */

async function openCamera() {

    cameraModal.classList.add(
        "show"
    );


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        cameraModal.classList.remove(
            "show"
        );


        alert(
            "Is browser me camera support available nahi hai."
        );


        return;
    }


    try {

        cameraStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode:
                        {
                            ideal:
                                "environment"
                        }
                },

                audio: false
            });


        cameraVideo.srcObject =
            cameraStream;

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );


        cameraModal.classList.remove(
            "show"
        );


        alert(
            "Camera open nahi ho saka. Browser me camera permission allow karein."
        );
    }
}


/* =========================================================
   CLOSE CAMERA
   ========================================================= */

function closeCamera() {

    if (
        cameraStream
    ) {

        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );


        cameraStream =
            null;
    }


    if (cameraVideo) {

        cameraVideo.srcObject =
            null;
    }


    cameraModal.classList.remove(
        "show"
    );
}


/* =========================================================
   CAMERA CANCEL
   ========================================================= */

cameraModal
    .querySelector(
        ".jarvis-camera-cancel"
    )
    .addEventListener(
        "click",
        closeCamera
    );


/* =========================================================
   CAMERA CAPTURE
   ========================================================= */

cameraModal
    .querySelector(
        ".jarvis-camera-capture"
    )
    .addEventListener(
        "click",
        () => {

            if (
                !cameraVideo ||
                !cameraVideo.videoWidth
            ) {

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
                canvas.getContext(
                    "2d"
                );


            if (!ctx) {
                return;
            }


            ctx.drawImage(
                cameraVideo,
                0,
                0,
                canvas.width,
                canvas.height
            );


            canvas.toBlob(
                blob => {

                    if (!blob) {
                        return;
                    }


                    const file =
                        new File(
                            [blob],
                            `camera-photo-${Date.now()}.jpg`,
                            {
                                type:
                                    "image/jpeg"
                            }
                        );


                    setAttachment(
                        file
                    );


                    closeCamera();

                },
                "image/jpeg",
                0.92
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
                ? "Dark Mode ON hai.\n\nOK = Light Mode"
                : "Light Mode ON hai.\n\nOK = Dark Mode"
        );


    if (result) {

        toggleTheme();
    }
}


/* =========================================================
   LOAD THEME
   ========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        theme ===
        "dark"
    ) {

        document.body.classList.add(
            "nandu-theme-dark"
        );

    } else {

        document.body.classList.remove(
            "nandu-theme-dark"
        );
    }
}


/* =========================================================
   TOGGLE THEME
   ========================================================= */

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
   OPTIONAL THEME BUTTONS
   ========================================================= */

const themeButtons = [
    "#theme-btn",
    "#theme-toggle",
    ".theme-btn",
    ".theme-toggle"
];


themeButtons.forEach(
    selector => {

        document
            .querySelectorAll(
                selector
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        toggleTheme
                    );

                }
            );

    }
);


/* =========================================================
   SEND BUTTON
   ========================================================= */

sendBtn?.addEventListener(
    "click",
    sendMessage
);


/* =========================================================
   STOP BUTTON
   ========================================================= */

stopBtn?.addEventListener(
    "click",
    stopGeneration
);


/* =========================================================
   ENTER TO SEND
   ========================================================= */

input?.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }

    }
);


/* =========================================================
   AUTO RESIZE TEXTAREA
   ========================================================= */

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


/* =========================================================
   NEW CHAT
   ========================================================= */

newChatBtn?.addEventListener(
    "click",
    clearAll
);


/* =========================================================
   CLEAR CHAT
   ========================================================= */

clearChatBtn?.addEventListener(
    "click",
    clearAll
);


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

menuBtn?.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        sidebar?.classList.toggle(
            "open"
        );

    }
);


document.addEventListener(
    "click",
    event => {

        if (
            window.innerWidth <=
            768 &&
            sidebar &&
            sidebar.classList.contains(
                "open"
            ) &&
            !sidebar.contains(
                event.target
            ) &&
            !menuBtn?.contains(
                event.target
            )
        ) {

            sidebar.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeFunctionsPanel();

            closeCamera();

            sidebar?.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   WINDOW RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            window.innerWidth >
            768
        ) {

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
    "AI JARVIS FINAL script.js loaded successfully."
);
