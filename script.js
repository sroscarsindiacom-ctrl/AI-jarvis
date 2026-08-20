/* =========================================================
   AI NANDU / JARVIS - FINAL script.js
   =========================================================
   Compatible with your current HTML.

   FEATURES
   ✓ /api/chat
   ✓ Send button
   ✓ Enter to send
   ✓ Shift + Enter = new line
   ✓ Stop generation
   ✓ New Chat
   ✓ Clear Chat
   ✓ LocalStorage conversation
   ✓ Recent Chats
   ✓ Mobile sidebar
   ✓ Functions panel
   ✓ Camera
   ✓ Photos
   ✓ Files
   ✓ Google Drive
   ✓ Search mode
   ✓ Code mode
   ✓ Learn mode
   ✓ Settings
   ✓ Dark / Light mode
   ✓ Markdown
   ✓ DOMPurify
   ✓ Highlight.js
   ✓ Code copy
   ✓ Regenerate
   ✓ Sources
   ✓ Attachment preview
   ✓ Error handling
   ✓ No duplicate Functions panel
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
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
const attachmentPreview =
    document.getElementById("attachment-preview");

const historyList =
    document.getElementById("history-list");

const functionsOverlay =
    document.getElementById("functions-overlay");

const functionsPanel =
    document.getElementById("functions-panel");

const settingsOverlay =
    document.getElementById("settings-overlay");

const themeToggle =
    document.getElementById("theme-toggle");


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

let currentTool = null;


/* =========================================================
   JARVIS / AI NANDU CSS
   ========================================================= */

