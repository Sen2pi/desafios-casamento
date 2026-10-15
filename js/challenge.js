let currentChallenge = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function showStatus(type, message) {
  const status = document.getElementById('uploadStatus');
  status.className = 'upload-status ' + type;
  if (type === 'loading') {
    status.innerHTML = '<span class="spinner"></span>' + message;
  } else {
    status.textContent = message;
  }
}

function compressImage(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result);
          r.onerror = reject;
          r.readAsDataURL(blob);
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(challengeId, dataUrl) {
  if (!isConfigured()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const progress = getLocalProgress();
        progress[challengeId] = (progress[challengeId] || 0) + 1;
        saveLocalProgress(progress);
        resolve({ success: true, count: progress[challengeId] });
      }, 800);
    });
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ challengeId, image: dataUrl })
  });
  return res.json();
}

function updateDetailProgress(count, target) {
  const pct = Math.min(100, Math.round((count / target) * 100));
  const el = document.getElementById('detailProgress');
  el.innerHTML = `
    <div class="detail-progress-label">
      <span><i class="fas fa-camera"></i> ${count} foto${count !== 1 ? 's' : ''} enviada${count !== 1 ? 's' : ''}</span>
      <span>Meta: ${target}</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${pct}%"></div>
    </div>
  `;
}

function renderChallenge(ch) {
  currentChallenge = ch;
  const header = document.getElementById('challengeHeader');
  header.innerHTML = `
    <div class="challenge-icon">${ch.icon}</div>
    <div class="category-tag">${ch.category}</div>
    <h1>${ch.name}</h1>
    <p>${ch.description}</p>
  `;
}

async function loadChallenge(id) {
  const ch = CHALLENGES.find(c => c.id === id);
  if (!ch) {
    document.getElementById('challengeHeader').innerHTML = '<p style="text-align:center;padding:40px">Desafio não encontrado.</p>';
    return;
  }
  renderChallenge(ch);

  const progress = await fetchProgress();
  const count = progress[ch.id] || 0;
  updateDetailProgress(count, ch.target);

  const fileInput = document.getElementById('fileInput');
  fileInput.onchange = handleFileSelect;
  const uploadArea = document.getElementById('uploadArea');
  uploadArea.onclick = () => fileInput.click();

  if (count >= ch.target) {
    showCelebration();
  }
}

async function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!currentChallenge) return;

  showStatus('loading', 'A processar a foto...');

  try {
    const dataUrl = await compressImage(file, 1280, 1280, 0.8);
    showStatus('loading', 'A enviar para o álbum...');
    const result = await uploadPhoto(currentChallenge.id, dataUrl);

    if (result.success) {
      const newCount = result.count !== undefined ? result.count : (currentTargetCount(currentChallenge.id) + 1);
      updateDetailProgress(newCount, currentChallenge.target);
      showStatus('success', '🎉 Foto enviada com sucesso! Obrigado!');
      showToast('Foto enviada! ♥');
      if (newCount >= currentChallenge.target) {
        setTimeout(showCelebration, 500);
      }
    } else {
      showStatus('error', 'Erro: ' + (result.error || 'Não foi possível enviar.'));
    }
  } catch (err) {
    showStatus('error', 'Erro a processar a foto. Tenta novamente.');
    console.error(err);
  }

  e.target.value = '';
}

function currentTargetCount(id) {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return p[id] || 0;
  } catch (e) {
    return 0;
  }
}

function showCelebration() {
  const header = document.getElementById('challengeHeader');
  const existing = document.querySelector('.celebration');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = 'celebration';
  div.innerHTML = `
    <div class="celebration-emoji">🎉💍🎉</div>
    <p style="font-family:'Great Vibes',cursive;font-size:28px;color:var(--rose);margin-top:10px;">
      Desafio Completo!
    </p>
    <p style="font-size:13px;color:var(--text-muted);">Parabéns! Ajudaste a criar memórias inesquecíveis.</p>
  `;
  header.appendChild(div);
}
