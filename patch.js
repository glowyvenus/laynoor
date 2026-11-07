/* LAYNOOR – patch : aujourd'hui, Jumu'a, explication des jeûnes, météo, Qibla */
(function(){
var css=':root{--cu:#B5683F;--gold:#F1DFA8;--goldd:#A9822A}'
+'.cal .today{background:#C9677F!important;color:#fff!important;border-radius:12px;box-shadow:0 0 0 2px var(--card),0 0 0 4px #F2C6D1}'
+'.cal .today .cn{color:#FFE3EA!important}'
+'.cal:not(.ecal)>button{position:relative}'
+'.cal:not(.ecal)>button:nth-child(7n+5):not(.today):not(.jb):not(.rm):not(.pd){background:var(--gold);color:#5C4713}'
+'.cal:not(.ecal)>button:nth-child(7n+5)::before{content:"✦";position:absolute;top:1px;right:4px;font-size:8px;color:var(--goldd)}'
+'.cal:not(.ecal)>button:nth-child(7n+5).today::before{color:#fff}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var hm=new Intl.DateTimeFormat('fr-FR-u-ca-islamic-umalqura-nu-latn',{month:'long'});
function why(d){var x=fi(d),w=new Date(d+'T12:00').getDay(),mn=hm.format(new Date(d+'T12:00')),r=[];
 if(x.no)r.push('Jeûne interdit ce jour (Aïd ou jours de tachriq).');
 else{
  if(x.ram)r.push('🌙 <b>Ramadan</b> : jeûne obligatoire (jour '+x.h.day+').');
  if(x.jb)r.push('🤍 <b>Jour blanc</b> (Ayyam al-Bid) : nous sommes le '+x.h.day+' '+mn+'. Il est recommandé de jeûner les 13, 14 et 15 de chaque mois hégirien.');
  if(x.lj)r.push('Le <b>'+(w==1?'lundi':'jeudi')+'</b> est un jour de jeûne recommandé chaque semaine (sunna).');
  if(w==5&&!x.ram)r.push('✦ <b>Vendredi (Jumu’a)</b> : il vaut mieux ne pas le jeûner seul, sans la veille ou le lendemain.');
 }
 return r}

/* météo */
var busy=false;
function wc(c){return c===0?['☀️','Ciel dégagé']:c<=2?['🌤️','Éclaircies']:c===3?['☁️','Couvert']:c<=48?['🌫️','Brouillard']:c<=57?['🌦️','Bruine']:c<=67?['🌧️','Pluie']:c<=77?['🌨️','Neige']:c<=82?['🌦️','Averses']:['⛈️','Orage']}
function loadWx(){if(busy)return;busy=true;
 var go=function(a,o){fetch('https://api.open-meteo.com/v1/forecast?latitude='+a+'&longitude='+o+'&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto')
  .then(function(r){return r.json()}).then(function(j){S.wx={ts:Date.now(),t:Math.round(j.current.temperature_2m),c:j.current.weather_code,v:Math.round(j.current.wind_speed_10m),mn:Math.round(j.daily.temperature_2m_min[0]),mx:Math.round(j.daily.temperature_2m_max[0])};busy=false;save();draw()})
  .catch(function(){S.wx={ts:Date.now(),err:1};busy=false;save();draw()})};
 if(S.loc.set)go(S.loc.lat,S.loc.lng);
 else if(navigator.geolocation)navigator.geolocation.getCurrentPosition(function(p){S.loc={lat:p.coords.latitude,lng:p.coords.longitude,set:1};save();go(S.loc.lat,S.loc.lng)},function(){busy=false;alert('Localisation refusée : autorise-la pour afficher la météo.')});
 else busy=false}
act.prd=function(id){var q=id.split('|');S.pr[q[0]]=S.pr[q[0]]||{};S.pr[q[0]][q[1]]=!S.pr[q[0]][q[1]]};
act.bkex=function(){var f=new File([JSON.stringify(S)],'laynoor-sauvegarde.json',{type:'application/json'});
 if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(function(){});
 else{var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove()}};
act.bkim=function(){var i=document.getElementById('bkf');if(i)i.click()};
document.addEventListener('change',function(e){if(e.target.id!=='bkf')return;var f=e.target.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){try{JSON.parse(r.result);if(confirm('Remplacer toutes les données de cet appareil par cette sauvegarde ?')){localStorage.setItem('laynoor',r.result);location.reload()}}catch(x){alert('Fichier de sauvegarde invalide.')}};r.readAsText(f)});
/* icône : retire les anciens liens et force le rechargement */
document.querySelectorAll('link[rel="apple-touch-icon"],link[rel="icon"]').forEach(function(l){l.remove()});
['apple-touch-icon','icon'].forEach(function(rel){var l=document.createElement('link');l.rel=rel;l.href='apple-touch-icon.png?v=2';document.head.appendChild(l)});
act.wx=function(){loadWx()};
act.goqibla=function(){page='islam';sub.islam='qibla';menuOpen=false;scrollTo(0,0)};

function enhance(){
 if(page==='home'){var h=document.querySelector('.hero .row');
  if(h&&!h.dataset.p){h.dataset.p=1;var w=S.wx,fresh=w&&Date.now()-w.ts<36e5;
   if(w&&!w.err){var i=wc(w.c);h.innerHTML='<span style="font-size:22px">'+i[0]+'</span><b>'+w.t+'°</b><span class="mut">'+i[1]+' · '+w.mn+'°/'+w.mx+'° · vent '+w.v+' km/h</span>'}
   else h.innerHTML='<span class="sun"></span><b>—°</b><button class="btn" data-a="wx" style="padding:5px 12px">'+(w&&w.err?'Réessayer la météo':'Afficher la météo')+'</button>';
   if(S.loc.set&&!fresh&&!busy)loadWx()}}
 if(page==='org'&&sub.org==='agenda'){var r=why(sel);if(r.length){var done=false;
  document.querySelectorAll('p.mut').forEach(function(p){if(!done&&/jeûne recommandé|Jeûne interdit|Ramadan/.test(p.textContent)){p.innerHTML=r.join('<br>');p.style.color='var(--ink)';done=true}});
  if(!done){var e=document.getElementById('etm');if(e&&e.parentNode)e.parentNode.insertAdjacentHTML('afterend','<p class="mut" style="margin:6px 0 2px;color:var(--ink)">'+r.join('<br>')+'</p>')}}}

 if(page==='org'&&sub.org==='agenda'){var fut=sel>today,cur=sel===today;
  document.querySelectorAll('.it').forEach(function(it){var sp=it.querySelectorAll(':scope>span');if(!sp[1]||sp[1].textContent.indexOf('Prière · ')!==0)return;
   var nm=sp[1].textContent.slice(9),k=P.find(function(q){return PF[q]===nm});if(!k)return;
   var done=!!(S.pr[sel]||{})[k];
   Array.prototype.slice.call(it.childNodes).forEach(function(n){if(n.nodeType===3||(n.classList&&n.classList.contains('heart')))it.removeChild(n)});
   var h;
   if(cur)h='<button class="heart" data-a="pr" data-id="'+k+'" aria-label="'+nm+'" style="'+(done?'color:#3B8DB5':'')+'">'+(done?'♥':'♡')+'</button>';
   else if(fut)h='<span class="heart" style="opacity:.35">♡</span>';
   else h='<button class="heart" data-a="prd" data-id="'+sel+'|'+k+'" aria-label="'+nm+'" style="'+(done?'font-size:22px':'')+'">'+(done?'🕌':'♡')+'</button>';
   it.insertAdjacentHTML('beforeend',h)})}
 if(page==='home'){document.querySelectorAll('.card h3').forEach(function(h){if(h.textContent.trim()==='Routines du jour'){var c=h.closest('.card');if(c)c.remove()}})}
 if(page==='home'&&!document.getElementById('qb-home')){A.insertAdjacentHTML('beforeend','<div class="card row sp" id="qb-home"><span>🕋 Qibla : <b>'+Math.round(qibla())+'°</b> <span class="mut">depuis le nord</span></span><button class="btn" data-a="goqibla">Boussole</button></div>')}
 if(page==='set'&&!document.getElementById('bk-card')){A.insertAdjacentHTML('beforeend','<div class="card" id="bk-card"><h3>Sauvegarde personnelle</h3><p class="mut">Tes données (prières, calendrier, cycle, famille…) vivent uniquement sur cet appareil. Exporte un fichier pour les garder en sécurité ou les retrouver ailleurs.</p><div class="row wrap"><button class="btn d" data-a="bkex">Exporter ma sauvegarde</button><button class="btn r" data-a="bkim">Importer une sauvegarde</button></div><input type="file" id="bkf" accept=".json,application/json" style="display:none"></div>')}
 if(page==='org'&&sub.org==='agenda'&&!document.getElementById('ics-card')){var o=S.icsOpt||{ev:1,fast:1,pr:0},ck=function(k,l){return'<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="ics-'+k+'" '+(o[k]?'checked':'')+' style="width:auto"> '+l+'</label>'};
  A.insertAdjacentHTML('beforeend','<div class="card" id="ics-card"><h3>Calendrier Apple</h3><p class="mut">Exporte tes rendez-vous vers l’app Calendrier de ton iPhone. C’est une copie à un instant donné : les changements faits ensuite dans LAYNOOR demandent un nouvel export.</p>'+ck('ev','Mes rendez-vous et événements')+ck('fast','Jours de jeûne recommandés (3 prochains mois)')+ck('pr','Horaires de prière (7 prochains jours)')+'<p><button class="btn d" data-a="icsx">Ajouter à Calendrier Apple</button></p><p class="mut">Ton suivi de cycle n’est jamais inclus. Réexporter ne crée pas de doublons.</p></div>')}
 if(page==='souv')svLoad();
 if(page==='set')document.querySelectorAll('.it').forEach(function(it){var s=it.querySelectorAll('span');if(s[0]&&s[0].textContent==='Météo'&&s[1])s[1].textContent='actif'});
}
var _d=draw;draw=function(){_d();try{enhance()}catch(e){console.error(e)}};

/* Qibla : demande le capteur tout de suite (obligatoire sur iPhone), puis la position */
var _sc=startCompass;
startCompass=function(){_sc();if(!S.loc.set&&navigator.geolocation)navigator.geolocation.getCurrentPosition(function(p){S.loc={lat:p.coords.latitude,lng:p.coords.longitude,set:1};save();draw()},function(){})};
/* ===== Cuisine : Batch & recettes regroupés ===== */
var CONS='Frigo 3 jours · congélateur 3 mois';
var BR=[
['Riz pilaf aux légumes','25 min · 8 portions · base à décliner',['600 g de riz basmati','2 oignons','4 carottes','200 g de petits pois','1,2 l de bouillon de légumes','Huile ou beurre'],['Rince le riz. Fais revenir les oignons et les carottes en petits dés.','Ajoute le riz, nacre-le 2 min, verse le bouillon chaud.','Couvre, cuis 12 min à feu doux avec les petits pois, laisse reposer 5 min.'],CONS+'. Refroidis-le en moins d’1 h, étale-le dans des boîtes plates. Réchauffe au micro-ondes avec une cuillère d’eau, ou au four couvert.'],
['Poulet au riz à la tomate (un seul plat)','50 min · 8 portions',['8 cuisses de poulet','2 oignons','3 gousses d’ail','2 poivrons','800 g de tomates concassées','500 g de riz','1 l de bouillon','2 c. à s. de paprika','1 c. à s. de cumin','Huile d’olive'],['Fais dorer le poulet dans un faitout, réserve. Fais revenir oignons, ail et poivrons.','Ajoute tomates, épices, riz et bouillon, remets le poulet.','Couvre et cuis 30 min au four à 180 °C, jusqu’à ce que le riz soit tendre.'],CONS+'. Congèle en portions individuelles. Réchauffe au four couvert 20 min à 180 °C ou au micro-ondes jusqu’à ce que ce soit bien chaud.'],
['Riz aux lentilles et oignons dorés','40 min · 8 portions',['300 g de lentilles vertes','300 g de riz','4 oignons','2 c. à c. de cumin','1,2 l d’eau ou de bouillon','Huile d’olive'],['Cuis les lentilles 15 min dans le bouillon.','Ajoute le riz et le cumin, cuis 15 min à couvert.','Fais dorer les oignons émincés dans l’huile et sers-les par-dessus.'],CONS+'. Les oignons dorés se conservent à part, sur le dessus au moment de réchauffer.'],
['Boulettes de bœuf sauce tomate','45 min · 8 portions (environ 40 boulettes)',['1 kg de bœuf haché','2 oignons','2 œufs','100 g de chapelure','1 bouquet de persil','1 c. à c. de cumin','800 g de tomates concassées','2 gousses d’ail','Huile d’olive'],['Mélange viande, oignons râpés, œufs, chapelure, persil et cumin. Forme des boulettes.','Fais-les dorer 5 min, puis ajoute les tomates et l’ail.','Laisse mijoter 25 min à feu doux.'],CONS+'. Se servent avec le riz ou les pâtes de la semaine. Réchauffe à la casserole ou au micro-ondes jusqu’à ce que ce soit bien chaud.'],
['Hachis parmentier','1 h · 8 portions · à gratiner',['1 kg de bœuf haché','1,2 kg de pommes de terre','2 oignons','2 carottes','400 g de tomates concassées','50 g de beurre','20 cl de lait','Fromage râpé'],['Fais revenir oignons, carottes et viande, ajoute les tomates, cuis 15 min.','Cuis les pommes de terre, écrase-les avec beurre et lait.','Monte en barquettes : viande, puis purée, puis fromage.'],CONS+'. Congèle avant de gratiner. Décongèle au frigo, puis four à 180 °C pendant 30 à 40 min jusqu’à ce que ce soit doré et bouillant à cœur.'],
['Cuisses de poulet au four citron-paprika','1 h 15 · 8 portions',['8 cuisses de poulet','4 c. à s. d’huile d’olive','1 citron','4 gousses d’ail','2 c. à c. de paprika','1 c. à c. de curcuma'],['Mélange huile, jus de citron, ail et épices, enrobe le poulet. Laisse mariner si possible 1 h.','Enfourne 45 à 50 min à 200 °C en retournant à mi-cuisson.'],CONS+'. Laisse refroidir, congèle par 2 cuisses. Réchauffe au four 20 min à 180 °C pour garder la peau tendre.'],
['Soupe de lentilles corail','35 min · 8 portions',['500 g de lentilles corail','2 oignons','4 carottes','4 gousses d’ail','2 c. à c. de cumin','2 l de bouillon','2 citrons'],['Fais revenir oignons, ail et carottes 5 min.','Ajoute lentilles, cumin et bouillon, cuis 20 min.','Mixe et assaisonne. Ajoute le citron au moment de servir.'],CONS+'. Congèle en bocaux ou en poches plates. Réchauffe à la casserole en ajoutant un peu d’eau.'],
['Curry de pois chiches, épinards et coco','35 min · 8 portions',['4 boîtes de pois chiches','2 oignons','4 gousses d’ail','1 morceau de gingembre','2 c. à s. de curry','800 g de tomates concassées','400 ml de lait de coco','500 g d’épinards surgelés'],['Fais revenir oignons, ail et gingembre, ajoute le curry.','Ajoute tomates et pois chiches égouttés, cuis 10 min.','Ajoute lait de coco et épinards, laisse mijoter 10 min.'],CONS+'. Se sert avec le riz de la semaine. Réchauffe à la casserole ou au micro-ondes jusqu’à ce que ce soit bien chaud.']
];
REC.length=0;BR.forEach(function(r){REC.push(r)});
var BG=[['🍚 Base riz','Cuis du riz en grande quantité, puis décline-le en plats différents.',[0,1,2]],['🥩 Base viande hachée','Une grosse cuisson de viande, deux plats qui se congèlent très bien.',[3,4]],['🍗 Base poulet','À congeler cuit, à réchauffer au four.',[5]],['🫘 Base légumineuses','Économiques, riches, et parfaites à congeler.',[6,7]]];
function batchView(){
 var h='<div class="card"><h3>Batch cooking</h3><p class="mut">Des plats à cuisiner en grande quantité, qui se gardent plusieurs jours ou se congèlent, et qu’il suffit de réchauffer au four ou au micro-ondes. Chaque recette donne 8 portions.</p><details><summary><b>Les règles d’or</b></summary><ol><li>Refroidis vite : moins d’1 h entre la cuisson et le frigo ou le congélateur (surtout le riz).</li><li>Range en portions plates, étiquette avec la date.</li><li>Frigo : 3 jours. Congélateur : 3 mois.</li><li>Décongèle au frigo la veille, jamais sur le plan de travail.</li><li>Réchauffe une seule fois, jusqu’à ce que ce soit bien chaud à cœur, et ne recongèle pas un plat décongelé.</li></ol></details><details><summary><b>Idée de session du dimanche</b></summary><p class="mut">Riz pilaf + hachis parmentier + curry de pois chiches : trois plats différents pour la semaine, avec une seule vaisselle.</p></details></div>';
 BG.forEach(function(g){h+='<div class="card"><h3>'+g[0]+'</h3><p class="mut">'+g[1]+'</p>'+g[2].map(function(i){var r=BR[i];return'<details><summary><b>'+esc(r[0])+'</b><div class="mut">'+esc(r[1])+'</div></summary><p class="mut" style="margin:8px 0 2px">Ingrédients</p><ul style="margin:0;padding-left:18px">'+r[2].map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul><p class="mut" style="margin:8px 0 2px">Préparation</p><ol>'+r[3].map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ol><p style="background:var(--sage);border-radius:12px;padding:8px 10px;font-size:13.5px">❄️ '+esc(r[4])+'</p><button class="btn d" data-a="recshop" data-id="'+i+'">Ajouter aux courses</button></details>'}).join('')+'</div>'});
 return h+(toast?'<p class="mut">'+toast+'</p>':'')}
var _cu=V.cuis;
V.cuis=function(){if(sub.cuis==='batch')sub.cuis='rec';
 var t=tabs('cuis',[['menu','Menus'],['rec','Batch & recettes'],['courses','Courses'],['placard','Placard']]);
 if(sub.cuis==='rec')return'<h2>Cuisine</h2>'+t+batchView();
 return _cu().replace(/<div class="tabs">[\s\S]*?<\/div>/,t)};

/* ===== Export calendrier Apple (.ics) ===== */
document.addEventListener('change',function(e){var m=/^ics-(ev|fast|pr)$/.exec(e.target.id||'');if(!m)return;S.icsOpt=S.icsOpt||{ev:1,fast:1,pr:0};S.icsOpt[m[1]]=e.target.checked?1:0;save()});
function icsBuild(o){var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LAYNOOR//FR','CALSCALE:GREGORIAN','X-WR-CALNAME:LAYNOOR'],st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',z=function(n){return String(n).padStart(2,'0')},ds=function(d){return d.replace(/-/g,'')},es=function(s){return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')};
 function ev(uid,title,date,time,mins){L.push('BEGIN:VEVENT','UID:'+uid+'@laynoor','DTSTAMP:'+st,'SUMMARY:'+es(title));
  if(/^\d\d:\d\d$/.test(time||'')){var m=+time.slice(0,2)*60+ +time.slice(3)+mins,ed=m>=1440?addD(date,1):date;L.push('DTSTART:'+ds(date)+'T'+time.replace(':','')+'00','DTEND:'+ds(ed)+'T'+z(Math.floor(m/60)%24)+z(m%60)+'00')}
  else L.push('DTSTART;VALUE=DATE:'+ds(date),'DTEND;VALUE=DATE:'+ds(addD(date,1)));
  L.push('END:VEVENT')}
 if(o.ev)S.ev.forEach(function(e){if(e.date&&e.t)ev('ev-'+e.id,e.t,e.date,e.time||'',60)});
 if(o.fast)for(var i=0;i<90;i++){var d=addD(today,i),x=fi(d);if(x.no)continue;var t=x.ram?'Ramadan':x.jb?'Jeûne recommandé (jour blanc)':x.lj?'Jeûne recommandé (lundi ou jeudi)':'';if(t)ev('fast-'+d,t,d,'',0)}
 if(o.pr)for(var j=0;j<7;j++){var dd=addD(today,j),tt=times(new Date(dd+'T12:00'),S.loc.lat,S.loc.lng,S.ang);P.forEach(function(q){var f=fmt(tt[q]);if(/^\d\d:\d\d$/.test(f))ev('pr-'+dd+'-'+q,'Prière · '+PF[q],dd,f,20)})}
 L.push('END:VCALENDAR');return L.join('\r\n')}
act.icsx=function(){var o={ev:+!!(document.getElementById('ics-ev')||{}).checked,fast:+!!(document.getElementById('ics-fast')||{}).checked,pr:+!!(document.getElementById('ics-pr')||{}).checked};S.icsOpt=o;
 if(!o.ev&&!o.fast&&!o.pr){alert('Coche au moins une case.');return}
 var f=new File([icsBuild(o)],'laynoor.ics',{type:'text/calendar'});
 if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(function(){});
 else{var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download='laynoor.ics';document.body.appendChild(a);a.click();a.remove()}};

/* ===== Souvenirs (photos stockées dans l'appareil, IndexedDB) ===== */
pages.splice(pages.findIndex(function(q){return q[0]==='set'}),0,['souv','📸','Souvenirs']);
var db,SVL=[],SVI=0,tu={},fu={};
function idb(){return new Promise(function(res,rej){if(db)return res(db);var r=indexedDB.open('laynoor-souv',1);r.onupgradeneeded=function(){r.result.createObjectStore('p',{keyPath:'id'})};r.onsuccess=function(){db=r.result;res(db)};r.onerror=function(){rej(r.error)}})}
function tx(mode,fn){return idb().then(function(d){return new Promise(function(res,rej){var t=d.transaction('p',mode),q=fn(t.objectStore('p'));t.oncomplete=function(){res(q&&q.result)};t.onerror=function(){rej(t.error)}})})}
function rs(file,max,q){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej()},'image/jpeg',q)};im.onerror=function(){URL.revokeObjectURL(u);rej()};im.src=u})}
V.souv=function(){return'<h2>Souvenirs</h2><div class="card"><p class="mut">Importe tes photos et ajoute une légende : elles restent uniquement sur cet appareil et sont compressées pour économiser la place.</p><button class="btn d" id="sv-add">📸 Ajouter des photos</button><input type="file" id="sv-file" accept="image/*" multiple style="display:none"><p class="mut" id="sv-msg"></p></div><div id="sv-grid"></div><p class="mut">Les photos ne sont pas incluses dans la sauvegarde de Réglages : garde aussi tes originaux dans Photos.</p>'};
function svLoad(){tx('readonly',function(s){return s.getAll()}).then(function(a){var g=document.getElementById('sv-grid');if(!g)return;
 SVL=(a||[]).sort(function(x,y){return y.d.localeCompare(x.d)||y.id-x.id});
 if(!SVL.length){g.innerHTML='<div class="card"><p class="mut">Aucune photo pour l’instant. Ajoute ton premier souvenir ♡</p></div>';return}
 var h='',m='';SVL.forEach(function(r,i){var k=r.d.slice(0,7);if(k!==m){if(m)h+='</div>';m=k;h+='<h3 style="margin:16px 4px 8px;text-transform:capitalize">'+new Date(r.d+'T12:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})+'</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">'}
  var u=tu[r.id]=tu[r.id]||URL.createObjectURL(r.th);h+='<img src="'+u+'" data-sv="open" data-i="'+i+'" alt="'+esc(r.cap||'Souvenir')+'" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;cursor:pointer">'});
 g.innerHTML=h+'</div><p class="mut" style="margin-top:10px">'+SVL.length+' photo'+(SVL.length>1?'s':'')+'</p>'}).catch(function(){var g=document.getElementById('sv-grid');if(g)g.innerHTML='<div class="card"><p class="mut">Impossible d’accéder au stockage des photos sur cet appareil.</p></div>'})}
function svOpen(i){SVI=i;var r=SVL[i];if(!r)return;var v=document.getElementById('sv-view');
 if(!v){v=document.createElement('div');v.id='sv-view';v.style.cssText='position:fixed;inset:0;background:rgba(20,12,12,.95);z-index:50;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px calc(env(safe-area-inset-bottom,0px) + 12px);color:#fff';document.body.appendChild(v)}
 var u=fu[r.id]=fu[r.id]||URL.createObjectURL(r.full);
 v.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><button class="btn" data-sv="close" aria-label="Fermer">✕</button><span>'+(i+1)+' / '+SVL.length+'</span><button class="btn" data-sv="del" aria-label="Supprimer">🗑</button></div><div style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;margin:10px 0"><img src="'+u+'" alt="" style="max-width:100%;max-height:100%;border-radius:12px"></div><div style="display:flex;gap:8px;margin-bottom:8px"><button class="btn" data-sv="prev" aria-label="Précédente">‹</button><input type="date" id="sv-d" value="'+r.d+'" style="flex:1"><button class="btn" data-sv="next" aria-label="Suivante">›</button></div><textarea id="sv-c" rows="2" placeholder="Une légende, un souvenir…">'+esc(r.cap||'')+'</textarea>'}
function svClose(){var v=document.getElementById('sv-view');if(v)v.remove();svLoad()}
function svPut(r){return tx('readwrite',function(s){return s.put(r)})}
document.addEventListener('click',function(e){var t=e.target;
 if(t.id==='sv-add'){var f=document.getElementById('sv-file');if(f)f.click();return}
 var el=t.closest&&t.closest('[data-sv]');if(!el)return;var a=el.dataset.sv;
 if(a==='open')svOpen(+el.dataset.i);
 else if(a==='close')svClose();
 else if(a==='prev'&&SVL.length)svOpen((SVI-1+SVL.length)%SVL.length);
 else if(a==='next'&&SVL.length)svOpen((SVI+1)%SVL.length);
 else if(a==='del'){if(!confirm('Supprimer cette photo de LAYNOOR ?'))return;var r=SVL[SVI];tx('readwrite',function(s){return s.delete(r.id)}).then(function(){delete tu[r.id];delete fu[r.id];SVL.splice(SVI,1);if(!SVL.length)svClose();else svOpen(Math.min(SVI,SVL.length-1))})}});
document.addEventListener('change',function(e){var t=e.target;
 if(t.id==='sv-c'||t.id==='sv-d'){var r=SVL[SVI];if(!r)return;if(t.id==='sv-c')r.cap=t.value;else if(t.value)r.d=t.value;svPut(r);return}
 if(t.id!=='sv-file')return;var fs=Array.prototype.slice.call(t.files||[]),msg=document.getElementById('sv-msg'),n=0;t.value='';
 if(!fs.length)return;if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
 (function nx(i){if(i>=fs.length){if(msg)msg.textContent=n+' photo'+(n>1?'s ajoutées':' ajoutée')+(n<fs.length?' ('+(fs.length-n)+' impossible'+(fs.length-n>1?'s':'')+' à lire)':'')+' ♡';svLoad();return}
  if(msg)msg.textContent='Import en cours… '+(i+1)+'/'+fs.length;
  var f=fs[i];Promise.all([rs(f,1600,.82),rs(f,360,.72)]).then(function(b){return svPut({id:Date.now()+i,d:iso(new Date(f.lastModified||Date.now())),cap:'',full:b[0],th:b[1]})}).then(function(){n++;nx(i+1)}).catch(function(){nx(i+1)})})(0)});

draw();
})();
