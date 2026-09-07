function zones(){let sel=Number(new URLSearchParams(location.hash.split('?')[1]||'').get('z'))||0;if(sel>4)sel=0;const z=ZONES[sel];return `${pageHero('04 / ZONAS','Uma coluna d’água. Cinco condições.','A profundidade não é apenas uma medida vertical: ela reorganiza a disponibilidade de luz, alimento, temperatura e pressão.','angler','page-deep')}<section class="section"><div class="tabs">${ZONES.map((x,i)=>`<a class="${i===sel?'active':''}" href="#/zonas?z=${i}">${x.name}</a>`).join('')}</div><div class="interaction"><div class="grid2"><div><span class="kicker">ZONA SELECIONADA</span><h2 class="h2">${z.name}</h2><p class="lede">${z.note}</p></div><div class="ecologyMetrics"><div class="metric"><span>profundidade</span><strong>${z.range}</strong></div><div class="metric"><span>luz</span><strong>${z.light}</strong></div><div class="metric"><span>temperatura</span><strong>${z.temp}</strong></div><div class="metric"><span>pressão</span><strong>${z.pressure}</strong></div></div></div></div></section><section class="section"><div class="sectionTitle"><span class="kicker">COMPARAÇÃO</span><h2 class="h2">O que muda enquanto descemos?</h2></div><div class="grid3">${ZONES.map((x,i)=>`<article class="card" style="min-height:300px"><span class="index">0${i+1} / ${x.range}</span><h3>${x.name}</h3><p><b>Luz:</b> ${x.light}</p><p><b>Pressão:</b> ${x.pressure}</p><p><b>Energia:</b> ${x.energy}</p></article>`).join('')}</div></section>`}
function ecologia(){return `${pageHero('06 / ECOLOGIA MARINHA','Onde cada relação tem consequência.','Ecologia marinha estuda como organismos interagem entre si e com o ambiente físico — do microplâncton aos predadores de topo.','orca','page-food')}<section class="section ecologyHero"><div><span class="kicker">SISTEMAS ECOLÓGICOS</span><h2 class="h2">Habitat + energia + relações.</h2><p class="lede">Uma espécie não existe isoladamente. Sua distribuição depende de alimento, abrigo, salinidade, temperatura, predadores, competidores, correntes e ciclos químicos.</p></div><div class="interaction"><span class="kicker">3 LENTES</span><div class="metric"><strong>Fluxo</strong><span>matéria e energia circulando</span></div><div class="metric"><strong>Relações</strong><span>predação · competição · mutualismo</span></div><div class="metric"><strong>Escala</strong><span>do microscópico ao oceânico</span></div></div></section><section class="section"><div class="sectionTitle"><span class="kicker">RELAÇÕES</span><h2 class="h2">Uma ecologia de encontros.</h2><p class="lede">As interações podem aumentar a sobrevivência, limitar recursos ou reorganizar uma comunidade.</p></div><div class="grid3">${[['Predação','Uma espécie captura outra; altera abundância, comportamento e fluxo de energia.'],['Competição','Organismos disputam um recurso quando este não atende a todos.'],['Mutualismo','Interação em que ambos podem obter benefícios, como em certas relações de simbiose.'],['Parasitismo','Um organismo obtém recursos de outro causando efeito negativo no hospedeiro.'],['Comensalismo','Um organismo se beneficia enquanto o efeito sobre o outro é pequeno ou neutro.'],['Engenharia ecológica','Organismos podem transformar fisicamente habitats e criar novos nichos.']].map((x,i)=>`<article class="card"><span class="index">0${i+1}</span><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join('')}</div></section><section class="section"><div class="grid2"><div><span class="kicker">PROCESSOS</span><h2 class="h2">Produtividade, ciclos e conectividade.</h2></div><div><p class="lede">Fitoplâncton fixa carbono; consumidores redistribuem matéria; decompositores reciclam nutrientes. Correntes e migrações conectam lugares muito distantes.</p><a class="btn primary" href="#/cadeia-alimentar">Ver a teia alimentar →</a></div></div></section>`}
function ecossistemas(){return `${pageHero('07 / ECOSSISTEMAS','Arquiteturas vivas do oceano.','Cada ecossistema cria uma combinação diferente de luz, estrutura, fluxo, recursos e relações biológicas.','reef','eco-reef')}<section class="section"><div class="ecosystemGrid">${ECO.map((e,i)=>`<article class="ecoCard"><div class="ecoVisual">${photoFrame('eco-'+e[3],e[0],art(e[3],'small'))}</div><div class="body"><span class="small">0${i+1} / ECOSSISTEMA</span><h3>${e[0]}</h3><p>${e[1]}</p><div class="ecoTags">${e[2].split(' · ').map(t=>`<span>${t}</span>`).join('')}</div></div></article>`).join('')}</div></section>`}
/* ============================================================
   ENCICLOPÉDIA DE ESPÉCIES
   Busca livre + filtros combináveis + ordenação, e cada ficha
   ligada a mapa, zonas, ecossistemas, missões e diário.
   ============================================================ */
const STATUS_ORDER={CR:0,EN:1,VU:2,NT:3,LC:4,DD:5,NE:6};
const DIET_KINDS=[
 ['filtrador',/filtrad|filtração/i],
 ['planctívoro',/plâncton|planct|krill/i],
 ['herbívoro',/alga|kelp|fanerógam|erva marinha/i],
 ['detritívoro',/detrit|neve marinha|carniça|carcaç|matéria orgânica|depositad/i],
 ['quimiossíntese / simbiose',/quimioss|simbio|zooxantel|bactéria/i],
 ['fotossíntese',/fotossíntese/i],
 ['carnívoro',/peixe|lula|cefalópod|crustáce|mamífer|presa|molusc|bivalve|invertebrad|esponja|ouriço|copépode/i]
];
/* Rótulo de leitura rápida derivado do texto de alimentação da própria
   ficha. A descrição completa e sua fonte continuam na página da espécie. */
function dietKind(s){
  const txt=(s.diet||'');
  let hits=DIET_KINDS.filter(([,re])=>re.test(txt)).map(([k])=>k);
  if(hits.includes('filtrador'))hits=hits.filter(k=>k!=='planctívoro'&&k!=='carnívoro');
  if(hits.includes('fotossíntese'))hits=hits.filter(k=>k!=='herbívoro');
  return hits.length?hits.slice(0,2):['variada'];
}
function speciesFilters(){
  return {
    q:document.getElementById('speciesQuery')?.value||'',
    g:document.getElementById('speciesGroup')?.value||'Todos',
    z:document.getElementById('speciesZone')?.value||'Qualquer',
    e:document.getElementById('speciesEco')?.value||'Todos',
    r:document.getElementById('speciesBasin')?.value||'Todas',
    st:document.getElementById('speciesStatus')?.value||'Todos',
    sort:document.getElementById('speciesSort')?.value||'nome'
  };
}
function speciesHaystack(s){
  const m=meta(s.id);
  return slug([s.name,s.sci,s.group,s.depth,s.habitat,s.desc,s.status,s.diet,s.behavior,
    (s.threats||[]).join(' '),(s.facts||[]).join(' '),m.env,m.t,
    m.z.map(z=>(ZONE_META.find(x=>x.key===z)||{}).name||'').join(' '),
    m.r.map(r=>(REGIONS.find(x=>x.id===r)||{}).name||'').join(' '),
    m.e.map(e=>ECO_NAME[e]||'').join(' '),
    dietKind(s).join(' ')].join(' '));
}
function filterSpecies(f){
  const q=slug(f.q||'').trim();
  const terms=q?q.split(/\s+/):[];
  let arr=SPECIES.filter(s=>{
    const m=meta(s.id);
    if(f.g!=='Todos'&&s.group!==f.g)return false;
    if(f.z!=='Qualquer'&&!m.z.includes(f.z))return false;
    if(f.e!=='Todos'&&!m.e.includes(f.e))return false;
    if(f.r!=='Todas'&&!m.r.includes(f.r))return false;
    if(f.st!=='Todos'){
      const code=statusInfo(s.status)[0];
      if(f.st==='ameacada'&&!['CR','EN','VU'].includes(code))return false;
      if(f.st==='atencao'&&code!=='NT')return false;
      if(f.st==='estavel'&&code!=='LC')return false;
      if(f.st==='indefinido'&&!['DD','NE'].includes(code))return false;
    }
    if(terms.length){
      const hay=speciesHaystack(s);
      if(!terms.every(t=>hay.includes(t)))return false;
    }
    return true;
  });
  const depthOf=s=>{const m=meta(s.id);if(m.d)return m.d[0];const r=depthRange(s.depth);return r?r[0]:0};
  const cmp={
    nome:(a,b)=>a.name.localeCompare(b.name,'pt-BR'),
    profundidade:(a,b)=>depthOf(a)-depthOf(b)||a.name.localeCompare(b.name,'pt-BR'),
    profundidadeDesc:(a,b)=>{const m=s=>{const x=meta(s.id);return x.d?x.d[1]:(depthRange(s.depth)||[0,0])[1]};return m(b)-m(a)||a.name.localeCompare(b.name,'pt-BR')},
    grupo:(a,b)=>a.group.localeCompare(b.group,'pt-BR')||a.name.localeCompare(b.name,'pt-BR'),
    status:(a,b)=>STATUS_ORDER[statusInfo(a.status)[0]]-STATUS_ORDER[statusInfo(b.status)[0]]||a.name.localeCompare(b.name,'pt-BR')
  }[f.sort]||cmpFallback;
  return arr.sort(cmp);
}
function cmpFallback(a,b){return a.name.localeCompare(b.name,'pt-BR')}

function activeChips(f){
  const out=[];
  if(f.q)out.push(['q','busca: “'+f.q+'”']);
  if(f.g!=='Todos')out.push(['g',f.g]);
  if(f.z!=='Qualquer')out.push(['z',(ZONE_META.find(x=>x.key===f.z)||{}).name||f.z]);
  if(f.e!=='Todos')out.push(['e',ECO_NAME[f.e]||f.e]);
  if(f.r!=='Todas')out.push(['r',(REGIONS.find(x=>x.id===f.r)||{}).name||f.r]);
  if(f.st!=='Todos')out.push(['st',{ameacada:'Ameaçada',atencao:'Quase ameaçada',estavel:'Pouco preocupante',indefinido:'Sem avaliação suficiente'}[f.st]]);
  if(!out.length)return '';
  return `<div class="filterChips">${out.map(([k,l])=>`<button class="fChip" onclick="clearFilter('${k}')">${esc(l)}<i aria-hidden="true">×</i><span class="visuallyHidden">remover filtro</span></button>`).join('')}<button class="fChip clearAll" onclick="clearFilter('all')">Limpar tudo</button></div>`;
}
function clearFilter(k){
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v};
  if(k==='q'||k==='all')set('speciesQuery','');
  if(k==='g'||k==='all')set('speciesGroup','Todos');
  if(k==='z'||k==='all')set('speciesZone','Qualquer');
  if(k==='e'||k==='all')set('speciesEco','Todos');
  if(k==='r'||k==='all')set('speciesBasin','Todas');
  if(k==='st'||k==='all')set('speciesStatus','Todos');
  renderSpecies();
}
const SOURCE_HOSTS={'fisheries.noaa.gov':'NOAA Fisheries','oceanservice.noaa.gov':'NOAA Ocean Service',
 'ocean.si.edu':'Smithsonian Ocean','www.mbari.org':'MBARI','www.whoi.edu':'WHOI',
 'www.iucnredlist.org':'IUCN Red List','www.fishbase.se':'FishBase','www.marinespecies.org':'WoRMS',
 'www.fao.org':'FAO','www.ccamlr.org':'CCAMLR','coral.org':'Coral Reef Alliance'};
function sourceName(s){
  if(s.sourceLabel)return s.sourceLabel;
  const h=(String(s.source||'').match(/^https?:\/\/([^/]+)/)||[])[1];
  if(!h)return 'fonte';
  const bare=h.replace(/^www\./,'');
  return SOURCE_HOSTS[bare]||bare;
}
function depthNum(s){
  const m=meta(s.id),d=m.d||depthRange(s.depth);
  return d?`${d[0].toLocaleString('pt-BR')}–${d[1].toLocaleString('pt-BR')} m`:'não delimitada';
}
function sortBy(k){
  const sel=document.getElementById('speciesSort');
  if(!sel)return;
  sel.value=(sel.value===k&&k==='profundidade')?'profundidadeDesc':k;
  renderSpecies();
}
/* Modo cientista: o catálogo vira tabela de dados ordenável. */
function speciesTable(arr){
  const cur=document.getElementById('speciesSort')?.value||'nome';
  const th=(k,l,cls)=>`<th${cls?` class="${cls}"`:''} aria-sort="${cur.startsWith(k)?'ascending':'none'}"><button onclick="sortBy('${k}')">${l}</button></th>`;
  return `<div class="sciTableWrap"><table class="sciTable">
    <caption class="visuallyHidden">Catálogo de espécies com faixa de profundidade, categoria IUCN e fonte</caption>
    <thead><tr>
      <th scope="col" class="tPlain">Cat.</th>
      ${th('nome','Espécie')}
      ${th('grupo','Grupo')}
      ${th('profundidade','Faixa (m)')}
      <th scope="col" class="tPlain">Tamanho</th>
      ${th('status','IUCN')}
      <th scope="col" class="tPlain">Bacias</th>
      <th scope="col" class="tPlain">Fonte</th>
    </tr></thead>
    <tbody>${arr.map(s=>{
      const m=meta(s.id),[code,full,cls]=statusInfo(s.status);
      return `<tr>
        <td class="tCat">${catalogo(s)}</td>
        <th scope="row" class="tName"><a href="#/especies/${s.id}">${esc(s.name)}</a><em>${esc(s.sci)}</em></th>
        <td>${esc(s.group)}</td>
        <td class="tNum">${depthNum(s)}</td>
        <td class="tNum">${esc(s.size)}</td>
        <td><span class="iucn iucn-${cls}" title="${esc(full)}"><b>${code}</b></span></td>
        <td class="tReg">${m.r.map(r=>`<abbr title="${esc((REGIONS.find(x=>x.id===r)||{}).name||r)}">${esc((REGIONS.find(x=>x.id===r)||{}).short||r)}</abbr>`).join(' ')}</td>
        <td class="tSrc"><a href="${esc(s.source)}" target="_blank" rel="noreferrer">${esc(sourceName(s))}</a></td>
      </tr>`}).join('')}</tbody>
  </table></div>`;
}
function fieldCard(s){
  const m=meta(s.id),code=statusInfo(s.status)[0];
  return `<article class="fieldCard">
    <header><span class="fcId">${catalogo(s)}</span>${statusChip(s.status)}</header>
    <div class="fcVisual">${photoFrame(s.id,s.name+' — '+s.sci,art(s.type,'small'))}</div>
    <h3><a href="#/especies/${s.id}">${esc(s.name)}</a></h3>
    <em>${esc(s.sci)}</em>
    <dl class="fcRows">
      <div><dt>Grupo</dt><dd>${esc(s.group)}</dd></div>
      <div><dt>Habitat</dt><dd>${esc(s.habitat)}</dd></div>
      <div><dt>Profundidade</dt><dd>${esc(s.depth)}</dd></div>
      <div><dt>Alimentação</dt><dd>${esc(dietKind(s).join(', '))}</dd></div>
    </dl>
    ${depthProfile(s.depth)}
    ${s.facts&&s.facts[0]?`<p class="fcFact">${esc(s.facts[0])}</p>`:''}
    <div class="fcActions">
      <a href="#/especies/${s.id}">Abrir ficha</a>
      <button onclick="addToLog('${s.id}')">Diário</button>
    </div>
  </article>`;
}
function renderSpecies(){
  const f=speciesFilters(),arr=filterSpecies(f);
  const count=document.getElementById('speciesCount');
  if(count)count.textContent=`${arr.length} ${arr.length===1?'espécie encontrada':'espécies encontradas'}`;
  const chips=document.getElementById('speciesChips');
  if(chips)chips.innerHTML=activeChips(f);
  const el=document.getElementById('speciesGrid');
  if(!el)return;
  const vazio=`<div class="interaction" style="grid-column:1/-1"><h3>Nenhuma espécie corresponde a esta combinação.</h3><p class="subtle">Remova um filtro ou tente termos mais amplos: “abissal”, “recife”, “filtrador”, “ártico”, “bioluminescência”.</p><button class="btn" onclick="clearFilter('all')">Limpar filtros</button></div>`;
  const sci=modeIs('cientista');
  el.className=sci?'sciGrid':'speciesGrid fieldGrid';
  el.innerHTML=arr.length?(sci?speciesTable(arr):arr.map(fieldCard).join('')):vazio;
  applyPhotos();
}
function speciesPage(){
  const q=parseQuery();
  const pre={
    q:q.get('q')||'',
    g:q.get('grupo')||'Todos',
    z:q.get('zona')||'Qualquer',
    e:q.get('eco')||'Todos',
    r:q.get('bacia')||'Todas',
    st:q.get('status')||'Todos',
    sort:q.get('ordem')||'nome'
  };
  const groups=[...new Set(SPECIES.map(s=>s.group))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const sel=(v,cur)=>v===cur?' selected':'';
  const sci=modeIs('cientista');
  if(!q.get('ordem')&&sci)pre.sort='status';
  return `${pageHero('08 / ENCICLOPÉDIA',sci?'Catálogo de espécies.':'Espécies marinhas.',
    sci
      ?'Registro tabular de '+SPECIES.length+' táxons com faixa de profundidade em metros, categoria da Lista Vermelha da IUCN, bacias de ocorrência e fonte primária de cada linha.'
      :'Um catálogo de campo com '+SPECIES.length+' fichas, da superfície às fossas hadais. Pesquise por nome popular ou científico, grupo, ambiente, profundidade, alimentação ou estado de conservação.',
    'shark','page-species')}
