/**
 * Cinema Fox Web Streaming Platform (منصة سينما فوكس ويب)
 * 100% Pure Live MovieBox API Integration via Vercel Edge
 */

const API_BASE = 'https://cinemafox-api.vercel.app';

// Application State
const state = {
  banners: [],
  shelves: [],
  activeFilter: 'all',
  currentHeroIdx: 0,
  heroTimer: null,
  watchlist: JSON.parse(localStorage.getItem('cf_web_watchlist') || '[]'),
  watchProgress: JSON.parse(localStorage.getItem('cf_web_progress') || '{}'),
  subtitleSettings: JSON.parse(localStorage.getItem('cf_sub_settings') || JSON.stringify({
    fontSize: '21',
    fontFamily: "'Almarai', sans-serif",
    color: '#FFFFFF',
    bgStyle: 'transparent',
    shadowStyle: 'heavy'
  })),
  
  // Current playing item
  playing: {
    item: null,
    season: 0,
    episode: 0,
    streams: [],
    activeStreamUrl: '',
    subtitles: [],
    activeSubtitleTrack: null,
    subCues: []
  },
  
  // Modal active item
  modalItem: null,
  modalDetails: null
};

// DOM Elements
const DOM = {
  header: document.getElementById('header'),
  brandLogo: document.getElementById('brandLogo'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  searchView: document.getElementById('searchView'),
  catalogView: document.getElementById('catalogView'),
  searchTermText: document.getElementById('searchTermText'),
  searchResultsCount: document.getElementById('searchResultsCount'),
  searchResultsGrid: document.getElementById('searchResultsGrid'),

  // Hero
  heroBackdrop: document.getElementById('heroBackdrop'),
  heroTypeBadge: document.getElementById('heroTypeBadge'),
  heroRatingBadge: document.getElementById('heroRatingBadge'),
  heroYearBadge: document.getElementById('heroYearBadge'),
  heroTitle: document.getElementById('heroTitle'),
  heroOverview: document.getElementById('heroOverview'),
  heroPlayBtn: document.getElementById('heroPlayBtn'),
  heroInfoBtn: document.getElementById('heroInfoBtn'),
  heroFavBtn: document.getElementById('heroFavBtn'),
  heroIndicators: document.getElementById('heroIndicators'),

  // Shelves & Filters
  filterPills: document.querySelectorAll('.pill-btn'),
  navItems: document.querySelectorAll('.nav-item, .mobile-nav-item'),
  watchlistCount: document.getElementById('watchlistCount'),
  continueShelf: document.getElementById('continueShelf'),
  continueRail: document.getElementById('continueRail'),
  dynamicShelvesContainer: document.getElementById('dynamicShelvesContainer'),

  // Modal
  detailsModal: document.getElementById('detailsModal'),
  modalBackdropClick: document.getElementById('modalBackdropClick'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalHeroBanner: document.getElementById('modalHeroBanner'),
  modalPoster: document.getElementById('modalPoster'),
  modalTitle: document.getElementById('modalTitle'),
  modalTypeTag: document.getElementById('modalTypeTag'),
  modalRating: document.getElementById('modalRating'),
  modalYear: document.getElementById('modalYear'),
  modalGenres: document.getElementById('modalGenres'),
  modalOverview: document.getElementById('modalOverview'),
  modalDirectPlayBtn: document.getElementById('modalDirectPlayBtn'),
  modalFavBtn: document.getElementById('modalFavBtn'),
  modalSeriesSection: document.getElementById('modalSeriesSection'),
  seasonsSelect: document.getElementById('seasonsSelect'),
  modalEpisodesGrid: document.getElementById('modalEpisodesGrid'),

  // Player
  webPlayer: document.getElementById('webPlayer'),
  mainVideo: document.getElementById('mainVideoPlayer'),
  playerTopBar: document.getElementById('playerTopBar'),
  playerBottomBar: document.getElementById('playerBottomBar'),
  playerBackBtn: document.getElementById('playerBackBtn'),
  playerItemTitle: document.getElementById('playerItemTitle'),
  playerItemEpisode: document.getElementById('playerItemEpisode'),
  playerQualityPill: document.getElementById('playerQualityPill'),
  playerActiveQuality: document.getElementById('playerActiveQuality'),
  qualityDropdown: document.getElementById('qualityDropdown'),
  playerSubtitlesBtn: document.getElementById('playerSubtitlesBtn'),
  playerEpisodesDrawerBtn: document.getElementById('playerEpisodesDrawerBtn'),
  playerFullscreenBtn: document.getElementById('playerFullscreenBtn'),
  playerCenterOverlay: document.getElementById('playerCenterOverlay'),
  playerCenterPlayBtn: document.getElementById('playerCenterPlayBtn'),
  centerPlayIcon: document.getElementById('centerPlayIcon'),
  playerSpinner: document.getElementById('playerSpinner'),
  rewindIndicator: document.getElementById('rewindIndicator'),
  forwardIndicator: document.getElementById('forwardIndicator'),
  activeSubtitleText: document.getElementById('activeSubtitleText'),
  timelineContainer: document.getElementById('timelineContainer'),
  timelineBufferBar: document.getElementById('timelineBufferBar'),
  timelinePlayedBar: document.getElementById('timelinePlayedBar'),
  timelineHandle: document.getElementById('timelineHandle'),
  playerPlayPauseBtn: document.getElementById('playerPlayPauseBtn'),
  bottomPlayIcon: document.getElementById('bottomPlayIcon'),
  playerRewind10Btn: document.getElementById('playerRewind10Btn'),
  playerForward10Btn: document.getElementById('playerForward10Btn'),
  playerCurrentTime: document.getElementById('playerCurrentTime'),
  playerDuration: document.getElementById('playerDuration'),
  playerNextEpBtn: document.getElementById('playerNextEpBtn'),
  playerEpisodesDrawer: document.getElementById('playerEpisodesDrawer'),
  drawerSeriesTitle: document.getElementById('drawerSeriesTitle'),
  drawerCloseBtn: document.getElementById('drawerCloseBtn'),
  drawerEpisodesList: document.getElementById('drawerEpisodesList'),
  playerSubtitlesModal: document.getElementById('playerSubtitlesModal'),
  subtitlesModalCloseBtn: document.getElementById('subtitlesModalCloseBtn'),
  subtitlesList: document.getElementById('subtitlesList'),

  openSettingsBtn: document.getElementById('openSettingsBtn'),
  settingsModal: document.getElementById('settingsModal'),
  settingsBackdropClick: document.getElementById('settingsBackdropClick'),
  closeSettingsBtn: document.getElementById('closeSettingsBtn'),
  resetSettingsBtn: document.getElementById('resetSettingsBtn'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn'),
  subPreviewCue: document.getElementById('subPreviewCue'),
  webPlayerIframe: document.getElementById('webPlayerIframe'),
  toast: document.getElementById('toast')
};

// --------------------------------------------------------------------------
// Subtitle Customization & LocalStorage Preferences
// --------------------------------------------------------------------------
function applySubtitleSettings(settings = state.subtitleSettings) {
  if (!settings) return;

  // Live preview cue
  if (DOM.subPreviewCue) {
    DOM.subPreviewCue.style.fontSize = `${settings.fontSize}px`;
    DOM.subPreviewCue.style.fontFamily = settings.fontFamily;
    DOM.subPreviewCue.style.color = settings.color;

    if (settings.bgStyle === 'glass') {
      DOM.subPreviewCue.style.background = 'rgba(0, 0, 0, 0.65)';
      DOM.subPreviewCue.style.backdropFilter = 'blur(10px)';
      DOM.subPreviewCue.style.borderRadius = '8px';
      DOM.subPreviewCue.style.padding = '6px 14px';
    } else {
      DOM.subPreviewCue.style.background = settings.bgStyle;
      DOM.subPreviewCue.style.backdropFilter = 'none';
      DOM.subPreviewCue.style.borderRadius = settings.bgStyle === 'transparent' ? '0' : '6px';
      DOM.subPreviewCue.style.padding = settings.bgStyle === 'transparent' ? '0' : '4px 12px';
    }

    if (settings.shadowStyle === 'heavy') {
      DOM.subPreviewCue.style.textShadow = '0 2px 6px #000, 0 0 10px #000, 0 0 15px #000';
    } else if (settings.shadowStyle === 'outline') {
      DOM.subPreviewCue.style.textShadow = '-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 4px #000';
    } else if (settings.shadowStyle === 'glow') {
      DOM.subPreviewCue.style.textShadow = '0 0 12px rgba(229, 9, 20, 0.8), 0 2px 4px #000';
    } else {
      DOM.subPreviewCue.style.textShadow = 'none';
    }
  }

  // Inject or update global subtitle CSS style tag
  let styleTag = document.getElementById('cfSubtitleCustomStyles');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'cfSubtitleCustomStyles';
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    ::cue, .subtitle-text, #activeSubtitleText {
      font-size: ${settings.fontSize}px !important;
      font-family: ${settings.fontFamily} !important;
      color: ${settings.color} !important;
      background: ${settings.bgStyle === 'glass' ? 'rgba(0,0,0,0.65)' : settings.bgStyle} !important;
      ${settings.shadowStyle === 'heavy' ? 'text-shadow: 0 2px 6px #000, 0 0 10px #000, 0 0 15px #000 !important;' : ''}
      ${settings.shadowStyle === 'outline' ? 'text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 2px 4px #000 !important;' : ''}
      ${settings.shadowStyle === 'glow' ? 'text-shadow: 0 0 12px rgba(229, 9, 20, 0.8), 0 2px 4px #000 !important;' : ''}
    }
  `;
}

function openSettingsModal() {
  if (!DOM.settingsModal) return;
  DOM.settingsModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  syncSettingsUI();
  applySubtitleSettings();
}

function closeSettingsModal() {
  if (!DOM.settingsModal) return;
  DOM.settingsModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function syncSettingsUI() {
  const s = state.subtitleSettings;
  if (!s) return;
  document.querySelectorAll('#subSizeSelector .pill-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === String(s.fontSize));
  });
  document.querySelectorAll('#subFontSelector .pill-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === s.fontFamily);
  });
  document.querySelectorAll('#subColorSelector .color-circle').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val.toLowerCase() === s.color.toLowerCase());
  });
  document.querySelectorAll('#subBgSelector .pill-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === s.bgStyle);
  });
  document.querySelectorAll('#subShadowSelector .pill-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.val === s.shadowStyle);
  });
}



let hlsInstance = null;
let controlsTimeout = null;
let searchTimeout = null;
let isScrubbing = false;

// --------------------------------------------------------------------------
// Initialization & Home Feed Loader (Instant Fast Load + Live API Sync)
// --------------------------------------------------------------------------
async function initApp() {
  updateWatchlistCount();
  setupEventListeners();
  renderContinueWatching();
  applySubtitleSettings();

  // 1. Instant Cache from localStorage or bundled assets/data/home.json
  let hasRendered = false;
  try {
    const cached = localStorage.getItem('cf_cached_home');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.banners && parsed.banners.length > 0) {
        state.banners = parsed.banners;
        state.shelves = parsed.shelves || [];
        renderHeroBanner();
        renderShelves();
        hasRendered = true;
      }
    }
  } catch (_) {}

  // If no localStorage cache, load bundled home.json instantly (<50ms)
  if (!hasRendered) {
    try {
      const localRes = await fetch('assets/data/home.json');
      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData && localData.banners && localData.banners.length > 0) {
          state.banners = localData.banners;
          state.shelves = localData.shelves || [];
          renderHeroBanner();
          renderShelves();
          hasRendered = true;
        }
      }
    } catch (_) {}
  }

  // 2. Fetch fresh live feed from Vercel Edge API in background
  try {
    const res = await fetch(`${API_BASE}/api/home`);
    const data = await res.json();

    if (data.success && data.banners && data.banners.length > 0) {
      state.banners = data.banners;
      state.shelves = data.shelves || [];

      // Save to localStorage cache for instant future visits
      try {
        localStorage.setItem('cf_cached_home', JSON.stringify(data));
      } catch (_) {}

      renderHeroBanner();
      renderShelves();
    }
  } catch (err) {
    console.warn('Live API sync notice:', err);
  }
}

// --------------------------------------------------------------------------
// Hero Banner Carousel
// --------------------------------------------------------------------------
function renderHeroBanner() {
  if (!state.banners.length) return;

  const b = state.banners[state.currentHeroIdx];
  const bgImg = b.backdrop || b.poster || '';
  
  DOM.heroBackdrop.style.backgroundImage = `url('${bgImg}')`;
  DOM.heroTypeBadge.textContent = b.isSeries ? 'مسلسل حصري' : 'فيلم سينمائي';
  DOM.heroRatingBadge.textContent = `★ ${b.rating || '8.5'}`;
  DOM.heroYearBadge.textContent = b.releaseYear || '2026';
  DOM.heroTitle.textContent = b.titleAr || b.title;
  DOM.heroOverview.textContent = b.genre ? `التصنيف: ${b.genre} • استمتع بالمشاهدة الحصرية الفورية بدقة 1080p FHD وبدون إعلانات.` : '';

  // Update Favorite button state
  const isFav = state.watchlist.some(w => String(w.id || w.subjectId) === String(b.id || b.subjectId));
  DOM.heroFavBtn.classList.toggle('active', isFav);

  // Indicators
  DOM.heroIndicators.innerHTML = state.banners.map((_, i) => 
    `<div class="hero-dot ${i === state.currentHeroIdx ? 'active' : ''}" data-idx="${i}"></div>`
  ).join('');

  DOM.heroIndicators.querySelectorAll('.hero-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      state.currentHeroIdx = parseInt(dot.dataset.idx, 10);
      renderHeroBanner();
      restartHeroTimer();
    });
  });

  restartHeroTimer();
}

function restartHeroTimer() {
  clearInterval(state.heroTimer);
  state.heroTimer = setInterval(() => {
    if (!state.banners.length) return;
    state.currentHeroIdx = (state.currentHeroIdx + 1) % state.banners.length;
    renderHeroBanner();
  }, 6500);
}

// --------------------------------------------------------------------------
// Shelves & Movie Cards Rendering
// --------------------------------------------------------------------------
function renderShelves() {
  if (!state.shelves.length) return;

  let filteredShelves = state.shelves;

  if (state.activeFilter === 'series') {
    filteredShelves = state.shelves.filter(s => s.title.includes('مسلسل') || s.title.includes('دراما') || s.title.includes('Series'));
  } else if (state.activeFilter === 'movies') {
    filteredShelves = state.shelves.filter(s => s.title.includes('أفلام') || s.title.includes('فيلم') || s.title.includes('Movies'));
  } else if (state.activeFilter === 'anime') {
    filteredShelves = state.shelves.filter(s => s.title.includes('أنمي') || s.title.includes('Anime'));
  } else if (state.activeFilter === 'arabic') {
    filteredShelves = state.shelves.filter(s => s.title.includes('رمضان') || s.title.includes('عربي') || s.title.includes('Arabic'));
  } else if (state.activeFilter === 'cartoon') {
    filteredShelves = state.shelves.filter(s => s.title.includes('كارتون') || s.title.includes('رسوم') || s.title.includes('Animation'));
  } else if (state.activeFilter === 'watchlist') {
    renderWatchlistView();
    return;
  }

  DOM.dynamicShelvesContainer.innerHTML = filteredShelves.map((shelf, sIdx) => {
    const items = shelf.items || [];
    if (!items.length) return '';

    return `
      <section class="shelf-section">
        <div class="section-container">
          <div class="shelf-header">
            <h2 class="shelf-title">
              <span class="shelf-emoji">${getShelfEmoji(shelf.title)}</span>
              <span>${shelf.title}</span>
            </h2>
          </div>
          <div class="rail-container">
            <div class="cards-rail" id="shelf_rail_${sIdx}">
              ${items.map(item => renderMovieCardHtml(item)).join('')}
            </div>
          </div>
        </div>
      </section>
    `;
  }).join('');

  attachCardClickHandlers();
}

function getShelfEmoji(title) {
  if (title.includes('رائج') || title.includes('Trending')) return '🔥';
  if (title.includes('مسلسل') || title.includes('Series')) return '📺';
  if (title.includes('أنمي') || title.includes('Anime')) return '⚔️';
  if (title.includes('رمضان') || title.includes('دراما')) return '🌙';
  if (title.includes('أفلام') || title.includes('Movies')) return '🎬';
  if (title.includes('كارتون') || title.includes('Animation')) return '🎨';
  return '✨';
}


function isItemComingSoon(item) {
  if (!item) return false;
  if (item.isComingSoon || item.comingSoon) return true;
  if (item.badge && item.badge.toLowerCase().includes('soon')) return true;
  if (item.title && (item.title.includes('قريباً') || item.title.toLowerCase().includes('resurrection') || item.title.toLowerCase().includes('upcoming'))) {
    return true;
  }
  const year = parseInt(item.releaseYear || '0', 10);
  if (year > 2026) return true;
  return false;
}

function renderMovieCardHtml(item) {
  const title = item.titleAr || item.title;
  const poster = item.poster || item.backdrop || 'assets/images/logo.png';
  const rating = item.rating || 8.0;
  const typeLabel = item.isSeries ? 'مسلسل' : 'فيلم';
  
  // Progress bar if in continue watching
  const progKey = `${item.subjectId || item.id}_0_0`;
  const prog = state.watchProgress[progKey];
  const percent = prog ? Math.min(100, Math.round((prog.time / prog.duration) * 100)) : 0;

  return `
    <div class="movie-card" data-id="${item.subjectId || item.id}" data-path="${item.detailPath || ''}">
      <div class="poster-wrap">
        <img src="${poster}" alt="${title}" class="poster-img" loading="lazy">
        ${isItemComingSoon(item) 
    ? '<span class="card-coming-soon-badge"><svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg> قريباً</span>' 
    : '<span class="card-quality-badge">1080p FHD</span>'}
        <span class="card-rating-badge">★ ${rating}</span>
        <div class="card-hover-play">
          <div class="play-circle-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
        ${percent > 0 ? `
          <div class="card-progress-bar-bg">
            <div class="card-progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        ` : ''}
      </div>
      <div class="card-info">
        <h4 class="card-title-ar" title="${title}">${title}</h4>
        <div class="card-meta-row">
          <span class="card-type-label">${typeLabel}</span>
          <span>${item.releaseYear || '2026'}</span>
        </div>
      </div>
    </div>
  `;
}

function attachCardClickHandlers() {
  document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const detailPath = card.dataset.path;
      openDetailsModal(id, detailPath);
    });
  });
}

// --------------------------------------------------------------------------
// Continue Watching (حيث توقفت)
// --------------------------------------------------------------------------
function renderContinueWatching() {
  const keys = Object.keys(state.watchProgress);
  if (!keys.length) {
    DOM.continueShelf.style.display = 'none';
    return;
  }

  const items = [];
  for (const k of keys.reverse()) {
    const prog = state.watchProgress[k];
    if (prog && prog.item) {
      items.push(prog.item);
    }
  }

  if (!items.length) {
    DOM.continueShelf.style.display = 'none';
    return;
  }

  DOM.continueShelf.style.display = 'block';
  DOM.continueRail.innerHTML = items.slice(0, 10).map(item => renderMovieCardHtml(item)).join('');
  attachCardClickHandlers();
}

// --------------------------------------------------------------------------
// Watchlist (قائمتي المفضلة)
// --------------------------------------------------------------------------
function updateWatchlistCount() {
  DOM.watchlistCount.textContent = state.watchlist.length;
}

function renderWatchlistView() {
  if (!state.watchlist.length) {
    DOM.dynamicShelvesContainer.innerHTML = `
      <div class="section-container" style="text-align: center; padding: 70px 20px;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔖</div>
        <h3 style="font-family: var(--font-display); font-size: 24px; color: #fff; margin-bottom: 10px;">قائمتك المفضلة فارغة حالياً</h3>
        <p style="color: var(--text-muted); font-size: 14px; max-width: 400px; margin: 0 auto 24px auto;">
          تصفح الأعمال واضغط على أيقونة الإشارة المرجعية لإضافتها إلى قائمتك والوصول إليها بسرعة من أي جهاز.
        </p>
        <button class="pill-btn active" data-filter="all" onclick="document.querySelector('[data-filter=all]').click()" style="margin: 0 auto;">تصفح كل الأعمال الآن</button>
      </div>
    `;
    return;
  }

  DOM.dynamicShelvesContainer.innerHTML = `
    <section class="shelf-section">
      <div class="section-container">
        <div class="shelf-header">
          <h2 class="shelf-title">
            <span class="shelf-emoji">🔖</span>
            <span>قائمتي المفضلة (${state.watchlist.length} عمل)</span>
          </h2>
        </div>
        <div class="posters-grid">
          ${state.watchlist.map(item => renderMovieCardHtml(item)).join('')}
        </div>
      </div>
    </section>
  `;

  attachCardClickHandlers();
}

function toggleWatchlist(item) {
  if (!item) return;
  const id = String(item.subjectId || item.id);
  const idx = state.watchlist.findIndex(w => String(w.subjectId || w.id) === id);

  if (idx >= 0) {
    state.watchlist.splice(idx, 1);
    showToast('تمت الإزالة من قائمتي المفضلة');
  } else {
    state.watchlist.push(item);
    showToast('تمت الإضافة إلى قائمتي المفضلة ✓');
  }

  localStorage.setItem('cf_web_watchlist', JSON.stringify(state.watchlist));
  updateWatchlistCount();

  if (state.activeFilter === 'watchlist') {
    renderWatchlistView();
  }
}

// --------------------------------------------------------------------------
// Real-Time Instant Search
// --------------------------------------------------------------------------
function handleSearch(query) {
  const q = query.trim();
  if (!q) {
    DOM.searchView.style.display = 'none';
    DOM.catalogView.style.display = 'block';
    DOM.clearSearchBtn.style.display = 'none';
    return;
  }

  DOM.clearSearchBtn.style.display = 'block';
  DOM.searchTermText.textContent = `"${q}"`;
  DOM.searchView.style.display = 'block';
  DOM.catalogView.style.display = 'none';

  DOM.searchResultsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
      جاري البحث في قاعدة بيانات سينما فوكس...
    </div>
  `;

  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const results = data.results || [];

      DOM.searchResultsCount.textContent = `${results.length} عمل`;

      if (!results.length) {
        DOM.searchResultsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
            <div style="font-size: 38px; margin-bottom: 12px;">🔍</div>
            <h4 style="color:#fff; margin-bottom: 8px;">لم نتمكن من العثور على "${q}"</h4>
            <p style="color:var(--text-muted); font-size: 13px;">تأكد من كتابة الاسم باللغة العربية أو الإنجليزية بدقة</p>
          </div>
        `;
        return;
      }

      DOM.searchResultsGrid.innerHTML = results.map(item => renderMovieCardHtml(item)).join('');
      attachCardClickHandlers();
    } catch (err) {
      console.error('Search error:', err);
    }
  }, 350);
}

// --------------------------------------------------------------------------
// Details Modal & Season/Episode Resolution
// --------------------------------------------------------------------------
async function openDetailsModal(subjectId, detailPath) {
  // Find item from banners or shelves
  let item = state.banners.find(b => String(b.subjectId || b.id) === String(subjectId));
  if (!item) {
    for (const s of state.shelves) {
      const found = (s.items || []).find(m => String(m.subjectId || m.id) === String(subjectId));
      if (found) { item = found; break; }
    }
  }

  state.modalItem = item || { subjectId, detailPath, title: 'تحميل...', isSeries: false };

  // Populate basic modal info first
  const bg = item?.backdrop || item?.poster || '';
  DOM.modalHeroBanner.style.backgroundImage = `url('${bg}')`;
  DOM.modalPoster.src = item?.poster || item?.backdrop || 'assets/images/logo.png';
  DOM.modalTitle.textContent = item?.titleAr || item?.title || 'تفاصيل العمل';
  DOM.modalTypeTag.textContent = item?.isSeries ? 'مسلسل' : 'فيلم';
  DOM.modalRating.textContent = `★ ${item?.rating || '8.5'}`;
  const comingSoon = isItemComingSoon(item);
  if (comingSoon) {
    DOM.modalTypeTag.textContent = 'قريباً في السينما';
    DOM.modalTypeTag.className = 'modal-tag coming-soon';
    DOM.modalDirectPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg><span>قريباً في سينما فوكس</span>`;
  } else {
    DOM.modalTypeTag.className = 'modal-tag';
    DOM.modalDirectPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>مشاهدة الآن</span>`;
  }
  DOM.modalYear.textContent = item?.releaseYear || '2026';
  DOM.modalGenres.textContent = item?.genre || 'أفلام ومسلسلات';
  DOM.modalOverview.textContent = 'جاري جلب نبذة العمل وسيرفرات البث بدقة 1080p FHD...';

  // Watchlist state
  const isFav = state.watchlist.some(w => String(w.subjectId || w.id) === String(subjectId));
  DOM.modalFavBtn.classList.toggle('active', isFav);

  DOM.detailsModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Fetch full details & seasons from Vercel Edge API
  try {
    const url = `${API_BASE}/api/detail?subjectId=${encodeURIComponent(subjectId)}&detailPath=${encodeURIComponent(detailPath || '')}`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.success && json.data) {
      state.modalDetails = json.data;
      const d = json.data;

      DOM.modalTitle.textContent = d.titleAr || d.title;
      if (d.synopsis) DOM.modalOverview.textContent = d.synopsis;
      if (d.backdrop) DOM.modalHeroBanner.style.backgroundImage = `url('${d.backdrop}')`;
      if (d.poster) DOM.modalPoster.src = d.poster;

      if (d.isSeries && d.seasons && d.seasons.length > 0) {
        DOM.modalSeriesSection.style.display = 'block';
        DOM.seasonsSelect.innerHTML = d.seasons.map((s, idx) => 
          `<option value="${idx}">الموسم ${s.seasonNumber} (${s.episodeCount} حلقة)</option>`
        ).join('');

        renderModalEpisodes(d.seasons[0]);

        DOM.seasonsSelect.onchange = (e) => {
          const sIdx = parseInt(e.target.value, 10);
          renderModalEpisodes(d.seasons[sIdx]);
        };
      } else {
        DOM.modalSeriesSection.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('Detail fetch error:', e);
  }
}

function renderModalEpisodes(seasonObj) {
  if (!seasonObj || !seasonObj.episodes) return;

  DOM.modalEpisodesGrid.innerHTML = seasonObj.episodes.map(ep => {
    const sNum = seasonObj.seasonNumber || 1;
    const epNum = ep.number || 1;
    const progKey = `${state.modalItem.subjectId || state.modalItem.id}_${sNum}_${epNum}`;
    const prog = state.watchProgress[progKey];
    const isDone = prog && (prog.time / prog.duration) > 0.85;

    return `
      <button class="episode-card-btn ${isDone ? 'done' : ''}" data-season="${sNum}" data-ep="${epNum}">
        <span class="ep-num">الحلقة ${epNum}</span>
        <span class="ep-label">${isDone ? '✓ تمت المشاهدة' : (ep.title || 'تشغيل فوراً')}</span>
      </button>
    `;
  }).join('');

  DOM.modalEpisodesGrid.querySelectorAll('.episode-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const se = parseInt(btn.dataset.season, 10);
      const ep = parseInt(btn.dataset.ep, 10);
      closeModal();
      startPlayback(state.modalItem, se, ep);
    });
  });
}

function closeModal() {
  DOM.detailsModal.classList.remove('open');
  document.body.style.overflow = 'auto';
}

// --------------------------------------------------------------------------
// Full Web Video Player (HTML5 + HLS.js + 1080p Stream Switching)
// --------------------------------------------------------------------------
async function startPlayback(item, season = 0, episode = 0) {
  if (!item) return;

  if (isItemComingSoon(item)) {
    showToast('🎬 عذراً، هذا العمل مصنف (قريباً) ولم يبدأ عرضه بعد. ترقب إضافته في سينما فوكس فور توفر النسخة الرقمية!');
    return;
  }

  state.playing.item = item;
  state.playing.season = season;
  state.playing.episode = episode;

  // Open player overlay
  DOM.webPlayer.classList.add('active');
  document.body.style.overflow = 'hidden';

  const title = item.titleAr || item.title;
  DOM.playerItemTitle.textContent = title;
  DOM.playerItemEpisode.textContent = item.isSeries ? `الموسم ${season || 1} : الحلقة ${episode || 1}` : 'فيلم كامل (1080p FHD)';

  // Activate our custom CinemaFox HTML5 video player and guarantee external iframe is completely disabled
  DOM.mainVideo.style.display = 'block';
  if (DOM.webPlayerIframe) {
    DOM.webPlayerIframe.style.display = 'none';
    DOM.webPlayerIframe.src = 'about:blank';
  }

  // Show buffering spinner
  DOM.playerSpinner.style.display = 'block';

  // Set episode drawer button visibility
  if (item.isSeries) {
    DOM.playerEpisodesDrawerBtn.style.display = 'flex';
    DOM.drawerSeriesTitle.textContent = `${title} • الحلقات`;
  } else {
    DOM.playerEpisodesDrawerBtn.style.display = 'none';
  }

  // Fetch real streams and Arabic subtitles
  const isSeries = item.isSeries || (season > 0 && episode > 0);
  const seNum = season > 0 ? season : (isSeries ? 1 : 0);
  const epNum = episode > 0 ? episode : (isSeries ? 1 : 0);
  const detailPath = item.detailPath || `subject-${item.subjectId || item.id}`;

  // 1. Load Arabic Subtitles in parallel
  loadSubtitles(item.subjectId || item.id, seNum, epNum);

  // 2. Fetch and start video stream
  try {
    const streamRes = await fetch(`${API_BASE}/api/streams?subjectId=${encodeURIComponent(item.subjectId || item.id)}&se=${seNum}&ep=${epNum}&detailPath=${encodeURIComponent(detailPath)}&title=${encodeURIComponent(item.title || '')}`);
    const streamData = await streamRes.json();

    if (streamData.success && streamData.streams && streamData.streams.length > 0) {
      state.playing.streams = streamData.streams;
      const bestStream = streamData.streams[0]; // Highest resolution (1080p / 720p)

      DOM.mainVideo.src = bestStream.url;
      DOM.mainVideo.load();

      const playPromise = DOM.mainVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Autoplay waiting for user tap:', err);
          DOM.playerSpinner.style.display = 'none';
        });
      }

      showToast(`🎬 تشغيل ${title} (${bestStream.resolution || '1080p FHD'})`);
    } else {
      DOM.playerSpinner.style.display = 'none';
      showToast('⚠️ جاري تجهيز سيرفر البث، يرجى المحاولة بعد قليل');
    }
  } catch (err) {
    console.error('Playback stream error:', err);
    DOM.playerSpinner.style.display = 'none';
    showToast('⚠️ تعذر الاتصال بسيرفر البث');
  }

  // Save progress locally in browser localStorage
  const progKey = `${item.subjectId || item.id}_${season}_${episode}`;
  state.watchProgress[progKey] = {
    item: {
      id: item.subjectId || item.id,
      subjectId: item.subjectId || item.id,
      detailPath: item.detailPath,
      title: item.title,
      titleAr: item.titleAr,
      poster: item.poster,
      backdrop: item.backdrop,
      isSeries: item.isSeries,
      rating: item.rating,
      releaseYear: item.releaseYear
    },
    season,
    episode,
    time: 0,
    duration: 7200,
    timestamp: Date.now()
  };
  localStorage.setItem('cf_web_progress', JSON.stringify(state.watchProgress));
  renderContinueWatching();
}

function closePlayer() {
  if (DOM.mainVideo) {
    DOM.mainVideo.pause();
    DOM.mainVideo.src = '';
  }
  if (DOM.webPlayerIframe) {
    DOM.webPlayerIframe.src = 'about:blank';
    DOM.webPlayerIframe.style.display = 'none';
  }
  DOM.webPlayer.classList.remove('active');
  document.body.style.overflow = 'auto';
  renderContinueWatching();
}
async function loadSubtitles(subjectId, season, episode) {
  try {
    const url = `${API_BASE}/api/subtitles?subjectId=${encodeURIComponent(subjectId)}&se=${season}&ep=${episode}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success && data.subtitles && data.subtitles.length > 0) {
      state.playing.subtitles = data.subtitles;

      // Select Arabic subtitle by default if available
      const arSub = data.subtitles.find(s => s.isArabic);
      if (arSub) {
        activateSubtitle(arSub);
      }

      // Build Subtitles modal list
      DOM.subtitlesList.innerHTML = `
        <button class="sub-opt-btn ${!arSub ? 'active' : ''}" data-id="off">إيقاف الترجمة (Off)</button>
        ${data.subtitles.map(s => `
          <button class="sub-opt-btn ${s === arSub ? 'active' : ''}" data-url="${s.url}" data-lang="${s.language}">
            ${s.label} ${s.isArabic ? '(العربية الافتراضية)' : ''}
          </button>
        `).join('')}
      `;

      DOM.subtitlesList.querySelectorAll('.sub-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.playerSubtitlesModal.style.display = 'none';
          if (btn.dataset.id === 'off') {
            state.playing.subCues = [];
            DOM.activeSubtitleText.textContent = '';
            showToast('تم إيقاف الترجمة');
          } else {
            const sub = state.playing.subtitles.find(s => s.url === btn.dataset.url);
            if (sub) activateSubtitle(sub);
          }
        });
      });
    }
  } catch (err) {
    console.error('Subtitle load error:', err);
  }
}

