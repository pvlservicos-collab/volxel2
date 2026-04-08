/* =============================================
   FOLLEM MÍDIA — main.js  (completo)
============================================= */

// ==================== CONFETTI ====================
const Confetti = (() => {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let parts = [], animId = null, active = false;
  const COLORS = ['#2a7ed4', '#4a9de8', '#34d399', '#f59e0b', '#a78bfa', '#f05252', '#06b6d4', '#ec4899', '#84cc16'];
  class P {
    constructor() { this.init(true) }
    init(fresh) {
      this.x = Math.random() * canvas.width; this.y = fresh ? -Math.random() * canvas.height * .5 : -20;
      this.vx = (Math.random() - .5) * 5; this.vy = Math.random() * 4 + 2;
      this.rot = Math.random() * Math.PI * 2; this.rv = (Math.random() - .5) * .18;
      this.w = Math.random() * 11 + 5; this.h = Math.random() * 6 + 3;
      this.col = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.shape = Math.random() > .5 ? 'r' : 'c';
      this.life = 1; this.decay = Math.random() * .009 + .003; this.wt = Math.random() * Math.PI * 2;
    }
    tick() { this.vy += .1; this.vx += Math.sin(this.wt) * .04; this.wt += .1; this.x += this.vx; this.y += this.vy; this.rot += this.rv; this.life -= this.decay }
    draw() {
      ctx.save(); ctx.globalAlpha = Math.max(0, this.life);
      ctx.translate(this.x, this.y); ctx.rotate(this.rot); ctx.fillStyle = this.col;
      if (this.shape === 'c') { ctx.beginPath(); ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2); ctx.fill() }
      else ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      ctx.restore();
    }
    dead() { return this.life <= 0 || this.y > canvas.height + 40 }
  }
  function resize() { canvas.width = innerWidth; canvas.height = innerHeight }
  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    parts = parts.filter(p => { p.tick(); p.draw(); return !p.dead() });
    if (parts.length || active) animId = requestAnimationFrame(loop);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); animId = null }
  }
  window.addEventListener('resize', resize); resize();
  return {
    launch(n = 140) {
      resize(); active = true;
      for (let i = 0; i < n; i++) setTimeout(() => parts.push(new P()), Math.random() * 700);
      if (!animId) loop();
      setTimeout(() => { active = false }, 1500);
    }
  };
})();

// ==================== MASCOT ====================
const Mascot = (() => {
  const wrap = document.getElementById('mascot-wrap');
  const gif = document.getElementById('mascot-gif');
  const bubble = document.getElementById('mascot-bubble');
  const menu = document.getElementById('mascot-menu');

  const STATES = [
    { gif: 'g3.gif', texts: ['Grave!', 'Grave mais!', 'Bora gravar!', 'Já gravou hoje?', 'Mais um! 🎬'] },
    { gif: 'g6.gif', texts: ['Grava pra gente vai'] },
    { gif: 'g7.gif', texts: ['Grava! Grava! Grava! 📣'] }
  ];

  let stateIdx = 0, cycleTimer = null, resumeTimer = null, menuTimer = null;
  let paused = false, menuOpen = false, actionLock = false;

  function showNextBubble() {
    if (paused) return;

    const st = STATES[stateIdx % STATES.length];
    gif.src = st.gif;
    bubble.style.display = '';
    
    // Se for g3, pega uma frase aleatória. Se não, pega a única disponível.
    const txt = st.gif === 'g3.gif' 
      ? st.texts[Math.floor(Math.random() * st.texts.length)]
      : st.texts[0];

    bubble.textContent = txt;
    stateIdx++; // Sempre avança para o próximo GIF no próximo ciclo

    bubble.style.animation = 'none'; void bubble.offsetWidth;
    bubble.style.animation = 'bubblePop .55s cubic-bezier(.34,1.56,.64,1) both';
  }

  function startCycle() { stopCycle(); paused = false; showNextBubble(); cycleTimer = setInterval(showNextBubble, 5000) }
  function stopCycle() { clearInterval(cycleTimer); cycleTimer = null }
  function pauseCycle() {
    if (paused) return; paused = true; stopCycle();
    bubble.style.opacity = '0'; bubble.style.transform = 'scale(.8)'; bubble.style.transition = 'opacity .2s,transform .2s';
    setTimeout(() => { bubble.style.display = 'none'; bubble.style.opacity = ''; bubble.style.transform = ''; bubble.style.transition = '' }, 220);
  }
  function resumeAfter(s) {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { if (!actionLock && !menuOpen) startCycle() }, s * 1000);
  }

  wrap.addEventListener('mouseenter', () => {
    if (actionLock) return;
    clearTimeout(menuTimer);
    pauseCycle(); gif.src = 'g1.gif'; menu.classList.add('visible'); menuOpen = true;
  });
  wrap.addEventListener('mouseleave', (e) => {
    if (wrap.contains(e.relatedTarget)) return;
    if (actionLock) return;
    
    // Delay de 3 segundos para sumir o menu
    menuTimer = setTimeout(() => {
      const st = STATES[stateIdx % STATES.length];
      gif.src = st.gif;
      menu.classList.remove('visible'); menuOpen = false; resumeAfter(2);
    }, 3000);
  });

  const ACTIONS = {
    reproduz: { gif: 'g2.gif', msg: '🎬 Pedi alterações!' },
    boa: { gif: 'g4.gif', msg: '🤩 Boa! Continue assim!' },
    melhore: { gif: 'g5.gif', msg: '📈 Dá pra melhorar!' },
  };
  document.querySelectorAll('.mascot-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const data = ACTIONS[btn.dataset.action]; if (!data) return;
      pauseCycle(); actionLock = true; gif.src = data.gif;
      bubble.style.display = ''; bubble.style.opacity = ''; bubble.style.transform = '';
      bubble.textContent = data.msg; bubble.style.animation = 'none'; void bubble.offsetWidth;
      bubble.style.animation = 'bubblePop .55s cubic-bezier(.34,1.56,.64,1) both';
      menu.classList.remove('visible'); menuOpen = false;
      showToast(data.msg);
      setTimeout(() => {
        actionLock = false;
        const st = STATES[stateIdx % STATES.length];
        gif.src = st.gif;
        resumeAfter(4);
      }, 4000);
    });
  });
  startCycle();
  return { flash(msg) { if (paused) return; bubble.style.display = ''; bubble.textContent = msg; bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = 'bubblePop .55s cubic-bezier(.34,1.56,.64,1) both' } };
})();

