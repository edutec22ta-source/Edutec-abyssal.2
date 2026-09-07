function go(path){if(location.hash.slice(1)===path){render()}else{location.hash=path}const m=document.getElementById('mega');if(m)m.classList.remove('open')}
function esc(s){return String(s).replace(/[&<>"'`]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[m]))}
function slug(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
/* ============================================================
   Camada de conexão: liga cada ficha às bacias, zonas de
   profundidade, ecossistemas e fases do simulador.
   Não altera os dados biológicos das fichas — apenas os indexa.
   d:[mín,máx] em metros · z:zonas · r:bacias · e:ecossistemas
   m:fases do jogo · t:termos extras de busca · env:ambiente
   ============================================================ */
const REGIONS=[
 {id:'atlantico',name:'Atlântico',short:'ATL'},
 {id:'pacifico',name:'Pacífico',short:'PAC'},
 {id:'indico',name:'Índico',short:'IND'},
 {id:'artico',name:'Ártico',short:'ART'},
 {id:'antartico',name:'Antártico',short:'ANT'}
];
const ZONE_META=[
 {key:'epi',name:'Epipelágica',short:'Superfície',idx:0},
 {key:'meso',name:'Mesopelágica',short:'Mesopelágico',idx:1},
 {key:'bati',name:'Batipelágica',short:'Batipelágico',idx:2},
 {key:'abisso',name:'Abissopelágica',short:'Abissal',idx:3},
 {key:'hadal',name:'Hadopelágica',short:'Hadal',idx:4}
];
const ECO_NAME={reef:'Recifes de coral',mangrove:'Manguezais',kelp:'Florestas de kelp',open:'Mar aberto',seabed:'Fundo oceânico',vent:'Fontes hidrotermais',estuary:'Estuários',seagrass:'Pradarias marinhas'};
const META={
'tubarao-branco':{d:[0,1200],z:['epi','meso','bati'],r:['atlantico','pacifico','indico'],e:['open','kelp','seabed'],m:['F01'],env:'Costeiro e mar aberto',t:'predador de topo eletrorecepcao cacao branco carcharodon'},
'orca':{d:[0,1000],z:['epi','meso'],r:['atlantico','pacifico','indico','artico','antartico'],e:['open','kelp'],m:['F01','F02'],env:'Mar aberto e águas polares',t:'baleia assassina cetaceo golfinho ecotipo cultura'},
'baleia-azul':{d:[0,500],z:['epi','meso'],r:['atlantico','pacifico','indico','antartico'],e:['open'],m:['F02'],env:'Mar aberto',t:'maior animal misticeto krill barbatana canto'},
'lula-gigante':{d:[300,1000],z:['meso','bati'],r:['atlantico','pacifico','indico'],e:['open','seabed'],m:['F02','F03'],env:'Oceano profundo',t:'cefalopode architeuthis olho gigante kraken'},
'polvo-comum':{d:[0,200],z:['epi'],r:['atlantico','pacifico','indico'],e:['reef','seabed','kelp'],m:['F01'],env:'Costeiro',t:'cefalopode camuflagem inteligencia toca bentonico'},
'cavalo-marinho':{d:[0,30],z:['epi'],r:['atlantico','pacifico','indico'],e:['seagrass','reef','estuary','mangrove'],m:['F01'],env:'Costeiro raso',t:'singnatideo gestacao masculina cauda preensil hippocampus'},
'tartaruga-verde':{d:[0,100],z:['epi'],r:['atlantico','pacifico','indico'],e:['seagrass','reef','mangrove'],m:['F01'],env:'Costeiro tropical',t:'quelonio desova migracao herbivoro'},
'peixe-lua':{d:[0,800],z:['epi','meso'],r:['atlantico','pacifico','indico'],e:['open'],m:['F02'],env:'Mar aberto',t:'mola mola peixe osseo gigante gelatinoso'},
'narval':{d:[0,1500],z:['epi','meso','bati'],r:['artico','atlantico'],e:['open'],m:['F02'],env:'Ártico',t:'dente helicoidal unicornio gelo ecolocalizacao'},
'peixe-pescador':{d:[200,2000],z:['meso','bati'],r:['atlantico','pacifico','indico'],e:['open'],m:['F02','F03'],env:'Oceano profundo',t:'bioluminescencia ilicio emboscada tamboril abissal'},
'caranguejo-yeti':{d:[2200,2400],z:['bati'],r:['pacifico','antartico'],e:['vent','seabed'],m:['F04'],env:'Fontes hidrotermais',t:'quimiossintese kiwa peludo bacteria simbiose'},
'agua-viva-juba-de-leao':{d:[0,600],z:['epi','meso'],r:['atlantico','pacifico','artico'],e:['open'],m:['F02'],env:'Águas frias',t:'cnidocito gelatinoso tentaculo urticante cyanea'},
'tubarao-baleia':{d:[0,1900],z:['epi','meso','bati'],r:['atlantico','pacifico','indico'],e:['open','reef'],m:['F01','F02'],env:'Mar aberto tropical',t:'maior peixe filtrador plancton manchas rhincodon'},
'tubarao-martelo':{d:[0,1000],z:['epi','meso'],r:['atlantico','pacifico','indico'],e:['open','reef','mangrove'],m:['F01'],env:'Costeiro e mar aberto',t:'sphyrna cefalofolio bercario cardume monte submarino'},
'tubarao-mako':{d:[0,750],z:['epi','meso'],r:['atlantico','pacifico','indico'],e:['open'],m:['F02'],env:'Mar aberto',t:'velocidade endotermia regional pelagico isurus'},
'tubarao-groenlandia':{d:[0,2200],z:['epi','meso','bati'],r:['artico','atlantico'],e:['open','seabed'],m:['F03'],env:'Ártico profundo',t:'longevidade seculos lento frio somniosus'},
'raia-manta':{d:[0,1000],z:['epi','meso'],r:['atlantico','pacifico','indico'],e:['open','reef'],m:['F01','F02'],env:'Mar aberto tropical',t:'filtrador lobos cefalicos estacao de limpeza mobula jamanta'},
'enguia-lobo':{d:[0,225],z:['epi'],r:['pacifico'],e:['kelp','seabed','reef'],m:['F01'],env:'Costeiro rochoso',t:'toca dentes ourico anarrhichthys peixe lobo'},
'peixe-palhaco':{d:[1,15],z:['epi'],r:['pacifico','indico'],e:['reef'],m:['F01'],env:'Recife de coral',t:'anemona mutualismo muco amphiprion nemo hermafrodita'},
'bodiao-limpador':{d:[1,40],z:['epi'],r:['pacifico','indico'],e:['reef'],m:['F01'],env:'Recife de coral',t:'estacao de limpeza simbiose parasita labroides'},
'atum-rabilho':{d:[0,1000],z:['epi','meso'],r:['atlantico'],e:['open'],m:['F02'],env:'Mar aberto',t:'migracao transatlantica endotermia pesca thunnus'},
'sardinha-verdadeira':{d:[0,100],z:['epi'],r:['atlantico'],e:['open','estuary'],m:['F01'],env:'Plataforma continental',t:'cardume forrageira ressurgencia sardinella pesca'},
'mero':{d:[0,100],z:['epi'],r:['atlantico'],e:['reef','mangrove','estuary'],m:['F01'],env:'Costeiro tropical',t:'garoupa agregacao reprodutiva bercario epinephelus'},
'peixe-voador':{d:[0,20],z:['epi'],r:['atlantico','pacifico','indico'],e:['open'],m:['F01'],env:'Superfície oceânica',t:'planeio nadadeira peitoral exocoetus fuga'},
'celacanto':{d:[150,700],z:['meso'],r:['indico'],e:['seabed'],m:['F03'],env:'Encostas profundas',t:'fossil vivo nadadeira lobada latimeria caverna'},
'peixe-lanterna':{d:[200,1000],z:['meso'],r:['atlantico','pacifico','indico','antartico'],e:['open'],m:['F02'],env:'Zona crepuscular',t:'migracao vertical fotoforo myctophidae biomassa sonar'},
'caracol-do-mar-hadal':{d:[6900,8000],z:['hadal'],r:['pacifico'],e:['seabed'],m:['F06'],env:'Fossa oceânica',t:'fossa marianas pressao extrema gelatinoso pseudoliparis'},
'baleia-jubarte':{d:[0,200],z:['epi'],r:['atlantico','pacifico','indico','antartico'],e:['open','reef'],m:['F01','F02'],env:'Mar aberto e costeiro',t:'canto rede de bolhas migracao megaptera cetaceo'},
'cachalote':{d:[0,2000],z:['epi','meso','bati'],r:['atlantico','pacifico','indico','antartico'],e:['open','seabed'],m:['F02','F03'],env:'Oceano profundo',t:'mergulho profundo ecolocalizacao espermacete physeter lula'},
'golfinho-nariz-de-garrafa':{d:[0,300],z:['epi','meso'],r:['atlantico','pacifico','indico'],e:['open','estuary','reef','seagrass'],m:['F01'],env:'Costeiro e oceânico',t:'assobio assinatura ecolocalizacao tursiops ferramenta esponja'},
'foca-de-weddell':{d:[0,600],z:['epi','meso'],r:['antartico'],e:['open','seabed'],m:['F02'],env:'Gelo marinho antártico',t:'mergulho apneia gelo pinipede leptonychotes'},
'morsa':{d:[0,100],z:['epi'],r:['artico'],e:['seabed'],m:['F01'],env:'Plataforma ártica',t:'presa vibrissa bivalve gelo odobenus pinipede'},
'tartaruga-de-couro':{d:[0,1200],z:['epi','meso','bati'],r:['atlantico','pacifico','indico'],e:['open'],m:['F02'],env:'Mar aberto',t:'maior tartaruga agua viva mergulho profundo dermochelys plastico'},
'tartaruga-de-pente':{d:[0,90],z:['epi'],r:['atlantico','pacifico','indico'],e:['reef'],m:['F01'],env:'Recife de coral',t:'esponja casco tartaruga comercio eretmochelys'},
'pinguim-imperador':{d:[0,550],z:['epi','meso'],r:['antartico'],e:['open'],m:['F02'],env:'Gelo marinho antártico',t:'colonia inverno mergulho ave aptenodytes gelo'},
'albatroz-errante':{d:[0,10],z:['epi'],r:['antartico','atlantico','indico','pacifico'],e:['open'],m:['F01'],env:'Superfície oceânica',t:'envergadura voo dinamico espinhel diomedea ave'},
'lula-colossal':{d:[300,2000],z:['meso','bati'],r:['antartico'],e:['open'],m:['F03'],env:'Oceano Antártico profundo',t:'maior invertebrado gancho mesonychoteuthis cachalote'},
'nautilo':{d:[100,500],z:['meso'],r:['pacifico','indico'],e:['reef','seabed'],m:['F02'],env:'Encostas recifais',t:'concha camara sifunculo fossil vivo nautilus'},
'sepia-comum':{d:[0,200],z:['epi'],r:['atlantico'],e:['seabed','seagrass'],m:['F01'],env:'Fundos costeiros',t:'cromatoforo camuflagem polarizacao sepia choco'},
'polvo-dumbo':{d:[1000,4000],z:['bati','abisso'],r:['atlantico','pacifico','indico'],e:['seabed'],m:['F05'],env:'Fundo oceânico profundo',t:'nadadeira orelha abissal grimpoteuthis paira'},
'lula-vampira':{d:[600,1200],z:['meso','bati'],r:['atlantico','pacifico','indico'],e:['open'],m:['F02','F03'],env:'Zona de mínimo de oxigênio',t:'neve marinha detrito filamento vampyroteuthis oxigenio'},
'caranguejo-aranha-japones':{d:[150,800],z:['meso'],r:['pacifico'],e:['seabed'],m:['F03'],env:'Fundo profundo',t:'gigantismo pernas longas macrocheira decapode'},
'lagosta-espinhosa':{d:[0,90],z:['epi'],r:['atlantico'],e:['reef','seagrass','mangrove'],m:['F01'],env:'Recifes e fundos costeiros',t:'fila indiana migracao antena panulirus pesca'},
'krill-antartico':{d:[0,500],z:['epi','meso'],r:['antartico'],e:['open'],m:['F02'],env:'Oceano Antártico',t:'enxame biomassa teia alimentar euphausia gelo'},
'isopode-gigante':{d:[300,2100],z:['meso','bati'],r:['atlantico'],e:['seabed'],m:['F03','F05'],env:'Fundo profundo',t:'carniça gigantismo detritivoro bathynomus crustaceo'},
'medusa-lua':{d:[0,200],z:['epi'],r:['atlantico','pacifico','indico'],e:['open','estuary'],m:['F01'],env:'Águas costeiras',t:'polipo estrobilizacao gonada aurelia gelatinoso'},
'coral-chifre-de-alce':{d:[1,20],z:['epi'],r:['atlantico'],e:['reef'],m:['F01'],env:'Recife raso',t:'zooxantela branqueamento construtor acropora caribe'},
'estrela-do-mar-girassol':{d:[0,435],z:['epi','meso'],r:['pacifico'],e:['kelp','seabed'],m:['F01'],env:'Costeiro do Pacífico',t:'doenca de desgaste ourico predador pycnopodia kelp'},
'ourico-do-mar-roxo':{d:[0,90],z:['epi'],r:['pacifico'],e:['kelp','seabed'],m:['F01'],env:'Costão rochoso',t:'lanterna de aristoteles deserto de ourico herbivoro strongylocentrotus'},
'porco-do-mar':{d:[1000,6000],z:['bati','abisso'],r:['atlantico','pacifico','indico'],e:['seabed'],m:['F05'],env:'Planície abissal',t:'pepino do mar detrito pe ambulacral scotoplanes holoturia'},
'peixe-vibora':{d:[200,2000],z:['meso','bati'],r:['atlantico','pacifico','indico'],e:['open'],m:['F02','F03'],env:'Oceano profundo',t:'dente fotoforo contrailuminacao chauliodus emboscada'},
'peixe-dragao':{d:[500,2000],z:['meso','bati'],r:['atlantico','pacifico'],e:['open'],m:['F02','F03'],env:'Oceano profundo',t:'luz vermelha fotoforo clorofila malacosteus visao'},
'verme-tubo-gigante':{d:[1500,3300],z:['bati'],r:['pacifico'],e:['vent','seabed'],m:['F04'],env:'Fontes hidrotermais',t:'quimiossintese trofossoma simbiose sulfeto riftia'},
'prochlorococcus':{d:[0,200],z:['epi'],r:['atlantico','pacifico','indico'],e:['open'],m:['F01'],env:'Zona iluminada',t:'cianobacteria fotossintese giro producao primaria microscopico'},
'diatomaceas':{d:[0,200],z:['epi'],r:['atlantico','pacifico','indico','artico','antartico'],e:['open','estuary'],m:['F01'],env:'Zona iluminada',t:'frustula silica floracao bomba de carbono fitoplancton microscopico'},
'anfipode-hadal':{d:[6000,11000],z:['abisso','hadal'],r:['pacifico'],e:['seabed'],m:['F06'],env:'Fossa oceânica',t:'fossa detritivoro armadilha iscada hirondellea carniça hadal'},
'peixe-gota':{d:[600,1200],z:['meso','bati'],r:['pacifico','indico'],e:['seabed'],m:['F03'],env:'Fundo profundo',t:'gelatinoso bentonico arrasto psychrolutes blobfish'},
'kelp-gigante':{d:[0,40],z:['epi'],r:['pacifico','antartico'],e:['kelp'],m:['F01'],env:'Costa temperada fria',t:'alga parda floresta submersa apressorio macrocystis flutuador'}
};
