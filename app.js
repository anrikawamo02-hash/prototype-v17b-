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

  function $(id){ return document.getElementById(id); }
  function setText(id, t){ const el=$(id); if(el) el.textContent=t; }
  function setHref(id, h){ const el=$(id); if(el) el.setAttribute('href', h); }

  const page = document.documentElement.getAttribute('data-page');

  // ===== Digits only -> classic font =====
  function wrapDigitsInElement(el){
    if(!el) return;
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node){
          if(!node.nodeValue || !/[0-9]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
          const parent = node.parentElement;
          if(!parent) return NodeFilter.FILTER_REJECT;
          if(parent.closest('.antique-num')) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    while(walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((node)=>{
      const t = node.nodeValue;
      const re = /[0-9]+/g;
      if(!re.test(t)) return;
      re.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let last = 0;
      let m;
      while((m = re.exec(t)) !== null){
        const i = m.index;
        if(i > last) frag.appendChild(document.createTextNode(t.slice(last, i)));
        const span = document.createElement('span');
        span.className = 'antique-num';
        span.textContent = m[0];
        frag.appendChild(span);
        last = i + m[0].length;
      }
      if(last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  function applyClassicDigits(root=document){
    const selectors = [
      '.roomTop .jp',
      '.roomTag',
      '.roomMid .en',
      '#cat_title',
      '#swipe_title',
      '[data-slide]',
      '.counter'
    ];
    root.querySelectorAll(selectors.join(',')).forEach(wrapDigitsInElement);
  }

  if(page === 'index'){
    // Strong press feel + slight navigation delay so the effect is visible.
    const roomBtns = document.querySelectorAll('a.btn.roomBtn');
    roomBtns.forEach((btn)=>{
      const addPress = ()=> btn.classList.add('is-pressing');
      const clearPress = ()=> btn.classList.remove('is-pressing');

      btn.addEventListener('pointerdown', addPress, {passive:true});
      btn.addEventListener('pointerup', clearPress, {passive:true});
      btn.addEventListener('pointercancel', clearPress, {passive:true});
      btn.addEventListener('pointerleave', clearPress, {passive:true});

      // Fallback for older iOS behaviors
      btn.addEventListener('touchstart', addPress, {passive:true});
      btn.addEventListener('touchend', clearPress, {passive:true});
      btn.addEventListener('touchcancel', clearPress, {passive:true});

      btn.addEventListener('click', (e)=>{
        if(btn.dataset.navLock === '1') return;
        e.preventDefault();
        btn.dataset.navLock = '1';
        addPress();

        try{ if(navigator.vibrate) navigator.vibrate(12); }catch(_){ }

        setTimeout(()=>{ location.href = btn.href; }, 150);
        // Fallback unlock in case navigation is blocked
        setTimeout(()=>{
          btn.dataset.navLock = '0';
          clearPress();
        }, 900);
      });
    });

    applyClassicDigits(document);
  }

  if(page === 'category'){
    const info = ROOM_LABELS[room] || ROOM_LABELS.rg12;
    setText('cat_title', `${info.jp}｜カテゴリ`);
    setText('cat_sub', 'Categories');

    // Back
    setHref('back_to_index', 'index.html');

    // Fill main-room items depending on room
    const mainWrap = document.getElementById('main_dynamic');
    if(mainWrap){
      let html = '';
      if(room === 'rg78'){
        html += makeLink('メインルーム（7）','Main room (7)','main7');
        html += makeLink('メインルーム（8）','Main room (8)','main8');
      }else if(room === 'rg9_10_11'){
        html += makeLink('メインルーム（9）','Main room (9)','main9');
        html += makeLink('メインルーム（10）','Main room (10)','main10');
        html += makeLink('メインルーム（11）','Main room (11)','main11');
      }else{
        html += makeDisabled('メインルーム','Main room');
      }
      mainWrap.innerHTML = html;
    }

    // Bath link always active
    const bathA = document.getElementById('bath_link');
    if(bathA){
      bathA.href = `swipe.html?room=${encodeURIComponent(room)}&cat=bath`;
    }

    function makeLink(jp,en,catName){
      return `
      <a class="btn" href="swipe.html?room=${encodeURIComponent(room)}&cat=${encodeURIComponent(catName)}">
        <div class="cat"><div class="icon">🛏️</div>
          <div><div class="jp">${jp}</div><div class="en">${en}</div></div>
        </div>
        <div class="chev">›</div>
      </a>`;
    }
    function makeDisabled(jp,en){
      return `
      <div class="btn" style="opacity:.7;">
        <div class="cat"><div class="icon">🛏️</div>
          <div><div class="jp">${jp}</div><div class="en">${en}</div></div>
        </div>
        <span class="badge">準備中</span>
      </div>`;
    }

    applyClassicDigits(document);
  }

  if(page === 'swipe'){
    // Back
    setHref('back_to_category', `category.html?room=${encodeURIComponent(room)}`);

    // Title
    const titleMap = {
      bath: {jp:'バスルーム', en:'Swipe', prefix:'Bath'},
      main7:{jp:'メインルーム（7）', en:'Swipe', prefix:'Main'},
      main8:{jp:'メインルーム（8）', en:'Swipe', prefix:'Main'},
      main9:{jp:'メインルーム（9）', en:'Swipe', prefix:'Main'},
      main10:{jp:'メインルーム（10）', en:'Swipe', prefix:'Main'},
      main11:{jp:'メインルーム（11）', en:'Swipe', prefix:'Main'}
    };
    const meta = titleMap[cat] || titleMap.bath;
    setText('swipe_title', meta.jp);
    setText('swipe_sub', meta.en);

    // Update labels inside slides (optional)
    document.querySelectorAll('[data-slide]').forEach((el, i)=>{
      el.textContent = `${meta.prefix} ${i+1}`;
    });

    // Counter
    function updateCounter(scroller){
      const counterEl = document.getElementById('counter');
      if(!counterEl) return;
      const w = scroller.clientWidth || 1;
      const idx = Math.round(scroller.scrollLeft / w) + 1;
      const total = scroller.children.length;
      counterEl.textContent = idx + '/' + total;
      wrapDigitsInElement(counterEl);
    }
    const scroller = document.querySelector('.scroller');
    if(scroller){
      let raf=0;
      scroller.addEventListener('scroll', ()=>{
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(()=>updateCounter(scroller));
      }, {passive:true});
      // init
      updateCounter(scroller);
    }

    applyClassicDigits(document);
  }
})();
