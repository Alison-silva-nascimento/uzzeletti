const current = location.pathname.split('/').pop() || 'index.html';
const links = [['index.html','Home'],['produtos.html','Produtos'],['eroticos.html','Produtos eróticos'],['sobre.html','Sobre'],['contato.html','Contato'],['feedbacks.html','Feedbacks']];
const cleanLocalLink = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
if(cleanLocalLink) document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href]');
  if(!link || event.defaultPrevented || link.target === '_blank' || event.button !== 0) return;
  const url = new URL(link.href, location.href);
  if(url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
  event.preventDefault();
  url.pathname = url.pathname.slice(0, -5);
  location.assign(url.href);
}, true);
const header = document.querySelector('[data-header]');
const footer = document.querySelector('[data-footer]');
if(header) header.innerHTML = `<a class="skip-link" href="#conteudo">Pular para o conteúdo</a><header class="site-header"><div class="container nav-wrap"><a class="brand" href="index.html" aria-label="UZZELETI — início"><img src="assets/logo/uzzeletti-logo.png" alt="UZZELETI Moda Íntima"></a><button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">☰</button><nav class="nav" aria-label="Navegação principal">${links.map(([href,label])=>`<a href="${href}" ${current===href?'aria-current="page"':''}>${label}</a>`).join('')}<a class="header-cta" href="contato.html">Fale conosco</a></nav><div class="header-actions" aria-label="Ferramentas da loja"></div><nav class="mobile-nav" aria-label="Navegação mobile"><a href="produtos.html">Produtos</a><a href="eroticos.html">Eróticos</a><a href="contato.html">Contato</a><a href="feedbacks.html">Feedbacks</a></nav></div></header>`;
header?.querySelectorAll('.mobile-nav a').forEach(link=>{if(link.getAttribute('href')===current)link.setAttribute('aria-current','page')});
if(footer) footer.innerHTML = `<footer class="site-footer"><div class="container"><div class="footer-grid"><div><img class="footer-logo" src="assets/logo/uzzeletti-logo.png" alt="UZZELETI"></div><div><p class="footer-title">Navegue</p><div class="footer-links">${links.slice(1).map(([h,l])=>`<a href="${h}">${l}</a>`).join('')}</div></div><div><p class="footer-title">Atendimento</p><div class="footer-links"><a href="https://wa.me/556493335143" target="_blank" rel="noopener noreferrer">WhatsApp: +55 64 9333-5143</a><a href="https://www.instagram.com/uzzeleti.modaintima?stkn=dzY1N3F3bHdleWRu" target="_blank" rel="noopener noreferrer">Instagram: @uzzeleti.modaintima</a><span>Itumbiara, Goiás, Brasil</span><span>Seg a sáb, das 8h às 18h</span></div></div></div><div class="footer-note"><span>© ${new Date().getFullYear()} UZZELETI. Todos os direitos reservados.</span><span class="developer-credit">Desenvolvido por <a href="https://alison-silva-nascimento.github.io/Portifolio/index.html#inicio" target="_blank" rel="noopener noreferrer" aria-label="Acessar o portfólio de AS"><svg class="developer-mark" aria-hidden="true" viewBox="0 0 16 15" width="16" height="15" style="display:inline-block;width:16px;height:15px;flex:0 0 16px" focusable="false"><path d="M0 8h2v7H0zM6 4h2v11H6zM12 0h2v15h-2z" fill="currentColor"/></svg>AS</a></span><span>Site institucional e catálogo — compras por contato.</span></div></div></footer><button class="back-top" aria-label="Voltar ao topo">↑</button><a class="whatsapp-float" href="https://wa.me/556493335143" target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp" title="Falar no WhatsApp">WA</a><div class="support-center"><button class="support-trigger" type="button" aria-label="Abrir Central de Atendimento" aria-expanded="false" aria-controls="support-panel"><span aria-hidden="true">💬</span></button><button class="support-backdrop" type="button" aria-label="Fechar Central de Atendimento"></button><section class="support-panel" id="support-panel" aria-hidden="true" aria-labelledby="support-title"><header class="support-head"><div><span class="eyebrow">UZZELETI</span><h2 id="support-title">Central de Atendimento</h2></div><button class="support-close" type="button" aria-label="Fechar Central de Atendimento">×</button></header><p class="support-intro">Como podemos ajudar?</p><div class="support-options"><a href="produtos.html"><span aria-hidden="true">◇</span><span>Quero saber sobre um produto<small>Explore o catálogo e escolha uma peça.</small></span><b aria-hidden="true">›</b></a><button type="button" data-support="duvida"><span aria-hidden="true">◇</span><span>Tenho uma dúvida<small>Conte brevemente o que deseja saber.</small></span><b aria-hidden="true">›</b></button><button type="button" data-support="feedback"><span aria-hidden="true">◇</span><span>Enviar um feedback<small>Compartilhe sua experiência conosco.</small></span><b aria-hidden="true">›</b></button></div><div class="support-form" hidden><button class="support-back" type="button">← Voltar</button><div class="support-name-field" hidden><label for="support-name">Seu nome (opcional)</label><input id="support-name" type="text" autocomplete="name" placeholder="Como podemos chamar você?"></div><label for="support-message">Sua mensagem</label><textarea id="support-message" rows="4" placeholder="Escreva aqui..."></textarea><p>Você será encaminhada ao formulário de contato. Nenhuma mensagem será enviada automaticamente.</p><a class="btn" id="support-continue" href="contato.html">Continuar para contato</a></div></section></div>`;
const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('.nav');
toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',open);toggle.textContent=open?'×':'☰';document.body.classList.toggle('menu-open',open)});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');document.body.classList.remove('menu-open')}));
const topBtn=document.querySelector('.back-top');addEventListener('scroll',()=>topBtn?.classList.toggle('visible',scrollY>600));topBtn?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
document.querySelectorAll('img').forEach(img=>{if(!img.hasAttribute('loading')&&!img.closest('.hero'))img.loading='lazy'});

