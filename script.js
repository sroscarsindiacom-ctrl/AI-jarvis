// ======================================================
// MY AI ASSISTANT - FRONTEND
// ======================================================

const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const stopBtn = document.getElementById("stop-btn");
const chatBox = document.getElementById("chat-box");

const newChatBtn = document.getElementById("new-chat-btn");
const clearChatBtn = document.getElementById("clear-chat-btn");

const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

const fileInput = document.getElementById("file-input");
const cameraInput = document.getElementById("camera-input");
const photoInput = document.getElementById("photo-input");
const codeInput = document.getElementById("code-input");

const attachBtn = document.getElementById("attach-btn");
const attachmentPreview =
    document.getElementById("attachment-preview");

const historyList =
    document.getElementById("history-list");

const toolsMenu =
    document.getElementById("tools-menu");

const closeTools =
    document.getElementById("close-tools");

const cameraBtn =
    document.getElementById("camera-btn");

const photoBtn =
    document.getElementById("photo-btn");

const fileBtn =
    document.getElementById("file-btn");

const searchBtn =
    document.getElementById("search-btn");

const codeBtn =
    document.getElementById("code-btn");

const learnBtn =
    document.getElementById("learn-btn");

const settingsBtn =
    document.getElementById("settings-btn");

const settingsModal =
    document.getElementById("settings-modal");

const closeSettings =
    document.getElementById("close-settings");

const themeToggle =
    document.getElementById("theme-toggle");


// ======================================================
// STATE
// ======================================================

let conversation = [];

let isSending = false;

let abortController = null;

let pendingAttachment = null;

let attachmentData = null;

const STORAGE_KEY = "myAIConversation";


// ======================================================
// SAVED CONVERSATION
// ======================================================

function loadSaved() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

        if (Array.isArray(saved)) {

            conversation =
                saved.filter(m =>
                    m &&
                    (
                        m.role === "user" ||
                        m.role === "assistant"
                    ) &&
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

        console.error(
            "Save error:",
            e
        );

    }
}


// ======================================================
// SCROLL
// ======================================================

function scrollToBottom() {

    requestAnimationFrame(() => {

        chatBox.scrollTop =
            chatBox.scrollHeight;

    });

}


// ======================================================
// HTML ESCAPE
// ======================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ======================================================
// MARKDOWN
// ======================================================

function renderMarkdown(text) {

    if (
        typeof marked === "undefined"
    ) {

        return escapeHtml(text)
            .replace(/\n/g, "<br>");

    }

    marked.setOptions({
        breaks: true,
        gfm: true
    });

    const raw =
        marked.parse(text);

    return DOMPurify.sanitize(
        raw,
        {
            ADD_ATTR: [
                "target",
                "rel"
            ]
        }
    );
}


// ======================================================
// CODE BLOCKS
// ======================================================

function enhanceCodeBlocks(container) {

    container
        .querySelectorAll("pre code")
        .forEach(code => {

            try {

                if (window.hljs) {

                    hljs.highlightElement(code);

                }

            } catch {}

            const pre =
                code.parentElement;

            if (
                pre.parentElement &&
                pre.parentElement.classList.contains(
                    "code-container"
                )
            ) {
                return;
            }

            const wrapper =
                document.createElement("div");

            wrapper.className =
                "code-container";

            const header =
                document.createElement("div");

            header.className =
                "code-header";

            const language =
                [...code.classList]
                    .find(c =>
                        c.startsWith(
                            "language-"
                        )
                    )
                    ?.replace(
                        "language-",
                        ""
                    ) || "code";

            header.innerHTML =
                `<span>${escapeHtml(language)}</span>`;

            const copy =
                document.createElement("button");

            copy.className =
                "copy-code-btn";

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

                        setTimeout(
                            () =>
                                copy.textContent =
                                    "Copy",
                            1200
                        );

                    } catch {

                        copy.textContent =
                            "Failed";

                    }

                };

            header.appendChild(copy);

            pre.replaceWith(wrapper);

            wrapper.appendChild(header);

            wrapper.appendChild(pre);

        });


    container
        .querySelectorAll("a")
        .forEach(a => {

            a.target =
                "_blank";

            a.rel =
                "noopener noreferrer";

        });

}


// ======================================================
// WELCOME
// ======================================================

function removeWelcome() {

    chatBox
        .querySelector(".welcome")
        ?.remove();

}


