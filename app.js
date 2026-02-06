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
    kitchen: { jp:'キッチン', en:'Kitchen', prefix:'Kitchen', icon:'🍳' },
    vanity: { jp:'洗面', en:'Vanity', prefix:'Vanity', icon:'🪥' },
    bath: { jp:'バスルーム', en:'Bath', prefix:'Bath', icon:'🛁' },
    toilet: { jp:'トイレ', en:'Toilet', prefix:'Toilet', icon:'🚽' },
    closet: { jp:'クローゼット', en:'Closet', prefix:'Closet', icon:'👕' },
    entrance: { jp:'玄関', en:'Entrance', prefix:'Entrance', icon:'🚪' },

    main12: { jp:'メインルーム（1・2）', en:'Main room (1–2)', prefix:'Main', icon:'🛏️' },
    main3: { jp:'メインルーム（3）', en:'Main room (3)', prefix:'Main', icon:'🛏️' },
    main4: { jp:'メインルーム（4）', en:'Main room (4)', prefix:'Main', icon:'🛏️' },
    main56: { jp:'メインルーム（5・6）', en:'Main room (5–6)', prefix:'Main', icon:'🛏️' },
    main7: { jp:'メインルーム（7）', en:'Main room (7)', prefix:'Main', icon:'🛏️' },
    main8: { jp:'メインルーム（8）', en:'Main room (8)', prefix:'Main', icon:'🛏️' },
    main9: { jp:'メインルーム（9）', en:'Main room (9)', prefix:'Main', icon:'🛏️' },
    main10:{ jp:'メインルーム（10）', en:'Main room (10)', prefix:'Main', icon:'🛏️' },
    main11:{ jp:'メインルーム（11）', en:'Main room (11)', prefix:'Main', icon:'🛏️' }
  };

  const MAIN_CATS_BY_ROOM = {
    rg12: ['main12'],
    rg3: ['main3'],
    rg4: ['main4'],
    rg56: ['main56'],
    rg78: ['main7', 'main8'],
    rg9_10_11: ['main9', 'main10', 'main11']
  };

  function $(id){ return document.getElementById(id); }
  function setText(id, t){ const el=$(id); if(el) el.textContent=t; }
  function setHref(id, h){ const el=$(id); if(el) el.setAttribute('href', h); }

  const page = document.documentElement.getAttribute('data-page');

  if(page === 'category'){
    const info = ROOM_LABELS[room] || ROOM_LABELS.rg12;
    setText('cat_title', `${info.jp}｜カテゴリ`);
    setText('cat_sub', 'Categories');

    // Back
    setHref('back_to_index', 'index.html');

    // Main-room links depending on room
    const mainWrap = document.getElementById('main_dynamic');
    if(mainWrap){
      const cats = MAIN_CATS_BY_ROOM[room] || [];
      mainWrap.innerHTML = cats.map((c)=> makeLink(CATEGORY_META[c].jp, CATEGORY_META[c].en, c, CATEGORY_META[c].icon)).join('');
    }

    // Common category links (always enabled)
    setHref('kitchen_link',  `swipe.html?room=${encodeURIComponent(room)}&cat=kitchen`);
    setHref('vanity_link',   `swipe.html?room=${encodeURIComponent(room)}&cat=vanity`);
    setHref('bath_link',     `swipe.html?room=${encodeURIComponent(room)}&cat=bath`);
    setHref('toilet_link',   `swipe.html?room=${encodeURIComponent(room)}&cat=toilet`);
    setHref('closet_link',   `swipe.html?room=${encodeURIComponent(room)}&cat=closet`);
    setHref('entrance_link', `swipe.html?room=${encodeURIComponent(room)}&cat=entrance`);

    function makeLink(jp,en,catName,icon){
      return `
      <a class="btn" href="swipe.html?room=${encodeURIComponent(room)}&cat=${encodeURIComponent(catName)}">
        <div class="cat"><div class="icon">${icon || '🛏️'}</div>
          <div><div class="jp">${jp}</div><div class="en">${en}</div></div>
        </div>
        <div class="chev">›</div>
      </a>`;
    }
  }

  if(page === 'swipe'){
    // Back
    setHref('back_to_category', `category.html?room=${encodeURIComponent(room)}`);

    // Title
    const meta = CATEGORY_META[cat] || CATEGORY_META.bath;
    setText('swipe_title', meta.jp);
    setText('swipe_sub', meta.en);

    // Strict room+cat availability (no accidental mixing)
    const allowed = new Set([
      ...Object.keys(CATEGORY_META).filter(k => !k.startsWith('main')),
      ...(MAIN_CATS_BY_ROOM[room] || [])
    ]);

    const scroller = document.querySelector('.scroller');
    if(scroller){
      if(!allowed.has(cat)){
        scroller.innerHTML = `<div class="slide"><div data-slide>未設定</div></div>`;
      }else{
        const slides = Array.from({length:4}, (_,i)=> `${meta.prefix} ${i+1}`);
        scroller.innerHTML = slides
          .map(label => `<div class="slide"><div data-slide>${label}</div></div>`)
          .join('');
      }

      // Counter
      function updateCounter(){
        const counterEl = document.getElementById('counter');
        if(!counterEl) return;
        const w = scroller.clientWidth || 1;
        const idx = Math.round(scroller.scrollLeft / w) + 1;
        const total = scroller.children.length;
        counterEl.textContent = `${idx}/${total}`;
      }

      let raf=0;
      scroller.addEventListener('scroll', ()=>{
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(updateCounter);
      }, {passive:true});
      updateCounter();
    }
  }
})();
// ===== Index-only enhancements: classic bold digits + strong tap linger =====
if(page === 'index'){
  // Wrap only numeric tokens in room title with .antique-num
  applyClassicNumbersIndex();

  // Strong tap feedback with short delayed navigation so effect is visible
  bindStrongTapFeedbackIndex();
}

function applyClassicNumbersIndex(){
  const targets = document.querySelectorAll('.roomTop .jp');
  targets.forEach(el=>{
    if(!el || el.querySelector('.antique-num')) return; // prevent double wrap
    const html = el.innerHTML;
    el.innerHTML = html.replace(/(\d+)/g, '<span class="antique-num">$1</span>');
  });
}

function bindStrongTapFeedbackIndex(){
  const links = document.querySelectorAll('a.btn.roomBtn');
  links.forEach(a=>{
    a.addEventListener('contextmenu', (e)=> e.preventDefault());
    a.addEventListener('click', (e)=>{
      if(a.dataset.navLock === '1') return;
      e.preventDefault();
      a.dataset.navLock = '1';
      a.classList.add('is-pressing');
      try{ if(navigator.vibrate) navigator.vibrate(12); }catch(_){}
      const target = a.getAttribute('href') || 'category.html';
      setTimeout(()=>{
        location.href = target;
      }, 160);
    });
  });
}