const supportTrigger=document.querySelector('.support-trigger'),supportPanel=document.querySelector('.support-panel'),supportBackdrop=document.querySelector('.support-backdrop'),supportClose=document.querySelector('.support-close'),supportOptions=document.querySelector('.support-options'),supportForm=document.querySelector('.support-form'),supportNameField=document.querySelector('.support-name-field'),supportName=document.querySelector('#support-name'),supportMessage=document.querySelector('#support-message'),supportContinue=document.querySelector('#support-continue');let supportType='';
function openSupport(){supportPanel.classList.add('open');supportBackdrop.classList.add('open');supportPanel.setAttribute('aria-hidden','false');supportTrigger.setAttribute('aria-expanded','true');document.body.classList.add('support-open');supportClose.focus()}
function closeSupport(){supportPanel.classList.remove('open');supportBackdrop.classList.remove('open');supportPanel.setAttribute('aria-hidden','true');supportTrigger.setAttribute('aria-expanded','false');document.body.classList.remove('support-open');supportTrigger.focus()}
function showSupportForm(type){supportType=type;supportOptions.hidden=true;supportForm.hidden=false;supportName.value='';supportNameField.hidden=false;supportMessage.value='';supportMessage.placeholder=type==='duvida'?'Qual é a sua dúvida?':'Conte o que podemos melhorar';supportMessage.focus();updateSupportLink()}
function updateSupportLink(){const subject=supportType==='duvida'?'Tenho uma dúvida':'Quero enviar um feedback',params=new URLSearchParams({assunto:subject});if(supportName.value.trim())params.set('nome',supportName.value.trim());if(supportMessage.value.trim())params.set('mensagem',supportMessage.value.trim());supportContinue.href=`contato.html?${params}`}
supportTrigger?.addEventListener('click',()=>supportPanel.classList.contains('open')?closeSupport():openSupport());supportClose?.addEventListener('click',closeSupport);supportBackdrop?.addEventListener('click',closeSupport);document.querySelectorAll('[data-support]').forEach(button=>button.addEventListener('click',()=>button.dataset.support==='feedback'?location.assign('feedbacks.html'):showSupportForm(button.dataset.support)));document.querySelector('.support-back')?.addEventListener('click',()=>{supportForm.hidden=true;supportOptions.hidden=false;supportOptions.querySelector(`[data-support="${supportType}"]`)?.focus()});supportName?.addEventListener('input',updateSupportLink);supportMessage?.addEventListener('input',updateSupportLink);addEventListener('keydown',event=>{if(event.key==='Escape'&&supportPanel?.classList.contains('open'))closeSupport()});
const mobileFormField=element=>matchMedia('(max-width: 600px)').matches&&element?.matches('input, select, textarea');document.addEventListener('focusin',event=>{if(mobileFormField(event.target))document.body.classList.add('form-field-active')});document.addEventListener('focusout',()=>setTimeout(()=>{if(!mobileFormField(document.activeElement))document.body.classList.remove('form-field-active')},0));

const headerActions = document.querySelector('.header-actions');
if(headerActions){
  headerActions.innerHTML = '<button type="button" class="header-icon" data-store-action="search" aria-label="Pesquisar produtos">⌕</button><button type="button" class="header-icon" data-store-action="favorites" aria-label="Abrir favoritos">♡<span class="header-badge" data-favorites-count hidden>0</span></button><button type="button" class="header-icon" data-store-action="bag" aria-label="Abrir sacola">▱<span class="header-badge" data-bag-count hidden>0</span></button>';
}
if(!document.querySelector('link[data-store-style]')){
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/store.css?v=2';
  style.dataset.storeStyle = 'true';
  document.head.append(style);
}
if(!document.querySelector('link[data-store-style-v2]')){
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'css/store-v2.css?v=1';
  style.dataset.storeStyleV2 = 'true';
  document.head.append(style);
}
if(!document.querySelector('script[data-store-script]')){
  const script = document.createElement('script');
  script.src = 'js/store.js?v=2';
  script.dataset.storeScript = 'true';
  document.body.append(script);
}
