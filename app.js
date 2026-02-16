(() => {
  'use strict';

  const page = document.documentElement.getAttribute('data-page');
  const params = new URLSearchParams(location.search);
  const room = params.get('room') || 'rg12';
  const cat = params.get('cat') || 'bath';

  const BASE_CATS = ['kitchen', 'vanity', 'bath', 'toilet', 'closet', 'entrance'];

  const ROOM_LABELS = {
    rg12: { jp: '1・2号室', en: 'Rooms 1–2 (Floors 5–2)' },
    rg3: { jp: '3号室', en: 'Room 3 (Floors 5–2)' },
    rg4: { jp: '4号室', en: 'Room 4 (Floors 5–2)' },
    rg56: { jp: '5・6号室', en: 'Rooms 5–6 (Floors 5–2)' },
    rg78: { jp: '7・8号室', en: 'Rooms 7–8 (Floors 5–2)' },
    rg9_10_54: { jp: '9・10号室', en: 'Rooms 9–10 (Floors 5–4)' },
    rg9_10_11: { jp: '9・10・11号室', en: 'Rooms 9–11 (Floors 3–2)' }
  };

  const SAME_TYPE_NOTE_JP = '🌟同タイプのお部屋は1つにまとめています';
  const SAME_TYPE_NOTE_EN = '🌟Rooms of the same type are grouped into one listing.';

  const CATEGORY_META = {
    kitchen: { jp: 'キッチン', en: 'Kitchen', prefix: 'Kitchen', icon: '🍳' },
    vanity: { jp: '洗面', en: 'Vanity', prefix: 'Vanity', icon: '🪥' },
    bath: { jp: 'バスルーム', en: 'Bath', prefix: 'Bath', icon: '🛁' },
    toilet: { jp: 'トイレ', en: 'Toilet', prefix: 'Toilet', icon: '🚽' },
    closet: { jp: 'クローゼット', en: 'Closet', prefix: 'Closet', icon: '👕' },
    entrance: { jp: '玄関', en: 'Entrance', prefix: 'Entrance', icon: '🚪' },

    // Grouped rooms: no number in label + note lines
    main12: {
      jp: 'メインルーム',
      en: 'Main room',
      noteJp: SAME_TYPE_NOTE_JP,
      noteEn: SAME_TYPE_NOTE_EN,
      prefix: 'Main',
      icon: '🛏️'
    },
    main3: {
      jp: 'メインルーム',
      en: 'Main room',
      noteJp: SAME_TYPE_NOTE_JP,
      noteEn: SAME_TYPE_NOTE_EN,
      prefix: 'Main',
      icon: '🛏️'
    },
    main4: {
      jp: 'メインルーム',
      en: 'Main room',
      noteJp: SAME_TYPE_NOTE_JP,
      noteEn: SAME_TYPE_NOTE_EN,
      prefix: 'Main',
      icon: '🛏️'
    },
    main56: {
      jp: 'メインルーム',
      en: 'Main room',
      noteJp: SAME_TYPE_NOTE_JP,
      noteEn: SAME_TYPE_NOTE_EN,
      prefix: 'Main',
      icon: '🛏️'
    },

    // Keep numbers in label
    main7: { jp: 'メインルーム（7）', en: 'Main room (7)', prefix: 'Main', icon: '🛏️' },
    main8: { jp: 'メインルーム（8）', en: 'Main room (8)', prefix: 'Main', icon: '🛏️' },
    main9: { jp: 'メインルーム（9）', en: 'Main room (9)', prefix: 'Main', icon: '🛏️' },
    main10: { jp: 'メインルーム（10）', en: 'Main room (10)', prefix: 'Main', icon: '🛏️' },
    main9_54: { jp: 'メインルーム（9）', en: 'Main room (9)', prefix: 'Main', icon: '🛏️' },
    main10_54: { jp: 'メインルーム（10）', en: 'Main room (10)', prefix: 'Main', icon: '🛏️' },
    main9_10_54: {
      jp: 'メインルーム',
      en: 'Main room',
      noteJp: SAME_TYPE_NOTE_JP,
      noteEn: SAME_TYPE_NOTE_EN,
      prefix: 'Main',
      icon: '🛏️'
    },
    main11: { jp: 'メインルーム（11）', en: 'Main room (11)', prefix: 'Main', icon: '🛏️' }
  };

  const MAIN_CATS_BY_ROOM = {
    rg12: ['main12'],
    rg3: ['main3'],
    rg4: ['main4'],
    rg56: ['main56'],
    rg78: ['main7', 'main8'],
    rg9_10_54: ['main9_10_54'],
    rg9_10_11: ['main9', 'main10', 'main11']
  };

  const byId = (id) => document.getElementById(id);

  const setText = (id, text) => {
    const el = byId(id);
    if (el) el.textContent = text;
  };

  const setHref = (id, href) => {
    const el = byId(id);
    if (el) el.setAttribute('href', href);
  };

  function buildCategoryLink({ roomKey, catKey, jp, en, icon, noteJp, noteEn }) {
    const noteHtml = (noteJp || noteEn)
      ? `<div class="group-note-jp">${noteJp || ''}</div><div class="group-note-en">${noteEn || ''}</div>`
      : '';

    return `
      <a class="btn" href="swipe.html?room=${encodeURIComponent(roomKey)}&cat=${encodeURIComponent(catKey)}">
        <div class="cat">
          <div class="icon">${icon || '🛏️'}</div>
          <div>
            <div class="jp">${jp}</div>
            <div class="en">${en}</div>
            ${noteHtml}
          </div>
        </div>
        <div class="chev">›</div>
      </a>`;
  }

  function initCategoryPage() {
    const info = ROOM_LABELS[room] || ROOM_LABELS.rg12;
    setText('cat_title', `${info.jp}｜カテゴリ`);
    setText('cat_sub', 'Categories');
    setHref('back_to_index', 'index.html');

    const mainWrap = byId('main_dynamic');
    if (mainWrap) {
      const mainCats = MAIN_CATS_BY_ROOM[room] || [];
      const html = [];

      mainCats.forEach((catKey) => {
        const m = CATEGORY_META[catKey];
        if (!m) return;
        html.push(
          buildCategoryLink({
            roomKey: room,
            catKey,
            jp: m.jp,
            en: m.en,
            icon: m.icon,
            noteJp: m.noteJp,
            noteEn: m.noteEn
          })
        );
      });

      mainWrap.innerHTML = html.join('');
    }

    BASE_CATS.forEach((key) => {
      setHref(`${key}_link`, `swipe.html?room=${encodeURIComponent(room)}&cat=${key}`);
    });
  }

  function initSwipePage(){
  const scroller = $('#scroller');
  const counterEl = $('#counter');
  if(!scroller || !counterEl) return;

  // --- hard rules ---
  const TOTAL = 10;              // 10枚固定
  const ASSET_VER = '20260217';  // キャッシュバスター固定（必要なら数字だけ変えてOK）

  // query params
  const p = new URLSearchParams(location.search);
  const room = (p.get('room') || 'rg56').trim();
  const cat  = (p.get('cat')  || 'main56').trim();

  const pad2 = (n)=> String(n).padStart(2,'0');
  const withVer = (src)=> src + (src.includes('?') ? '&' : '?') + 'v=' + ASSET_VER;

  // 複数パターンで画像パスを試す（存在しない場合は onerror で次へ）
  function candidateSrcs(i){
    const nn = pad2(i);
    return [
      `photos/${room}/${cat}/${nn}.png`,
      `photos/${room}/${cat}/${nn}.jpg`,
      `photos/${room}_${cat}_${nn}.png`,
      `photos/${room}_${cat}_${nn}.jpg`,
      `photos/${room}${cat}_${nn}.png`,
      `photos/${room}${cat}_${nn}.jpg`,
      `photos/${cat}/${nn}.png`,
      `photos/${cat}/${nn}.jpg`,
      `photos/${nn}.png`,
      `photos/${nn}.jpg`,
    ].map(withVer);
  }

  // --- DOMを完全初期化 ---
  scroller.onscroll = null;
  scroller.innerHTML = '';

  const frag = document.createDocumentFragment();
  for(let i=1;i<=TOTAL;i++){
    const slide = document.createElement('div');
    slide.className = 'slide';

    const img = document.createElement('img');
    img.alt = `${room}-${cat}-${i}`;

    const cands = candidateSrcs(i);
    let k = 0;
    img.src = cands[k];

    img.onerror = ()=>{
      k++;
      if(k < cands.length){
        img.src = cands[k];
      }else{
        // 最後までダメなら表示だけは残す
        img.onerror = null;
        img.src = withVer('crab_sample.png');
      }
    };

    slide.appendChild(img);
    frag.appendChild(slide);
  }
  scroller.appendChild(frag);

  // --- index=0 強制（1枚目から）---
  scroller.scrollLeft = 0;

  const setCounter = (idx0)=>{
    const safe = Math.max(0, Math.min(TOTAL-1, idx0));
    counterEl.textContent = `${safe+1}/${TOTAL}`;
  };
  setCounter(0);

  // --- 正しいスライド幅で index 計算（38/10 みたいな暴走を防ぐ）---
  const getSlideWidth = ()=>{
    const first = scroller.querySelector('.slide');
    return (first && first.getBoundingClientRect().width) ? first.getBoundingClientRect().width : scroller.getBoundingClientRect().width;
  };

  let raf = 0;
  scroller.addEventListener('scroll', ()=>{
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      const w = getSlideWidth();
      if(!w) return;
      const idx = Math.round(scroller.scrollLeft / w);
      setCounter(idx);
    });
  }, {passive:true});

  // iOSの復元スクロール対策：ロード後にもう一回 0 に戻す
  requestAnimationFrame(()=>{
    scroller.scrollLeft = 0;
    setCounter(0);
  });
}


  function applyClassicNumbersIndex() {
    document.querySelectorAll('.roomTop .jp').forEach((el) => {
      if (el.querySelector('.antique-num')) return;
      el.innerHTML = el.innerHTML.replace(/(\d+)/g, '<span class="antique-num">$1</span>');
    });
  }

  function bindStrongTapFeedback(selector) {
    document.querySelectorAll(selector).forEach((link) => {
      link.addEventListener('contextmenu', (e) => e.preventDefault());

      // Keep press state during long press.
      link.addEventListener('pointerdown', () => link.classList.add('is-pressing'));
      ['pointerup', 'pointercancel', 'pointerleave'].forEach((evt) => {
        link.addEventListener(evt, () => link.classList.remove('is-pressing'));
      });

      link.addEventListener('click', (e) => {
        if (link.dataset.navLock === '1') return;
        e.preventDefault();
        link.dataset.navLock = '1';
        link.classList.add('is-pressing');

        try {
          if (navigator.vibrate) navigator.vibrate(12);
        } catch (_) {
          // no-op
        }

        const href = link.getAttribute('href') || 'index.html';
        setTimeout(() => {
          location.href = href;
        }, 160);
      });
    });
  }

  if (page === 'category') {
    initCategoryPage();
    bindStrongTapFeedback('.list a.btn');
  }
  if (page === 'swipe') initSwipePage();
  if (page === 'index') {
    applyClassicNumbersIndex();
    bindStrongTapFeedback('a.btn.roomBtn');
  }
})();
