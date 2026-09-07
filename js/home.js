function home(){const d=dailyDiscovery(),log=getLog();return `<section class="hero"><div class="heroCopy"><span class="kicker">Atlas digital de biologia marinha</span><h1 class="display" style="margin-top:18px">ABYSSAL</h1><p class="lede">O oceano ocupa 71% da superfície do planeta e concentra a maior parte do seu espaço habitável. Este atlas percorre essa coluna d\u2019água inteira — da luz costeira às fossas onde a pressão passa de 600 atmosferas.</p><div class="heroActions"><a class="btn primary" href="#/especies">Ver as espécies</a><a class="btn" href="#/zonas">Descer pela coluna d\u2019água</a><a class="btn" href="#/jogo">Pilotar o ROV</a></div><dl class="heroFacts"><div><dt>71%</dt><dd>da superfície da Terra é oceano</dd></div><div><dt>11 km</dt><dd>ponto mais profundo conhecido</dd></div><div><dt>~200 m</dt><dd>onde a fotossíntese deixa de sustentar a vida</dd></div></dl></div><div class="heroArt"><div class="oceanSphere"><i class="r1"></i><i class="r2"></i><i class="r3"></i><span class="beam"></span></div></div></section>

<div class="ticker"><div><span>Zona iluminada</span><b>0–200 m</b></div><div><span>Zona crepuscular</span><b>200–1.000 m</b></div><div><span>Mar profundo</span><b>1.000–6.000 m</b></div><div><span>Hadal</span><b>6.000 m +</b></div></div>

<section class="section"><div class="consoleGrid"><div class="atlasConsole"><span class="kicker">Central de exploração</span><h2 class="h2" style="margin:14px 0 10px;font-size:clamp(1.9rem,3vw,2.7rem)">Escolha como investigar.</h2><p class="subtle" style="margin:0 0 18px;line-height:1.7">O atlas guarda o que você já visitou. Escolha como quer ler: o modo muda o conteúdo das páginas, não só a aparência.</p>${modePanel()}<div class="commandLinks"><a class="commandLink" href="#/profundezas"><b>Descer</b><span>Percorra a coluna d\u2019água.</span></a><a class="commandLink" href="#/mapa"><b>Mapear</b><span>Escolha uma bacia oceânica.</span></a><a class="commandLink" href="#/diario"><b>Registrar</b><span>Abra seu diário de bordo.</span></a></div></div><div class="discoveryCard"><span class="discoveryCode">${d.type}</span><h3>${d.title}</h3><p class="subtle">${d.text}</p><div class="discoveryMeta"><span class="pill">${d.depth}</span><a class="btn" style="padding:8px 12px" href="#${d.type==='ESPÉCIE'?'/especies':'/profundezas'}">Investigar</a></div></div></div><div class="atlasStats"><div class="atlasStat"><strong>${log.species.length}</strong><span>espécies vistas</span></div><div class="atlasStat"><strong>${log.missions.length}</strong><span>fases concluídas</span></div><div class="atlasStat"><strong>${log.map.length}</strong><span>bacias visitadas</span></div><div class="atlasStat"><strong>${log.discoveries||0}</strong><span>registros no diário</span></div></div></section>

<section class="section"><div class="sectionTitle"><span class="kicker">Coluna d\u2019água</span><h2 class="h2">A profundidade reorganiza a vida.</h2><p class="lede">Luz, temperatura, pressão e disponibilidade de alimento mudam de forma tão brusca que cada faixa funciona como um bioma separado.</p></div><ol class="waterColumn">${ZONES.map((z,i)=>`<li class="wcRow wc${i}"><div class="wcBar" aria-hidden="true"></div><div class="wcBody"><span class="wcRange">${esc(z.range)}</span><h3>${esc(z.name)}</h3><p>${esc(z.note)}</p><dl class="wcMeta"><div><dt>Luz</dt><dd>${esc(z.light)}</dd></div><div><dt>Pressão</dt><dd>${esc(z.pressure)}</dd></div><div><dt>Energia</dt><dd>${esc(z.energy)}</dd></div></dl></div><a class="wcLink" href="#/zonas?z=${i}">Abrir zona</a></li>`).join('')}</ol></section>

<section class="section"><div class="sectionTitle"><span class="kicker">Campo de estudo</span><h2 class="h2">Não é só sobre animais.</h2><p class="lede">Ecologia, fisiologia, oceanografia, conservação e engenharia se encontram para explicar um planeta coberto majoritariamente por água.</p></div><div class="grid3"><article class="interaction"><span class="kicker">Ecologia</span><h3>Quem come quem.</h3><p class="subtle">Produtores, consumidores e decompositores numa teia que se reorganiza conforme a profundidade e a estação.</p><a class="btn" href="#/cadeia-alimentar">Abrir a teia</a></article><article class="interaction"><span class="kicker">Espécies</span><h3>Os habitantes.</h3><p class="subtle">Fichas com habitat, faixa de profundidade, dieta, comportamento, ameaças e estado de conservação.</p><a class="btn" href="#/especies">Abrir o catálogo</a></article><article class="interaction"><span class="kicker">Tecnologia</span><h3>Como chegamos lá.</h3><p class="subtle">ROVs, AUVs, sonar multifeixe e submersíveis tripulados transformam o inacessível em objeto de pesquisa.</p><a class="btn" href="#/exploracao">Ver as ferramentas</a></article></div></section>`}
function pageHero(kicker,title,text,type,photoKey){return `<section class="pageHero"><div><span class="kicker">${kicker}</span><h1 class="display" style="margin-top:17px;font-size:clamp(3.2rem,6vw,7rem)">${title}</h1><p class="lede">${text}</p></div><div class="pageArt">${photoKey?photoFrame(photoKey,title,art(type),'big'):art(type)}</div></section>`}
/* ============================================================
   O OCEANO — capítulo do atlas
   Escala · bacias · circulação · coluna d’água · clima · habitats
   ============================================================ */
