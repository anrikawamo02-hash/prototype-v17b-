(function(){
  const params = new URLSearchParams(location.search);
  const room = params.get('room') || 'rg12';
  const cat  = params.get('cat') || 'bath';

  const ROOM_LABELS = {
    rg12: {jp:'1・2号室', en:'Rooms 1–2 (Floors 5–2)', tag:'5–2F'},
    rg3: {jp:'3号室', en:'Room 3 (Floors 5–2)', tag:'5–2F'},
    rg4: {jp:'4号室', en:'Room 4 (Floors 5–2)', tag:'5–2F'},
    rg56:{jp:'5・6号室', en:'Rooms 5–6 (Floors 5–2)', tag:'5–2F'},
    rg78:{jp:'7・8号室', en:'Rooms 7–8 (Floors 5–2)', tag:'5–2F'},
    rg9_10_11:{jp:'9・10・11号室', en:'Rooms 9–11 (Floors 3–2)', tag:'3–2F'}
  };

  const CATEGORY_META = {
    kitchen:  { jp:'キッチン',    en:'Kitchen',  icon:'🍳', prefix:'Kitchen' },
    vanity:   { jp:'洗面',        en:'Vanity',   icon:'🪥', prefix:'Vanity' },
    bath:     { jp:'バスルーム',  en:'Bath',     icon:'🛁', prefix:'Bath' },
    toilet:   { jp:'トイレ',      en:'Toilet',   icon:'🚽', prefix:'Toilet' },
    closet:   { jp:'クローゼット',en:'Closet',   icon:'👕', prefix:'Closet' },
    entrance: { jp:'玄関',        en:'Entrance', icon:'🚪', prefix:'Entrance' }
  };

  // Main category policy by room-group (strict separation)
  const MAIN_CATS_BY_ROOM = {
    rg12: [{ key:'main',  jp:'メインルーム（1・2共通）', en:'Main room (1–2 shared)', prefix:'Main 1–2' }],
    rg3:  [{ key:'main',  jp:'メインルーム（3）',       en:'Main room (3)',          prefix:'Main 3' }],
    rg4:  [{ key:'main',  jp:'メインルーム（4）',       en:'Main room (4)',          prefix:'Main 4' }],
    rg56: [{ key:'main',  jp:'メインルーム（5・6共通）', en:'Main room (5–6 shared)', prefix:'Main 5–6' }],
    rg78: [
      { key:'main7', jp:'メインルーム（7）', en:'Main room (7)',  prefix:'Main 7' },
      { key:'main8', jp:'メインルーム（8）', en:'Main room (8)',  prefix:'Main 8' }
    ],
    rg9_10_11: [
      { key:'main9',  jp:'メインルーム（9）',  en:'Main room (9)',  prefix:'Main 9' },
      { key:'main10', jp:'メインルーム（10）', en:'Main room (10)', prefix:'Main 10' },
      { key:'main11', jp:'メインルーム（11）', en:'Main room (11)', prefix:'Main 11' }
    ]
  };

  function makeSlides(label, count){
    return Array.from({length: count}, (_, i) => ({
      label: `${label} ${i+1}`,
      image: null
    }));
  }

  function createRoomDb(roomKey){
    const roomLabel = (ROOM_LABELS[roomKey] || ROOM_LABELS.rg12).jp;
    const db = {};

    // main categories (room specific)
    (MAIN_CATS_BY_ROOM[roomKey] || []).forEach(m => {
      db[m.key] = makeSlides(`${m.jp}｜${roomLabel}`, 4);
    });

    // common categories (still strict per room key)
    Object.entries(CATEGORY_META).forEach(([key, meta]) => {
      db[key] = makeSlides(`${meta.jp}｜${roomLabel}`, 4);
    });

    return db;
  }

  // strict: room + cat exact match only (no fallback)
  const SLIDE_DB = {
    rg12: createRoomDb('rg12'),
    rg3: createRoomDb('rg3'),
    rg4: createRoomDb('rg4'),
    rg56: createRoomDb('rg56'),
    rg78: createRoomDb('rg78'),
    rg9_10_11: createRoomDb('rg9_10_11')
  };

  function $(id){ return document.getElementById(id); }
  function setText(id, t){ const el=$(id); if(el) el.textContent=t; }
  function setHref(id, h){ const el=$(id); if(el) el.setAttribute('href', h); }

  const page = document.documentElement.getAttribute('data-page');

  if(page === 'category'){
    const info = ROOM_LABELS[room] || ROOM_LABELS.rg12;
    setText('cat_title', `${info.jp}｜カテゴリ`);
    setText('cat_sub', 'Categories');
    setHref('back_to_index', 'index.html');

    const list = document.getElementById('category_list');
    if(list){
      const nodes = [];

      // main first
      (MAIN_CATS_BY_ROOM[room] || []).forEach(m => {
        nodes.push(makeLinkCard(m.jp, m.en, '🛏️', m.key));
      });

      // all other categories (enabled)
      Object.entries(CATEGORY_META).forEach(([key, meta]) => {
        nodes.push(makeLinkCard(meta.jp, meta.en, meta.icon, key));
      });

      list.innerHTML = nodes.join('');
    }

    function makeLinkCard(jp, en, icon, catKey){
      return `\n      <a class="btn" href="swipe.html?room=${encodeURIComponent(room)}&cat=${encodeURIComponent(catKey)}">\n        <div class="cat">\n          <div class="icon">${icon}</div>\n          <div><div class="jp">${jp}</div><div class="en">${en}</div></div>\n        </div>\n        <div class="chev">›</div>\n      </a>`;
    }
  }

  if(page === 'swipe'){
    setHref('back_to_category', `category.html?room=${encodeURIComponent(room)}`);

    const dynamicTitleMap = {};
    (MAIN_CATS_BY_ROOM[room] || []).forEach(m => {
      dynamicTitleMap[m.key] = { jp: m.jp, en: 'Swipe', prefix: m.prefix };
    });
    Object.entries(CATEGORY_META).forEach(([key, meta]) => {
      dynamicTitleMap[key] = { jp: meta.jp, en:'Swipe', prefix: meta.prefix };
    });

    const fallback = dynamicTitleMap.bath || {jp:'バスルーム', en:'Swipe', prefix:'Bath'};
    const meta = dynamicTitleMap[cat] || fallback;

    setText('swipe_title', meta.jp);
    setText('swipe_sub', meta.en);

    const scroller = document.querySelector('.scroller');
    const counterEl = document.getElementById('counter');

    const roomDb = SLIDE_DB[room] || null;
    const slidesData = roomDb && roomDb[cat] ? roomDb[cat] : null;

    if(scroller){
      scroller.innerHTML = '';
      const resolvedSlides = Array.isArray(slidesData) && slidesData.length > 0
        ? slidesData
        : [{ label: `${meta.jp}｜未設定`, image: null }];

      resolvedSlides.forEach((item, i) => {
        const slide = document.createElement('div');
        slide.className = 'slide';

        const box = document.createElement('div');
        box.setAttribute('data-slide', '');
        box.textContent = item.label || `${meta.prefix} ${i+1}`;

        slide.appendChild(box);
        scroller.appendChild(slide);
      });

      function updateCounter(){
        if(!counterEl) return;
        const total = scroller.children.length || 1;
        const w = scroller.clientWidth || 1;
        const idx = Math.round(scroller.scrollLeft / w) + 1;
        counterEl.textContent = `${idx}/${total}`;
      }

      let raf = 0;
      scroller.addEventListener('scroll', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateCounter);
      }, { passive: true });

      updateCounter();
    }
  }
})();
