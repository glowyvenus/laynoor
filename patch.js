/* LAYNOOR – patch : aujourd'hui, Jumu'a, explication des jeûnes, météo, Qibla */
(function(){
var css=':root{--cu:#B5683F;--gold:#F1DFA8;--goldd:#A9822A;--yel:#F7D54A;--grn:#D5E0C8;--grn2:#5E7456}'
+'.cal .today{background:var(--yel)!important;color:#3F3200!important;border-radius:12px;box-shadow:0 0 0 2px var(--card),0 0 0 4px #FBE9A0}'
+'.cal .today .cn{color:#6B5600!important}'
+'.cal:not(.ecal)>button{position:relative}'
+'.cal:not(.ecal)>button:nth-child(7n+5):not(.today):not(.jb):not(.rm){background:var(--grn)!important;color:var(--ink)}'
+'.cal:not(.ecal)>button:nth-child(7n+5)::before{content:"✦";position:absolute;top:1px;right:4px;font-size:8px;color:var(--grn2)}'
+'.cal:not(.ecal)>button:nth-child(7n+5).today::before{color:#6B5600}'
+'.cal:not(.ecal) .rm{background:var(--sage2)!important;color:#fff!important}'
+'.cal:not(.ecal) .fj:not(.today){box-shadow:inset 0 -4px 0 #fff,0 2px 0 var(--line)!important}'
+'.cal:not(.ecal) .today.fj{box-shadow:0 0 0 2px var(--card),0 0 0 4px #FBE9A0,inset 0 -4px 0 #fff!important}'
+'.cal:not(.ecal) .pd:not(.today):not(.rm),.cal:not(.ecal) .fw:not(.today):not(.rm),.cal:not(.ecal) .ov:not(.today):not(.rm){background:transparent!important;color:inherit!important}'
+'.cal:not(.ecal) .cn{display:none}'
+'.pd-mk{position:absolute;top:3px;left:5px;width:5px;height:5px;border-radius:50%;background:var(--heart);opacity:.8}'
+'.nav{transform:translate3d(0,0,0);-webkit-transform:translate3d(0,0,0);will-change:transform}'
+'input[type=range]{touch-action:pan-y}';
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
 if(page==='set'&&!document.getElementById('bk-card')){A.insertAdjacentHTML('beforeend','<div class="card" id="bk-card"><h3>Sauvegarde personnelle</h3><p class="mut">Tes données vivent uniquement sur cet appareil, et séparément pour Safari et pour le raccourci (tu es dans : '+(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)?'le raccourci':'Safari')+'). Dernière sauvegarde : '+(S.lastBk?new Date(S.lastBk).toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):'jamais')+'.</p><div class="row wrap"><button class="btn d" data-a="bkex">Exporter (sans photos)</button><button class="btn" data-a="bkexp">Exporter avec photos</button><button class="btn r" data-a="bkim">Importer</button></div><p class="mut">Après l’export, choisis « Enregistrer dans Fichiers » dans le menu qui s’ouvre. La version avec photos est plus lourde.</p><input type="file" id="bkf" accept=".json,application/json" style="display:none"></div>')}
 if(page==='org'&&sub.org==='agenda'&&!document.getElementById('ics-card')){var o=Object.assign({ev:1,fast:1,pr:0,kahf:1},S.icsOpt||{}),ck=function(k,l){return'<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="ics-'+k+'" '+(o[k]?'checked':'')+' style="width:auto"> '+l+'</label>'};
  A.insertAdjacentHTML('beforeend','<div class="card" id="ics-card"><h3>Calendrier Apple</h3><p class="mut">Exporte tes rendez-vous vers l’app Calendrier de ton iPhone. C’est une copie à un instant donné : les changements faits ensuite dans LAYNOOR demandent un nouvel export.</p>'+ck('ev','Mes rendez-vous et événements')+ck('fast','Jours de jeûne recommandés (3 prochains mois)')+ck('pr','Horaires de prière (7 prochains jours)')+ck('kahf','Rappel du vendredi : sourate Al-Kahf (3 mois)')+'<p><button class="btn d" data-a="icsx">Ajouter à Calendrier Apple</button></p><p class="mut">Ton suivi de cycle n’est jamais inclus. Réexporter ne crée pas de doublons.</p></div>')}
 if(page==='souv')svLoad();
 if(page==='org'&&sub.org==='agenda'){var cg=document.querySelector('.cal:not(.ecal)'),cc=cg&&cg.closest('.card');
  if(cc&&!cc.querySelector('.lg-box')){var sw=function(s,l){return'<span style="display:inline-flex;align-items:center;gap:6px"><i style="display:inline-block;width:16px;height:16px;border-radius:5px;'+s+'"></i>'+l+'</span>'},cy=S.showCyc!==false&&S.cyc&&S.cyc.start;
   cc.insertAdjacentHTML('beforeend','<div class="lg-box" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line)"><div class="mut" style="margin-bottom:6px">Légende</div><div style="display:flex;flex-wrap:wrap;gap:8px 14px;font-size:12.5px">'
    +sw('background:#F7D54A','Aujourd’hui')+sw('background:#D5E0C8','Vendredi (Jumu’a)')+sw('background:#fff;box-shadow:inset 0 0 0 1.5px var(--sage2)','Jour blanc (13-14-15 du mois hégirien)')+sw('background:#fff;border:1px solid var(--line);box-shadow:inset 0 -4px 0 #fff,0 2px 0 var(--line)','Lundi ou jeudi (jeûne sunna)')+sw('background:none;outline:1.5px dashed var(--sage2)','Jour à rattraper')+sw('background:var(--sage2)','Ramadan (vert foncé)')
    +(cy?sw('background:var(--heart);border-radius:50%;width:8px;height:8px','Règles (petit point discret)'):'')+'</div>'+(cy?'<div class="mut" style="margin-top:8px;font-size:12px">Le point sous une date indique un rendez-vous.</div>':'<div class="mut" style="margin-top:8px;font-size:12px">Le point sous une date indique un rendez-vous.</div>')+'</div>')}}
 if(page==='enf')document.querySelectorAll('p.mut').forEach(function(x){if(x.textContent.indexOf('dans Profils')>-1)x.textContent=x.textContent.replace('dans Profils','dans Réglages › Profils')});
 if(page==='home'){var hr=document.querySelector('.hero');
  if(hr&&!hr.dataset.g){hr.dataset.g=1;var h1=hr.querySelector('h1');if(h1)h1.insertAdjacentHTML('afterend','<p class="mut" style="margin:2px 0 8px;line-height:1.5">Un espace clair, tendre et à votre rythme.<br>Vous n’avez pas à tout porter seule.</p>')}
  document.querySelectorAll('p.mut').forEach(function(q){if(q.textContent.indexOf('Les prières du jour sont passées')<0||q.dataset.f)return;q.dataset.f=1;
   var n=new Date(),hh=n.getHours()+n.getMinutes()/60,t0=tm(),t1=times(new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),S.loc.lat,S.loc.lng,S.ang),fa=t1.Fajr+24,mn=Math.round((fa-hh)*60);
   if(q.closest('.hero')){var pc=Math.max(0,Math.min(100,(hh-t0.Isha)/(fa-t0.Isha)*100));
    q.outerHTML='<div class="row sp" style="align-items:baseline;margin-top:10px"><span class="mut">Prochaine prière · dans '+(mn>=60?Math.floor(mn/60)+' h '+String(mn%60).padStart(2,'0'):mn+' min')+'</span><b class="hn">Fajr '+fmt(t1.Fajr)+'</b></div><div class="bar"><i style="width:'+pc+'%"></i></div><div class="row sp mut" style="font-size:11px"><span>Isha '+fmt(t0.Isha)+'</span><span>Fajr (demain) '+fmt(t1.Fajr)+'</span></div>'}
   else q.textContent='Prochaine prière : Fajr à '+fmt(t1.Fajr)+' (demain)'});
  if(!STORE_OK&&!document.getElementById('st-warn'))A.insertAdjacentHTML('afterbegin','<div class="card" id="st-warn" style="background:var(--rose)"><b>⚠️ Stockage bloqué</b><div class="mut">Cet appareil n’autorise pas l’enregistrement (navigation privée ?). Tes données ne seront pas conservées. Ouvre l’app dans Safari en navigation normale.</div></div>')}
 if(['islam','app','well','enf','fam','cuis'].indexOf(page)>-1&&!document.getElementById('disc-card')){var rel=page==='islam'||page==='app';
  A.insertAdjacentHTML('beforeend','<div class="card" id="disc-card" style="background:var(--bg);border-style:dashed"><div class="mut" style="font-size:12.5px">ℹ️ '+(rel?'Ces contenus sont un support d’apprentissage, pas une fatwa. Les avis peuvent différer selon les écoles : pour une question précise ou un doute, rapproche-toi d’une personne de science de confiance (imam, savant).':page==='cuis'?'Les durées de conservation et conseils de sécurité alimentaire sont des repères généraux. Pour un enfant, une grossesse ou une allergie, demande l’avis d’un professionnel de santé.':'Ces informations sont générales et ne remplacent pas un avis médical. Pour toute question de santé, rapproche-toi d’un professionnel de santé (médecin, sage-femme, pédiatre, pharmacien).')+'</div></div>')}
 if(page==='home'&&new Date().getDay()===5&&!document.getElementById('kahf-card')){var pr0=A.querySelector('.pr');
  if(pr0)pr0.insertAdjacentHTML('afterend','<div class="card" id="kahf-card"><div class="row sp"><div><b>📖 Vendredi : sourate Al-Kahf</b><div class="mut">Lis-la ou écoute-la aujourd’hui (de jeudi soir à vendredi soir).</div></div>'+heartBtn((S.kahf||{})[today],'kahf','x')+'</div><p style="margin:8px 0 4px"><a class="btn" style="text-decoration:none" target="_blank" rel="noopener" href="https://quran.com/18">Lire ou écouter</a></p><div class="mut" style="font-size:11.5px">Rapporté par al-Hakim et al-Bayhaqi (Abu Sa‘id al-Khudri), jugé bon (hasan) par Ibn Hajar.</div></div>')}
 if(page==='fam'&&sub.fam==='lait')dropFx();
 if(page==='org'&&sub.org==='agenda'){var lg=document.querySelector('.lg-box');
  if(lg&&!lg.dataset.t){lg.dataset.t=1;var hd=lg.firstElementChild;if(hd){hd.className='row sp';hd.style.marginBottom='6px';hd.innerHTML='<span class="mut">Légende</span><button class="btn" data-a="leg" style="padding:4px 12px;font-size:12px">'+(S.legHide?'Afficher':'Masquer')+'</button>';if(S.legHide)Array.prototype.slice.call(lg.children,1).forEach(function(c){c.style.display='none'})}}
  var gb=A.querySelector('button[data-a="gh"]');
  if(gb&&gb.parentElement&&!document.getElementById('kahf-row')){var kd=(S.kahf||{})[sel];gb.parentElement.insertAdjacentHTML('afterend','<div class="row" id="kahf-row" style="margin:6px 0"><button class="heart" data-a="kahfd" data-id="'+sel+'" aria-label="Fait">'+(kd?'♥':'♡')+'</button><span>📖 Sourate Al-Kahf (lire ou écouter) · <a href="https://quran.com/18" target="_blank" rel="noopener">ouvrir</a></span></div>')}}
 if(page==='home'&&navigator.onLine===false&&!document.getElementById('off-warn'))A.insertAdjacentHTML('afterbegin','<div class="card" id="off-warn" style="background:var(--sage)"><div class="mut">📴 Hors connexion : tout fonctionne, sauf la météo et les liens externes.</div></div>');
 if(page==='set'&&!document.getElementById('off-card')){A.insertAdjacentHTML('beforeend','<div class="card" id="off-card"><h3>Hors connexion</h3><p class="mut" id="off-msg">Vérification…</p></div>');
  var om=document.getElementById('off-msg');(window.caches?caches.has('laynoor-v1'):Promise.resolve(false)).then(function(ok){if(!om)return;om.textContent=ok&&navigator.serviceWorker&&navigator.serviceWorker.controller?'✅ Prêt : l’app s’ouvre sans internet. Il te faut internet seulement pour la météo, les liens (Mawaqit, Quran.com, Google Maps) et les mises à jour.':'⏳ Pas encore prêt : ouvre l’app une fois avec internet, puis ferme-la et rouvre-la.'}).catch(function(){})}
 if(page==='well'&&(sub.well||'cycle')==='cycle'){var ec=document.querySelectorAll('.ecal button[data-a="csel"]');
  ec.forEach(function(b){var r=((S.cyc.log||{})[b.dataset.id]||{}).rap;if(r&&!b.querySelector('.rap-mk')){b.style.position='relative';b.insertAdjacentHTML('beforeend','<i class="rap-mk" style="position:absolute;bottom:0;left:50%;margin-left:-4px;font-size:7px;font-style:normal;color:var(--heart)">'+(r==='Non protégé'?'◆':'◇')+'</i>')}});
  var ecd=document.querySelector('.ecal');if(ecd&&!document.getElementById('rap-lg')){var cc2=ecd.closest('.card');if(cc2)cc2.insertAdjacentHTML('beforeend','<div class="mut" id="rap-lg" style="font-size:11px;margin-top:6px">◆ rapport non protégé · ◇ rapport protégé</div>')}}
 if(page==='stat'){var sp=document.getElementById('st-ph');if(sp)tx('readonly',function(s){return s.count()}).then(function(n){var e=document.getElementById('st-ph');if(e)e.textContent=n}).catch(function(){})}
 if(page==='home'&&!document.getElementById('sr-btn')){var pt=Array.prototype.slice.call(A.querySelectorAll('.card h3')).filter(function(h){return h.textContent.trim()==='Priorités'})[0],anc=pt&&pt.closest('.card'),bt='<button id="sr-btn" class="btn" data-a="go" data-id="search" style="width:100%;margin:10px 0;text-align:left">🔍 Rechercher dans LAYNOOR…</button>';if(anc)anc.insertAdjacentHTML('afterend',bt);else A.insertAdjacentHTML('beforeend',bt)}
 if(page==='search'){var qi=document.getElementById('q-in');if(qi&&!qi.dataset.f){qi.dataset.f=1;try{qi.focus()}catch(e){}}}
 if(page==='home'){var cl=A.querySelector('.cal'),cc3=cl&&cl.closest('.card');
  if(cc3&&!cc3.dataset.wk){cc3.dataset.wk=1;Array.prototype.slice.call(cc3.querySelectorAll('.it')).forEach(function(r){r.remove()});
   Array.prototype.slice.call(cc3.querySelectorAll('p.mut')).forEach(function(q){if(q.textContent.indexOf('Rien de prévu')>-1)q.remove()});
   var wend=addD(mondayKey(),6),wev=(S.ev||[]).filter(function(e){return e.date>=today&&e.date<=wend}).sort(function(a,b){return(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))}).slice(0,6);
   cl.insertAdjacentHTML('afterend',wev.length?wev.map(function(e){return'<div class="it"><span class="t" style="margin:0">'+(e.date===today?(e.time||'—'):new Date(e.date+'T12:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'}))+'</span><span>'+esc(e.t)+'</span></div>'}).join(''):'<p class="mut">Rien de prévu cette semaine.</p>')}}
 if(page==='home'){var g3=Array.prototype.slice.call(A.querySelectorAll('.card h3')).filter(function(h){return h.textContent.indexOf('gratitude')>-1})[0];if(g3){var gcd=g3.closest('.card');if(gcd)gcd.remove()}
  var hyd=Array.prototype.slice.call(A.querySelectorAll('.card')).filter(function(c){var b=c.querySelector('b');return b&&b.textContent.trim()==='Hydratation'})[0],hum=Array.prototype.slice.call(A.querySelectorAll('.card h3')).filter(function(h){return h.textContent.trim()==='Humeur'})[0];
  if(hyd&&hum){var hcd=hum.closest('.card');if(hcd&&hyd.nextElementSibling!==hcd)hyd.insertAdjacentElement('afterend',hcd)}}
 document.querySelectorAll('.cal:not(.ecal)>button.pd').forEach(function(b){if(!b.querySelector('.pd-mk'))b.insertAdjacentHTML('beforeend','<i class="pd-mk"></i>')});
 var ic=document.getElementById('ics-card');if(ic&&!ic.dataset.t){ic.dataset.t=1;var ih=ic.firstElementChild;if(ih&&ih.tagName==='H3'){var wr=document.createElement('div');wr.className='row sp';ih.parentNode.insertBefore(wr,ih);wr.appendChild(ih);ih.style.margin='0';wr.insertAdjacentHTML('beforeend','<button class="btn" data-a="icsh" style="padding:4px 12px;font-size:12px">'+(S.icsShow?'Masquer':'Afficher')+'</button>');if(!S.icsShow)Array.prototype.slice.call(ic.children).forEach(function(c){if(c!==wr)c.style.display='none'})}}
 if(['org','home','well'].indexOf(page)>-1&&S.cyc){var A0=anchors(),f0=A0[0];document.querySelectorAll('.cal button[data-id]').forEach(function(b){var d=b.dataset.id;if(!/^\d{4}-\d\d-\d\d$/.test(d))return;if(!(b.classList.contains('pd')||b.classList.contains('ov')||b.classList.contains('fw')))return;if(cycReal(d))return;if(S.cyc.pause||(f0&&d<f0)||((S.cyc.nop||{})[d])){b.classList.remove('pd','ov','fw');var cn=b.querySelector('.cn');if(cn)cn.remove();var mk=b.querySelector('.pd-mk');if(mk)mk.remove()}})}
 if(S.cyc)document.querySelectorAll('.cal button[data-id]').forEach(function(b){var d=b.dataset.id;if(/^\d{4}-\d\d-\d\d$/.test(d)&&cycLogged(d)){if(!b.classList.contains('pd'))b.classList.add('pd');if(!b.closest('.ecal')&&!b.querySelector('.pd-mk'))b.insertAdjacentHTML('beforeend','<i class="pd-mk"></i>')}});
 if(page==='home'&&S.cyc&&inPeriod()&&!document.getElementById('per-home')){var prw=A.querySelector('.pr');
  if(prw){prw.insertAdjacentHTML('beforebegin','<div id="per-home">'+periodHome()+'</div>');prw.remove()}
  var hr3=A.querySelector('.hero');if(hr3)hr3.querySelectorAll('.row.sp,.bar').forEach(function(e){e.remove()});
  var cp=A.querySelector('.cal'),cpc=cp&&cp.closest('.card');if(cpc)cpc.querySelectorAll('p.mut').forEach(function(q){if(q.textContent.indexOf('Prochaine prière')===0)q.remove()})}
 if(page==='home'){var hmh=Array.prototype.slice.call(A.querySelectorAll('.card h3')).filter(function(h){return h.textContent.trim()==='Humeur'})[0],hmc=hmh&&hmh.closest('.card');
  if(hmc&&!hmc.querySelector('[data-n="gr"]'))hmc.insertAdjacentHTML('beforeend','<div class="mut" style="margin-top:12px">Gratitude du jour 🤍</div><textarea data-n="gr" rows="2" placeholder="Aujourd’hui, je remercie Allah pour…">'+esc((S.grat||{})[today]||'')+'</textarea>');
  var sb=document.getElementById('sr-btn');if(sb)A.appendChild(sb)}
 if(page==='set')document.querySelectorAll('.it').forEach(function(it){var s=it.querySelectorAll('span');if(s[0]&&s[0].textContent==='Météo'&&s[1])s[1].textContent='actif'});
}
var _d=draw,lastKey='';
draw=function(){var key=page+'|'+(sub[page]||''),open={};
 if(key===lastKey)document.querySelectorAll('#app details[open]').forEach(function(d){var s=d.querySelector('summary'),b=s&&(s.querySelector('b')||s);if(b)open[b.textContent.trim()]=1});
 _d();
 document.querySelectorAll('#app details').forEach(function(d){var s=d.querySelector('summary'),b=s&&(s.querySelector('b')||s);if(b&&open[b.textContent.trim()])d.open=true});
 lastKey=key;try{enhance()}catch(e){console.error(e)}};

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
 if(sub.cuis==='courses')return'<h2>Cuisine</h2>'+t+coursesView();
 return _cu().replace(/<div class="tabs">[\s\S]*?<\/div>/,t)};

