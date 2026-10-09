(function(){
  const FAVORITES_KEY='uzzeletti-favorites';
  const BAG_KEY='uzzeletti-bag';
  const WHATSAPP='556493335143';
  const state={products:[],loaded:false,loading:null,activePanel:null};
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
  const favorites=()=>read(FAVORITES_KEY,[]);
  const bag=()=>read(BAG_KEY,[]);
  const saveFavorites=items=>{write(FAVORITES_KEY,items);updateBadges()};
  const saveBag=items=>{write(BAG_KEY,items);updateBadges()};
  const money=value=>Number.isFinite(value)?value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}):'Consultar valor';
  const categoryLabel=value=>({conjuntos:'Conjuntos',sutias:'Sutiãs',calcinhas:'Calcinhas',bodies:'Bodies',camisolas:'Camisolas',robes:'Robes',eroticos:'Produtos eróticos'}[value]||value);
  const productUrl=p=>`produto.html?id=${encodeURIComponent(p.slug)}`;
  const productBySlug=slug=>state.products.find(item=>item.slug===slug);
  async function loadProducts(){
    if(state.loaded)return state.products;
    if(!state.loading){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);state.loading=fetch('/data/products.json',{cache:'no-store',signal:controller.signal}).then(response=>{if(!response.ok)throw Error('Produtos indisponíveis');return response.json()}).then(items=>{state.products=items;state.loaded=true;return items}).finally(()=>clearTimeout(timer))}
    return state.loading;
  }
  function updateBadges(){
    const favoriteCount=favorites().length;
    const selectedBag=bag().reduce((sum,item)=>sum+(Number(item.quantity)||1),0);
    document.querySelectorAll('[data-favorites-count]').forEach(node=>{node.textContent=favoriteCount;node.hidden=!favoriteCount});
    document.querySelectorAll('[data-bag-count]').forEach(node=>{node.textContent=selectedBag;node.hidden=!selectedBag});
    document.querySelectorAll('[data-favorite-slug]').forEach(button=>{const active=favorites().includes(button.dataset.favoriteSlug);button.classList.toggle('is-favorite',active);button.setAttribute('aria-pressed',String(active));button.textContent=active?'♥':'♡'});
  }
  function mountUi(){
    if(document.querySelector('#store-layer')){updateBadges();return}
    const layer=document.createElement('div');layer.id='store-layer';layer.className='store-layer';layer.innerHTML=`<div class="store-backdrop" data-store-close></div><section class="store-search" role="dialog" aria-modal="true" aria-labelledby="store-search-title" hidden><div class="store-panel-head"><h2 id="store-search-title">Pesquisar produtos</h2><button type="button" class="store-close" data-store-close aria-label="Fechar pesquisa">×</button></div><label class="store-search-field"><span class="sr-only">Pesquisar produtos</span><input type="search" id="store-search-input" placeholder="Nome, categoria, cor..." autocomplete="off"></label><div id="store-search-results" class="store-search-results" aria-live="polite"></div></section><aside class="store-drawer" role="dialog" aria-modal="true" aria-labelledby="store-drawer-title" hidden><div class="store-panel-head"><h2 id="store-drawer-title">Sua seleção</h2><button type="button" class="store-close" data-store-close aria-label="Fechar painel">×</button></div><div class="store-tabs"><button type="button" data-store-tab="favorites">Favoritos <span data-favorites-count hidden>0</span></button><button type="button" data-store-tab="bag">Sacola <span data-bag-count hidden>0</span></button></div><div id="store-panel-content"></div></aside></div>`;
    document.body.append(layer);
    layer.addEventListener('click',handleLayerClick);
    document.addEventListener('click',handleDocumentClick);
    document.addEventListener('keydown',event=>{if(event.key==='Escape')closePanel()});
    updateBadges();
  }
  function handleDocumentClick(event){
    const favorite=event.target.closest('[data-favorite-slug]');
    if(favorite){event.preventDefault();event.stopPropagation();toggleFavorite(favorite.dataset.favoriteSlug);return}
    const add=event.target.closest('[data-add-to-bag]');
    if(add){event.preventDefault();event.stopPropagation();handleAddToBag(add.dataset.addToBag);return}
    const search=event.target.closest('[data-store-action="search"]');
    const openFavorites=event.target.closest('[data-store-action="favorites"]');
    const openBag=event.target.closest('[data-store-action="bag"]');
    if(search){event.preventDefault();openSearch();return}
    if(openFavorites){event.preventDefault();openDrawer('favorites');return}
    if(openBag){event.preventDefault();openDrawer('bag')}
  }
  function handleLayerClick(event){
    if(event.target.closest('[data-store-close]')){closePanel();return}
    const tab=event.target.closest('[data-store-tab]');if(tab){renderDrawer(tab.dataset.storeTab);return}
    const remove=event.target.closest('[data-remove-favorite]');if(remove){removeFavorite(remove.dataset.removeFavorite);renderDrawer('favorites');return}
    const addFavoriteBag=event.target.closest('[data-favorite-add-bag]');if(addFavoriteBag){handleAddToBag(addFavoriteBag.dataset.favoriteAddBag);return}
    const removeBag=event.target.closest('[data-remove-bag]');if(removeBag){removeBagItem(removeBag.dataset.removeBag);renderDrawer('bag');return}
    const quantity=event.target.closest('[data-quantity]');if(quantity){changeQuantity(quantity.dataset.quantity,Number(quantity.dataset.step));return}
    const selected=event.target.closest('[data-bag-selected]');if(selected){toggleBagSelected(selected.dataset.bagSelected,selected.checked);return}
    const selectAll=event.target.closest('[data-select-all]');if(selectAll){selectAllBag(selectAll.checked);return}
    const clear=event.target.closest('[data-clear-bag]');if(clear){saveBag([]);renderDrawer('bag');return}
    const whatsapp=event.target.closest('[data-finish-whatsapp]');if(whatsapp){finishWhatsApp();return}
  }
  function openSearch(){
    mountUi();const layer=document.querySelector('#store-layer'),search=layer.querySelector('.store-search');closePanel(false);layer.classList.add('is-open');search.hidden=false;document.body.classList.add('store-open');const input=document.querySelector('#store-search-input');input.value='';renderSearch('');setTimeout(()=>input.focus(),0);input.oninput=()=>renderSearch(input.value);
  }
  async function renderSearch(query){
    const result=document.querySelector('#store-search-results');if(!result)return;result.innerHTML='<p class="store-empty">Carregando produtos...</p>';
    try{const items=await loadProducts(),term=query.trim().toLocaleLowerCase('pt-BR'),matches=items.filter(item=>{if(!term)return true;const values=[item.name,item.category,item.displayColor,item.description,...(item.colors||[])].join(' ').toLocaleLowerCase('pt-BR');return values.includes(term)}).slice(0,20);result.innerHTML=matches.length?matches.map(item=>`<a class="store-result" href="${productUrl(item)}"><img src="${escapeHtml(item.images?.[0]||'')}" alt="${escapeHtml(item.name)}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(categoryLabel(item.category))} · ${escapeHtml(money(item.price))}</small></span></a>`).join(''):'<p class="store-empty">Nenhum produto encontrado.</p>'}catch{result.innerHTML='<p class="store-empty">Não foi possível carregar a busca agora.</p>'}
  }
  function openDrawer(panel){mountUi();const layer=document.querySelector('#store-layer');closePanel(false);layer.classList.add('is-open');layer.querySelector('.store-drawer').hidden=false;document.body.classList.add('store-open');renderDrawer(panel)}
  function closePanel(removeClass=true){const layer=document.querySelector('#store-layer');if(!layer)return;layer.querySelector('.store-search').hidden=true;layer.querySelector('.store-drawer').hidden=true;if(removeClass){layer.classList.remove('is-open');document.body.classList.remove('store-open')}}
  async function renderDrawer(panel){
    const content=document.querySelector('#store-panel-content'),title=document.querySelector('#store-drawer-title');if(!content)return;state.activePanel=panel;title.textContent=panel==='favorites'?'Seus favoritos':'Sua sacola';content.innerHTML='<p class="store-empty">Carregando...</p>';
    let items;try{items=await loadProducts()}catch{content.innerHTML='<p class="store-empty">Não foi possível carregar esta seleção agora.</p>';return}
    if(panel==='favorites'){
      const saved=favorites().map(productBySlug).filter(Boolean);content.innerHTML=saved.length?saved.map(item=>`<article class="store-list-item"><img src="${escapeHtml(item.images?.[0]||'')}" alt="${escapeHtml(item.name)}"><div><a href="${productUrl(item)}"><strong>${escapeHtml(item.name)}</strong></a><small>${escapeHtml(money(item.price))}</small><div class="store-item-actions"><button type="button" data-favorite-add-bag="${escapeHtml(item.slug)}">Adicionar à sacola</button><button type="button" data-remove-favorite="${escapeHtml(item.slug)}">Remover</button></div></div></article>`).join(''):'<p class="store-empty">Você ainda não salvou produtos.</p>';return
    }
    const saved=bag();content.innerHTML=saved.length?`<div class="bag-tools"><label><input type="checkbox" data-select-all ${saved.every(item=>item.selected!==false)?'checked':''}> Selecionar todos</label><button type="button" data-clear-bag>Esvaziar sacola</button></div><div class="store-list">${saved.map(item=>`<article class="store-list-item bag-item"><label class="bag-check"><input type="checkbox" data-bag-selected="${escapeHtml(item.key)}" ${item.selected!==false?'checked':''} aria-label="Selecionar ${escapeHtml(item.name)}"></label><img src="${escapeHtml(item.image||'')}" alt="${escapeHtml(item.name)}"><div><strong>${escapeHtml(item.name)}</strong><small>${item.color?`Cor: ${escapeHtml(item.color)} · `:''}${item.size?`Tamanho: ${escapeHtml(item.size)}`:'Variação não informada'}</small><small>${escapeHtml(money(item.price))}</small><div class="quantity"><button type="button" data-quantity="${escapeHtml(item.key)}" data-step="-1" aria-label="Diminuir quantidade">−</button><span>${Number(item.quantity)||1}</span><button type="button" data-quantity="${escapeHtml(item.key)}" data-step="1" aria-label="Aumentar quantidade">+</button><button type="button" data-remove-bag="${escapeHtml(item.key)}">Remover</button></div></div></article>`).join('')}</div><div class="bag-summary"><strong>${bagSummary(saved)}</strong><button type="button" class="hero-button hero-button--primary" data-finish-whatsapp>Finalizar pelo WhatsApp</button></div>`:'<p class="store-empty">Sua sacola está vazia.</p>';
  }
  function bagSummary(items){const priced=items.filter(item=>item.selected!==false&&Number.isFinite(item.price));const total=priced.reduce((sum,item)=>sum+item.price*(Number(item.quantity)||1),0);if(!priced.length)return 'Selecione itens para consultar o valor';return `${items.some(item=>item.selected!==false&&!Number.isFinite(item.price))?'Total parcial dos itens com preço: ':'Total estimado: '}${money(total)}`}
  function toggleFavorite(slug){const saved=favorites(),next=saved.includes(slug)?saved.filter(item=>item!==slug):[...saved,slug];saveFavorites(next);if(state.activePanel==='favorites')renderDrawer('favorites')}
  function removeFavorite(slug){saveFavorites(favorites().filter(item=>item!==slug))}
  function findVariantImage(product,color){return product.variants?.find(variant=>variant.color===color)?.image||product.images?.[0]||''}
  function addToBag(product,selection={}){const size=selection.size||'',color=selection.color||'';if(product.sizes?.length&&!size)return {ok:false,reason:'size'};if(product.colors?.length&&!color)return {ok:false,reason:'color'};const key=`${product.slug}|${size}|${color}`,items=bag(),existing=items.find(item=>item.key===key);if(existing)existing.quantity=(Number(existing.quantity)||1)+1;else items.push({key,id:product.id,slug:product.slug,name:product.name,price:Number.isFinite(product.price)?product.price:null,image:findVariantImage(product,color),color,size,quantity:1,selected:true});saveBag(items);return {ok:true}}
  function handleAddToBag(slug){const product=productBySlug(slug);if(!product){loadProducts().then(()=>handleAddToBag(slug));return}const result=addToBag(product);if(!result.ok){location.href=productUrl(product);return}openDrawer('bag')}
  function removeBagItem(key){saveBag(bag().filter(item=>item.key!==key))}
  function changeQuantity(key,step){const items=bag(),item=items.find(entry=>entry.key===key);if(!item)return;item.quantity=Math.max(1,(Number(item.quantity)||1)+step);saveBag(items);renderDrawer('bag')}
  function toggleBagSelected(key,value){const items=bag(),item=items.find(entry=>entry.key===key);if(item)item.selected=value;saveBag(items);renderDrawer('bag')}
  function selectAllBag(value){const items=bag().map(item=>({...item,selected:value}));saveBag(items);renderDrawer('bag')}
  function finishWhatsApp(){const selected=bag().filter(item=>item.selected!==false);if(!selected.length){alert('Selecione ao menos um item para continuar.');return}const lines=['Olá! Tenho interesse nestes produtos da UZZELETI:',''];selected.forEach((item,index)=>{lines.push(`${index+1}. ${item.name}`,item.size?`Tamanho: ${item.size}`:'Tamanho: consultar',item.color?`Cor: ${item.color}`:'Cor: consultar',`Quantidade: ${Number(item.quantity)||1}`,`Valor: ${Number.isFinite(item.price)?money(item.price):'consultar'}`,'')});const priced=selected.filter(item=>Number.isFinite(item.price));if(priced.length)lines.push(`${selected.some(item=>!Number.isFinite(item.price))?'Total parcial dos itens com preço':'Total estimado'}: ${money(priced.reduce((sum,item)=>sum+item.price*(Number(item.quantity)||1),0))}`,'');lines.push('Gostaria de confirmar disponibilidade.');location.assign(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`)}
  function decorateCards(){
    let changed=false;
    document.querySelectorAll('.product-card').forEach(card=>{
      if(card.querySelector('[data-favorite-slug]'))return;
      const link=card.querySelector('a[href*="produto.html?id="]');if(!link)return;
      const slug=new URL(link.href,location.href).searchParams.get('id');if(!slug)return;
      const favorite=document.createElement('button');favorite.type='button';favorite.className='product-favorite';favorite.dataset.favoriteSlug=slug;favorite.setAttribute('aria-label','Adicionar aos favoritos');favorite.setAttribute('aria-pressed','false');favorite.textContent='♡';card.append(favorite);changed=true;
      const actions=card.querySelector('.product-actions');if(actions&&!actions.querySelector('[data-add-to-bag]')){const add=document.createElement('button');add.type='button';add.className='product-bag-cta';add.dataset.addToBag=slug;add.textContent='Adicionar à sacola';actions.append(add)}
    });
    if(changed)updateBadges();
  }
  function decorateDetail(){
    const panel=document.querySelector('#product-detail .product-panel');if(!panel||panel.querySelector('[data-detail-add]'))return;
    const slug=new URLSearchParams(location.search).get('id');if(!slug)return;
    panel.style.position='relative';
    panel.querySelectorAll('[data-size].active,[data-color].active').forEach(option=>{option.classList.remove('active');option.setAttribute('aria-pressed','false')});
    const actions=panel.querySelector('#availability');
    const favorite=document.createElement('button');favorite.type='button';favorite.className='product-favorite detail-favorite';favorite.dataset.favoriteSlug=slug;favorite.setAttribute('aria-label','Adicionar aos favoritos');favorite.setAttribute('aria-pressed','false');favorite.textContent='♡';panel.prepend(favorite);
    const add=document.createElement('button');add.type='button';add.className='bag-cta';add.dataset.detailAdd=slug;add.textContent='Adicionar à sacola';actions?.after(add);
    add.addEventListener('click',async()=>{const product=(await loadProducts()).find(item=>item.slug===slug);if(!product)return;const size=panel.querySelector('[data-size].active')?.dataset.size||'',color=panel.querySelector('[data-color].active')?.dataset.color||'',result=addToBag(product,{size,color});if(!result.ok){alert(result.reason==='size'?'Escolha um tamanho antes de adicionar à sacola.':'Escolha uma cor antes de adicionar à sacola.');return}openDrawer('bag')});
    updateBadges();
  }
  window.UzzeletiStore={loadProducts,addToBag,openDrawer,updateBadges,mountUi,decorateCards};
  mountUi();
  decorateCards();
  decorateDetail();
  new MutationObserver(records=>{if(records.some(record=>!record.target.closest?.('#store-layer'))){decorateCards();decorateDetail()}}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('load',updateBadges);
})();