function showWelcome() {

    chatBox.innerHTML = `

        <div class="welcome">

            <div class="welcome-icon">

                <img
                    src="logo.png"
                    alt="My AI"
                >

            </div>

            <h1>
                How can I help you today?
            </h1>

            <p>
                Ask me anything, write code,
                learn something new, or just
                have a conversation.
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
                    data-message="What are the latest important technology news today?"
                >
                    🌐 Latest information
                </button>

            </div>

        </div>
    `;

    attachSuggestions();

}


// ======================================================
// USER MESSAGE
// ======================================================

function addUserMessage(text) {

    removeWelcome();

    const row =
        document.createElement("div");

    row.className =
        "message-row user-row";

    const inner =
        document.createElement("div");

    inner.className =
        "message-inner";

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar user-avatar";

    avatar.textContent =
        "👤";

    const content =
        document.createElement("div");

    content.className =
        "message-content user-content";

    content.textContent =
        text;

    inner.append(
        avatar,
        content
    );

    row.appendChild(inner);

    chatBox.appendChild(row);

    scrollToBottom();

}


// ======================================================
// AI MESSAGE
// ======================================================

function createAIMessage() {

    removeWelcome();

    const row =
        document.createElement("div");

    row.className =
        "message-row bot-row";

    const inner =
        document.createElement("div");

    inner.className =
        "message-inner";

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar bot-avatar";

    avatar.innerHTML =
        `<img
            src="logo.png"
            style="width:24px;height:24px;object-fit:contain;border-radius:50%;"
            alt="AI"
        >`;

    const content =
        document.createElement("div");

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
        document.createElement("div");

    actions.className =
        "message-actions hidden";


    const regen =
        document.createElement("button");

    regen.textContent =
        "↻ Regenerate";

    regen.className =
        "action-btn";

    regen.onclick =
        regenerateLast;


    const copy =
        document.createElement("button");

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

                setTimeout(
                    () =>
                        copy.textContent =
                            "Copy",
                    1200
                );

            } catch {}

        };


    actions.append(
        regen,
        copy
    );

    inner.append(
        avatar,
        content
    );

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


// ======================================================
// RESPONSE
// ======================================================

async function typeResponse(
    target,
    text
) {

    target.dataset.raw =
        text;

    target.innerHTML =
        renderMarkdown(text);

    enhanceCodeBlocks(target);

    scrollToBottom();

}


// ======================================================
// SOURCES
// ======================================================

function addSources(
    row,
    sources
) {

    if (
        !Array.isArray(sources) ||
        !sources.length
    ) {
        return;
    }

    const box =
        document.createElement("div");

    box.className =
        "sources";

    box.innerHTML =
        "<strong>Sources</strong>";

    sources.forEach(source => {

        if (!source?.url) {
            return;
        }

        const a =
            document.createElement("a");

        a.href =
            source.url;

        a.target =
            "_blank";

        a.rel =
            "noopener noreferrer";

        a.textContent =
            source.title ||
            source.url;

        box.appendChild(a);

    });

    row.appendChild(box);

}


// ======================================================
// RENDER CONVERSATION
// ======================================================

function renderConversation() {

    chatBox.innerHTML =
        "";

    if (!conversation.length) {

        showWelcome();

        return;
    }

    conversation.forEach(m => {

        if (
            m.role === "user"
        ) {

            addUserMessage(
                m.content
            );

        } else {

            const msg =
                createAIMessage();

            msg.content.innerHTML =
                renderMarkdown(
                    m.content
                );

            msg.content.dataset.raw =
                m.content;

            enhanceCodeBlocks(
                msg.content
            );

            msg.actions.classList.remove(
                "hidden"
            );

        }

    });

    scrollToBottom();

}


// ======================================================
// ATTACHMENT TEXT EXTRACTION
// ======================================================

async function readTextFile(file) {

    const allowedText =
        [
            "text/plain",
            "text/markdown",
            "application/json",
            "text/csv",
            "text/javascript",
            "text/html",
            "text/css"
        ];

    const isText =
        allowedText.includes(
            file.type
        ) ||
        /\.(txt|md|json|csv|js|html|css|py|java|cpp|c|sql)$/i
            .test(file.name);

    if (!isText) {
        return null;
    }

    try {

        return await file.text();

    } catch {

        return null;

    }

}


// ======================================================
// ATTACHMENT
// ======================================================

async function setAttachment(file) {

    if (!file) {
        return;
    }

    pendingAttachment =
        file;

    const text =
        await readTextFile(file);

    attachmentData = {
        name: file.name,
        type: file.type,
        text: text
    };

    attachmentPreview.innerHTML = `
        <span>
            📎 ${escapeHtml(file.name)}
        </span>
        <button
            type="button"
            id="remove-attachment"
            title="Remove"
        >
            ×
        </button>
    `;

    document
        .getElementById(
            "remove-attachment"
        )
        ?.addEventListener(
            "click",
            clearAttachment
        );

}