/* ===== Export calendrier Apple (.ics) ===== */
document.addEventListener('change',function(e){var m=/^ics-(ev|fast|pr|kahf)$/.exec(e.target.id||'');if(!m)return;S.icsOpt=Object.assign({ev:1,fast:1,pr:0,kahf:1},S.icsOpt||{});S.icsOpt[m[1]]=e.target.checked?1:0;save()});
function icsBuild(o){var L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//LAYNOOR//FR','CALSCALE:GREGORIAN','X-WR-CALNAME:LAYNOOR'],st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z',z=function(n){return String(n).padStart(2,'0')},ds=function(d){return d.replace(/-/g,'')},es=function(s){return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')};
 function ev(uid,title,date,time,mins){L.push('BEGIN:VEVENT','UID:'+uid+'@laynoor','DTSTAMP:'+st,'SUMMARY:'+es(title));
  if(/^\d\d:\d\d$/.test(time||'')){var m=+time.slice(0,2)*60+ +time.slice(3)+mins,ed=m>=1440?addD(date,1):date;L.push('DTSTART:'+ds(date)+'T'+time.replace(':','')+'00','DTEND:'+ds(ed)+'T'+z(Math.floor(m/60)%24)+z(m%60)+'00')}
  else L.push('DTSTART;VALUE=DATE:'+ds(date),'DTEND;VALUE=DATE:'+ds(addD(date,1)));
  L.push('END:VEVENT')}
 if(o.ev)S.ev.forEach(function(e){if(e.date&&e.t&&e.src!=='tg'&&e.src!=='gh')ev('ev-'+e.id,e.t,e.date,e.time||'',60)});
 if(o.fast)for(var i=0;i<90;i++){var d=addD(today,i),x=fi(d);if(x.no)continue;var t=x.ram?'Ramadan':x.jb?'Jeûne recommandé (jour blanc)':x.lj?'Jeûne recommandé (lundi ou jeudi)':'';if(t)ev('fast-'+d,t,d,'',0)}
 if(o.pr)for(var j=0;j<7;j++){var dd=addD(today,j),tt=times(new Date(dd+'T12:00'),S.loc.lat,S.loc.lng,S.ang);P.forEach(function(q){var f=fmt(tt[q]);if(/^\d\d:\d\d$/.test(f))ev('pr-'+dd+'-'+q,'Prière · '+PF[q],dd,f,20)})}
 if(o.kahf)for(var w=0;w<13;w++){var fd2=addD(today,w*7+((5-new Date(today+'T12:00').getDay()+7)%7));ev('kahf-'+fd2,'Sourate Al-Kahf (vendredi)',fd2,'',0)}
 L.push('END:VCALENDAR');return L.join('\r\n')}
act.icsx=function(){var o={ev:+!!(document.getElementById('ics-ev')||{}).checked,fast:+!!(document.getElementById('ics-fast')||{}).checked,pr:+!!(document.getElementById('ics-pr')||{}).checked,kahf:+!!(document.getElementById('ics-kahf')||{}).checked};S.icsOpt=o;
 if(!o.ev&&!o.fast&&!o.pr&&!o.kahf){alert('Coche au moins une case.');return}
 var f=new File([icsBuild(o)],'laynoor.ics',{type:'text/calendar'});
 if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f]}).catch(function(){});
 else{var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download='laynoor.ics';document.body.appendChild(a);a.click();a.remove()}};

/* ===== Souvenirs (photos stockées dans l'appareil, IndexedDB) ===== */
pages.splice(pages.findIndex(function(q){return q[0]==='set'}),0,['souv','📸','Souvenirs']);
var db,SVL=[],SVI=0,tu={},fu={};
function idb(){return new Promise(function(res,rej){if(db)return res(db);var r=indexedDB.open('laynoor-souv',2);r.onupgradeneeded=function(){var d=r.result;if(!d.objectStoreNames.contains('p'))d.createObjectStore('p',{keyPath:'id'});if(!d.objectStoreNames.contains('m'))d.createObjectStore('m')};r.onsuccess=function(){db=r.result;res(db)};r.onerror=function(){rej(r.error)}})}
function tx(mode,fn){return idb().then(function(d){return new Promise(function(res,rej){var t=d.transaction('p',mode),q=fn(t.objectStore('p'));t.oncomplete=function(){res(q&&q.result)};t.onerror=function(){rej(t.error)}})})}
function rs(file,max,q){return new Promise(function(res,rej){var u=URL.createObjectURL(file),im=new Image();im.onload=function(){var k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej()},'image/jpeg',q)};im.onerror=function(){URL.revokeObjectURL(u);rej()};im.src=u})}
V.souv=function(){return'<h2>Souvenirs</h2><div class="card"><p class="mut">Dépose ici tes photos, les premiers pas, les dessins, les petits moments à garder… Ajoute une légende : tout reste uniquement sur cet appareil, et les photos sont compressées pour économiser la place.</p><button class="btn d" id="sv-add">📸 Ajouter des photos</button><input type="file" id="sv-file" accept="image/*" multiple style="display:none"><p class="mut" id="sv-msg"></p></div><div id="sv-grid"></div><p class="mut">Les photos ne sont pas incluses dans la sauvegarde de Réglages : garde aussi tes originaux dans Photos.</p>'};
function svLoad(){tx('readonly',function(s){return s.getAll()}).then(function(a){var g=document.getElementById('sv-grid');if(!g)return;
 SVL=(a||[]).filter(function(r){return(r.k||'inst')===(sub.souv==='dess'?'dess':'inst')}).sort(function(x,y){return y.d.localeCompare(x.d)||y.id-x.id});
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
  var f=fs[i];Promise.all([rs(f,1600,.82),rs(f,360,.72)]).then(function(b){return svPut({id:Date.now()+i,d:iso(new Date(f.lastModified||Date.now())),cap:'',k:sub.souv==='dess'?'dess':'inst',full:b[0],th:b[1]})}).then(function(){n++;nx(i+1)}).catch(function(){nx(i+1)})})(0)});

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
if(sub.islam==='qibla'||sub.islam==='rappels')sub.islam='dhikr';
var _is=V.islam;
V.islam=function(){var k=sub.islam;if(k==='qibla'||k==='apprendre'||k==='mosquee')k=sub.islam='prieres';
 var tb=tabs('islam',[['dhikr','Dhikr'],['prieres','Prières & Qibla'],['dua','Dua'],['rappels','Rappels'],['jeune','Jeûne'],['coran','Coran']]);
 if(k==='dua')return'<h2>Islam</h2>'+tb+duaView();
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
pages.forEach(function(q){if(q[0]==='fam'){q[1]='🏡';q[2]='Foyer'}});
sub.fam='profils';sub.enf=sub.enf||'preg';
V.fam=function(){if(sub.fam!=='pharma')sub.fam='profils';return'<h2>Foyer</h2>'+tabs('fam',[['profils','Profils'],['pharma','Pharmacie']])+V.famBody(sub.fam)};
V.enf=function(){if(['preg','lait','crois'].indexOf(sub.enf)<0)sub.enf='preg';return'<h2>Enfant</h2>'+tabs('enf',[['preg','Grossesse'],['lait','Lait'],['crois','Croissance']])+V.famBody(sub.enf)};
var _w=V.well;V.well=function(){if(sub.well==='preg')sub.well='cycle';return _w().replace(/<div class="tabs">[\s\S]*?<\/div>/,tabs('well',[['cycle','Cycle'],['tirage','Tirage']]))};

/* ===== Profils -> Réglages ; Maison = Pharmacie ===== */
V.fam=function(){sub.fam='pharma';return'<h2>Foyer</h2>'+V.famBody('pharma')};
var _st=V.set;V.set=function(){var h=_st(),m='<div class="card"><h3>Services</h3>';return h.indexOf(m)>-1?h.replace(m,V.famBody('profils')+m):h+V.famBody('profils')};

/* ===== Courses modifiables ===== */
function coursesView(){var L=S.shop,h='<div class="card"><h3>Liste de courses</h3>'+(L.map(function(x){var fr=x.from?(x.from==='rec'?'recette':x.from+'.'):'';
  return'<div class="it" style="align-items:flex-start">'+heartBtn(x.d,'shop',x.id)+'<div style="flex:1;min-width:0"><input class="ln" data-a="edshop" data-id="'+x.id+'" value="'+esc(x.t)+'" aria-label="Article" style="width:100%">'+(fr?'<div class="mut" style="font-size:11px;margin-left:2px">pour '+esc(fr)+'</div>':'')+'</div><input data-a="edqty" data-id="'+x.id+'" value="'+esc(x.q||'')+'" placeholder="Qté" aria-label="Quantité" style="width:80px;text-align:center"><button class="x" data-a="delshop" data-id="'+x.id+'" aria-label="Retirer">×</button></div>'}).join('')||'<p class="mut">Liste vide.</p>');
 h+='<div class="row" style="margin-top:12px"><input id="sh-n" placeholder="Article" style="flex:1"><input id="sh-q" placeholder="Qté" style="width:80px;text-align:center"><button class="btn d" data-a="addshop2" aria-label="Ajouter">+</button></div><div class="row wrap" style="margin-top:8px"><button class="btn r" data-a="clearshop">Retirer les articles cochés</button></div><p class="mut">Touche un article ou sa quantité pour les modifier (ex. « Riz » et « 500 g »).</p></div>';return h}
act.addshop2=function(){var n=document.getElementById('sh-n'),q=document.getElementById('sh-q'),t=n&&n.value.trim();if(!t)return;S.shop.push({id:Date.now()+Math.random(),t:t,q:q?q.value.trim():'',d:0})};
document.addEventListener('change',function(e){var t=e.target,a=t.dataset&&t.dataset.a;if(a!=='edshop'&&a!=='edqty')return;e.stopImmediatePropagation();var x=S.shop.find(function(z){return z.id==t.dataset.id});if(!x)return;
 if(a==='edqty'){x.q=t.value.trim();var pq=RQ.exec(x.q);if(pq){var cv=uni(pq[1],pq[2]);x.n=cv[0];x.u=cv[1];x.parts={manuel:x.n};x.q=fmtQ(x.n,x.u)}else{x.n=null;x.u='';x.parts=null}save();return}
 var v=t.value.trim();if(v){x.t=v;save()}else{S.shop=S.shop.filter(function(z){return z!==x});save();draw()}},true);
document.addEventListener('keydown',function(e){if(e.key!=='Enter')return;var id=e.target.id;if(id==='sh-n'||id==='sh-q'){act.addshop2();save();draw();var n=document.getElementById('sh-n');if(n)n.focus()}});

/* ===== Prières & Qibla + Mosquées ===== */
function mosqueCard(){var g=function(q){return'https://www.google.com/maps/search/'+encodeURIComponent(q)};return'<div class="card"><h3>Trouver une mosquée</h3><p class="mut">Ouvre Google Maps avec la recherche choisie.</p>'+[['🕌 Mosquées près de moi','mosquée près de moi'],['🌸 Avec espace femmes','mosquée avec espace femmes près de moi'],['💧 Avec salle d’ablutions','mosquée avec ablutions près de moi']].map(function(x){return'<p><a class="btn" style="display:block;text-decoration:none" target="_blank" rel="noopener" href="'+g(x[1])+'">'+x[0]+'</a></p>'}).join('')+'<p class="mut">Vérifie sur place ou par téléphone : les équipements varient.</p></div>'}
var _pv=prayView;prayView=function(){return _pv()+mosqueCard()};

/* ===== Maison : Pharmacie + stock de lait ; Enfant : Croissance, Dents, Étapes, Grossesse ===== */
V.fam=function(){if(sub.fam!=='lait')sub.fam='pharma';return'<h2>Foyer</h2>'+tabs('fam',[['pharma','Pharmacie'],['lait','Stock de lait']])+(sub.fam==='lait'?laitView('stock')+consCard():V.famBody('pharma'))};
sub.enf='crois';
var TT=[['55','Deuxième molaire supérieure droite','25–33'],['54','Première molaire supérieure droite','13–19'],['53','Canine supérieure droite','16–22'],['52','Incisive latérale supérieure droite','9–13'],['51','Incisive centrale supérieure droite','8–12'],['61','Incisive centrale supérieure gauche','8–12'],['62','Incisive latérale supérieure gauche','9–13'],['63','Canine supérieure gauche','16–22'],['64','Première molaire supérieure gauche','13–19'],['65','Deuxième molaire supérieure gauche','25–33'],['85','Deuxième molaire inférieure droite','23–31'],['84','Première molaire inférieure droite','14–18'],['83','Canine inférieure droite','17–23'],['82','Incisive latérale inférieure droite','10–16'],['81','Incisive centrale inférieure droite','6–10'],['71','Incisive centrale inférieure gauche','6–10'],['72','Incisive latérale inférieure gauche','10–16'],['73','Canine inférieure gauche','17–23'],['74','Première molaire inférieure gauche','14–18'],['75','Deuxième molaire inférieure gauche','23–31']];
var MS=[[2,'2 mois',['Sourit en réponse à ton sourire ou à ta voix','Suit un objet ou ton visage des yeux','Lève la tête quelques secondes sur le ventre','Se calme quand on lui parle ou qu’on le prend']],
[4,'4 mois',['Rit aux éclats','Tient sa tête sans soutien','Porte ses mains ou un jouet à la bouche','Attrape un jouet qu’on lui tend','Se redresse sur les avant-bras sur le ventre']],
[6,'6 mois',['Se retourne dans les deux sens','Babille (« ba », « ma », « da »)','Tient assis avec un appui','Passe un jouet d’une main à l’autre','Réagit à son prénom']],
[9,'9 mois',['Tient assis seul','Se déplace (ramper, quatre pattes, sur les fesses)','Fait « au revoir » ou « coucou »','Joue à « coucou-caché »','Prend de petites choses avec ses doigts']],
[12,'12 mois',['Se met debout en s’agrippant','Marche en se tenant aux meubles','Dit « papa » ou « maman » avec sens','Prend de petits objets entre le pouce et l’index','Montre du doigt ce qu’il veut']],
[15,'15 mois',['Fait ses premiers pas seul','Dit quelques mots en plus de « papa » et « maman »','Empile deux cubes','Imite des gestes de la vie quotidienne']],
[18,'18 mois',['Marche seul avec assurance','Boit seul au verre','Mange seul avec ses doigts','Montre du doigt pour partager ce qui l’intéresse']],
[24,'2 ans',['Court','Monte les marches avec un appui','Associe deux mots (« encore lait »)','Comprend des consignes simples','Joue à faire semblant']],
[36,'3 ans',['Fait des phrases de plusieurs mots','Pédale sur un tricycle','Dessine un cercle','Joue avec d’autres enfants']]];
var TS={c:null,sel:null};
function kids2(){return S.fam.filter(function(f){return f.r==='Enfant'})}
function kidBar(K){if(!K.some(function(f){return f.id==TS.c}))TS.c=K[0].id;return'<div class="tabs">'+K.map(function(f){return'<button class="'+(f.id==TS.c?'on':'')+'" data-a="tkid" data-id="'+f.id+'">'+esc(f.n)+'</button>'}).join('')+'</div>'}
act.tkid=function(id){TS.c=id;TS.sel=null};
act.tooth=function(id){S.teeth=S.teeth||{};var t=S.teeth[TS.c]=S.teeth[TS.c]||{};if(t[id])delete t[id];else t[id]=today;TS.sel=id};
act.mile=function(id){var q=id.split('|');S.miles=S.miles||{};var m=S.miles[q[0]]=S.miles[q[0]]||{};if(m[q[1]])delete m[q[1]];else m[q[1]]=today};
document.addEventListener('change',function(e){var t=e.target;if(!t.dataset||t.dataset.a!=='tdate')return;e.stopImmediatePropagation();var T=(S.teeth||{})[TS.c];if(T&&t.value){T[t.dataset.id]=t.value;save();draw()}},true);
function arch(j,T){var cy=j?190:162,ry=118,s='';TT.slice(j*10,j*10+10).forEach(function(t,i){var th=Math.PI-(i+.5)*Math.PI/10,x=160+128*Math.cos(th),y=j?cy+ry*Math.sin(th):cy-ry*Math.sin(th),k=+t[0].slice(1),r=[0,13,12,13,16,18][k],on=!!T[t[0]],se=TS.sel===t[0];
 s+='<g data-a="tooth" data-id="'+t[0]+'" style="cursor:pointer"><circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r+'" style="fill:'+(on?'var(--heart)':'var(--card)')+';stroke:'+(se?'var(--ink)':'var(--sage2)')+';stroke-width:'+(se?3:1.5)+'"/><text x="'+x.toFixed(1)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="middle" font-size="10" style="fill:'+(on?'#fff':'var(--mut)')+';pointer-events:none">'+k+'</text></g>'});return s}
function noKid(t){return'<div class="card"><p class="mut">Ajoute un enfant dans Réglages › Profils pour suivre '+t+'.</p></div>'}
function dentsView(){var K=kids2();if(!K.length)return noKid('ses dents');var bar=kidBar(K),kid=K.find(function(f){return f.id==TS.c}),T=(S.teeth||{})[kid.id]||{},n=Object.keys(T).length;
 var sel=TS.sel&&TT.find(function(t){return t[0]===TS.sel});
 var panel=sel?'<div class="card" style="background:var(--rose)"><b>'+sel[1]+'</b><div class="mut">Sortie habituelle : '+sel[2]+' mois</div>'+(T[sel[0]]?'<div class="row" style="margin-top:8px"><span>♥ Sortie le</span><input type="date" data-a="tdate" data-id="'+sel[0]+'" value="'+T[sel[0]]+'" style="flex:1"></div>'+(kid.b?'<div class="mut">À '+ageTxt(kid.b,T[sel[0]])+'</div>':''):'<div class="mut" style="margin-top:6px">Pas encore sortie. Touche la dent pour la cocher.</div>')+'</div>':'<p class="mut">Touche une dent pour la cocher quand elle est sortie.</p>';
 var list=TT.filter(function(t){return T[t[0]]}).sort(function(a,b){return T[a[0]].localeCompare(T[b[0]])});
 return bar+'<div class="card"><div class="row sp"><h3>Dents de lait</h3><b>'+n+' / 20</b></div><svg viewBox="0 0 320 350" width="100%" role="img" aria-label="Schéma de dentition"><text x="160" y="104" text-anchor="middle" font-size="11" style="fill:var(--mut)">Haut</text><text x="160" y="256" text-anchor="middle" font-size="11" style="fill:var(--mut)">Bas</text>'+arch(0,T)+arch(1,T)+'</svg><p class="mut" style="font-size:12px">1 = incisive centrale · 2 = incisive latérale · 3 = canine · 4 = 1ʳᵉ molaire · 5 = 2ᵉ molaire. Rose plein = dent sortie. Droite et gauche sont celles de l’enfant.</p></div>'+panel
  +(list.length?'<div class="card"><h3>Dents sorties</h3>'+list.map(function(t){return'<div class="it"><span>'+t[1]+'<div class="mut">'+fd(T[t[0]])+(kid.b?' · à '+ageTxt(kid.b,T[t[0]]):'')+'</div></span></div>'}).join('')+'</div>':'')
  +'<p class="mut">Les âges sont des repères : chaque enfant a son rythme, avec parfois plusieurs mois d’écart. En cas de doute, demande à ton dentiste ou à ton pédiatre.</p>'}
function etapesView(){var K=kids2();if(!K.length)return noKid('ses étapes');var bar=kidBar(K),kid=K.find(function(f){return f.id==TS.c}),M=(S.miles||{})[kid.id]||{},mo=kid.b?difD(today,kid.b)/30.4375:null,cur=-1;
 if(mo!=null){cur=MS.findIndex(function(g){return mo<=g[0]});if(cur<0)cur=MS.length-1}
 var h=bar+'<p class="mut">Coche chaque étape quand elle est acquise. Ce sont des repères, pas un test : chaque enfant avance à son rythme.</p>';
 MS.forEach(function(g,gi){var d=0;g[2].forEach(function(t,i){if(M['g'+gi+'i'+i])d++});
  h+='<div class="card"><details '+(gi===cur?'open':'')+'><summary><b>'+g[1]+'</b> <span class="mut">'+d+' / '+g[2].length+'</span>'+(gi===cur?' <span class="mut">· âge de '+esc(kid.n)+'</span>':'')+'</summary>'+g[2].map(function(t,i){var k='g'+gi+'i'+i,on=!!M[k];return'<div class="it">'+heartBtn(on,'mile',kid.id+'|'+k)+'<span>'+esc(t)+(on?'<div class="mut" style="font-size:11px">le '+fd(M[k])+'</div>':'')+'</span></div>'}).join('')+'</details></div>'});
 return h+'<p class="mut">Si une étape tarde beaucoup ou si tu t’inquiètes, parles-en à ton pédiatre : le carnet de santé fait foi.</p>'}
V.enf=function(){if(['crois','dents','etapes','preg'].indexOf(sub.enf)<0)sub.enf='crois';var k=sub.enf;
 return'<h2>Enfant</h2>'+tabs('enf',[['crois','Croissance'],['dents','Dents'],['etapes','Étapes'],['preg','Grossesse']])+(k==='dents'?dentsView():k==='etapes'?etapesView():V.famBody(k))};

/* ===== Sauvegarde plus fiable (avec photos) ===== */
function b2d(b){return new Promise(function(res){var r=new FileReader();r.onload=function(){res(r.result)};r.readAsDataURL(b)})}
function bkDl(f){var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove()}
function bkShare(f){if(navigator.canShare&&navigator.canShare({files:[f]}))return navigator.share({files:[f]}).catch(function(e){if(e&&e.name!=='AbortError')bkDl(f)});bkDl(f);return Promise.resolve()}
function bkSheet(f){var v=document.createElement('div');v.style.cssText='position:fixed;inset:0;background:rgba(20,12,12,.6);z-index:60;display:flex;align-items:center;justify-content:center;padding:20px';
 v.innerHTML='<div class="card" style="max-width:360px;text-align:center"><h3>Sauvegarde prête ♡</h3><p class="mut">Touche le bouton, puis « Enregistrer dans Fichiers ».</p><p><button class="btn d" id="bk-go">Enregistrer / partager</button></p><button class="btn r" id="bk-x">Annuler</button></div>';document.body.appendChild(v);
 document.getElementById('bk-go').onclick=function(){bkShare(f).then(function(){v.remove()})};document.getElementById('bk-x').onclick=function(){v.remove()}}
act.bkex=function(){var a=document.activeElement;if(a&&a.blur)a.blur();S.lastBk=Date.now();save();bkShare(new File([JSON.stringify({app:'laynoor',v:2,date:new Date().toISOString(),data:S})],'laynoor-sauvegarde.json',{type:'application/json'}))};
act.bkexp=function(){var a=document.activeElement;if(a&&a.blur)a.blur();
 tx('readonly',function(s){return s.getAll()}).then(function(ps){return Promise.all((ps||[]).map(function(r){return Promise.all([b2d(r.full),b2d(r.th)]).then(function(b){return{id:r.id,d:r.d,cap:r.cap,k:r.k||'inst',full:b[0],th:b[1]}})}))}).then(function(arr){S.lastBk=Date.now();save();bkSheet(new File([JSON.stringify({app:'laynoor',v:2,date:new Date().toISOString(),data:S,photos:arr})],'laynoor-sauvegarde-photos.json',{type:'application/json'}))}).catch(function(){alert('Impossible de lire les photos pour la sauvegarde.')})};
document.addEventListener('change',function(e){if(e.target.id!=='bkf')return;var f=e.target.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){var o;try{o=JSON.parse(r.result)}catch(x){alert('Fichier de sauvegarde invalide.');return}
  var data=o&&o.app==='laynoor'&&o.data?o.data:o;if(!data||typeof data!=='object'||Array.isArray(data)){alert('Fichier de sauvegarde invalide.');return}
  var ph=o.photos||[],np=ph.length;
  if(!confirm('Remplacer toutes les données de cet appareil par cette sauvegarde'+(o.date?' du '+new Date(o.date).toLocaleDateString('fr-FR'):'')+' ?\n'+((data.ev||[]).length)+' rendez-vous'+(np?', '+np+' photos':'')+'.'))return;
  var done=function(){try{localStorage.setItem('laynoor',JSON.stringify(data))}catch(x){alert('Impossible d’écrire la sauvegarde sur cet appareil.');return}alert('Sauvegarde restaurée ♡');location.reload()};
  if(!np){done();return}
  var i=0;(function nx(){if(i>=np){done();return}var p=ph[i++];Promise.all([fetch(p.full).then(function(x){return x.blob()}),fetch(p.th).then(function(x){return x.blob()})]).then(function(b){return svPut({id:p.id,d:p.d,cap:p.cap||'',k:p.k||'inst',full:b[0],th:b[1]})}).then(nx).catch(nx)})()};
 r.readAsText(f)});

