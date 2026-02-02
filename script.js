// Constants
const API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with user's API key (securely via env vars in production)
const DEMO_MODE = !API_KEY || API_KEY === 'YOUR_OPENAI_API_KEY_HERE'; // Fallback to demo if no key

// DOM Elements
const promptEl = document.getElementById('prompt');
const styleEl = document.getElementById('style');
const sizeEl = document.getElementById('size');
const sizeValueEl = document.getElementById('size-value');
const aspectEl = document.getElementById('aspect');
const generateBtn = document.getElementById('generate-btn');
const loader = document.getElementById('loader');
const errorMsg = document.getElementById('error-msg');
const avatar = document.getElementById('avatar');
const resultActions = document.querySelector('.result-actions');
const historyGallery = document.getElementById('history-gallery');

// Update size display
sizeEl.addEventListener('input', () => {
  sizeValueEl.textContent = sizeEl.value;
});

// Generate Avatar
async function generateAvatar() {
  const prompt = promptEl.value.trim();
  const style = styleEl.value;
  const size = sizeEl.value;
  const aspect = aspectEl.value;

  if (!prompt) {
    showError('Please enter a description for your avatar.');
    return;
  }

  hideError();
  showLoader();
  hideResult();

  try {
    let imageUrl;
    if (DEMO_MODE) {
      // Demo mode: Use DiceBear for static avatars
      const seed = encodeURIComponent(`${prompt} ${style}`);
      imageUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=${size}`;
    } else {
      // Real AI mode: Use OpenAI DALL-E (example)
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `${style} style avatar: ${prompt}`,
          n: 1,
          size: getSizeString(size, aspect),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'API Error');
      imageUrl = data.data[0].url;
    }

    avatar.src = imageUrl;
    avatar.onload = () => {
      hideLoader();
      showResult();
    };
  } catch (error) {
    hideLoader();
    showError(`Generation failed: ${error.message}`);
  }
}

// Helper: Get size string for API
function getSizeString(size, aspect) {
  const sizes = { '256': '256x256', '512': '512x512', '1024': '1024x1024' };
  if (aspect === 'portrait') return sizes[size]?.replace('x', 'x') || '512x512'; // Adjust for portrait
  return sizes[size] || '512x512';
}

// Download Image
function downloadImg(format) {
  const link = document.createElement('a');
  link.href = avatar.src;
  link.download = `avatar.${format}`;
  link.click();
}

// Share Avatar (basic social share)
function shareAvatar() {
  if (navigator.share) {
    navigator.share({ title: 'My AI Avatar', url: avatar.src });
  } else {
    navigator.clipboard.writeText(avatar.src);
    alert('Image URL copied to clipboard!');
  }
}

// Save to History
function saveToHistory() {
  const history = JSON.parse(localStorage.getItem('avatarHistory') || '[]');
  history.unshift({ src: avatar.src, prompt: promptEl.value });
  if (history.length > 10) history.pop(); // Limit to 10
  localStorage.setItem('avatarHistory', JSON.stringify(history));
  loadHistory();
}

// Load History
function loadHistory() {
  const history = JSON.parse(localStorage.getItem('avatarHistory') || '[]');
  historyGallery.innerHTML = '';
  history.forEach(item => {
    const img = document.createElement('img');
    img.src = item.src;
    img.title = item.prompt;
    img.onclick = () => { avatar.src = item.src; showResult(); };
    historyGallery.appendChild(img);
  });
}

// Clear History
function clearHistory() {
  localStorage.removeItem('avatarHistory');
  loadHistory();
}

// Utility Functions
function showLoader() { loader.classList.remove('hidden'); }
function hideLoader() { loader.classList.add('hidden'); }
function showResult() { avatar.classList.remove('hidden'); resultActions.classList.remove('hidden'); }
function hideResult() { avatar.classList.add('hidden'); resultActions.classList.add('hidden'); }
function showError(msg) { errorMsg.textContent = msg; errorMsg.classList.remove('hidden'); }
function hideError() { errorMsg.classList.add('hidden'); }

// Initialize
document.addEventListener('DOMContentLoaded', loadHistory);