<section class="section">
  <div class="eyebrowRow">
    <div>
      <span class="kicker">CATÁLOGO / ${SPECIES.length} ${sci?'REGISTROS':'FICHAS'}</span>
      <p class="subtle" style="margin:7px 0 0">${sci
        ?'Clique nos títulos das colunas para reordenar. Faixas de profundidade são intervalos de ocorrência registrada, não limites fisiológicos.'
        :'Os filtros são combináveis. Cada ficha indica onde a espécie vive, em que profundidade, a qual ecossistema pertence e qual missão do simulador se relaciona a ela.'}</p>
    </div>
    <span class="speciesCount" id="speciesCount">${SPECIES.length} espécies encontradas</span>
  </div>
  <div class="speciesFilters wide">
    <label class="searchBox"><span class="kicker">Buscar</span><input id="speciesQuery" value="${esc(pre.q)}" oninput="renderSpecies()" placeholder="tubarão, Physeter, hadal, filtrador, ártico…"></label>
    <label class="selectBox"><span class="kicker">Grupo</span><select id="speciesGroup" onchange="renderSpecies()"><option${sel('Todos',pre.g)}>Todos</option>${groups.map(x=>`<option${sel(x,pre.g)}>${esc(x)}</option>`).join('')}</select></label>
    <label class="selectBox"><span class="kicker">Profundidade</span><select id="speciesZone" onchange="renderSpecies()"><option value="Qualquer"${sel('Qualquer',pre.z)}>Qualquer</option>${ZONE_META.map(z=>`<option value="${z.key}"${sel(z.key,pre.z)}>${esc(z.name)}</option>`).join('')}</select></label>
    <label class="selectBox"><span class="kicker">Ambiente</span><select id="speciesEco" onchange="renderSpecies()"><option value="Todos"${sel('Todos',pre.e)}>Todos</option>${Object.keys(ECO_NAME).map(k=>`<option value="${k}"${sel(k,pre.e)}>${esc(ECO_NAME[k])}</option>`).join('')}</select></label>
    <label class="selectBox"><span class="kicker">Bacia</span><select id="speciesBasin" onchange="renderSpecies()"><option value="Todas"${sel('Todas',pre.r)}>Todas</option>${REGIONS.map(r=>`<option value="${r.id}"${sel(r.id,pre.r)}>${esc(r.name)}</option>`).join('')}</select></label>
    <label class="selectBox"><span class="kicker">Conservação</span><select id="speciesStatus" onchange="renderSpecies()"><option value="Todos"${sel('Todos',pre.st)}>Todos</option><option value="ameacada"${sel('ameacada',pre.st)}>Ameaçada (CR/EN/VU)</option><option value="atencao"${sel('atencao',pre.st)}>Quase ameaçada</option><option value="estavel"${sel('estavel',pre.st)}>Pouco preocupante</option><option value="indefinido"${sel('indefinido',pre.st)}>Sem avaliação suficiente</option></select></label>
    <label class="selectBox"><span class="kicker">Ordenar por</span><select id="speciesSort" onchange="renderSpecies()"><option value="nome"${sel('nome',pre.sort)}>Nome</option><option value="profundidade"${sel('profundidade',pre.sort)}>Profundidade (rasa → funda)</option><option value="profundidadeDesc"${sel('profundidadeDesc',pre.sort)}>Profundidade (funda → rasa)</option><option value="grupo"${sel('grupo',pre.sort)}>Grupo</option><option value="status"${sel('status',pre.sort)}>Estado de conservação</option></select></label>
  </div>
  <div id="speciesChips"></div>
  <div id="speciesGrid" class="${sci?'sciGrid':'speciesGrid fieldGrid'}"></div>
  <p class="small sourceNote">Cada ficha indica sua fonte principal. Categorias de conservação seguem a Lista Vermelha da IUCN e podem mudar entre avaliações e entre populações.</p>
  ${sciNote('Ressalvas: tamanhos são máximos relatados, não médias populacionais; faixas de profundidade combinam registros de captura, marcação e observação direta, com esforço amostral desigual entre táxons; categorias DD e NE indicam ausência de avaliação global, não ausência de risco.')}
  <div class="modeStrip"><span class="kicker">Modo de leitura</span>${modePanel()}</div>
