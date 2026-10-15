const STORAGE_KEY = 'casamento_chica_progress';

function isConfigured() {
  return typeof APPS_SCRIPT_URL === 'string' &&
    APPS_SCRIPT_URL.length > 0 &&
    !APPS_SCRIPT_URL.includes('COLOQUE_AQUI');
}

function getLocalProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {}
}

async function fetchProgress() {
  if (!isConfigured()) {
    return getLocalProgress();
  }
  try {
    const url = APPS_SCRIPT_URL + '?action=progress';
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Erro a carregar progresso:', e);
    return getLocalProgress();
  }
}

function createFloatingHearts() {
  const container = document.getElementById('bgDecoration');
  if (!container) return;
  container.innerHTML = '<div class="rings-bg">💍</div>';
  const hearts = ['❤️', '💖', '💕', '💗', '💝'];
  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDelay = Math.random() * 8 + 's';
    heart.style.animationDuration = (6 + Math.random() * 6) + 's';
    heart.style.fontSize = (14 + Math.random() * 16) + 'px';
    container.appendChild(heart);
  }
}

function renderChallenges(progress) {
  const list = document.getElementById('challengesList');
  if (!list) return;

  const categories = {};
  CHALLENGES.forEach(ch => {
    if (!categories[ch.category]) categories[ch.category] = [];
    categories[ch.category].push(ch);
  });

  let html = '';
  Object.keys(categories).forEach(cat => {
    html += `<div class="category-group">`;
    html += `<div class="category-label">${cat}</div>`;
    categories[cat].forEach(ch => {
      const count = progress[ch.id] || 0;
      const target = ch.target;
      const pct = Math.min(100, Math.round((count / target) * 100));
      html += `
        <div class="challenge-card" onclick="location.hash='#/challenge/${ch.id}'">
          <div class="challenge-card-header">
            <div class="challenge-icon">${ch.icon}</div>
            <div class="challenge-info">
              <div class="challenge-name">${ch.name}</div>
              <div class="challenge-desc">${ch.description}</div>
            </div>
          </div>
          <div class="challenge-card-footer">
            <div class="progress-wrap">
              <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%"></div>
              </div>
              <div class="progress-text">${count} / ${target} fotos</div>
            </div>
            <i class="fas fa-chevron-right challenge-arrow"></i>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  });

  list.innerHTML = html;
}

async function loadHome() {
  createFloatingHearts();
  const progress = await fetchProgress();
  renderChallenges(progress);
}