/* ===== Ordre du menu ===== */
(function(){var o=['home','org','fam','cuis','enf','islam','app','well','souv','ia','set'];pages.sort(function(a,b){var x=o.indexOf(a[0]),y=o.indexOf(b[0]);return(x<0?99:x)-(y<0?99:y)})})();

/* ===== Stockage plus fiable ===== */
var STORE_OK=true,lastM=null;
try{localStorage.setItem('__t','1');localStorage.removeItem('__t')}catch(e){STORE_OK=false}
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
function mSet(s){return idb().then(function(d){return new Promise(function(res){var t=d.transaction('m','readwrite');t.objectStore('m').put(s,'state');t.oncomplete=res;t.onerror=res})}).catch(function(){})}
function mGet(){return idb().then(function(d){return new Promise(function(res){var r=d.transaction('m','readonly').objectStore('m').get('state');r.onsuccess=function(){res(r.result)};r.onerror=function(){res(null)}})}).catch(function(){return null})}
(function(){var cur=null;try{cur=localStorage.getItem('laynoor')}catch(e){}
 if(!cur){mGet().then(function(m){if(m){try{Object.assign(S,JSON.parse(m));save();draw()}catch(e){}}})}
 else lastM=cur;
 function mir(){try{var c=localStorage.getItem('laynoor');if(c&&c!==lastM){lastM=c;mSet(c)}}catch(e){}}
 setInterval(mir,2500);document.addEventListener('visibilitychange',mir);addEventListener('pagehide',mir)})();

/* ===== Pharmacie et lait : ajout avec messages clairs ===== */
act.phadd2=function(){var g=function(i){var e=document.getElementById(i);return e?e.value.trim():''},ti=+g('pt'),n=g('pn')||(ti<MED.length-1?MED[ti][0]:''),dur=+g('pd')||0,op=g('po'),e=g('pe');
 if(!n){alert('Indique le nom du produit.');return}
 if(!e&&op&&dur>0)e=addD(op,dur);
 if(!e){alert('Indique une date de péremption, ou une date d’ouverture avec une durée après ouverture.');return}
 S.ph.push({id:Date.now()+Math.random(),n:n,exp:e,open:op,dur:dur,q:g('pq'),note:g('pno')})};
act.lsave=function(){var ml=+((document.getElementById('lml')||{}).value);if(!(ml>0)){alert('Indique la quantité en ml.');return}
 var lt=document.getElementById('lt'),t=lt&&lt.value?new Date(lt.value).getTime():Date.now();if(!t)t=Date.now();
 S.lait.items.push({id:Date.now()+Math.random(),ml:ml,l:(document.getElementById('ll')||{}).value||'F',t:t});S.lait.log.push({t:Date.now(),type:'add',ml:ml})};

/* ===== Mosquées : Mawaqit en premier ===== */
function mosqueCard(){var g=function(q){return'https://www.google.com/maps/search/'+encodeURIComponent(q)},b='display:block;text-decoration:none;margin:8px 0';
 return'<div class="card"><h3>Mosquées et horaires fiables</h3><p class="mut">Mawaqit affiche les horaires fixés par chaque mosquée elle-même, souvent plus précis qu’un calcul. Les données de Mawaqit ne sont pas encore intégrées à LAYNOOR : les liens ouvrent leur site et leur app.</p>'
 +'<a class="btn d" style="'+b+'" target="_blank" rel="noopener" href="https://mawaqit.net/fr/">🕌 Trouver une mosquée sur Mawaqit</a><a class="btn" style="'+b+'" target="_blank" rel="noopener" href="https://apps.apple.com/FR/app/id1460522683">📱 App Mawaqit (iPhone)</a>'
 +'<p class="mut" style="margin-top:12px">Pour chercher selon les équipements (Google Maps) :</p>'
 +[['🌸 Avec espace femmes','mosquée avec espace femmes près de moi'],['💧 Avec salle d’ablutions','mosquée avec ablutions près de moi']].map(function(x){return'<a class="btn r" style="'+b+'" target="_blank" rel="noopener" href="'+g(x[1])+'">'+x[0]+'</a>'}).join('')+'<p class="mut">Vérifie sur place ou par téléphone : les équipements varient.</p></div>'}

/* ===== Dua ===== */
var DU=[['Au réveil','الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ','Al-hamdu li-Llâhi l-ladhî ahyânâ ba‘da mâ amâtanâ wa ilayhi n-nushûr','Louange à Allah qui nous a rendus à la vie après nous avoir fait mourir, et c’est vers Lui que sera la résurrection.','Bukhari'],
['Avant de dormir','بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا','Bismika Llâhumma amûtu wa ahyâ','C’est en Ton nom, ô Allah, que je meurs et que je vis.','Bukhari'],
['Avant de manger','بِسْمِ اللَّهِ','Bismi Llâh','Au nom d’Allah.','Abu Dawud, Tirmidhi'],
['Après avoir mangé','الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ','Al-hamdu li-Llâhi l-ladhî at‘amanî hâdhâ wa razaqanîhi min ghayri hawlin minnî wa lâ quwwa','Louange à Allah qui m’a nourri de cela et me l’a accordé, sans force ni puissance de ma part.','Abu Dawud, Tirmidhi'],
['En quittant la maison','بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ','Bismi Llâh, tawakkaltu ‘alâ Llâh, wa lâ hawla wa lâ quwwata illâ bi-Llâh','Au nom d’Allah, je m’en remets à Allah ; il n’y a de force ni de puissance qu’en Allah.','Abu Dawud, Tirmidhi'],
['Demander pardon (Sayyid al-istighfar)','اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ','Allâhumma anta Rabbî lâ ilâha illâ ant, khalaqtanî wa anâ ‘abduk, wa anâ ‘alâ ‘ahdika wa wa‘dika mastata‘t, a‘ûdhu bika min sharri mâ sana‘t, abû’u laka bi-ni‘matika ‘alayya wa abû’u bi-dhanbî faghfir lî fa-innahu lâ yaghfiru dh-dhunûba illâ ant','Ô Allah, Tu es mon Seigneur, il n’y a de divinité que Toi. Tu m’as créé et je suis Ton serviteur ; je reste fidèle à mon engagement et à Ta promesse autant que je peux. Je cherche refuge en Toi contre le mal que j’ai commis. Je reconnais Tes bienfaits envers moi et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés en dehors de Toi.','Bukhari'],
['Le bien ici-bas et dans l’au-delà','رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ','Rabbanâ âtinâ fi d-dunyâ hasanatan wa fi l-âkhirati hasanatan wa qinâ ‘adhâba n-nâr','Notre Seigneur, accorde-nous une belle part ici-bas et une belle part dans l’au-delà, et protège-nous du châtiment du Feu.','Coran 2:201'],
['Faciliter une tâche','رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي','Rabbi shrah lî sadrî wa yassir lî amrî','Mon Seigneur, ouvre-moi la poitrine et facilite-moi ma tâche.','Coran 20:25-26'],
['Pour la science','رَبِّ زِدْنِي عِلْمًا','Rabbi zidnî ‘ilmâ','Mon Seigneur, augmente mon savoir.','Coran 20:114'],
['Pour ses parents','رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا','Rabbi rhamhumâ kamâ rabbayânî saghîrâ','Mon Seigneur, fais-leur miséricorde comme ils m’ont élevé(e) tout petit(e).','Coran 17:24'],
['Pour sa famille','رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا','Rabbanâ hab lanâ min azwâjinâ wa dhurriyyâtinâ qurrata a‘yunin wa j‘alnâ li-l-muttaqîna imâmâ','Notre Seigneur, fais de nos épouses et de nos descendants la joie de nos yeux, et fais de nous un modèle pour les pieux.','Coran 25:74'],
['Dans la détresse (Yunus)','لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ','Lâ ilâha illâ anta subhânaka innî kuntu mina z-zâlimîn','Il n’y a de divinité que Toi, gloire à Toi ! J’étais parmi les injustes.','Coran 21:87']];
function duaView(){return'<div class="card"><h3>Invocations (dua)</h3><p class="mut">Arabe, phonétique et sens en français, avec la source. Apprends la prononciation avec une personne de confiance.</p>'+DU.map(function(d){return'<details><summary><b>'+d[0]+'</b></summary>'+bl('',d[1],d[2],d[3])+'<div class="mut" style="font-size:12px">Source : '+d[4]+'</div></details>'}).join('')+'</div>'}

/* ===== Apprendre : prières surérogatoires ===== */
function sunnaView(){return'<div class="card"><h3>Les prières surérogatoires (sunna)</h3><p class="mut">Facultatives, mais très encouragées. Les ignorer n’est pas un péché.</p>'
 +'<h3 style="margin-top:12px">Les 12 rak‘ahs quotidiennes (rawatib)</h3>'
 +[['Fajr','2 rak‘ahs avant la prière'],['Dohr','4 rak‘ahs avant (par 2) et 2 après'],['Asr','aucune sunna fixe'],['Maghrib','2 rak‘ahs après'],['Isha','2 rak‘ahs après']].map(function(r){return'<div class="it"><b style="width:76px">'+r[0]+'</b><span>'+r[1]+'</span></div>'}).join('')
 +'<p class="mut">D’après le hadith d’Umm Habiba : 12 rak‘ahs par jour, en plus des obligatoires, valent une maison au paradis (Muslim 728 ; détail dans Tirmidhi 415). Une autre version rapportée par Ibn ‘Umar en compte 10 (2 avant et 2 après le Dohr, sans les 4 avant ; Tirmidhi 433).</p></div>'
 +'<div class="card"><h3>Comment les prier, pas à pas</h3>'+ol(['Fais l’intention précise dans ton cœur (par exemple : sunna du Fajr).','Prie 2 rak‘ahs comme une prière normale : takbir, Al-Fatiha et une sourate, ruku‘, sujud, assise.','Après la 2ᵉ rak‘ah : tashahhud, prière sur le Prophète ﷺ, puis salam.','Pour les 4 rak‘ahs avant le Dohr, enchaîne deux fois 2 rak‘ahs.','Pas d’adhan ni d’iqama pour une sunna.'])+'</div>'
 +'<div class="card"><h3>Les autres prières surérogatoires</h3>'
 +bl('Witr','','Après Isha, jusqu’à l’aube. Nombre impair de rak‘ahs : 1, 3, 5…','Le Prophète ﷺ a dit de faire du witr la dernière prière de la nuit (Bukhari 998, Muslim 751). Pour 3 rak‘ahs : 2 rak‘ahs + salam, puis 1 rak‘ah. Chez les hanafites, le witr est wajib (3 rak‘ahs) ; les autres écoles le considèrent comme sunna très confirmée.')
 +bl('Duha','','Entre environ 15 minutes après le lever du soleil et le moment du zénith','2 rak‘ahs au minimum, par 2 : elles tiennent lieu de l’aumône due chaque jour pour chaque articulation (Muslim 720).')
 +bl('Tahiyyat al-masjid (salut à la mosquée)','','2 rak‘ahs en entrant à la mosquée, avant de s’asseoir','Bukhari 444, Muslim 714.')
 +bl('Qiyam / Tahajjud (prière de nuit)','','Après Isha et un temps de sommeil, souvent dans le dernier tiers de la nuit','Par 2 rak‘ahs. D’après ‘Aïcha, le Prophète ﷺ priait le plus souvent 11 rak‘ahs (Bukhari 1147, Muslim 738). C’est la meilleure prière après les obligatoires (Muslim 1163).')
 +bl('Istikhara (demande de guidance)','','2 rak‘ahs surérogatoires, puis la dua d’istikhara, avant une décision importante','Bukhari 1162. Apprends la dua complète auprès d’une source fiable.')
 +'</div><div class="card"><h3>Moments où l’on évite les prières surérogatoires</h3><p class="mut">Sans raison particulière : de la prière du Fajr jusqu’au lever du soleil, au moment où le soleil est au zénith, et de la prière d’Asr jusqu’au coucher du soleil (Bukhari 581, Muslim 827). Certains savants permettent les prières qui ont une cause, comme le salut à la mosquée.</p></div>'+NOTE}
var _ap=V.app;V.app=function(){var T=tabs('app',[['rakat','Rak‘ahs'],['sunna','Sunna'],['ablu','Ablutions'],['shahada','Shahada'],['fatiha','Al-Fatiha'],['tash','Tashahhud'],['ghusl','Ghusl']]);
 if(sub.app==='sunna')return'<h2>Apprendre</h2>'+T+sunnaView();return _ap().replace(/<div class="tabs">[\s\S]*?<\/div>/,T)};

/* ===== Recettes végétales et DME ===== */
var C3='Frigo 3 jours · congélateur 3 mois';
BR.push(
['Bolognaise de lentilles (base végétale)','45 min · 8 portions · sert à 3 plats',['300 g de lentilles vertes ou brunes','2 oignons','2 carottes','3 gousses d’ail','800 g de tomates concassées','2 c. à s. de concentré de tomate','1 c. à c. d’origan','Huile d’olive'],['Cuis les lentilles 20 min dans l’eau, égoutte.','Fais revenir oignons, carottes et ail en petits dés.','Ajoute lentilles, tomates, concentré et origan, laisse mijoter 20 min.'],C3+'. Congèle en poches de 2 portions : pâtes, lasagnes végétales ou hachis.'],
['Chili sin carne','40 min · 8 portions',['3 boîtes de haricots rouges','1 boîte de maïs','2 poivrons','2 oignons','3 gousses d’ail','800 g de tomates concassées','100 g de lentilles corail','1 c. à s. de paprika','1 c. à c. de cumin'],['Fais revenir oignons, ail et poivrons.','Ajoute tomates, lentilles corail, épices et 300 ml d’eau, cuis 15 min.','Ajoute haricots égouttés et maïs, laisse mijoter 10 min.'],C3+'. Se sert avec du riz. Réchauffe à la casserole ou au micro-ondes jusqu’à ce que ce soit bien chaud.'],
['Falafels au four','45 min · 8 portions (environ 32 pièces)',['4 boîtes de pois chiches égouttés','1 oignon','3 gousses d’ail','1 bouquet de persil et de coriandre','2 c. à c. de cumin','3 c. à s. de farine','Huile d’olive'],['Mixe grossièrement tous les ingrédients, forme des boulettes.','Dispose sur une plaque huilée, cuis 25 min à 200 °C en retournant à mi-cuisson.'],C3+'. Congèle crus ou cuits. Réchauffe au four 15 min à 200 °C.'],
['Tajine de légumes et pois chiches','1 h · 8 portions',['2 courgettes','3 carottes','2 pommes de terre','2 boîtes de pois chiches','2 oignons','400 g de tomates concassées','1 c. à c. de gingembre','1 c. à c. de curcuma','1 c. à c. de cumin','Huile d’olive'],['Fais revenir les oignons avec les épices.','Ajoute les légumes en morceaux, les tomates et 300 ml d’eau, cuis 30 min.','Ajoute les pois chiches, laisse mijoter 10 min.'],C3+'. Se sert avec de la semoule ou du riz.'],
['Dahl de patate douce et lentilles corail','35 min · 8 portions',['300 g de lentilles corail','2 patates douces','2 oignons','3 gousses d’ail','1 morceau de gingembre','2 c. à c. de curry','400 ml de lait de coco','1 l d’eau'],['Fais revenir oignons, ail, gingembre et curry.','Ajoute patates douces en dés, lentilles, lait de coco et eau.','Cuis 25 min en remuant, jusqu’à une texture onctueuse.'],C3+'. Réchauffe à la casserole en ajoutant un peu d’eau.'],
['Hachis parmentier végétal','1 h · 8 portions · à gratiner',['400 g de lentilles vertes cuites','2 carottes','2 oignons','1,2 kg de pommes de terre','400 g de tomates concassées','50 g de beurre ou de margarine végétale','20 cl de lait ou de boisson végétale'],['Fais revenir oignons et carottes, ajoute lentilles et tomates, cuis 15 min.','Cuis les pommes de terre, écrase-les avec le beurre et le lait.','Monte en barquettes : lentilles puis purée. Gratine 20 min à 200 °C.'],C3+'. Congèle avant de gratiner. Décongèle au frigo, puis four 30 à 40 min à 180 °C jusqu’à ce que ce soit bouillant à cœur.'],
['Bâtonnets de patate douce rôtie','30 min · 4 portions · DME',['2 patates douces','1 c. à s. d’huile d’olive'],['Épluche et coupe en bâtonnets de la taille d’un index d’adulte (6 à 7 cm).','Enfourne 25 min à 200 °C : ils doivent être très tendres.'],'Frigo 2 jours · congélateur 3 mois, à plat. Vérifie qu’ils s’écrasent facilement entre le pouce et l’index.'],
['Mini-omelettes aux légumes','25 min · 12 pièces · DME',['6 œufs','1 courgette râpée','1 carotte râpée','1 c. à s. d’huile'],['Mélange les œufs et les légumes râpés, sans sel.','Verse dans des moules à muffins huilés, cuis 15 min à 180 °C. Les œufs doivent être bien cuits.'],'Frigo 2 jours · congélateur 3 mois. Réchauffe jusqu’à ce que ce soit bien chaud, puis laisse tiédir.'],
['Galettes de lentilles corail et légumes','30 min · 12 galettes · DME',['150 g de lentilles corail cuites','1 carotte râpée','1 œuf','3 c. à s. de flocons d’avoine','1 c. à c. de cumin'],['Mélange tous les ingrédients, sans sel.','Forme des galettes épaisses et cuis 4 min par face dans une poêle huilée.'],'Frigo 2 jours · congélateur 3 mois. Réchauffe à la poêle ou au four.'],
['Pancakes banane-avoine','20 min · 12 pancakes · DME',['2 bananes mûres','2 œufs','100 g de flocons d’avoine mixés','1 c. à c. de levure'],['Écrase les bananes, ajoute œufs, avoine et levure.','Cuis à la poêle en petites galettes, 2 min par face, sans sucre ajouté.'],'Frigo 2 jours · congélateur 3 mois. Réchauffe au grille-pain ou au four.']);
REC.length=0;BR.forEach(function(r){REC.push(r)});
BG.push(['🌱 Recettes végétales','Sans viande, parfaites à congeler.',[17,18,19,20,21,22]],['👶 DME (finger foods)','Pour la diversification menée par l’enfant. Lis d’abord les consignes de sécurité ci-dessus.',[23,24,25,26]]);
var DMES='<div class="card" style="background:var(--rose)"><h3>DME : consignes de sécurité</h3>'+ol(['Commence quand l’enfant tient assis avec peu d’aide, s’intéresse à la nourriture et attrape les objets (en général vers 6 mois).','Toujours assis bien droit, jamais allongé, jamais seul pendant qu’il mange.','Aliments très tendres, qui s’écrasent entre le pouce et l’index. Coupe en bâtonnets de la taille d’un index d’adulte.','Raisins, tomates cerises, olives : coupés en quatre dans la longueur. Pomme et carotte crues : râpées ou cuites.','Pas de fruits à coque entiers, de pop-corn ni de bonbons durs. Pas de miel avant 1 an.','Pas de sel ni de sucre ajoutés. Œufs toujours bien cuits.','Apprends à distinguer un haut-le-cœur (bruyant, il remonte tout seul) d’un étouffement (silencieux), et les gestes de premiers secours du nourrisson.'])+'<p class="mut">Repères généraux : parles-en à ton pédiatre, surtout en cas d’allergie ou de prématurité.</p></div>';
var _bv=batchView;batchView=function(){var h=_bv(),m='<div class="card"><h3>👶 DME';return h.indexOf(m)>-1?h.replace(m,DMES+m):h+DMES};