// ==================== MOBILE MENU ====================
function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu'), o = document.getElementById('mobile-menu-overlay'), b = document.getElementById('hamburger');
  const open = m.classList.contains('open');
  m.classList.toggle('open', !open); o.classList.toggle('open', !open); b.classList.toggle('open', !open);
}
function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('mobile-menu-overlay').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}
function toggleDayCol(col) { if (window.innerWidth > 768) return; col.classList.toggle('collapsed') }

// ==================== TOAST ====================
function showToast(msg, dur = 2800) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), dur);
}

// ==================== SUPABASE INIT ====================
const supabaseUrl = 'https://dbmplrsraatfhvreuodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRibXBscnNyYWF0Zmh2cmV1b2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzI0MjcsImV4cCI6MjA5MTI0ODQyN30.KyS5P1c7s8IoSxDHAfh_670ONxhIcI7945pOUlQxuH0';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==================== STORAGE (SUPABASE) ====================
async function loadPosts() {
  const { data, error } = await _supabase.from('posts').select('*');
  if (error) { console.error('Erro ao carregar posts:', error); return [] }
  return data.map(p => ({
    id: p.id,
    title: p.title,
    catId: p.cat_id,
    format: p.format,
    desc: p.description,
    dayOffset: p.day_offset,
    status: p.status,
    comment: p.comment,
    weekTs: parseInt(p.week_ts),
    tinderStatus: p.tinder_status
  }));
}

async function savePosts(postsList) {
  const mapped = (Array.isArray(postsList) ? postsList : [postsList]).map(p => ({
    id: p.id,
    title: p.title,
    cat_id: p.catId,
    format: p.format,
    description: p.desc,
    day_offset: p.dayOffset,
    status: p.status,
    comment: p.comment,
    week_ts: p.weekTs,
    tinder_status: p.tinderStatus
  }));
  const { error } = await _supabase.from('posts').upsert(mapped);
  if (error) console.error('Erro ao salvar posts:', error);
}

async function deletePostDb(id) {
  const { error } = await _supabase.from('posts').delete().eq('id', id);
  if (error) console.error('Erro ao excluir post:', error);
}

async function loadCats() {
  const { data, error } = await _supabase.from('categories').select('*');
  if (error) { console.error('Erro ao carregar categorias:', error); return [] }
  if (data.length === 0) return defaultCats();
  return data.map(c => ({ id: c.id, name: c.name, color: c.color }));
}

async function saveCats(catsList) {
  const mapped = (Array.isArray(catsList) ? catsList : [catsList]).map(c => ({
    id: c.id,
    name: c.name,
    color: c.color
  }));
  const { error } = await _supabase.from('categories').upsert(mapped);
  if (error) console.error('Erro ao salvar categorias:', error);
}

async function deleteCatDb(id) {
  const { error } = await _supabase.from('categories').delete().eq('id', id);
  if (error) console.error('Erro ao excluir categoria:', error);
}

async function loadVideos() {
  const { data, error } = await _supabase.from('videos').select('*');
  if (error) { console.error('Erro ao carregar vídeos:', error); return [] }
  return data.map(v => ({
    id: v.id,
    title: v.title,
    date: v.date,
    link: v.link,
    notes: v.notes,
    col: v.col
  }));
}

async function saveVideos(vidsList) {
  const mapped = (Array.isArray(vidsList) ? vidsList : [vidsList]).map(v => ({
    id: v.id,
    title: v.title,
    date: v.date,
    link: v.link,
    notes: v.notes,
    col: v.col
  }));
  const { error } = await _supabase.from('videos').upsert(mapped);
  if (error) console.error('Erro ao salvar vídeos:', error);
}

async function deleteVideoDb(id) {
  const { error } = await _supabase.from('videos').delete().eq('id', id);
  if (error) console.error('Erro ao excluir vídeo:', error);
}

function defaultCats() {
  return [
    { id: 'c1', name: 'Educativo', color: '#2a7ed4' },
    { id: 'c2', name: 'Depoimento', color: '#34d399' },
    { id: 'c3', name: 'Produto', color: '#f05252' },
    { id: 'c4', name: 'Bastidores', color: '#f59e0b' },
  ];
}
function defaultPosts() {
  const wts = getMonday(new Date()).getTime();
  return [
    { id: 'p1', title: '3 dicas para crescer no Instagram', catId: 'c1', format: 'Reels', desc: 'Falar sobre consistência, nicho e CTA.', dayOffset: 0, status: 'pendente', comment: '', weekTs: wts, tinderStatus: '' },
    { id: 'p2', title: 'Depoimento da cliente Maria', catId: 'c2', format: 'Carrossel', desc: 'Mostrar antes e depois dos resultados.', dayOffset: 0, status: 'pendente', comment: '', weekTs: wts, tinderStatus: '' },
    { id: 'p3', title: 'Lançamento do novo pacote premium', catId: 'c3', format: 'Reels', desc: 'Apresentar os diferenciais e preço.', dayOffset: 1, status: 'pendente', comment: '', weekTs: wts, tinderStatus: '' },
  ];
}

// ==================== STATE ====================
let posts = [], categories = [], videos = [];
let weekStart = getMonday(new Date()), currentPage = 'expert', commentTarget = null, editTarget = null;
let swapTarget = null;

// Tinder state
let tinderQueue = [], tinderIdx = 0, tinderAlterMode = false;