async function activateSubtitle(subObj) {
  state.playing.activeSubtitleTrack = subObj;
  try {
    const res = await fetch(subObj.url);
    const text = await res.text();
    state.playing.subCues = parseVttOrSrt(text);
    showToast(`تم تفعيل ترجمة: ${subObj.label}`);
  } catch (e) {
    console.error('Subtitle parse error:', e);
  }
}

function parseVttOrSrt(content) {
  const cues = [];
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    let line = lines[i].trim();
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const start = parseTimestamp(parts[0].trim());
      const end = parseTimestamp(parts[1].trim().split(' ')[0]);
      let cueText = '';
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        cueText += (cueText ? ' ' : '') + lines[i].trim();
        i++;
      }
      if (cueText) {
        cues.push({ start, end, text: cueText.replace(/<[^>]+>/g, '') });
      }
    }
    i++;
  }
  return cues;
}

function parseTimestamp(str) {
  const parts = str.split(':');
  if (parts.length === 3) {
    const secParts = parts[2].split(/[.,]/);
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(secParts[0], 10) + (parseInt(secParts[1] || '0', 10) / 1000);
  } else if (parts.length === 2) {
    const secParts = parts[1].split(/[.,]/);
    return parseInt(parts[0], 10) * 60 + parseInt(secParts[0], 10) + (parseInt(secParts[1] || '0', 10) / 1000);
  }
  return 0;
}