const BASINS=[
{id:'pacifico',name:'Pacífico',area:'≈165 milhões km²',mean:'≈4.000 m',max:'Fossa das Marianas, ≈11.000 m',
 climate:'Domina a variabilidade climática global. O ciclo El Niño–La Niña redistribui calor e chuva por todo o planeta.',
 traits:'A maior e mais profunda bacia. Suas bordas concentram fossas, arcos de ilhas e vulcanismo — o chamado Anel de Fogo.',
 curio:'Sozinho, cobre mais superfície do que todas as terras emersas somadas.',
 eco:['reef','open','vent','seabed','kelp'],
 note:'Do recife tropical raso à fossa hadal: nenhuma outra bacia cobre uma amplitude tão grande de ambientes.'},
{id:'atlantico',name:'Atlântico',area:'≈85 milhões km²',mean:'≈3.600 m',max:'Fossa de Porto Rico, ≈8.400 m',
 climate:'A circulação de revolvimento do Atlântico transporta calor para o norte e influencia o clima da Europa e das Américas.',
 traits:'Estreito e alongado, cortado ao meio pela Dorsal Mesoatlântica, onde placas se afastam e nasce crosta oceânica nova.',
 curio:'O Mar dos Sargaços é o único mar do planeta sem costas: seus limites são correntes.',
 eco:['open','reef','mangrove','estuary','seabed'],
 note:'Bacia com grandes plataformas continentais, estuários extensos e uma das pescarias mais estudadas do mundo.'},
{id:'indico',name:'Índico',area:'≈70 milhões km²',mean:'≈3.700 m',max:'Fossa de Java, ≈7.200 m',
 climate:'Único oceano com circulação superficial que inverte de sentido a cada semestre, acompanhando as monções.',
 traits:'Águas superficiais entre as mais quentes do planeta, fechado ao norte por continentes e aberto ao sul para o Antártico.',
 curio:'A inversão das monções altera a ressurgência e, com ela, a produtividade de regiões inteiras.',
 eco:['reef','mangrove','seagrass','open'],
 note:'Recifes, manguezais e pradarias marinhas formam um mosaico costeiro contínuo em grande parte da bacia.'},
{id:'artico',name:'Ártico',area:'≈14 milhões km²',mean:'≈1.200 m',max:'Bacia Eurasiana, ≈5.500 m',
 climate:'Coberto por gelo marinho sazonal. Aquece várias vezes mais rápido que a média global.',
 traits:'A menor e mais rasa das bacias, com plataformas continentais muito largas e uma camada superficial pouco salgada.',
 curio:'A água doce do degelo e dos rios cria uma tampa de baixa salinidade que dificulta a mistura vertical.',
 eco:['open','seabed'],
 note:'A vida polar acompanha o gelo: algas crescem sob a camada congelada e sustentam toda a cadeia acima.'},
{id:'antartico',name:'Antártico',area:'≈22 milhões km²',mean:'≈3.300 m',max:'Fossa das Sandwich do Sul, ≈7.200 m',
 climate:'A Corrente Circumpolar Antártica isola termicamente o continente e conecta as demais bacias.',
 traits:'Não tem barreira continental a leste ou oeste: a água circula sem obstáculos ao redor da Antártica.',
 curio:'Águas frias e densas afundam aqui e alimentam o fundo de todos os outros oceanos.',
 eco:['open','seabed','vent'],
 note:'Ressurgência intensa e enxames de krill sustentam baleias, focas e aves marinhas em escala continental.'}
];
const OCEAN_LAYERS=[
{m:0,label:'Superfície',zone:'epi',zname:'Epipelágica',
 light:'Luz solar plena',lightPct:100,temp:'−2 °C a 30 °C',press:'1 atm',
 food:'Fotossíntese: o alimento é produzido aqui mesmo.',
 env:'Ondas, vento e mistura constante. Temperatura muda com a estação e com a hora do dia.'},
{m:200,label:'200 m',zone:'epi',zname:'Fim da zona iluminada',
 light:'Menos de 1% da luz de superfície',lightPct:8,temp:'≈10 °C a 15 °C',press:'≈21 atm',
 food:'A produção primária cessa. Começa a dependência do que afunda.',
 env:'A termoclina separa a água quente de cima da água fria de baixo. A partir daqui, a coluna escurece rápido.'},
{m:1000,label:'1.000 m',zone:'meso',zname:'Base da zona crepuscular',
 light:'Escuridão; a luz visível é produzida pelos próprios organismos',lightPct:1,temp:'≈4 °C a 5 °C',press:'≈101 atm',
 food:'Neve marinha e a migração vertical noturna trazem energia de cima.',
 env:'Em várias regiões existe aqui uma zona de mínimo de oxigênio, que filtra quem consegue viver na faixa.'},
{m:4000,label:'4.000 m',zone:'bati',zname:'Batipelágica / planície abissal',
 light:'Nenhuma luz solar',lightPct:0,temp:'≈2 °C',press:'≈401 atm',
 food:'Detritos escassos e irregulares; carcaças que afundam viram banquetes raros.',
 env:'Sedimento fino, temperatura estável e escuridão permanente. Metabolismos costumam ser lentos.'},
{m:6000,label:'6.000 m',zone:'abisso',zname:'Limite abissal',
 light:'Nenhuma luz solar',lightPct:0,temp:'≈1 °C a 2 °C',press:'≈601 atm',
 food:'Muito escasso. A energia disponível depende do que chega da superfície.',
 env:'Fim da planície abissal e início das fossas. Poucos vertebrados são registrados abaixo desta cota.'},
{m:11000,label:'11.000 m',zone:'hadal',zname:'Hadopelágica',
 light:'Nenhuma luz solar',lightPct:0,temp:'≈1 °C a 4 °C',press:'mais de 1.000 atm',
 food:'A gravidade concentra matéria orgânica no fundo estreito das fossas.',
 env:'Fossas oceânicas. A pressão equivale a centenas de vezes a atmosférica e molda toda a bioquímica local.'}
];
const CLIMATE_FLOWS=[
{k:'calor',title:'Armazenamento de calor',val:90,unit:'%',
 text:'O oceano absorveu a maior parte do excesso de calor retido no sistema climático. É por isso que a temperatura do ar sobe menos do que subiria sem ele.',
 cap:'do excesso de calor do sistema climático fica no oceano'},
{k:'carbono',title:'Absorção de carbono',val:25,unit:'%',
 text:'Parte do CO₂ lançado na atmosfera se dissolve na água. Esse gás reage e altera a química do mar: o pH da superfície caiu cerca de 0,1 unidade desde o período pré-industrial.',
 cap:'do CO₂ emitido por atividades humanas é absorvido pelo oceano'},
{k:'oxigenio',title:'Produção de oxigênio',val:50,unit:'%',
 text:'Fitoplâncton, cianobactérias e algas produzem oxigênio na camada iluminada. Organismos microscópicos fazem grande parte desse trabalho.',
 cap:'ou mais do oxigênio da Terra tem origem no oceano'},
{k:'transporte',title:'Transporte de calor',val:1000,unit:' anos',
 text:'Correntes profundas movem água fria e densa dos polos para o resto do planeta. Uma volta completa dessa circulação leva séculos.',
 cap:'é a ordem de grandeza de uma volta completa da circulação profunda'}
];
const OCEAN_DATA=[
{k:'PROFUNDIDADE',v:'11.000 m+',s:'ponto mais profundo conhecido',bar:100,note:'Média global: cerca de 3.700 m.',
 method:'Medições do Challenger Deep variam entre levantamentos por sonar multifeixe e descidas tripuladas; a incerteza é de dezenas de metros.'},
{k:'EXTENSÃO',v:'71%',s:'da superfície do planeta',bar:71,note:'Cerca de 361 milhões de km².',
 method:'O valor depende de onde se traça a linha de costa e de como se contabilizam plataformas de gelo e mares interiores.'},
{k:'TEMPERATURA',v:'−2 a 30 °C',s:'varia por região e profundidade',bar:46,note:'Abaixo de 1.000 m, quase sempre entre 0 e 4 °C.',
 method:'O mínimo negativo é possível porque a água salgada congela abaixo de 0 °C. Séries longas vêm de perfis CTD e da rede de flutuadores Argo.'},
{k:'SALINIDADE',v:'≈35 g/kg',s:'sais dissolvidos por quilo de água',bar:35,note:'Estuários e regiões polares ficam bem abaixo disso.',
 method:'Hoje se mede condutividade e se expressa em salinidade prática, uma razão sem unidade; g/kg é a leitura aproximada equivalente.'},
{k:'PRESSÃO',v:'+1 atm / 10 m',s:'aumenta de forma contínua',bar:88,note:'A 4.000 m, cerca de 400 vezes a pressão da superfície.',
 method:'Aproximação linear. A densidade cresce ligeiramente com a profundidade, então a pressão real fica pouco acima da estimativa simples.'},
{k:'LUZ',v:'0 a 200 m',s:'faixa onde há fotossíntese',bar:12,note:'Abaixo de 1.000 m, a única luz é biológica.',
 method:'O limite de 200 m é convencional. A profundidade fótica real varia de poucos metros em água turva a mais de 150 m em giros oligotróficos.'}
];
let oceanBasin='pacifico',oceanLayer=0,oceanObs=null;