(function injectNanduCSS() {

    if (document.getElementById("nandu-final-css")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "nandu-final-css";

    style.textContent = `

    /* ================================================
       GENERAL
       ================================================ */

    body {
        background:
            radial-gradient(
                circle at 65% 30%,
                rgba(39,92,190,.12),
                transparent 35%
            ),
            linear-gradient(
                135deg,
                #01060d,
                #03101e 55%,
                #020814
            ) !important;

        color: #f5f7ff;
    }


    /* ================================================
       SIDEBAR
       ================================================ */

    #sidebar {
        background:
            linear-gradient(
                180deg,
                rgba(3,12,24,.98),
                rgba(2,8,17,.99)
            ) !important;

        border-right:
            1px solid
            rgba(79,131,210,.20) !important;
    }


    /* ================================================
       TOPBAR
       ================================================ */

    .topbar {
        background:
            rgba(2,9,18,.86) !important;

        border-bottom:
            1px solid
            rgba(84,128,200,.16) !important;

        backdrop-filter:
            blur(18px);
    }


    /* ================================================
       CHAT
       ================================================ */

    #chat-box {
        background:
            radial-gradient(
                circle at center,
                rgba(29,77,150,.07),
                transparent 50%
            ) !important;
    }


    /* ================================================
       INPUT
       ================================================ */

    #user-input {
        background:
            rgba(7,17,30,.92) !important;

        color:
            #ffffff !important;

        border:
            1px solid
            rgba(78,130,207,.28) !important;

        outline:
            none !important;
    }


    #user-input::placeholder {
        color:
            #77859a !important;
    }


    /* ================================================
       SEND
       ================================================ */

    #send-btn {
        width:
            56px !important;

        height:
            56px !important;

        min-width:
            56px !important;

        border-radius:
            50% !important;

        border:
            0 !important;

        background:
            linear-gradient(
                135deg,
                #287cff,
                #6948ff
            ) !important;

        color:
            white !important;

        display:
            flex !important;

        align-items:
            center !important;

        justify-content:
            center !important;

        cursor:
            pointer !important;

        box-shadow:
            0 8px 28px
            rgba(46,105,255,.35) !important;

        transition:
            .2s ease !important;
    }


    #send-btn:hover {
        transform:
            translateY(-2px)
            scale(1.04);
    }


    #send-btn:active {
        transform:
            scale(.95);
    }


    /* ================================================
       STOP
       ================================================ */

    #stop-btn {
        width:
            56px !important;

        height:
            56px !important;

        min-width:
            56px !important;

        border-radius:
            50% !important;

        border:
            0 !important;

        background:
            linear-gradient(
                135deg,
                #ef4444,
                #b91c1c
            ) !important;

        color:
            white !important;

        cursor:
            pointer !important;
    }


    /* ================================================
       FUNCTIONS PANEL
       ================================================ */

    #functions-overlay {
        z-index:
            8000 !important;

        backdrop-filter:
            blur(5px);
    }


    #functions-panel {
        z-index:
            8001 !important;

        box-shadow:
            0 0 40px
            rgba(34,105,255,.20),
            0 25px 80px
            rgba(0,0,0,.60);
    }


    /* ================================================
       SETTINGS
       ================================================ */

    #settings-overlay {
        z-index:
            8100 !important;
    }


    /* ================================================
       MESSAGE
       ================================================ */

    .message-content {
        color:
            #edf3ff;
    }


    .user-content {
        background:
            linear-gradient(
                135deg,
                #1458c8,
                #5638cc
            ) !important;

        color:
            white !important;
    }


    /* ================================================
       CODE
       ================================================ */

    .nandu-code-wrapper {
        margin:
            12px 0;

        border:
            1px solid
            rgba(86,127,190,.28);

        border-radius:
            12px;

        overflow:
            hidden;

        background:
            #030914;
    }


    .nandu-code-header {
        display:
            flex;

        align-items:
            center;

        justify-content:
            space-between;

        padding:
            8px 11px;

        background:
            #0b1728;

        color:
            #8da1ba;

        font-size:
            12px;
    }


    .nandu-copy-code {
        border:
            1px solid
            #334155;

        background:
            #111e30;

        color:
            #dbeafe;

        border-radius:
            7px;

        padding:
            5px 10px;

        cursor:
            pointer;
    }


    /* ================================================
       SOURCES
       ================================================ */

    .nandu-sources {
        display:
            flex;

        flex-direction:
            column;

        gap:
            6px;

        margin-top:
            12px;

        padding:
            12px;

        border:
            1px solid
            rgba(78,130,207,.20);

        border-radius:
            12px;

        background:
            rgba(7,18,33,.60);
    }


    .nandu-sources-title {
        font-weight:
            700;

        color:
            #dbeafe;
    }


    .nandu-sources a {
        color:
            #75aaff;

        text-decoration:
            none;

        font-size:
            13px;
    }


    .nandu-sources a:hover {
        text-decoration:
            underline;
    }


    /* ================================================
       ERROR
       ================================================ */

    .nandu-error {
        padding:
            12px;

        border-radius:
            10px;

        background:
            rgba(127,29,29,.30);

        border:
            1px solid
            rgba(248,113,113,.30);

        color:
            #fecaca;
    }


    /* ================================================
       TYPING
       ================================================ */

    .nandu-typing {
        display:
            flex;

        align-items:
            center;

        gap:
            5px;

        padding:
            6px 2px;
    }


    .nandu-typing span {
        width:
            7px;

        height:
            7px;

        border-radius:
            50%;

        background:
            #7da7ff;

        animation:
            nanduTyping 1.1s infinite ease-in-out;
    }


    .nandu-typing span:nth-child(2) {
        animation-delay:
            .15s;
    }


    .nandu-typing span:nth-child(3) {
        animation-delay:
            .30s;
    }


    @keyframes nanduTyping {

        0%, 80%, 100% {
            opacity:
                .25;

            transform:
                translateY(0);
        }

        40% {
            opacity:
                1;

            transform:
                translateY(-4px);
        }
    }


    /* ================================================
       ATTACHMENT
       ================================================ */

    #attachment-preview {
        color:
            #dbeafe;
    }


    .nandu-attachment {
        display:
            inline-flex;

        align-items:
            center;

        gap:
            8px;

        padding:
            8px 12px;

        margin-bottom:
            8px;

        border:
            1px solid
            rgba(80,130,220,.25);

        border-radius:
            10px;

        background:
            rgba(7,20,40,.75);
    }


    .nandu-remove-attachment {
        border:
            0;

        background:
            transparent;

        color:
            #f87171;

        font-size:
            18px;

        cursor:
            pointer;
    }


    /* ================================================
       ACTION BUTTONS
       ================================================ */

    .nandu-message-actions {
        display:
            flex;

        gap:
            8px;

        margin:
            7px 0 15px 55px;
    }


    .nandu-action-btn {
        border:
            1px solid
            rgba(100,130,180,.25);

        background:
            rgba(8,20,36,.85);

        color:
            #cbd5e1;

        border-radius:
            8px;

        padding:
            6px 10px;

        cursor:
            pointer;

        font-size:
            12px;
    }


    .nandu-action-btn:hover {
        background:
            rgba(28,62,110,.85);

        color:
            white;
    }


    /* ================================================
       MOBILE
       ================================================ */

    @media (max-width: 768px) {

        #sidebar {
            position:
                fixed !important;

            left:
                0 !important;

            top:
                0 !important;

            bottom:
                0 !important;

            width:
                285px !important;

            z-index:
                7000 !important;

            transform:
                translateX(-105%) !important;

            transition:
                transform .25s ease !important;
        }


        #sidebar.open {
            transform:
                translateX(0) !important;
        }


        #send-btn,
        #stop-btn {
            width:
                50px !important;

            height:
                50px !important;

            min-width:
                50px !important;
        }

    }

    `;

    document.head.appendChild(style);

})();


/* =========================================================
   STORAGE
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


function loadConversation() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );

        if (!Array.isArray(saved)) {
            conversation = [];
            return;
        }

        conversation =
            saved.filter(message => {

                return (
                    message &&
                    (
                        message.role === "user" ||
                        message.role === "assistant"
                    ) &&
                    typeof message.content === "string"
                );

            });

    } catch (error) {

        console.error(
            "Conversation load error:",
            error
        );

        conversation = [];
    }
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}


/* =========================================================
   MARKDOWN
   ========================================================= */

function renderMarkdown(text) {

    const safeText =
        String(text ?? "");

    if (
        typeof marked === "undefined"
    ) {

        return escapeHtml(
            safeText
        ).replace(
            /\n/g,
            "<br>"
        );
    }

    try {

        marked.setOptions({
            breaks: true,
            gfm: true
        });

        const html =
            marked.parse(
                safeText
            );

        if (
            typeof DOMPurify !== "undefined"
        ) {

            return DOMPurify.sanitize(
                html,
                {
                    ADD_ATTR: [
                        "target",
                        "rel"
                    ]
                }
            );
        }

        return html;

    } catch (error) {

        console.error(
            "Markdown error:",
            error
        );

        return escapeHtml(
            safeText
        ).replace(
            /\n/g,
            "<br>"
        );
    }
}


/* =========================================================
   LINK SAFETY
   ========================================================= */

function secureLinks(container) {

    if (!container) {
        return;
    }

    container
        .querySelectorAll("a")
        .forEach(link => {

            link.target =
                "_blank";

            link.rel =
                "noopener noreferrer";

        });
}


/* =========================================================
   CODE BLOCKS
   ========================================================= */

function enhanceCodeBlocks(container) {

    if (!container) {
        return;
    }

    const codeBlocks =
        container.querySelectorAll(
            "pre code"
        );

    codeBlocks.forEach(code => {

        const pre =
            code.parentElement;

        if (!pre) {
            return;
        }

        if (
            pre.parentElement?.classList.contains(
                "nandu-code-wrapper"
            )
        ) {
            return;
        }

        try {

            if (
                window.hljs
            ) {

                hljs.highlightElement(
                    code
                );
            }

        } catch (error) {

            console.warn(
                "Highlight error:",
                error
            );
        }


        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "nandu-code-wrapper";


        const header =
            document.createElement(
                "div"
            );

        header.className =
            "nandu-code-header";


        let language =
            "code";


        [...code.classList]
            .forEach(className => {

                if (
                    className.startsWith(
                        "language-"
                    )
                ) {

                    language =
                        className.replace(
                            "language-",
                            ""
                        );
                }

            });


        const languageText =
            document.createElement(
                "span"
            );

        languageText.textContent =
            language;


        const copyButton =
            document.createElement(
                "button"
            );

        copyButton.type =
            "button";

        copyButton.className =
            "nandu-copy-code";

        copyButton.textContent =
            "Copy";


        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator
                        .clipboard
                        .writeText(
                            code.textContent
                        );

                    copyButton.textContent =
                        "Copied!";

                    setTimeout(
                        () => {

                            copyButton.textContent =
                                "Copy";

                        },
                        1200
                    );

                } catch {

                    copyButton.textContent =
                        "Failed";
                }

            }
        );


        header.append(
            languageText,
            copyButton
        );


        pre.parentNode.insertBefore(
            wrapper,
            pre
        );


        wrapper.append(
            header,
            pre
        );

    });


    secureLinks(
        container
    );
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    requestAnimationFrame(() => {

        if (!chatBox) {
            return;
        }

        chatBox.scrollTop =
            chatBox.scrollHeight;

    });
}