// ==================== DATE UTILS ====================
function getMonday(d) { const dt = new Date(d), day = dt.getDay(); dt.setDate(dt.getDate() + (day === 0 ? -6 : 1 - day)); dt.setHours(0, 0, 0, 0); return dt }
function addDays(d, n) { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt }
function isToday(d) { const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear() }
function fmtDay(d) { return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '').toUpperCase() }
function fmtRange(s) { const e = addDays(s, 4), o = { day: 'numeric', month: 'short' }; return `${s.toLocaleDateString('pt-BR', o)} – ${e.toLocaleDateString('pt-BR', o)}` }
function getWeekOfMonth(d) { const f = new Date(d.getFullYear(), d.getMonth(), 1); return Math.ceil((d.getDate() + f.getDay()) / 7) }
const DAYS_PT = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const EDITOR_COLS = ['A Editar', 'Fazendo', 'Revisar', 'Alterar', 'Pronto'];

// ==================== NAVIGATE ====================
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));
  if (page === 'social') renderSocial();
  if (page === 'expert') renderCalendar();
  if (page === 'editor') renderEditorBoard();
}

// ==================== WEEK NAV ====================
function prevWeek() {
  const thisMonday = getMonday(new Date()), prev = addDays(weekStart, -7);
  if (prev < thisMonday) return;
  weekStart = prev; renderCalendar();
}
function nextWeek() { weekStart = addDays(weekStart, 7); renderCalendar() }
function goToday() { weekStart = getMonday(new Date()); renderCalendar() }

// ==================== RENDER CALENDAR ====================
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('expert-week-label');
  const sbar = document.getElementById('sidebar-week-info');
  const isMobile = window.innerWidth <= 768;
  const weekNum = getWeekOfMonth(weekStart);
  const monthName = weekStart.toLocaleDateString('pt-BR', { month: 'long' });
  label.textContent = `Semana ${weekNum} de ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} · ${fmtRange(weekStart)}`;
  sbar.textContent = `Sem. ${weekNum} · ${fmtRange(weekStart)}`;
  grid.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const day = addDays(weekStart, i);
    const dayPosts = posts.filter(p =>
      p.status !== 'reprovado' && p.status !== 'gravado' && p.status !== 'na' &&
      p.dayOffset === i && (!p.weekTs || p.weekTs === weekStart.getTime())
    );
    const today = isToday(day);
    const col = document.createElement('div');
    col.className = 'day-col' + (isMobile && !today ? ' collapsed' : '');
    const hdr = document.createElement('div');
    hdr.className = 'day-header' + (today ? ' today' : '');
    if (isMobile) {
      hdr.onclick = () => toggleDayCol(col);
      hdr.innerHTML = `<div class="day-header-info"><div class="week-label-row">Semana ${weekNum}</div><div class="day-name">${fmtDay(day)}</div></div><div class="day-date">${day.getDate()}</div><span class="collapse-arrow">▼</span>`;
    } else {
      hdr.innerHTML = `<div class="week-label-row">Semana ${weekNum}</div><div class="day-name">${fmtDay(day)}</div><div class="day-date">${day.getDate()}</div>`;
    }
    col.appendChild(hdr);
    const cards = document.createElement('div'); cards.className = 'day-cards';
    if (!dayPosts.length) { cards.innerHTML = '<div class="empty-day">Sem posts</div>' }
    else dayPosts.forEach(p => cards.appendChild(buildCard(p)));
    col.appendChild(cards); grid.appendChild(col);
  }
  updateBadge(); updateMetrics();
}

// ==================== BUILD CARD ====================
function buildCard(post) {
  const cat = categories.find(c => c.id === post.catId) || { name: 'Geral', color: '#4d718f' };
  const el = document.createElement('div');
  el.className = `content-card status-${post.status}`; el.id = `card-${post.id}`;
  const isG = post.status === 'gravado', isR = post.status === 'reprovado';
  const isT = post.status === 'troca', isC = post.status === 'comentado';
  let commentHtml = '';
  if (post.comment) {
    const id = `cmnt-${post.id}`;
    commentHtml = `<div class="card-comment-wrap"><div class="card-comment-display" id="${id}">"${escHtml(post.comment)}"</div><button class="card-comment-toggle" onclick="toggleComment('${id}',this)"><span class="toggle-arrow" id="arr-${id}">▼</span> ver mais</button></div>`;
  }
  el.innerHTML = `
    <div class="card-header-row">
      <span class="card-category" style="background:${cat.color}22;color:${cat.color};border:1px solid ${cat.color}44">${cat.name}</span>
      <button class="card-edit-btn" onclick="openEditModal('${post.id}')" title="Editar post">✏️</button>
    </div>
    <div class="card-title">${escHtml(post.title)}</div>
    <span class="card-format-pill">📹 ${post.format}</span>
    ${post.desc ? `<div class="card-desc">${escHtml(post.desc)}</div>` : ''}
    ${commentHtml}
    <div class="card-actions">
      <button class="card-btn btn-reprovar${isR ? ' active' : ''}" onclick="doReprovar('${post.id}')">✕ Reprovar</button>
      <button class="card-btn btn-trocar${isT ? ' active' : ''}"   onclick="doTrocar('${post.id}')">⇄ Trocar</button>
      <button class="card-btn btn-comentar${isC ? ' active' : ''}" onclick="openComment('${post.id}')">💬 Comentar</button>
      <button class="card-btn btn-gravado${isG ? ' active' : ''}"  onclick="doGravado('${post.id}')">🎬 ${isG ? 'Gravado!' : 'Marcar Gravado'}</button>
    </div>`;
  return el;
}

function toggleComment(id, btn) {
  const el = document.getElementById(id), arr = document.getElementById('arr-' + id);
  const expanded = el.classList.toggle('expanded');
  arr.classList.toggle('up', expanded);
  btn.childNodes[1].nodeValue = expanded ? ' ver menos' : ' ver mais';
}

// ==================== CARD ACTIONS ====================
async function doReprovar(id) {
  const post = posts.find(p => p.id === id); if (!post) return;
  post.status = post.status === 'reprovado' ? 'pendente' : 'reprovado';
  if (post.status === 'reprovado') showToast('❌ Post reprovado.');
  await savePosts(post); renderCalendar(); updateBadge(); updateMetrics();
}