function oceanScaleFigure(){
  return `<figure class="oScaleFig" aria-hidden="true">
    <svg viewBox="0 0 320 520" preserveAspectRatio="none" class="oScaleSvg">
      <defs><linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2ba0b8"/><stop offset=".16" stop-color="#12667d"/>
        <stop offset=".38" stop-color="#083c4f"/><stop offset=".66" stop-color="#04202c"/>
        <stop offset="1" stop-color="#010a10"/></linearGradient></defs>
      <rect x="0" y="0" width="320" height="520" fill="url(#colGrad)"/>
      ${[0,200,1000,4000,6000,11000].map(m=>{const y=8+depthPos(m)/100*504;return `<line x1="0" y1="${y.toFixed(1)}" x2="320" y2="${y.toFixed(1)}" stroke="rgba(124,240,198,.22)" stroke-width="1"/>`}).join('')}
    </svg>
    <div class="oScaleMarks">
      ${[[0,'superfície'],[200,'fim da luz'],[1000,'zona crepuscular'],[4000,'planície abissal'],[6000,'início das fossas'],[11000,'ponto mais profundo']].map(([m,l])=>`<span style="top:${depthPos(m).toFixed(1)}%"><b>${fmtM(m)}</b>${l}</span>`).join('')}
    </div>
  </figure>`;
}

