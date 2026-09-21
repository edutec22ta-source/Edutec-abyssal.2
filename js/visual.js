function meta(id){return META[id]||{d:null,z:[],r:[],e:[],m:[],env:'',t:''}}
function speciesById(id){return SPECIES.find(s=>s.id===id)}
function speciesByRegion(r,n){const out=SPECIES.filter(s=>meta(s.id).r.includes(r));return n?out.slice(0,n):out}
function speciesByZone(z,n){const out=SPECIES.filter(s=>meta(s.id).z.includes(z));return n?out.slice(0,n):out}
function speciesByEco(e,n){const out=SPECIES.filter(s=>meta(s.id).e.includes(e));return n?out.slice(0,n):out}
function speciesByMission(m){return SPECIES.filter(s=>meta(s.id).m.includes(m))}
function speciesChips(list,limit){
  const arr=(list||[]).slice(0,limit||6);
  if(!arr.length)return '<p class="subtle small">Nenhuma ficha indexada para este recorte ainda.</p>';
  return `<div class="chipRow">${arr.map(s=>`<a class="specChip" href="#/especies/${s.id}"><b>${esc(s.name)}</b><span>${esc(s.group)}</span></a>`).join('')}</div>`;
}

/* --- camada de biologia marinha: profundidade, escala e estado de conservação --- */
const DEPTH_STOPS=[[0,0],[200,.24],[1000,.44],[4000,.68],[6000,.84],[11000,1]];
function depthPos(m){m=Math.max(0,Math.min(11000,m));for(let i=1;i<DEPTH_STOPS.length;i++){const[a,fa]=DEPTH_STOPS[i-1],[b,fb]=DEPTH_STOPS[i];if(m<=b)return(fa+(m-a)/(b-a)*(fb-fa))*100}return 100}
const ZONE_KEYS=[['epipelag',[0,200]],['mesopelag',[200,1000]],['batipelag',[1000,4000]],['abissopelag',[4000,6000]],['abissal',[4000,6000]],['hadopelag',[6000,11000]],['hadal',[6000,11000]],['hidroterm',[1500,4000]],['costeir',[0,200]],['superficie',[0,20]],['raso',[0,50]],['profund',[200,4000]]];
function depthRange(txt){if(!txt)return null;const t=slug(txt);const nums=[...t.matchAll(/(\d[\d.]*(?:,\d+)?)\s*(?=m|$|[–-])/g)].map(x=>parseFloat(x[1].replace(/\./g,'').replace(',','.'))).filter(n=>!isNaN(n));if(nums.length>=2)return[Math.min(...nums),Math.max(...nums)];let lo=null,hi=null;for(const[k,[a,b]]of ZONE_KEYS){if(t.includes(k)){lo=lo===null?a:Math.min(lo,a);hi=hi===null?b:Math.max(hi,b)}}if(nums.length===1){const n=nums[0];lo=lo===null?n:Math.min(lo,n);hi=hi===null?n:Math.max(hi,n)}if(lo===null)return null;if(hi-lo<40)hi=lo+40;return[lo,hi]}
function fmtM(n){return n>=1000?(n/1000).toLocaleString('pt-BR',{maximumFractionDigits:1})+' km':Math.round(n)+' m'}
function depthProfile(txt,label){const r=depthRange(txt);if(!r)return '';const top=depthPos(r[0]),bot=depthPos(r[1]);return `<figure class="depthProfile"><div class="dpScale"><i class="dpBand" style="top:${top.toFixed(1)}%;height:${Math.max(2.5,bot-top).toFixed(1)}%"></i></div><figcaption>${label!==false?'faixa de ocorrência ':''}${fmtM(r[0])} – ${fmtM(r[1])}</figcaption></figure>`}
function sizeMeters(txt){if(!txt)return null;const m=[...String(txt).matchAll(/(\d+(?:[.,]\d+)?)\s*m\b/g)].map(x=>parseFloat(x[1].replace(',','.')));if(!m.length)return null;return Math.max(...m)}
function sizeScale(txt){const v=sizeMeters(txt);if(!v)return '';const max=34,w=Math.max(3,Math.sqrt(v/max)*100),h=Math.sqrt(1.75/max)*100;return `<figure class="sizeScale"><div class="ssTrack"><i style="width:${w.toFixed(1)}%"></i><b style="left:${h.toFixed(1)}%"><span>1,75 m</span></b></div><figcaption>${esc(txt)}</figcaption></figure>`}
function statusInfo(st){const s=slug(st||'');if(/criticamente|em perigo critico/.test(s))return['CR','Criticamente em perigo','cr'];if(/em perigo/.test(s))return['EN','Em perigo','en'];if(/vulneravel/.test(s))return['VU','Vulnerável','vu'];if(/quase amea/.test(s))return['NT','Quase ameaçada','nt'];if(/pouco preocup/.test(s))return['LC','Pouco preocupante','lc'];if(/nao avaliad|nao se aplica|nao ha avaliacao/.test(s))return['NE',st||'Não avaliada','ne'];if(/pouco conhecid|dados variaveis|depende|varia por|ver avaliacao/.test(s))return['DD',st,'dd'];return['DD',st||'Dados insuficientes','dd']}
function statusChip(st){const[c,full,cls]=statusInfo(st);return `<span class="iucn iucn-${cls}"><b>${c}</b><span>${esc(full)}</span></span>`}
function catalogo(s){const i=SPECIES.indexOf(s);return 'ABY-'+String((i<0?0:i)+1).padStart(3,'0')}