/* =========================================================
   WELCOME SCREEN
   ========================================================= */

function showWelcome() {

    if (!chatBox) {
        return;
    }

    chatBox.innerHTML = `

        <div class="welcome">

            <div class="welcome-icon">

                <img
                    src="logo.png"
                    alt="AI Nandu"
                    style="
                        width:110px;
                        height:110px;
                        object-fit:contain;
                        border-radius:50%;
                    "
                >

            </div>

            <h1>
                Hi Samir! 👋
            </h1>

            <p>
                How can I help you today?
            </p>

            <div class="suggestions">

                <button
                    class="suggestion"
                    type="button"
                    data-message="Explain quantum computing in simple words."
                >
                    📚
                    <span>
                        <strong>Explain</strong>
                        <small>
                            Explain any topic simply
                        </small>
                    </span>
                </button>


                <button
                    class="suggestion"
                    type="button"
                    data-message="Write a Python program to sort a list."
                >
                    💻
                    <span>
                        <strong>Write</strong>
                        <small>
                            Create or fix code
                        </small>
                    </span>
                </button>


                <button
                    class="suggestion"
                    type="button"
                    data-message="Create an image of a futuristic city."
                >
                    🖼️
                    <span>
                        <strong>Create</strong>
                        <small>
                            Create something new
                        </small>
                    </span>
                </button>


                <button
                    class="suggestion"
                    type="button"
                    data-message="Create a 30 day plan to learn AI."
                >
                    🎓
                    <span>
                        <strong>Study</strong>
                        <small>
                            Learn step by step
                        </small>
                    </span>
                </button>

            </div>

        </div>

    `;


    document
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (!input) {
                        return;
                    }

                    input.value =
                        button.dataset.message ||
                        "";

                    input.focus();

                    sendMessage();
                }
            );

        });

}


