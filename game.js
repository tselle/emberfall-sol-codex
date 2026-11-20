const directions=[[0,-1],[1,0],[0,1],[-1,0]];
const storageKey='emberfall-v1-';
E.fresh=()=>({module:'E0',mode:'local',depth:0,x:8,y:8,dir:0,minutes:500,fatigue:0,gold:125,rations:5,party:E.ready(),items:['tonic','scroll-cloud','bow'],world:{},quests:{},holy:{},seen:{},notes:[],log:['Day 1 · The company arrives in Thornwick.','The watchfire has gone cold.','Seek Warden Elspeth at the southwest watch office.'],sneak:false,pad:matchMedia('(pointer: coarse)').matches});
E.module=()=>E.modules.find(m=>m.id===E.s.module);
E.mapData=()=>E.module().maps[E.s.depth];
E.mapState=()=>{
 const map=E.mapData(),key=E.s.module+':'+E.s.depth;
 return E.s.world[key]||(E.s.world[key]={...JSON.parse(JSON.stringify({traps:map.traps,groups:map.groups,loot:map.loot})),open:{},spotted:{},explored:{}});
};
E.log=text=>{E.s.log.push(text);if(E.s.log.length>80)E.s.log.shift();};
E.save=slot=>{
 if(E.battle||!E.s.party.some(p=>p.hp>0))return false;
 try{localStorage.setItem(storageKey+slot,JSON.stringify(E.s));return true;}catch{return false;}
};
E.load=slot=>{
 try{
  const data=JSON.parse(localStorage.getItem(storageKey+slot));
  if(!data?.party?.length||!E.modules.some(m=>m.id===data.module))return false;
  E.battle=null;E.s=data;E.camera=null;E.close();E.reveal();return true;
 }catch{return false;}
};
E.savesMenu=()=>{
 const rows=['auto','1','2','3','4'].map(slot=>{
  let summary='Empty';
  try{const v=JSON.parse(localStorage.getItem(storageKey+slot));if(v)summary=v.module+' · Day '+(1+Math.floor(v.minutes/1440));}catch{}
  return '<div class="entry">'+(slot==='auto'?'Autosave':'Slot '+slot)+' · '+summary+
  (slot==='auto'?'':E.button('Save','save:'+slot,!!E.battle))+E.button('Load','load:'+slot,summary==='Empty')+'</div>';
 });
 E.dialog('Save and load',rows.join(''));
};
E.enter=(depth,fromBelow=false)=>{
 const s=E.s;s.mode='local';s.depth=depth;
 [s.x,s.y,s.dir]=E.mapData().start;
 if(fromBelow){s.x=15;s.y=9;s.dir=3;}
 E.camera=null;E.reveal();E.log('Entered '+E.mapData().name+'.');
};
E.leave=kind=>{
 const site=E.module().wild.sites.find(a=>a.kind===kind),s=E.s;
 s.mode='wild';s.x=site.x;s.y=site.y;E.camera=null;
 E.log('The company reaches the '+E.module().town+' marches.');
};
E.reveal=()=>{
 if(E.s.mode==='wild')return;
 const s=E.s,state=E.mapState();
 for(let y=s.y-2;y<=s.y+2;y++)for(let x=s.x-2;x<=s.x+2;x++)state.explored[x+','+y]=true;
};
E.blocked=(x,y)=>{const tile=E.at(E.mapData(),x,y);return tile==='#'||('DLSABCHW'.includes(tile)&&!E.mapState().open[x+','+y]);};
E.front=()=>[E.s.x+directions[E.s.dir][0],E.s.y+directions[E.s.dir][1]];
E.draw=()=>{
 if(!E.s)return;
 const c=E.el('scene'),s=E.s;
 if(E.battle)return E.drawBattle(c);
 if(s.mode==='wild')return E.wildDraw(c);
 const camera=E.camera||{x:s.x,y:s.y,a:s.dir*Math.PI/2};
 E.view.draw(c,E.mapData(),camera.x,camera.y,camera.a,E.mapState());
};
E.animate=old=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const s=E.s,target=s.dir*Math.PI/2,da=Math.atan2(Math.sin(target-old.a),Math.cos(target-old.a));
 const t=performance.now(),animation={...old};E.camera=animation;
 const frame=now=>{
  if(E.camera!==animation||E.battle||s.mode!=='local')return;
  const f=Math.min(1,(now-t)/135),ease=f*f*(3-2*f);
  animation.x=old.x+(s.x-old.x)*ease;animation.y=old.y+(s.y-old.y)*ease;animation.a=old.a+da*ease;
  if(f<1)requestAnimationFrame(frame);else E.camera=null;
  E.draw();
 };
 requestAnimationFrame(frame);
};
E.notice=()=>{
 const s=E.s,state=E.mapState();
 for(const [key,group] of Object.entries(state.groups)){
  const [x,y]=key.split(',').map(Number),dx=x-s.x,dy=y-s.y,n=Math.max(Math.abs(dx),Math.abs(dy));
  if(n>(s.sneak?0:4)||(group.ambush&&n>1))continue;
  let clear=true;
  for(let i=1;i<n;i++)if(E.blocked(Math.round(s.x+dx*i/n),Math.round(s.y+dy*i/n)))clear=false;
  if(clear&&!state.spotted[key]){
   state.spotted[key]=true;
   group.ids.forEach(id=>s.seen[id]=Math.max(1,s.seen[id]||0));
   E.log('A group is ahead. '+E.monsters[group.ids[0]].name+' stands guard.');
  }
 }
};
E.triggerTrap=key=>{
 const state=E.mapState(),trap=state.traps[key];if(!trap)return;
 const alive=E.s.party.filter(p=>p.hp>0),single=['pit','darts','blade','spear'].includes(trap.name);
 if(alive.length===0)return;
 for(const p of single?[alive[E.roll(alive.length)-1]]:alive){
  const damage=E.roll(4)+Math.ceil(E.mapData().level/2)*2;
  const hit=E.roll(20)>=E.saves(p)[trap.name==='gas'?0:3]?Math.floor(damage/2):damage;
  p.hp=Math.max(0,p.hp-hit);E.log('Trap · '+trap.name+' deals '+hit+' damage to '+p.name+'.');
 }
 delete state.traps[key];
 if(!alive.some(p=>p.hp>0))E.dialog('The company has fallen',E.button('Load a save','saves')+E.button('Begin again','restart'));
};
E.move=action=>{
 if(E.battle||!E.s.party.some(p=>p.hp>0))return;
 const s=E.s;
 if(s.mode==='wild'){
  const vector={forward:[0,-1],back:[0,1],left:[-1,0],right:[1,0],strafeLeft:[-1,0],strafeRight:[1,0]}[action];
  if(vector)E.travel(...vector);
  return;
 }
 const old=E.camera?{...E.camera}:{x:s.x,y:s.y,a:s.dir*Math.PI/2};
 if(action==='left'||action==='right'){
  s.dir=(s.dir+(action==='left'?3:1))%4;E.animate(old);E.notice();return;
 }
 const offset={forward:0,back:2,strafeLeft:3,strafeRight:1}[action];
 if(offset===undefined)return;
 const [dx,dy]=directions[(s.dir+offset)%4],x=s.x+dx,y=s.y+dy,key=x+','+y,state=E.mapState(),group=state.groups[key];
 if(E.blocked(x,y)){E.log('The way is blocked.');return;}
 if(group){
  E.startBattle(group.ids,{key,x,y,surprise:s.sneak&&!state.spotted[key]});
  s.sneak=false;return;
 }
 const guarding=Object.keys(state.spotted).find(key=>{
  if(!state.groups[key])return false;
  const [gx,gy]=key.split(',').map(Number),oldDistance=Math.abs(gx-s.x)+Math.abs(gy-s.y),newDistance=Math.abs(gx-x)+Math.abs(gy-y);
  return oldDistance===1&&newDistance===2&&(gx-s.x)*dx+(gy-s.y)*dy===0&&!E.blocked(gx,gy);
 });
 if(guarding){
  const [x,y]=guarding.split(',').map(Number);
  E.log('The guards cut off the sidestep.');
  E.startBattle(state.groups[guarding].ids,{key:guarding,x,y});
  return;
 }
 s.x=x;s.y=y;s.minutes+=s.sneak?4:2;
 E.triggerTrap(key);E.reveal();E.notice();E.animate(old);
 const event=E.mapData().events[key];
 if(event)E.log(({down:'Stairs descend here.',up:'Stairs ascend here.',finish:'The final chamber.',leave:'The town gate leads to the wilderness.'})[event]||'There is a service here.');
};
E.search=()=>{
 if(E.s.mode==='wild'||E.battle)return;
 const s=E.s,state=E.mapState(),thief=s.party.find(p=>p.class==='Thief'&&p.hp>0);
 const bonus=s.party.some(p=>p.race==='Dwarf'&&p.hp>0)?19:0;
 let found=false;s.minutes+=5;
 for(const [dx,dy] of [...directions,[0,0]]){
  const x=s.x+dx,y=s.y+dy,key=x+','+y,trap=state.traps[key];
  if(E.at(E.mapData(),x,y)==='S'&&!state.open[key]&&E.roll(100)<45+bonus+(thief?18:0)){
   state.open[key]=true;state.explored[key]=true;found=true;E.log('A hidden panel swings open.');
  }
  if(trap&&!trap.found&&E.roll(100)<40+bonus+(thief?30:0)){
   trap.found=true;found=true;E.log('You discover a '+trap.name+' trap.');
  }
 }
 if(!found)E.log('The search reveals nothing new.');
};
E.interact=()=>{
 if(E.battle)return;
 if(E.s.mode==='wild')return E.visit();
 const s=E.s,state=E.mapState(),map=E.mapData(),[x,y]=E.front(),key=x+','+y,here=s.x+','+s.y;
 const event=map.events[here]||map.events[key];
 if(state.groups[key]&&!E.blocked(x,y))return E.startBattle(state.groups[key].ids,{key,x,y,surprise:s.sneak&&!state.spotted[key]});
 if(state.traps[key]?.found){E.dialog('Disarm trap','<p>A '+state.traps[key].name+' trap is armed.</p>'+E.button('Disarm','disarm'));return;}
 if(event==='leave')return E.leave('town');
 if(event==='up')return s.depth===1?E.leave('dungeon'):E.enter(s.depth-1,true);
 if(event==='down')return E.enter(s.depth+1);
 if(event==='finish'){E.log('The chamber has fallen quiet. Return to the commission giver.');return;}
 if(event==='clue'){
  const key=map.events[here]==='clue'?here:E.front().join(',');
  const id=s.module+':'+s.depth+':'+key;
  const clue=E.module().clues[s.depth-1];
  if(!s.holy[id]){s.holy[id]=true;E.note(clue);}
  E.log(clue);return;
 }
 if(event)return E.service(event);
 const tile=E.at(map,x,y);
 if(tile==='D'||tile==='L'){
  if(tile==='L'&&!state.open[key]&&!s.party.some(p=>p.hp>0&&p.class==='Thief'&&E.roll(100)<E.thief(p)['Open locks'])){E.dialog('Locked door','<p>The lock holds.</p>'+E.button('Force the door','force'));return;}
  state.open[key]=!state.open[key];E.log(state.open[key]?'The door opens.':'The door closes.');return;
 }
 E.log('There is nothing to interact with here.');
};
E.winEncounter=origin=>{
 if(!origin)return;
 if(origin.lair){E.s.holy[origin.lair]=true;const loot=E.hoard('H',E.module().level);E.s.gold+=loot.gold;E.s.items.push(...loot.items);return;}
 const state=E.mapState(),group=state.groups[origin.key];
 if(group?.boss){E.quest().done=true;E.note('The final enemy is defeated.');E.log('The commission is ready to turn in.');}
 delete state.groups[origin.key];
 E.s.x=origin.x;E.s.y=origin.y;E.triggerTrap(origin.key);E.reveal();
 if(state.loot[origin.key])E.log('Loot remains on the ground.');
 E.save('auto');
};
E.retreat=()=>{if(E.s.mode==='local'&&E.s.depth)E.leave('dungeon');};
E.loot=()=>{
 if(E.s.mode==='wild'||E.battle)return;
 const s=E.s,state=E.mapState(),key=s.x+','+s.y,loot=state.loot[key];
 if(!loot||state.groups[key]){E.log('No accessible loot on this square.');return;}
 s.gold+=loot.gold;s.items.push(...loot.items);delete state.loot[key];
 E.log('Recovered '+[...(loot.gold?[loot.gold+' gp']:[]),...loot.items.map(id=>E.items[id].name)].join(', ')+'.');
};
E.service=service=>{
 const s=E.s,m=E.module();
 switch(service){
  case 'shop':{
   const stock=E.stock(m.level);
   E.dialog('Provisioner','<p>'+s.gold+' gp available.</p><h3>Buy</h3>'+stock.map(item=>E.button(item.name+' · '+item.price+' gp','buy:'+item.id,item.price>s.gold)).join('')+
   '<h3>Sell</h3>'+s.items.map((id,i)=>E.button(E.items[id].name+' · '+Math.floor(E.items[id].price/2)+' gp','sell:'+i,E.items[id].type==='quest')).join(''));break;
  }
  case 'inn':E.dialog('The Lantern Inn','<p>A night’s rest restores the company and prepares its spells.</p>'+E.button('Rent a room · 5 gp','rest:inn',s.gold<5)+E.button('Hear rumours','rumours'));break;
  case 'temple':E.dialog('The Still Flame','<p>Restore health and revive fallen companions.</p>'+E.button('Offer 25 gp','heal',s.gold<25));break;
  case 'train':E.dialog('Training hall','<p>Training costs 100 gp per level attained.</p>'+s.party.map((p,i)=>'<div class="entry">'+E.escape(p.name)+' · Level '+p.level+' · '+p.xp+' XP'+(p.level<E.levelLimit(p)?' / '+E.xpFor(p.class,p.level+1):'')+E.button('Train for '+100*(p.level+1)+' gp','train:'+i,p.level>=E.levelLimit(p)||p.xp<E.xpFor(p.class,p.level+1)||s.gold<100*(p.level+1))+ (p.class==='Fighter'?E.button('Specialize in '+E.items[p.weapon].name,'specialize:'+i,p.specialization===p.weapon):'')+'</div>').join(''));break;
  case 'commission':{
   const q=E.quest();
   E.dialog(m.giver,'<p>'+m.intro+'</p><p>'+m.main+'</p><p>'+m.side+'</p>'+
   E.button('Accept commission','accept',q.accepted)+E.button('Claim main reward','claim',!q.done||q.paid)+E.button('Return recovered records','claimSide',q.side||!s.items.includes(m.relic)));break;
  }
 }
};
E.help=()=>E.dialog('How to play','<p>Lead the company from town to wilderness and into the dungeons. In Thornwick, seek the watch office on the southwest corner of the town map. The southeast gate leads to the river road. At the far end of the road, Visit Briar Gate to enter the cellars.</p><p><strong>Exploration</strong> · W/S or ↑/↓ move forward and back. A/D or ←/→ turn. Q/E sidestep. Enter interacts with the square ahead. F searches, C creeps, R camps, M opens the map, J opens the journal and B opens the bestiary. Use 1–6 for character sheets or Esc for the menu. The Move button shows the touch pad.</p><p><strong>Combat</strong> · Choose a tile to move your active character. Select an enemy within reach to attack. Use Cast and select a tile for area spells. Guard improves defense for the round. Auto-fight plays turns for the company.</p><p><strong>Adventuring</strong> · Search beside suspicious stonework and disarm discovered traps with a thief. Use Loot while standing on loose treasure. Memorize spells from character sheets, then rest to replenish them. Save from Menu and travel between adventures in the Campaign atlas.</p>');
E.menu=()=>E.dialog('Game menu',E.button('Resume','close')+E.button('Save and load','saves')+E.button('Manage company','party',!!E.battle)+E.button('Campaign atlas','campaign')+E.button('How to Play','help')+E.button('Begin a new company','newGame',!!E.battle));
E.actions={
 close:E.close,explore:E.close,menu:E.menu,help:E.help,campaign:E.campaign,journal:E.journal,bestiary:E.bestiary,map:E.fullMap,
 hero:E.sheet,party:()=>{if(!E.battle)E.company();},roll:E.rollAbilities,
 recruit:()=>{
  const race=E.el('race').value,cls=E.el('class').value,alignment=E.el('alignment').value,name=E.el('recruitName').value.trim();
  if(!name||E.s.party.length>=6)return;
  if((cls==='Paladin'&&alignment!=='Lawful Good')||(cls==='Ranger'&&!alignment.endsWith(' Good'))){E.el('rolls').textContent='Paladins must be Lawful Good. Rangers must have a good alignment.';return;}
  E.s.party.push(E.makeHero(name,race,cls,E.rolled,alignment));E.refreshSpells();E.company();
 },
 dismiss:i=>{if(E.s.party.length>1){E.s.party.splice(i,1);E.company();}},
 ready:()=>{E.s.party=E.ready();E.refreshSpells();E.close();},
 newGame:()=>E.dialog('Begin a new company','<p>Start over at Thornwick. Manual save slots remain available.</p>'+E.button('Begin again','restart')),
 restart:()=>{E.battle=null;E.s=E.fresh();E.camera=null;E.refreshSpells();E.reveal();E.close();},saves:E.savesMenu,
 save:slot=>{E.log(E.save(slot)?'Saved to slot '+slot+'.':'Storage is unavailable.');E.savesMenu();},
 load:slot=>{if(!E.load(slot))E.log('The save could not be loaded.');},
 module:E.changeModule,
 standalone:id=>{
  const mod=E.modules.find(m=>m.id===id);
  if(!mod||E.battle)return;
  E.dialog('Begin '+mod.name,'<p>Start with a level '+mod.level+' company. Manual save slots remain available.</p>'+E.button('Start adventure','startModule:'+id));
 },
 startModule:id=>{
  if(E.battle)return;
  E.s=E.fresh();E.changeModule(id);
  const level=E.module().level;
  E.s.gold+=(level-1)*75;
  for(const p of E.s.party){
   if(level>E.levelLimit(p))p.race='Human';
   while(p.level<level)E.grow(p);
   p.xp=E.xpFor(p.class,p.level);
   if(p.class==='Mage'){
    for(let t=2;t<=9;t++){const sp=Object.values(E.spells).find(sp=>!sp.school&&sp.tier===t);if(E.slots(p,t)&&sp)p.book.push(sp.id);}
   }
   if(level>=5){p.weapon='w0-'+Math.min(5,Math.floor(level/4));if(p.class==='Fighter')p.specialization=p.weapon;p.ac-=Math.floor(level/4);}
  }
  E.refreshSpells();
 },
 service:E.service,move:E.move,interact:E.interact,search:E.search,
 listen:()=>{
  if(E.s.mode==='wild'||E.battle)return;
  const [x,y]=E.front(),state=E.mapState(),t=E.s.party.find(p=>p.class==='Thief'&&p.hp>0);
  const nearby=Object.keys(state.groups).some(key=>{const [gx,gy]=key.split(',').map(Number);return Math.abs(gx-x)+Math.abs(gy-y)<=3;});
  E.log(nearby&&E.roll(100)<(t?E.thief(t).Listen:35)?'You hear movement beyond.':'You hear only the company breathing.');
 },
 sneak:()=>{if(E.s.party.some(p=>p.class==='Thief'&&p.hp>0)){E.s.sneak=!E.s.sneak;E.log(E.s.sneak?'The thief leads the company quietly.':'The company resumes its normal pace.');}else E.log('A thief is needed to creep ahead.');},
 camp:()=>{if(!E.battle)E.camp();},rest:E.rest,loot:E.loot,pad:()=>{E.s.pad=!E.s.pad;},
 force:()=>{
  const [x,y]=E.front(),key=x+','+y;
  if(E.at(E.mapData(),x,y)!=='L')return;
  const strength=Math.max(...E.s.party.filter(p=>p.hp>0).map(p=>p.stats[0]));
  E.s.minutes+=5;
  if(E.roll(20)<=strength){E.mapState().open[key]=true;E.log('The door yields with a crack.');E.close();}
  else E.log('The door shudders but holds.');
 },
 disarm:()=>{
  const key=E.front().join(','),state=E.mapState(),t=E.s.party.find(p=>p.class==='Thief'&&p.hp>0);
  if(!state.traps[key]?.found)return;
  if(!t){E.log('A thief is needed to disarm this trap.');E.close();return;}
  if(E.roll(100)<=E.thief(t)['Find / remove traps']){delete state.traps[key];E.log(t.name+' disarms the trap.');}
  else if(E.roll(6)<=2)E.triggerTrap(key);
  else E.log('The mechanism remains armed.');
  E.close();
 },
 rumours:()=>E.dialog('Rumours',E.module().wild.rumours.map(r=>'<p>'+r+'</p>').join('')),
 note:()=>{const value=E.el('note').value.trim();if(value)E.note(value);E.journal();},
 accept:()=>{E.quest().accepted=true;E.note('Accepted the commission from '+E.module().giver+'.');E.service('commission');},
 claim:()=>{
  const q=E.quest(),level=E.module().level;
  if(q.done&&!q.paid){q.paid=true;E.s.gold+=120*level;E.award(E.s.party,Math.floor(E.module().questXP/4));E.note('Collected the main commission reward.');}
  E.service('commission');
 },
 claimSide:()=>{
  const q=E.quest(),i=E.s.items.indexOf(E.module().relic),level=E.module().level;
  if(i>=0&&!q.side){q.side=true;E.s.items.splice(i,1);E.s.gold+=40*level;E.award(E.s.party,Math.floor(E.module().sideXP/4));E.note('Returned the recovered records.');}
  E.service('commission');
 },
 buy:id=>{
  const i=E.items[id];if(!i||E.s.gold<i.price)return;
  E.s.gold-=i.price;if(id==='ration')E.s.rations++;else E.s.items.push(id);E.service('shop');
 },
 sell:i=>{const id=E.s.items[i],item=E.items[id];if(!item||item.type==='quest')return;E.s.items.splice(i,1);E.s.gold+=Math.floor(item.price/2);E.service('shop');},
 heal:()=>{if(E.s.gold>=25){E.s.gold-=25;E.s.party.forEach(p=>{p.hp=p.max;});E.close();E.log('The temple restores the company.');}},
 train:i=>{
  const p=E.s.party[i],cost=100*(p.level+1);
  if(p.level>=E.levelLimit(p)||p.xp<E.xpFor(p.class,p.level+1)||E.s.gold<cost)return;
  E.s.gold-=cost;E.grow(p);E.refreshSpells();E.service('train');
 },
 specialize:i=>{const p=E.s.party[i];if(p.class==='Fighter')p.specialization=p.weapon;E.service('train');},
 item:(i,n)=>{
  if(E.battle)return;
  const p=E.s.party[i],id=E.s.items[n],item=E.items[id];if(!item)return;
  if(item.type==='scroll'&&p.class==='Mage'&&!p.book.includes(item.spell))p.book.push(item.spell);
  else if(item.type==='weapon'){E.s.items.push(p.weapon);p.weapon=id;}
  else if(item.type==='armour'||item.type==='magic'){if(p.armour)E.s.items.push(p.armour);p.armour=id;p.ac=item.ac;}
  else if(item.type==='wand'){if(p.wand)E.s.items.push(p.wand);p.wand=id;}
  else if(item.type==='map'&&E.s.mode==='local'){
   const state=E.mapState();E.mapData().rows.forEach((row,y)=>row.forEach((_,x)=>{state.explored[x+','+y]=true;}));
   E.log('The chart reveals the layout of this level.');
  }
  else if(item.type==='potion'&&p.hp>0&&p.hp<p.max)p.hp=Math.min(p.max,p.hp+item.heal);
  else return;
  E.s.items.splice(n,1);E.sheet(i);
 },
 drop:(i,n)=>{
  if(E.battle||E.s.mode==='wild')return;
  const key=E.s.x+','+E.s.y,state=E.mapState(),pile=state.loot[key]||(state.loot[key]={gold:0,items:[]});
  pile.items.push(...E.s.items.splice(n,1));E.sheet(i);
 },
 prep:(i,id)=>{
  if(E.battle)return;
  const p=E.s.party[i],sp=E.spells[id],count=Object.entries(p.prepared).filter(([k])=>E.spells[k].tier===sp.tier).reduce((n,[,v])=>n+v,0);
  if(count<E.slots(p,sp.tier)){p.prepared[id]=(p.prepared[id]||0)+1;p.spent[id]=(p.spent[id]||0)+1;}
  else E.log('This spell tier has no free slots.');
  E.sheet(i);
 },
 unprep:(i,id)=>{if(!E.battle){const p=E.s.party[i];p.prepared[id]=Math.max(0,(p.prepared[id]||0)-1);E.sheet(i);}},
 battleMode:mode=>{if(E.battle){E.battle.mode=mode;E.battle.spell=null;}},
 cast:()=>{if(E.battle&&!E.battle.auto)E.castMenu();},turn:()=>{if(E.battle&&!E.battle.auto)E.turnUndead();},
 spell:(id,wand)=>{if(E.battle){E.battle.spell={...E.spells[id],wand:!!wand};E.close();}},
 guard:()=>{if(E.battle?.active.hero!==undefined&&!E.battle.auto){E.battle.active.guard=true;E.nextTurn();}},
 auto:()=>{const b=E.battle;if(!b)return;b.auto=!b.auto;if(b.auto&&b.active.hero!==undefined)E.aiTurn();},
 flee:()=>{if(E.battle?.active.hero!==undefined){if(E.roll(6)>2)E.endBattle('flee');else {E.log('The company cannot break away.');E.nextTurn();}}}
};
E.act=command=>{
 const [action,...args]=command.split(':');
 if(!E.actions[action])return;
 E.actions[action](...args);
 if(!E.battle&&E.s.party.some(p=>p.hp>0)&&!['load','saves','save'].includes(action))E.save('auto');
 E.render();
};
E.el('topnav').innerHTML=[['◇ Explore','explore'],['⌑ Atlas','campaign'],['▤ Journal','journal'],['♞ Bestiary','bestiary']].map(a=>E.button(...a)).join('');
document.addEventListener('click',event=>{
 const button=event.target.closest('button[data-action]');
 if(button&&!button.disabled)E.act(button.dataset.action);
 else if(event.target===E.el('overlay'))E.close();
});
document.addEventListener('keydown',event=>{
 if(event.ctrlKey||event.metaKey||event.altKey)return;
 if(event.key==='Escape'){event.preventDefault();E.act(E.el('overlay').hidden?'menu':'close');return;}
 if(/INPUT|SELECT|TEXTAREA/.test(event.target.tagName)||!E.el('overlay').hidden)return;
 const key=event.key.toLowerCase();
 const action={c:'sneak',w:'move:forward',arrowup:'move:forward',s:'move:back',arrowdown:'move:back',a:'move:left',arrowleft:'move:left',d:'move:right',arrowright:'move:right',q:'move:strafeLeft',e:'move:strafeRight',f:'search',r:'camp',m:'map',j:'journal',b:'bestiary',enter:'interact'}[key]||(/^[1-6]$/.test(key)?'hero:'+(Number(key)-1):null);
 if(action){event.preventDefault();E.act(action);}
});
E.el('scene').addEventListener('click',event=>{
 const rect=event.currentTarget.getBoundingClientRect(),x=(event.clientX-rect.left)*480/rect.width,y=(event.clientY-rect.top)*270/rect.height;
 if(E.battle)return E.combatClick(x,y);
 if(E.s.mode!=='wild')return;
 const {left,top,cell}=E.wildBounds,cx=Math.floor((x-left)/cell),cy=Math.floor((y-top)/cell),s=E.s;
 if(cx===s.x&&cy===s.y)E.act('interact');
 else if(Math.abs(cx-s.x)+Math.abs(cy-s.y)===1){E.travel(cx-s.x,cy-s.y);E.save('auto');E.render();}
});
if(!E.load('auto')){E.s=E.fresh();E.refreshSpells();E.reveal();}
E.render();