/* ================= FOTOGRAFIAS REAIS ABYSSAL =================
   Catálogo estático de fotografias reais hospedadas no Wikimedia Commons.
   Não há chamadas de API nem dependência de resolução em tempo de execução:
   cada foto é montada diretamente pelo redirecionador de arquivo do Commons.
*/
const REAL_PHOTO_FILES={
  'tubarao-branco': 'White_shark.jpg',
  'orca': 'Killerwhales_jumping.jpg',
  'baleia-azul': 'Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg',
  'lula-gigante': 'Giant_squid_Ranheim.jpg',
  'polvo-comum': 'Octopus2.jpg',
  'cavalo-marinho': 'Hippocampus_hippocampus_(on_Ascophyllum_nodosum).jpg',
  'tartaruga-verde': 'Green_sea_turtle_(Chelonia_mydas)_Moorea.jpg',
  'peixe-lua': 'Mola_mola.jpg',
  'narval': 'Нарвал_в_российской_Арктике.jpg',
  'peixe-pescador': 'MelanocetusJohnsoniiFord.jpg',
  'caranguejo-yeti': 'Yeti_crab.jpg',
  'agua-viva-juba-de-leao': 'Lion\'s_mane_jellyfish_in_Gullmarn_fjord_at_Sämstad_7.jpg',
  'tubarao-baleia': 'Similan_Dive_Center_-_great_whale_shark.jpg',
  'tubarao-martelo': 'Scalloped_hammerhead_shark_(Sphyrna_lewini)_Costa_Rica_(cropped).jpg',
  'tubarao-mako': 'Shortfin_mako_(Isurus_oxyrinchus).jpg',
  'tubarao-groenlandia': 'Somniosus_microcephalus_okeanos.jpg',
  'raia-manta': 'Manta_birostris-Thailand4.jpg',
  'enguia-lobo': 'February_2,_2012_Wolf_Eel_(really_a_fish!)_in_Puget_Sound_(6842178290).jpg',
  'peixe-palhaco': 'Clown_fish_in_the_Andaman_Coral_Reef.jpg',
  'bodiao-limpador': 'Lábrido_limpiador_común_(Labroides_dimidiatus),_mar_Rojo,_Egipto,_2023-04-17,_DD_90.jpg',
  'atum-rabilho': 'Bluefin-big.jpg',
  'sardinha-verdadeira': 'SardinhaDSC1770.jpg',
  'mero': 'Epinephelus_itajara_279042770.jpg',
  'peixe-voador': 'Pink-wing_flying_fish.jpg',
  'celacanto': 'Coelacanth_off_Pumula_on_the_KwaZulu-Natal_South_Coast,_South_Africa,_on_22_November_2019.png',
  'peixe-lanterna': 'Myctophum_punctatum1.jpg',
  'caracol-do-mar-hadal': 'Pseudoliparis_swirei.png',
  'baleia-jubarte': 'Humpback_whale_breaching_off_Cabo_San_Lucas.jpg',
  'cachalote': 'Mother_and_baby_sperm_whale.jpg',
  'golfinho-nariz-de-garrafa': 'Tursiops_truncatus_01-cropped.jpg',
  'foca-de-weddell': 'Mikkelsen_Harbour-2016-Trinity_Island_(D\'Hainaut_Island)–Weddell_seal_(Leptonychotes_weddellii)_03.jpg',
  'morsa': 'Walrus_in_the_Russian_Arctic_National_Park,_Novaya_Zemlya_2015-2.jpg',
  'tartaruga-de-couro': 'Leatherback_sea_turtle_Tinglar,_USVI_(5839996547).jpg',
  'tartaruga-de-pente': 'Eretmochelys-imbricata-Kélonia-2.JPG',
  'pinguim-imperador': 'Aptenodytes_forsteri_-Snow_Hill_Island,_Antarctica_-adults_and_juvenile-8.jpg',
  'albatroz-errante': 'Diomedea_exulans_-_SE_Tasmania.jpg',
  'lula-colossal': 'NZ070415_Colossal_Squid_01.jpg',
  'nautilo': 'Nautilus_pompilius_(detail).jpg',
  'sepia-comum': 'Sepia_común_(Sepia_officinalis),_Parque_natural_de_la_Arrábida,_Portugal,_2020-07-21,_DD_62.jpg',
  'polvo-dumbo': 'Dumbo-hires_(cropped).jpg',
  'lula-vampira': 'Vampire_squid_(2111032672).jpg',
  'caranguejo-aranha-japones': 'Macrocheira_kaempferi.jpg',
  'lagosta-espinhosa': 'Langosta_común_del_Caribe_(Panulirus_argus),_Cozumel,_México,_2025-12-20,_DD_70.jpg',
  'krill-antartico': 'Antarctic_krill_(Euphausia_superba).jpg',
  'isopode-gigante': 'Laika_ac_Deep_sea_creatures_(7472073020).jpg',
  'medusa-lua': 'Aurelia_aurita_(Cnidaria)_Luc_Viatour.jpg',
  'coral-chifre-de-alce': 'Elkhorn_coral.jpg',
  'estrela-do-mar-girassol': 'Pycnopodia_helianthoides_SLO_CA.jpg',
  'ourico-do-mar-roxo': 'Fish4641_-_Flickr_-_NOAA_Photo_Library.jpg',
  'porco-do-mar': 'Scotoplanes_globosa1.jpg',
  'peixe-vibora': 'Messina_Straits_Chauliodus_sloani.jpg',
  'peixe-dragao': 'Malacosteus_niger_(black).jpg',
  'verme-tubo-gigante': 'Campagne_HOT_-_Vers_géants_(Riftia_pachyptila)_(Ifremer_00530-64223_-_52381).jpg',
  'prochlorococcus': 'Prochlorococcus_marinus.jpg',
  'diatomaceas': 'Bacillaria_paxillifera.jpg',
  'kelp-gigante': 'Giantkelp2_300.jpg',
  'anfipode-hadal': 'Yeti_crab.jpg',
  'peixe-gota': 'Psychrolutes_marcidus.jpg',
  'eco-reef': 'Blue_Linckia_Starfish.JPG',
  'eco-mangrove': 'Sonneratia_alba_-_Manado_(2).JPG',
  'eco-kelp': 'Kelp_forest.jpg',
  'eco-open': 'Pacific_Ocean_as_viewed_from_GOES-18_on_September_23,_2023.jpg',
  'eco-seabed': 'Common_stingray_tenerife.jpg',
  'eco-vent': 'Blacksmoker_in_Atlantic_Ocean.jpg',
  'eco-estuary': 'Rio_de_la_Plata_BA_2.JPG',
  'eco-seagrass': 'Zostera_marina_-_National_Museum_of_Nature_and_Science,_Tokyo_-_DSC07663.JPG',
  'basin-pacifico': 'Pacific_Ocean_as_viewed_from_GOES-18_on_September_23,_2023.jpg',
  'basin-atlantico': 'Tide_pools_in_santa_cruz.jpg',
  'basin-indico': 'Maldivesfish2.jpg',
  'basin-artico': 'Walrus_in_the_Russian_Arctic_National_Park,_Novaya_Zemlya_2015-2.jpg',
  'basin-antartico': 'Aptenodytes_forsteri_-Snow_Hill_Island,_Antarctica_-adults_and_juvenile-8.jpg',
  'page-ocean': 'Pacific_Ocean_as_viewed_from_GOES-18_on_September_23,_2023.jpg',
  'page-deep': 'Expl0511_-_Flickr_-_NOAA_Photo_Library.jpg',
  'page-food': 'Maldivesfish2.jpg',
  'page-species': 'Tide_pools_in_santa_cruz.jpg',
  'page-adapt': 'Expl0511_-_Flickr_-_NOAA_Photo_Library.jpg',
  'page-conservation': 'Blue_Linckia_Starfish.JPG',
  'page-exploration': 'Expl0511_-_Flickr_-_NOAA_Photo_Library.jpg',
  'page-zones': 'Pacific_Ocean_as_viewed_from_GOES-18_on_September_23,_2023.jpg',
  'page-timeline': 'Expl0511_-_Flickr_-_NOAA_Photo_Library.jpg',
  'page-curiosities': 'Tide_pools_in_santa_cruz.jpg',
  'page-ecology': 'Maldivesfish2.jpg',
  'page-about': 'Tide_pools_in_santa_cruz.jpg',
  'tech-rov': 'Expl1196_-_Flickr_-_NOAA_Photo_Library.jpg',
  'tech-auv': 'Blackghost.jpg',
  'tech-sonar': 'Motte-Picquet-tugged-sonar.jpg',
  'tech-sub': 'Bathyscaphe_Trieste_hoisted.jpg',
  'tech-ctd': 'CTD-me-details_hg.jpg',
  'tech-edna': 'Expl1196_-_Flickr_-_NOAA_Photo_Library.jpg',
};