function clearAttachment() {

    pendingAttachment =
        null;

    attachmentData =
        null;

    if (fileInput) {
        fileInput.value =
            "";
    }

    if (cameraInput) {
        cameraInput.value =
            "";
    }

    if (photoInput) {
        photoInput.value =
            "";
    }

    if (codeInput) {
        codeInput.value =
            "";
    }

    attachmentPreview.innerHTML =
        "";

}


// ======================================================
// TOOLS MENU
// ======================================================

function openTools() {

    toolsMenu?.classList.add(
        "open"
    );

    attachBtn?.classList.add(
        "active"
    );

}


function closeToolsMenu() {

    toolsMenu?.classList.remove(
        "open"
    );

    attachBtn?.classList.remove(
        "active"
    );

}


function toggleTools() {

    if (
        toolsMenu?.classList.contains(
            "open"
        )
    ) {

        closeToolsMenu();

    } else {

        openTools();

    }

}


// ======================================================
// TOOL ACTIONS
// ======================================================

attachBtn?.addEventListener(
    "click",
    e => {

        e.stopPropagation();

        toggleTools();

    }
);


closeTools?.addEventListener(
    "click",
    e => {

        e.stopPropagation();

        closeToolsMenu();

    }
);


cameraBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        cameraInput?.click();

    }
);


photoBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        photoInput?.click();

    }
);


fileBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        fileInput?.click();

    }
);


codeBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        codeInput?.click();

    }
);


// SEARCH

searchBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        input.value =
            "Search the web for: ";

        input.focus();

        input.setSelectionRange(
            input.value.length,
            input.value.length
        );

    }
);


// LEARN

learnBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        input.value =
            "Explain this topic in a simple way: ";

        input.focus();

        input.setSelectionRange(
            input.value.length,
            input.value.length
        );

    }
);


// SETTINGS

settingsBtn?.addEventListener(
    "click",
    () => {

        closeToolsMenu();

        settingsModal?.classList.remove(
            "hidden"
        );

    }
);


// ======================================================
// FILE INPUT EVENTS
// ======================================================

fileInput?.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files?.[0];

        if (file) {
            setAttachment(file);
        }

    }
);


cameraInput?.addEventListener(
    "change",
    () => {

        const file =
            cameraInput.files?.[0];

        if (file) {
            setAttachment(file);
        }

    }
);


photoInput?.addEventListener(
    "change",
    () => {

        const file =
            photoInput.files?.[0];

        if (file) {
            setAttachment(file);
        }

    }
);


codeInput?.addEventListener(
    "change",
    () => {

        const file =
            codeInput.files?.[0];

        if (file) {
            setAttachment(file);
        }

    }
);


// ======================================================
// SEND MESSAGE
// ======================================================