function currentsFigure(){
  return `<figure class="oCurrentFig">
    <svg viewBox="0 0 900 400" role="img" aria-label="Diagrama esquemático da circulação oceânica: correntes quentes de superfície, resfriamento e afundamento nos polos, e retorno profundo.">
      <defs>
        <linearGradient id="warmG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffb37a"/><stop offset="1" stop-color="#ff8f76"/></linearGradient>
        <linearGradient id="coldG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#57c2e0"/><stop offset="1" stop-color="#2b7f9b"/></linearGradient>
        <linearGradient id="heatBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(87,194,224,.30)"/><stop offset=".5" stop-color="rgba(255,179,122,.34)"/><stop offset="1" stop-color="rgba(87,194,224,.30)"/></linearGradient>
      </defs>
      <rect x="40" y="26" width="820" height="348" rx="16" fill="url(#heatBand)" opacity=".5"/>
      <text x="52" y="48" class="cLbl">polo · água fria e densa</text>
      <text x="52" y="208" class="cLbl">equador · ganho de calor</text>
      <text x="52" y="366" class="cLbl">polo · água fria e densa</text>
      <line x1="40" y1="118" x2="860" y2="118" stroke="rgba(124,240,198,.18)" stroke-dasharray="4 7"/>
      <text x="770" y="112" class="cLbl">superfície</text>
      <text x="770" y="300" class="cLbl">fundo</text>
      <path id="warmPath" d="M120 300 C 300 300 340 200 470 196 C 620 192 700 118 800 96" fill="none" stroke="url(#warmG)" stroke-width="7" stroke-linecap="round" opacity=".92"/>
      <path id="coldPath" d="M800 96 C 840 150 830 250 700 286 C 540 330 300 330 120 300" fill="none" stroke="url(#coldG)" stroke-width="7" stroke-linecap="round" opacity=".85" stroke-dasharray="14 10"/>
      <g class="cFlow">
        ${Array.from({length:7},(_,i)=>`<circle r="4.5" fill="#ffd9b8"><animateMotion dur="9s" begin="${(i*1.28).toFixed(2)}s" repeatCount="indefinite"><mpath href="#warmPath"/></animateMotion></circle>`).join('')}
        ${Array.from({length:6},(_,i)=>`<circle r="4" fill="#9de6ff"><animateMotion dur="11s" begin="${(i*1.83).toFixed(2)}s" repeatCount="indefinite"><mpath href="#coldPath"/></animateMotion></circle>`).join('')}
      </g>
      <g class="cSink">
        <path d="M800 104 l0 34 m-9 -12 l9 12 9 -12" stroke="#9de6ff" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="742" y="76" class="cLbl">afunda</text>
      </g>
      <g class="cRise">
        <path d="M170 268 l0 -34 m-9 12 l9 -12 9 12" stroke="#ffd9b8" stroke-width="3" fill="none" stroke-linecap="round"/>
        <text x="146" y="296" class="cLbl">ressurge</text>
      </g>
    </svg>
    <figcaption class="small">Esquema simplificado. A circulação real envolve vento, rotação da Terra, salinidade, relevo do fundo e trocas entre bacias.</figcaption>
  </figure>`;
}