function doTrocar(id) {
  const post = posts.find(p => p.id === id); if (!post) return;
  swapTarget = id;
  const candidates = posts.filter(p => p.id !== id && p.catId === post.catId && p.status !== 'reprovado');
  const cat = categories.find(c => c.id === post.catId) || { name: 'Geral', color: '#4d718f' };
  const body = document.getElementById('swap-body');
  if (!candidates.length) {
    body.innerHTML = `<p style="color:var(--text-2);font-size:13px;padding:8px 0">Nenhum outro post na categoria <strong>${cat.name}</strong>.</p><div style="margin-top:14px;display:flex;justify-content:flex-end"><button class="btn-secondary" onclick="closeSwap()">Fechar</button></div>`;
  } else {
    body.innerHTML = `
      <p style="font-size:12px;color:var(--text-3);margin-bottom:12px">Selecione um post da categoria <span style="color:${cat.color};font-weight:700">${cat.name}</span> para substituir:</p>
      <div class="swap-list">
        ${candidates.map(c => `<div class="swap-item" onclick="confirmSwap('${c.id}')"><div class="swap-item-title">${escHtml(c.title)}</div><div class="swap-item-meta">📹 ${c.format} · ${c.dayOffset >= 0 ? DAYS_PT[c.dayOffset] : 'Sem dia'}</div></div>`).join('')}
      </div>
      <div style="margin-top:14px;display:flex;justify-content:flex-end"><button class="btn-secondary" onclick="closeSwap()">Cancelar</button></div>`;
  }
  document.getElementById('swap-overlay').classList.add('open');
}
async function confirmSwap(newId) {
  const orig = posts.find(p => p.id === swapTarget), next = posts.find(p => p.id === newId);
  if (!orig || !next) { closeSwap(); return }
  const tmpDay = orig.dayOffset; orig.dayOffset = next.dayOffset; next.dayOffset = tmpDay;
  orig.status = 'troca'; 
  await savePosts([orig, next]); 
  closeSwap();
  showToast(`⇄ Trocado com "${next.title}"`); renderCalendar(); updateBadge();
}
function closeSwap() { document.getElementById('swap-overlay').classList.remove('open'); swapTarget = null }

async function doGravado(id) {
  const post = posts.find(p => p.id === id); if (!post) return;
  if (post.status === 'gravado') { 
    post.status = 'pendente'; 
    post.dayOffset = post._origDay || post.dayOffset; 
    await savePosts(post); 
    renderCalendar(); return 
  }
  post._origDay = post.dayOffset; post.status = 'gravado'; post.dayOffset = -2;
  await savePosts(post); renderCalendar(); updateBadge(); updateMetrics();
  Confetti.launch(160); showToast('🎬 Gravado! Movido para o Social Media.');
  setTimeout(() => { navigate('social'); switchTab('feedback', 'social') }, 1800);
}

function openComment(id) {
  commentTarget = id;
  const post = posts.find(p => p.id === id);
  const ta = document.getElementById('comment-text');
  ta.value = post?.comment || ''; updateCharCount();
  document.getElementById('comment-overlay').classList.add('open');
  setTimeout(() => ta.focus(), 80);
}
function closeComment() { document.getElementById('comment-overlay').classList.remove('open'); commentTarget = null }
function updateCharCount() { const ta = document.getElementById('comment-text'); document.getElementById('comment-chars').textContent = `${ta.value.length} / 400` }
document.getElementById('comment-text').addEventListener('input', updateCharCount);
async function submitComment() {
  const txt = document.getElementById('comment-text').value.trim();
  if (!txt || !commentTarget) { closeComment(); return }
  const post = posts.find(p => p.id === commentTarget); if (!post) return;
  post.comment = txt; post.status = 'comentado'; 
  await savePosts(post); closeComment();
  showToast('💬 Comentário enviado!'); renderCalendar(); updateBadge(); updateMetrics();
}

// ==================== BADGE + METRICS ====================
function updateBadge() {
  const n = posts.filter(p => ['reprovado', 'troca', 'comentado'].includes(p.status)).length;
  ['nav-badge', 'nav-badge-mobile'].forEach(id => { const el = document.getElementById(id); if (el) { el.textContent = n; el.style.display = n > 0 ? 'inline-block' : 'none' } });
}
function updateMetrics() {
  const mg = document.getElementById('metric-gravados');
  const mc = document.getElementById('metric-comentarios');
  const mr = document.getElementById('metric-reprovados');
  if (mg) mg.textContent = posts.filter(p => p.status === 'gravado').length;
  if (mc) mc.textContent = posts.filter(p => p.status === 'comentado').length;
  if (mr) mr.textContent = posts.filter(p => p.status === 'reprovado').length;
}

// ==================== TINDER ====================
function openTinder() {
  const wts = weekStart.getTime();
  tinderQueue = posts.filter(p =>
    p.dayOffset >= 0 && (!p.weekTs || p.weekTs === wts) &&
    p.status !== 'reprovado' && p.status !== 'gravado' && p.status !== 'na'
  );
  tinderIdx = 0; tinderAlterMode = false;
  document.getElementById('tinder-overlay').classList.add('open');
  renderTinderCard();
}
function closeTinder() { document.getElementById('tinder-overlay').classList.remove('open') }