/* ===== Oummi (ex-Elle), Foyer/Astuces, Enfant, Apprendre : mise à jour ===== */
pages.forEach(function(q){if(q[0]==='well')q[2]='Oummi'});
V.well=function(){return _w().replace('<h2>Elle</h2>','<h2>Oummi</h2>').replace(/<div class="tabs">[\s\S]*?<\/div>/,tabs('well',[['cycle','Cycle'],['tirage','Tirage'],['preg','Grossesse']]))};
act.kahf=function(){S.kahf=S.kahf||{};S.kahf[today]=!S.kahf[today]};
act.srt=function(id){S.srt=S.srt||{};if(S.srt[id])delete S.srt[id];else S.srt[id]=today};
act.nom=function(id){S.noms=S.noms||{};if(S.noms[id])delete S.noms[id];else S.noms[id]=today};
act.tipadd=function(){var i=document.getElementById('tip-n'),v=i&&i.value.trim();if(!v)return;S.tips=S.tips||[];S.tips.push({id:Date.now(),t:v})};
act.tipdel=function(id){S.tips=(S.tips||[]).filter(function(x){return x.id!=id})};
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='tip-n'){act.tipadd();save();draw();var n=document.getElementById('tip-n');if(n)n.focus()}});
act.gogh=function(){page='app';sub.app='ablu';menuOpen=false;scrollTo(0,0)};
act.ladj=function(id){adjLait(+id)};

/* --- Foyer : Astuces en premier --- */
function astucesView(){var T=[
['Anti-poussière','1 bouchon d’adoucissant + 200 ml d’eau chaude dans un spray. Vaporise sur un chiffon microfibre (pas directement sur les écrans) et passe sur les meubles.'],
['Vitres sans traces','Eau et vinaigre blanc à parts égales dans un spray, un chiffon microfibre propre, puis un passage à sec.'],
['Calcaire sur les robinets','Pose un chiffon imbibé de vinaigre blanc 15 minutes, puis rince. Pas sur le marbre ni les pierres naturelles.'],
['Micro-ondes','Un bol d’eau avec du jus de citron, 3 à 5 minutes à puissance maximale. Laisse reposer 5 minutes, puis essuie.'],
['Frigo qui sent','Un petit bol de bicarbonate de soude au fond du frigo. Nettoie les étagères à l’eau tiède et un peu de savon.'],
['Canalisation qui ralentit','2 c. à s. de bicarbonate puis un demi-verre de vinaigre blanc. Attends 15 minutes et rince à l’eau chaude.'],
['Sols carrelés','Eau tiède avec une cuillère de savon noir liquide. Pas pour le parquet non vitrifié.']];
 var R=['La règle des 5 minutes : si ça prend moins de 5 minutes, fais-le tout de suite.','Un panier « à ranger » par étage, vidé une fois par jour.','Un objet qui entre, un objet qui sort.','Plie le linge à la verticale pour tout voir dans le tiroir.','Étiquette les boîtes de rangement et de cuisine.','Un « reset » de 15 minutes chaque soir : surfaces, évier, jouets.'];
 var W=[['Lundi','cuisine'],['Mardi','salle de bain'],['Mercredi','poussière'],['Jeudi','sols'],['Vendredi','linge de lit']];
 var my=(S.tips||[]);
 return'<div class="card"><h3>Astuces ménage</h3>'+T.map(function(t){return'<details><summary><b>'+t[0]+'</b></summary><p class="mut" style="font-size:14px">'+t[1]+'</p></details>'}).join('')+'</div>'
 +'<div class="card"><h3>Rangement</h3>'+ol(R)+'</div>'
 +'<div class="card"><h3>Mini-routine de la semaine</h3><p class="mut">Une idée souple, à adapter : une petite zone par jour.</p>'+W.map(function(w){return'<div class="it"><b style="width:84px">'+w[0]+'</b><span>'+w[1]+'</span></div>'}).join('')+'</div>'
 +'<div class="card"><h3>Mes astuces</h3>'+(my.map(function(x){return'<div class="it"><span>'+esc(x.t)+'</span><button class="x" data-a="tipdel" data-id="'+x.id+'" aria-label="Supprimer">×</button></div>'}).join('')||'<p class="mut">Ajoute tes propres astuces ici.</p>')+'<div class="row" style="margin-top:10px"><input id="tip-n" placeholder="Une astuce à garder…"><button class="btn d" data-a="tipadd" aria-label="Ajouter">+</button></div></div>'
 +'<div class="card" style="background:var(--rose)"><h3>Sécurité</h3>'+ol(['Ne mélange jamais la javel avec du vinaigre, de l’ammoniaque ou un produit acide : cela dégage un gaz toxique.','Aère la pièce quand tu nettoies et mets des gants.','Range tous les produits hors de portée des enfants, dans leur flacon d’origine, jamais dans une bouteille d’eau.','En cas d’ingestion ou d’inhalation, appelle le 15 ou ton centre antipoison.'])+'</div>'}
V.fam=function(){if(['astuces','dates','pharma','lait'].indexOf(sub.fam)<0)sub.fam='pharma';
 return'<h2>Foyer</h2>'+tabs('fam',[['pharma','Pharmacie'],['lait','Stock de lait'],['dates','Dates'],['astuces','Astuces']])+(sub.fam==='lait'?laitView('stock'):sub.fam==='pharma'?V.famBody('pharma'):sub.fam==='dates'?datesView():astucesView())};
sub.fam='pharma';

/* --- Goutte de lait interactive --- */
function adjLait(d){if(!d)return;var L=S.lait,now=Date.now();
 if(d>0){L.items.push({id:Date.now()+Math.random(),ml:d,l:'F',t:now});L.log.push({t:now,type:'add',ml:d});return}
 var rem=-d,live=L.items.filter(function(x){return lex(x)>now}).sort(function(a,b){return lex(a)-lex(b)});
 live.forEach(function(x){if(rem<=0)return;var u=Math.min(x.ml,rem);x.ml-=u;rem-=u;L.log.push({t:now,type:'use',ml:u});if(x.ml<=0)L.items=L.items.filter(function(z){return z!==x})})}
function dropFx(){var svg=document.querySelector('svg[aria-label="Stock de lait"]');if(!svg||svg.dataset.fx)return;svg.dataset.fx=1;svg.style.touchAction='none';svg.style.cursor='ns-resize';
 var goal=Math.max(lp(ltot()).wk,1),wave=svg.querySelector('g[clip-path] path'),tx=svg.querySelectorAll('text')[1],cur=ltot(),drag=false,target=cur;
 svg.insertAdjacentHTML('afterend','<div class="row" style="justify-content:center;gap:8px;margin:4px 0"><button class="btn" data-a="ladj" data-id="-50">−50</button><button class="btn" data-a="ladj" data-id="-10">−10</button><button class="btn" data-a="ladj" data-id="10">+10</button><button class="btn" data-a="ladj" data-id="50">+50</button></div><p class="mut" style="text-align:center">Glisse ton doigt sur la goutte pour monter ou baisser le niveau.</p>');
 function lvl(e){var r=svg.getBoundingClientRect(),y=(e.clientY-r.top)/r.height*240;return Math.max(0,Math.min(1,(225-y)/213))}
 function show(p){wave.setAttribute('d','M0 '+(225-p*213).toFixed(1)+'q25-8 50 0t50 0t50 0t50 0V240H0Z');target=Math.round(p*goal/10)*10;if(tx)tx.textContent=target+' ml'}
 svg.addEventListener('pointerdown',function(e){drag=true;try{svg.setPointerCapture(e.pointerId)}catch(x){}show(lvl(e))});
 svg.addEventListener('pointermove',function(e){if(drag)show(lvl(e))});
 function end(){if(!drag)return;drag=false;adjLait(target-cur);save();draw()}
 svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end)}

/* --- Enfant : Croissance, Dents (vraies dents), Étapes, Écran --- */
var TP={i:'M-9 -10C-10 8 -9 18 -4 18L4 18C9 18 10 8 9 -10C6 -34 -6 -34 -9 -10Z',c:'M-9 -10C-10 6 -6 14 0 22C6 14 10 6 9 -10C6 -36 -6 -36 -9 -10Z',m:'M-15 -6C-16 10 -12 17 -7 17C-4 13 -2 13 0 16C2 13 4 13 7 17C12 17 16 10 15 -6Z'};
var TR='M-12 -6C-13 -20 -9 -34 -6 -34C-3 -28 -3 -14 -4 -6ZM12 -6C13 -20 9 -34 6 -34C3 -28 3 -14 4 -6Z';
function tooth(t,j,i,T){var k=+t[0].slice(1),on=!!T[t[0]],se=TS.sel===t[0],x=22+i*30.5,y=j?150:62,ty=k<=2?'i':k===3?'c':'m',sc=k>=4?.9:1,fill=on?'#FFF8EC':'var(--card)',st=on?'var(--heart)':'var(--sage2)';
 return'<g data-a="tooth" data-id="'+t[0]+'" style="cursor:pointer" opacity="'+(on?1:.65)+'"><g transform="translate('+x.toFixed(1)+' '+y+') scale('+sc+' '+(j?-sc:sc)+')">'+(ty==='m'?'<path d="'+TR+'" style="fill:'+fill+';stroke:'+st+';stroke-width:1.6"/>':'')+'<path d="'+TP[ty]+'" style="fill:'+fill+';stroke:'+(se?'var(--ink)':st)+';stroke-width:'+(se?3:1.6)+'"'+(on?'':' stroke-dasharray="3 2"')+'/></g><text x="'+x.toFixed(1)+'" y="'+(y+(j?-4:7))+'" text-anchor="middle" font-size="10" style="fill:'+(on?'var(--heart)':'var(--mut)')+';pointer-events:none;font-weight:600">'+k+'</text></g>'}
function dentsView(){var K=kids2();if(!K.length)return noKid('ses dents');var bar=kidBar(K),kid=K.find(function(f){return f.id==TS.c}),T=(S.teeth||{})[kid.id]||{},n=Object.keys(T).length;
 var sel=TS.sel&&TT.find(function(t){return t[0]===TS.sel});
 var panel=sel?'<div class="card" style="background:var(--rose)"><b>'+sel[1]+'</b><div class="mut">Sortie habituelle : '+sel[2]+' mois</div>'+(T[sel[0]]?'<div class="row" style="margin-top:8px"><span>♥ Sortie le</span><input type="date" data-a="tdate" data-id="'+sel[0]+'" value="'+T[sel[0]]+'" style="flex:1"></div>'+(kid.b?'<div class="mut">À '+ageTxt(kid.b,T[sel[0]])+'</div>':''):'<div class="mut" style="margin-top:6px">Pas encore sortie. Touche la dent pour la cocher.</div>')+'</div>':'<p class="mut">Touche une dent pour la cocher quand elle est sortie.</p>';
 var list=TT.filter(function(t){return T[t[0]]}).sort(function(a,b){return T[a[0]].localeCompare(T[b[0]])});
 var svg='<svg viewBox="0 0 320 215" width="100%" role="img" aria-label="Schéma de dentition"><text x="160" y="14" text-anchor="middle" font-size="11" style="fill:var(--mut)">Dents du haut</text><text x="160" y="209" text-anchor="middle" font-size="11" style="fill:var(--mut)">Dents du bas</text><line x1="159" x2="159" y1="22" y2="198" stroke-dasharray="3 4" style="stroke:var(--line)"/>'+TT.slice(0,10).map(function(t,i){return tooth(t,0,i,T)}).join('')+TT.slice(10).map(function(t,i){return tooth(t,1,i,T)}).join('')+'</svg>';
 return bar+'<div class="card"><div class="row sp"><h3>Dents de lait</h3><b>'+n+' / 20</b></div>'+svg+'<p class="mut" style="font-size:12px">1 = incisive centrale · 2 = incisive latérale · 3 = canine · 4 = 1ʳᵉ molaire · 5 = 2ᵉ molaire. Dent pleine et rose = sortie. Droite et gauche sont celles de l’enfant (à gauche de l’image : côté droit).</p></div>'+panel
  +(list.length?'<div class="card"><h3>Chronologie</h3>'+list.map(function(t){return'<div class="it"><span>'+t[1]+'<div class="mut">'+fd(T[t[0]])+(kid.b?' · à '+ageTxt(kid.b,T[t[0]]):'')+'</div></span></div>'}).join('')+'</div>':'')
  +'<p class="mut">Les âges sont des repères : chaque enfant a son rythme, avec parfois plusieurs mois d’écart. En cas de doute, demande à ton dentiste ou à ton pédiatre.</p>'}
function ecranView(){return'<div class="card"><h3>Écrans et jeunes enfants</h3><p>Les écrans sont déconseillés chez les tout-petits. Le Haut Conseil de la santé publique et l’Académie de médecine recommandent d’éviter les écrans avant 3 ans, même en bruit de fond, puis de les limiter, toujours avec un adulte.</p>'
 +ol(['Avant 3 ans : aucun écran.','De 3 à 6 ans : exceptionnel, contenus choisis, avec toi, et pour une durée courte (repères courants : environ 30 minutes à 3 ans, au plus 1 heure vers 6 ans).','La règle des 4 pas : pas d’écran le matin, pas pendant les repas, pas dans la chambre, pas dans l’heure avant de dormir.','Évite aussi de regarder ton propre écran quand tu es avec ton enfant : il a besoin de ton regard.'])+'<p class="mut">Repères généraux : ton pédiatre peut t’aider à les adapter à ton enfant.</p></div>'
 +'<div class="card" style="background:var(--sage)"><h3>Quand c’est la seule solution</h3><p>La vie réelle est parfois compliquée : maladie, long trajet, besoin de souffler ou de cuisiner en sécurité… Ce n’est pas un échec. Dans ce cas :</p>'
 +ol(['Choisis un contenu calme, au rythme lent, avec peu de changements d’images à la seconde.','Reste avec lui quand tu peux, et parlez de ce que vous voyez.','Un épisode court, puis on éteint. Désactive la lecture automatique.','Pas de vidéos qui s’enchaînent vite, ni de publicités.','Évite l’écran pour le calmer à chaque fois ou pour le coucher.'])+'</div>'
 +'<div class="card"><h3>Dessins animés au rythme calme</h3><p class="mut">Des exemples souvent cités pour leur douceur. Regarde toujours un épisode avant pour vérifier qu’il te convient.</p>'+['Le Village de Dany','Mouk','Lucas l’araignée','Bluey'].map(function(x){return'<div class="it"><span>🌿 '+x+'</span></div>'}).join('')+'</div>'}
function enfIslam(){return'<details class="card"><summary><b>💗 Un rappel : les enfants dans l’islam</b></summary>'+[
 'Les biens et les enfants sont la parure de la vie ici-bas ; mais les bonnes œuvres qui durent sont meilleures auprès de ton Seigneur. (Coran 18:46, sens)',
 'Quand une personne meurt, ses œuvres s’arrêtent, sauf trois : une aumône continue, une science utile, et un enfant pieux qui invoque pour elle. (Muslim 1631, sens)',
 'À celui qui demandait qui méritait le plus sa bonne compagnie, le Prophète ﷺ a répondu trois fois « ta mère », puis « ton père ». (Bukhari 5971, Muslim 2548, sens)'].map(function(x){return'<p style="margin:10px 0">'+x+'</p>'}).join('')+'</details>'}
V.enf=function(){if(['crois','dents','etapes','ecran'].indexOf(sub.enf)<0)sub.enf='crois';var k=sub.enf;
 return'<h2>Enfant</h2>'+tabs('enf',[['crois','Croissance'],['dents','Dents'],['etapes','Étapes'],['ecran','Écran']])+enfIslam()+(k==='dents'?dentsView():k==='etapes'?etapesView():k==='ecran'?ecranView():V.famBody('crois'))};
sub.enf='crois';

/* --- Apprendre : voyage, sourates, 99 noms, ghusl avec ablutions --- */
function voyageView(){return'<div class="card"><h3>La prière du voyageur</h3><p class="mut">Pendant un voyage, Allah a allégé la prière : on peut la raccourcir (qasr) et, selon la plupart des écoles, regrouper deux prières (jam‘). Base : Coran 4:101 et la pratique du Prophète ﷺ en voyage (Bukhari et Muslim).</p>'
 +'<h3 style="margin-top:12px">Le raccourcissement (qasr)</h3>'+[['Fajr','2 rak‘ahs (inchangé)'],['Dohr','4 → 2 rak‘ahs'],['Asr','4 → 2 rak‘ahs'],['Maghrib','3 rak‘ahs (inchangé)'],['Isha','4 → 2 rak‘ahs']].map(function(r){return'<div class="it"><b style="width:76px">'+r[0]+'</b><span>'+r[1]+'</span></div>'}).join('')+'</div>'
 +'<div class="card"><h3>Le regroupement (jam‘)</h3>'+ol(['Dohr avec Asr, à l’heure de l’un ou de l’autre.','Maghrib avec Isha, à l’heure de l’un ou de l’autre.','Le Fajr ne se regroupe avec aucune autre prière.','Pas obligatoire : on peut aussi prier chaque prière à son heure, raccourcie.','Les hanafites ne permettent le regroupement en voyage qu’à Arafat et Muzdalifa (pendant le pèlerinage) ; les trois autres écoles le permettent en voyage.'])+'</div>'
 +'<div class="card"><h3>À savoir</h3>'+ol(['Le raccourcissement commence en quittant les limites de sa ville.','<b>Distance :</b> la majorité (malikites, chaféites, hanbalites) retient environ 80 km. Les hanafites parlent de trois jours de route, et d’autres savants se réfèrent à l’usage : ce que les gens appellent un « voyage ». Les estimations en kilomètres varient.','<b>Durée du séjour sur place :</b> malikites, chaféites et hanbalites : si tu comptes rester plus de 4 jours, tu pries en entier ; 4 jours ou moins, tu peux raccourcir (selon certains avis, les jours d’arrivée et de départ ne sont pas comptés). Hanafites : à partir de 15 jours de séjour prévu, on prie en entier ; en dessous, on raccourcit.','<b>Si tu ne sais pas combien de temps tu resteras</b> (une démarche ou une affaire à régler) et que tu n’as pas décidé de t’installer, tu peux continuer à raccourcir, même si cela dure plusieurs semaines (avis d’Ibn Qudama dans al-Mughni, repris par la Commission permanente saoudienne).','Raccourcir est fortement recommandé selon la majorité, et obligatoire chez les hanafites.','La prière du vendredi n’est pas due en voyage.'])+'<p class="mut">Sources consultées : IslamQA (réponses 44555, 82658 et 222814). Pour ton cas précis (distance, durée, avion ou train), demande à une personne de science de confiance.</p></div>'
 +'<div class="card"><h3>Invocation du voyage</h3>'+bl('','سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ','Subhâna l-ladhî sakhkhara lanâ hâdhâ wa mâ kunnâ lahû muqrinîn, wa innâ ilâ Rabbinâ la-munqalibûn','Gloire à Celui qui nous a soumis cela, alors que nous n’étions pas capables de le dominer. C’est vers notre Seigneur que nous retournerons. (Coran 43:13-14 ; Muslim 1342)')+'</div>'}
