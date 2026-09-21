let rovState=null,rovFrame=null,activeMission=null;

/* ====================== FASES ======================
   Cada fase tem terreno, iluminação, correnteza, perigos e
   objetivos próprios. Nada é reaproveitado entre elas. */
const SAMPLE_LABELS={
  CTD:'perfil de temperatura e salinidade',eDNA:'vestígio genético na água',
  IMAGEM:'registro fotográfico',RELEVO:'varredura do relevo',SONAR:'anomalia acústica',
  VENT:'fluido hidrotermal',CORAL:'colônia de coral',KELP:'dossel de kelp',
  PLANCTON:'arrasto de plâncton',SEDIMENTO:'testemunho de sedimento',
  BIOLUZ:'foco de bioluminescência',FAUNA:'fauna de fossa'
};
const PHASES=[
{id:'F01',name:'Recife da plataforma',zone:'Epipelágica',depthLabel:'0 – 180 m',
 target:180,returnDepth:45,sonarDepth:60,energy:100,light:1,pulses:99,echo:9,
 terrain:'reef',current:0,pressure:0,hazard:null,
 samples:['CORAL','CTD','IMAGEM','eDNA'],
 brief:'Mergulho de treinamento sobre o recife. Colete as quatro amostras e retorne acima de 45 m.',
 lesson:'Na zona iluminada há luz suficiente para fotografia e para a fotossíntese dos corais.',
 sky:['#0e7c86','#0a5b6b','#074454','#06303e'],floor:'#0a3b3a'},

{id:'F02',name:'Zona crepuscular',zone:'Mesopelágica',depthLabel:'200 – 1.000 m',
 target:1000,returnDepth:250,sonarDepth:520,energy:96,light:.46,pulses:8,echo:7,
 terrain:'openwater',current:.32,pressure:0,hazard:'jelly',
 samples:['PLANCTON','BIOLUZ','eDNA','CTD','IMAGEM'],
 brief:'A luz acaba. Desça até 1.000 m, use o sonar abaixo de 520 m e recupere cinco amostras.',
 lesson:'Aqui acontece a maior migração diária de biomassa do planeta — e a luz vem dos próprios animais.',
 sky:['#0a4a5c','#073241','#05202c','#03151d'],floor:'#04202a'},

{id:'F03',name:'Cânion submarino',zone:'Batipelágica',depthLabel:'0 – 1.800 m',
 target:1800,returnDepth:400,sonarDepth:900,energy:92,light:.34,pulses:5,echo:6,
 terrain:'canyon',current:.85,pressure:0,hazard:null,corridor:{freq:.011,amp:250,gap0:150,gapAmp:26,gapFreq:.017},
 samples:['RELEVO','SEDIMENTO','RELEVO','IMAGEM'],
 brief:'Corredor estreito com correnteza lateral. Siga o cânion até 1.800 m e mapeie quatro pontos.',
 lesson:'Cânions submarinos canalizam sedimento da plataforma para o mar profundo.',
 sky:['#08404f','#062c39','#041c26','#020f16'],floor:'#062028'},

{id:'F04',name:'Campo hidrotermal',zone:'Batipelágica',depthLabel:'2.500 m',
 target:2500,returnDepth:600,sonarDepth:1900,energy:88,light:.30,pulses:6,echo:7,
 terrain:'vents',current:.2,pressure:0,hazard:'plume',
 samples:['VENT','VENT','eDNA','CTD','FAUNA'],
 brief:'Chaminés ativas expelem fluido superaquecido. Colete cinco amostras sem atravessar as plumas.',
 lesson:'As comunidades das fontes vivem de quimiossíntese: energia química, não luz solar.',
 sky:['#073744','#052733','#031a24','#010e14'],floor:'#0a1f22'},

{id:'F05',name:'Planície abissal',zone:'Abissopelágica',depthLabel:'4.200 m',
 target:4200,returnDepth:800,sonarDepth:3400,energy:78,light:.22,pulses:5,echo:7,
 terrain:'plain',current:.15,pressure:.007,hazard:null,
 samples:['SEDIMENTO','FAUNA','eDNA','RELEVO','IMAGEM','CTD'],
 brief:'Bateria curta, alvos espalhados. Planeje a rota: seis amostras com 74% de energia.',
 lesson:'A planície abissal cobre mais da metade do fundo do planeta e vive do que cai lá de cima.',
 sky:['#052b38','#031d27','#02131b','#01090e'],floor:'#0c1a1e'},

{id:'F06',name:'Fossa hadal',zone:'Hadopelágica',depthLabel:'7.800 m',
 target:7800,returnDepth:1200,sonarDepth:6500,energy:82,light:.16,pulses:4,echo:4,
 terrain:'trench',current:1.25,pressure:.011,hazard:'jelly',corridor:{freq:.008,amp:180,gap0:120,gapAmp:22,gapFreq:.023},
 samples:['FAUNA','SEDIMENTO','eDNA','BIOLUZ','CTD'],
 brief:'Pressão extrema, correnteza forte e só três pulsos de sonar. Última descida.',
 lesson:'Abaixo de 6.000 m a pressão passa de 600 atmosferas e a fauna é altamente especializada.',
 sky:['#04222d','#03161f','#010c12','#000508'],floor:'#0a1418'},

/* ---------- expedições especiais ----------
   Liberadas depois de percorrer a coluna d'água inteira. Cada uma trata
   de um ambiente oceânico real que as seis primeiras não cobrem, com
   margem de energia e de sonar mais apertada. */

{id:'F07',name:'Monte submarino',zone:'Batipelágica',depthLabel:'1.500 m',
 target:1500,returnDepth:350,sonarDepth:760,energy:80,light:.32,pulses:4,echo:5,
 terrain:'canyon',current:1.05,pressure:0,hazard:null,corridor:{freq:.013,amp:210,gap0:142,gapAmp:24,gapFreq:.019},
 samples:['RELEVO','CORAL','FAUNA','eDNA','CTD','IMAGEM'],
 brief:'O monte desvia a corrente e a acelera nos flancos. Contorne a encosta até 1.500 m e recolha seis amostras.',
 lesson:'Montes submarinos desviam correntes profundas para cima, trazendo nutrientes e concentrando vida numa área pequena.',
 sky:['#08414e','#052b38','#031b25','#020e15'],floor:'#093034'},

{id:'F08',name:'Mínimo de oxigênio',zone:'Mesopelágica',depthLabel:'900 m',
 target:900,returnDepth:220,sonarDepth:520,energy:74,light:.24,pulses:3,echo:8,
 terrain:'openwater',current:.5,pressure:.010,hazard:'jelly',
 samples:['CTD','PLANCTON','eDNA','BIOLUZ','IMAGEM','FAUNA'],
 brief:'Camada pobre em oxigênio: os sensores gastam mais e há só três pulsos. Seis amostras, margem curta.',
 lesson:'Em algumas regiões o oxigênio quase desaparece entre 200 e 1.000 m; poucos organismos, altamente especializados, permanecem ali.',
 sky:['#06323f','#04222d','#03161e','#010b10'],floor:'#03171f'},

{id:'F09',name:'Queda de baleia',zone:'Abissopelágica',depthLabel:'3.400 m',
 target:3400,returnDepth:700,sonarDepth:2700,energy:72,light:.20,pulses:4,echo:7,
 terrain:'plain',current:.25,pressure:.006,hazard:null,
 samples:['FAUNA','SEDIMENTO','eDNA','IMAGEM','CTD','RELEVO','BIOLUZ'],
 brief:'Uma carcaça no fundo sustenta uma comunidade inteira. Sete amostras espalhadas, 72% de energia.',
 lesson:'A carcaça de um grande cetáceo alimenta sucessões de organismos no fundo abissal por décadas.',
 sky:['#052833','#031a23','#021119','#01080c'],floor:'#0b181c'},

{id:'F10',name:'Fossa Challenger',zone:'Hadopelágica',depthLabel:'10.900 m',
 target:10900,returnDepth:1500,sonarDepth:9000,energy:76,light:.13,pulses:3,echo:4,
 terrain:'trench',current:1.45,pressure:.013,hazard:'jelly',corridor:{freq:.0075,amp:165,gap0:126,gapAmp:20,gapFreq:.021},
 samples:['FAUNA','SEDIMENTO','eDNA','CTD','RELEVO','BIOLUZ'],
 brief:'O ponto mais profundo conhecido do oceano. Corrente máxima, três pulsos, sem margem para erro.',
 lesson:'O fundo da Fossa das Marianas fica por volta de 10.900 m: mais de mil atmosferas de pressão.',
 sky:['#031c26','#02121a','#01090e','#000305'],floor:'#081116'}
];
activeMission=PHASES[0];

