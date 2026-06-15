/* ============================================================
   WAVECUT — interactions
   ============================================================ */

// ---------- Page navigation ----------
const PAGES = ['login','register','admin-login','dashboard','newrelease','uploads','submission-details','admin-dashboard'];
const APP_PAGES = ['dashboard','newrelease','uploads','submission-details','admin-dashboard'];

function goTo(pageId){
  PAGES.forEach(id=>{
    const el = document.getElementById('page-' + id);
    if(!el) return;
    el.classList.toggle('active', id === pageId);
  });

  const isAppPage = APP_PAGES.includes(pageId);
  document.getElementById('topbar').style.display = isAppPage ? '' : 'none';
  document.getElementById('bottomnav').style.display = isAppPage ? '' : 'none';

  // nav active states
  document.querySelectorAll('.nav-link, .bn-link').forEach(el=>{
    el.classList.toggle('active', el.dataset.target === pageId);
  });

  window.scrollTo({top:0, behavior:'smooth'});
}

// initial state
goTo('login');

// ---------- Ambient cursor glow ----------
const ambient = document.getElementById('ambientGlow');
document.addEventListener('mousemove', (e)=>{
  const xPct = (e.clientX / window.innerWidth) * 100;
  const yPct = (e.clientY / window.innerHeight) * 100;
  ambient.style.setProperty('--mx', xPct + '%');
  ambient.style.setProperty('--my', yPct + '%');
});

// ---------- Card tilt on mouse move ----------
function initTilt(){
  const cards = document.querySelectorAll('[data-tilt]');
  cards.forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -4;
      const rotateY = ((x - cx) / cx) * 4;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}
initTilt();

// ---------- Password toggle ----------
function togglePass(btn){
  const input = btn.parentElement.querySelector('input');
  const icon = btn.querySelector('i');
  if(input.type === 'password'){
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// ---------- File upload helpers ----------
function formatBytes(bytes){
  if(bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k,i)).toFixed(1)) + ' ' + sizes[i];
}

function handleAudio(input){
  const file = input.files[0];
  if(!file) return;
  document.getElementById('audioDropInner').hidden = true;
  const chip = document.getElementById('audioChip');
  chip.hidden = false;
  document.getElementById('audioName').textContent = file.name;
  document.getElementById('audioSize').textContent = formatBytes(file.size);
}

function resetAudio(){
  document.getElementById('audioInput').value = '';
  document.getElementById('audioDropInner').hidden = false;
  document.getElementById('audioChip').hidden = true;
}

function handleCover(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    document.getElementById('coverDropInner').hidden = true;
    const wrap = document.getElementById('coverPreviewWrap');
    wrap.hidden = false;
    document.getElementById('coverPreview').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function resetCover(){
  document.getElementById('coverInput').value = '';
  document.getElementById('coverDropInner').hidden = false;
  document.getElementById('coverPreviewWrap').hidden = true;
  document.getElementById('coverPreview').src = '';
}

// drag & drop
['audioDrop','coverDrop'].forEach(id=>{
  const zone = document.getElementById(id);
  if(!zone) return;
  ['dragenter','dragover'].forEach(evt=>{
    zone.addEventListener(evt, (e)=>{ e.preventDefault(); zone.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(evt=>{
    zone.addEventListener(evt, (e)=>{ e.preventDefault(); zone.classList.remove('dragover'); });
  });
  zone.addEventListener('drop', (e)=>{
    const file = e.dataTransfer.files[0];
    if(!file) return;
    const input = zone.querySelector('input[type="file"]');
    input.files = e.dataTransfer.files;
    if(id === 'audioDrop') handleAudio(input);
    else handleCover(input);
  });
});

// ---------- Submit release: loading + success ----------
function submitRelease(e){
  e.preventDefault();
  const overlay = document.getElementById('loadingOverlay');
  const bar = document.getElementById('loaderBarFill');
  overlay.classList.add('active');
  bar.style.width = '0%';

  requestAnimationFrame(()=>{
    setTimeout(()=>{ bar.style.width = '100%'; }, 100);
  });

  setTimeout(()=>{
    overlay.classList.remove('active');
    document.getElementById('successOverlay').classList.add('active');
  }, 2200);
}

function closeSuccess(){
  document.getElementById('successOverlay').classList.remove('active');
  // reset form state
  resetAudio();
  resetCover();
  document.querySelector('.release-form').reset();
  goTo('uploads');
}

// ---------- Audio player demo toggle ----------
function togglePlay(btn){
  const icon = btn.querySelector('i');
  const track = btn.closest('.audio-player').querySelector('.player-track');
  const playing = icon.classList.contains('fa-pause');
  if(playing){
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
    track.classList.remove('playing');
  } else {
    icon.classList.remove('fa-play');
    icon.classList.add('fa-pause');
    track.classList.add('playing');
  }
}