function renderTinderCard() {
  const body = document.getElementById('tinder-body');
  const acts = document.getElementById('tinder-actions');
  const counter = document.getElementById('tinder-counter');
  const total = tinderQueue.length;

  if (total === 0) {
    body.innerHTML = '<div class="tinder-empty">Nenhum post disponível esta semana.</div>';
    acts.innerHTML = ''; counter.textContent = ''; return;
  }
  if (tinderIdx >= total) {
    body.innerHTML = '<div class="tinder-done">✅ Todos os conteúdos revisados!</div>';
    acts.innerHTML = `<button class="btn-secondary" onclick="closeTinder()">Fechar</button>`;
    counter.textContent = `${total} de ${total} revisados`;
    if (currentPage === 'social') renderSocial();
    return;
  }

  const post = tinderQueue[tinderIdx];
  const cat = categories.find(c => c.id === post.catId) || { name: 'Geral', color: '#4d718f' };
  counter.textContent = `${tinderIdx + 1} de ${total}`;

  body.innerHTML = `
    <div class="tinder-card">
      <div class="tinder-card-cat" style="background:${cat.color}22;color:${cat.color};border:1px solid ${cat.color}44">${cat.name}</div>
      <div class="tinder-card-title">${escHtml(post.title)}</div>
      <div class="tinder-card-format">📹 ${post.format} · ${post.dayOffset >= 0 ? DAYS_PT[post.dayOffset] : '—'}</div>
      ${post.desc ? `<div class="tinder-card-desc">${escHtml(post.desc)}</div>` : ''}
    </div>
    ${tinderAlterMode ? renderAlterBox(post.id) : ''}
  `;

  acts.innerHTML = `
    <button class="tinder-act-btn tact-remove" onclick="tinderAction('remove')">
      <div class="tinder-act-icon">✕</div>
      <span class="tinder-act-label">Remover</span>
    </button>
    <button class="tinder-act-btn tact-alter" onclick="tinderAction('alter')">
      <div class="tinder-act-icon">✏️</div>
      <span class="tinder-act-label">Alterar</span>
    </button>
    <button class="tinder-act-btn tact-ok" onclick="tinderAction('ok')">
      <div class="tinder-act-icon">✓</div>
      <span class="tinder-act-label">Aprovado</span>
    </button>
  `;
}

function renderAlterBox(postId) {
  const post = posts.find(p => p.id === postId) || {};
  return `
    <div class="tinder-alter-box">
      <textarea class="tinder-alter-textarea" id="tinder-alter-text" rows="3" placeholder="Escreva a alteração desejada...">${escHtml(post.desc || '')}</textarea>
      <button class="tinder-alter-save" onclick="tinderSaveAlter('${postId}')">💾 Salvar alteração</button>
    </div>
  `;
}

async function tinderAction(action) {
  const post = tinderQueue[tinderIdx]; if (!post) return;
  if (action === 'alter') {
    if (tinderAlterMode) { tinderAlterMode = false; renderTinderCard() }
    else { tinderAlterMode = true; renderTinderCard() }
    return;
  }
  if (action === 'remove') {
    post.tinderStatus = 'reprovado';
    post.status = 'reprovado';
    showToast('✕ Removido do calendário.');
  }
  if (action === 'ok') {
    post.tinderStatus = 'aprovado';
    showToast('✓ Aprovado!');
  }
  await savePosts(post); tinderAlterMode = false; tinderIdx++; renderTinderCard();
}

async function tinderSaveAlter(postId) {
  const txt = document.getElementById('tinder-alter-text')?.value.trim();
  if (!txt) return;
  const post = posts.find(p => p.id === postId); if (!post) return;
  post.desc = txt; post.tinderStatus = 'alterar';
  await savePosts(post); showToast('✏️ Alteração salva!');
  tinderAlterMode = false; tinderIdx++; renderTinderCard();
}

// ==================== TINDER SOCIAL TAB ====================
function renderTinderSocial() {
  const sec = document.getElementById('tinder-social-section');
  if (!sec) return;
  const tinderPosts = posts.filter(p => p.tinderStatus && p.tinderStatus !== '');
  const total = posts.filter(p => p.dayOffset >= 0 && p.status !== 'reprovado' && p.status !== 'gravado').length;

  let html = `
    <div class="tinder-social-header">
      <span style="font-size:22px">💘</span>
      <div>
        <div class="tinder-social-title">Tinder dos Conteúdos</div>
        <div class="tinder-social-sub">${tinderPosts.length} revisados · ${total} posts esta semana</div>
      </div>
    </div>
    <div class="tinder-social-grid">
  `;

  if (!tinderPosts.length) {
    html += `<div style="text-align:center;padding:32px;color:var(--text-3);font-size:13px">Nenhum conteúdo revisado ainda. O expert ainda não usou o Tinder.</div>`;
  } else {
    tinderPosts.forEach(post => {
      const cat = categories.find(c => c.id === post.catId) || { name: 'Geral', color: '#4d718f' };
      const statusMap = { aprovado: { label: 'Aprovado', cls: 'ts-aprovado' }, alterar: { label: 'Alterar', cls: 'ts-alterar' }, reprovado: { label: 'Reprovado', cls: 'ts-reprovado' } };
      const s = statusMap[post.tinderStatus] || { label: post.tinderStatus, cls: 'ts-pendente' };
      html += `
        <div class="tinder-social-item">
          <div class="tsi-dot" style="background:${cat.color}"></div>
          <div>
            <div class="tsi-title">${escHtml(post.title)}</div>
            <div class="tsi-meta">${cat.name} · ${post.format} · ${post.dayOffset >= 0 ? DAYS_PT[post.dayOffset] : '—'}</div>
            ${post.desc ? `<div class="tsi-meta" style="margin-top:3px;font-style:italic">${escHtml(post.desc)}</div>` : ''}
          </div>
          <span class="tsi-status ${s.cls}">${s.label}</span>
          <div class="tsi-actions">
            <button class="tsi-btn" onclick="openEditModal('${post.id}')">✏️ Editar</button>
            <button class="tsi-btn" onclick="clearTinderStatus('${post.id}')">↩ Resetar</button>
            <button class="tsi-btn del" onclick="deletePost('${post.id}')">✕</button>
          </div>
        </div>`;
    });
  }
  html += `</div>`;
  sec.innerHTML = html;
}

async function clearTinderStatus(id) {
  const post = posts.find(p => p.id === id); if (!post) return;
  post.tinderStatus = '';
  if (post.status === 'reprovado') post.status = 'pendente';
  await savePosts(post); renderTinderSocial(); renderCalendar(); showToast('↩ Status resetado.');
}

// ==================== RENDER SOCIAL ====================
function renderSocial() { renderFeedback(); renderPostsList(); renderCategoriesSection(); renderTinderSocial() }

