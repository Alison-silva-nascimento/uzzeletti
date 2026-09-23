const money=v=>Number.isFinite(v)?v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Consulte disponibilidade';
const categoryLabel=v=>({conjuntos:'Conjuntos',sutias:'Sutiãs',calcinhas:'Calcinhas',bodies:'Bodies',camisolas:'Camisolas',robes:'Robes',eroticos:'Produtos eróticos'}[v]||v);
async function getProducts(){const r=await fetch('/data/products.json',{cache:'no-store'});if(!r.ok)throw Error('Falha ao carregar produtos');return r.json()}
function savedCatalog(){return location.pathname.endsWith('produtos.html')?location.search:(sessionStorage.getItem('uzzelettiCatalog')||'')}
function productCard(p,selected={}){const badge=p.new?'Novidade':p.bestSeller?'Mais vendido':'';return `<article class="product-card category-${p.category} ${p.editorialBackground?'editorial-product':''}">${badge?`<span class="badge">${badge}</span>`:''}<a href="produto.html?id=${p.slug}&voltar=${encodeURIComponent('produtos.html'+savedCatalog())}" aria-label="Ver detalhes de ${p.name}"><div class="product-media" style="--product-image:url('/${encodeURI(p.images[0]).replace(/^\/+/, '')}')"><img src="${p.images[0]}" alt="${p.name}" loading="lazy"></div><div class="product-info"><div class="product-meta"><span>${categoryLabel(p.category)}</span></div><h3 class="product-name">${p.name}</h3>${selected.color?`<span class="product-filter-match">Disponível em ${selected.color}</span>`:''}${Array.isArray(p.sizes)&&p.sizes.length?`<p class="product-sizes">Tamanhos: ${p.sizes.join(' · ')}</p>`:''}<div class="product-actions"><span class="product-price">${money(p.price)}</span><span class="product-cta">Ver detalhes →</span></div></div></a></article>`}
async function renderProducts(s,p=()=>true,l){const t=document.querySelector(s);if(!t)return;try{let a=(await getProducts()).filter(p);if(l)a=a.slice(0,l);t.innerHTML=a.length?a.map(productCard).join(''):'<div class="empty-state"><h3>Nenhum produto por aqui</h3><p>Tente ajustar os filtros.</p></div>'}catch{t.innerHTML='<div class="empty-state">Não foi possível carregar o catálogo agora.</div>'}}
function enableProductAutoScroll(container){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let timer,paused=false;
  const advance=()=>{
    if(paused||container.scrollWidth<=container.clientWidth+4)return;
    const card=container.querySelector('.product-card');
    const step=(card?.getBoundingClientRect().width||240)+14;
    if(container.scrollLeft+container.clientWidth>=container.scrollWidth-8)container.scrollTo({left:0,behavior:'smooth'});
    else container.scrollBy({left:step,behavior:'smooth'});
  };
  const start=()=>{clearInterval(timer);timer=setInterval(advance,3600)};
  ['pointerenter','touchstart','focusin'].forEach(event=>container.addEventListener(event,()=>{paused=true},{passive:true}));
  ['pointerleave','focusout'].forEach(event=>container.addEventListener(event,()=>{paused=false},{passive:true}));
  container.addEventListener('touchend',()=>{setTimeout(()=>{paused=false},2200)},{passive:true});
  start();
}
async function renderRandomProducts(selector,count=3,predicate=()=>true){
  const target=document.querySelector(selector);if(!target)return;
  try{const items=(await getProducts()).filter(predicate);const picked=[...items].sort(()=>Math.random()-.5).slice(0,Math.min(count,items.length));target.innerHTML=picked.map(productCard).join('');enableProductAutoScroll(target)}catch{target.innerHTML='<div class="empty-state"><h3>Não foi possível carregar os produtos</h3><p>Tente recarregar a página.</p></div>'}
}