function basinPanel(){
  const b=BASINS.find(x=>x.id===oceanBasin)||BASINS[0];
  const sp=speciesByRegion(b.id,6);
  return `<div class="basinPanel" id="basinPanel">
    <div class="basinMain">
      <span class="kicker">${esc(b.name)}</span>
      <h3 class="h3">${esc(b.traits)}</h3>
      <p>${esc(b.note)}</p>
      ${modeIs('cientista')
        ?`<dl class="basinQuant"><div><dt>Espécies indexadas</dt><dd>${speciesByRegion(b.id).length} de ${SPECIES.length}</dd></div><div><dt>Zonas representadas</dt><dd>${[...new Set(speciesByRegion(b.id).flatMap(s=>meta(s.id).z))].length} de ${ZONE_META.length}</dd></div><div><dt>Ecossistemas mapeados</dt><dd>${b.eco.length} de ${Object.keys(ECO_NAME).length}</dd></div></dl>`
        :`<p class="basinCurio"><b>Curiosidade</b> ${esc(b.curio)}</p>`}
      <div class="basinActions">
        <button class="btn primary" onclick="markMap('${esc(b.name)}');go('/mapa')">Explorar região no mapa</button>
        <a class="btn" href="#/especies?bacia=${b.id}">Ver as ${speciesByRegion(b.id).length} espécies desta bacia</a>
      </div>
    </div>
    <div class="basinSide">
      <div class="basinPhoto">${photoFrame('basin-'+b.id,'Oceano '+b.name,art('whale','small'))}</div>
      <dl class="basinFacts">
        <div><dt>Extensão</dt><dd>${esc(b.area)}</dd></div>
        <div><dt>Profundidade média</dt><dd>${esc(b.mean)}</dd></div>
        <div><dt>Ponto mais profundo</dt><dd>${esc(b.max)}</dd></div>
      </dl>
      <div class="basinBlock"><span class="kicker">Clima</span><p>${esc(b.climate)}</p></div>
      <div class="basinBlock"><span class="kicker">Ecossistemas</span>
        <div class="chipRow tight">${b.eco.map(e=>`<a class="ecoChip" href="#/ecossistemas">${esc(ECO_NAME[e]||e)}</a>`).join('')}</div>
      </div>
      <div class="basinBlock"><span class="kicker">Espécies relacionadas</span>${speciesChips(sp,6)}</div>
    </div>
  </div>`;
}
function setBasin(id){
  oceanBasin=id;
  const p=document.getElementById('basinPanel');
  if(p)p.outerHTML=basinPanel();
  document.querySelectorAll('#basinTabs [data-basin]').forEach(b=>{
    const on=b.dataset.basin===id;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');
  });
}