function renderFeedback() {
  const map = { reprovado: 'reprovado', troca: 'troca', comentario: 'comentado', gravado: 'gravado', na: 'na' };
  Object.entries(map).forEach(([col, status]) => {
    const filtered = posts.filter(p => p.status === status);
    const countEl = document.getElementById('count-' + col);
    const listEl = document.getElementById('list-' + col);
    if (!countEl || !listEl) return;
    countEl.textContent = filtered.length; listEl.innerHTML = '';
    if (!filtered.length) { listEl.innerHTML = '<div style="text-align:center;padding:14px;font-size:11px;color:var(--text-3)">Nenhum item</div>'; return }
    filtered.forEach(post => {
      const cat = categories.find(c => c.id === post.catId) || { name: 'Geral', color: '#4d718f' };
      const item = document.createElement('div'); item.className = 'feedback-item';
      item.innerHTML = `
        <div class="fi-title">${escHtml(post.title)}</div>
        <div class="fi-cat" style="color:${cat.color}">${cat.name} · ${post.format} · ${post.dayOffset >= 0 ? DAYS_PT[post.dayOffset] : '—'}</div>
        ${post.desc ? `<div class="fi-desc">${escHtml(post.desc)}</div>` : ''}
        ${post.comment ? `<div class="fi-comment">"${escHtml(post.comment)}"</div>` : ''}
        <div class="fi-actions">
          <button class="fi-btn" onclick="openEditModal('${post.id}')">✏️ Editar</button>
          <button class="fi-btn restore" onclick="restorePost('${post.id}')">↩ Restaurar</button>
          <button class="fi-btn danger" onclick="deletePost('${post.id}')">✕ Excluir</button>
        </div>`;
      listEl.appendChild(item);
    });
  });
}

async function restorePost(id) {
  const post = posts.find(p => p.id === id); if (!post) return;
  post.status = 'pendente'; post.comment = '';
  if (post.dayOffset < 0) post.dayOffset = 0;
  await savePosts(post); renderSocial(); renderCalendar(); updateBadge(); updateMetrics();
  showToast('↩ Post restaurado ao calendário!');
}

function renderPostsList() {
  const list = document.getElementById('posts-list'); list.innerHTML = '';
  if (!posts.length) { list.innerHTML = '<div class="empty-state"><div class="es-icon">📋</div><div class="es-text">Nenhum post ainda</div></div>'; return }
  posts.forEach(post => {
    const cat = categories.find(c => c.id === post.catId) || { name: 'Geral', color: '#4d718f' };
    const row = document.createElement('div'); row.className = 'post-row';
    row.innerHTML = `
      <div class="post-row-cat" style="background:${cat.color}"></div>
      <div class="post-row-title">${escHtml(post.title)}</div>
      <div class="post-row-day">${post.dayOffset >= 0 ? DAYS_PT[post.dayOffset] : '—'}</div>
      <span class="post-row-format">${post.format}</span>
      <span class="post-row-status s-${post.status}">${statusLabel(post.status)}</span>
      <div class="post-row-actions">
        <button class="post-row-btn" onclick="openEditModal('${post.id}')">✏️ Editar</button>
        <button class="post-row-btn del" onclick="deletePost('${post.id}')">✕</button>
      </div>`;
    list.appendChild(row);
  });
}

function renderCategoriesSection() {
  const sec = document.getElementById('categories-section'); sec.innerHTML = '';
  if (!categories.length) { sec.innerHTML = '<div class="empty-state"><div class="es-icon">🏷️</div><div class="es-text">Nenhuma categoria</div></div>'; return }
  categories.forEach(cat => {
    const catPosts = posts.filter(p => p.catId === cat.id);
    const wrap = document.createElement('div'); wrap.className = 'cat-section';
    const postsHtml = !catPosts.length ?
      `<div class="cat-empty">Nenhum post nesta categoria</div>` :
      `<div class="cat-posts-list">${catPosts.map(p => `
        <div class="cat-post-row">
          <div class="cat-post-title">${escHtml(p.title)}</div>
          <span class="cat-post-format">${p.format}</span>
          <div class="cat-post-day">${p.dayOffset >= 0 ? DAYS_PT[p.dayOffset] : '—'}</div>
          <span class="cat-post-status s-${p.status}">${statusLabel(p.status)}</span>
          <button class="post-row-btn" style="height:22px;font-size:10px;padding:0 8px" onclick="openEditModal('${p.id}')">✏️</button>
          <button class="post-row-btn del" style="height:22px;font-size:10px;padding:0 8px" onclick="deletePost('${p.id}')">✕</button>
        </div>`).join('')}</div>`;
    wrap.innerHTML = `
      <div class="cat-section-header">
        <div class="cat-section-dot" style="background:${cat.color}"></div>
        <div class="cat-section-name">${escHtml(cat.name)}</div>
        <div class="cat-section-count">${catPosts.length} post${catPosts.length !== 1 ? 's' : ''}</div>
        <button class="cat-section-del" onclick="deleteCat('${cat.id}')">✕</button>
      </div>${postsHtml}`;
    sec.appendChild(wrap);
  });
}

function statusLabel(s) { return { pendente: 'Pendente', reprovado: 'Reprovado', troca: 'Troca', comentado: 'Comentado', gravado: 'Gravado', na: 'N/A' }[s] || s }
async function deletePost(id) { 
  if (!confirm('Remover este post?')) return; 
  posts = posts.filter(p => p.id !== id); 
  await deletePostDb(id); 
  renderSocial(); renderCalendar(); showToast('🗑️ Post excluído.') 
}
async function deleteCat(id) { 
  if (!confirm('Remover esta categoria?')) return; 
  categories = categories.filter(c => c.id !== id); 
  await deleteCatDb(id); 
  renderSocial() 
}

