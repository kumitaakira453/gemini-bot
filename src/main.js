import { GoogleGenerativeAI } from "@google/generative-ai";
import { APIKEY } from "./env.js";

class MessageManager {
    constructor(
        sendBoxSelector,
        micBtnSelector,
        sendBtnSelector,
        messageContainerSelector
    ) {
        this.sendBox = document.querySelector(sendBoxSelector);
        this.micBtn = document.querySelector(micBtnSelector);
        this.sendBtn = document.querySelector(sendBtnSelector);
        this.messageContainer = document.querySelector(
            messageContainerSelector
        );
        this.isComposing = false;

        this.initializeEvents();
        document.querySelector("#now_time").innerHTML = this.getFormattedTime();
    }

    initializeEvents() {
        this.sendBox.addEventListener("input", () =>
            this.toggleMicSendButton()
        );
        this.sendBtn.addEventListener("click", () => this.sendMessage());
        this.sendBox.addEventListener(
            "compositionstart",
            () => (this.isComposing = true)
        );
        this.sendBox.addEventListener(
            "compositionend",
            () => (this.isComposing = false)
        );
        this.sendBox.addEventListener("keydown", (e) => this.handleEnterKey(e));
    }

    scrollToBottom(target) {
        const mainContainer = document.getElementById("mainContainer");
        mainContainer.scrollTop = mainContainer.scrollHeight;
        const targetPosition = target.offsetTop;

        // 30vhをピクセルに変換
        const offset = window.innerHeight * 0.3;

        // targetの上端 + 30vhの位置までスクロール
        mainContainer.scrollTop = targetPosition - offset;
    }
    toggleMicSendButton() {
        console.log("change!!");
        const sendBoxValue = this.sendBox.value;
        if (sendBoxValue.trim() === "") {
            this.micBtn.classList.remove("hidden");
            this.sendBtn.classList.add("hidden");
        } else {
            this.micBtn.classList.add("hidden");
            this.sendBtn.classList.remove("hidden");
        }
    }

    handleEnterKey(e) {
        if (e.key === "Enter" && !this.isComposing) {
            e.preventDefault(); // デフォルトのエンターキーの動作を防ぐ（例: フォーム送信）
            this.sendMessage();
        }
    }

    async sendToGemini(message) {
        const genAI = new GoogleGenerativeAI(APIKEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = message;
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
        this.createMessage(
            result.response.text(),
            this.getFormattedTime(),
            false
        );
    }
    async sendMessage() {
        const content = this.sendBox.value.trim();
        if (content !== "") {
            console.log(content);
            const time = this.getFormattedTime();
            console.log(time);
            this.createMessage(content, time);
            this.sendBox.value = "";
            this.toggleMicSendButton();
            await this.sendToGemini(content);
        }
    }

    getFormattedTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    createMessage(content, time, is_from_me = true) {
        const templateName = is_from_me ? "me" : "friend";
        const messageTemplate = document.querySelector(
            `#message_template_from_${templateName}`
        );
        console.log(messageTemplate);
        console.log(`#message_template_from_${templateName}`);
        const message = messageTemplate.content
            .cloneNode(true)
            .querySelector("#message");
        console.log(message);
        const sendTimeTag = message.querySelector("#send_time");
        const contentTag = message.querySelector("#content");
        const isReadTag = message.querySelector(".is_read");

        if (isReadTag) {
            isReadTag.classList.add("hidden");
            isReadTag.classList.remove("hidden");
        }
        sendTimeTag.textContent = time;
        contentTag.innerHTML = marked.parse(content);

        this.messageContainer.appendChild(message);
        this.scrollToBottom(message);
    }
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    const messageManager = new MessageManager(
        "input",
        ".button_mic",
        ".button_send",
        ".message_container"
    );
});
