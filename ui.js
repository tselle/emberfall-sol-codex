E.el = id => document.getElementById(id);
E.escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
E.button = (label,action,disabled=false) => '<button data-action="'+action+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
E.dialog = (title,body) => {
 E.el('dialogTitle').textContent=title;
 E.el('dialogBody').innerHTML=body;
 E.el('overlay').hidden=false;
};
E.close = () => { E.el('overlay').hidden=true; };
E.sheet = i => {
 const p=E.s.party[i];
 if(!p)return;
 const items=E.s.items.map((id,n)=>{
  const item=E.items[id];
  const button=(label,disabled)=>E.button(label,'item:'+i+':'+n,!!E.battle||disabled);
  let action='';
  if(item.type==='scroll'&&p.class==='Mage')action=button('Learn',!!E.battle||p.book.includes(item.spell));
  if(['armour','weapon','magic'].includes(item.type))action=button('Equip');
  if(item.type==='potion')action=button('Drink',p.hp<=0||p.hp===p.max);
  if(item.type==='wand')action=button('Ready');
  if(item.type==='map')action=button('Read',!!E.battle||E.s.mode==='wild');
  return '<div class="entry">'+item.name+' '+action+E.button('Drop','drop:'+i+':'+n,!!E.battle||E.s.mode==='wild')+'</div>';
 }).join('');
 const spells=Object.values(E.spells).filter(sp=>E.slots(p,sp.tier)&&((p.class==='Mage'&&p.book.includes(sp.id))||(p.class!=='Mage'&&sp.school)));
 E.dialog(p.name,'<p>'+p.race+' '+p.class+' · Level '+p.level+' · '+p.alignment+'</p>'+
 '<p>'+E.abilities.map((a,n)=>a+' '+p.stats[n]).join(' · ')+'</p>'+
 '<p>HP '+p.hp+'/'+p.max+' · AC '+p.ac+' · THAC0 '+E.thac0(p)+' · XP '+p.xp.toLocaleString()+' · Hit die d'+E.classes[p.class][0]+' · Move '+(p.race==='Human'?6:5)+'</p>'+
 '<p>Weapon '+E.items[p.weapon].name+(p.specialization?' · Specialized in '+E.items[p.specialization].name:'')+'</p>'+
 '<p>Saves · '+['Poison','Wand','Paralysis','Breath','Spell'].map((a,n)=>a+' '+E.saves(p)[n]).join(' · ')+'</p>'+
 (p.class==='Thief'?'<p>'+Object.entries(E.thief(p)).map(([k,v])=>k+' '+v+'%').join(' · ')+'</p>':'')+
 (spells.length?'<h3>Memorization</h3>'+spells.map(sp=>E.button(sp.name+' ('+(p.prepared[sp.id]||0)+')','prep:'+i+':'+sp.id)+E.button('−','unprep:'+i+':'+sp.id,!p.prepared[sp.id])).join(''):'')+
 '<h3>Shared pack</h3><div class="entries">'+(items||'<p>The pack is empty.</p>')+'</div>');
};
E.company = () => {
 const race=Object.keys(E.races);
 E.dialog('The Company','<p>Recruit up to six adventurers. You may replace the company with the ready-made roster at any time.</p>'+
 E.s.party.map((p,i)=>'<div class="entry">'+E.escape(p.name)+' · '+p.class+' '+E.button('Sheet','hero:'+i)+E.button('Dismiss','dismiss:'+i,E.s.party.length<2)+'</div>').join('')+
 '<p><label>Name <input id="recruitName" maxlength="30"></label> <label>Ancestry <select id="race">'+race.map(r=>'<option>'+r+'</option>').join('')+'</select></label> <label>Class <select id="class">'+E.races.Human.map(c=>'<option>'+c+'</option>').join('')+'</select></label></p>'+
 '<label>Alignment <select id="alignment">'+E.alignments.map(a=>'<option>'+a+'</option>').join('')+'</select></label><div id="rolls"></div>'+
 E.button('Roll abilities','roll')+E.button('Recruit','recruit',E.s.party.length>=6)+E.button('Ready-made company','ready'));
 E.el('race').onchange=()=>{ E.el('class').innerHTML=E.races[E.el('race').value].map(c=>'<option>'+c+'</option>').join(''); };
 E.rollAbilities();
};
E.rollAbilities=()=>{
 E.rolled=E.abilities.map(()=>Array.from({length:4},()=>E.roll(6)).sort((a,b)=>b-a).slice(0,3).reduce((a,b)=>a+b));
 E.el('rolls').textContent=E.abilities.map((a,i)=>a+' '+E.rolled[i]).join(' · ');
};
E.render = () => {
 const s=E.s,mod=E.module(),map=E.mapData(),zone=s.mode==='wild'?'The '+mod.town+' marches':map.name;
 E.el('chapter').textContent=mod.id+' / '+mod.name;
 E.el('place').textContent=E.battle?'Tactical encounter':zone;
 E.el('status').textContent='Day '+(1+Math.floor(s.minutes/1440))+'  ·  '+String(Math.floor(s.minutes/60)%24).padStart(2,'0')+':'+String(s.minutes%60).padStart(2,'0')+'  ·  '+(s.mode==='wild'?'Wilderness':s.depth?'Dungeon level '+s.depth:'Town');
 E.el('bearing').hidden=!!E.battle||s.mode==='wild';
 E.el('bearing').textContent=['▲  N','▶  E','▼  S','◀  W'][s.dir];
 E.el('sceneLabel').textContent=E.battle?E.combatLabel():s.mode==='wild'?'The Emberwild':s.depth?'Below ground':'Lantern Ward';
 E.el('maphint').textContent=E.battle?'Select a highlighted unit or tile':s.mode==='wild'?'Roads are safest in daylight':'▲  Party position   ·   M  Full map';
 E.el('party').innerHTML=s.party.map((p,i)=>'<button class="member'+(E.battle?.active?.hero===i?' active':'')+'" data-action="hero:'+i+'"><canvas width="46" height="48"></canvas><span><strong>'+E.escape(p.name)+'</strong><small class="classline">'+p.race+' '+p.class+' · LV '+p.level+'</small><span class="bar"><i style="width:'+Math.max(0,100*p.hp/p.max)+'%"></i></span></span><span class="hp">'+Math.max(0,p.hp)+'/'+p.max+'</span></button>').join('');
 E.el('party').querySelectorAll('canvas').forEach(E.portrait);
 E.el('supplies').innerHTML='<span>◈ '+s.gold+' GP</span><span>◫ '+s.rations+' RATIONS</span>';
 E.el('messages').innerHTML=s.log.slice(-14).reverse().map(line=>'<p>'+E.escape(line)+'</p>').join('');
 E.el('commands').innerHTML=(E.battle?E.combatCommands():s.mode==='wild'?
  [['◎','Visit','interact'],['✦','Camp','camp'],['⌑','Map','map'],['✧','Rumours','rumours']]:
  [['◎','Interact','interact'],['⌕','Search','search'],['♧','Camp','camp'],['◌','Listen','listen'],['♢',s.sneak?'Stand':'Creep','sneak'],['⌑','Map','map'],['▤','Journal','journal'],['✦','Loot','loot'],['✥','Move','pad']])
  .map(([glyph,label,action])=>E.button('<b>'+glyph+'</b>'+label,action)).join('')+((s.pad||s.mode==='wild')&&!E.battle?E.padMarkup():'');
 E.el('commands').classList.toggle('with-pad',(s.pad||s.mode==='wild')&&!E.battle);
 E.draw();
 E.drawMap(E.el('minimap'));
};
