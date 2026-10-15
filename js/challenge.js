let currentChallenge = null;
let currentGalleryFiles = [];
let lightboxIndex = 0;

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
    status.innerHTML = message;
  }
}

function clearStatus() {
  const status = document.getElementById('uploadStatus');
  status.className = 'upload-status';
  status.textContent = '';
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
        const gallery = getLocalGallery();
        const photoId = 'demo_' + Date.now();
        gallery[challengeId] = gallery[challengeId] || [];
        gallery[challengeId].unshift({
          id: photoId,
          name: 'foto_' + Date.now() + '.jpg',
          url: dataUrl,
          thumbnail: dataUrl,
          date: new Date().toISOString()
        });
        saveLocalGallery(gallery);
        resolve({ success: true, count: progress[challengeId] });
      }, 800);
    });
  }
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ challengeId, image: dataUrl })
    });
    if (!res.ok) {
      throw new Error('HTTP ' + res.status);
    }
    return await res.json();
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function getLocalGallery() {
  try {
    const data = localStorage.getItem(STORAGE_KEY + '_gallery');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalGallery(gallery) {
  try {
    localStorage.setItem(STORAGE_KEY + '_gallery', JSON.stringify(gallery));
  } catch (e) {}
}

async function fetchGallery(challengeId) {
  if (!isConfigured()) {
    const gallery = getLocalGallery();
    return { challengeId, files: gallery[challengeId] || [] };
  }
  try {
    const url = APPS_SCRIPT_URL + '?action=gallery&challengeId=' + encodeURIComponent(challengeId);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.error('Erro a carregar galeria:', e);
    return { challengeId, files: [] };
  }
}

function renderGallery(files) {
  const grid = document.getElementById('galleryGrid');
  const section = document.getElementById('gallerySection');

  if (!files || files.length === 0) {
    grid.innerHTML = '<div class="gallery-empty">Ainda não há fotos neste desafio. Sê o primeiro a enviar! 📸</div>';
    return;
  }

  currentGalleryFiles = files;
  section.style.display = 'block';
  let html = '';
  files.forEach((f, i) => {
    const thumb = f.thumbnail || f.url;
    html += `
      <button class="gallery-item" data-index="${i}" aria-label="Ver foto ${i + 1}">
        <img src="${thumb}" alt="${f.name}" loading="lazy" onerror="this.style.opacity='0.3'">
      </button>
    `;
  });
  grid.innerHTML = html;

  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      openLightbox(idx);
    });
  });
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
  clearStatus();

  const fileInput = document.getElementById('fileInput');
  const galleryInput = document.getElementById('galleryInput');
  const cameraBtn = document.getElementById('cameraBtn');
  const galleryBtn = document.getElementById('galleryBtn');

  fileInput.onchange = handleFileSelect;
  galleryInput.onchange = handleFileSelect;

  if (cameraBtn) cameraBtn.onclick = () => fileInput.click();
  if (galleryBtn) galleryBtn.onclick = () => galleryInput.click();

  const galleryGrid = document.getElementById('galleryGrid');
  galleryGrid.innerHTML = '<div class="gallery-empty"><span class="spinner"></span> A carregar fotos...</div>';

  const progress = await fetchProgress();
  const count = progress[ch.id] || 0;
  updateDetailProgress(count, ch.target);

  const gallery = await fetchGallery(ch.id);
  renderGallery(gallery.files || []);

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
    showStatus('loading', 'A enviar para o álbum no Google Drive...');
    const result = await uploadPhoto(currentChallenge.id, dataUrl);

    if (result.success) {
      const newCount = result.count !== undefined ? result.count : (currentTargetCount(currentChallenge.id) + 1);
      updateDetailProgress(newCount, currentChallenge.target);
      showStatus('success', '✅ Foto enviada com sucesso para o álbum! Obrigado! ♥');
      showToast('Foto enviada com sucesso! ♥');

      const gallery = await fetchGallery(currentChallenge.id);
      renderGallery(gallery.files || []);

      if (newCount >= currentChallenge.target) {
        setTimeout(showCelebration, 500);
      }
    } else {
      showStatus('error', '❌ Não foi possível enviar a foto: ' + (result.error || 'Erro desconhecido'));
      showToast('Erro ao enviar a foto');
    }
  } catch (err) {
    showStatus('error', '❌ Erro a processar a foto. Tenta novamente.');
    showToast('Erro ao processar a foto');
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

function openLightbox(index) {
  if (!currentGalleryFiles || currentGalleryFiles.length === 0) return;
  lightboxIndex = index;
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImage');
  const counter = document.getElementById('lightboxCounter');

  updateLightboxImage();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function updateLightboxImage() {
  const img = document.getElementById('lightboxImage');
  const counter = document.getElementById('lightboxCounter');
  const file = currentGalleryFiles[lightboxIndex];
  const fullUrl = file.url || file.thumbnail;
  img.src = fullUrl;
  img.alt = file.name || '';
  counter.textContent = (lightboxIndex + 1) + ' / ' + currentGalleryFiles.length;
}

function lightboxNext() {
  if (lightboxIndex < currentGalleryFiles.length - 1) {
    lightboxIndex++;
    updateLightboxImage();
  }
}

function lightboxPrev() {
  if (lightboxIndex > 0) {
    lightboxIndex--;
    updateLightboxImage();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const lightbox = document.getElementById('lightbox');

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', lightboxPrev);
  if (nextBtn) nextBtn.addEventListener('click', lightboxNext);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
  });

  let touchStartX = 0;
  let touchEndX = 0;

  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) lightboxNext();
        else lightboxPrev();
      }
    }, { passive: true });
  }
});
