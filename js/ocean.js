function ocean(){
  const q=parseQuery(),wanted=q.get('bacia');
  if(wanted&&BASINS.some(b=>b.id===wanted))oceanBasin=wanted;
  oceanLayer=0;
  return `${pageHero('03 / O OCEANO','Um planeta azul, em movimento.','O oceano não é um cenário de fundo: é um sistema físico, químico e biológico único, que redistribui calor, gases e vida entre bacias que só parecem separadas no mapa.','whale','page-ocean')}

<section class="section oScaleSection reveal" id="oceano-escala">
  <div class="sectionTitle"><span class="kicker">A / O oceano em escala</span><h2 class="h2">Seis medidas que explicam quase tudo.</h2><p class="lede">Profundidade, extensão, temperatura, salinidade, pressão e circulação. Nenhuma delas age sozinha — juntas, definem onde a vida marinha pode existir.</p></div>
  <div class="oScale">
    ${oceanScaleFigure()}
    <div class="oScaleData">
      ${[['Extensão','71','%','da superfície do planeta','Cerca de 361 milhões de km² de água conectada.'],
         ['Profundidade média','3.700','m','abaixo do nível do mar','A maior parte do oceano é escura, fria e permanentemente sob alta pressão.'],
         ['Ponto mais profundo','11.000','m','na Fossa das Marianas','Se o Everest fosse colocado ali, ainda sobrariam mais de dois quilômetros de água acima do topo.'],
         ['Salinidade média','35','g/kg','de sais dissolvidos','A densidade da água depende dessa mistura — e a densidade comanda a circulação.'],
         ['Temperatura','−2 a 30','°C','de variação entre regiões','Abaixo de mil metros, quase todo o oceano fica entre 0 e 4 °C.'],
         ['Circulação profunda','1.000','anos','para uma volta completa','A água que afunda hoje nos polos volta à superfície séculos depois.']
        ].map(([lab,num,unit,sub,txt],i)=>`
      <article class="oStat" style="--i:${i}">
        <span class="oStatLabel">${lab}</span>
        <strong class="oStatNum"><span class="countUp" data-count="${num.replace(/[^\d,.-]/g,'')}">${num}</span><i>${unit}</i></strong>
        <span class="oStatSub">${sub}</span>
        <p>${txt}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="section reveal" id="oceano-bacias">
  <div class="sectionTitle"><span class="kicker">B / As grandes bacias</span><h2 class="h2">Cinco nomes, um oceano só.</h2><p class="lede">As bacias trocam água, calor e organismos continuamente. Separá-las é uma conveniência de mapa — e ainda assim cada uma tem clima, relevo e vida com identidade própria.</p></div>
  <div class="basinTabs" id="basinTabs" role="tablist" aria-label="Bacias oceânicas">
    ${BASINS.map(b=>`<button role="tab" data-basin="${b.id}" aria-selected="${b.id===oceanBasin?'true':'false'}" class="${b.id===oceanBasin?'active':''}" onclick="setBasin('${b.id}')"><b>${esc(b.name)}</b><span>${esc(b.mean)} médios</span></button>`).join('')}
  </div>
  ${basinPanel()}
</section>

<section class="section reveal" id="oceano-movimento">
  <div class="sectionTitle"><span class="kicker">C / Movimento do oceano</span><h2 class="h2">A água nunca fica parada.</h2><p class="lede">O vento empurra a superfície. A densidade comanda o fundo. Entre os dois, o oceano funciona como uma esteira lenta que redistribui calor do equador para os polos e devolve água fria pelo fundo.</p></div>
  <div class="oCurrents">
    ${currentsFigure()}
    <div class="oCurrentNotes">
      ${[['Correntes de superfície','Movidas pelo vento e desviadas pela rotação da Terra, formam grandes giros em cada bacia.'],
         ['Afundamento polar','Ao esfriar e ficar mais salgada, a água ganha densidade e mergulha, alimentando o oceano profundo.'],
         ['Distribuição de calor','O trópico recebe mais energia solar do que devolve; o oceano exporta esse excedente para latitudes altas.'],
         ['Superfície e profundidade','O que acontece embaixo depende do que afundou lá em cima — séculos atrás, em outro hemisfério.']
        ].map(([t,d])=>`<article class="oNote"><h3>${t}</h3><p>${d}</p></article>`).join('')}
    </div>
  </div>
</section>

<section class="section oLayersSection reveal" id="oceano-camadas">
  <div class="sectionTitle"><span class="kicker">D / Camadas do oceano</span><h2 class="h2">Desça pela coluna d’água.</h2><p class="lede">Escolha uma cota e veja o que muda: luz, temperatura, pressão, alimento disponível e quem consegue viver ali.</p></div>
  <div class="oLayers">
    <div class="layerColumn" id="layerColumn" style="--dive:0%">
      <div class="layerRail" id="layerRail" role="tablist" aria-label="Profundidade">
        ${OCEAN_LAYERS.map((L,i)=>`<button role="tab" data-layer="${i}" aria-selected="${i===0?'true':'false'}" class="layerStep${i===0?' active':''}" style="top:${depthPos(L.m).toFixed(1)}%" onclick="setLayer(${i})"><b>${esc(L.label)}</b><span>${esc(L.zname)}</span></button>`).join('')}
      </div>
      <i class="layerDot" aria-hidden="true"></i>
    </div>
    ${layerPanel()}
  </div>
</section>

<section class="section reveal" id="oceano-clima">
  <div class="sectionTitle"><span class="kicker">E / O oceano e o clima</span><h2 class="h2">O maior regulador do planeta.</h2><p class="lede">A água tem uma capacidade térmica altíssima e está em contato direto com a atmosfera. Isso transforma o oceano num amortecedor climático — que também paga o preço por isso.</p></div>
  <div class="oClimate">
    ${CLIMATE_FLOWS.map(c=>`<article class="climateCard" data-k="${c.k}">
      <div class="climateGauge" style="--pct:${Math.min(100,c.k==='transporte'?100:c.val)}">
        <strong><span class="countUp" data-count="${c.val}">${c.val.toLocaleString('pt-BR')}</span>${c.unit}</strong>
        <span>${c.cap}</span>
      </div>
      <h3>${c.title}</h3>
      <p>${c.text}</p>
    </article>`).join('')}
  </div>
  <div class="oGasExchange">
    <span class="kicker">Troca de gases na interface</span>
    <div class="gasRow">
      <div class="gasSide"><b>Atmosfera</b><span>CO₂ · O₂ · calor</span></div>
      <div class="gasArrows" aria-hidden="true"><i class="down"></i><i class="up"></i></div>
      <div class="gasSide"><b>Oceano</b><span>gases dissolvidos · carbono orgânico</span></div>
    </div>
    <p class="small">Parte do carbono absorvido é incorporada por organismos e afunda com detritos e carapaças — o mecanismo conhecido como bomba biológica de carbono.</p>
  </div>
</section>

<section class="section reveal" id="oceano-habitats">
  <div class="sectionTitle"><span class="kicker">F / Um oceano, muitos habitats</span><h2 class="h2">Do manguezal à fonte hidrotermal.</h2><p class="lede">Mudam a luz, o substrato, o fluxo e a fonte de energia. Cada combinação seleciona um conjunto diferente de organismos.</p></div>
  <div class="oHabitats">
    ${ECO.map(e=>{const key=e[3],sp=speciesByEco(key,3);return `<article class="habCard">
      <div class="habVisual">${photoFrame('eco-'+key,e[0],art(key,'small'))}</div>
      <div class="habBody">
        <h3>${esc(e[0])}</h3>
        <p>${esc(e[1])}</p>
        <div class="habTags">${e[2].split(' · ').map(t=>`<span>${esc(t)}</span>`).join('')}</div>
        ${sp.length?`<div class="chipRow tight">${sp.map(s=>`<a class="specChip mini" href="#/especies/${s.id}">${esc(s.name)}</a>`).join('')}</div>`:''}
        <a class="open" href="#/ecossistemas">Abrir ecossistema →</a>
      </div>
    </article>`}).join('')}
  </div>
</section>

<section class="section reveal" id="oceano-dados">
  <div class="sectionTitle"><span class="kicker">G / Dados oceanográficos</span><h2 class="h2">Números de referência.</h2><p class="lede">Valores aproximados e médias globais, úteis como escala de comparação. Condições locais podem variar muito.</p></div>
  <div class="oData">
    ${OCEAN_DATA.map(d=>`<article class="dataMod">
      <span class="dataKey">${d.k}</span>
      <strong>${d.v}</strong>
      <span class="dataSub">${d.s}</span>
      <i class="dataBar"><u style="width:${d.bar}%"></u></i>
      <p class="small">${d.note}</p>
      ${sciNote(d.method)}
    </article>`).join('')}
  </div>
  <p class="small sourceNote">Referências gerais: NOAA Ocean Service, NOAA Fisheries, Smithsonian Ocean e MBARI. Ver <a href="#/fontes">Fontes</a>.</p>
  ${sciNote('Todos os números desta página são médias globais ou ordens de grandeza, arredondados para leitura. Valores locais podem divergir por uma ordem de magnitude, sobretudo em regiões costeiras, polares e de ressurgência.')}
  ${expNote('Os valores acima são médias do planeta inteiro. Uma praia, um estuário ou uma fossa se comportam de maneira bem diferente da média.')}
  <div class="modeStrip"><span class="kicker">Modo de leitura</span>${modePanel()}</div>
</section>

${flowTrail('oceano')}`;
}

/* ---------- microinterações da página ---------- */
function animateCount(el){
  const raw=el.dataset.count||'';
  const target=parseFloat(raw.replace(/\./g,'').replace(',','.'));
  if(!isFinite(target)||el.dataset.done)return;
  el.dataset.done='1';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const dec=(raw.split(',')[1]||'').length,t0=performance.now(),dur=900;
  const fmt=v=>v.toLocaleString('pt-BR',{minimumFractionDigits:dec,maximumFractionDigits:dec});
  const neg=raw.trim().startsWith('−')||raw.trim().startsWith('-');
  const step=now=>{
    const p=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=(neg?'−':'')+fmt(Math.abs(target)*e);
    if(p<1)requestAnimationFrame(step);else el.textContent=el.dataset.countText||fmt(target);
  };
  el.dataset.countText=el.textContent;
  el.textContent=fmt(0);
  requestAnimationFrame(step);
}
function initReveal(){
  if(oceanObs){oceanObs.disconnect();oceanObs=null}
  const targets=document.querySelectorAll('.reveal, .countUp');
  if(!targets.length)return;
  if(!('IntersectionObserver'in window)){targets.forEach(t=>t.classList.add('in'));return}
  oceanObs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      en.target.classList.add('in');
      if(en.target.classList.contains('countUp'))animateCount(en.target);
      oceanObs.unobserve(en.target);
    });
  },{rootMargin:'0px 0px -12% 0px',threshold:.15});
  targets.forEach(t=>oceanObs.observe(t));
}
function initOcean(){
  initReveal();
  setLayer(0);
}
function flowTrail(active){
  const steps=[['O oceano','/oceano','oceano'],['Mapa','/mapa','mapa'],['Ecossistema','/ecossistemas','eco'],['Espécie','/especies','especie'],['Profundidade','/zonas','zona'],['Jogo','/jogo','jogo'],['Diário','/diario','diario']];
  return `<nav class="flowTrail" aria-label="Fluxo de exploração do atlas">
    <span class="kicker">Trilha do atlas</span>
    <ol>${steps.map(([n,u,k])=>`<li class="${k===active?'here':''}"><a href="#${u}">${n}</a></li>`).join('')}</ol>
  </nav>`;
}