// ==================== EDIT MODAL ====================
function openEditModal(id) {
  editTarget = id;
  const post = posts.find(p => p.id === id); if (!post) return;
  document.getElementById('modal-title').textContent = '✏️ Editar Post';
  const catOpts = categories.map(c => `<option value="${c.id}"${c.id === post.catId ? ' selected' : ''}>${escHtml(c.name)}</option>`).join('');
  const dayOpts = DAYS_PT.map((d, i) => `<option value="${i}"${i === post.dayOffset ? ' selected' : ''}>${d}</option>`).join('');
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label class="form-label">Título</label><input class="form-input" id="e-title" value="${escHtml(post.title)}"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Categoria</label><select class="form-select" id="e-cat">${catOpts}</select></div>
      <div class="form-group"><label class="form-label">Formato</label><select class="form-select" id="e-format">${['Reels', 'Carrossel', 'Stories', 'Post Estático'].map(f => `<option${f === post.format ? ' selected' : ''}>${f}</option>`).join('')}</select></div>
    </div>
    <div class="form-group"><label class="form-label">Dia da semana</label>
      <select class="form-select" id="e-day">
        <option value="-1"${post.dayOffset < 0 ? ' selected' : ''}>Sem dia</option>${dayOpts}
      </select>
    </div>
    <div class="form-group"><label class="form-label">Descrição</label><textarea class="form-textarea" id="e-desc" rows="3">${escHtml(post.desc)}</textarea></div>
    <div class="form-actions"><button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveEdit()">Salvar</button></div>`;
  document.getElementById('modal-overlay').classList.add('open');
}
async function saveEdit() {
  const post = posts.find(p => p.id === editTarget); if (!post) return;
  const title = document.getElementById('e-title').value.trim(); if (!title) { alert('Informe o título.'); return }
  post.title = title; post.catId = document.getElementById('e-cat').value;
  post.format = document.getElementById('e-format').value;
  post.dayOffset = parseInt(document.getElementById('e-day').value);
  post.desc = document.getElementById('e-desc').value.trim();
  if (post.dayOffset >= 0) post.weekTs = weekStart.getTime();
  await savePosts(post); closeModal(); showToast('✅ Post atualizado!');
  renderCalendar(); if (currentPage === 'social') renderSocial();
}

// ==================== MODAL (new post/category/video) ====================
function openModal(type) {
  editTarget = null;
  document.getElementById('modal-overlay').classList.add('open');
  const titleEl = document.getElementById('modal-title'), body = document.getElementById('modal-body');

  if (type === 'post') {
    titleEl.textContent = 'Novo Post';
    const catOpts = categories.map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    const dayOpts = DAYS_PT.map((d, i) => `<option value="${i}">${d}</option>`).join('');
    body.innerHTML = `
      <div class="form-group"><label class="form-label">Título / Tema</label><input class="form-input" id="f-title" placeholder="Ex: 3 dicas para crescer no Instagram"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Categoria</label><select class="form-select" id="f-cat">${catOpts || '<option>—</option>'}</select></div>
        <div class="form-group"><label class="form-label">Formato</label><select class="form-select" id="f-format"><option>Reels</option><option>Carrossel</option><option>Stories</option><option>Post Estático</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">Dia da semana</label><select class="form-select" id="f-day"><option value="-1">Sem dia</option>${dayOpts}</select></div>
      <div class="form-group"><label class="form-label">Descrição / Orientações</label><textarea class="form-textarea" id="f-desc" rows="3" placeholder="Instruções para o expert..."></textarea></div>
      <div class="form-actions"><button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="submitPost()">Criar Post</button></div>`;
  }

  if (type === 'category') {
    titleEl.textContent = 'Nova Categoria';
    body.innerHTML = `
      <div class="form-group"><label class="form-label">Nome</label><input class="form-input" id="f-cat-name" placeholder="Ex: Educativo"></div>
      <div class="form-group"><label class="form-label">Cor</label><input type="color" id="f-cat-color" value="#2a7ed4" style="width:100%;height:40px;border:1px solid var(--border-md);border-radius:7px;cursor:pointer;background:var(--bg-raised);padding:2px 4px"></div>
      <div class="form-actions"><button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="submitCategory()">Criar</button></div>`;
  }

  if (type === 'video') {
    titleEl.textContent = 'Novo Vídeo para Edição';
    body.innerHTML = `
      <div class="form-group"><label class="form-label">Título do Vídeo</label><input class="form-input" id="v-title" placeholder="Ex: Depoimento cliente Maria"></div>
      <div class="form-group"><label class="form-label">Data prevista de entrega</label><input type="date" class="form-input" id="v-date"></div>
      <div class="form-group"><label class="form-label">Link do arquivo (Drive, Dropbox...)</label><input class="form-input" id="v-link" placeholder="https://..."></div>
      <div class="form-group"><label class="form-label">Considerações / Briefing</label><textarea class="form-textarea" id="v-notes" rows="3" placeholder="Observações para o editor..."></textarea></div>
      <div class="form-actions"><button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="submitVideo()">Criar</button></div>`;
  }
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); editTarget = null }

async function submitPost() {
  const title = document.getElementById('f-title').value.trim(); if (!title) { alert('Informe o título.'); return }
  const wts = weekStart.getTime();
  const newPost = { id: 'p' + Date.now(), title, catId: document.getElementById('f-cat').value, format: document.getElementById('f-format').value, dayOffset: parseInt(document.getElementById('f-day').value), desc: document.getElementById('f-desc').value.trim(), status: 'pendente', comment: '', weekTs: wts, tinderStatus: '' };
  posts.push(newPost);
  await savePosts(newPost); closeModal(); showToast('✅ Post criado!'); renderCalendar(); if (currentPage === 'social') renderSocial();
}
async function submitCategory() {
  const name = document.getElementById('f-cat-name').value.trim(); if (!name) { alert('Informe o nome.'); return }
  const newCat = { id: 'c' + Date.now(), name, color: document.getElementById('f-cat-color').value };
  categories.push(newCat);
  await saveCats(newCat); closeModal(); showToast('🏷️ Categoria criada!'); if (currentPage === 'social') renderSocial();
}
async function submitVideo() {
  const title = document.getElementById('v-title').value.trim(); if (!title) { alert('Informe o título.'); return }
  const newVid = { id: 'v' + Date.now(), title, date: document.getElementById('v-date').value, link: document.getElementById('v-link').value.trim(), notes: document.getElementById('v-notes').value.trim(), col: 0 };
  videos.push(newVid);
  await saveVideos(newVid); closeModal(); showToast('🎬 Vídeo adicionado!'); renderEditorBoard();
}

