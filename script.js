const avatar = document.getElementById("avatar");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("downloadBtn");

function generate() {

  const prompt = document.getElementById("prompt").value;
  const style = document.getElementById("style").value;

  if (!prompt) {
    alert("اكتب وصف الأول");
    return;
  }

  loader.classList.remove("hidden");
  avatar.src = "";
  downloadBtn.classList.add("hidden");

  // 🔹 ديمو فقط — صورة أفاتار جاهزة حسب النص
  setTimeout(() => {

    const seed = encodeURIComponent(prompt + style);

    avatar.src =
      `https://api.dicebear.com/7.x/anime/svg?seed=${seed}`;

    loader.classList.add("hidden");
    downloadBtn.classList.remove("hidden");

  }, 1200);
}

function downloadImg() {
  const link = document.createElement("a");
  link.href = avatar.src;
  link.download = "avatar.svg";
  link.click();
}
