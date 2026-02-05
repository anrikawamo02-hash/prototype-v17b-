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

  // メインは部屋グループごとに厳密分離（混在防止）
  const MAIN_CATS_BY_ROOM = {
    rg12: [
      { key:'main',  jp:'メインルーム（1・2共通）', en:'Main room (1–2 shared)', prefix:'Main 1–2' }
    ],
    rg3: [
      { key:'main',  jp:'メインルーム（3）', en:'Main room (3)', prefix:'Main 3' }
    ],
    rg4: [
      { key:'main',  jp:'メインルーム（4）', en:'Main room (4)', prefix:'Main 4' }
    ],
    rg56: [
      { key:'main',  jp:'メインルーム（5・6共通）', en:'Main room (5–6 shared)', prefix:'Main 5–6' }
    ],
    rg78: [
      { key:'main7', jp:'メインルーム（7）', en:'Main room (7)', prefix:'Main 7' },
      { key:'main8', jp:'メインルーム（8）', en:'Main room (8)', prefix:'Main 8' }
    ],
    rg9_10_11: [
      { key:'main9',  jp:'メインルーム（9）',  en:'Main room (9)',  prefix:'Main 9' },
      { key:'main10', jp:'メインルーム（10）', en:'Main room (10)', prefix:'Main 10' },
      { key:'main11', jp:'メインルーム（11）', en:'Main room (11)', prefix:'Main 11' }
    ]
  };

  // 画像差し替え用DB（room + cat 完全一致のみ使用。フォールバック禁止）
  // image にパスを入れれば写真表示、nullならプレースホルダー。
  function makeSlides(label, count){
    return Array.from({length: count}, (_, i) => ({
      label: `${label} ${i+1}`,
      image: null
    }));
  }

  function createRoomDb(roomKey){
    const roomLabel = (ROOM_LABELS[roomKey] || ROOM_LABELS.rg12).jp;
    const db = {};

    // main (roomごとの定義)
    const mains = MAIN_CATS_BY_ROOM[roomKey] || [];
    mains.forEach(m => {
      db[m.key] = makeSlides(`${m.jp}｜${roomLabel}`, 4);
    });

    // そのほかカテゴリ（roomごとに個別キー保持）
    Object.entries(CATEGORY_META).forEach(([key, meta]) => {
      db[key] = makeSlides(`${meta.jp}｜${roomLabel}`, 4);
    });

    return db;
  }

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

      // メインカテゴリ（roomごと）
      const mains = MAIN_CATS_BY_ROOM[room] || [];
      mains.forEach(m => {
        nodes.push(makeLinkCard(m.jp, m.en, '🛏️', m.key));
      });

      // 全カテゴリ（常に有効）
      Object.entries(CATEGORY_META).forEach(([key, meta]) => {
        nodes.push(makeLinkCard(meta.jp, meta.en, meta.icon, key));
      });

      list.innerHTML = nodes.join('');
    }

    function makeLinkCard(jp, en, icon, catKey){
      return `
      <a class="btn" href="swipe.html?room=${encodeURIComponent(room)}&cat=${encodeURIComponent(catKey)}">
        <div class="cat">
          <div class="icon">${icon}</div>
          <div><div class="jp">${jp}</div><div class="en">${en}</div></div>
        </div>
        <div class="chev">›</div>
      </a>`;
    }
  }

  if(page === 'swipe'){
    setHref('back_to_category', `category.html?room=${encodeURIComponent(room)}`);

    // タイトル定義（roomに応じてmain表記を変える）
    const dynamicTitleMap = {};

    (MAIN_CATS_BY_ROOM[room] || []).forEach(m => {
      dynamicTitleMap[m.key] = { jp: m.jp, en: 'Swipe', prefix: m.prefix };
    });

    Object.entries(CATEGORY_META).forEach(([key, meta]) => {
      dynamicTitleMap[key] = { jp: meta.jp, en:'Swipe', prefix: meta.prefix };
    });

    const defaultMeta = dynamicTitleMap.bath || {jp:'バスルーム', en:'Swipe', prefix:'Bath'};
    const meta = dynamicTitleMap[cat] || defaultMeta;

    setText('swipe_title', meta.jp);
    setText('swipe_sub', meta.en);

    const scroller = document.querySelector('.scroller');
    const counterEl = document.getElementById('counter');
    const backBtn = document.getElementById('back_to_category');

    // === 混在防止の要点 ===
    // room+cat 完全一致のみ。見つからない場合は未設定表示（他データ流用なし）
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

        const content = document.createElement('div');
        content.className = 'slideContent';

        if(item.image){
          const img = document.createElement('img');
          img.className = 'slideImage';
          img.loading = i === 0 ? 'eager' : 'lazy';
          img.decoding = 'async';
          img.alt = item.label || `${meta.prefix} ${i+1}`;
          img.src = item.image;

          img.onerror = () => {
            content.innerHTML = `<div class="slidePlaceholder" data-slide>${escapeHtml(item.label || `${meta.prefix} ${i+1}`)}</div>`;
          };

          const cap = document.createElement('div');
          cap.className = 'slideCaption';
          cap.textContent = item.label || `${meta.prefix} ${i+1}`;

          content.appendChild(img);
          content.appendChild(cap);
        } else {
          const ph = document.createElement('div');
          ph.className = 'slidePlaceholder';
          ph.setAttribute('data-slide', '');
          ph.textContent = item.label || `${meta.prefix} ${i+1}`;
          content.appendChild(ph);
        }

        slide.appendChild(content);
        scroller.appendChild(slide);
      });

      // スワイプ必須: 最終スライド到達まで戻るをブロック
      let completed = false;

      function updateCounterAndLock(){
        if(!counterEl) return;
        const total = scroller.children.length || 1;
        const w = scroller.clientWidth || 1;
        const idx = Math.round(scroller.scrollLeft / w) + 1;

        completed = idx >= total;

        counterEl.textContent = completed ? `${idx}/${total}` : `${idx}/${total} 🔒`;
        counterEl.classList.toggle('locked', !completed);
      }

      if(backBtn){
        backBtn.addEventListener('click', (e) => {
          if(completed) return;
          e.preventDefault();

          const old = counterEl ? counterEl.textContent : '';
          if(counterEl){
            counterEl.textContent = '最後までスワイプしてください';
            counterEl.classList.add('locked');
          }
          setTimeout(() => {
            if(counterEl){
              counterEl.textContent = old || '1/1 🔒';
              counterEl.classList.add('locked');
            }
          }, 900);
        });
      }

      let raf = 0;
      scroller.addEventListener('scroll', () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateCounterAndLock);
      }, { passive: true });

      updateCounterAndLock();
    }
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
})();