async function sendMessage() {

    if (isSending) {
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

    sendBtn.classList.add(
        "hidden"
    );

    stopBtn.classList.remove(
        "hidden"
    );

    input.disabled =
        true;


    let finalText =
        text ||
        "Please analyze the attached file.";


    // Add text-file content to conversation.
    // This keeps the existing server API unchanged.

    if (
        attachmentData &&
        attachmentData.text
    ) {

        finalText +=
            `\n\nAttached file: ${attachmentData.name}\n\n` +
            "File content:\n" +
            "```\n" +
            attachmentData.text +
            "\n```";

    } else if (
        pendingAttachment
    ) {

        finalText +=
            `\n\nAttached file: ${pendingAttachment.name}`;

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


        const data =
            await response.json();


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

        if (
            error.name ===
            "AbortError"
        ) {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            console.error(error);

            ai.content.innerHTML =
                `<div class="error-box">
                    ❌ ${escapeHtml(error.message)}
                </div>`;

        }

    } finally {

        isSending =
            false;

        abortController =
            null;

        input.disabled =
            false;

        sendBtn.classList.remove(
            "hidden"
        );

        stopBtn.classList.add(
            "hidden"
        );

        input.focus();

        clearAttachment();

        scrollToBottom();

    }

}


// ======================================================
// STOP
// ======================================================

function stopGeneration() {

    if (abortController) {

        abortController.abort();

    }

}


stopBtn?.addEventListener(
    "click",
    stopGeneration
);


// ======================================================
// REGENERATE
// ======================================================

async function regenerateLast() {

    if (
        isSending ||
        !conversation.length
    ) {
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


// ======================================================
// SEND FROM HISTORY
// ======================================================

async function sendMessageFromHistory() {

    isSending =
        true;

    abortController =
        new AbortController();


    sendBtn.classList.add(
        "hidden"
    );

    stopBtn.classList.remove(
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

        if (
            error.name ===
            "AbortError"
        ) {

            ai.content.innerHTML =
                "<em>Generation stopped.</em>";

        } else {

            ai.content.innerHTML =
                `<div class="error-box">
                    ❌ ${escapeHtml(error.message)}
                </div>`;

        }

    } finally {

        isSending =
            false;

        abortController =
            null;

        input.disabled =
            false;

        sendBtn.classList.remove(
            "hidden"
        );

        stopBtn.classList.add(
            "hidden"
        );

        input.focus();

    }

}


// ======================================================
// CLEAR / NEW CHAT
// ======================================================

function clearAll() {

    conversation =
        [];

    localStorage.removeItem(
        STORAGE_KEY
    );

    renderConversation();

    updateHistory();

    input.value =
        "";

    clearAttachment();

    closeToolsMenu();

    input.focus();

}


newChatBtn?.addEventListener(
    "click",
    clearAll
);


clearChatBtn?.addEventListener(
    "click",
    clearAll
);


// ======================================================
// SUGGESTIONS
// ======================================================

function attachSuggestions() {

    document
        .querySelectorAll(".suggestion")
        .forEach(button => {

            button.onclick =
                () => {

                    input.value =
                        button.dataset.message ||
                        "";

                    input.focus();

                    sendMessage();

                };

        });

}


// ======================================================
// ENTER TO SEND
// ======================================================

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


// ======================================================
// TEXTAREA AUTO HEIGHT
// ======================================================

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


// ======================================================
// MOBILE SIDEBAR
// ======================================================

menuBtn?.addEventListener(
    "click",
    e => {

        e.stopPropagation();

        sidebar.classList.toggle(
            "open"
        );

    }
);


// Close sidebar outside click

document.addEventListener(
    "click",
    e => {

        if (
            window.innerWidth <= 768 &&
            sidebar.classList.contains(
                "open"
            ) &&
            !sidebar.contains(e.target) &&
            !menuBtn.contains(e.target)
        ) {

            sidebar.classList.remove(
                "open"
            );

        }

    }
);


// ======================================================
// CLOSE TOOLS OUTSIDE CLICK
// ======================================================

document.addEventListener(
    "click",
    e => {

        if (
            toolsMenu &&
            toolsMenu.classList.contains(
                "open"
            ) &&
            !toolsMenu.contains(e.target) &&
            !attachBtn.contains(e.target)
        ) {

            closeToolsMenu();

        }

    }
);


// ======================================================
// SETTINGS
// ======================================================

closeSettings?.addEventListener(
    "click",
    () => {

        settingsModal.classList.add(
            "hidden"
        );

    }
);


settingsModal?.addEventListener(
    "click",
    e => {

        if (
            e.target ===
            settingsModal
        ) {

            settingsModal.classList.add(
                "hidden"
            );

        }

    }
);


// ======================================================
// THEME
// ======================================================

function loadTheme() {

    const theme =
        localStorage.getItem(
            "myAITheme"
        );

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        if (themeToggle) {

            themeToggle.textContent =
                "☀️ Light";

        }

    }

}


themeToggle?.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "myAITheme",
            dark
                ? "dark"
                : "light"
        );


        themeToggle.textContent =
            dark
                ? "☀️ Light"
                : "🌙 Dark";

    }
);


// ======================================================
// HISTORY
// ======================================================

function updateHistory() {

    if (!historyList) {
        return;
    }

    historyList.innerHTML =
        "";


    const userMessages =
        conversation
            .filter(
                m =>
                    m.role === "user"
            )
            .slice(-10)
            .reverse();


    userMessages.forEach(m => {

        const item =
            document.createElement(
                "button"
            );

        item.className =
            "history-item";

        item.textContent =
            m.content.slice(
                0,
                45
            );

        item.title =
            m.content;


        item.onclick =
            () => {

                document
                    .querySelector(
                        ".chat-area"
                    )
                    ?.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

            };


        historyList.appendChild(
            item
        );

    });

}


// ======================================================
// INITIALIZE
// ======================================================

loadTheme();

loadSaved();

renderConversation();

updateHistory();

input?.focus();


console.log(
    "My AI Assistant upgraded frontend ready."
);
