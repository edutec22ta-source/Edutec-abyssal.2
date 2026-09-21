/* ============================================================
   CONQUISTAS
   Marcas de campo obtidas explorando o atlas e pilotando o ROV.

   Tudo fica no mesmo registro local do diário (`abyssalLog`), em duas
   chaves novas:
     log.ach   — ids das conquistas já obtidas
     log.stats — contadores acumulados entre sessões

   O catálogo é avaliado por completo a cada navegação e ao fim de cada
   missão: uma conquista nunca se perde e nunca é contada duas vezes.
   ============================================================ */

const ACHIEVEMENTS=[
  /* --- expedições --- */
  {id:'primeira-descida', grupo:'Expedições', nome:'Primeira descida',
   desc:'Conclua uma missão do ROV.',
   teste:(l,s)=>l.missions.length>=1},

  {id:'piloto-de-canion', grupo:'Expedições', nome:'Piloto de cânion',
   desc:'Conclua a F03, no cânion submarino.',
   teste:(l,s)=>l.missions.includes('F03')},

  {id:'hadal', grupo:'Expedições', nome:'Zona hadal',
   desc:'Alcance 6.000 m de profundidade em uma descida.',
   teste:(l,s)=>(s.profMax||0)>=6000},

  {id:'coluna-completa', grupo:'Expedições', nome:'Coluna d’água',
   desc:'Conclua as seis fases base, da plataforma à fossa hadal.',
   teste:(l,s)=>['F01','F02','F03','F04','F05','F06'].every(id=>l.missions.includes(id))},

  {id:'expedicoes-especiais', grupo:'Expedições', nome:'Expedições especiais',
   desc:'Conclua as quatro missões avançadas, da F07 à F10.',
   teste:(l,s)=>['F07','F08','F09','F10'].every(id=>l.missions.includes(id))},

  {id:'challenger', grupo:'Expedições', nome:'Challenger',
   desc:'Alcance 10.900 m, o fundo da Fossa das Marianas.',
   teste:(l,s)=>(s.profMax||0)>=10900},

  /* --- pilotagem --- */
  {id:'casco-intacto', grupo:'Pilotagem', nome:'Casco intacto',
   desc:'Conclua uma missão sem colidir nenhuma vez.',
   teste:(l,s)=>(s.semColisao||0)>=1},

  {id:'reserva-tecnica', grupo:'Pilotagem', nome:'Reserva técnica',
   desc:'Conclua uma missão com 60% ou mais de energia.',
   teste:(l,s)=>(s.energiaMax||0)>=60},

  {id:'amostragem', grupo:'Pilotagem', nome:'Amostragem',
   desc:'Recupere 45 amostras somando todas as missões.',
   teste:(l,s)=>(s.amostras||0)>=45},

  {id:'sonar-economico', grupo:'Pilotagem', nome:'Sonar econômico',
   desc:'Conclua uma missão usando no máximo dois pulsos de sonar.',
   teste:(l,s)=>(s.pulsosMin!=null)&&s.pulsosMin<=2},

  /* --- atlas --- */
  {id:'naturalista', grupo:'Atlas', nome:'Naturalista',
   desc:'Abra 10 fichas de espécies.',
   teste:(l,s)=>l.species.length>=10},

  {id:'taxonomista', grupo:'Atlas', nome:'Taxonomista',
   desc:'Abra 25 fichas de espécies.',
   teste:(l,s)=>l.species.length>=25},

  {id:'cartografo', grupo:'Atlas', nome:'Cartógrafo',
   desc:'Visite as cinco bacias oceânicas no mapa.',
   teste:(l,s)=>l.map.length>=5},

  {id:'leitor-de-campo', grupo:'Atlas', nome:'Leitor de campo',
   desc:'Percorra 12 páginas diferentes do atlas.',
   teste:(l,s)=>(s.paginas||[]).length>=12}
];

/* ---------- leitura e escrita ---------- */
function achLog(){
  const l=getLog();
  if(!Array.isArray(l.ach))l.ach=[];
  if(!l.stats||typeof l.stats!=='object')l.stats={};
  if(!Array.isArray(l.stats.paginas))l.stats.paginas=[];
  return l;
}
function achObtidas(){return achLog().ach}
function achTotal(){return ACHIEVEMENTS.length}
function achResumo(){const o=achObtidas();return {obtidas:o.length,total:ACHIEVEMENTS.length}}
function achTem(id){return achObtidas().includes(id)}

/* ---------- registro de eventos ---------- */

/* chamada a cada navegação, por render() */
function registrarPagina(rota){
  if(!rota)return;
  const l=achLog();
  const base=String(rota).split('?')[0];
  if(!l.stats.paginas.includes(base)){l.stats.paginas.push(base);saveLog(l)}
}

/* chamada ao concluir uma missão, por finishROV() */
function registrarMissao(r){
  const l=achLog(),s=l.stats;
  s.amostras=(s.amostras||0)+(r.amostras||0);
  s.profMax=Math.max(s.profMax||0,r.profMax||0);
  s.energiaMax=Math.max(s.energiaMax||0,Math.round(r.energia||0));
  if(!r.colisoes)s.semColisao=(s.semColisao||0)+1;
  const usados=r.pulsosUsados;
  if(typeof usados==='number')s.pulsosMin=(s.pulsosMin==null)?usados:Math.min(s.pulsosMin,usados);
  saveLog(l);
}

/* ---------- avaliação ---------- */
function checkAchievements(){
  const l=achLog(),novas=[];
  for(const a of ACHIEVEMENTS){
    if(l.ach.includes(a.id))continue;
    let ok=false;
    try{ok=!!a.teste(l,l.stats)}catch(e){ok=false}
    if(ok){l.ach.push(a.id);novas.push(a)}
  }
  if(novas.length){
    saveLog(l);
    if(typeof toast==='function')novas.forEach((a,i)=>setTimeout(()=>toast('Conquista · '+a.nome),i*1500));
  }
  return novas;
}

/* ---------- apresentação ---------- */
function achGrupos(){
  const g=[];
  for(const a of ACHIEVEMENTS){
    let alvo=g.find(x=>x.nome===a.grupo);
    if(!alvo){alvo={nome:a.grupo,itens:[]};g.push(alvo)}
    alvo.itens.push(a);
  }
  return g;
}
function achCatalogoHTML(){
  const obtidas=achObtidas();
  return achGrupos().map(g=>`<div class="achGroup"><span class="achGroupName">${esc(g.nome)}</span><div class="badgeGrid">${
    g.itens.map(a=>{
      const ok=obtidas.includes(a.id);
      return `<div class="badge${ok?' badgeOn':''}"><strong>${ok?'✓':'○'} ${esc(a.nome)}</strong><small>${esc(a.desc)}</small></div>`;
    }).join('')
  }</div></div>`).join('');
}