const REAL_PHOTO_URLS={
  'basin-pacifico':'https://upload.wikimedia.org/wikipedia/commons/d/db/Pacific_Ocean_as_viewed_from_GOES-18_on_September_23%2C_2023.jpg',
  'basin-atlantico':'https://upload.wikimedia.org/wikipedia/commons/7/74/Tide_pools_in_santa_cruz.jpg',
  'basin-indico':'https://upload.wikimedia.org/wikipedia/commons/3/35/Maldivesfish2.jpg',
  'basin-artico':'https://upload.wikimedia.org/wikipedia/commons/8/87/Walrus_in_the_Russian_Arctic_National_Park%2C_Novaya_Zemlya_2015-2.jpg',
  'basin-antartico':'https://upload.wikimedia.org/wikipedia/commons/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg',
  'page-ocean':'https://upload.wikimedia.org/wikipedia/commons/d/db/Pacific_Ocean_as_viewed_from_GOES-18_on_September_23%2C_2023.jpg'
};

const PHOTO_DEFAULTS=[
  'Pacific_Ocean_as_viewed_from_GOES-18_on_September_23,_2023.jpg',
  'Tide_pools_in_santa_cruz.jpg',
  'Maldivesfish2.jpg'
];
const PHOTO_CACHE=Object.create(null);
const PHOTO_DIAG={erros:[],tentativas:0,resolvidas:0,total:0,origem:'Wikimedia Commons · fotografias reais'};

function photoFileUrl(file,key){
  return REAL_PHOTO_URLS[key]||'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(file);
}

function resolvePhoto(key,alt){
  const file=REAL_PHOTO_FILES[key]||PHOTO_DEFAULTS[0];
  if(PHOTO_CACHE[key])return Promise.resolve(PHOTO_CACHE[key]);
  const info={
    src:photoFileUrl(file,key),
    pageUrl:'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file).replace(/%20/g,'_'),
    title:file.replace(/_/g,' '),
    source:'Wikimedia Commons'
  };
  PHOTO_CACHE[key]=info;
  PHOTO_DIAG.resolvidas=Object.keys(PHOTO_CACHE).length;
  PHOTO_DIAG.total++;
  return Promise.resolve(info);
}

function diagnosticoFotos(){
  const d=PHOTO_DIAG;
  console.log('%cABYSSAL · diagnóstico de fotografias reais','font-weight:bold');
  console.log('  origem : Wikimedia Commons');
  console.log('  figuras na página :',document.querySelectorAll('.photoFrame[data-photo]').length);
  console.log('  fotografias aplicadas :',document.querySelectorAll('.photoFrame.hasPhoto').length);
  console.log('  resolvidas :',d.resolvidas);
  console.log('  falhas :',d.erros.length,d.erros);
  return d;
}

function photoFrame(key,alt,fallback,cls){
  return `<figure class="photoFrame ${cls||''}" data-photo="${esc(key)}" data-alt="${esc(alt||'')}"><div class="photoFallback"><div class="realPhotoPlaceholder">Carregando fotografia real…</div></div></figure>`;
}

function loadPhotos(){ return Promise.resolve(PHOTO_CACHE); }

function applyPhotos(){
  const frames=document.querySelectorAll('.photoFrame[data-photo]');
  if(!frames.length)return;
  frames.forEach(frame=>{
    if(frame.dataset.done||frame.dataset.loading)return;
    frame.dataset.loading='1';
    resolvePhoto(frame.dataset.photo,frame.dataset.alt).then(info=>{
      frame.dataset.loading='';
      PHOTO_DIAG.tentativas++;
      const img=document.createElement('img');
      img.src=info.src;
      img.alt=frame.dataset.alt||'Fotografia real de vida marinha';
      img.loading='lazy';
      img.decoding='async';
      img.referrerPolicy='no-referrer-when-downgrade';
      img.onload=()=>{
        frame.dataset.done='1';
        frame.classList.add('hasPhoto');
        const holder=frame.querySelector('.photoFallback');
        if(holder)holder.remove();
        // Sem link de fonte sobre a imagem.
      };
      img.onerror=()=>{
        PHOTO_DIAG.erros.push({key:frame.dataset.photo,error:'Falha ao carregar a fotografia'});
        frame.dataset.failed='1';
        const holder=frame.querySelector('.photoFallback');
        if(holder)holder.innerHTML='<div class="realPhotoPlaceholder">Fotografia indisponível.</div>';
      };
      frame.prepend(img);
    });
  });
}