var SR=[['ikhlas','Al-Ikhlas',112,[['قُلْ هُوَ ٱللَّهُ أَحَدٌ','Qul huwa Llâhu ahad','Dis : « Il est Allah, Unique. »'],['ٱللَّهُ ٱلصَّمَدُ','Allâhu s-samad','Allah, le Seul vers qui l’on se tourne en toute chose.'],['لَمْ يَلِدْ وَلَمْ يُولَدْ','Lam yalid wa lam yûlad','Il n’a pas engendré et n’a pas été engendré.'],['وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ','Wa lam yakun lahû kufuwan ahad','Et nul n’est égal à Lui.']]],
['falaq','Al-Falaq',113,[['قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ','Qul a‘ûdhu bi-Rabbi l-falaq','Dis : « Je cherche protection auprès du Seigneur de l’aube naissante,'],['مِن شَرِّ مَا خَلَقَ','Min sharri mâ khalaq','contre le mal de ce qu’Il a créé,'],['وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ','Wa min sharri ghâsiqin idhâ waqab','contre le mal de l’obscurité quand elle s’étend,'],['وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ','Wa min sharri n-naffâthâti fi l-‘uqad','contre le mal de celles qui soufflent sur les nœuds,'],['وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ','Wa min sharri hâsidin idhâ hasad','et contre le mal de l’envieux quand il envie. »']]],
['nas','An-Nas',114,[['قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ','Qul a‘ûdhu bi-Rabbi n-nâs','Dis : « Je cherche protection auprès du Seigneur des hommes,'],['مَلِكِ ٱلنَّاسِ','Maliki n-nâs','le Souverain des hommes,'],['إِلَٰهِ ٱلنَّاسِ','Ilâhi n-nâs','le Dieu des hommes,'],['مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ','Min sharri l-waswâsi l-khannâs','contre le mal du chuchoteur qui se dérobe,'],['ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ','Alladhî yuwaswisu fî sudûri n-nâs','qui souffle le mal dans les poitrines des hommes,'],['مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ','Mina l-jinnati wa n-nâs','qu’il soit parmi les djinns ou parmi les hommes. »']]],
['kawthar','Al-Kawthar',108,[['إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ','Innâ a‘taynâka l-kawthar','Nous t’avons certes donné l’abondance.'],['فَصَلِّ لِرَبِّكَ وَٱنْحَرْ','Fa-salli li-Rabbika wa nhar','Prie donc pour ton Seigneur et sacrifie.'],['إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ','Inna shâni’aka huwa l-abtar','C’est celui qui te hait qui sera sans postérité.']]],
['asr','Al-‘Asr',103,[['وَٱلْعَصْرِ','Wa l-‘asr','Par le temps !'],['إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ','Inna l-insâna la-fî khusr','L’être humain est certes en perdition,'],['إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ','Illa l-ladhîna âmanû wa ‘amilû s-sâlihâti wa tawâsaw bi-l-haqqi wa tawâsaw bi-s-sabr','sauf ceux qui croient, font de bonnes œuvres, s’exhortent mutuellement à la vérité et s’exhortent mutuellement à la patience.']]],
['nasr','An-Nasr',110,[['إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ','Idhâ jâ’a nasru Llâhi wa l-fath','Lorsque vient le secours d’Allah et la victoire,'],['وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِى دِينِ ٱللَّهِ أَفْوَاجًا','Wa ra’ayta n-nâsa yadkhulûna fî dîni Llâhi afwâjâ','et que tu vois les gens entrer en foule dans la religion d’Allah,'],['فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًۢا','Fa-sabbih bi-hamdi Rabbika wa staghfirh, innahû kâna tawwâbâ','glorifie alors ton Seigneur par Sa louange et demande-Lui pardon : Il accepte toujours le repentir.']]],
['kafirun','Al-Kafirun',109,[['قُلْ يَٰٓأَيُّهَا ٱلْكَٰفِرُونَ','Qul yâ ayyuha l-kâfirûn','Dis : « Ô vous qui ne croyez pas !'],['لَآ أَعْبُدُ مَا تَعْبُدُونَ','Lâ a‘budu mâ ta‘budûn','Je n’adore pas ce que vous adorez,'],['وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ','Wa lâ antum ‘âbidûna mâ a‘bud','et vous n’adorez pas ce que j’adore.'],['وَلَآ أَنَا۠ عَابِدٌ مَّا عَبَدتُّمْ','Wa lâ ana ‘âbidun mâ ‘abadtum','Je ne suis pas adorateur de ce que vous avez adoré,'],['وَلَآ أَنتُمْ عَٰبِدُونَ مَآ أَعْبُدُ','Wa lâ antum ‘âbidûna mâ a‘bud','et vous n’êtes pas adorateurs de ce que j’adore.'],['لَكُمْ دِينُكُمْ وَلِىَ دِينِ','Lakum dînukum wa liya dîn','À vous votre religion, et à moi la mienne. »']]],
['quraysh','Quraysh',106,[['لِإِيلَٰفِ قُرَيْشٍ','Li-îlâfi Quraysh','Pour l’union des Quraysh,'],['إِۦلَٰفِهِمْ رِحْلَةَ ٱلشِّتَآءِ وَٱلصَّيْفِ','Îlâfihim rihlata sh-shitâ’i wa s-sayf','leur union lors du voyage de l’hiver et de l’été :'],['فَلْيَعْبُدُوا۟ رَبَّ هَٰذَا ٱلْبَيْتِ','Fa-l-ya‘budû Rabba hâdha l-bayt','qu’ils adorent donc le Seigneur de cette Maison,'],['ٱلَّذِىٓ أَطْعَمَهُم مِّن جُوعٍ وَءَامَنَهُم مِّنْ خَوْفٍۭ','Alladhî at‘amahum min jû‘in wa âmanahum min khawf','qui les a nourris contre la faim et les a rassurés contre la peur.']]]];
sub.sr=sub.sr||'ikhlas';
function sourView(){var d=S.srt||{},nb=SR.filter(function(s){return d[s[0]]}).length,cur=SR.find(function(s){return s[0]===sub.sr})||SR[0];
 return tabs('sr',SR.map(function(s){return[s[0],s[1]]}))+'<div class="card"><div class="row sp"><h3>Sourate '+cur[1]+' ('+cur[2]+')</h3><b>'+nb+' / '+SR.length+' apprises</b></div>'+cur[3].map(function(v,i){return bl('Verset '+(i+1),v[0],v[1],v[2])}).join('')
 +'<div class="row sp" style="margin-top:12px"><span>Je l’ai apprise'+(d[cur[0]]?' <span class="mut">(le '+fd(d[cur[0]])+')</span>':'')+'</span>'+heartBtn(d[cur[0]],'srt',cur[0])+'</div><p class="mut">Astuce : apprends un verset à la fois, répète-le à voix haute, puis enchaîne. Traductions du sens ; fais corriger ta récitation par une personne de confiance.</p></div>'}
var NM='اللَّهُ|Allāh|Le nom du Dieu unique;الرَّحْمَٰنُ|Ar-Raḥmān|Le Tout Miséricordieux;الرَّحِيمُ|Ar-Raḥīm|Le Très Miséricordieux;الْمَلِكُ|Al-Malik|Le Roi, le Souverain;الْقُدُّوسُ|Al-Quddūs|Le Saint;السَّلَامُ|As-Salām|La Paix, exempt de tout défaut;الْمُؤْمِنُ|Al-Mu’min|Celui qui donne la sécurité;الْمُهَيْمِنُ|Al-Muhaymin|Le Gardien vigilant;الْعَزِيزُ|Al-‘Azīz|Le Puissant;الْجَبَّارُ|Al-Jabbār|Celui qui répare et domine toute chose;الْمُتَكَبِّرُ|Al-Mutakabbir|Le Suprême en grandeur;الْخَالِقُ|Al-Khāliq|Le Créateur;الْبَارِئُ|Al-Bāri’|Celui qui donne l’existence;الْمُصَوِّرُ|Al-Muṣawwir|Celui qui donne les formes;الْغَفَّارُ|Al-Ghaffār|Celui qui pardonne sans cesse;الْقَهَّارُ|Al-Qahhār|Le Dominateur absolu;الْوَهَّابُ|Al-Wahhāb|Celui qui donne généreusement;الرَّزَّاقُ|Ar-Razzāq|Le Pourvoyeur;الْفَتَّاحُ|Al-Fattāḥ|Celui qui ouvre, le Juge;الْعَلِيمُ|Al-‘Alīm|L’Omniscient;الْقَابِضُ|Al-Qābiḍ|Celui qui resserre;الْبَاسِطُ|Al-Bāsiṭ|Celui qui élargit;الْخَافِضُ|Al-Khāfiḍ|Celui qui abaisse;الرَّافِعُ|Ar-Rāfi‘|Celui qui élève;الْمُعِزُّ|Al-Mu‘izz|Celui qui donne l’honneur;الْمُذِلُّ|Al-Mudhill|Celui qui humilie;السَّمِيعُ|As-Samī‘|L’Audient;الْبَصِيرُ|Al-Baṣīr|Le Clairvoyant;الْحَكَمُ|Al-Ḥakam|Le Juge;الْعَدْلُ|Al-‘Adl|Le Juste;اللَّطِيفُ|Al-Laṭīf|Le Subtil, le Bienveillant;الْخَبِيرُ|Al-Khabīr|Le Parfaitement Informé;الْحَلِيمُ|Al-Ḥalīm|Le Longanime;الْعَظِيمُ|Al-‘Aẓīm|L’Immense;الْغَفُورُ|Al-Ghafūr|Le Grand Pardonneur;الشَّكُورُ|Ash-Shakūr|Le Très Reconnaissant;الْعَلِيُّ|Al-‘Alī|Le Très Haut;الْكَبِيرُ|Al-Kabīr|Le Grand;الْحَفِيظُ|Al-Ḥafīẓ|Le Protecteur;الْمُقِيتُ|Al-Muqīt|Celui qui nourrit et pourvoit;الْحَسِيبُ|Al-Ḥasīb|Celui qui suffit et qui compte;الْجَلِيلُ|Al-Jalīl|Le Majestueux;الْكَرِيمُ|Al-Karīm|Le Généreux;الرَّقِيبُ|Ar-Raqīb|Le Vigilant;الْمُجِيبُ|Al-Mujīb|Celui qui répond;الْوَاسِعُ|Al-Wāsi‘|Le Vaste;الْحَكِيمُ|Al-Ḥakīm|Le Sage;الْوَدُودُ|Al-Wadūd|Le Très Aimant;الْمَجِيدُ|Al-Majīd|Le Glorieux;الْبَاعِثُ|Al-Bā‘ith|Celui qui ressuscite;الشَّهِيدُ|Ash-Shahīd|Le Témoin;الْحَقُّ|Al-Ḥaqq|La Vérité;الْوَكِيلُ|Al-Wakīl|Celui à qui l’on s’en remet;الْقَوِيُّ|Al-Qawī|Le Fort;الْمَتِينُ|Al-Matīn|L’Inébranlable;الْوَلِيُّ|Al-Walī|Le Protecteur, l’Allié;الْحَمِيدُ|Al-Ḥamīd|Le Digne de louange;الْمُحْصِي|Al-Muḥṣī|Celui qui dénombre tout;الْمُبْدِئُ|Al-Mubdi’|Celui qui commence la création;الْمُعِيدُ|Al-Mu‘īd|Celui qui la fait recommencer;الْمُحْيِي|Al-Muḥyī|Celui qui donne la vie;الْمُمِيتُ|Al-Mumīt|Celui qui donne la mort;الْحَيُّ|Al-Ḥayy|Le Vivant;الْقَيُّومُ|Al-Qayyūm|Celui qui subsiste par Lui-même;الْوَاجِدُ|Al-Wājid|Celui à qui rien ne manque;الْمَاجِدُ|Al-Mājid|Le Noble;الْوَاحِدُ|Al-Wāḥid|L’Unique;الصَّمَدُ|Aṣ-Ṣamad|Le Seul vers qui l’on se tourne;الْقَادِرُ|Al-Qādir|Le Capable;الْمُقْتَدِرُ|Al-Muqtadir|Le Tout-Puissant;الْمُقَدِّمُ|Al-Muqaddim|Celui qui avance;الْمُؤَخِّرُ|Al-Mu’akhkhir|Celui qui retarde;الْأَوَّلُ|Al-Awwal|Le Premier;الْآخِرُ|Al-Ākhir|Le Dernier;الظَّاهِرُ|Aẓ-Ẓāhir|L’Apparent;الْبَاطِنُ|Al-Bāṭin|Le Caché;الْوَالِي|Al-Wālī|Le Gouverneur;الْمُتَعَالِي|Al-Muta‘ālī|Le Très Élevé;الْبَرُّ|Al-Barr|Le Bienfaisant;التَّوَّابُ|At-Tawwāb|Celui qui accepte le repentir;الْمُنْتَقِمُ|Al-Muntaqim|Celui qui punit les injustes;الْعَفُوُّ|Al-‘Afuww|Celui qui efface les péchés;الرَّءُوفُ|Ar-Ra’ūf|Le Compatissant;مَالِكُ الْمُلْكِ|Mālik al-Mulk|Le Maître de la royauté;ذُو الْجَلَالِ وَالْإِكْرَامِ|Dhū l-Jalāli wa l-Ikrām|Le Détenteur de la majesté et de la générosité;الْمُقْسِطُ|Al-Muqsiṭ|L’Équitable;الْجَامِعُ|Al-Jāmi‘|Celui qui rassemble;الْغَنِيُّ|Al-Ghanī|Le Riche par Lui-même;الْمُغْنِي|Al-Mughnī|Celui qui enrichit;الْمَانِعُ|Al-Māni‘|Celui qui retient;الضَّارُّ|Aḍ-Ḍārr|Celui qui peut éprouver ou nuire à qui Il veut;النَّافِعُ|An-Nāfi‘|Celui qui procure le bien;النُّورُ|An-Nūr|La Lumière;الْهَادِي|Al-Hādī|Celui qui guide;الْبَدِيعُ|Al-Badī‘|Le Créateur incomparable;الْبَاقِي|Al-Bāqī|Celui qui demeure;الْوَارِثُ|Al-Wārith|L’Héritier;الرَّشِيدُ|Ar-Rashīd|Celui qui guide vers le droit chemin;الصَّبُورُ|Aṣ-Ṣabūr|Le Très Patient'.split(';').map(function(r){return r.split('|')});
function nomsView(){var d=S.noms||{},nb=Object.keys(d).length;
 return'<div class="card"><h3>Les 99 noms d’Allah</h3><p class="mut">Le Prophète ﷺ a dit qu’Allah a 99 noms, et que celui qui les « retient » (ahsâhâ) entrera au paradis (Bukhari 2736, Muslim 2677). Retenir inclut les mémoriser, comprendre leur sens et invoquer Allah par eux.</p>'
 +'<p class="mut">La liste ci-dessous est la liste traditionnelle, rapportée par Tirmidhi (3507). Beaucoup de savants du hadith, dont Ibn Hajar, considèrent que l’énumération elle-même a été ajoutée par un transmetteur : le nombre est authentique, la liste exacte fait débat. Les noms d’Allah ne se limitent pas à 99 (an-Nawawi, Coran 7:180).</p>'
 +'<div class="row sp"><b>'+nb+' / 99 appris</b></div></div><div class="card">'+NM.map(function(n,i){return'<div class="it"><b style="width:30px;color:var(--mut)">'+(i+1)+'</b><span><div class="ar" style="font-size:22px;text-align:right">'+n[0]+'</div><b>'+n[1]+'</b><div class="mut" style="font-size:13px">'+n[2]+'</div></span>'+heartBtn(d[i+1],'nom',i+1)+'</div>'}).join('')+'</div><p class="mut">Certains noms vont par paires de sens opposés (Al-Khāfiḍ/Ar-Rāfi‘, Al-Qābiḍ/Al-Bāsiṭ, Al-Mu‘izz/Al-Mudhill, Aḍ-Ḍārr/An-Nāfi‘) : on les évoque ensemble.</p>'}
function ghuslCard(){return'<div class="card"><h3>Le ghusl (grandes ablutions)</h3>'+ol(['Intention.','Laver les mains, puis les parties intimes.','Faire les ablutions (wudu).','Verser de l’eau sur la tête 3 fois, en atteignant la racine des cheveux.','Laver le reste du corps, côté droit puis côté gauche.'])+'<p class="mut">Pour les cas précis (fin des règles, après les lochies…), vérifie auprès d’une source de savoir de confiance.</p></div>'}
var _ap2=V.app;V.app=function(){var k=sub.app;if(k==='ghusl')k=sub.app='ablu';
 var T=tabs('app',[['rakat','Rak‘ahs'],['sunna','Sunna'],['ablu','Ablutions & ghusl'],['voyage','Voyage'],['shahada','Shahada'],['fatiha','Al-Fatiha'],['sour','Sourates'],['tash','Tashahhud'],['noms','99 noms']]),h='<h2>Apprendre</h2>'+T;
 if(k==='voyage')return h+voyageView();if(k==='sour')return h+sourView();if(k==='noms')return h+nomsView();
 var r=_ap2().replace(/<div class="tabs">[\s\S]*?<\/div>/,T);return k==='ablu'?r+ghuslCard():r};

/* ===== Routine de rangement modifiable + calendrier ===== */
var RJ=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],rtnMsg='';
function rtnGet(){if(!S.routine)S.routine={Lundi:'Cuisine',Mardi:'Salle de bain',Mercredi:'Poussière',Jeudi:'Sols',Vendredi:'Linge de lit',Samedi:'',Dimanche:''};return S.routine}
function routineCard(){var R=rtnGet();return'<div class="card"><h3>Ma routine de rangement</h3><p class="mut">Une petite zone par jour. Modifie chaque ligne, laisse vide pour un jour de repos.</p>'+RJ.map(function(d){return'<div class="row" style="margin:6px 0"><b style="width:84px">'+d+'</b><input data-a="rtn" data-id="'+d+'" value="'+esc(R[d]||'')+'" placeholder="Rien"></div>'}).join('')+'<div class="row wrap" style="margin-top:10px"><button class="btn d" data-a="rtncal">Ajouter au calendrier (4 semaines)</button><button class="btn r" data-a="rtnclr">Retirer du calendrier</button></div>'+(rtnMsg?'<p class="mut">'+rtnMsg+'</p>':'')+'</div>'}
var _av=astucesView;astucesView=function(){var h=_av(),a=h.indexOf('<div class="card"><h3>Mini-routine de la semaine</h3>'),b=h.indexOf('<div class="card"><h3>Mes astuces</h3>');return a>-1&&b>a?h.slice(0,a)+routineCard()+h.slice(b):h};
act.rtncal=function(){var R=rtnGet();S.ev=S.ev.filter(function(e){return e.src!=='rtn'});var n=0;
 for(var i=0;i<28;i++){var d=new Date();d.setDate(d.getDate()+i);var nm=RJ[(d.getDay()+6)%7],t=(R[nm]||'').trim();if(t){S.ev.push({id:Date.now()+i+Math.random(),t:'Ménage · '+t,date:iso(d),time:'',src:'rtn'});n++}}
 rtnMsg=n?n+' rappels ajoutés au calendrier pour les 4 prochaines semaines.':'Ajoute au moins une zone avant d’envoyer au calendrier.'};
act.rtnclr=function(){S.ev=S.ev.filter(function(e){return e.src!=='rtn'});rtnMsg='Rappels de rangement retirés du calendrier.'};
document.addEventListener('change',function(e){var t=e.target;if(!t.dataset||t.dataset.a!=='rtn')return;e.stopImmediatePropagation();rtnGet()[t.dataset.id]=t.value.trim();save()},true);
act.leg=function(){S.legHide=!S.legHide};
act.kahfd=function(id){S.kahf=S.kahf||{};S.kahf[id]=!S.kahf[id]};

/* ===== Liste de courses : fusion automatique des quantités ===== */
var UN='kg|g|l|ml|cl|c\\. à s\\.|c\\. à c\\.|gousses?|boîtes?|branches?|bouquets?|feuilles?|tranches?|morceaux?|pincées?|sachets?';
var RI=new RegExp('^(\\d+(?:[.,]\\d+)?)\\s*(?:('+UN+')(?![a-zA-Zà-ÿ]))?\\s*(?:d[’\']\\s*|de\\s+|du\\s+|des\\s+)?(.+)$','i');
var RQ=new RegExp('^\\s*(\\d+(?:[.,]\\d+)?)\\s*(?:('+UN+')(?![a-zA-Zà-ÿ]))?\\s*$','i');
function uni(n,u){u=(u||'').toLowerCase();var v=parseFloat(String(n).replace(',','.'));if(u==='kg')return[v*1000,'g'];if(u==='g')return[v,'g'];if(u==='l')return[v*1000,'ml'];if(u==='cl')return[v*10,'ml'];if(u==='ml')return[v,'ml'];return[v,u.replace(/s$/,'')]}
function fmtQ(n,u){if(n==null)return'';var r=function(x){return String(Math.round(x*100)/100).replace('.',',')};if(u==='g')return n>=1000?r(n/1000)+' kg':r(n)+' g';if(u==='ml')return n>=1000?r(n/1000)+' l':r(n)+' ml';if(!u)return r(n);var pl=n>1&&/^(gousse|boîte|branche|bouquet|feuille|tranche|morceau|pincée|sachet)$/.test(u);return r(n)+' '+u+(pl?'s':'')}
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z ]/g,' ').split(/\s+/).filter(Boolean).map(function(w){return w.replace(/(s|x)$/,'')}).join(' ')}
function parseIng(s){s=String(s).trim();var m=RI.exec(s);if(!m)return{name:s,n:null,u:''};var q=uni(m[1],m[2]);return{name:m[3].trim(),n:q[0],u:q[1]}}
function shopAdd(ing,src,from){var k=norm(ing.name),x=S.shop.find(function(z){return norm(z.t)===k&&((ing.n==null&&z.n==null)||(ing.n!=null&&z.n!=null&&z.u===ing.u))});
 if(!x){x={id:Date.now()+Math.random(),t:ing.name.charAt(0).toUpperCase()+ing.name.slice(1),d:0,from:from,n:ing.n,u:ing.u,q:ing.qtxt||fmtQ(ing.n,ing.u),parts:ing.n!=null?{}:null};if(ing.n!=null)x.parts[src]=ing.n;S.shop.push(x);return'new'}
 if(ing.n==null)return'dup';x.parts=x.parts||{};if(x.parts[src]===ing.n)return'dup';var b=x.n;x.parts[src]=ing.n;x.n=Object.keys(x.parts).reduce(function(s,key){return s+x.parts[key]},0);x.q=fmtQ(x.n,x.u);if(x.n!==b)x.d=0;return'merge'}
