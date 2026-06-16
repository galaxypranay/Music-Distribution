/* ============================================================
   WAVECUT — interactions
   ============================================================ */

// ---------- Page navigation ----------
const PAGES = ['dashboard','newrelease','uploads','submission-details'];

function goTo(pageId){
  PAGES.forEach(id=>{
    const el = document.getElementById('page-' + id);
    if(!el) return;
    el.classList.toggle('active', id === pageId);
  });

  // nav active states
  document.querySelectorAll('.nav-link, .bn-link').forEach(el=>{
    el.classList.toggle('active', el.dataset.target === pageId);
  });

  window.scrollTo({top:0, behavior:'smooth'});
}

// initial state
goTo('dashboard');

// ---------- Ambient cursor glow ----------
const ambient = document.getElementById('ambientGlow');
document.addEventListener('mousemove', (e)=>{
  const xPct = (e.clientX / window.innerWidth) * 100;
  const yPct = (e.clientY / window.innerHeight) * 100;
  ambient.style.setProperty('--mx', xPct + '%');
  ambient.style.setProperty('--my', yPct + '%');
});

// ---------- Card tilt on mouse move ----------
// Re-scans the DOM each call so cards on inactive pages still get bound,
// and removes the inline transform cleanly on leave so it doesn't get "stuck".
function initTilt(){
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    if(card.dataset.tiltBound) return; // avoid double-binding
    card.dataset.tiltBound = 'true';

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
      card.style.transform = '';
    });
  });
}
initTilt();

// ---------- File upload helpers ----------
function formatBytes(bytes){
  if(bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k,i)).toFixed(1)) + ' ' + sizes[i];
}

const AUDIO_TYPES = ['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/wave'];
const IMAGE_TYPES = ['image/png','image/jpeg','image/jpg'];

function isAudioFile(file){
  if(AUDIO_TYPES.includes(file.type)) return true;
  return /\.(mp3|wav)$/i.test(file.name);
}
function isImageFile(file){
  if(IMAGE_TYPES.includes(file.type)) return true;
  return /\.(png|jpe?g)$/i.test(file.name);
}

function handleAudio(input){
  const file = input.files[0];
  if(!file) return;
  const errorEl = document.getElementById('audioError');

  if(!isAudioFile(file)){
    errorEl.hidden = false;
    resetAudio();
    return;
  }
  errorEl.hidden = true;

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
  const errorEl = document.getElementById('coverError');

  if(!isImageFile(file)){
    errorEl.hidden = false;
    resetCover();
    return;
  }
  errorEl.hidden = true;

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

// drag & drop — only the inner "browse" zone opens the file picker on click,
// but the whole dropzone area accepts drag/drop.
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

// ---------- Submit release: validation + loading + success ----------
function submitRelease(e){
  e.preventDefault();

  const audioChosen = document.getElementById('audioInput').files.length > 0;
  const coverChosen = document.getElementById('coverInput').files.length > 0;

  let valid = true;
  if(!audioChosen){
    document.getElementById('audioError').hidden = false;
    document.getElementById('audioError').textContent = '⚠ Please upload an audio file (MP3 or WAV).';
    valid = false;
  }
  if(!coverChosen){
    document.getElementById('coverError').hidden = false;
    document.getElementById('coverError').textContent = '⚠ Please upload cover art (JPG or PNG).';
    valid = false;
  }
  if(!valid){
    document.getElementById('releaseForm').reportValidity();
    return;
  }

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
  document.getElementById('releaseForm').reset();
  resetAudio();
  resetCover();
  document.getElementById('audioError').hidden = true;
  document.getElementById('coverError').hidden = true;
  goTo('uploads');
}

// ---------- My Uploads: search + filter ----------
let currentStatusFilter = 'all';
let currentSearchTerm = '';

function applyUploadFilters(){
  const rows = document.querySelectorAll('#uploadsTable tbody tr');
  let visibleCount = 0;

  rows.forEach(row=>{
    const matchesStatus = currentStatusFilter === 'all' || row.dataset.status === currentStatusFilter;
    const matchesSearch = !currentSearchTerm || row.dataset.search.includes(currentSearchTerm);
    const show = matchesStatus && matchesSearch;
    row.style.display = show ? '' : 'none';
    if(show) visibleCount++;
  });

  document.getElementById('tableEmpty').hidden = visibleCount !== 0;
}

function filterUploads(btn){
  document.querySelectorAll('#filterChips .chip').forEach(c => c.classList.remove('chip-active'));
  btn.classList.add('chip-active');
  currentStatusFilter = btn.dataset.status;
  applyUploadFilters();
}

function searchUploads(value){
  currentSearchTerm = value.trim().toLowerCase();
  applyUploadFilters();
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
