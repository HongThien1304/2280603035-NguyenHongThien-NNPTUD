const postsEl = document.getElementById('posts');
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');
const minRange = document.getElementById('minRange');
const maxRange = document.getElementById('maxRange');
const minVal = document.getElementById('minVal');
const maxVal = document.getElementById('maxVal');

let posts = [];
let filtered = [];

async function fetchPosts(){
  try{
    const res = await fetch('/posts');
    posts = await res.json();
    filtered = posts.slice();
    render();
    updateSlidersRange();
  }catch(e){
    console.error(e);
  }
}

function render(){
  postsEl.innerHTML = '';
  const min = Number(minRange.value);
  const max = Number(maxRange.value);
  const q = searchInput.value.trim().toLowerCase();

  const list = posts.filter(p => {
    const viewsOk = (p.views >= min && p.views <= max);
    const titleOk = p.title.toLowerCase().includes(q);
    return viewsOk && titleOk;
  });

  if(list.length===0) postsEl.textContent = 'No posts found';

  for(const p of list){
    const el = document.createElement('article');
    el.className = 'post';
    el.innerHTML = `<h3>${escapeHtml(p.title)}</h3><div>Views: ${p.views}</div><pre>${JSON.stringify(p,null,2)}</pre>`;
    postsEl.appendChild(el);
  }
}

function escapeHtml(s){
  return (s+'').replace(/[&<>"']/g, c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':"'"
  })[c]);
}

function updateSlidersRange(){
  if(posts.length===0) return;
  const min = Math.min(...posts.map(p=>p.views));
  const max = Math.max(...posts.map(p=>p.views));
  minRange.min = min;
  minRange.max = max;
  maxRange.min = min;
  maxRange.max = max;
  minRange.value = min;
  maxRange.value = max;
  minVal.textContent = min;
  maxVal.textContent = max;
}

searchInput.addEventListener('input', onSearchInput);
function onSearchInput(e){
  const q = e.target.value.trim().toLowerCase();
  suggestions.innerHTML = '';
  if(q.length===0) return;
  const hits = posts.filter(p=>p.title.toLowerCase().includes(q)).slice(0,8);
  for(const h of hits){
    const li = document.createElement('li');
    li.textContent = h.title;
    li.addEventListener('click', ()=>{
      searchInput.value = h.title;
      suggestions.innerHTML = '';
      render();
    });
    suggestions.appendChild(li);
  }
  render();
}

minRange.addEventListener('input', ()=>{ minVal.textContent = minRange.value; if(Number(minRange.value)>Number(maxRange.value)) maxRange.value = minRange.value; render();});
maxRange.addEventListener('input', ()=>{ maxVal.textContent = maxRange.value; if(Number(maxRange.value)<Number(minRange.value)) minRange.value = maxRange.value; render();});

// initial
fetchPosts();
