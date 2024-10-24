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
        this.sendBox.addEventListener("focus", () =>
            this.toggleInputLeftBtn(true)
        );
        this.sendBox.addEventListener("blur", () =>
            this.toggleInputLeftBtn(false)
        );
    }

    scrollToBottom(target) {
        const mainContainer = document.getElementById("mainContainer");
        mainContainer.scrollTop = mainContainer.scrollHeight;
        const targetPosition = target.offsetTop;

        const offset = window.innerHeight * 0.3;

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

    toggleInputLeftBtn(isFocused) {
        const addBtn = document.querySelector("#add_btn");
        const cameraBtn = document.querySelector("#camera_btn");
        const photnBtn = document.querySelector("#image_btn");
        const notFocusBtns = [addBtn, cameraBtn, photnBtn];
        const arrowBtn = document.querySelector("#arrow_btn");
        const focusBtns = [arrowBtn];
        if (isFocused) {
            notFocusBtns.forEach((btn) => {
                btn.classList.add("hidden");
            });
            arrowBtn.classList.remove("hidden");
        } else {
            notFocusBtns.forEach((btn) => {
                btn.classList.remove("hidden");
            });
            arrowBtn.classList.add("hidden");
        }
    }

    handleEnterKey(e) {
        if (e.key === "Enter" && !this.isComposing) {
            e.preventDefault();
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

    createMessage(content, time, isFromMe = true) {
        const templateName = isFromMe ? "me" : "friend";
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
        let contentHTML = content;
        if (!isFromMe) {
            contentHTML = `<div class="my-[5px]">${marked.parse(
                content
            )}</div>`;
        }
        contentTag.innerHTML = contentHTML;
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