function art(type,size='large'){
const cls=`svgArt ${size}`;
const common='';
let body='';
if(type==='whale') body=`<path d="M43 139c26-55 91-78 151-55 42 16 67 43 112 56-25 13-54 15-79 5-16 34-56 53-101 48-38-4-65-20-83-54Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M298 137l38-25-11 28 18 18-42-5" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M168 88c7-18 12-26 23-36" fill="none" stroke="#9ef7d3" stroke-width="7" stroke-linecap="round"/><circle cx="247" cy="108" r="5" fill="#9ef7d3"/>`;
else if(type==='shark') body=`<path d="M28 137c48-53 116-73 178-49l38 15 48-17 40 27-35 15 35 27-47-9c-26 35-72 52-121 46-50-6-90-24-136-55Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M162 91l25-49 18 55M205 168l-2 31" fill="none" stroke="#79f2fb" stroke-width="6" stroke-linecap="round"/><path d="M293 126l27-10" stroke="#9ef7d3" stroke-width="5" stroke-linecap="round"/><circle cx="249" cy="106" r="5" fill="#9ef7d3"/>`;
else if(type==='orca') body=`<path d="M48 143c26-55 92-73 148-44 34 18 63 37 103 46-24 13-51 14-73 4-18 32-54 48-94 44-38-4-65-23-84-50Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M207 98l20-47 16 54M235 160c25-23 38-45 43-69" fill="none" stroke="#9ef7d3" stroke-width="6" stroke-linecap="round"/><path d="M91 125c20-21 39-29 60-30 8 21 7 35-1 48-22 0-41-5-59-18Z" fill="#dffcff" opacity=".85"/><circle cx="253" cy="106" r="5" fill="#9ef7d3"/>`;
else if(type==='squid') body=`<path d="M136 66c34-27 82-19 101 16 21 38 3 72-38 85-46 14-90-11-96-51-4-22 9-39 33-50Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M146 155c-28 28-43 53-38 76M167 157c-17 35-14 59-2 76M191 155c10 36 27 58 49 72M210 147c27 18 52 39 69 56" fill="none" stroke="#79f2fb" stroke-width="4" stroke-linecap="round"/><circle cx="157" cy="98" r="17" fill="#031019" stroke="#9ef7d3" stroke-width="5"/><circle cx="209" cy="98" r="17" fill="#031019" stroke="#9ef7d3" stroke-width="5"/><circle cx="157" cy="98" r="5" fill="#9ef7d3"/><circle cx="209" cy="98" r="5" fill="#9ef7d3"/>`;
else if(type==='octopus') body=`<path d="M112 104c4-43 37-68 74-68s70 25 74 68c3 25-10 42-29 54l22 49-37-30-7 51-30-43-27 43-9-52-43 31 25-49c-18-12-21-29-13-54Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M132 103c14-14 31-21 54-21s41 7 55 21" fill="none" stroke="#9ef7d3" stroke-width="5"/><circle cx="161" cy="108" r="6" fill="#9ef7d3"/><circle cx="197" cy="108" r="6" fill="#9ef7d3"/>`;
else if(type==='seahorse') body=`<path d="M205 42c-45 2-65 35-42 65 13 17 23 27 16 46-7 18-26 25-40 13-17-14-9-39 12-40 14-1 23 9 21 21" fill="none" stroke="url(#fin)" stroke-width="18" stroke-linecap="round"/><path d="M203 48c-7-20 0-34 18-39M207 55l38 4-23 18M178 101l-39 19 27 12" fill="none" stroke="#79f2fb" stroke-width="6" stroke-linecap="round"/><circle cx="210" cy="69" r="4" fill="#031019"/>`;
else if(type==='turtle') body=`<ellipse cx="180" cy="128" rx="91" ry="63" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M125 84L86 48l21 51M235 84l40-36-22 51M125 169l-40 31 20-50M235 169l41 30-20-50M268 127l45-16-26 31Z" fill="url(#sea)" stroke="#9ef7d3" stroke-width="4"/><path d="M119 128h122M180 67v122" stroke="#9ef7d3" stroke-width="3" opacity=".65"/>`;
else if(type==='mola') body=`<path d="M180 38c57 4 91 38 90 88-1 51-34 84-90 87-56-3-90-36-90-87 0-49 34-84 90-88Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M113 105L43 67l31 61-31 61 70-39M247 104l70-37-30 61 31 61-71-39" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><circle cx="218" cy="100" r="6" fill="#9ef7d3"/>`;
else if(type==='narwhal') body=`<path d="M47 142c30-51 92-70 148-41 27 14 55 33 96 44-31 11-60 10-85 0-17 26-45 42-78 42-35 0-62-16-81-45Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M214 110L309 44" stroke="#9ef7d3" stroke-width="7" stroke-linecap="round"/><path d="M222 109l-4-18" stroke="#79f2fb" stroke-width="5"/><circle cx="240" cy="105" r="5" fill="#9ef7d3"/>`;
else if(type==='angler') body=`<path d="M94 96c35-50 108-46 140 2 20 31 12 64-17 82-35 21-90 17-116-12-23-25-27-47-7-72Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M181 81c2-39 9-54 25-66 11-8 21 4 8 14-10 9-9 21-3 35" fill="none" stroke="#79f2fb" stroke-width="5"/><circle cx="211" cy="52" r="9" fill="#9ef7d3" filter="url(#glow)"/><path d="M155 98l-18-14M198 99l15-18" stroke="#79f2fb" stroke-width="5" stroke-linecap="round"/>`;
else if(type==='crab') body=`<ellipse cx="180" cy="132" rx="78" ry="55" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M111 119L52 82m67 49-73-8m80 34-67 28m177-66 59-37m-66 50 73-8m-81 29 67 28" stroke="#79f2fb" stroke-width="8" stroke-linecap="round"/><path d="M125 91L92 47m140 44 31-44" stroke="#9ef7d3" stroke-width="7" stroke-linecap="round"/><circle cx="151" cy="116" r="7" fill="#9ef7d3"/><circle cx="209" cy="116" r="7" fill="#9ef7d3"/>`;
else if(type==='jelly') body=`<path d="M75 98c0-45 47-76 105-76s105 31 105 76c0 32-21 51-48 60l-8 70m-30-63v63m-29-67-22 67m-18-79-44 62m135-49 41 52" fill="none" stroke="#79f2fb" stroke-width="9" stroke-linecap="round"/><path d="M75 100c25-24 59-35 105-35s80 11 105 35c0 34-35 53-105 53S75 134 75 100Z" fill="url(#sea)" stroke="#9ef7d3" stroke-width="4"/>`;
else if(type==='fish') body=`<path d="M62 126c30-42 84-60 138-52 34 5 62 20 84 40-22 20-50 35-84 40-54 8-108-10-138-28Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M284 114l38-26v76l-38-26Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><path d="M150 88c14-24 44-30 62-14-20 6-42 12-62 14Z" fill="url(#fin)" opacity=".85"/><path d="M158 166c16 22 46 26 62 12-20-4-42-8-62-12Z" fill="url(#fin)" opacity=".7"/><circle cx="104" cy="120" r="7" fill="#04161e"/><circle cx="106" cy="118" r="2.4" fill="#c8fff2"/>`;
else if(type==='lantern') body=`<path d="M74 128c26-34 74-50 122-44 30 4 55 17 74 34-19 17-44 30-74 34-48 6-96-10-122-24Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M270 118l34-22v66l-34-22Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><circle cx="112" cy="122" r="7" fill="#04161e"/><circle cx="114" cy="120" r="2.4" fill="#c8fff2"/><g fill="#9ef7d3" filter="url(#glow)">${[96,118,140,162,184,206,228].map(x=>`<circle cx="${x}" cy="152" r="3.4"/>`).join('')}</g><g fill="#9ef7d3" opacity=".8">${[126,152,178,204].map(x=>`<circle cx="${x}" cy="100" r="2.4"/>`).join('')}</g>`;
else if(type==='ray') body=`<path d="M180 62c46 0 92 26 128 66-36 30-84 48-128 48s-92-18-128-48c36-40 82-66 128-66Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M144 68c-6-14 4-24 16-20 8 3 12 11 10 20Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="2.5"/><path d="M216 68c6-14-4-24-16-20-8 3-12 11-10 20Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="2.5"/><path d="M176 174c2 30 4 48 2 62" stroke="#79f2fb" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="152" cy="92" r="5.5" fill="#04161e"/><circle cx="208" cy="92" r="5.5" fill="#04161e"/><path d="M120 128c22-8 98-8 120 0" stroke="rgba(158,247,211,.45)" stroke-width="3" fill="none"/>`;
else if(type==='penguin') body=`<ellipse cx="180" cy="132" rx="56" ry="82" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><ellipse cx="180" cy="146" rx="34" ry="60" fill="rgba(215,255,247,.22)"/><circle cx="180" cy="56" r="32" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M180 52c18 0 30 10 30 22-14 6-46 6-60 0 0-12 12-22 30-22Z" fill="rgba(215,255,247,.2)"/><path d="M210 58l30 8-30 9Z" fill="#ffcf86" stroke="#79f2fb" stroke-width="2"/><circle cx="192" cy="50" r="4.5" fill="#04161e"/><path d="M124 108c-16 26-14 60 2 82" stroke="#79f2fb" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M236 108c16 26 14 60-2 82" stroke="#79f2fb" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M158 212l-22 16h36Zm44 0 22 16h-36Z" fill="#ffcf86"/>`;
else if(type==='seabird') body=`<path d="M30 118c62-40 118-46 148-30 30-16 86-10 148 30-58 6-104 18-136 32-8-14-16-14-24 0-32-14-78-26-136-32Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3.5" opacity=".92"/><ellipse cx="180" cy="128" rx="30" ry="17" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><circle cx="203" cy="120" r="12" fill="url(#sea)" stroke="#79f2fb" stroke-width="3.5"/><path d="M214 120l24 5-24 6Z" fill="#ffcf86" stroke="#79f2fb" stroke-width="2"/><circle cx="206" cy="117" r="3" fill="#04161e"/><path d="M152 136c-14 12-26 22-32 34" stroke="#79f2fb" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
else if(type==='nautilus') body=`<path d="M182 44c56 0 100 42 100 92s-44 88-100 88c-52 0-94-38-94-86 0-38 28-70 66-70 30 0 54 22 54 50 0 22-16 40-38 40-16 0-30-12-30-28" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M240 62c-22 18-38 44-44 74m64-46c-26 10-46 30-56 56m54-14c-24 2-46 14-58 34" stroke="rgba(158,247,211,.5)" stroke-width="3" fill="none"/><g stroke="#9ef7d3" stroke-width="3" fill="none" stroke-linecap="round">${[0,1,2,3,4,5].map(i=>`<path d="M96 ${168+i*4}c-16 ${6+i*3} -30 ${10+i*4} -46 ${8+i*5}"/>`).join('')}</g><circle cx="104" cy="158" r="5" fill="#04161e"/>`;
else if(type==='star') body=`<g fill="url(#sea)" stroke="#79f2fb" stroke-width="3.5">${Array.from({length:14},(_,i)=>{const a=i*Math.PI*2/14,x=180+Math.cos(a)*82,y=125+Math.sin(a)*82;return `<path d="M180 125L${(180+Math.cos(a-.14)*44).toFixed(0)} ${(125+Math.sin(a-.14)*44).toFixed(0)}L${x.toFixed(0)} ${y.toFixed(0)}L${(180+Math.cos(a+.14)*44).toFixed(0)} ${(125+Math.sin(a+.14)*44).toFixed(0)}Z"/>`}).join('')}</g><circle cx="180" cy="125" r="40" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><g fill="rgba(158,247,211,.55)">${Array.from({length:9},(_,i)=>`<circle cx="${180+Math.cos(i*.7)*20}" cy="${125+Math.sin(i*.7)*20}" r="3"/>`).join('')}</g>`;
else if(type==='urchin') body=`<g stroke="#79f2fb" stroke-width="4" stroke-linecap="round">${Array.from({length:22},(_,i)=>{const a=i*Math.PI*2/22;return `<line x1="${(180+Math.cos(a)*48).toFixed(0)}" y1="${(125+Math.sin(a)*48).toFixed(0)}" x2="${(180+Math.cos(a)*96).toFixed(0)}" y2="${(125+Math.sin(a)*96).toFixed(0)}"/>`}).join('')}</g><circle cx="180" cy="125" r="52" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><circle cx="180" cy="125" r="14" fill="#04161e" opacity=".55"/><g fill="rgba(158,247,211,.4)">${Array.from({length:5},(_,i)=>`<circle cx="${180+Math.cos(i*1.26)*30}" cy="${125+Math.sin(i*1.26)*30}" r="4"/>`).join('')}</g>`;
else if(type==='coral') body=`<path d="M176 226v-56" stroke="#79f2fb" stroke-width="16" stroke-linecap="round" fill="none"/><g fill="url(#sea)" stroke="#79f2fb" stroke-width="4" stroke-linecap="round"><path d="M176 176c-4-30-26-44-52-50-10-2-18-12-16-24" fill="none" stroke-width="13"/><path d="M176 176c4-34 30-48 58-52 10-2 16-12 14-24" fill="none" stroke-width="13"/><path d="M176 158c0-32 2-52 2-72" fill="none" stroke-width="13"/><path d="M140 118c-8-18-8-32-4-46" fill="none" stroke-width="10"/><path d="M216 122c8-18 10-34 6-48" fill="none" stroke-width="10"/></g><g fill="#9ef7d3" opacity=".75">${[[108,52],[178,64],[248,50],[136,72],[222,74]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g>`;
else if(type==='shrimp') body=`<path d="M96 138c8-42 48-70 96-70 44 0 78 22 92 56-16 30-52 50-96 52-42 2-76-14-92-38Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M284 124c14 8 22 22 20 38-14-4-26-14-34-26Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><g stroke="rgba(158,247,211,.55)" stroke-width="3" fill="none">${[132,158,184,210,236].map(x=>`<path d="M${x} 84c2 30 2 62 0 84"/>`).join('')}</g><g stroke="#79f2fb" stroke-width="3" fill="none" stroke-linecap="round">${[128,152,176,200].map(x=>`<path d="M${x} 172c-4 18-10 28-18 34"/>`).join('')}</g><path d="M100 108c-24-18-46-28-70-30m70 44c-26-6-50-6-72 2" stroke="#79f2fb" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="112" cy="118" r="6" fill="#04161e"/>`;
else if(type==='isopod') body=`<ellipse cx="180" cy="126" rx="76" ry="58" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><g stroke="#79f2fb" stroke-width="3" fill="none" opacity=".75">${[-40,-22,-4,14,32].map(y=>`<path d="M108 ${126+y}c40 ${y>0?10:-10} 104 ${y>0?10:-10} 144 0"/>`).join('')}</g><path d="M112 92c-10-16-8-30 2-40m8 130c-12 14-14 28-6 40" stroke="#79f2fb" stroke-width="3" fill="none" stroke-linecap="round"/><g stroke="#79f2fb" stroke-width="3" fill="none" stroke-linecap="round">${[136,168,200,228].map(x=>`<path d="M${x} 178c-2 16-8 26-16 32"/><path d="M${x} 74c-2-16-8-26-16-32"/>`).join('')}</g><circle cx="122" cy="112" r="5.5" fill="#04161e"/><circle cx="122" cy="140" r="5.5" fill="#04161e"/>`;
else if(type==='seacucumber') body=`<path d="M92 128c0-30 40-48 90-48s88 18 88 48c0 28-38 48-88 48s-90-20-90-48Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><g stroke="#79f2fb" stroke-width="4" fill="none" stroke-linecap="round">${[118,150,182,214,246].map(x=>`<path d="M${x} 172c-2 22-4 36-2 48"/>`).join('')}</g><g stroke="#9ef7d3" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M150 82c-4-24-2-40 4-52"/><path d="M212 82c4-24 2-40-4-52"/></g><circle cx="150" cy="26" r="6" fill="#9ef7d3"/><circle cx="216" cy="26" r="6" fill="#9ef7d3"/><g fill="rgba(158,247,211,.4)">${[124,158,192,226].map(x=>`<circle cx="${x}" cy="112" r="5"/>`).join('')}</g>`;
else if(type==='worm') body=`<g stroke="#79f2fb" stroke-width="4" fill="url(#sea)">${[[96,'M96 232V118c0-16 24-16 24 0v114Z'],[150,'M150 232V88c0-17 26-17 26 0v144Z'],[212,'M212 232V126c0-16 24-16 24 0v106Z'],[262,'M262 232V150c0-15 22-15 22 0v82Z']].map(([x,d])=>`<path d="${d}"/>`).join('')}</g><g fill="#ff9078" opacity=".9"><path d="M96 122c0-22 24-22 24 0-4 12-20 12-24 0Z"/><path d="M150 92c0-24 26-24 26 0-4 14-22 14-26 0Z"/><path d="M212 130c0-22 24-22 24 0-4 12-20 12-24 0Z"/><path d="M262 154c0-20 22-20 22 0-4 11-18 11-22 0Z"/></g><g stroke="#ff9078" stroke-width="3" fill="none" stroke-linecap="round"><path d="M108 116V86m0 30-12-24m12 24 12-24"/><path d="M163 86V52m0 34-14-26m14 26 14-26"/><path d="M224 124V96m0 28-12-22m12 22 12-22"/></g><path d="M20 236h320" stroke="rgba(205,182,148,.5)" stroke-width="6" stroke-linecap="round"/>`;
else if(type==='plankton') body=`<g fill="url(#sea)" stroke="#79f2fb" stroke-width="3.5"><circle cx="118" cy="102" r="42"/><circle cx="232" cy="150" r="34"/></g><g stroke="rgba(158,247,211,.6)" stroke-width="2.5" fill="none">${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<line x1="${(118+Math.cos(a)*12).toFixed(0)}" y1="${(102+Math.sin(a)*12).toFixed(0)}" x2="${(118+Math.cos(a)*40).toFixed(0)}" y2="${(102+Math.sin(a)*40).toFixed(0)}"/>`}).join('')}${Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return `<line x1="${(232+Math.cos(a)*10).toFixed(0)}" y1="${(150+Math.sin(a)*10).toFixed(0)}" x2="${(232+Math.cos(a)*32).toFixed(0)}" y2="${(150+Math.sin(a)*32).toFixed(0)}"/>`}).join('')}</g><g fill="#9ef7d3" opacity=".8"><rect x="248" y="52" width="46" height="22" rx="11"/><rect x="60" y="176" width="54" height="20" rx="10"/><circle cx="176" cy="196" r="11"/><circle cx="300" cy="112" r="8"/><circle cx="52" cy="120" r="7"/></g><g stroke="rgba(158,247,211,.45)" stroke-width="2" fill="none"><path d="M248 63h46M60 186h54"/></g>`;
else if(type==='kelp') body=`<g stroke="#7cf0c6" stroke-width="6" fill="none" stroke-linecap="round"><path d="M92 236c-6-70 6-124 22-176"/><path d="M180 236c-4-78 4-136 14-196"/><path d="M268 236c8-66 0-118-14-166"/></g><g fill="rgba(124,240,198,.42)" stroke="#7cf0c6" stroke-width="2.5"><path d="M114 74c26-10 44-4 52 12-26 8-44 4-52-12Zm-14 62c26-10 44-4 52 12-26 8-44 4-52-12Zm96-90c26-10 44-4 52 12-26 8-44 4-52-12Zm4 66c26-10 44-4 52 12-26 8-44 4-52-12Zm-40-14c-26-10-44-4-52 12 26 8 44 4 52-12Zm88 26c-26-10-44-4-52 12 26 8 44 4 52-12Z"/></g><g fill="#9ef7d3">${[[118,66],[104,128],[206,40],[210,106],[142,102],[250,140]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g><path d="M20 236h320" stroke="rgba(205,182,148,.45)" stroke-width="6" stroke-linecap="round"/>`;
else if(type==='seal') body=`<path d="M64 152c14-46 62-76 122-76 54 0 96 24 116 60-18 26-56 44-104 48-28 2-52-2-70-8-22 10-46 6-64-24Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M286 140c18 4 32 16 36 32-18 2-34-2-46-12Zm-10 22c14 12 20 28 16 42-14-6-24-18-28-32Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><path d="M140 166c-8 22-24 34-46 34 6-18 22-30 46-34Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><circle cx="106" cy="118" r="8" fill="#04161e"/><circle cx="109" cy="115" r="2.6" fill="#c8fff2"/><circle cx="76" cy="132" r="6" fill="#04161e" opacity=".7"/><g stroke="rgba(200,255,242,.6)" stroke-width="2" stroke-linecap="round"><path d="M70 130 40 122m30 34-30 4m32-24-32-10"/></g>`;
else if(type==='dolphin') body=`<path d="M34 148c34-46 96-72 158-64 36 5 66 22 104 32-30 16-58 22-88 20-24 26-64 40-104 34-30-4-56-12-70-22Z" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><path d="M296 116l32-24c4 30-2 52-18 66Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><path d="M162 82c10-28 32-42 52-38-8 20-26 34-52 38Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><path d="M150 168c-4 22-18 34-38 36 4-18 18-30 38-36Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="3"/><path d="M34 148c-16 2-26-4-30-14 12-4 22-4 30 2Z" fill="url(#fin)" stroke="#79f2fb" stroke-width="2.5"/><circle cx="78" cy="132" r="6.5" fill="#04161e"/><circle cx="80" cy="130" r="2.2" fill="#c8fff2"/><path d="M62 148c14 4 26 4 38 0" stroke="#04161e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
else body=`<circle cx="180" cy="125" r="62" fill="url(#sea)" stroke="#79f2fb" stroke-width="4"/><circle cx="160" cy="114" r="6" fill="#9ef7d3"/><circle cx="202" cy="114" r="6" fill="#9ef7d3"/>`;
return `<svg class="${cls}" viewBox="0 0 360 250" role="img" aria-label="ilustração de ${esc(type)}">${common}${body}</svg>`;
}
function miniArt(type){return `<div class="miniArt">${art(type,'small')}</div>`}

const DAILY_DISCOVERY=[
  {title:'Fonte hidrotermal',depth:'~2.500 m',type:'VENT',text:'Comunidades profundas sustentadas por energia química.'},
  {title:'Zona crepuscular',depth:'200–1.000 m',type:'MESOPELÁGICA',text:'A luz diminui e a migração vertical ganha importância.'},
  {title:'Baleia-azul',depth:'superfície–profundidade',type:'ESPÉCIE',text:'Uma das grandes histórias de escala, migração e conservação.'},
  {title:'Sinal de eDNA',depth:'variável',type:'BIOLOGIA',text:'Vestígios genéticos podem indicar organismos sem observação direta.'}
];
function getLog(){try{return JSON.parse(localStorage.getItem('abyssalLog')||'{"missions":[],"species":[],"discoveries":0,"map":[]}')}catch{return {missions:[],species:[],discoveries:0,map:[]}}}
function saveLog(log){try{localStorage.setItem('abyssalLog',JSON.stringify(log))}catch{}}
function markSpecies(id){const log=getLog();if(!log.species.includes(id)){log.species.push(id);log.discoveries=(log.discoveries||0)+1;saveLog(log)}}
function markMission(id){const log=getLog();if(!log.missions.includes(id))log.missions.push(id);saveLog(log)}
function markMap(region){const log=getLog();if(!log.map.includes(region))log.map.push(region);saveLog(log)}
/* ============================================================
   MODOS DE LEITURA
   Explorador  — narrativa, imagem e curiosidade em primeiro plano.
   Cientista   — números, códigos IUCN, incertezas e fontes.
   O modo muda o conteúdo, não só a cor: o catálogo troca de fichas
   ilustradas para tabela de dados, as fichas ganham ou perdem blocos
   e o capítulo do oceano mostra nota de método ou curiosidade.
   ============================================================ */
const MODES={
  explorador:{name:'Exploração',short:'EXPLORAÇÃO',
    lead:'Você percorre o atlas pela imagem e pela narrativa.',
    bullets:['Fichas ilustradas com ilustração científica grande','Uma curiosidade em destaque por espécie','Convites para o mapa, o jogo e o diário']},
  cientista:{name:'Cientista',short:'CIENTISTA',
    lead:'Você percorre o atlas pelos números e pelas fontes.',
    bullets:['Catálogo em tabela ordenável, com faixa em metros','Código IUCN, bacias e fonte em cada linha','Notas de método e ressalvas de incerteza']}
};
function getMode(){
  try{const m=localStorage.getItem('abyssalMode');if(MODES[m])return m}catch{}
  try{if(localStorage.getItem('abyssalScientist')==='1')return 'cientista'}catch{}
  return 'explorador';
}
function modeIs(m){return getMode()===m}
function applyMode(){
  const m=getMode();
  document.body.dataset.mode=m;
  document.body.classList.toggle('scientist-mode',m==='cientista');
  document.querySelectorAll('[data-mode-btn]').forEach(b=>{
    const on=b.dataset.modeBtn===m;
    b.classList.toggle('active',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
  const lab=document.getElementById('modeChipLabel');
  if(lab)lab.textContent=MODES[m].short;
  const sw=document.getElementById('modeSwitch');
  if(sw)sw.title=`Modo ${MODES[m].name}. Clique para alternar.`;
}
function setMode(m){
  if(!MODES[m])return;
  if(getMode()===m){applyMode();return}
  try{localStorage.setItem('abyssalMode',m);localStorage.setItem('abyssalScientist',m==='cientista'?'1':'0')}catch{}
  applyMode();
  render();
  toast('Modo '+MODES[m].name.toLowerCase()+' ativado');
}
function toggleMode(){setMode(modeIs('cientista')?'explorador':'cientista')}
/* nomes antigos mantidos para não quebrar chamadas existentes */
function toggleScientistMode(){toggleMode()}
function renderModeButtons(){applyMode()}
function modePanel(){
  const cur=getMode();
  return `<div class="modeCards" role="group" aria-label="Modo de leitura">
    ${Object.keys(MODES).map(k=>{const M=MODES[k];return `<button class="modeCard${k===cur?' active':''}" data-mode-btn="${k}" aria-pressed="${k===cur?'true':'false'}" onclick="setMode('${k}')">
      <span class="modeCardTop"><b>${M.name}</b><i aria-hidden="true"></i></span>
      <span class="modeCardLead">${M.lead}</span>
      <ul>${M.bullets.map(x=>`<li>${x}</li>`).join('')}</ul>
    </button>`}).join('')}
  </div>`;
}
/* nota de método: só aparece para quem escolheu o modo cientista */
function sciNote(txt){return modeIs('cientista')?`<p class="sciNote">${txt}</p>`:''}
function expNote(txt){return modeIs('explorador')?`<p class="expNote">${txt}</p>`:''}
/* ============================================================
   TEMA CLARO / ESCURO
   O escuro é o padrão do atlas. O claro existe para leitura longa,
   luz ambiente forte e impressão. A escolha fica guardada neste
   navegador; sem escolha, o atlas segue a preferência do sistema.
   ============================================================ */
const THEMES={
  escuro:{name:'Escuro',short:'ESCURO',meta:'#04121b'},
  claro:{name:'Claro',short:'CLARO',meta:'#f2f5f6'}
};
function systemTheme(){
  try{return matchMedia('(prefers-color-scheme: light)').matches?'claro':'escuro'}catch{return 'escuro'}
}
function getTheme(){
  try{const t=localStorage.getItem('abyssalTheme');if(THEMES[t])return t}catch{}
  return systemTheme();
}
function applyTheme(){
  const t=getTheme();
  document.documentElement.dataset.theme=t;
  document.documentElement.style.colorScheme=(t==='claro'?'light':'dark');
  const lab=document.getElementById('themeChipLabel');
  if(lab)lab.textContent=THEMES[t].short;
  const btn=document.getElementById('themeSwitch');
  if(btn){
    btn.title=`Tema ${THEMES[t].name.toLowerCase()}. Clique para alternar.`;
    btn.setAttribute('aria-pressed',t==='claro'?'true':'false');
  }
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',THEMES[t].meta);
}
function setTheme(t){
  if(!THEMES[t])return;
  try{localStorage.setItem('abyssalTheme',t)}catch{}
  applyTheme();
}
function toggleTheme(){
  setTheme(getTheme()==='claro'?'escuro':'claro');
  toast('Tema '+THEMES[getTheme()].name.toLowerCase());
}
/* acompanha o sistema enquanto o usuário não escolher manualmente */
try{
  matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>{
    let escolhido=null;
    try{escolhido=localStorage.getItem('abyssalTheme')}catch{}
    if(!THEMES[escolhido])applyTheme();
  });
}catch{}
function dailyDiscovery(){return DAILY_DISCOVERY[new Date().getDate()%DAILY_DISCOVERY.length]}
function mapPage(){const regions=[['Atlântico','Correntes, plataformas e grande diversidade de habitats.','/oceano?bacia=atlantico',50,20],['Pacífico','Maior bacia oceânica, com forte variedade de profundidades.','/oceano?bacia=pacifico',78,42],['Índico','Gradientes térmicos e circulação conectada às monções.','/oceano?bacia=indico',74,73],['Ártico','Gelo marinho, frio extremo e ecossistemas polares.','/oceano?bacia=artico',28,72],['Antártico','Circumpolar, produtivo e conectado às grandes bacias.','/oceano?bacia=antartico',22,42]];const log=getLog();return `<section class="mapPage"><div class="mapIntro"><span class="kicker">ABYSSAL / MAPA OCEÂNICO</span><h1 class="display" style="margin-top:16px;font-size:clamp(3.2rem,7vw,7rem)">UM OCEANO.<br>VÁRIAS LENTES.</h1><p class="lede">Escolha uma grande bacia e descubra quais páginas do atlas ajudam a investigar aquela região. Cada visita entra no seu Diário de Bordo.</p></div><div class="oceanMap"><div class="mapOrbit"></div><div class="mapOrbit two"></div><div class="mapCenter"><div><strong>OCEANO<br>GLOBAL</strong><span>ATLAS ABYSSAL</span></div></div>${regions.map(r=>`<button class="mapNode ${log.map.includes(r[0])?'active':''}" style="left:${r[3]}%;top:${r[4]}%" onclick="markMap('${r[0]}');go('${r[2]}')"><b>${r[0]}</b><span>${r[1]}</span><small>${log.map.includes(r[0])?'VISITADO':'ABRIR INVESTIGAÇÃO'} →</small></button>`).join('')}</div><div class="mapInfo"><div class="interaction"><span class="kicker">COMO USAR</span><h3>Mapa → página → descoberta.</h3><p class="subtle">O mapa é uma porta de entrada. A informação detalhada continua nas páginas editoriais já existentes.</p></div><div class="interaction"><span class="kicker">PROGRESSO</span><h3>${log.map.length} / 5 regiões visitadas.</h3><p class="subtle">Visite regiões diferentes e acompanhe sua exploração no Diário de Bordo.</p></div></div></section>`}