// --------------------------------------------------------------------------
// Video TimeUpdate & Subtitle Sync
// --------------------------------------------------------------------------
DOM.mainVideo.addEventListener('timeupdate', () => {
  const cur = DOM.mainVideo.currentTime;
  const dur = DOM.mainVideo.duration || 0;

  if (!isScrubbing && dur > 0) {
    const percent = (cur / dur) * 100;
    DOM.timelinePlayedBar.style.width = `${percent}%`;
    DOM.playerCurrentTime.textContent = formatTime(cur);
    DOM.playerDuration.textContent = formatTime(dur);
  }

  // Update buffer bar
  if (DOM.mainVideo.buffered.length > 0 && dur > 0) {
    const buffEnd = DOM.mainVideo.buffered.end(DOM.mainVideo.buffered.length - 1);
    DOM.timelineBufferBar.style.width = `${(buffEnd / dur) * 100}%`;
  }

  // Subtitle synchronization
  if (state.playing.subCues && state.playing.subCues.length > 0) {
    const match = state.playing.subCues.find(c => cur >= c.start && cur <= c.end);
    DOM.activeSubtitleText.textContent = match ? match.text : '';
  }

  // Save Progress periodically (every ~5 seconds)
  if (Math.floor(cur) % 5 === 0 && dur > 0) {
    savePlaybackProgress(cur, dur);
  }
});