// ==================== EDITOR BOARD ====================
function renderEditorBoard() {
  const board = document.getElementById('editor-board'); board.innerHTML = '';
  EDITOR_COLS.forEach((colName, colIdx) => {
    const colVids = videos.filter(v => v.col === colIdx);
    const col = document.createElement('div'); col.className = 'editor-col';
    col.innerHTML = `<div class="editor-col-header ecol-${colIdx}">${colName} <span class="col-count">${colVids.length}</span></div><div class="editor-col-list" id="ecol-list-${colIdx}"></div>`;
    board.appendChild(col);
    const list = col.querySelector('.editor-col-list');
    if (!colVids.length) { list.innerHTML = '<div class="empty-day" style="margin:8px">Sem vídeos</div>'; return }
    colVids.forEach(v => {
      const card = document.createElement('div'); card.className = 'video-card';
      const prevBtn = colIdx > 0 ? `<button class="vc-move-btn" onclick="moveVideo('${v.id}',-1)">← Voltar</button>` : '';
      const nextBtn = colIdx < EDITOR_COLS.length - 1 ? `<button class="vc-move-btn" onclick="moveVideo('${v.id}',1)">Avançar →</button>` : '';
      card.innerHTML = `
        <div class="vc-title">${escHtml(v.title)}</div>
        ${v.date ? `<div class="vc-meta">📅 ${fmtDate(v.date)}</div>` : ''}
        ${v.link ? `<div class="vc-link">🔗 <a href="${escHtml(v.link)}" target="_blank" rel="noopener">${escHtml(v.link.replace(/^https?:\/\//, '').substring(0, 35))}${v.link.length > 35 ? '…' : ''}</a></div>` : ''}
        ${v.notes ? `<div class="vc-notes">${escHtml(v.notes)}</div>` : ''}
        <div class="vc-actions">
          ${prevBtn}${nextBtn}
          <button class="vc-btn" onclick="editVideo('${v.id}')">✏️</button>
          <button class="vc-btn" onclick="deleteVideo('${v.id}')" style="color:var(--red)">✕</button>
        </div>`;
      list.appendChild(card);
    });
  });
}

function fmtDate(str) { if (!str) return ''; const d = new Date(str + 'T12:00:00'); return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) }
async function moveVideo(id, dir) { 
  const v = videos.find(x => x.id === id); if (!v) return; 
  v.col = Math.max(0, Math.min(EDITOR_COLS.length - 1, v.col + dir)); 
  await saveVideos(v); renderEditorBoard() 
}
async function deleteVideo(id) { 
  if (!confirm('Remover este vídeo?')) return; 
  videos = videos.filter(v => v.id !== id); 
  await deleteVideoDb(id); renderEditorBoard() 
}

function editVideo(id) {
  editTarget = id;
  const v = videos.find(x => x.id === id); if (!v) return;
  document.getElementById('modal-title').textContent = '✏️ Editar Vídeo';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label class="form-label">Título</label><input class="form-input" id="ev-title" value="${escHtml(v.title)}"></div>
    <div class="form-group"><label class="form-label">Data prevista</label><input type="date" class="form-input" id="ev-date" value="${v.date || ''}"></div>
    <div class="form-group"><label class="form-label">Link</label><input class="form-input" id="ev-link" value="${escHtml(v.link || '')}"></div>
    <div class="form-group"><label class="form-label">Considerações</label><textarea class="form-textarea" id="ev-notes" rows="3">${escHtml(v.notes || '')}</textarea></div>
    <div class="form-group"><label class="form-label">Coluna</label><select class="form-select" id="ev-col">${EDITOR_COLS.map((c, i) => `<option value="${i}"${i === v.col ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="form-actions"><button class="btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn-primary" onclick="saveVideoEdit()">Salvar</button></div>`;
  document.getElementById('modal-overlay').classList.add('open');
}
async function saveVideoEdit() {
  const v = videos.find(x => x.id === editTarget); if (!v) return;
  const title = document.getElementById('ev-title').value.trim(); if (!title) { alert('Informe o título.'); return }
  v.title = title; v.date = document.getElementById('ev-date').value;
  v.link = document.getElementById('ev-link').value.trim(); v.notes = document.getElementById('ev-notes').value.trim();
  v.col = parseInt(document.getElementById('ev-col').value);
  await saveVideos(v); closeModal(); showToast('✅ Vídeo atualizado!'); renderEditorBoard();
}

// ==================== TABS ====================
function switchTab(tab, page) {
  const prefix = page === 'social' ? '' : tab + '_';
  document.querySelectorAll(`#page-${page} .tab-btn`).forEach((b, i) => {
    const tabs = page === 'social' ? ['feedback', 'posts', 'categories', 'tinder'] : [];
    b.classList.toggle('active', tabs[i] === tab);
  });
  document.querySelectorAll(`#page-${page} .tab-content`).forEach(c => {
    c.classList.toggle('active', c.id === 'tab-' + tab);
  });
  if (tab === 'tinder') renderTinderSocial();
}

// ==================== EXPIRED POSTS ====================
async function checkExpiredPosts() {
  const thisMonday = getMonday(new Date()); 
  let changedParams = [];
  posts.forEach(p => {
    if (p.status !== 'pendente' || p.dayOffset < 0) return;
    if (!p.weekTs) { p.weekTs = thisMonday.getTime(); changedParams.push(p); return }
    if (new Date(p.weekTs) < thisMonday) { p.status = 'na'; p.dayOffset = -3; changedParams.push(p) }
  });
  if (changedParams.length) await savePosts(changedParams);
}

// ==================== UTILS ====================
function escHtml(s = '') { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

// ==================== KEYBOARD ====================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeComment(); closeSwap(); closeTinder(); closeMobileMenu() }
});
window.addEventListener('resize', () => { if (currentPage === 'expert') renderCalendar() });

// ==================== INIT ====================
async function initApp() {
  categories = await loadCats();
  posts = await loadPosts();
  videos = await loadVideos();

  // If new DB, insert defaults
  if (posts.length === 0) {
    posts = defaultPosts();
    await savePosts(posts);
  }

  await checkExpiredPosts();
  renderCalendar();
  updateBadge();
  updateMetrics();
}
initApp();