function layerPanel(){
  const L=OCEAN_LAYERS[oceanLayer],sp=speciesByZone(L.zone,5);
  return `<div class="layerPanel" id="layerPanel" style="--lp:${L.lightPct}">
    <div class="layerHead">
      <span class="kicker">${esc(L.zname)}</span>
      <strong>${esc(L.label)}</strong>
    </div>
    <div class="layerMeters">
      <div class="lm"><span>Luz</span><b>${esc(L.light)}</b><i class="lmBar"><u style="width:${L.lightPct}%"></u></i></div>
      <div class="lm"><span>Temperatura</span><b>${esc(L.temp)}</b></div>
      <div class="lm"><span>Pressão</span><b>${esc(L.press)}</b></div>
    </div>
    ${modeIs('cientista')?`<dl class="layerQuant"><div><dt>Cota</dt><dd>${L.m.toLocaleString('pt-BR')} m</dd></div><div><dt>Pressão estimada</dt><dd>≈ ${Math.round(1+L.m/10).toLocaleString('pt-BR')} atm</dd></div><div><dt>Posição na coluna</dt><dd>${depthPos(L.m).toFixed(1)}% de 11.000 m</dd></div><div><dt>Espécies indexadas na zona</dt><dd>${speciesByZone(L.zone).length}</dd></div></dl>`:''}
    <div class="layerText">
      <div><span class="kicker">Alimento</span><p>${esc(L.food)}</p></div>
      <div><span class="kicker">Ambiente</span><p>${esc(L.env)}</p></div>
    </div>
    <div class="layerSpecies">
      <span class="kicker">Quem é encontrado nesta faixa</span>
      ${speciesChips(sp,5)}
      <a class="open" href="#/especies?zona=${L.zone}">Ver todas as espécies desta zona →</a>
    </div>
  </div>`;
}
function setLayer(i){
  oceanLayer=Math.max(0,Math.min(OCEAN_LAYERS.length-1,Number(i)||0));
  const p=document.getElementById('layerPanel');
  if(p)p.outerHTML=layerPanel();
  const col=document.getElementById('layerColumn');
  if(col)col.style.setProperty('--dive',depthPos(OCEAN_LAYERS[oceanLayer].m).toFixed(1)+'%');
  document.querySelectorAll('#layerRail [data-layer]').forEach((b,idx)=>{
    const on=idx===oceanLayer;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');
  });
  const hz=document.getElementById('headerZone');
  if(hz)hz.textContent=OCEAN_LAYERS[oceanLayer].zname.toLowerCase();
}