function savePlaybackProgress(time, duration) {
  const item = state.playing.item;
  if (!item) return;

  const key = `${item.subjectId || item.id}_${state.playing.season}_${state.playing.episode}`;
  state.watchProgress[key] = {
    item: item,
    season: state.playing.season,
    episode: state.playing.episode,
    time: Math.round(time),
    duration: Math.round(duration),
    timestamp: Date.now()
  };

  localStorage.setItem('cf_web_progress', JSON.stringify(state.watchProgress));
}

// Play/Pause State Watchers
DOM.mainVideo.addEventListener('play', () => {
  DOM.centerPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  DOM.bottomPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
  DOM.playerSpinner.style.display = 'none';
  resetControlsTimer();
});

DOM.mainVideo.addEventListener('pause', () => {
  DOM.centerPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  DOM.bottomPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
  showControls();
});

DOM.mainVideo.addEventListener('waiting', () => {
  DOM.playerSpinner.style.display = 'block';
});

DOM.mainVideo.addEventListener('canplay', () => {
  DOM.playerSpinner.style.display = 'none';
});

// --------------------------------------------------------------------------
// Controls Visibility & Gestures (Double-Tap to Fullscreen / Dismiss)
// --------------------------------------------------------------------------
function resetControlsTimer() {
  clearTimeout(controlsTimeout);
  DOM.webPlayer.classList.remove('controls-hidden');

  if (!DOM.mainVideo.paused) {
    controlsTimeout = setTimeout(() => {
      DOM.webPlayer.classList.add('controls-hidden');
    }, 3500);
  }
}