</section>
<div class="modeStrip section" style="padding-top:0"><span class="kicker">Modo de leitura</span>${modePanel()}</div>

${flowTrail('especie')}`;
}

/* ---------- ficha detalhada ---------- */
function addToLog(id){
  const log=getLog(),novo=!log.species.includes(id);
  markSpecies(id);
  const s=speciesById(id);
  toast(novo?`${s?s.name:'Espécie'} registrada no diário`:`${s?s.name:'Espécie'} já estava no diário`);
}
function connectionsBlock(s){
  const m=meta(s.id);
  const zones=m.z.map(z=>ZONE_META.find(x=>x.key===z)).filter(Boolean);
  const regions=m.r.map(r=>REGIONS.find(x=>x.id===r)).filter(Boolean);
  const missions=m.m.map(id=>(typeof PHASES!=='undefined'?PHASES.find(p=>p.id===id):null)).filter(Boolean);
  return `<section class="section connectSection">
    <div class="sectionTitle"><span class="kicker">Conexões</span><h2 class="h2">Esta ficha não vive sozinha.</h2><p class="lede">Cada espécie é um ponto de entrada para o resto do atlas: a bacia onde ocorre, a faixa da coluna d’água, o ecossistema e a missão que reproduz aquele ambiente.</p></div>
    <div class="connectGrid">
      <article class="connectCard">
        <span class="kicker">Onde encontrar</span>
        <p>${regions.length?regions.map(r=>esc(r.name)).join(' · '):'Distribuição não indexada'}</p>
        <div class="chipRow tight">${regions.map(r=>`<a class="ecoChip" href="#/oceano?bacia=${r.id}">${esc(r.name)}</a>`).join('')}</div>
        <a class="open" href="#/mapa">Abrir o mapa oceânico →</a>
      </article>
      <article class="connectCard">
        <span class="kicker">Em que profundidade</span>
        ${depthProfile(s.depth,false)||'<p class="subtle">Faixa não delimitada nas fontes consultadas.</p>'}
        <div class="chipRow tight">${zones.map(z=>`<a class="ecoChip" href="#/zonas?z=${z.idx}">${esc(z.name)}</a>`).join('')}</div>
        <a class="open" href="#/zonas">Ver as zonas de profundidade →</a>
      </article>
      <article class="connectCard">
        <span class="kicker">Seu ecossistema</span>
        <div class="chipRow tight">${m.e.length?m.e.map(e=>`<a class="ecoChip" href="#/ecossistemas">${esc(ECO_NAME[e]||e)}</a>`).join(''):'<span class="subtle small">Não indexado</span>'}</div>
        <p class="small">${esc(m.env||'')}</p>
        <a class="open" href="#/ecossistemas">Abrir ecossistemas →</a>
      </article>
      <article class="connectCard">
        <span class="kicker">Missões relacionadas</span>
        ${missions.length?`<ul class="missionList">${missions.map(p=>`<li><b>${esc(p.id)}</b> ${esc(p.name)}<span>${esc(p.zone)} · ${esc(p.depthLabel)}</span></li>`).join('')}</ul>`:'<p class="subtle small">Sem missão equivalente no simulador.</p>'}
        <a class="open" href="#/jogo">Abrir o simulador de ROV →</a>
      </article>
      <article class="connectCard wide">
        <span class="kicker">Registrar no diário</span>
        <p>Guarde esta ficha no seu Diário de Bordo e acompanhe quantas espécies você já documentou.</p>
        <div class="basinActions">
          <button class="btn primary" onclick="addToLog('${s.id}')">Adicionar ao diário</button>
          <a class="btn" href="#/diario">Abrir diário de bordo</a>
        </div>
      </article>
    </div>
  </section>`;
}
function relatedSpecies(s){
  const m=meta(s.id);
  const score=x=>{const n=meta(x.id);let v=0;
    if(x.group===s.group)v+=3;
    v+=n.z.filter(z=>m.z.includes(z)).length*2;
    v+=n.e.filter(e=>m.e.includes(e)).length*2;
    v+=n.r.filter(r=>m.r.includes(r)).length;
    return v};
  return SPECIES.filter(x=>x.id!==s.id).map(x=>[x,score(x)]).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
}
/* Bloco exclusivo do modo cientista: tudo o que é medida, código ou
   ressalva de método fica reunido aqui. */
function quantBlock(s){
  if(!modeIs('cientista'))return '';
  const m=meta(s.id),d=m.d||depthRange(s.depth)||null;
  const[code,full]=statusInfo(s.status);
  const zonas=m.z.map(z=>(ZONE_META.find(x=>x.key===z)||{}).name).filter(Boolean);
  const bacias=m.r.map(r=>(REGIONS.find(x=>x.id===r)||{}).name).filter(Boolean);
  return `<section class="section quantSection">
    <div class="sectionTitle"><span class="kicker">Dados quantitativos</span><h2 class="h2">Medidas e categorias.</h2></div>
    <div class="quantGrid">
      <div class="quantItem"><span>Faixa de profundidade</span><b>${d?`${d[0].toLocaleString('pt-BR')} – ${d[1].toLocaleString('pt-BR')} m`:'não delimitada'}</b><small>${esc(s.depth)}</small></div>
      <div class="quantItem"><span>Pressão na cota máxima</span><b>${d?'≈ '+Math.round(1+d[1]/10).toLocaleString('pt-BR')+' atm':'—'}</b><small>1 atm a cada 10 m de coluna d’água</small></div>
      <div class="quantItem"><span>Posição na coluna</span><b>${d?depthPos(d[0]).toFixed(1)+'% – '+depthPos(d[1]).toFixed(1)+'%':'—'}</b><small>escala de 0 a 11.000 m</small></div>
      <div class="quantItem"><span>Zonas pelágicas</span><b>${zonas.join(', ')||'—'}</b><small>${m.z.join(' · ')||''}</small></div>
      <div class="quantItem"><span>Bacias de ocorrência</span><b>${bacias.join(', ')||'—'}</b><small>${m.r.length} de ${REGIONS.length} bacias indexadas</small></div>
      <div class="quantItem"><span>Categoria IUCN</span><b>${code} — ${esc(full)}</b><small>${esc(s.status)}</small></div>
      <div class="quantItem"><span>Registro no catálogo</span><b>${catalogo(s)}</b><small>identificador interno do ABYSSAL</small></div>
      <div class="quantItem"><span>Fonte primária</span><b><a href="${esc(s.source)}" target="_blank" rel="noreferrer">${esc(sourceName(s))}</a></b><small>${esc(s.source)}</small></div>
    </div>
    ${sciNote('O tamanho informado é o máximo relatado na literatura consultada, não uma média populacional. Faixas de profundidade reúnem registros de captura, marcação eletrônica e observação por veículo submarino, com esforço amostral muito desigual entre táxons. A categoria da IUCN vale para a avaliação global mais recente e pode divergir de avaliações regionais.')}
  </section>`;
}