function shopMsg(a,m){return(a?a+' ajouté'+(a>1?'s':''):'')+(m?(a?', ':'')+m+' quantité'+(m>1?'s':'')+' fusionnée'+(m>1?'s':'')+' avec une ligne existante':'')||'Rien de nouveau à ajouter'}
function addIngLs(d){var a=0,m=0;ingList(d).forEach(function(s){var r=shopAdd(parseIng(s),'menu:'+d,d.slice(0,3));if(r==='new')a++;else if(r==='merge')m++});return[a,m]}
act.link=function(id){var r=addIngLs(id);toast=shopMsg(r[0],r[1])};
act.linkall=function(){var a=0,m=0;days.forEach(function(d){var r=addIngLs(d);a+=r[0];m+=r[1]});toast=shopMsg(a,m)};
act.recshop=function(id){var a=0,m=0;REC[+id][2].forEach(function(s){var r=shopAdd(parseIng(s),'rec:'+id,'rec');if(r==='new')a++;else if(r==='merge')m++});toast=shopMsg(a,m)};
act.addshop2=function(){var n=document.getElementById('sh-n'),q=document.getElementById('sh-q'),t=n&&n.value.trim();if(!t)return;var qv=q?q.value.trim():'',ing,pq=qv&&RQ.exec(qv);
 if(pq){var cv=uni(pq[1],pq[2]);ing={name:t,n:cv[0],u:cv[1]}}else if(qv)ing={name:t,n:null,u:'',qtxt:qv};else ing=parseIng(t);
 shopAdd(ing,'man:'+Date.now(),'')};
function coursesView(){var L=S.shop,h='<div class="card"><h3>Liste de courses</h3>'+(toast&&/ajout|fusion|Rien de nouveau/.test(toast)?'<p class="mut">'+toast+'</p>':'')+(L.map(function(x){var np=x.parts?Object.keys(x.parts).length:0,fr=np>1?'plusieurs repas ou recettes':x.from?(x.from==='rec'?'recette':x.from+'.'):'';
  return'<div class="it" style="align-items:flex-start">'+heartBtn(x.d,'shop',x.id)+'<div style="flex:1;min-width:0"><input class="ln" data-a="edshop" data-id="'+x.id+'" value="'+esc(x.t)+'" aria-label="Article" style="width:100%">'+(fr?'<div class="mut" style="font-size:11px;margin-left:2px">pour '+esc(fr)+'</div>':'')+'</div><input data-a="edqty" data-id="'+x.id+'" value="'+esc(x.q||'')+'" placeholder="Qté" aria-label="Quantité" style="width:92px;text-align:center"><button class="x" data-a="delshop" data-id="'+x.id+'" aria-label="Retirer">×</button></div>'}).join('')||'<p class="mut">Liste vide.</p>');
 return h+'<div class="row" style="margin-top:12px"><input id="sh-n" placeholder="Article" style="flex:1"><input id="sh-q" placeholder="Qté" style="width:92px;text-align:center"><button class="btn d" data-a="addshop2" aria-label="Ajouter">+</button></div><div class="row wrap" style="margin-top:8px"><button class="btn r" data-a="clearshop">Retirer les articles cochés</button></div><p class="mut">Les quantités des mêmes articles s’additionnent automatiquement (500 g + 250 g de riz = 750 g). Ajouter deux fois la même recette ne double pas les quantités. Touche un article ou sa quantité pour la modifier.</p></div>'}

/* ===== Lait : durées de conservation selon la source ===== */
var LP={cdc:['CDC (États-Unis)',4,4,6,'Au comptoir 4 h · réfrigéré 4 jours · congélateur 6 mois (12 mois acceptable). Décongelé : 24 h au frigo, 1 à 2 h à température ambiante. Réchauffé : 2 h. Restes de biberon : 2 h après la fin du repas. Ne jamais recongeler.'],
 abm:['ABM / La Leche League (idéal)',4,3,6,'Comptoir 3 à 4 h · frigo 72 h · congélateur 6 mois. Décongelé : 24 h au frigo, 1 à 2 h à température ambiante. Ne jamais recongeler.'],
 abm2:['ABM (acceptable, conditions très propres)',8,8,12,'Comptoir jusqu’à 6 à 8 h · frigo 5 à 8 jours · congélateur jusqu’à 12 mois, seulement avec un lait recueilli dans des conditions très propres. Décongelé : 24 h au frigo, 3 à 4 h à température ambiante.']};
if(!S.lait.preset)S.lait.preset=(S.lait.am===4&&S.lait.fj===4&&S.lait.cm===6)?'cdc':'custom';
function consCard(){var L=S.lait,pr=LP[L.preset],opts=Object.keys(LP).map(function(k){return'<option value="'+k+'" '+(L.preset===k?'selected':'')+'>'+LP[k][0]+'</option>'}).join('')+'<option value="custom" '+(!pr?'selected':'')+'>Personnalisé</option>';
 return'<div class="card"><details><summary><b>⏱️ Durées de conservation</b></summary><p class="mut" style="margin-top:8px">Choisis la source de référence : les durées de tes poches s’adaptent.</p><select data-a="lpreset">'+opts+'</select>'
 +(pr?'<p class="mut" style="font-size:13px;margin-top:8px">'+pr[4]+'</p>':'<p class="mut" style="font-size:13px;margin-top:8px">Durées personnalisées : règle-les ci-dessous.</p>')
 +'<div class="row sp" style="margin:8px 0"><span>Ambiant (heures)</span><input type="number" data-a="lam" value="'+L.am+'" style="width:90px"></div><div class="row sp" style="margin:8px 0"><span>Frigo (jours)</span><input type="number" data-a="lfj" value="'+L.fj+'" style="width:90px"></div><div class="row sp" style="margin:8px 0"><span>Congélateur (mois)</span><input type="number" data-a="lcm" value="'+L.cm+'" style="width:90px"></div>'
 +'<p class="mut" style="font-size:12px">Ces repères concernent les bébés nés à terme et en bonne santé. Pour un prématuré ou un bébé malade, demande à l’équipe médicale. Le repère de l’OMS et les repères français ne sont pas inclus : je n’ai pas pu les vérifier.</p></details></div>'}
document.addEventListener('change',function(e){var t=e.target,a=t.dataset&&t.dataset.a;if(!a)return;
 if(a==='lpreset'){e.stopImmediatePropagation();var L=S.lait,k=t.value;L.preset=k;if(LP[k]){L.am=LP[k][1];L.fj=LP[k][2];L.cm=LP[k][3]}save();draw();return}
 if(a==='lam'||a==='lfj'||a==='lcm')S.lait.preset='custom'},true);

/* ===== Hors connexion ===== */
(function(){if(!('serviceWorker' in navigator))return;var reg=function(){navigator.serviceWorker.register('sw.js').catch(function(){})};document.readyState==='complete'?reg():addEventListener('load',reg)})();
addEventListener('online',function(){draw()});addEventListener('offline',function(){draw()});

/* ===== Cycle : rapports ===== */
/* cycleView : voir plus bas */

/* ===== Dates importantes (anniversaires…) ===== */
var DTY={anniv:['🎂','Anniversaire'],mariage:['💍','Anniversaire de mariage'],autre:['📌','Autre date']};
function dtList(){var L=(S.dates||[]),F=(S.fam||[]).filter(function(f){return f.b}).map(function(f){var q=f.b.split('-');return{id:'fam'+f.id,t:f.n,type:'anniv',y:+q[0],m:+q[1],d:+q[2],fam:1}});return L.concat(F)}
function dtEvt(x,Y){var m=x.m,d=x.d;if(m===2&&d===29&&!(Y%4===0&&(Y%100!==0||Y%400===0)))d=28;var age=x.y?Y-x.y:null,ds=Y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'),t=x.type==='anniv'?'🎂 Anniversaire de '+x.t+(age>0?' · '+age+(age>1?' ans':' an'):''):x.type==='mariage'?'💍 '+x.t+(age>0?' · '+age+' ans':''):'📌 '+x.t;return{id:'dt-'+x.id+'-'+Y,t:t,date:ds,time:'',src:'dt'}}
function syncDates(){S.ev=(S.ev||[]).filter(function(e){return e.src!=='dt'});var y0=new Date().getFullYear();dtList().forEach(function(x){for(var Y=y0;Y<=y0+2;Y++){if(x.y&&Y<x.y)continue;S.ev.push(dtEvt(x,Y))}})}
function dtNext(x){var y=new Date().getFullYear(),e=dtEvt(x,y);if(e.date<today)e=dtEvt(x,y+1);return e.date}
function datesView(){var L=dtList().map(function(x){return{x:x,n:dtNext(x)}}).sort(function(a,b){return a.n.localeCompare(b.n)});
 return'<div class="card"><h3>Dates importantes</h3><p class="mut">Anniversaires et autres dates à ne pas oublier. Elles reviennent chaque année et apparaissent dans le calendrier. Les anniversaires des profils (Réglages › Profils) sont ajoutés automatiquement.</p>'
 +(L.map(function(o){var x=o.x,dl2=difD(o.n,today),ty=DTY[x.type]||DTY.autre,age=x.y?new Date(o.n+'T12:00').getFullYear()-x.y:0;
  return'<div class="it"><span style="flex:none;font-size:22px">'+ty[0]+'</span><span>'+esc(x.t)+'<div class="mut">'+fd(o.n)+(x.type==='anniv'&&age>0?' · aura '+age+(age>1?' ans':' an'):'')+' · '+(dl2===0?'aujourd’hui':'dans '+dl2+' j')+(x.fam?' · profil':'')+'</div></span>'+(x.fam?'':'<button class="x" data-a="dtdel" data-id="'+x.id+'" aria-label="Supprimer">×</button>')+'</div>'}).join('')||'<p class="mut">Aucune date pour l’instant.</p>')+'</div>'
 +'<div class="card"><h3>Ajouter une date</h3><select id="dt-t">'+Object.keys(DTY).map(function(k){return'<option value="'+k+'">'+DTY[k][0]+' '+DTY[k][1]+'</option>'}).join('')+'</select><input id="dt-n" placeholder="Nom ou description" style="margin-top:8px"><div class="row" style="margin-top:8px"><input id="dt-d" type="date" style="flex:1"><label style="display:flex;gap:6px;align-items:center;white-space:nowrap"><input type="checkbox" id="dt-ny" style="width:auto"> année inconnue</label></div><p><button class="btn d" data-a="dtadd">Ajouter au calendrier</button></p></div>'}
act.dtadd=function(){var g=function(i){var e=document.getElementById(i);return e?e:{}},n=g('dt-n').value&&g('dt-n').value.trim(),d=g('dt-d').value;if(!n||!d){alert('Indique un nom et une date.');return}
 var q=d.split('-');S.dates=S.dates||[];S.dates.push({id:Date.now(),t:n,type:g('dt-t').value||'autre',y:g('dt-ny').checked?null:+q[0],m:+q[1],d:+q[2]});syncDates()};
act.dtdel=function(id){S.dates=(S.dates||[]).filter(function(x){return x.id!=id});syncDates()};
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='dt-n'){act.dtadd();save();draw()}});
var _og=V.org;V.org=function(){syncDates();var T=tabs('org',[['agenda','Calendrier'],['matrice','Matrice Eisenhower']]);if(sub.org==='dates')sub.org='agenda';return _og().replace(/<div class="tabs">[\s\S]*?<\/div>/,T)};
syncDates();

/* ===== Bilan (statistiques) ===== */
pages.splice(pages.findIndex(function(q){return q[0]==='set'}),0,['stat','📊','Bilan']);
var stMsg='';
function f1(x){return String(Math.round(x*10)/10).replace('.',',')}
function sBar(v){return'<div style="height:8px;background:var(--line);border-radius:8px;margin:4px 0 8px"><div style="height:8px;width:'+Math.max(0,Math.min(100,v))+'%;background:var(--sage2);border-radius:8px"></div></div>'}
function srow(a,b){return'<div class="row sp" style="margin:6px 0"><span>'+a+'</span><b>'+b+'</b></div>'}
function sec(t,b){return'<div class="card"><h3>'+t+'</h3>'+b+'</div>'}
function dayList(n){var a=[];for(var i=n-1;i>=0;i--)a.push(addD(today,-i));return a}
function prCount(d){var o=S.pr[d]||{};return P.filter(function(q){return o[q]}).length}
function prFirst(){var k=Object.keys(S.pr||{}).filter(function(d){return prCount(d)>0}).sort();return k[0]||null}
function ingBump(name){var k=norm(name);if(!k)return;S.ingStat=S.ingStat||{};var o=S.ingStat[k]=S.ingStat[k]||{n:name,c:0};o.c++}
var _sa=shopAdd;shopAdd=function(i,s,f){var r=_sa(i,s,f);if(r!=='dup')ingBump(i.name);return r};
var _rs2=act.recshop;act.recshop=function(id){_rs2(id);S.recLog=S.recLog||{};S.recLog[id]=(S.recLog[id]||0)+1};
(function(){if(S.ingStat)return;S.ingStat={};Object.keys(S.ingL||{}).forEach(function(d){(S.ingL[d]||[]).forEach(function(s){ingBump(parseIng(s).name)})});(S.shop||[]).forEach(function(x){ingBump(x.t)})})();
function mondayKey(){var x=new Date(today+'T12:00'),w=(x.getDay()+6)%7;x.setDate(x.getDate()-w);return iso(x)}
function menuLogSet(k,t){S.menuLog=(S.menuLog||[]).filter(function(x){return x.k!==k});if(t)S.menuLog.push({k:k,t:t})}
function menuLogSync(){S.menuLog=S.menuLog||[];var wk=mondayKey();if(S.menuLogWk!==wk){S.menuLogWk=wk;days.forEach(function(d){var t=(S.menu[d]||'').trim();if(t)menuLogSet(wk+'|'+d,t)})}}
document.addEventListener('change',function(e){var t=e.target;if(t.dataset&&t.dataset.a==='menu'){menuLogSet(mondayKey()+'|'+t.dataset.id,t.value.trim());S.menuLogWk=mondayKey()}},true);
menuLogSync();
act.stadd=function(id){var o=(S.ingStat||{})[id];if(!o)return;var r=shopAdd({name:o.n,n:null,u:''},'stat','');stMsg=r==='new'?'« '+o.n+' » ajouté à la liste de courses.':'« '+o.n+' » est déjà dans la liste de courses.'};
function statView(){menuLogSync();var h='',f0=prFirst(),win=f0?Math.min(30,difD(today,f0)+1):0;
 if(!win)h+=sec('🕌 Prières','<p class="mut">Coche tes prières sur l’accueil : les statistiques apparaîtront ici.</p>');
 else{var ds=dayList(win).filter(function(d){return!cycOff(d)}),nw=ds.length||1,tot=0,per={};P.forEach(function(q){per[q]=0});ds.forEach(function(d){var o=S.pr[d]||{};P.forEach(function(q){if(o[q]){tot++;per[q]++}})});
  var d7=dayList(Math.min(7,win)).filter(function(d){return!cycOff(d)}),t7=0;d7.forEach(function(d){t7+=prCount(d)});
  var run=0,best=0,x=f0;while(x<=today){if(!cycOff(x)){run=prCount(x)===5?run+1:0;if(run>best)best=run}x=addD(x,1)}
  var cur=0,s0=(prCount(today)===5||cycOff(today))?today:addD(today,-1);while(s0>=f0&&(prCount(s0)===5||cycOff(s0))){if(!cycOff(s0))cur++;s0=addD(s0,-1)}
  var arr=P.map(function(q){return[q,per[q]/nw*100]}).sort(function(a,b){return b[1]-a[1]});
  h+=sec('🕌 Prières',srow('Moyenne (7 derniers jours)',f1(t7/(d7.length||1))+' / 5')+srow('Moyenne ('+win+' dernier'+(win>1?'s jours':' jour')+')',f1(tot/nw)+' / 5')+srow('Série de jours complets',cur+' j (record '+best+' j)')+'<div style="margin-top:10px">'+P.map(function(q){var v=per[q]/nw*100;return'<div class="row sp"><span>'+PF[q]+'</span><span class="mut">'+Math.round(v)+' %</span></div>'+sBar(v)}).join('')+'</div><p class="mut" style="font-size:12px">La plus régulière : '+PF[arr[0][0]]+' · à renforcer : '+PF[arr[arr.length-1][0]]+'.'+(win>nw?' Les jours de règles ne sont pas comptés.':'')+'</p>')}
 var dt=(S.dk&&S.dk.tot)||{},dk=Object.keys(dt).filter(function(d){return dt[d]>0}),sum=0,bD=0,bDt='';dk.forEach(function(d){sum+=dt[d];if(dt[d]>bD){bD=dt[d];bDt=d}});
 var l7=dayList(7),mx=Math.max.apply(null,l7.map(function(d){return dt[d]||0}).concat([1]));
 h+=sec('📿 Dhikr',dk.length?srow('Total',sum)+srow('Moyenne par jour de dhikr',f1(sum/dk.length))+srow('Meilleur jour',bD+' ('+fd(bDt)+')')+'<div style="display:flex;gap:6px;align-items:flex-end;height:74px;margin-top:10px">'+l7.map(function(d){var v=dt[d]||0;return'<div style="flex:1;text-align:center"><div style="height:'+Math.round(v/mx*50)+'px;background:var(--sage2);border-radius:6px 6px 0 0"></div><div class="mut" style="font-size:10px">'+'LMMJVSD'[(new Date(d+'T12:00').getDay()+6)%7]+'</div></div>'}).join('')+'</div><p class="mut" style="font-size:12px">Les 7 derniers jours.</p>':'<p class="mut">Utilise le compteur de dhikr : les statistiques apparaîtront ici.</p>');
 var pgT=0,pgD={};((S.qr&&S.qr.ch)||[]).forEach(function(c){var g=qpg(c);Object.keys(g).forEach(function(d){pgT+=g[d];pgD[d]=1})});
 var nS=SR.filter(function(s){return(S.srt||{})[s[0]]}).length,nN=Object.keys(S.noms||{}).length,kh=Object.keys(S.kahf||{}).filter(function(d){return S.kahf[d]}).length,fdn=Object.keys((S.fast&&S.fast.done)||{}).filter(function(d){return S.fast.done[d]}).length,ow=Object.keys((S.fast&&S.fast.owed)||{}).filter(function(d){return S.fast.owed[d]==1}).length+((S.fast&&S.fast.n)||0);
 h+=sec('📖 Coran et apprentissage',srow('Pages lues (défis)',pgT+' en '+Object.keys(pgD).length+' j')+srow('Sourates courtes apprises',nS+' / '+SR.length)+srow('Noms d’Allah appris',nN+' / 99')+srow('Sourate Al-Kahf (vendredis cochés)',kh)+srow('Jours de jeûne accomplis',fdn)+srow('Jours à rattraper',ow));
 var cnt={},nm={};(S.menuLog||[]).forEach(function(x){var k=norm(x.t);if(!k)return;cnt[k]=(cnt[k]||0)+1;if(!nm[k])nm[k]=x.t});
 var pl=Object.keys(cnt).map(function(k){return[nm[k],cnt[k]]}).sort(function(a,b){return b[1]-a[1]||a[0].localeCompare(b[0])}),top=pl.slice(0,5),low=pl.length>5?pl.slice(-3).reverse():[];
 var rc=Object.keys(S.recLog||{}).map(function(i){return[REC[+i]&&REC[+i][0],S.recLog[i]]}).filter(function(x){return x[0]}).sort(function(a,b){return b[1]-a[1]}).slice(0,5);
 var ig=Object.keys(S.ingStat||{}).map(function(k){return[k,S.ingStat[k].n,S.ingStat[k].c]}).sort(function(a,b){return b[2]-a[2]||a[1].localeCompare(b[1])}).slice(0,10);
 var li=function(a){return a.map(function(x){return srow(esc(x[0]),'× '+x[1])}).join('')};
 h+=sec('🍲 Cuisine',(top.length?'<div class="mut">Plats les plus souvent au menu</div>'+li(top):'<p class="mut">Note tes plats dans Cuisine › Menus : les statistiques se construisent au fil des semaines.</p>')+(low.length?'<div class="mut" style="margin-top:8px">Plats les moins souvent faits</div>'+li(low):'')+(rc.length?'<div class="mut" style="margin-top:8px">Recettes les plus ajoutées aux courses</div>'+li(rc):'')
  +(ig.length?'<div class="mut" style="margin-top:12px">Ingrédients les plus utilisés</div>'+ig.map(function(x){return'<div class="it"><span>'+esc(x[1])+' <span class="mut">× '+x[2]+'</span></span><button class="btn" data-a="stadd" data-id="'+x[0]+'" aria-label="Ajouter aux courses">+ courses</button></div>'}).join(''):'')+(stMsg?'<p class="mut">'+stMsg+'</p>':'')+'<p class="mut" style="font-size:12px">Les statistiques de cuisine démarrent avec tes menus et tes ajouts à la liste de courses.</p>');
 var w30=dayList(30),wv=w30.map(function(d){return S.water[d]||0}),wd=wv.filter(function(v){return v>0}).length,ws=wv.reduce(function(a,b){return a+b},0),w8=wv.filter(function(v){return v>=8}).length,ME=['😔','😐','🙂','😊','🥰','😰'],mc={};
 w30.forEach(function(d){var m=S.mood[d];if(m!=null)mc[m]=(mc[m]||0)+1});
 h+=sec('💧 Bien-être (30 jours)',srow('Hydratation moyenne',wd?f1(ws/wd)+' verres par jour':'—')+srow('Jours à 8 verres',w8)+(Object.keys(mc).length?'<div class="row wrap" style="margin-top:8px">'+Object.keys(mc).map(function(k){return'<span class="btn">'+ME[k]+' × '+mc[k]+'</span>'}).join('')+'</div><p class="mut" style="font-size:12px">Répartition de tes humeurs.</p>':''));
 var milk=((S.lait&&S.lait.base)||0)+((S.lait&&S.lait.log)||[]).filter(function(z){return z.type==='add'}).reduce(function(a,z){return a+z.ml},0),tk=(S.tasks||[]);
 h+=sec('✨ Et aussi',srow('Photos dans Souvenirs','<span id="st-ph">…</span>')+(milk>0?srow('Lait maternel tiré depuis le début',milk+' ml'):'')+srow('Tâches terminées (matrice)',tk.filter(function(t){return t.d}).length+' / '+tk.length)+srow('Événements au calendrier',(S.ev||[]).filter(function(e){return!e.src}).length));
 return h}
