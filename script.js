const API_KEY = 'YOUR_OPENAI_API_KEY_HERE';
const DEMO_MODE = !API_KEY || API_KEY === 'YOUR_OPENAI_API_KEY_HERE';

const promptEl = document.getElementById("prompt");
const styleEl = document.getElementById("style");
const sizeEl = document.getElementById("size");
const sizeValueEl = document.getElementById("size-value");
const aspectEl = document.getElementById("aspect");
const generateBtn = document.getElementById("generate-btn");
const loader = document.getElementById("loader");
const errorMsg = document.getElementById("error-msg");
const avatar = document.getElementById("avatar");
const resultActions = document.querySelector(".result-actions");
const historyGallery = document.getElementById("history-gallery");
const progressEl = document.getElementById("progress");

sizeEl.addEventListener("input", () => {
  sizeValueEl.textContent = sizeEl.value;
});

async function generateAvatar() {
  const prompt = promptEl.value.trim();
  const style = styleEl.value;
  const size = parseInt(sizeEl.value);
  const aspect = aspectEl.value;

  if (!prompt) {
    showError("Please enter a description for your avatar.");
    return;
  }

  hideError();
  showLoader();
  hideResult();
  progressEl.style.width = "0%";

  const progressInterval = setInterval(() => {
    const current = parseInt(progressEl.style.width);
    if (current < 90) progressEl.style.width = `${current + 10}%`;
  }, 200);

  try {
    let imageUrl;
    if (DEMO_MODE) {
      const width = aspect === "portrait" ? Math.floor(size * 0.75) : aspect === "landscape" ? Math.floor(size * 1.33) : size;
      const height = aspect === "portrait" ? size : aspect === "landscape" ? Math.floor(size * 0.75) : size;
      const seed = Math.floor(Math.random() * 1000);
      imageUrl = `https://picsum.photos/${width}/${height}?random=${seed}`;
    } else {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `${style} style avatar: ${prompt}`,
          n: 1,
          size: `${size}x${size}`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "API Error");
      imageUrl = data.data[0].url;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let { width, height } = img;

      if (aspect === "portrait") {
        const newWidth = Math.min(width, height * 0.75);
        canvas.width = newWidth;
        canvas.height = newWidth / 0.75;
        ctx.drawImage(img, (width - newWidth) / 2, 0, newWidth, canvas.height, 0, 0, newWidth, canvas.height);
      } else if (aspect === "landscape") {
        const newHeight = Math.min(height, width / 1.33);
        canvas.width = newHeight * 1.33;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, (height - newHeight) / 2, canvas.width, newHeight, 0, 0, canvas.width, newHeight);
      } else {
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
      }

      avatar.src = canvas.toDataURL("image/png");
      clearInterval(progressInterval);
      progressEl.style.width = "100%";
      setTimeout(() => hideLoader(), 500);
      showResult();
    };
    img.src = imageUrl;
  } catch (error) {
    clearInterval(progressInterval);
    hideLoader();
    showError(`Generation failed: ${error.message}`);
  }
}

function downloadImg(format) {
  const link = document.createElement("a");
  link.href = avatar.src;
  link.download = `avatar.${format}`;
  link.click();
}

function shareAvatar() {
  if (navigator.share) {
    navigator.share({ title: "My AI Avatar", url: avatar.src });
  } else {
    navigator.clipboard.writeText(avatar.src);
    alert("Image URL copied to clipboard!");
  }
}

function saveToHistory() {
  const history = JSON.parse(localStorage.getItem("avatarHistory") || "[]");
  history.unshift({ src: avatar.src, prompt: promptEl.value });
  if (history.length > 10) history.pop();
  localStorage.setItem("avatarHistory", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("avatarHistory") || "[]");
  historyGallery.innerHTML = "";
  history.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.title = item.prompt;
    img.onclick = () => {
      avatar.src = item.src;
      showResult();
    };
    historyGallery.appendChild(img);
  });
}

function clearHistory() {
  localStorage.removeItem("avatarHistory");
  loadHistory();
}

function showLoader() {
  loader.classList.remove("hidden");
}

function hideLoader() {
  loader.classList.add("hidden");
}

function showResult() {
  avatar.classList.remove("hidden");
  resultActions.classList.remove("hidden");
}

function hideResult() {
  avatar.classList.add("hidden");
  resultActions.classList.add("hidden");
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
}

function hideError() {
  errorMsg.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", loadHistory);