function showControls() {
  clearTimeout(controlsTimeout);
  DOM.webPlayer.classList.remove('controls-hidden');
}

function toggleControls() {
  if (DOM.webPlayer.classList.contains('controls-hidden')) {
    showControls();
    resetControlsTimer();
  } else {
    DOM.webPlayer.classList.add('controls-hidden');
    clearTimeout(controlsTimeout);
  }
}

// Double-Tap and Tap Gestures
let lastClickTime = 0;
DOM.webPlayer.addEventListener('click', (e) => {
  // If clicking on specific control buttons, don't trigger background click
  if (e.target.closest('.player-top-bar') || e.target.closest('.player-bottom-bar') || e.target.closest('.player-episodes-drawer') || e.target.closest('.player-subtitles-modal')) {
    return;
  }

  const now = Date.now();
  const diff = now - lastClickTime;
  lastClickTime = now;

  if (diff < 300) {
    // DOUBLE TAP!
    const rect = DOM.webPlayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;

    if (x < w * 0.35) {
      // Seek -10s
      seekRelative(-10);
      triggerIndicator(DOM.rewindIndicator);
    } else if (x > w * 0.65) {
      // Seek +10s
      seekRelative(10);
      triggerIndicator(DOM.forwardIndicator);
    } else {
      // Center Double-Tap: Instantly toggle fullscreen and hide all controls!
      toggleFullscreen();
      DOM.webPlayer.classList.add('controls-hidden');
    }
  } else {
    // Single Tap: Toggle controls visibility immediately!
    toggleControls();
  }
});