V.stat=function(){return'<h2>Bilan</h2><p class="mut">Un regard sur tes habitudes, calculé sur cet appareil. Les données de santé et de cycle n’y sont pas incluses.</p>'+statView()};

/* ===== Recherche ===== */
pages.splice(pages.findIndex(function(q){return q[0]==='set'}),0,['search','🔍','Recherche']);
var SQ='',SRCH=[];
function nz(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'‘`]/g,'').replace(/[^a-z0-9]+/g,' ').trim()}
var SX=[['Météo','home',null,'Accueil','meteo temperature temps pluie soleil'],['Hydratation, humeur et gratitude','home',null,'Accueil','eau verres boire humeur gratitude'],['Prochaine prière (compteur)','home',null,'Accueil','compteur fajr prochaine priere'],
['Calendrier','org','agenda','Organisation › Calendrier','calendrier agenda rendez-vous evenement legende couleurs export apple ics jeune vendredi jumua'],
['Matrice Eisenhower (to-do)','org','matrice','Organisation › Matrice','taches todo to-do priorites urgent important deleguer eisenhower'],
['Astuces ménage et rangement','fam','astuces','Foyer › Astuces','astuces menage rangement nettoyage anti poussiere vinaigre bicarbonate adoucissant vitres calcaire micro-ondes routine securite produits'],
['Dates importantes et anniversaires','fam','dates','Foyer › Dates','anniversaire dates importantes mariage rappel fete naissance'],
['Pharmacie','fam','pharma','Foyer › Pharmacie','pharmacie medicament peremption doliprane paracetamol collyre sirop creme ouverture armoire'],
['Stock de lait maternel','fam','lait','Foyer › Stock de lait','lait maternel stock poches goutte congelateur frigo conservation durees cdc abm la leche league decongele biberon'],
['Menus de la semaine','cuis','menu','Cuisine › Menus','menus semaine repas planning ingredients diner'],
['Batch cooking et recettes','cuis','rec','Cuisine › Batch & recettes','batch cooking recettes vegetal vegetarien vegan dme finger food congeler diversification menee par enfant securite'],
['Liste de courses','cuis','courses','Cuisine › Courses','courses liste quantites fusion supermarche'],
['Recettes du placard','cuis','placard','Cuisine › Placard','placard frigo restes idees recette ingredients disponibles'],
['Croissance (courbes OMS)','enf','crois','Enfant › Croissance','croissance poids taille perimetre cranien courbe oms percentile mesures bebe'],
['Dents de lait','enf','dents','Enfant › Dents','dents dentition poussee dentaire incisive canine molaire'],
['Étapes de développement','enf','etapes','Enfant › Étapes','etapes developpement premiers pas premiers mots motricite sourire assis marche'],
['Écrans et enfants','enf','ecran','Enfant › Écran','ecran ecrans tele tablette dessins animes bluey mouk lucas araignee village de dany regle 4 pas'],
['Dhikr (compteur)','islam','dhikr','Islam › Dhikr','dhikr compteur tasbih subhanallah alhamdulillah allahu akbar istighfar'],
['Horaires de prière, Qibla et mosquées','islam','prieres','Islam › Prières & Qibla','horaires priere fajr dohr dhuhr asr maghrib isha qibla boussole mosquee mawaqit lever du soleil'],
['Dua (invocations)','islam','dua','Islam › Dua','dua invocation invocations du a reveil dormir manger voyage pardon parents'],
['Rappel du jour','islam','rappels','Islam › Rappels','rappel du jour hadith rappels verset'],
['Jeûne (Ramadan, jours blancs)','islam','jeune','Islam › Jeûne','jeune ramadan jours blancs ayyam al bid rattraper lundi jeudi sunna'],
['Défis Coran','islam','coran','Islam › Coran','coran defis khatm pages lecture mushaf al kahf'],
['Rak‘ahs et prière pas à pas','app','rakat','Apprendre › Rak‘ahs','rakat rakah rakaat nombre priere etapes takbir ruku sujud salam'],
['Prières surérogatoires (sunna)','app','sunna','Apprendre › Sunna','sunna surerogatoire rawatib witr duha tahajjud qiyam istikhara tahiyyat al masjid salut mosquee facultatives'],
['Ablutions et ghusl','app','ablu','Apprendre › Ablutions & ghusl','ablutions wudu ghusl purification grandes ablutions petites'],
['Prière du voyageur','app','voyage','Apprendre › Voyage','voyage voyageur qasr raccourcir jam regrouper distance avion train priere en voyage'],
['Shahada','app','shahada','Apprendre › Shahada','shahada chahada temoignage de foi conversion'],
['Sourate Al-Fatiha','app','fatiha','Apprendre › Al-Fatiha','fatiha al fatiha ouverture'],
['Sourates courtes','app','sour','Apprendre › Sourates','sourates courtes apprendre memoriser'],
['Tashahhud','app','tash','Apprendre › Tashahhud','tashahhud tachaoud attahiyyat salat ala nabi ibrahimiyya'],
['99 noms d’Allah','app','noms','Apprendre › 99 noms','99 noms asma ul husna noms de allah'],
['Suivi du cycle','well','cycle','Oummi › Cycle','cycle regles ovulation fertile symptomes temperature glaire symptothermie rapports humeur'],
['Tirage (lait)','well','tirage','Oummi › Tirage','tirage tire lait plan objectif stock seances absence reprise travail'],
['Suivi de grossesse','well','preg','Oummi › Grossesse','grossesse terme date des dernieres regles echographie semaines amenorrhee sa'],
['Instants (photos)','souv','inst','Souvenirs › Instants','souvenirs photos instants premiers pas legende'],['Gratitude du jour','souv','grat','Souvenirs › Gratitude','gratitude merci remercier petits mots journal'],['Dessins','souv','dess','Souvenirs › Dessins','dessins dessin coloriage enfant bricolage'],
['Assistante IA','ia',null,'IA','ia assistante chat'],
['Bilan et statistiques','stat',null,'Bilan','bilan statistiques moyenne prieres dhikr plats ingredients'],
['Profils de la famille','set',null,'Réglages › Profils','profils famille enfant naissance prenom'],
['Sauvegarde et restauration','set',null,'Réglages › Sauvegarde','sauvegarde export import restaurer photos donnees'],
['Hors connexion','set',null,'Réglages','hors connexion offline internet'],
['Thème clair ou sombre','set',null,'Réglages','theme sombre clair mode prenom']];
function sIndex(){var L=SX.map(function(e){return{t:e[0],p:e[1],s:e[2],d:e[3],k:nz(e[0]+' '+e[4]),b:2}});
 BR.forEach(function(r){L.push({t:r[0],p:'cuis',s:'rec',d:'Cuisine › Batch & recettes',k:nz(r[0]+' '+r[2].join(' ')),b:0})});
 DU.forEach(function(d){L.push({t:'Dua · '+d[0],p:'islam',s:'dua',d:'Islam › Dua',k:nz(d[0]+' '+d[2]+' '+d[3]),b:0})});
 NM.forEach(function(n,i){L.push({t:'99 noms · '+n[1],p:'app',s:'noms',d:'Apprendre › 99 noms',k:nz(n[1]+' '+n[2]),b:0})});
 SR.forEach(function(s){L.push({t:'Sourate '+s[1],p:'app',s:'sour',x:{sr:s[0]},d:'Apprendre › Sourates',k:nz('sourate '+s[1]+' '+s[2]),b:1})});
 TT.forEach(function(t){L.push({t:t[1],p:'enf',s:'dents',d:'Enfant › Dents',k:nz(t[1]+' dent'),b:0})});
 MS.forEach(function(g){g[2].forEach(function(t){L.push({t:t,p:'enf',s:'etapes',d:'Enfant › Étapes · '+g[1],k:nz(t+' '+g[1]),b:0})})});
 return L}
function srchHtml(){var q=nz(SQ),h='';
 if(!q){SRCH=[];return'<p class="mut">Tape un mot et touche un résultat pour aller directement au bon endroit.</p><div class="row wrap">'+['voyageur','dhikr','lait','ablutions','courses','dents','cycle','ikhlas','riz','anniversaire'].map(function(w){return'<button class="btn" data-a="sq" data-id="'+w+'">'+w+'</button>'}).join('')+'</div>'}
 var T=q.split(' '),R=[];sIndex().forEach(function(e){var ok=T.every(function(w){return e.k.indexOf(w)>-1});if(!ok)return;var tz=nz(e.t),sc=e.b;T.forEach(function(w){sc+=tz.indexOf(w)>-1?3:1});R.push({e:e,sc:sc})});
 R.sort(function(a,b){return b.sc-a.sc||a.e.t.localeCompare(b.e.t)});SRCH=R.slice(0,15).map(function(r){return r.e});
 if(!SRCH.length)return'<p class="mut">Aucun résultat pour « '+esc(SQ)+' ». Essaie un mot plus court ou un autre mot (par exemple « voyage » au lieu de « voyageuse »).</p>';
 return SRCH.map(function(e,i){return'<button class="card" data-a="gosearch" data-id="'+i+'" style="display:block;width:100%;text-align:left;margin:8px 0"><b>'+esc(e.t)+'</b><div class="mut" style="font-size:12px">'+esc(e.d)+' ›</div></button>'}).join('')+(R.length>15?'<p class="mut" style="font-size:12px">'+(R.length-15)+' autres résultats : précise ta recherche.</p>':'')}
V.search=function(){return'<h2>Recherche</h2><input id="q-in" placeholder="Un mot : voyageur, dhikr, lait, riz…" value="'+esc(SQ)+'" autocomplete="off" autocapitalize="none"><div id="q-res" style="margin-top:10px">'+srchHtml()+'</div>'};
document.addEventListener('input',function(e){if(e.target.id!=='q-in')return;SQ=e.target.value;var r=document.getElementById('q-res');if(r)r.innerHTML=srchHtml()});
act.sq=function(id){SQ=id};
act.gosearch=function(id){var r=SRCH[+id];if(!r)return;page=r.p;if(r.s)sub[r.p]=r.s;if(r.x)Object.keys(r.x).forEach(function(k){sub[k]=r.x[k]});menuOpen=false;toast='';scrollTo(0,0)};

/* ===== Souvenirs : Instants / Gratitude / Dessins ===== */
sub.souv='inst';
function gratView(){var G=S.grat||{},ds=Object.keys(G).filter(function(d){return G[d]&&String(G[d]).trim()}).sort().reverse(),old=ds.filter(function(d){return d!==today});
 return'<div class="card"><h3>Ma gratitude du jour 🤍</h3><textarea data-n="gr" rows="3" placeholder="Aujourd’hui, je remercie Allah pour…">'+esc(G[today]||'')+'</textarea><p class="mut" style="font-size:12px">'+ds.length+' jour'+(ds.length>1?'s':'')+' de gratitude gardé'+(ds.length>1?'s':'')+'.</p></div>'
 +(old.length?'<div class="card"><h3>Mes petits mots</h3>'+old.map(function(d){return'<details><summary><b>'+fdy(d)+'</b></summary><textarea data-n="grd" data-id="'+d+'" rows="2" style="margin-top:6px">'+esc(G[d])+'</textarea></details>'}).join('')+'</div>':'')}
document.addEventListener('change',function(e){var t=e.target;if(!t.dataset||t.dataset.n!=='grd')return;e.stopImmediatePropagation();S.grat=S.grat||{};S.grat[t.dataset.id]=t.value;save()},true);
var _sv0=V.souv;V.souv=function(){if(['inst','grat','dess'].indexOf(sub.souv)<0)sub.souv='inst';var T=tabs('souv',[['inst','Instants 📷'],['grat','Gratitude'],['dess','Dessins 🎨']]);
 if(sub.souv==='grat')return'<h2>Souvenirs</h2>'+T+gratView();
 var h=_sv0().replace('<h2>Souvenirs</h2>','<h2>Souvenirs</h2>'+T);
 return h.replace(/Dépose ici[^<]*/,sub.souv==='dess'?'Photographie les dessins de tes enfants et garde-les ici, avec une légende. Tout reste uniquement sur cet appareil.':'Dépose ici tes photos, les premiers pas, les petits moments à garder… Ajoute une légende : tout reste uniquement sur cet appareil, et les photos sont compressées pour économiser la place.')};
act.icsh=function(){S.icsShow=!S.icsShow};

/* ===== Cycle : période actuelle en haut, saisie simplifiée, plus de symptômes ===== */
var SYG=[['Courants',SYM.concat(['Nausées','Maux de dos'])],['Ovulation',['Douleur d’ovulation (bas-ventre, d’un seul côté)','Pertes plus abondantes ou glissantes','Spotting d’ovulation','Libido en hausse','Énergie en hausse','Odorat plus sensible','Col de l’utérus plus haut, souple et ouvert']],['SPM / TDPM',['Irritabilité ou colère','Anxiété, tension intérieure','Tristesse, humeur dépressive','Sautes d’humeur','Pleurs faciles','Sentiment d’être dépassée','Difficulté à se concentrer','Perte d’intérêt','Faim ou envies alimentaires','Insomnie ou besoin de dormir plus','Douleurs articulaires ou musculaires','Migraine']]];
function symCard(t){var sy=t.sy||{};return'<div class="card"><h3>Symptômes</h3><div class="mut" style="font-size:12px">Du plus faible au plus intense</div>'+SYG.map(function(g){var any=g[1].some(function(s){return sy[s]>0});return'<details '+(g[0]==='Courants'||any?'open':'')+'><summary><b>'+g[0]+'</b></summary>'+g[1].map(function(s){return'<div style="margin-top:8px"><div>'+s+'</div>'+rng('sy|'+s,sy[s],4)+'</div>'}).join('')+(g[0]==='SPM / TDPM'?'<p class="mut" style="font-size:12px">Les noter avant tes règles aide à repérer un schéma (SPM ou TDPM). Ce n’est pas un diagnostic : si cela pèse sur ton quotidien, parles-en à un professionnel de santé.</p>':'')+'</details>'}).join('')+'</div>'}
function tgLast(){var lg=(S.cyc&&S.cyc.log)||{},ds=Object.keys(lg).filter(function(d){return lg[d].rap==='Non protégé'}).sort();if(!ds.length)return null;var last=ds[ds.length-1];return anchors().some(function(a){return a>last})?null:last}
function tgInfo(){if(!S.tgRem)return null;var l=tgLast();if(!l)return null;var n=difD(today,l);return n>=0&&n<=35?{d:l,n:n}:null}
function syncTg(){S.ev=(S.ev||[]).filter(function(e){return e.src!=='tg'});var l=S.tgRem&&tgLast();if(l){[10,15].forEach(function(n){S.ev.push({id:'tg-'+l+'-'+n,t:'🔔 Rappel perso',date:addD(l,n),time:'',src:'tg'})})}}
function tgCard(g){var n=g.n,m;
 if(n<10)m='Rapport non protégé le '+fd(g.d)+'. Un test fait trop tôt peut être faussement négatif : rappel prévu à J+10.';
 else if(n<14)m='Rapport non protégé il y a '+n+' jours. Le test urinaire est fiable dès le 1ᵉʳ jour de retard de règles ou 21 jours après le rapport ; une prise de sang (bêta-hCG) est possible environ 14 jours après le rapport.';
 else if(n<21)m='Rapport non protégé il y a '+n+' jours. Une prise de sang (bêta-hCG) est possible ; le test urinaire est fiable dès le 1ᵉʳ jour de retard de règles ou 21 jours après le rapport.';
 else m='Rapport non protégé il y a '+n+' jours et pas de règles enregistrées depuis : un test urinaire est fiable maintenant. En cas de doute, parles-en à un médecin, une sage-femme ou un pharmacien.';
 return'<div class="card" style="border-color:var(--heart)"><b>🔔 Rappel test de grossesse</b><p class="mut" style="margin:6px 0 0">'+m+'</p></div>'}
function cycleTop(){var I=cyI(),tg=tgInfo(),h='';
 if(!I)h='<div class="card"><h3>Ta période actuelle</h3><p class="mut">Touche un jour dans le calendrier ci-dessous et note « Règles » dans Saignement : LAYNOOR calculera ta période actuelle, tes prochaines règles et ton ovulation probable.</p></div>';
 else{var ov=addD(I.last,I.o),dOv=difD(ov,today),ms=[];
  ms.push(I.dn<0?'Règles en retard de '+(-I.dn)+' jour'+(-I.dn>1?'s':''):I.dn===0?'Règles prévues aujourd’hui':I.dn<=2?'Règles imminentes (dans '+I.dn+' jour'+(I.dn>1?'s':'')+')':'Règles prévues dans '+I.dn+' jours (vers le '+fd(I.nxs)+')');
  if(dOv>0&&dOv<=14)ms.push('Ovulation probable dans '+dOv+' jour'+(dOv>1?'s':'')+' (vers le '+fd(ov)+')');else if(dOv===0)ms.push('Ovulation probable aujourd’hui');
  h='<div class="card" style="background:var(--rose)"><div class="mut">Ta période actuelle · jour '+I.day+' du cycle</div><h2 style="margin:4px 0 6px">'+I.ph+'</h2><p style="margin:0 0 6px"><b>'+I.ch+'</b></p>'+ms.map(function(m){return'<div>• '+m+'</div>'}).join('')+sBar(Math.min(100,I.day/I.L*100))+'<div class="mut" style="font-size:12px">Estimations à environ ± 2 jours près, d’après tes derniers cycles. Elles ne remplacent pas un avis médical.</div></div>'}
 return tg?h+tgCard(tg):h}
var _cv=cycleView;cycleView=function(){var h=_cv(),t=lgd(csel),cards=h.split(/(?=<div class="card")/),pick=function(m){return cards.filter(function(c){return c.indexOf(m)>-1})[0]||''},
 cal=pick('data-a="cmon"'),day=pick('Intensité de la douleur'),temp=pick('<h3>Température et glaire cervicale</h3>'),mood=pick('<h3>Humeur et notes</h3>'),stats=pick('<h3>Mon cycle en chiffres</h3>');
 if(!t.bt){day=day.replace(/<div class="mut" style="margin-top:10px">Intensité du flux<\/div>[\s\S]*?(?=<div class="mut" style="margin-top:10px">Intensité de la douleur<\/div>)/,'').replace(/<div class="mut" style="margin-top:10px">Présence de caillots<\/div><div class="row">[\s\S]*?<\/div>/,'')}
 var hid=cycHidden(csel),retire='';if(hid)day=day.replace(/ • Jour \d+ du cycle/,'').replace(/<p class="mut" style="margin:0 0 6px">[^<]*<\/p>/,'');else if(cf(csel).p&&t.bt!=='Règles')retire='<div class="card" style="background:var(--rose)"><div class="mut">Ce jour est marqué comme règles par l’app (prévision ou date de début enregistrée), mais tu n’as rien noté ici.</div><div class="row wrap" style="margin-top:8px"><button class="btn r" data-a="nopon">Retirer cette prévision</button><button class="btn r" data-a="cpause">Mettre toutes les prévisions en pause</button></div></div>';
 var ec=t.rap==='Non protégé'&&difD(today,csel)>=0&&difD(today,csel)<=5?'<p class="mut" style="font-size:12px">Contraception d’urgence possible jusqu’à 3 jours après le rapport (lévonorgestrel) ou 5 jours (ulipristal), en pharmacie.</p>':'',
 rap='<div class="card"><h3>Rapports</h3><div class="row wrap">'+chp('rap','Non protégé',t.rap==='Non protégé')+chp('rap','Protégé',t.rap==='Protégé')+'</div>'+ec+'<div class="row" style="margin-top:10px"><button class="btn '+(S.tgRem?'d':'')+'" data-a="tgtog">🔔 Rappel de test de grossesse : '+(S.tgRem?'activé':'désactivé')+'</button></div><p class="mut" style="font-size:12px">Après un rapport non protégé sans règles enregistrées ensuite, un rappel apparaît au calendrier à J+10 et J+15 (« Rappel perso »). Ce suivi ne remplace ni une contraception ni un avis médical.</p></div>',
 st=stats?'<div class="card"><details><summary><b>Mon cycle en chiffres</b></summary>'+stats.replace('<div class="card"><h3>Mon cycle en chiffres</h3>','').replace(/<\/div>\s*$/,'')+'</details></div>':'';
 return cal+cycleTop()+day+retire+mood+rap+symCard(t)+temp+st};
var _cl=act.cl;act.cl=function(id){_cl(id);if(id.indexOf('bt|')===0)btSync();if(id.indexOf('rap|')===0)syncTg()};
function btSync(){var t=lgd(csel),L=S.cyc.log||{},c=S.cyc;c.hist=c.hist||[];
 if(t.bt==='Règles'){var pv=addD(csel,-1),nx=addD(csel,1),k=c.hist.indexOf(nx);if(!(L[pv]&&L[pv].bt==='Règles')&&c.hist.indexOf(csel)<0)c.hist.push(csel);if(L[nx]&&L[nx].bt==='Règles'&&k>-1)c.hist.splice(k,1)}
 else{var k2=c.hist.indexOf(csel);if(k2>-1){c.hist.splice(k2,1);var nx2=addD(csel,1);if(L[nx2]&&L[nx2].bt==='Règles')c.hist.push(nx2)}}
 cyAuto();var s=c.hist.slice().sort().pop();if(s){var n=0;while(L[addD(s,n)]&&L[addD(s,n)].bt==='Règles')n++;if(n>=2&&n<=12)c.dur=n}syncTg();try{syncGh()}catch(e){}}
act.tgtog=function(){S.tgRem=!S.tgRem;syncTg()};
var _og2=V.org;V.org=function(){syncTg();return _og2()};
syncTg();

/* ===== Cycle : retirer des prévisions, pause, rappel ghusl ===== */
function cycReal(d){var c=S.cyc,L=(c.log||{})[d];if(L&&L.bt==='Règles')return true;if((c.nop||{})[d])return false;var D=c.dur||5;return anchors().some(function(a){return a<=d&&d<=addD(a,D-1)&&a<=today})}
function cycLogged(d){var L=(S.cyc.log||{})[d];return!!(L&&L.bt==='Règles')}
function cycHidden(d){var c=S.cyc,A=anchors();return !cycReal(d)&&!!(c.pause||(A.length&&d<A[0])||(c.nop||{})[d])}
act.nopon=function(){var c=S.cyc;c.nop=c.nop||{};var run=[csel],x=addD(csel,-1),k=0;while(cf(x).p&&!cycLogged(x)&&k++<20){run.unshift(x);x=addD(x,-1)}x=addD(csel,1);k=0;while(cf(x).p&&!cycLogged(x)&&k++<20){run.push(x);x=addD(x,1)}
 run.forEach(function(d){c.nop[d]=1});c.hist=(c.hist||[]).filter(function(a){return run.indexOf(a)<0});cyAuto();if(!c.hist.length)c.start='';syncGh();syncTg()};
act.cpause=function(){S.cyc.pause=!S.cyc.pause;syncGh()};
act.ghtog=function(){S.ghRem=S.ghRem===false?true:false;syncGh()};
function ghRuns(){var c=S.cyc,L=c.log||{},D=c.dur||5,out=[];anchors().filter(function(a){return!(c.nop||{})[a]&&a<=today}).forEach(function(a){var n=0;while(L[addD(a,n)]&&L[addD(a,n)].bt==='Règles')n++;var ongoing=n>0&&addD(a,n-1)>=today,len=(ongoing||n===0)?Math.max(n,D):n;out.push({d:addD(a,len),pred:ongoing||(n===0&&addD(a,D)>=today)})});return out}
function syncGh(){S.ev=(S.ev||[]).filter(function(e){return e.src!=='gh'});if(S.ghRem===false||!S.cyc)return;var c=S.cyc,rs=ghRuns();
 if(!c.pause){var I=cyI();if(I&&I.nxs)rs.push({d:addD(I.nxs,c.dur||5),pred:true})}
 var seen={};rs.forEach(function(r){if(seen[r.d]||r.d<addD(today,-60)||r.d>addD(today,120))return;seen[r.d]=1;S.ev.push({id:'gh-'+r.d,t:r.pred?'🚿 Grandes ablutions (prévu)':'🚿 Grandes ablutions (ghusl)',date:r.d,time:'',src:'gh'})})}
function cycleTop(){var I=S.cyc.pause?null:cyI(),tg=tgInfo(),h;
 if(S.cyc.pause)h='<div class="card"><h3>Prévisions en pause</h3><p class="mut">Seules les règles que tu notes apparaissent dans le calendrier (retour de couches, allaitement, cycles irréguliers…). Tu peux reprendre les prévisions quand tu veux.</p></div>';
 else if(!I)h='<div class="card"><h3>Ta période actuelle</h3><p class="mut">Touche un jour dans le calendrier ci-dessous et note « Règles » dans Saignement : LAYNOOR calculera ta période actuelle, tes prochaines règles et ton ovulation probable.</p></div>';
 else{var ov=addD(I.last,I.o),dOv=difD(ov,today),ms=[];
  ms.push(I.dn<0?'Règles en retard de '+(-I.dn)+' jour'+(-I.dn>1?'s':''):I.dn===0?'Règles prévues aujourd’hui':I.dn<=2?'Règles imminentes (dans '+I.dn+' jour'+(I.dn>1?'s':'')+')':'Règles prévues dans '+I.dn+' jours (vers le '+fd(I.nxs)+')');
  if(dOv>0&&dOv<=14)ms.push('Ovulation probable dans '+dOv+' jour'+(dOv>1?'s':'')+' (vers le '+fd(ov)+')');else if(dOv===0)ms.push('Ovulation probable aujourd’hui');
  h='<div class="card" style="background:var(--rose)"><div class="mut">Ta période actuelle · jour '+I.day+' du cycle</div><h2 style="margin:4px 0 6px">'+I.ph+'</h2><p style="margin:0 0 6px"><b>'+I.ch+'</b></p>'+ms.map(function(m){return'<div>• '+m+'</div>'}).join('')+sBar(Math.min(100,I.day/I.L*100))+'<div class="mut" style="font-size:12px">Estimations à environ ± 2 jours près, d’après tes derniers cycles. Elles ne remplacent pas un avis médical.</div></div>'}
 return h+'<div class="row wrap" style="margin:-4px 0 12px"><button class="btn r" data-a="cpause" style="font-size:12px;padding:6px 12px">'+(S.cyc.pause?'▶ Reprendre les prévisions':'⏸ Mettre les prévisions en pause')+'</button><button class="btn r" data-a="ghtog" style="font-size:12px;padding:6px 12px">🚿 Rappel ghusl : '+(S.ghRem===false?'désactivé':'activé')+'</button></div>'+(tg?tgCard(tg):'')}
var _og3=V.org;V.org=function(){try{syncGh()}catch(e){}return _og3()};
try{syncGh()}catch(e){}

/* ===== Accueil en forme de cœur, règles à l'accueil, écran, dua ===== */
(function(){var svg="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M50 9C47 3 42 0 33 0L14 0C5 0 0 4 0 12L0 80C0 90 22 97 50 100C78 97 100 90 100 80L100 12C100 4 95 0 86 0L67 0C58 0 53 3 50 9Z'/></svg>",u='url("data:image/svg+xml,'+encodeURIComponent(svg)+'")',s=document.createElement('style');
 s.textContent='.hero{border-radius:0!important;padding:36px 26px 76px!important;-webkit-mask:'+u+' center/100% 100% no-repeat;mask:'+u+' center/100% 100% no-repeat}';document.head.appendChild(s)})();
function cycOff(d){return!!S.cyc&&cycReal(d)}
function inPeriod(){return!!S.cyc&&cycReal(today)}
act.gotab=function(id){var q=id.split('|');page=q[0];sub[q[0]]=q[1];menuOpen=false;scrollTo(0,0)};
function periodHome(){var li=function(a){return'<ul style="margin:6px 0;padding-left:20px">'+a.map(function(x){return'<li style="margin:4px 0">'+x+'</li>'}).join('')+'</ul>'};
 return'<div class="card" style="background:var(--sage)"><b>🌙 Tu es en période de règles</b><p class="mut" style="margin:6px 0 0">La prière et le jeûne ne sont pas dus pendant les règles. Les jours de jeûne se rattrapent, pas les prières (Bukhari et Muslim, hadith de ‘Aïcha).</p></div>'+cycleTop()
 +'<div class="card"><details open><summary><b>🤍 Rester proche d’Allah pendant les règles</b></summary><div class="mut" style="margin-top:8px">Ce qui reste permis</div>'+li(['Le dhikr (Subhanallah, Alhamdulillah, Allahu akbar…) et l’istighfar','Les invocations (dua) et dire « Âmîn »','Écouter le Coran, des cours et des rappels','Lire un tafsir ou une traduction du Coran','La sadaqa, rendre service, bien parler','Assister au rassemblement de l’Aïd, en restant à l’écart du lieu de prière (Bukhari et Muslim)'])
 +'<div class="mut">Avis partagés : demande à une personne de science</div>'+li(['Réciter le Coran de mémoire : la majorité le déconseille à voix haute ; les malikites, un avis de l’imam Ahmad, Ibn Taymiyya, Ibn Baz et Ibn ‘Uthaymin le permettent, surtout pour ne pas oublier. Lire des yeux ou méditer ne pose pas de problème.','Toucher le mushaf : à éviter ; une traduction ou un écran sont permis selon les avis.','Entrer dans la mosquée : avis partagés.'])
 +'<div class="mut">Pas pendant les règles</div>'+li(['La prière, le jeûne, le tawaf et les rapports conjugaux (Coran 2:222)'])
 +'<div class="mut">À la fin des règles</div>'+li(['Faire le ghusl, puis reprendre la prière','Rattraper les jours de jeûne manqués, pas les prières'])
 +'<div class="row wrap" style="margin-top:8px"><button class="btn" data-a="gotab" data-id="islam|dhikr">📿 Dhikr</button><button class="btn" data-a="gotab" data-id="org|dua">🤲 Mes dua</button><button class="btn" data-a="gotab" data-id="islam|rappels">🌙 Rappel du jour</button></div>'
 +'<p class="mut" style="font-size:12px">Sources : IslamQA (réponses 70438, 5048, 152742, 4862) et IslamWeb.</p></details></div>'}

/* --- Écran : dessins animés calmes --- */
var _ecv=ecranView;ecranView=function(){var h=_ecv(),i=h.indexOf('<div class="card"><h3>Dessins animés au rythme calme</h3>'),L=[['Petit Ours Brun','12 images/s, très lent'],['Simon','12 images/s, graphisme simple'],['T’choupi','12 à 24 images/s, stable'],['Mouk','24 images/s, rythme lent'],['Les Octonautes','24 images/s mais très calme'],['Bluey (mention spéciale)','25 images/s, rythme calme, couleurs douces, beaucoup de relationnel, des émotions vraies, du jeu libre'],['Le Village de Dany',''],['Lucas l’araignée','']];
 return(i>-1?h.slice(0,i):h)+'<div class="card"><h3>Dessins animés au rythme calme</h3><p class="mut">Des exemples souvent cités pour leur douceur. Regarde toujours un épisode avant pour vérifier qu’il te convient.</p>'+L.map(function(x){return'<div class="it"><span>🌿 <b>'+x[0]+'</b>'+(x[1]?'<div class="mut" style="font-size:13px">'+x[1]+'</div>':'')+'</span></div>'}).join('')
 +'<p class="mut" style="font-size:12px">Les chiffres d’images par seconde (FPS) viennent d’une publication de Snoez’Up Academy (déc. 2025) et ne sont pas vérifiés par une source officielle. L’idée : des dessins animés lents, avec des pauses visuelles, qui respectent la vitesse de traitement du cerveau et favorisent le calme. Même calmes, les écrans restent déconseillés avant 3 ans.</p></div>'};

/* --- Organisation : dua à faire avec force --- */
var DM=[['nuit','Dernier tiers de la nuit','Allah descend au ciel le plus bas et appelle : « Qui M’invoque, que Je l’exauce ? ». Réveille-toi, fais tes ablutions, prie quelques rak‘ahs puis demande.','Bukhari et Muslim'],
['sujud','Dans la prosternation (sujud)','Le serviteur est le plus proche de son Seigneur quand il est prosterné : multiplie les invocations.','Muslim'],
['adhan','Entre l’adhan et l’iqama','L’invocation faite entre l’appel à la prière et le second appel n’est pas rejetée.','Abu Dawud, Tirmidhi, An-Nasa’i'],
['apres','Après les prières obligatoires','Avant et après le salut final des cinq prières, l’invocation est recommandée.','Tirmidhi'],
['vendredi','Vendredi : une heure précise','Il y a un moment le vendredi où l’invocation est exaucée. Selon l’avis le plus probable, c’est la fin de l’après-midi, avant le coucher du soleil.','Bukhari et Muslim'],
['pluie','Quand il pleut','Invoquer sous la pluie est recommandé. Dis : « Allâhumma sayyiban nâfi‘â » (Ô Allah, une pluie bénéfique). L’authenticité de certains récits sur ce moment est discutée, mais beaucoup de savants le retiennent.','Bukhari (invocation), IslamQA'],
['arafat','Jour d’Arafat','Le meilleur dou‘a est celui du jour d’Arafat, pour les pèlerins comme pour ceux qui sont chez eux.','Tirmidhi'],
['mecque','À La Mecque (omra, hajj)','Invocation pendant le tawaf, sur Safa et Marwa, entre les deux, et en buvant l’eau de Zamzam avec une intention sincère.','IslamQA'],
['voyage','En voyage','L’invocation du voyageur fait partie de celles qui sont exaucées.','Abu Dawud, Tirmidhi'],
['injustice','Quand on subit une injustice','L’invocation de la personne qui subit une injustice est exaucée.','Bukhari et Muslim'],
['parent','Parent pour son enfant','L’invocation d’un parent pour son enfant est exaucée.','Abu Dawud, Tirmidhi'],
['absent','Pour un proche, en son absence','Quand tu invoques pour quelqu’un qui est absent, un ange dit « et pour toi la pareille ».','Muslim'],
['qadr','Nuit du destin (Laylat al-Qadr)','Dans les dix dernières nuits de Ramadan, le Prophète ﷺ a enseigné à ‘Aïcha : « Allâhumma innaka ‘afuwwun tuhibbu l-‘afwa fa‘fu ‘annî ».','Tirmidhi, Ibn Majah'],
['autre','Autre moment','Une dua peut se faire à tout moment : choisis ton propre moment.','']];
var DPM='nuit';
function dpSync(){S.ev=(S.ev||[]).filter(function(e){return e.src!=='dp'});(S.dp||[]).forEach(function(x){if(x.d&&!x.done)S.ev.push({id:'dp-'+x.id,t:'🤲 Dua : '+(x.t.length>40?x.t.slice(0,40)+'…':x.t),date:x.d,time:'',src:'dp'})})}
function duaPlanView(){var L=S.dp||[];
 var h='<div class="card"><h3>Mes dua à faire avec force</h3><p class="mut">Note ici les dua que tu veux faire avec toute ta force, et choisis le moment propice : la nuit, sous la pluie, en voyage, à La Mecque… Quand le moment arrive, tu les retrouves ici. Coche « faite » puis « exaucée » pour garder une trace.</p>'
 +'<div class="mut">Comment t’organiser</div>'+ol(['Écris ta dua et choisis le moment.','Prépare-toi : ablutions, face à la qibla si possible, louange à Allah et prière sur le Prophète ﷺ avant de demander.','Demande avec certitude et en insistant, sans te presser : « L’invocation de l’un de vous est exaucée tant qu’il ne se presse pas » (Bukhari et Muslim).','Remercie Allah, puis note le résultat.'])+'</div>'
 +'<div class="card" id="dp-form"><h3>Ajouter une dua</h3><textarea id="dp-t" rows="2" placeholder="Ma dua, mon intention…"></textarea><div class="row wrap" style="margin-top:8px"><select id="dp-m" style="flex:1;min-width:180px">'+DM.map(function(m){return'<option value="'+m[0]+'" '+(DPM===m[0]?'selected':'')+'>'+m[1]+'</option>'}).join('')+'</select><input id="dp-d" type="date" style="flex:1;min-width:140px"></div><p class="mut" style="font-size:12px;margin:6px 0">La date est facultative : si tu en mets une (une omra, un voyage…), un rappel apparaît au calendrier.</p><button class="btn d" data-a="dpadd">Ajouter</button></div>';
 var any=false;DM.forEach(function(m){var it=L.filter(function(x){return x.m===m[0]});if(!it.length)return;any=true;
  h+='<div class="card"><h3>'+m[1]+'</h3>'+it.map(function(x){return'<div class="it" style="align-items:flex-start">'+heartBtn(x.done,'dpdone',x.id)+'<span>'+esc(x.t)+'<div class="mut" style="font-size:12px">'+(x.d?'le '+fd(x.d)+' · ':'')+(x.done?'faite':'à faire')+(x.ans?' · exaucée 🤍':'')+'</div></span><button class="x" data-a="dpans" data-id="'+x.id+'" aria-label="Exaucée">'+(x.ans?'🤍':'♡')+'</button><button class="x" data-a="dpdel" data-id="'+x.id+'" aria-label="Supprimer">×</button></div>'}).join('')+'</div>'});
 if(!any)h+='<div class="card"><p class="mut">Aucune dua pour l’instant. Ajoute la première ♡</p></div>';
 h+='<div class="card"><h3>Les moments propices</h3><p class="mut">Les moments où l’invocation est particulièrement recommandée. Touche « + » pour y ajouter une dua.</p>'+DM.filter(function(m){return m[0]!=='autre'}).map(function(m){return'<details><summary><b>'+m[1]+'</b></summary><p class="mut" style="font-size:14px">'+m[2]+'</p><div class="mut" style="font-size:12px">Source : '+m[3]+'</div><p><button class="btn" data-a="dpm" data-id="'+m[0]+'">+ Ajouter une dua ici</button></p></details>'}).join('')+'</div>'
 +'<div class="card"><h3>Formules à connaître</h3><details><summary><b>Talbiya (en allant à La Mecque)</b></summary>'+bl('','لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ','Labbayka Llâhumma labbayk, labbayka lâ sharîka laka labbayk, inna l-hamda wa n-ni‘mata laka wa l-mulk, lâ sharîka lak','Me voici, ô Allah, me voici ! Me voici, Tu n’as pas d’associé, me voici ! À Toi la louange, le bienfait et la royauté ; Tu n’as pas d’associé. (Bukhari, Muslim)')+'</details>'
 +'<details><summary><b>Jour d’Arafat</b></summary>'+bl('','لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ','Lâ ilâha illa Llâhu wahdahu lâ sharîka lah, lahu l-mulku wa lahu l-hamdu wa huwa ‘alâ kulli shay’in qadîr','Il n’y a de divinité qu’Allah, Seul, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose. (Tirmidhi)')+'</details>'
 +'<details><summary><b>Sous la pluie</b></summary>'+bl('','اللَّهُمَّ صَيِّبًا نَافِعًا','Allâhumma sayyiban nâfi‘â','Ô Allah, fais-en une pluie bénéfique. (Bukhari)')+'</details>'
 +'<details><summary><b>Nuit du destin</b></summary>'+bl('','اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي','Allâhumma innaka ‘afuwwun tuhibbu l-‘afwa fa‘fu ‘annî','Ô Allah, Tu es Celui qui efface les fautes et Tu aimes pardonner : pardonne-moi. (Tirmidhi, Ibn Majah)')+'</details></div>';
 return h}
act.dpadd=function(){var t=document.getElementById('dp-t'),m=document.getElementById('dp-m'),d=document.getElementById('dp-d'),v=t&&t.value.trim();if(!v){alert('Écris ta dua.');return}S.dp=S.dp||[];S.dp.push({id:Date.now(),t:v,m:m?m.value:'autre',d:d?d.value:'',done:false,ans:false});DPM=m?m.value:DPM;dpSync()};
act.dpdone=function(id){var x=(S.dp||[]).find(function(z){return z.id==id});if(x)x.done=!x.done;dpSync()};
act.dpans=function(id){var x=(S.dp||[]).find(function(z){return z.id==id});if(x){x.ans=!x.ans;if(x.ans)x.done=true}dpSync()};
act.dpdel=function(id){S.dp=(S.dp||[]).filter(function(z){return z.id!=id});dpSync()};
act.dpm=function(id){DPM=id;setTimeout(function(){var f=document.getElementById('dp-form');if(f)f.scrollIntoView({behavior:'smooth'})},80)};
SX.push(['Mes dua à faire avec force','org','dua','Organisation › Dua','dua invocation moment exauce pluie mecque omra hajj voyage arafat nuit sujud qadr force intentions']);
var _og4=V.org;V.org=function(){try{dpSync()}catch(e){}var T=tabs('org',[['agenda','Calendrier'],['matrice','Matrice Eisenhower'],['dua','Dua']]);if(sub.org==='dua')return'<h2>Organisation</h2>'+T+duaPlanView();return _og4().replace(/<div class="tabs">[\s\S]*?<\/div>/,T)};
try{dpSync()}catch(e){}

draw();
})();
