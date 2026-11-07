/* LAYNOOR – patch : aujourd'hui, Jumu'a, explication des jeûnes, météo, Qibla */
(function(){
var css=':root{--cu:#B5683F;--gold:#F1DFA8;--goldd:#A9822A}'
+'.cal .today{background:#C9677F!important;color:#fff!important;border-radius:12px;box-shadow:0 0 0 2px var(--card),0 0 0 4px #F2C6D1}'
+'.cal .today .cn{color:#FFE3EA!important}'
+'.cal:not(.ecal)>button{position:relative}'
+'.cal:not(.ecal)>button:nth-child(7n+5):not(.today):not(.jb):not(.rm):not(.pd){background:var(--gold);color:#5C4713}'
+'.cal:not(.ecal)>button:nth-child(7n+5)::before{content:"✦";position:absolute;top:1px;right:4px;font-size:8px;color:var(--goldd)}'
+'.cal:not(.ecal)>button:nth-child(7n+5).today::before{color:#fff}';
css+='.quad{grid-template-columns:1fr!important}.q{min-height:0!important}.q .ln{font-size:14.5px}.q h4{font-size:13px}';
/* nom de l'app + manifest (automatique) */
document.title='LAYNOOR';
[['apple-mobile-web-app-title','LAYNOOR'],['application-name','LAYNOOR']].forEach(function(m){var e=document.querySelector('meta[name="'+m[0]+'"]');if(!e){e=document.createElement('meta');e.name=m[0];document.head.appendChild(e)}e.content=m[1]});
if(!document.querySelector('link[rel="manifest"]')){var mf=document.createElement('link');mf.rel='manifest';mf.href='manifest.json?v=2';document.head.appendChild(mf)}
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
act.goqibla=function(){page='islam';sub.islam='prieres';menuOpen=false;scrollTo(0,0)};

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
 if(page==='org'&&sub.org==='agenda'){var cg=document.querySelector('.cal:not(.ecal)'),cc=cg&&cg.closest('.card');
  if(cc&&!cc.querySelector('.lg-box')){var sw=function(s,l){return'<span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:16px;height:16px;border-radius:5px;'+s+'"></i>'+l+'</span>'},cy=S.showCyc!==false&&S.cyc&&S.cyc.start;
   cc.insertAdjacentHTML('beforeend','<div class="lg-box" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)"><div class="mut" style="margin-bottom:6px">Légende</div><div style="display:flex;flex-wrap:wrap;gap:8px 14px;font-size:12.5px">'
    +sw('background:#C9677F','Aujourd’hui')+sw('background:var(--gold)','Vendredi (Jumu’a)')+sw('background:#fff;box-shadow:inset 0 0 0 1.5px var(--sage2)','Jour blanc (13-14-15 du mois hégirien)')+sw('background:var(--card);border:1px solid var(--line);box-shadow:inset 0 -4px 0 var(--sage2)','Lundi ou jeudi (jeûne sunna)')+sw('background:none;outline:1.5px dashed var(--sage2)','Jour à rattraper')+sw('background:var(--sage2)','Ramadan (vert)')
    +(cy?sw('background:var(--rose)','Règles (estimation)')+sw('background:var(--sage)','Fenêtre fertile')+sw('background:var(--pg2)','Ovulation probable'):'')+'</div>'+(cy?'<div class="mut" style="margin-top:8px;font-size:12px">Le petit chiffre au-dessus de la date est le jour de ton cycle. Le point sous une date indique un rendez-vous.</div>':'<div class="mut" style="margin-top:8px;font-size:12px">Le point sous une date indique un rendez-vous.</div>')+'</div>')}}
 if(page==='enf')document.querySelectorAll('p.mut').forEach(function(x){if(x.textContent.indexOf('dans Profils')>-1)x.textContent=x.textContent.replace('dans Profils','dans Réglages › Profils')});
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
 if(sub.cuis==='menu')return'<h2>Cuisine</h2>'+t+menuView();
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

/* ===== Menus : vraie liste d'ingrédients ===== */
function ingList(d){S.ingL=S.ingL||{};if(!S.ingL[d])S.ingL[d]=(S.ing&&S.ing[d]?String(S.ing[d]).split(',').map(function(s){return s.trim()}).filter(Boolean):[]);return S.ingL[d]}
function addNew(d,v){String(v||'').split(',').forEach(function(s){s=s.trim();if(s)ingList(d).push(s)})}
function addIngL(d){var n=0;ingList(d).forEach(function(t){if(!S.shop.some(function(x){return x.t.toLowerCase()===t.toLowerCase()})){S.shop.push({id:Date.now()+Math.random(),t:t,d:0,from:d.slice(0,3)});n++}});return n}
act.link=function(id){toast=addMsg(addIngL(id))};
act.linkall=function(){var n=0;days.forEach(function(d){n+=addIngL(d)});toast=addMsg(n)};
act.addnew=function(id){var i=document.getElementById('ni-'+id);addNew(id,i&&i.value)};
act.delnew=function(id){var q=id.split('|');ingList(q[0]).splice(+q[1],1)};
function menuView(){var h='<div class="card"><div class="row sp wrap"><h3>Menus de la semaine</h3><button class="btn d" data-a="linkall">🛒 Tout ajouter</button></div>'+(toast?'<p class="mut">'+toast+'</p>':'');
 days.forEach(function(d){var L=ingList(d);h+='<div style="padding:12px 0;border-bottom:1px solid var(--line)"><div class="row"><b style="width:44px">'+d.slice(0,3)+'.</b><input data-a="menu" data-id="'+d+'" value="'+esc(S.menu[d]||'')+'" placeholder="Que cuisine-t-on ?"></div><div style="margin:6px 0 0 52px">'
  +L.map(function(t,i){return'<div class="it" style="padding:5px 0"><span style="word-break:break-word">• '+esc(t)+'</span><button class="x" data-a="delnew" data-id="'+d+'|'+i+'" aria-label="Retirer">×</button></div>'}).join('')
  +'<div class="row" style="margin-top:6px"><input id="ni-'+d+'" data-a="newing" data-id="'+d+'" placeholder="Ajouter un ingrédient"><button class="btn" data-a="addnew" data-id="'+d+'" aria-label="Ajouter">+</button>'+(L.length?'<button class="btn" data-a="link" data-id="'+d+'" aria-label="Ajouter aux courses">🛒</button>':'')+'</div></div></div>'});
 return h+'</div>'}
document.addEventListener('keydown',function(e){var t=e.target;if(e.key!=='Enter'||!t.dataset||t.dataset.a!=='newing')return;var d=t.dataset.id,v=t.value;t.value='';if(!v.trim())return;addNew(d,v);save();draw();var n=document.getElementById('ni-'+d);if(n)n.focus()});
document.addEventListener('change',function(e){var t=e.target;if(!t.dataset||t.dataset.a!=='newing')return;e.stopImmediatePropagation();if(t.value.trim()){addNew(t.dataset.id,t.value);t.value='';save();draw()}},true);

/* ===== Islam : rappels, prières & Qibla, Coran +/-  ===== */
Array.prototype.push.apply(rappels,[
'Allah ne charge une âme que selon ce qu’elle peut porter. (Coran 2:286, sens)',
'Avec la difficulté vient certes une facilité. (Coran 94:6, sens)',
'Souvenez-vous de Moi, Je me souviendrai de vous. (Coran 2:152, sens)',
'Aucun de vous ne croit vraiment tant qu’il n’aime pas pour son frère ce qu’il aime pour lui-même. (Bukhari et Muslim, sens)',
'Le vrai fort n’est pas celui qui terrasse les gens, mais celui qui se maîtrise dans la colère. (Bukhari et Muslim, sens)',
'Celui qui ne remercie pas les gens ne remercie pas Allah. (Abu Dawud et Tirmidhi, sens)',
'Facilitez et ne compliquez pas, annoncez de bonnes nouvelles et ne faites pas fuir. (Bukhari et Muslim, sens)',
'Les actes les plus aimés d’Allah sont ceux qui sont réguliers, même s’ils sont petits. (Bukhari et Muslim, sens)',
'La première chose dont le serviteur rendra compte le Jour de la résurrection est la prière. (Tirmidhi, sens)',
'La meilleure invocation est « Alhamdulillah ». (Tirmidhi)']);
function rappelsView(){var r=rappels[doy%rappels.length],dt=new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
 return'<div class="hero" style="margin-bottom:12px"><div class="mut" style="text-transform:uppercase;letter-spacing:.5px">Rappel du jour · '+dt+'</div><p style="font-size:19px;font-family:Georgia,serif;line-height:1.55;margin:12px 0 8px">'+r+'</p><div class="mut">Un nouveau rappel chaque jour ♡</div></div>'
 +'<div class="card"><h3>Invocations</h3>'+duas.map(function(d){return'<div class="it"><div style="flex:1"><div class="ar">'+d[0]+'</div><b>'+d[1]+'</b><div class="mut">'+d[2]+'</div></div></div>'}).join('')+'</div>'
 +'<div class="card"><details><summary><b>Tous les rappels ('+rappels.length+')</b></summary>'+rappels.map(function(x){return'<p style="margin:10px 0">'+x+'</p>'}).join('')+'</details></div>'}
function prayView(){var t=tm(),h='<div class="card"><h3>Horaires</h3>'+['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(function(p){return'<div class="it"><span>'+(p==='Sunrise'?'Lever du soleil':PF[p])+'</span><span class="t">'+fmt(t[p])+'</span></div>'}).join('')+'<p class="mut">'+(S.loc.set?'Calculés pour ta position.':'Position par défaut (Paris).')+' Angle Fajr/Isha :</p><div class="row"><select data-a="ang">'+[12,15,18].map(function(a){return'<option '+(S.ang==a?'selected':'')+' value="'+a+'">'+a+'°</option>'}).join('')+'</select><button class="btn" data-a="geo">📍 Me localiser</button></div></div>';
 return h+'<div class="card" style="text-align:center"><h3>Qibla : '+Math.round(qibla())+'° depuis le nord</h3><div class="comp"><span style="position:absolute;top:4px;left:calc(50% - 5px);font-size:12px" class="mut">▲</span><div class="needle" id="needle" style="transform:rotate('+(qibla()-(heading||0))+'deg)"></div><div class="kaa">🕋</div></div><p class="mut" id="cs">Touche le bouton, autorise le capteur, puis tiens le téléphone à plat : l’aiguille pointe vers la Qibla.</p><button class="btn d" data-a="compass">Activer la boussole</button></div>'}
function qpg(c){if(!c.pg){c.pg={};Object.keys(c.days||{}).forEach(function(d){c.pg[d]=c.per})}return c.pg}
function qread(c){var s=0,g=qpg(c);Object.keys(g).forEach(function(d){s+=g[d]});return s}
act.qadj=function(id){var q=id.split('|'),c=S.qr.ch.find(function(x){return x.id==q[0]});if(!c)return;var g=qpg(c);g[today]=Math.max(0,(g[today]||0)+ +q[1]);c.days=c.days||{};if(g[today])c.days[today]=1;else{delete g[today];delete c.days[today]}};
function coranView(){var b='<div class="card"><h3>Mes défis</h3>'+(S.qr.ch.map(function(c){var rd=qread(c),g=qpg(c),n=g[today]||0,pct=Math.min(100,Math.round(rd/c.total*100)),dn=Object.keys(g).length;
  return'<div style="padding:12px 0;border-bottom:1px solid var(--line)"><div class="row sp"><b>'+esc(c.name)+'</b><button class="x" data-a="qdel" data-id="'+c.id+'" aria-label="Supprimer">×</button></div><div style="height:8px;background:var(--line);border-radius:8px;margin:6px 0"><div style="height:8px;width:'+pct+'%;background:var(--sage2);border-radius:8px"></div></div><div class="mut">'+rd+' / '+c.total+' '+c.unit+' · '+pct+'% · '+dn+' jour'+(dn>1?'s':'')+' de lecture · objectif : '+c.per+' '+c.unit+' par jour</div><div class="row sp" style="margin-top:8px"><span>Aujourd’hui</span><span class="row"><button class="btn" data-a="qadj" data-id="'+c.id+'|-1" aria-label="Moins">−</button><b style="min-width:42px;text-align:center;font-size:18px">'+n+'</b><button class="btn" data-a="qadj" data-id="'+c.id+'|1" aria-label="Plus">+</button>'+(c.per>1?'<button class="btn r" data-a="qadj" data-id="'+c.id+'|'+c.per+'">+'+c.per+'</button>':'')+'</span></div></div>'}).join('')||'<p class="mut">Aucun défi pour l’instant. Choisis-en un ci-dessous.</p>')+'</div>';
 b+='<div class="card"><h3>Lancer un défi</h3>'+QC.map(function(c,i){return'<div class="it"><span>'+c[0]+'<div class="mut">'+c[4]+'</div></span><button class="btn" data-a="qadd" data-id="'+i+'">Commencer</button></div>'}).join('')+'<p class="mut">Le mushaf de Médine compte 604 pages. Ajuste le nombre de pages lues avec + et −, ou touche « +'+'20 » pour ajouter ton objectif d’un coup.</p></div>';return b}
if(sub.islam==='qibla')sub.islam='rappels';
var _is=V.islam;
V.islam=function(){var k=sub.islam;if(k==='qibla'||k==='apprendre')k=sub.islam='prieres';
 var tb=tabs('islam',[['rappels','Rappels'],['prieres','Prières & Qibla'],['dhikr','Dhikr'],['jeune','Jeûne'],['coran','Coran'],['mosquee','Mosquées']]);
 if(k==='rappels')return'<h2>Islam</h2>'+tb+rappelsView();
 if(k==='prieres')return'<h2>Islam</h2>'+tb+prayView();
 if(k==='coran')return'<h2>Islam</h2>'+tb+coranView();
 return _is().replace(/<div class="tabs">[\s\S]*?<\/div>/,tb)};

/* ===== Apprendre ===== */
pages.splice(pages.findIndex(function(q){return q[0]==='set'}),0,['app','🎓','Apprendre'],['enf','🧸','Enfant']);
sub.app=sub.app||'rakat';
function bl(t,ar,ph,fr){return'<div style="padding:12px 0;border-bottom:1px solid var(--line)">'+(t?'<b>'+t+'</b>':'')+(ar?'<div class="ar" style="font-size:26px;line-height:2;text-align:right;margin:4px 0">'+ar+'</div>':'')+(ph?'<div style="font-style:italic;margin:2px 0">'+ph+'</div>':'')+(fr?'<div class="mut" style="font-size:14px">'+fr+'</div>':'')+'</div>'}
function ol(a){return'<ol>'+a.map(function(x){return'<li style="margin:6px 0">'+x+'</li>'}).join('')+'</ol>'}
var NOTE='<p class="mut">Les détails (position des mains, invocations ajoutées…) varient un peu selon les écoles. Pour la prononciation, rien ne remplace une personne de confiance qui t’écoute et te corrige.</p>';
function appView(){var k=sub.app,b='';
 if(k==='rakat')b='<div class="card"><h3>Les 5 prières et leurs rak‘ahs</h3>'+[['Fajr','2','avant le lever du soleil'],['Dohr','4','après le zénith'],['Asr','4','l’après-midi'],['Maghrib','3','juste après le coucher du soleil'],['Isha','4','la nuit tombée']].map(function(r){return'<div class="it"><span><b>'+r[0]+'</b><div class="mut">'+r[2]+'</div></span><b>'+r[1]+' rak‘ahs</b></div>'}).join('')+'<p class="mut">Le vendredi, la prière de Jumu’a (2 rak‘ahs avec le prêche) remplace le Dohr. Elle n’est pas obligatoire pour les femmes, qui peuvent prier le Dohr.</p><p class="mut">Dans les prières de 3 ou 4 rak‘ahs, on récite Al-Fatiha et une sourate aux deux premières, puis Al-Fatiha seule aux suivantes.</p></div>'
  +'<div class="card"><h3>Une rak‘ah pas à pas</h3>'
  +bl('1. Takbir (mains levées)','اللّٰهُ أَكْبَر','Allâhu akbar','Allah est le plus grand.')
  +bl('2. Récitation','','Al-Fatiha, puis une sourate (aux deux premières rak‘ahs)','Voir l’onglet Al-Fatiha.')
  +bl('3. Inclinaison (ruku‘), 3 fois','سُبْحَانَ رَبِّيَ الْعَظِيمِ','Subhâna Rabbiya l-‘Azîm','Gloire à mon Seigneur, le Très Grand.')
  +bl('4. Redressement','سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ','Sami‘a Llâhu liman hamidah, Rabbanâ wa laka l-hamd','Allah entend celui qui Le loue. Notre Seigneur, à Toi la louange.')
  +bl('5. Prosternation (sujud), 3 fois','سُبْحَانَ رَبِّيَ الْأَعْلَىٰ','Subhâna Rabbiya l-A‘lâ','Gloire à mon Seigneur, le Très Haut.')
  +bl('6. Assise entre les deux sujud','رَبِّ اغْفِرْ لِي','Rabbi ghfir lî','Seigneur, pardonne-moi. Puis une seconde prosternation.')
  +bl('7. Tashahhud','','Après la 2ᵉ rak‘ah (prières de 3 ou 4) puis on se lève ; à la dernière rak‘ah, tashahhud complet','Voir l’onglet Tashahhud.')
  +bl('8. Salam (à droite puis à gauche)','السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ','As-salâmu ‘alaykum wa rahmatu Llâh','Que la paix et la miséricorde d’Allah soient sur vous.')+NOTE+'</div>';
 if(k==='ablu')b='<div class="card"><h3>Les ablutions (wudu)</h3>'+ol(['Intention, puis « Bismillah » (بِسْمِ اللّٰه, <i>Bismi Llâh</i>).','Laver les mains 3 fois.','Rincer la bouche 3 fois.','Aspirer l’eau par le nez et la rejeter, 3 fois.','Laver le visage 3 fois.','Laver les bras jusqu’aux coudes, 3 fois (droit puis gauche).','Passer les mains mouillées sur la tête, une fois, puis sur les oreilles.','Laver les pieds jusqu’aux chevilles, 3 fois (droit puis gauche).'])
  +bl('Invocation après les ablutions','أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ','Ash-hadu an lâ ilâha illa Llâhu wahdahu lâ sharîka lah, wa ash-hadu anna Muhammadan ‘abduhu wa rasûluh','J’atteste qu’il n’y a de divinité qu’Allah, Seul, sans associé, et j’atteste que Muhammad est Son serviteur et Son messager.')
  +'<p class="mut">Ce qui annule les ablutions (en général) : les besoins naturels, les gaz, un sommeil profond, la perte de connaissance. Certains détails diffèrent selon les écoles.</p></div>';
 if(k==='shahada')b='<div class="card"><h3>La Shahada</h3><p class="mut">Le témoignage de foi, premier pilier de l’islam.</p>'+bl('','أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللّٰهِ','Ash-hadu an lâ ilâha illâ Llâh, wa ash-hadu anna Muhammadan rasûlu Llâh','J’atteste qu’il n’y a de divinité digne d’adoration qu’Allah, et j’atteste que Muhammad est le Messager d’Allah.')+'</div>';
 if(k==='fatiha')b='<div class="card"><h3>Sourate Al-Fatiha</h3><p class="mut">L’ouverture, récitée à chaque rak‘ah. On dit « Âmîn » à la fin.</p>'
  +bl('1','بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ','Bismi Llâhi r-Rahmâni r-Rahîm','Au nom d’Allah, le Tout Miséricordieux, le Très Miséricordieux.')
  +bl('2','ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ','Al-hamdu li-Llâhi Rabbi l-‘âlamîn','Louange à Allah, Seigneur des mondes,')
  +bl('3','ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ','Ar-Rahmâni r-Rahîm','le Tout Miséricordieux, le Très Miséricordieux,')
  +bl('4','مَـٰلِكِ يَوْمِ ٱلدِّينِ','Mâliki yawmi d-dîn','Maître du Jour de la rétribution.')
  +bl('5','إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ','Iyyâka na‘budu wa iyyâka nasta‘în','C’est Toi que nous adorons, et c’est Toi dont nous implorons le secours.')
  +bl('6','ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ','Ihdinâ s-sirâta l-mustaqîm','Guide-nous dans le droit chemin,')
  +bl('7','صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ','Sirâta l-ladhîna an‘amta ‘alayhim, ghayri l-maghdûbi ‘alayhim wa lâ d-dâllîn','le chemin de ceux que Tu as comblés de bienfaits, non de ceux qui ont encouru Ta colère, ni des égarés.')+'<p class="mut">Traduction du sens, en français simple. Apprends la récitation avec quelqu’un qui connaît le tajwid.</p></div>';
 if(k==='tash')b='<div class="card"><h3>Le Tashahhud</h3><p class="mut">Récité en position assise, après la 2ᵉ rak‘ah et à la fin de la prière.</p>'
  +bl('Tashahhud','التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ','At-tahiyyâtu li-Llâhi wa s-salawâtu wa t-tayyibât. As-salâmu ‘alayka ayyuha n-nabiyyu wa rahmatu Llâhi wa barakâtuh. As-salâmu ‘alaynâ wa ‘alâ ‘ibâdi Llâhi s-sâlihîn. Ash-hadu an lâ ilâha illa Llâh, wa ash-hadu anna Muhammadan ‘abduhu wa rasûluh.','Les salutations, les prières et les bonnes paroles sont pour Allah. Que la paix soit sur toi, ô Prophète, ainsi que la miséricorde d’Allah et Ses bénédictions. Que la paix soit sur nous et sur les serviteurs vertueux d’Allah. J’atteste qu’il n’y a de divinité qu’Allah et que Muhammad est Son serviteur et Son messager.')
  +bl('À la fin de la prière, on ajoute','اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ','Allâhumma salli ‘alâ Muhammadin wa ‘alâ âli Muhammad, kamâ sallayta ‘alâ Ibrâhîma wa ‘alâ âli Ibrâhîm, innaka Hamîdun Majîd. Allâhumma bârik ‘alâ Muhammadin wa ‘alâ âli Muhammad, kamâ bârakta ‘alâ Ibrâhîma wa ‘alâ âli Ibrâhîm, innaka Hamîdun Majîd.','Ô Allah, accorde Ta grâce à Muhammad et à sa famille, comme Tu l’as accordée à Ibrahim et à sa famille ; Tu es digne de louange et de gloire. Ô Allah, bénis Muhammad et sa famille, comme Tu as béni Ibrahim et sa famille ; Tu es digne de louange et de gloire.')+NOTE+'</div>';
 if(k==='ghusl')b='<div class="card"><h3>Le ghusl (grandes ablutions)</h3>'+ol(['Intention.','Laver les mains, puis les parties intimes.','Faire les ablutions (wudu).','Verser de l’eau sur la tête 3 fois, en atteignant la racine des cheveux.','Laver le reste du corps, côté droit puis côté gauche.'])+'<p class="mut">Pour les cas précis (fin des règles, après les lochies…), vérifie auprès d’une source de savoir de confiance.</p></div>';
 return'<h2>Apprendre</h2>'+tabs('app',[['rakat','Rak‘ahs'],['ablu','Ablutions'],['shahada','Shahada'],['fatiha','Al-Fatiha'],['tash','Tashahhud'],['ghusl','Ghusl']])+b}
V.app=appView;
V.enf=function(){return'<h2>Enfant</h2><div class="card" style="text-align:center"><div style="font-size:42px">🧸</div><p class="mut">À venir ♡</p></div>'};
act.gogh=function(){page='app';sub.app='ghusl';menuOpen=false;scrollTo(0,0)};

/* ===== Batch cooking : plus d'idées ===== */
BR.push(
['Riz cantonais au poulet','30 min · 8 portions',['500 g de riz','500 g de blanc de poulet en dés','4 œufs','200 g de petits pois et carottes','4 oignons nouveaux','4 c. à s. de sauce soja','Huile'],['Cuis le riz et étale-le pour qu’il refroidisse vite.','Fais sauter le poulet 6 à 8 min, réserve. Fais une omelette fine et coupe-la en lanières.','Fais revenir oignons et légumes, ajoute riz, poulet, omelette et sauce soja, mélange 5 min.'],CONS+'. Congèle en portions individuelles. Réchauffe à la poêle ou au micro-ondes jusqu’à ce que ce soit bien chaud.'],
['Sauce bolognaise maison (la base)','1 h · 8 portions · sert à 3 plats',['1 kg de bœuf haché','2 oignons','2 carottes','3 gousses d’ail','800 g de tomates concassées','2 c. à s. de concentré de tomate','1 c. à c. d’origan','Huile d’olive'],['Fais revenir oignons, carottes et ail hachés finement.','Ajoute la viande et fais-la dorer, puis tomates, concentré et origan.','Laisse mijoter 40 min à feu doux.'],CONS+'. Congèle en 4 poches de 2 portions : pâtes, lasagnes, poivrons farcis ou hachis parmentier.'],
['Lasagnes au bœuf','1 h 15 · 8 portions',['1 kg de sauce bolognaise','12 feuilles de lasagne','1 l de lait','80 g de beurre','80 g de farine','150 g de fromage râpé','Muscade'],['Prépare la béchamel : beurre fondu, farine, puis lait peu à peu, muscade.','Monte en couches : sauce, feuilles, béchamel, fromage.','Cuis 35 à 40 min à 180 °C.'],CONS+'. Congèle en parts, cuites ou crues. Décongèle au frigo, puis four couvert 30 à 40 min à 180 °C jusqu’à ce que ce soit bouillant à cœur.'],
['Chili de bœuf et haricots rouges','45 min · 8 portions',['800 g de bœuf haché','2 oignons','3 gousses d’ail','2 poivrons','800 g de tomates concassées','3 boîtes de haricots rouges','1 c. à s. de paprika','1 c. à c. de cumin'],['Fais revenir oignons, ail, poivrons, puis la viande.','Ajoute tomates, épices et haricots égouttés.','Laisse mijoter 25 min.'],CONS+'. Se sert avec du riz. Réchauffe à la casserole ou au micro-ondes jusqu’à ce que ce soit bien chaud.'],
['Harira (soupe marocaine)','1 h · 8 portions',['300 g de bœuf ou d’agneau en petits dés','150 g de lentilles','2 boîtes de pois chiches','800 g de tomates concassées','2 oignons','2 branches de céleri','1 bouquet de coriandre et de persil','1 c. à c. de gingembre','1 c. à c. de curcuma','50 g de vermicelles'],['Fais revenir viande, oignons, céleri et épices 5 min.','Ajoute tomates, lentilles, pois chiches et 1,5 l d’eau, cuis 40 min.','Ajoute les herbes hachées et les vermicelles, cuis 5 min.'],CONS+'. Congèle de préférence avant les vermicelles, ajoutés au moment de réchauffer.'],
['Ratatouille maison','50 min · 8 portions',['2 aubergines','3 courgettes','3 poivrons','4 tomates (ou 800 g concassées)','2 oignons','4 gousses d’ail','Huile d’olive','Herbes de Provence'],['Coupe tous les légumes en dés.','Fais revenir oignons, ail et poivrons, puis aubergines, courgettes et tomates.','Ajoute les herbes et laisse mijoter 30 min.'],CONS+'. Se mange avec du riz, des œufs ou du poulet. Réchauffe à la casserole ou au four.'],
['Soupe de potiron et lait de coco','35 min · 8 portions',['1,2 kg de potiron','2 oignons','2 pommes de terre','1 l de bouillon','400 ml de lait de coco','1 c. à c. de gingembre'],['Fais revenir les oignons, ajoute potiron, pommes de terre et bouillon, cuis 20 min.','Mixe avec le lait de coco et le gingembre.'],CONS+'. Congèle en bocaux ou en poches plates, réchauffe à la casserole.'],
['Nuggets de poulet maison','40 min · 8 portions',['800 g de blanc de poulet','2 œufs','150 g de chapelure','50 g de farine','1 c. à c. de paprika','Sel','Huile'],['Coupe le poulet en morceaux, passe-les dans la farine, les œufs battus, puis la chapelure épicée.','Dispose sur une plaque, arrose d’un filet d’huile, cuis 15 min à 200 °C en retournant.'],CONS+'. Congèle sur plaque puis en sac. Réchauffe au four 12 à 15 min à 200 °C directement depuis le congélateur.'],
['Samoussas au bœuf (à congeler crus)','50 min · environ 20 pièces',['12 feuilles de brick','500 g de bœuf haché','2 oignons','1 bouquet de persil','1 c. à c. de cumin','1 c. à c. de paprika','1 œuf','Huile'],['Fais revenir viande, oignons et épices, ajoute le persil, laisse refroidir.','Coupe les feuilles en bandes, garnis et plie en triangles, colle avec l’œuf.','Badigeonne d’huile et cuis 15 min à 200 °C.'],CONS+'. Congèle crus sur plaque puis en sac, et cuis directement depuis le congélateur, 20 min à 200 °C.']);
REC.length=0;BR.forEach(function(r){REC.push(r)});
BG[0][2].push(8);BG[1][2].push(16);BG[2][2].push(15);BG[3][2].push(11,12);
BG.splice(2,0,['🍝 Base bolognaise','Une sauce préparée en grande quantité, trois plats.',[9,10]]);
BG.push(['🥕 Base légumes','Légers, colorés, parfaits en accompagnement ou avec du riz.',[13,14]]);

/* ===== Famille -> Maison ; Enfant regroupe Grossesse, Lait, Croissance ===== */
pages.forEach(function(q){if(q[0]==='fam'){q[1]='🏡';q[2]='Maison'}});
sub.fam='profils';sub.enf=sub.enf||'preg';
V.fam=function(){if(sub.fam!=='pharma')sub.fam='profils';return'<h2>Maison</h2>'+tabs('fam',[['profils','Profils'],['pharma','Pharmacie']])+V.famBody(sub.fam)};
V.enf=function(){if(['preg','lait','crois'].indexOf(sub.enf)<0)sub.enf='preg';return'<h2>Enfant</h2>'+tabs('enf',[['preg','Grossesse'],['lait','Lait'],['crois','Croissance']])+V.famBody(sub.enf)};
var _w=V.well;V.well=function(){if(sub.well==='preg')sub.well='cycle';return _w().replace(/<div class="tabs">[\s\S]*?<\/div>/,tabs('well',[['cycle','Cycle'],['tirage','Tirage']]))};

/* ===== Profils -> Réglages ; Maison = Pharmacie ===== */
V.fam=function(){sub.fam='pharma';return'<h2>Maison</h2>'+V.famBody('pharma')};
var _st=V.set;V.set=function(){var h=_st(),m='<div class="card"><h3>Services</h3>';return h.indexOf(m)>-1?h.replace(m,V.famBody('profils')+m):h+V.famBody('profils')};

draw();
})();