const CANVAS_TOP=52,CANVAS_BOT=612,CANVAS_W=1200;
function seedRand(seed){let s=(seed*2654435761)>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function phaseIndex(){return Math.max(0,PHASES.indexOf(activeMission))}
function phaseUnlocked(i){if(i===0)return true;const log=getLog();return log.missions.includes(PHASES[i-1].id)}
function phaseDone(i){return getLog().missions.includes(PHASES[i].id)}
function corridorAt(y){const c=activeMission.corridor;if(!c)return null;const cx=600+Math.sin(y*c.freq)*c.amp;const g=c.gap0+Math.sin(y*c.gapFreq)*c.gapAmp;return[cx-g,cx+g,cx]}
function depthToY(m){return CANVAS_TOP+(m/activeMission.target)*(CANVAS_BOT-CANVAS_TOP)}
function yToDepth(y){return Math.max(0,Math.round((y-CANVAS_TOP)/(CANVAS_BOT-CANVAS_TOP)*activeMission.target))}

/* ---------- garantia de passagem ----------
   Nas fases de corredor (F03 cânion, F06 fossa) as rochas eram sorteadas
   em torno do eixo do corredor, sem verificar se sobrava faixa navegável.
   Duas rochas próximas fechavam a passagem por completo e a fase virava
   impossível: o espaço alcançável terminava em 926 m na F03 e em 2.451 m
   na F06, muito antes do alvo.

   Agora cada rocha é encostada na parede mais próxima e, se ainda assim a
   faixa livre ficar menor que LANE_MIN, o raio da rocha é reduzido. Isso
   preserva o desenho do cânion e a dificuldade, garantindo que sempre
   exista rota. */
const ROV_R=22, LANE_MIN=110;
function corridorBounds(ph,y){
  const c=ph.corridor; if(!c)return null;
  const cx=600+Math.sin(y*c.freq)*c.amp, g=c.gap0+Math.sin(y*c.gapFreq)*c.gapAmp;
  return [cx-g,cx+g,cx];
}
function ensurePassable(ph,rocks){
  if(!ph.corridor)return rocks;
  rocks.sort((a,b)=>a.y-b.y);
  let ladoAnterior=0, yAnterior=-1e9;
  for(const r of rocks){
    const b=corridorBounds(ph,r.y), largura=b[1]-b[0];
    const raioMax=Math.max(8,(largura-2*ROV_R-LANE_MIN)/2);
    if(r.r>raioMax)r.r=raioMax;
    let lado = r.x<b[2] ? -1 : 1;
    /* rochas verticalmente próximas vão para a MESMA parede: em paredes
       opostas elas estreitariam o vão central a poucos pixels */
    if(r.y-yAnterior < 130) lado = ladoAnterior || lado;
    r.x = lado<0 ? b[0]+r.r : b[1]-r.r;
    ladoAnterior=lado; yAnterior=r.y;
  }
  return rocks;
}

/* ---------- geração do mundo, específica por terreno ---------- */
function buildWorld(ph){
  const R=seedRand(ph.id.charCodeAt(1)*97+ph.target),rocks=[],hazards=[],fauna=[],props=[];
  const H=CANVAS_BOT,W=CANVAS_W;
  if(ph.terrain==='reef'){
    for(let i=0;i<16;i++){const x=70+R()*1060,y=H-30-R()*120;rocks.push({x,y,r:16+R()*22,rot:R()*6,kind:'coral'})}
    for(let i=0;i<14;i++)props.push({x:60+R()*1080,y:H-10,h:70+R()*140,sway:R()*6,kind:'kelp'});
    for(let i=0;i<12;i++)fauna.push({x:80+R()*1040,y:120+R()*380,v:(R()>.5?1:-1)*(.5+R()*.8),s:7+R()*8,kind:'fish'});
  }else if(ph.terrain==='openwater'){
    for(let i=0;i<6;i++)rocks.push({x:120+R()*960,y:200+R()*330,r:14+R()*14,rot:R()*6,kind:'rock'});
    for(let i=0;i<9;i++)hazards.push({x:100+R()*1000,y:150+R()*400,r:30+R()*16,dmg:.30,kind:'jelly',ph:R()*6,vy:(R()>.5?1:-1)*.22,vx:(R()>.5?1:-1)*.3});
    for(let i=0;i<20;i++)fauna.push({x:60+R()*1080,y:100+R()*470,v:(R()>.5?1:-1)*(.3+R()*.5),s:4+R()*5,kind:'lantern'});
  }else if(ph.terrain==='canyon'){
    for(let i=0;i<9;i++){const y=140+R()*430,b=corridorAt(y);rocks.push({x:b[2]+(R()-.5)*140,y,r:16+R()*14,rot:R()*6,kind:'rock'})}
    for(let i=0;i<8;i++){const y=150+R()*400,b=corridorAt(y);fauna.push({x:b[2]+(R()-.5)*180,y,v:(R()>.5?1:-1)*.4,s:6+R()*6,kind:'fish'})}
  }else if(ph.terrain==='vents'){
    for(let i=0;i<5;i++){
      const x=170+i*220+R()*60,hgt=70+R()*70;
      props.push({x,y:H-18,h:hgt,kind:'chimney'});
      hazards.push({x,y:H-18-hgt-46,r:34,dmg:.62,kind:'plume',ph:R()*6,hgt});
    }
    for(let i=0;i<12;i++)rocks.push({x:60+R()*1080,y:H-40-R()*160,r:14+R()*18,rot:R()*6,kind:'rock'});
    for(let i=0;i<16;i++)fauna.push({x:80+R()*1040,y:H-60-R()*150,v:(R()>.5?1:-1)*.22,s:5+R()*4,kind:'shrimp'});
  }else if(ph.terrain==='plain'){
    for(let i=0;i<10;i++)rocks.push({x:70+R()*1060,y:H-26-R()*70,r:18+R()*24,rot:R()*6,kind:'boulder'});
    for(let i=0;i<7;i++)props.push({x:80+R()*1040,y:H-14,h:16+R()*14,kind:'crinoid'});
    for(let i=0;i<6;i++)fauna.push({x:100+R()*1000,y:H-80-R()*180,v:(R()>.5?1:-1)*.2,s:8+R()*7,kind:'fish'});
  }else{ /* trench */
    for(let i=0;i<7;i++){const y=150+R()*420,b=corridorAt(y);rocks.push({x:b[2]+(R()-.5)*110,y,r:15+R()*11,rot:R()*6,kind:'rock'})}
    for(let i=0;i<7;i++){const y=180+R()*380,b=corridorAt(y);hazards.push({x:b[2]+(R()-.5)*120,y,r:24,dmg:.30,kind:'jelly',ph:R()*6,vy:.18,vx:(R()>.5?1:-1)*.2})}
    for(let i=0;i<8;i++){const y=150+R()*420,b=corridorAt(y);fauna.push({x:b[2]+(R()-.5)*140,y,v:(R()>.5?1:-1)*.25,s:5+R()*4,kind:'amphipod'})}
  }
  return {rocks:ensurePassable(ph,rocks),hazards,fauna,props};
}
function placeSamples(ph,world){
  /* Distribuição das amostras.
     Antes eram sorteadas quase livremente e frequentemente caíam
     próximas umas das outras — dava para recolher várias sem navegar.
     Agora cada amostra ocupa uma faixa de profundidade própria e precisa
     respeitar uma distância mínima das demais. A separação alvo sai da
     área útil do terreno e só é afrouxada se o espaço não comportar,
     de modo que a fase nunca fica impossível de montar. */
  const R=seedRand(ph.target+ph.samples.length*13),out=[];
  /* A faixa onde as amostras podem nascer começa abaixo da profundidade
     do sonar. Em fases cujo sonar libera muito fundo (F05, F06, F09, F10)
     isso reduzia a faixa a menos de 70px de altura e empilhava todas as
     amostras no rodapé — o que tornava a coleta trivial. Agora a faixa
     tem altura mínima garantida, então a rota cobre a coluna de verdade. */
  const yMax=CANVAS_BOT-22, alturaMin=.58*(CANVAS_BOT-CANVAS_TOP);
  const yMin=Math.max(CANVAS_TOP+30,Math.min(depthToY(ph.sonarDepth)+26,yMax-alturaMin));
  const n=ph.samples.length, faixa=yMax-yMin;
  const larguraUtil=ph.corridor?250:1060;
  let sep=Math.min(340,Math.sqrt(Math.max(1,larguraUtil*faixa)/n)*0.95);
  ph.samples.forEach((type,i)=>{
    let x=600,y=(yMin+yMax)/2,tentativas=0,ok=false;
    const banda=(i+.5)/n;
    do{
      const desvio=(R()-.5)*(0.9/n);
      const t=Math.max(0,Math.min(1,banda+desvio));
      y=yMin+faixa*t;
      if(ph.corridor){
        const b=corridorAt(y);
        x=b[2]+(R()-.5)*Math.max(40,(b[1]-b[0])-110);
      }else{
        x=90+R()*1020;
      }
      x=Math.max(70,Math.min(1130,x));
      const distante=out.every(o=>Math.hypot(x-o.px,y-o.py)>=sep);
      const desimpedida=!world.rocks.some(r=>Math.hypot(x-r.x,y-r.y)<r.r+42);
      ok=distante&&desimpedida;
      tentativas++;
      if(tentativas%40===0)sep*=.85;   /* afrouxa aos poucos se não couber */
    }while(!ok&&tentativas<400);
    out.push({type,id:type,label:SAMPLE_LABELS[type]||'amostra',
      px:Math.max(60,Math.min(1140,x)),py:Math.max(90,Math.min(CANVAS_BOT-18,y)),got:false,pulse:0});
  });
  return out;
}


function selectPhase(i){
  i=Math.max(0,Math.min(PHASES.length-1,Number(i)||0));
  if(!phaseUnlocked(i)){toast('Conclua a fase '+PHASES[i-1].id+' para liberar esta.');return}
  activeMission=PHASES[i];resetROVGame();renderPhaseList();
}
function selectMission(i){selectPhase(i)}

function renderPhaseList(){
  const el=document.getElementById('phaseList');if(!el)return;
  el.innerHTML=PHASES.map((ph,i)=>{
    const open=phaseUnlocked(i),done=phaseDone(i),cur=i===phaseIndex();
    return `<button class="phaseCard${cur?' current':''}${done?' done':''}${open?'':' locked'}" ${open?'':'disabled aria-disabled="true"'} onclick="selectPhase(${i})">
      <span class="phaseNum">${ph.id}</span>
      <b>${esc(ph.name)}</b>
      <span class="phaseZone">${esc(ph.zone)} · ${esc(ph.depthLabel)}</span>
      <span class="phaseTags">${ph.samples.length} amostras · ${ph.pulses>50?'sonar livre':ph.pulses+' pulsos'}${ph.hazard?' · '+(ph.hazard==='plume'?'plumas':'águas-vivas'):''}${ph.current>.6?' · correnteza':''}</span>
      <span class="phaseFlag">${done?'concluída':open?(cur?'selecionada':'disponível'):'bloqueada'}</span>
    </button>`}).join('');
}

function resetROVGame(){
  if(rovFrame){cancelAnimationFrame(rovFrame);rovFrame=null}
  exitGameFullscreen();
  const c=document.getElementById('rovCanvas'); if(!c)return;
  const ph=activeMission,world=buildWorld(ph);
  const startB=ph.corridor?corridorAt(CANVAS_TOP+18):null;
  rovState={running:false,x:startB?startB[2]:110,y:CANVAS_TOP+18,depth:0,data:0,energy:ph.energy,goal:ph.samples.length,
    target:ph.target,returnDepth:ph.returnDepth,sonarDepth:ph.sonarDepth,phase:'DESCIDA',keys:{},
    items:placeSamples(ph,world),rocks:world.rocks,hazards:world.hazards,fauna:world.fauna,props:world.props,
    bubble:0,time:0,startTime:0,sonar:0,pulse:0,pulsesLeft:ph.pulses,hit:0,won:false,returnReady:false,
    sonarUnlocked:false,alarm:0,drift:0,maxDepth:0};
  updateMissionCopy();updateGameUI();drawROV();
  const hint=document.getElementById('gameHint');
  if(hint){hint.style.display='grid';hint.innerHTML=`<div class="overlayIcon">◈</div><strong>${esc(ph.id)} · ${esc(ph.name)}</strong><span>${esc(ph.brief)}</span>`}
  const b=document.getElementById('gameStart'); if(b){b.disabled=false;b.textContent='Iniciar descida'}
  const rb=document.getElementById('gameFinishBtn'); if(rb)rb.disabled=true;
  document.getElementById('rovGame')?.classList.remove('gameWon');
}
function startROVGame(){
  if(!rovState)resetROVGame();
  if(!rovState)return;
  if(rovState.won||rovState.energy<=0)resetROVGame();
  rovState.running=true; if(!rovState.startTime)rovState.startTime=performance.now();
  const s=document.getElementById('gameStart');if(s)s.disabled=true;
  const h=document.getElementById('gameHint');if(h)h.style.display='none';
  enterGameFullscreen();
  rovLoop();
}
function toggleROVPause(){
  if(!rovState)return;
  rovState.running=!rovState.running;
  if(rovState.running){rovLoop()}else if(rovFrame){cancelAnimationFrame(rovFrame);rovFrame=null}
  const hint=document.getElementById('gameHint');
  if(hint){hint.style.display=rovState.running?'none':'grid';
    if(!rovState.running)hint.innerHTML='<div class="overlayIcon">II</div><strong>Missão pausada</strong><span>Pressione P para retomar</span>'}
  const st=document.getElementById('gameState');
  if(st)st.textContent=rovState.running?'Sistema · missão retomada':'Sistema · pausado';
}

async function enterGameFullscreen(){
  const el=document.documentElement;
  if(document.fullscreenElement)return;
  try{if(el.requestFullscreen)await el.requestFullscreen({navigationUI:'hide'});else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();}catch(err){toast('O navegador bloqueou a tela cheia. Use o botão Tela cheia durante a missão.')}
  updateFullscreenButton();
}
async function exitGameFullscreen(){
  try{if(document.fullscreenElement&&document.exitFullscreen)await document.exitFullscreen();else if(document.webkitFullscreenElement&&document.webkitExitFullscreen)document.webkitExitFullscreen();}catch(err){}
  updateFullscreenButton();
}
function toggleGameFullscreen(){
  if(document.fullscreenElement||document.webkitFullscreenElement)exitGameFullscreen();
  else enterGameFullscreen();
}
function updateFullscreenButton(){
  const b=document.getElementById('gameFullscreenBtn');
  if(!b)return;
  b.textContent=(document.fullscreenElement||document.webkitFullscreenElement)?'Sair da tela cheia ⛶':'Tela cheia ⛶';
}
addEventListener('fullscreenchange',updateFullscreenButton);

function endMission(reason){
  rovState.running=false;if(rovFrame){cancelAnimationFrame(rovFrame);rovFrame=null}
  const hint=document.getElementById('gameHint');
  const st=document.getElementById('gameStart');
  if(reason==='energy'){
    if(hint){hint.style.display='grid';hint.innerHTML='<div class="overlayIcon">!</div><strong>ROV sem energia</strong><span>O veículo ficou preso no fundo. Reinicie e escolha uma rota mais curta.</span>'}
    if(st){st.disabled=false;st.textContent='Tentar de novo'}
    const g=document.getElementById('gameState');if(g)g.textContent='Sistema · energia esgotada';
  }
}
function finishROV(force=false){
  if(!rovState)return;
  const ok=rovState.data>=rovState.goal&&rovState.depth<rovState.returnDepth;
  if(!ok)return;
  rovState.running=false;rovState.won=true;markMission(activeMission.id);
  /* conquistas: contabiliza o desempenho desta descida */
  if(typeof registrarMissao==='function'){
    registrarMissao({amostras:rovState.data,profMax:rovState.maxDepth,energia:rovState.energy,
      colisoes:rovState.hit,pulsosUsados:activeMission.pulses-rovState.pulsesLeft});
    checkAchievements();
  }
  if(rovFrame){cancelAnimationFrame(rovFrame);rovFrame=null}
  const i=phaseIndex(),next=PHASES[i+1];
  const hint=document.getElementById('gameHint');
  if(hint){hint.style.display='grid';
    hint.innerHTML=`<div class="overlayIcon">✦</div><strong>${esc(activeMission.id)} concluída</strong><span>${rovState.data} amostras · ${Math.round(rovState.energy)}% de energia restante</span><span class="overlayNote">${esc(activeMission.lesson)}</span>${next?`<button class="btn primary" onclick="selectPhase(${i+1})">Ir para ${next.id} · ${esc(next.name)}</button>`:'<span class="overlayNote">Você percorreu toda a coluna d\u2019água, da plataforma à fossa hadal.</span>'}`}
  const g=document.getElementById('gameState');if(g)g.textContent='Resultado · expedição concluída com '+Math.round(rovState.energy)+'% de energia';
  const st=document.getElementById('gameStart');if(st){st.disabled=false;st.textContent='Repetir fase'}
  const fb=document.getElementById('gameFinishBtn');if(fb)fb.disabled=true;
  document.getElementById('rovGame')?.classList.add('gameWon');
  renderPhaseList();
}
function rovLoop(){if(!rovState?.running)return;updateROV();drawROV();rovFrame=requestAnimationFrame(rovLoop)}

function updateROV(){
  const ph=activeMission,k=rovState.keys;
  let dx=(k.right||k.d)?1:0;dx-=(k.left||k.a)?1:0;
  let dy=(k.down||k.s)?1:0;dy-=(k.up||k.w)?1:0;
  if(!dx&&!dy)rovState.energy=Math.min(100,rovState.energy+.012);
  const boost=k.shift?1.6:1,speed=2.3*boost;
  if(dx&&dy){dx*=.72;dy*=.72}
  /* a deriva nunca pode superar o propulsor, senão o ROV fica preso
     contra a parede sem conseguir avançar */
  const derivaMax=2.3*.8;
  let deriva=ph.current?Math.sin(rovState.time*.7)*ph.current+Math.sin(rovState.time*.23)*ph.current*.6:0;
  rovState.drift=Math.max(-derivaMax,Math.min(derivaMax,deriva));
  const nx=Math.max(30,Math.min(1170,rovState.x+dx*speed+rovState.drift));
  const ny=Math.max(CANVAS_TOP,Math.min(CANVAS_BOT,rovState.y+dy*speed));
  /* colisão testada eixo a eixo: encostar na parede deixa de travar o
     movimento inteiro, o ROV desliza pela parede e continua descendo.
     Antes, um único eixo bloqueado cancelava também o outro — com a
     correnteza empurrando de lado, isso prendia o veículo no lugar. */
  const livre=(px,py)=>{
    const b=corridorAt(py);
    if(b&&(px<b[0]+ROV_R||px>b[1]-ROV_R))return false;
    for(const r of rovState.rocks)if(Math.hypot(px-r.x,py-r.y)<r.r+ROV_R)return false;
    return true;
  };
  let bateu=false;
  if(livre(nx,rovState.y))rovState.x=nx; else bateu=true;
  if(livre(rovState.x,ny))rovState.y=ny; else bateu=true;
  if(bateu){rovState.hit++;rovState.energy=Math.max(0,rovState.energy-(k.shift?.14:.06));rovState.alarm=12}
  rovState.depth=yToDepth(rovState.y);
  rovState.maxDepth=Math.max(rovState.maxDepth,rovState.depth);
  rovState.energy=Math.max(0,rovState.energy-(Math.abs(dx)+Math.abs(dy))*(k.shift?.046:.019));
  if(ph.pressure&&rovState.depth>ph.target*.7)rovState.energy=Math.max(0,rovState.energy-ph.pressure);
  rovState.bubble+=.7;rovState.time=(performance.now()-rovState.startTime)/1000;

  for(const h of rovState.hazards){
    if(h.kind==='jelly'){
      h.x+=h.vx;h.y+=h.vy;
      if(h.x<60||h.x>1140)h.vx*=-1;
      if(h.y<120||h.y>CANVAS_BOT-40)h.vy*=-1;
    }else{h.ph+=.05}
    if(Math.hypot(rovState.x-h.x,rovState.y-h.y)<h.r+18){
      rovState.energy=Math.max(0,rovState.energy-h.dmg);rovState.alarm=16;
    }
  }
  rovState.sonarUnlocked=rovState.depth>=ph.sonarDepth;
  /* O eco do sonar tem prazo. Antes, uma amostra revelada ficava marcada
     para sempre e bastava ir buscando com calma. Agora o marcador expira
     depois de ph.echo segundos e some da tela: ou você chega a tempo, ou
     memoriza a posição, ou gasta outro pulso. A amostra em si continua
     onde está — `vista` nunca é revogada — então a fase jamais trava por
     falta de pulsos. */
  for(const it of rovState.items){
    if(it.got)continue;
    const dist=Math.hypot(rovState.x-it.px,rovState.y-it.py);
    if(rovState.sonar>0&&dist<430){it.vista=true;it.ecoAte=rovState.time+(ph.echo||10)}
    /* contato visual: os faróis do ROV revelam o que passa bem ao lado,
       garantindo uma saída mesmo sem nenhum pulso sobrando */
    else if(!it.vista&&dist<80){it.vista=true;it.ecoAte=rovState.time+(ph.echo||10)}
    if(it.vista&&dist<48){
      it.got=true;it.pulse=1;rovState.data++;rovState.energy=Math.min(100,rovState.energy+6);
      toast('Amostra '+it.id+' recuperada');
    }
  }
  if(rovState.data>=rovState.goal)rovState.returnReady=true;
  rovState.phase=rovState.returnReady?'RETORNO':(rovState.sonarUnlocked?'COLETA':'DESCIDA');
  if(rovState.returnReady&&rovState.depth<rovState.returnDepth)finishROV();
  for(const f of rovState.fauna){f.x+=f.v;if(f.x<30||f.x>1170)f.v*=-1}
  if(rovState.sonar>0)rovState.sonar-=1;
  if(rovState.pulse>0)rovState.pulse-=1;
  if(rovState.alarm>0)rovState.alarm-=1;
  if(rovState.energy<=0)endMission('energy');
  updateGameUI();
}

function updateMissionCopy(){
  const ph=activeMission;
  const el=document.getElementById('gameMission');if(el)el.textContent=ph.id+' · '+ph.name;
  const sub=document.getElementById('missionSubtitle');if(sub)sub.textContent=ph.zone+' · '+ph.depthLabel;
  const mt=document.getElementById('missionText');if(mt)mt.textContent=ph.brief;
  const ls=document.getElementById('phaseLesson');if(ls)ls.textContent=ph.lesson;
}
function updateGameUI(){
  if(!rovState)return;
  const ph=activeMission;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
  const mins=String(Math.floor(rovState.time/60)).padStart(2,'0'),secs=String(Math.floor(rovState.time%60)).padStart(2,'0');
  set('gameDepth',rovState.depth.toLocaleString('pt-BR')+' m');
  set('gameData',rovState.data+' / '+rovState.goal);
  set('gameEnergy',Math.round(rovState.energy)+'%');
  set('gameTime',mins+':'+secs);
  set('energyText',Math.round(rovState.energy)+'%');
  set('zoneText',rovState.depth<200?'Epipelágica':rovState.depth<1000?'Mesopelágica':rovState.depth<4000?'Batipelágica':rovState.depth<6000?'Abissopelágica':'Hadopelágica');
  set('pulsesLeft',ph.pulses>50?'livre':rovState.pulsesLeft+' restantes');
  const ef=document.getElementById('energyFill');if(ef)ef.style.width=Math.max(0,rovState.energy)+'%';
  const zf=document.getElementById('zoneFill');if(zf)zf.style.width=Math.min(100,rovState.depth/rovState.target*100)+'%';
  const mt=document.getElementById('missionText');
  if(mt)mt.textContent=rovState.returnReady
    ?`Amostras completas. Suba acima de ${ph.returnDepth} m para extrair o ROV.`
    :rovState.sonarUnlocked
      ?`Sonar liberado. Faltam ${ph.samples.length-rovState.data} amostra(s).`
      :`Desça até ${ph.sonarDepth.toLocaleString('pt-BR')} m para liberar o sonar.`;
  set('missionStep1Text','Chegue a '+ph.sonarDepth.toLocaleString('pt-BR')+' m.');
  set('missionStep2Text','Recupere '+ph.samples.length+' amostras com o sonar.');
  set('missionStep3Text','Volte para menos de '+ph.returnDepth+' m.');
  set('sonarStatus',rovState.sonar>0?'Pulso ativo':rovState.sonarUnlocked?(rovState.pulsesLeft>0?'Pronto':'Sem pulsos'):'Bloqueado');
  set('sonarText',rovState.sonar>0?'Alvos próximos destacados no campo visual.'
    :rovState.sonarUnlocked?(rovState.pulsesLeft>0?'Espaço emite um pulso: o eco marca os alvos num raio de 430 m e apaga em '+(activeMission.echo||10)+' s. Chegue antes ou decore a posição.':'Os pulsos acabaram. Reinicie a fase.')
    :'O sonar só responde abaixo de '+ph.sonarDepth.toLocaleString('pt-BR')+' m.');
  const state=document.getElementById('gameState');
  if(state&&rovState.running)state.textContent=`Sistema · ${rovState.phase.toLowerCase()} · ${ph.zone.toLowerCase()}${rovState.drift?' · correnteza '+(rovState.drift>0?'leste':'oeste'):''}`;
  const fb=document.getElementById('gameFinishBtn');
  if(fb)fb.disabled=!(rovState.returnReady&&rovState.depth<ph.returnDepth);
  const wrap=document.getElementById('sampleList');
  if(wrap)wrap.innerHTML=rovState.items.map((it,i)=>`<div class="${it.got?'collected':''}"><span>${String(i+1).padStart(2,'0')}</span><b>${esc(it.id)}</b><em>${it.got?'recuperada':esc(it.label)}</em></div>`).join('');
  const steps=document.querySelectorAll('#missionSteps .missionStep');
  if(steps.length===3){
    const d1=rovState.sonarUnlocked,d2=rovState.data>=rovState.goal,d3=rovState.won;
    const cur=!d1?0:(!d2?1:2);
    [d1,d2,d3].forEach((done,i)=>{steps[i].classList.toggle('done',done);steps[i].classList.toggle('active',cur===i)});
  }
}
function pulseSonar(){
  if(!rovState?.running||rovState.energy<=0)return;
  const ph=activeMission;
  if(rovState.depth<ph.sonarDepth){
    const s=document.getElementById('gameState');
    if(s)s.textContent='Sonar bloqueado · desça até '+ph.sonarDepth.toLocaleString('pt-BR')+' m';
    return;
  }
  if(rovState.pulsesLeft<=0){toast('Sem pulsos de sonar nesta fase.');return}
  rovState.pulsesLeft--;rovState.sonar=95;rovState.pulse=30;rovState.energy=Math.max(0,rovState.energy-1.6);
  const flash=document.getElementById('sonarFlash');
  if(flash){flash.classList.remove('flash');void flash.offsetWidth;flash.classList.add('flash')}
}

/* ---------- desenho ---------- */
function drawROV(){
  const c=document.getElementById('rovCanvas');if(!c||!rovState)return;
  const x=c.getContext('2d'),w=c.width,h=c.height,ph=activeMission;
  x.clearRect(0,0,w,h);
  const bg=x.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,ph.sky[0]);bg.addColorStop(.3,ph.sky[1]);bg.addColorStop(.65,ph.sky[2]);bg.addColorStop(1,ph.sky[3]);
  x.fillStyle=bg;x.fillRect(0,0,w,h);

  // grade de profundidade com cotas reais da fase
  x.strokeStyle='rgba(124,240,198,.07)';x.lineWidth=1;
  x.fillStyle='rgba(150,200,205,.42)';x.font='500 9px ui-monospace,monospace';
  for(let i=1;i<=5;i++){
    const m=ph.target*i/5,yy=depthToY(m);
    x.beginPath();x.moveTo(0,yy);x.lineTo(w,yy);x.stroke();
    x.fillText(Math.round(m).toLocaleString('pt-BR')+' m',8,yy-5);
  }
  // linha do sonar
  const sy=depthToY(ph.sonarDepth);
  x.save();x.setLineDash([7,7]);x.strokeStyle='rgba(124,240,198,.32)';x.lineWidth=1.5;
  x.beginPath();x.moveTo(0,sy);x.lineTo(w,sy);x.stroke();x.restore();
  x.fillStyle='rgba(124,240,198,.6)';x.fillText('sonar liberado',w-110,sy-6);
  // linha de retorno
  const retY=depthToY(ph.returnDepth);
  x.save();x.setLineDash([3,6]);x.strokeStyle='rgba(255,207,134,.30)';x.beginPath();x.moveTo(0,retY);x.lineTo(w,retY);x.stroke();x.restore();
  x.fillStyle='rgba(255,207,134,.55)';x.fillText('cota de extração',w-118,retY+14);

  // fundo
  x.fillStyle=ph.floor;x.beginPath();x.moveTo(0,h-34);
  for(let i=0;i<=12;i++){const px=i*w/12;x.lineTo(px,h-34-Math.sin(i*1.1+ph.target*.001)*16-(ph.terrain==='plain'?4:14))}
  x.lineTo(w,h);x.lineTo(0,h);x.closePath();x.fill();

  // paredes do cânion / fossa
  if(ph.corridor){
    const wallGrad=x.createLinearGradient(0,0,0,h);
    wallGrad.addColorStop(0,'#0a2c36');wallGrad.addColorStop(1,'#050f16');
    x.fillStyle=wallGrad;
    x.beginPath();x.moveTo(0,0);
    for(let yy=0;yy<=h;yy+=10)x.lineTo(corridorAt(yy)[0],yy);
    x.lineTo(0,h);x.closePath();x.fill();
    x.beginPath();x.moveTo(w,0);
    for(let yy=0;yy<=h;yy+=10)x.lineTo(corridorAt(yy)[1],yy);
    x.lineTo(w,h);x.closePath();x.fill();
    x.strokeStyle='rgba(124,240,198,.16)';x.lineWidth=2;
    for(const side of [0,1]){x.beginPath();for(let yy=0;yy<=h;yy+=10){const p=corridorAt(yy)[side];yy?x.lineTo(p,yy):x.moveTo(p,yy)}x.stroke()}
  }
  // props de cenário
  for(const p of rovState.props||[]){
    if(p.kind==='kelp'){
      x.strokeStyle='rgba(120,190,120,.35)';x.lineWidth=5;x.beginPath();x.moveTo(p.x,p.y);
      x.quadraticCurveTo(p.x+Math.sin(rovState.bubble*.02+p.sway)*22,p.y-p.h*.6,p.x+Math.sin(rovState.bubble*.02+p.sway)*30,p.y-p.h);x.stroke();
    }else if(p.kind==='chimney'){
      x.fillStyle='#1a1512';x.strokeStyle='rgba(255,144,120,.45)';x.lineWidth=2;
      x.beginPath();x.moveTo(p.x-16,p.y);x.lineTo(p.x-6,p.y-p.h);x.lineTo(p.x+7,p.y-p.h);x.lineTo(p.x+17,p.y);x.closePath();x.fill();x.stroke();
    }else if(p.kind==='crinoid'){
      x.strokeStyle='rgba(205,182,148,.5)';x.lineWidth=2;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x,p.y-p.h);x.stroke();
      x.fillStyle='rgba(205,182,148,.5)';x.beginPath();x.arc(p.x,p.y-p.h,4,0,6.3);x.fill();
    }
  }
  // neve marinha
  for(let i=0;i<80;i++){
    const bx=(i*73+rovState.bubble*.6)%w,by=(i*127+rovState.bubble*1.1)%(h+40);
    x.fillStyle='rgba(196,235,232,'+(.07+(i%5)*.02)+')';
    x.beginPath();x.arc(bx,by,.8+(i%3)*.4,0,6.3);x.fill();
  }
  // fauna
  for(const f of rovState.fauna){
    x.save();x.translate(f.x,f.y);x.globalAlpha=f.kind==='lantern'?.6:.28;
    x.fillStyle=f.kind==='lantern'?'#9ef7d3':f.kind==='shrimp'?'#ffb59a':'#9dd8d4';
    x.beginPath();x.ellipse(0,0,f.s*1.4,f.s*.6,0,0,6.3);x.fill();
    x.beginPath();x.moveTo(-f.s,0);x.lineTo(-f.s*1.9,-f.s*.65);x.lineTo(-f.s*1.9,f.s*.65);x.closePath();x.fill();
    if(f.kind==='lantern'){x.globalAlpha=.9;x.beginPath();x.arc(f.s*.7,-f.s*.2,1.6,0,6.3);x.fill()}
    x.restore();
  }
  // rochas / paredes
  for(const r of rovState.rocks){
    x.save();x.translate(r.x,r.y);x.rotate(r.rot);
    x.fillStyle=r.kind==='coral'?'rgba(52,96,104,.95)':'rgba(9,32,42,.95)';
    x.strokeStyle=r.kind==='coral'?'rgba(255,168,150,.35)':'rgba(124,240,198,.12)';
    x.lineWidth=2;x.beginPath();
    x.moveTo(-r.r,r.r*.3);x.lineTo(-r.r*.65,-r.r*.7);x.lineTo(r.r*.15,-r.r);x.lineTo(r.r,r.r*.1);x.lineTo(r.r*.35,r.r);
    x.closePath();x.fill();x.stroke();x.restore();
  }
  // perigos
  for(const hz of rovState.hazards){
    if(hz.kind==='plume'){
      const g=x.createLinearGradient(hz.x,hz.y+40,hz.x,hz.y-60);
      g.addColorStop(0,'rgba(255,140,110,.34)');g.addColorStop(1,'rgba(90,80,110,0)');
      x.fillStyle=g;x.beginPath();
      x.moveTo(hz.x-20,hz.y+46);x.quadraticCurveTo(hz.x+Math.sin(hz.ph)*20,hz.y-20,hz.x-8,hz.y-70);
      x.lineTo(hz.x+12,hz.y-70);x.quadraticCurveTo(hz.x+Math.sin(hz.ph)*22+16,hz.y-20,hz.x+22,hz.y+46);
      x.closePath();x.fill();
    }else{
      x.save();x.translate(hz.x,hz.y);x.globalAlpha=.5;
      x.fillStyle='rgba(190,170,235,.55)';x.beginPath();x.arc(0,0,hz.r*.55,Math.PI,0);x.fill();
      x.strokeStyle='rgba(190,170,235,.5)';x.lineWidth=2;
      for(let t=-2;t<=2;t++){x.beginPath();x.moveTo(t*7,0);x.quadraticCurveTo(t*7+Math.sin(rovState.bubble*.05+t)*8,hz.r*.7,t*7,hz.r*1.25);x.stroke()}
      x.restore();
    }
  }
  // amostras
  for(const it of rovState.items){
    if(it.got)continue;
    const live=rovState.sonar>0&&rovState.sonarUnlocked;
    /* eco restante: o marcador esmaece no fim e pisca no último segundo */
    const eco=(it.ecoAte||0)-rovState.time;
    if(!live&&eco<=0)continue;
    let a=live?1:Math.max(.12,Math.min(.55,eco/3));
    if(!live&&eco<1.2&&Math.floor(rovState.time*8)%2===0)a*=.35;
    x.save();x.globalAlpha=a;
    x.strokeStyle='rgba(158,247,211,.8)';x.setLineDash([4,5]);x.lineWidth=2;
    x.beginPath();x.arc(it.px,it.py,18+Math.sin((rovState.bubble+it.px)*.1)*3,0,6.3);x.stroke();x.setLineDash([]);
    x.fillStyle='#9ef7d3';x.shadowBlur=live?20:8;x.shadowColor='#9ef7d3';
    x.beginPath();x.arc(it.px,it.py,5,0,6.3);x.fill();x.restore();
    x.save();x.globalAlpha=a;x.fillStyle='rgba(195,255,243,.9)';
    x.font='600 9px ui-monospace,monospace';x.fillText(it.id,it.px+11,it.py+3);x.restore();
  }
  // anel do sonar
  if(rovState.sonar>0){
    const radius=(95-rovState.sonar)*7;
    x.strokeStyle='rgba(124,240,198,.35)';x.lineWidth=2;
    x.beginPath();x.arc(rovState.x,rovState.y,radius,0,6.3);x.stroke();
  }
  // umbilical
  x.strokeStyle='rgba(117,191,199,.32)';x.lineWidth=2;
  x.beginPath();x.moveTo(90,0);x.bezierCurveTo(150,120,rovState.x-90,rovState.y-160,rovState.x,rovState.y);x.stroke();
  // ROV
  const rx=rovState.x,ry=rovState.y;
  x.save();x.translate(rx,ry);
  x.shadowBlur=26;x.shadowColor=rovState.alarm>0?'rgba(255,120,110,.6)':'rgba(124,240,198,.3)';
  x.fillStyle='#0a2d38';x.strokeStyle=rovState.alarm>0?'#ff8f76':'#7cf0f7';x.lineWidth=3;
  x.beginPath();x.roundRect(-33,-17,66,34,9);x.fill();x.stroke();x.shadowBlur=0;
  x.fillStyle='#9ef7d3';x.beginPath();x.arc(0,0,7,0,6.3);x.fill();
  x.fillStyle='#04161e';x.beginPath();x.arc(0,0,2.6,0,6.3);x.fill();
  x.strokeStyle='#74e9f1';x.lineWidth=3;[-21,21].forEach(px=>{x.beginPath();x.moveTo(px,15);x.lineTo(px*1.25,29);x.stroke()});
  x.fillStyle='#8ff6ff';x.fillRect(-9,-27,18,5);
  x.restore();
  // faróis + escuridão (fases profundas)
  if(ph.light<1){
    const g=x.createRadialGradient(rx,ry,20,rx,ry,140+ph.light*420);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.55,`rgba(1,8,12,${(1-ph.light)*.55})`);g.addColorStop(1,`rgba(1,7,11,${(1-ph.light)*.92})`);
    x.fillStyle=g;x.fillRect(0,0,w,h);
    const cone=x.createRadialGradient(rx,ry,8,rx,ry,150);
    cone.addColorStop(0,'rgba(198,246,255,.16)');cone.addColorStop(1,'rgba(198,246,255,0)');
    x.fillStyle=cone;x.beginPath();x.arc(rx,ry,150,0,6.3);x.fill();
  }
  // HUD
  x.fillStyle='rgba(228,252,255,.85)';x.font='600 10px ui-monospace,monospace';
  x.fillText(ph.id+' · '+ph.zone.toUpperCase(),18,22);
  x.fillText(rovState.depth.toLocaleString('pt-BR')+' m',18,37);
  x.fillText('SONAR '+(rovState.sonar>0?'ATIVO':rovState.sonarUnlocked?'PRONTO':'BLOQUEADO'),w-160,22);
  if(ph.pulses<=50)x.fillText('PULSOS '+rovState.pulsesLeft,w-160,37);
}

function typingTarget(e){const t=e.target;if(!t)return false;const tag=(t.tagName||'').toUpperCase();return tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||t.isContentEditable}
function gameActive(){return !!rovState && (location.hash.slice(1).split('?')[0]==='/jogo')}
addEventListener('keydown',e=>{
  if(e.key==='Escape'){const m=document.getElementById('mega');if(m&&m.classList.contains('open')){closeMega();return}}
  if(!gameActive()||typingTarget(e)||e.metaKey||e.ctrlKey||e.altKey)return;
  const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ShiftLeft:'shift',ShiftRight:'shift'};
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)pulseSonar();return}
  if(e.code==='KeyF' && rovState){e.preventDefault();if(!e.repeat)toggleGameFullscreen();return}
  if(e.code==='KeyP' && rovState?.running){e.preventDefault();if(!e.repeat)toggleROVPause();return}
  const action=map[e.code];
  if(action){e.preventDefault();if(rovState)rovState.keys[action]=true}
});
addEventListener('keyup',e=>{
  if(!rovState||typingTarget(e))return;
  const map={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ShiftLeft:'shift',ShiftRight:'shift'};
  const action=map[e.code];
  if(action)rovState.keys[action]=false
});