/* =========================================================
   REMOVE WELCOME
   ========================================================= */

function removeWelcome() {

    chatBox
        ?.querySelector(
            ".welcome"
        )
        ?.remove();

}


/* =========================================================
   USER MESSAGE
   ========================================================= */

function addUserMessage(text) {

    if (!chatBox) {
        return;
    }

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
        "AI Nandu";

    logo.style.width =
        "28px";

    logo.style.height =
        "28px";

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

        <div class="nandu-typing">

            <span></span>
            <span></span>
            <span></span>

        </div>

    `;


    inner.append(
        avatar,
        content
    );


    row.appendChild(
        inner
    );


    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "nandu-message-actions";


    actions.style.display =
        "none";


    const regenerate =
        document.createElement(
            "button"
        );

    regenerate.type =
        "button";

    regenerate.className =
        "nandu-action-btn";

    regenerate.textContent =
        "↻ Regenerate";


    regenerate.addEventListener(
        "click",
        regenerateLast
    );


    const copy =
        document.createElement(
            "button"
        );

    copy.type =
        "button";

    copy.className =
        "nandu-action-btn";

    copy.textContent =
        "Copy";


    copy.addEventListener(
        "click",
        async () => {

            try {

                await navigator
                    .clipboard
                    .writeText(
                        content.dataset.raw ||
                        ""
                    );

                copy.textContent =
                    "Copied!";

                setTimeout(
                    () => {

                        copy.textContent =
                            "Copy";

                    },
                    1200
                );

            } catch {

                copy.textContent =
                    "Failed";

            }

        }
    );


    actions.append(
        regenerate,
        copy
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
        actions
    };

}


/* =========================================================
   SOURCES
   ========================================================= */

function addSources(row, sources) {

    if (
        !row ||
        !Array.isArray(sources) ||
        !sources.length
    ) {
        return;
    }


    const validSources =
        sources.filter(
            source =>
                source &&
                source.url
        );


    if (!validSources.length) {
        return;
    }


    const box =
        document.createElement(
            "div"
        );

    box.className =
        "nandu-sources";


    const title =
        document.createElement(
            "div"
        );

    title.className =
        "nandu-sources-title";

    title.textContent =
        "Sources";


    box.appendChild(
        title
    );


    validSources.forEach(
        source => {

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

        <div class="nandu-attachment">

            <span>
                📎
                ${escapeHtml(file.name)}
            </span>

            <button
                type="button"
                class="nandu-remove-attachment"
                id="nandu-remove-attachment"
                aria-label="Remove attachment"
            >
                ×
            </button>

        </div>

    `;


    document
        .getElementById(
            "nandu-remove-attachment"
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
            setAttachment(file);
        }

        /* Restore normal accept after selection */

        fileInput.setAttribute(
            "accept",
            "image/*,.txt,.md,.json,.csv,.js,.html,.css,.py,.pdf,.doc,.docx,.xls,.xlsx"
        );

        fileInput.removeAttribute(
            "capture"
        );

    }
);