function triggerIndicator(elem) {
  elem.classList.add('active');
  setTimeout(() => elem.classList.remove('active'), 500);
}

function seekRelative(sec) {
  DOM.mainVideo.currentTime = Math.max(0, Math.min(DOM.mainVideo.duration, DOM.mainVideo.currentTime + sec));
  resetControlsTimer();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    DOM.webPlayer.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// Timeline Scrubber Click & Drag
DOM.timelineContainer.addEventListener('mousedown', (e) => {
  isScrubbing = true;
  seekToPosition(e);
});

window.addEventListener('mousemove', (e) => {
  if (isScrubbing) seekToPosition(e);
});

window.addEventListener('mouseup', () => {
  if (isScrubbing) {
    isScrubbing = false;
    resetControlsTimer();
  }
});

DOM.timelineContainer.addEventListener('touchstart', (e) => {
  isScrubbing = true;
  seekToPosition(e.touches[0]);
});

window.addEventListener('touchmove', (e) => {
  if (isScrubbing) seekToPosition(e.touches[0]);
});

window.addEventListener('touchend', () => {
  if (isScrubbing) isScrubbing = false;
});

function seekToPosition(e) {
  const rect = DOM.timelineContainer.getBoundingClientRect();
  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  // In RTL, 100% is on left
  const rtlPos = 1 - pos;
  if (DOM.mainVideo.duration) {
    DOM.mainVideo.currentTime = DOM.mainVideo.duration * rtlPos;
  }
}

// --------------------------------------------------------------------------
// Event Listeners & Keyboard Shortcuts
// --------------------------------------------------------------------------
function setupEventListeners() {

  // Subtitle Settings Modal Events
  if (DOM.openSettingsBtn) DOM.openSettingsBtn.addEventListener('click', openSettingsModal);
  if (DOM.closeSettingsBtn) DOM.closeSettingsBtn.addEventListener('click', closeSettingsModal);
  if (DOM.settingsBackdropClick) DOM.settingsBackdropClick.addEventListener('click', closeSettingsModal);

  document.querySelectorAll('#subSizeSelector .pill-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#subSizeSelector .pill-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.subtitleSettings.fontSize = btn.dataset.val;
      applySubtitleSettings();
    });
  });

  document.querySelectorAll('#subFontSelector .pill-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#subFontSelector .pill-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.subtitleSettings.fontFamily = btn.dataset.val;
      applySubtitleSettings();
    });
  });

  document.querySelectorAll('#subColorSelector .color-circle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#subColorSelector .color-circle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.subtitleSettings.color = btn.dataset.val;
      applySubtitleSettings();
    });
  });

  document.querySelectorAll('#subBgSelector .pill-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#subBgSelector .pill-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.subtitleSettings.bgStyle = btn.dataset.val;
      applySubtitleSettings();
    });
  });

  document.querySelectorAll('#subShadowSelector .pill-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#subShadowSelector .pill-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.subtitleSettings.shadowStyle = btn.dataset.val;
      applySubtitleSettings();
    });
  });

  if (DOM.saveSettingsBtn) {
    DOM.saveSettingsBtn.addEventListener('click', () => {
      localStorage.setItem('cf_sub_settings', JSON.stringify(state.subtitleSettings));
      applySubtitleSettings();
      closeSettingsModal();
      showToast('تم حفظ إعدادات الترجمة بنجاح في متصفحك ✓');
    });
  }

  if (DOM.resetSettingsBtn) {
    DOM.resetSettingsBtn.addEventListener('click', () => {
      state.subtitleSettings = {
        fontSize: '21',
        fontFamily: "'Almarai', sans-serif",
        color: '#FFFFFF',
        bgStyle: 'transparent',
        shadowStyle: 'heavy'
      };
      localStorage.setItem('cf_sub_settings', JSON.stringify(state.subtitleSettings));
      syncSettingsUI();
      applySubtitleSettings();
      showToast('تمت استعادة إعدادات الترجمة الافتراضية');
    });
  }

  // Brand logo click -> home
  DOM.brandLogo.addEventListener('click', (e) => {
    e.preventDefault();
    DOM.searchInput.value = '';
    handleSearch('');
    document.querySelector('[data-filter=all]').click();
  });

  // Filter pills
  DOM.filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      DOM.filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilter = pill.dataset.filter;
      renderShelves();
    });
  });

  // Desktop & Mobile Nav
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const filter = item.dataset.filter;
      DOM.navItems.forEach(i => i.classList.remove('active'));
      document.querySelectorAll(`[data-filter=${filter}]`).forEach(el => el.classList.add('active'));
      state.activeFilter = filter;
      renderShelves();
    });
  });

  // Search
  DOM.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    handleSearch('');
  });

  // Hero Actions
  DOM.heroPlayBtn.addEventListener('click', () => {
    const b = state.banners[state.currentHeroIdx];
    if (b) startPlayback(b);
  });

  DOM.heroInfoBtn.addEventListener('click', () => {
    const b = state.banners[state.currentHeroIdx];
    if (b) openDetailsModal(b.subjectId || b.id, b.detailPath);
  });

  DOM.heroFavBtn.addEventListener('click', () => {
    const b = state.banners[state.currentHeroIdx];
    if (b) toggleWatchlist(b);
  });

  // Modal Actions
  DOM.modalBackdropClick.addEventListener('click', closeModal);
  DOM.modalCloseBtn.addEventListener('click', closeModal);
  DOM.modalDirectPlayBtn.addEventListener('click', () => {
    closeModal();
    startPlayback(state.modalItem);
  });
  DOM.modalFavBtn.addEventListener('click', () => {
    toggleWatchlist(state.modalItem);
  });

  // Player Actions
  if (DOM.playerBackBtn) DOM.playerBackBtn.addEventListener('click', closePlayer);
  if (DOM.playerCenterPlayBtn) {
    DOM.playerCenterPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.mainVideo && DOM.mainVideo.paused) DOM.mainVideo.play().catch(() => {});
      else if (DOM.mainVideo) DOM.mainVideo.pause();
    });
  }
  if (DOM.playerPlayPauseBtn) {
    DOM.playerPlayPauseBtn.addEventListener('click', () => {
      if (DOM.mainVideo && DOM.mainVideo.paused) DOM.mainVideo.play().catch(() => {});
      else if (DOM.mainVideo) DOM.mainVideo.pause();
    });
  }
  if (DOM.playerRewind10Btn) DOM.playerRewind10Btn.addEventListener('click', () => seekRelative(-10));
  if (DOM.playerForward10Btn) DOM.playerForward10Btn.addEventListener('click', () => seekRelative(10));
  if (DOM.playerFullscreenBtn) DOM.playerFullscreenBtn.addEventListener('click', toggleFullscreen);

  // Quality Dropdown Toggle (if present)
  if (DOM.playerQualityPill) {
    DOM.playerQualityPill.addEventListener('click', (e) => {
      e.stopPropagation();
      if (DOM.qualityDropdown) DOM.qualityDropdown.classList.toggle('show');
    });
  }

  // Subtitles Customization Modal Trigger
  if (DOM.playerSubtitlesBtn) {
    DOM.playerSubtitlesBtn.addEventListener('click', openSettingsModal);
  }
  if (DOM.subtitlesModalCloseBtn) {
    DOM.subtitlesModalCloseBtn.addEventListener('click', () => {
      if (DOM.playerSubtitlesModal) DOM.playerSubtitlesModal.style.display = 'none';
    });
  }

  // Episodes Drawer Toggle
  if (DOM.playerEpisodesDrawerBtn) {
    DOM.playerEpisodesDrawerBtn.addEventListener('click', () => {
      if (DOM.playerEpisodesDrawer) DOM.playerEpisodesDrawer.classList.toggle('open');
    });
  }
  if (DOM.drawerCloseBtn) {
    DOM.drawerCloseBtn.addEventListener('click', () => {
      if (DOM.playerEpisodesDrawer) DOM.playerEpisodesDrawer.classList.remove('open');
    });
  }

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If typing in search box, ignore hotkeys
    if (document.activeElement === DOM.searchInput) return;

    if (DOM.webPlayer.classList.contains('active')) {
      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        if (DOM.mainVideo.paused) DOM.mainVideo.play().catch(() => {});
        else DOM.mainVideo.pause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        DOM.mainVideo.muted = !DOM.mainVideo.muted;
        showToast(DOM.mainVideo.muted ? 'تم كتم الصوت' : 'تم تشغيل الصوت');
      } else if (e.code === 'Escape') {
        closePlayer();
      }
    } else if (DOM.detailsModal.classList.contains('open') && e.code === 'Escape') {
      closeModal();
    }
  });
}

// --------------------------------------------------------------------------
// Utility Helpers
// --------------------------------------------------------------------------
function formatTime(sec) {
  const s = Math.floor(sec || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  DOM.toast.textContent = msg;
  DOM.toast.classList.add('show');
  toastTimer = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 3200);
}

// Run app on load
window.addEventListener('DOMContentLoaded', initApp);
