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
act.wx=function(){loadWx()};
act.goqibla=function(){page='islam';sub.islam='qibla';menuOpen=false;scrollTo(0,0)};

function enhance(){
 if(page==='home'){var h=document.querySelector('.hero .row');
  if(h&&!h.dataset.p){h.dataset.p=1;var w=S.wx,fresh=w&&Date.now()-w.ts<36e5;
   if(w&&!w.err){var i=wc(w.c);h.innerHTML='<span style="font-size:22px">'+i[0]+'</span><b>'+w.t+'°</b><span class="mut">'+i[1]+' · '+w.mn+'°/'+w.mx+'° · vent '+w.v+' km/h</span>'}
   else h.innerHTML='<span class="sun"></span><b>—°</b><button class="btn" data-a="wx" style="padding:5px 12px">'+(w&&w.err?'Réessayer la météo':'Afficher la météo')+'</button>';
   h.insertAdjacentHTML('afterend','<div class="row sp" style="margin-top:8px"><span class="mut">🕋 Qibla : '+Math.round(qibla())+'° depuis le nord</span><button class="btn" data-a="goqibla">Boussole</button></div>');
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
 if(page==='set')document.querySelectorAll('.it').forEach(function(it){var s=it.querySelectorAll('span');if(s[0]&&s[0].textContent==='Météo'&&s[1])s[1].textContent='actif'});
}
var _d=draw;draw=function(){_d();try{enhance()}catch(e){console.error(e)}};

/* Qibla : demande le capteur tout de suite (obligatoire sur iPhone), puis la position */
var _sc=startCompass;
startCompass=function(){_sc();if(!S.loc.set&&navigator.geolocation)navigator.geolocation.getCurrentPosition(function(p){S.loc={lat:p.coords.latitude,lng:p.coords.longitude,set:1};save();draw()},function(){})};
draw();
})();