/* =========================================================
   SEND BUTTON STATE
   ========================================================= */

function setSendingState(sending) {

    isSending =
        sending;


    if (sending) {

        sendBtn?.classList.add(
            "hidden"
        );

        if (stopBtn) {

            stopBtn.classList.remove(
                "hidden"
            );

            stopBtn.disabled =
                false;
        }

        if (input) {
            input.disabled =
                true;
        }

    } else {

        sendBtn?.classList.remove(
            "hidden"
        );

        if (stopBtn) {

            stopBtn.classList.add(
                "hidden"
            );

            stopBtn.disabled =
                false;
        }

        if (input) {
            input.disabled =
                false;
        }

    }

}


/* =========================================================
   API MESSAGE
   ========================================================= */

async function requestAI(messages) {

    abortController =
        new AbortController();


    const response =
        await fetch(
            "/api/chat",
            {
                method:
                    "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        messages
                    }),

                signal:
                    abortController.signal
            }
        );


    let data;


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    if (
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        const text =
            await response.text();

        throw new Error(
            text ||
            `Server error ${response.status}`
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.error ||
            `Server error ${response.status}`
        );

    }


    return data;
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


    const finalText =
        text ||
        "Please analyze the attached file.";


    setSendingState(true);


    addUserMessage(
        finalText
    );


    conversation.push({
        role:
            "user",

        content:
            finalText
    });


    saveConversation();


    input.value =
        "";

    input.style.height =
        "auto";


    const ai =
        createAIMessage();


    try {

        const data =
            await requestAI(
                conversation
            );


        const reply =
            String(
                data?.reply ||
                ""
            ).trim();


        if (!reply) {

            throw new Error(
                "AI ne koi response nahi diya."
            );

        }


        ai.content.dataset.raw =
            reply;


        ai.content.innerHTML =
            renderMarkdown(
                reply
            );


        enhanceCodeBlocks(
            ai.content
        );


        ai.actions.style.display =
            "flex";


        addSources(
            ai.row,
            data.sources
        );


        conversation.push({
            role:
                "assistant",

            content:
                reply
        });


        saveConversation();


        updateHistory();


    } catch (error) {

        console.error(
            "AI request error:",
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

                <div class="nandu-error">

                    ❌
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}

                </div>

            `;

        }

    } finally {

        abortController =
            null;

        setSendingState(
            false
        );


        pendingAttachment =
            null;


        if (attachmentPreview) {

            attachmentPreview.innerHTML =
                "";

        }


        if (fileInput) {

            fileInput.value =
                "";

        }


        input?.focus();


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
   REGENERATE LAST ANSWER
   ========================================================= */

async function regenerateLast() {

    if (
        isSending ||
        !conversation.length
    ) {

        return;
    }


    const lastUserIndex =
        conversation
            .map(
                message =>
                    message.role
            )
            .lastIndexOf(
                "user"
            );


    if (
        lastUserIndex <
        0
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


    setSendingState(
        true
    );


    const ai =
        createAIMessage();


    try {

        const data =
            await requestAI(
                conversation
            );


        const reply =
            String(
                data?.reply ||
                ""
            ).trim();


        if (!reply) {

            throw new Error(
                "AI ne koi response nahi diya."
            );

        }


        ai.content.dataset.raw =
            reply;


        ai.content.innerHTML =
            renderMarkdown(
                reply
            );


        enhanceCodeBlocks(
            ai.content
        );


        ai.actions.style.display =
            "flex";


        addSources(
            ai.row,
            data.sources
        );


        conversation.push({
            role:
                "assistant",

            content:
                reply
        });


        saveConversation();


        updateHistory();


    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            ai.content.innerHTML = `

                <div class="nandu-error">

                    ❌
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}

                </div>

            `;

        }

    } finally {

        abortController =
            null;

        setSendingState(
            false
        );

        input?.focus();

    }

}


/* =========================================================
   RENDER SAVED CONVERSATION
   ========================================================= */

function renderConversation() {

    if (!chatBox) {
        return;
    }


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

                return;
            }


            if (
                message.role ===
                "assistant"
            ) {

                const ai =
                    createAIMessage();


                ai.content.dataset.raw =
                    message.content;


                ai.content.innerHTML =
                    renderMarkdown(
                        message.content
                    );


                enhanceCodeBlocks(
                    ai.content
                );


                ai.actions.style.display =
                    "flex";

            }

        }
    );


    scrollToBottom();

}


/* =========================================================
   HISTORY
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
        (message, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "history-item";


            button.textContent =
                message.content.length >
                45
                    ? message.content.slice(
                        0,
                        45
                    ) + "..."
                    : message.content;


            button.title =
                message.content;


            button.addEventListener(
                "click",
                () => {

                    /* Re-rendering keeps
                       the current saved chat */

                    renderConversation();

                }
            );


            historyList.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   NEW CHAT
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


    if (input) {

        input.value =
            "";

        input.style.height =
            "auto";

    }


    pendingAttachment =
        null;


    if (attachmentPreview) {

        attachmentPreview.innerHTML =
            "";

    }


    if (fileInput) {

        fileInput.value =
            "";

    }


    renderConversation();

    updateHistory();


    input?.focus();

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   MENU BUTTON
   ========================================================= */

menuBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        toggleSidebar();

    }
);


/* =========================================================
   CLOSE SIDEBAR OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            window.innerWidth >
            768
        ) {

            return;
        }


        if (
            !sidebar ||
            !sidebar.classList.contains(
                "open"
            )
        ) {

            return;
        }


        const insideSidebar =
            sidebar.contains(
                event.target
            );


        const menuClicked =
            menuBtn?.contains(
                event.target
            );


        if (
            !insideSidebar &&
            !menuClicked
        ) {

            sidebar.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   FUNCTIONS PANEL
   ========================================================= */

function toggleFunctions(event) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();

    }


    if (!functionsOverlay) {
        return;
    }


    functionsOverlay.classList.toggle(
        "show"
    );

}


function closeFunctions() {

    functionsOverlay?.classList.remove(
        "show"
    );

}


function closeFunctionsOutside(event) {

    if (
        event.target ===
        functionsOverlay
    ) {

        closeFunctions();

    }

}


/* =========================================================
   SEARCH / CODE / LEARN
   ========================================================= */

function selectTool(tool) {

    currentTool =
        tool;


    closeFunctions();


    if (!input) {
        return;
    }


    if (
        tool ===
        "search"
    ) {

        input.placeholder =
            "Ask AI Nandu to search for something...";

        input.value =
            "";

        input.focus();

        return;
    }


    if (
        tool ===
        "code"
    ) {

        input.placeholder =
            "Ask AI Nandu to write or debug code...";

        input.value =
            "";

        input.focus();

        return;
    }


    if (
        tool ===
        "learn"
    ) {

        input.placeholder =
            "What would you like AI Nandu to explain?";

        input.value =
            "";

        input.focus();

        return;
    }

}


/* =========================================================
   CAMERA
   ========================================================= */

function openCamera() {

    closeFunctions();


    if (!fileInput) {
        return;
    }


    fileInput.value =
        "";


    fileInput.setAttribute(
        "accept",
        "image/*"
    );


    /*
       capture=environment makes
       supported mobile browsers
       open the rear camera.
    */

    fileInput.setAttribute(
        "capture",
        "environment"
    );


    fileInput.click();

}


/* =========================================================
   GALLERY
   ========================================================= */

function openGallery() {

    closeFunctions();


    if (!fileInput) {
        return;
    }


    fileInput.value =
        "";


    fileInput.setAttribute(
        "accept",
        "image/*"
    );


    fileInput.removeAttribute(
        "capture"
    );


    fileInput.click();

}


/* =========================================================
   FILES
   ========================================================= */

function openFiles() {

    closeFunctions();


    if (!fileInput) {
        return;
    }


    fileInput.value =
        "";


    fileInput.setAttribute(
        "accept",
        "image/*,.txt,.md,.json,.csv,.js,.html,.css,.py,.pdf,.doc,.docx,.xls,.xlsx"
    );


    fileInput.removeAttribute(
        "capture"
    );


    fileInput.click();

}


/* =========================================================
   GOOGLE DRIVE
   ========================================================= */

function openGoogleDrive() {

    closeFunctions();


    /*
       This opens Google Drive.

       Actual Drive file selection/upload
       requires Google OAuth + Drive API
       on the backend.
    */

    window.open(
        "https://drive.google.com/drive/my-drive",
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {

    closeFunctions();


    settingsOverlay?.classList.add(
        "show"
    );

}


function closeSettings() {

    settingsOverlay?.classList.remove(
        "show"
    );

}


function closeSettingsOutside(event) {

    if (
        event.target ===
        settingsOverlay
    ) {

        closeSettings();

    }

}


/* =========================================================
   THEME
   ========================================================= */

function updateThemeButton() {

    if (!themeToggle) {
        return;
    }


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    themeToggle.textContent =
        dark
            ? "☀️ Light"
            : "🌙 Dark";

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        THEME_KEY,
        dark
            ? "dark"
            : "light"
    );


    updateThemeButton();

}


/* =========================================================
   LOAD THEME
   ========================================================= */

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        savedTheme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

    }


    updateThemeButton();

}


/* =========================================================
   SEND BUTTON
   ========================================================= */

sendBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        sendMessage();

    }
);


/* =========================================================
   STOP BUTTON
   ========================================================= */

stopBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        stopGeneration();

    }
);


/* =========================================================
   NEW CHAT BUTTON
   ========================================================= */

newChatBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        clearAll();

        sidebar?.classList.remove(
            "open"
        );

    }
);


/* =========================================================
   CLEAR CHAT BUTTON
   ========================================================= */

clearChatBtn?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        clearAll();

    }
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


            if (!isSending) {

                sendMessage();

            }

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
   ESCAPE
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;
        }


        closeFunctions();

        closeSettings();

        sidebar?.classList.remove(
            "open"
        );

    }
);


/* =========================================================
   FORM SUBMIT PROTECTION
   ========================================================= */

input?.closest(
    "form"
)?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        if (!isSending) {

            sendMessage();

        }

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ---------------------------------------------------------
   These are required because your HTML uses
   onclick="..." directly.
   ========================================================= */

window.toggleFunctions =
    toggleFunctions;

window.closeFunctions =
    closeFunctions;

window.closeFunctionsOutside =
    closeFunctionsOutside;

window.openCamera =
    openCamera;

window.openGallery =
    openGallery;

window.openFiles =
    openFiles;

window.openGoogleDrive =
    openGoogleDrive;

window.selectTool =
    selectTool;

window.openSettings =
    openSettings;

window.closeSettings =
    closeSettings;

window.closeSettingsOutside =
    closeSettingsOutside;

window.toggleTheme =
    toggleTheme;

window.sendMessage =
    sendMessage;

window.stopGeneration =
    stopGeneration;

window.clearAll =
    clearAll;


/* =========================================================
   INITIALIZE
   ========================================================= */

loadTheme();

loadConversation();

renderConversation();

updateHistory();

input?.focus();


console.log(
    "✓ AI Nandu FINAL script.js loaded successfully."
);
