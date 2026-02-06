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
        html += makeLink('メインルーム（7）','Main Room (7)','main7');
        html += makeLink('メインルーム（8）','Main Room (8)','main8');
      }else if(room === 'rg9_10_11'){
        html += makeLink('メインルーム（9）','Main Room (9)','main9');
        html += makeLink('メインルーム（10）','Main Room (10)','main10');
        html += makeLink('メインルーム（11）','Main Room (11)','main11');
      }else if(room === 'rg3'){
        html += makeGroupedLink('メインルーム','Main Room','main3');
      }else if(room === 'rg4'){
        html += makeGroupedLink('メインルーム','Main Room','main4');
      }else if(room === 'rg56'){
        html += makeGroupedLink('メインルーム','Main Room','main56');
      }else{
        // rg12 and fallback
        html += makeGroupedLink('メインルーム','Main Room','main12');
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

    function makeGroupedLink(jp,en,catName){
      return `
      <a class="btn" href="swipe.html?room=${encodeURIComponent(room)}&cat=${encodeURIComponent(catName)}">
        <div class="cat"><div class="icon">🛏️</div>
          <div>
            <div class="jp">${jp}</div>
            <div class="en">${en}</div>
            <div class="group-note jp-note">🌟同タイプのお部屋は1つにまとめています</div>
            <div class="group-note en-note">🌟Rooms of the same type are grouped into one listing.</div>
          </div>
        </div>
        <div class="chev">›</div>
      </a>`;
    }
  }

  if(page === 'swipe'){
    // Back
    setHref('back_to_category', `category.html?room=${encodeURIComponent(room)}`);

    // Title
    const titleMap = {
      bath: {jp:'バスルーム', en:'Swipe', prefix:'Bath'},
      main12:{jp:'メインルーム', en:'Swipe', prefix:'Main'},
      main3:{jp:'メインルーム', en:'Swipe', prefix:'Main'},
      main4:{jp:'メインルーム', en:'Swipe', prefix:'Main'},
      main56:{jp:'メインルーム', en:'Swipe', prefix:'Main'},
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
  }
})();
