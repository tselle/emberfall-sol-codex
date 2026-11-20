E.battle=null;
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const inCloud=(u,cloud)=>u.x>=cloud.x&&u.x<cloud.x+2&&u.y>=cloud.y&&u.y<cloud.y+2;
const cloudSave=u=>{
 const p=hero(u);
 if(!p&&E.monsters[u.id].traits.includes('undead'))return;
 if(E.roll(20)>=(p?E.saves(p)[0]:Math.max(5,15-Math.floor(E.monsters[u.id].level/2))))return;
 u.stun=Math.max(u.stun||0,1+E.roll(4));
 E.log(u.name+' is overcome by the cloud.');
};
E.startBattle = (ids,origin) => {
 if(E.battle||!E.s.party.some(p=>p.hp>0))return;
 E.close();
 const units=E.s.party.flatMap((p,i)=>p.hp>0?[{hero:i,x:1+Math.floor(i/4),y:1+i%4,hp:p.hp,max:p.max,ac:p.ac,name:p.name}]:[]);
 ids.forEach((id,i)=>{
  const m=E.monsters[id];
  units.push({id,name:m.name,x:7+i%2,y:1+Math.floor(i/2),hp:m.hp,max:m.hp,ac:m.ac});
  E.s.seen[id]=Math.max(1,E.s.seen[id]||0);
 });
 E.battle={units,origin,round:0,order:[],active:null,mode:'attack',auto:false,clouds:[]};
 E.log('Encounter · '+ids.map(id=>E.monsters[id].name).join(', ')+'.');
 E.nextTurn();
};
E.combatLabel = () => 'Round '+E.battle.round+' · '+(E.battle.active?.name||'Initiative');
E.combatCommands = () => [
 ['✥','Move','battleMode:move'],['⚔','Attack','battleMode:attack'],['✧','Cast','cast'],['☀','Turn undead','turn'],['◇','Guard','guard'],
 ['⟳',E.battle.auto?'Stop auto':'Auto-fight','auto'],['↺','Flee','flee']
];
const living=()=>E.battle.units.filter(u=>u.hp>0&&!u.fled);
const hero=u=>u.hero!==undefined?E.s.party[u.hero]:null;
const occupied=(x,y)=>living().some(u=>u.x===x&&u.y===y);
const damage=(unit,points)=>{
 unit.hp=Math.max(0,unit.hp-points);
 if(hero(unit))hero(unit).hp=unit.hp;
};
const maxWalk=u=>(hero(u)?(hero(u).race==='Human'?6:5):4)+(u.haste>=E.battle.round?2:0);
const walking=(u,max)=>{
 const cells=[{x:u.x,y:u.y,d:0}],seen=new Set([u.x+','+u.y]);
 for(let i=0;i<cells.length;i++){
  const p=cells[i];
  if(p.d>=max)continue;
  for(const [x,y] of [[p.x+1,p.y],[p.x-1,p.y],[p.x,p.y+1],[p.x,p.y-1]]){
   const key=x+','+y;
   if(x<0||x>=10||y<0||y>=7||seen.has(key)||occupied(x,y))continue;
   seen.add(key);cells.push({x,y,d:p.d+1});
  }
 }
 return cells;
};
const lineClear=(a,b)=>{
 const dx=b.x-a.x,dy=b.y-a.y,n=Math.max(Math.abs(dx),Math.abs(dy));
 for(let i=1;i<n;i++)if(occupied(Math.round(a.x+dx*i/n),Math.round(a.y+dy*i/n)))return false;
 return true;
};
const range=u=>hero(u)?(E.items[hero(u).weapon].range||1):E.monsters[u.id].traits.some(t=>t==='missile'||t==='breath')?5:1;
E.strike=(u,v)=>{
 const p=hero(u),m=p?null:E.monsters[u.id],weapon=p?E.items[p.weapon]:null;
 const spec=p?.specialization===p?.weapon&&!!p;
 const roll=E.roll(20),bonus=(spec?2:0)+(weapon?.bonus||0)+(p?.class==='Ranger'?1:0);
 const strength=p&&range(u)===1?Math.floor((p.stats[0]-13)/4):0;
 const dexterity=p&&range(u)>1?Math.floor((p.stats[1]-13)/4):0;
 const needed=(p?E.thac0(p):21-m.level)-v.ac+(v.guard?2:0)+(v.ward>=E.battle.round?2:0)-strength-dexterity;
 if(roll===1||(roll<20&&roll+bonus<needed)){E.log(u.name+' misses '+v.name+'.');return;}
 let hit=Math.max(1,E.roll(weapon?.die||m.die)+(spec?2:0)+(weapon?.bonus||0)+(p?.class==='Paladin'?2:0)+strength);
 if(p?.class==='Ranger'&&v.id&&!E.monsters[v.id].traits.includes('undead'))hit+=2;
 if(p?.class==='Thief'&&dist(u,v)===1&&living().some(a=>a!==u&&hero(a)&&dist(a,v)===1)){hit*=p.level>=9?3:2;E.log(p.name+' lands a backstab.');}
 if(!hero(v)&&E.monsters[v.id].traits.includes('resist')&&!weapon?.bonus)hit=Math.ceil(hit/2);
 damage(v,hit);E.log(u.name+' hits '+v.name+' for '+hit+'.');
 if(!m||v.hp<=0||!hero(v))return;
 const save=E.saves(hero(v));
 if(m.traits.includes('poison')&&E.roll(20)<save[0]){damage(v,E.roll(4));E.log(v.name+' suffers poison.');}
 if(m.traits.includes('paralysis')&&E.roll(20)<save[2])v.stun=2;
 if(m.traits.includes('drain')&&E.roll(20)<save[0]){
  const target=hero(v);target.drain=(target.drain||0)+1;
  if(target.level>1){target.level--;target.max=Math.max(1,target.max-E.classes[target.class][0]);v.max=target.max;damage(v,Math.max(0,v.hp-v.max));}
  else damage(v,2);
  E.log(v.name+' suffers level drain.');
 }
 if(m.traits.includes('breath'))for(const ally of living().filter(a=>hero(a)&&a!==v&&dist(a,v)<=1))damage(ally,E.roll(20)>=E.saves(hero(ally))[3]?1:3);
};
E.nextTurn = () => {
 const b=E.battle;
 if(!b)return;
 const alive=living();
 if(!alive.some(hero)){E.endBattle('defeat');return;}
 if(!alive.some(u=>!hero(u))){E.endBattle('victory');return;}
 if(!b.order.length){
  b.round++;
  b.clouds=b.clouds.filter(cloud=>cloud.until>=b.round);
  const eligible=b.round===1&&b.origin?.surprise?alive.filter(hero):alive;
  b.order=eligible.map(u=>({u,n:E.roll(10)-(hero(u)?.stats[1]||10)/5})).sort((a,c)=>a.n-c.n).map(a=>a.u);
 }
 const u=b.order.shift();
 if(u.hp<=0||u.fled)return E.nextTurn();
 if(!u.stun&&b.clouds.some(cloud=>inCloud(u,cloud)))cloudSave(u);
 if(u.stun){u.stun--;E.log(u.name+' cannot act.');return E.nextTurn();}
 u.guard=false;
 if(!hero(u)&&E.monsters[u.id].traits.includes('regeneration'))u.hp=Math.min(u.max,u.hp+2);
 b.active=u;b.mode='attack';b.spell=null;
 E.render();
 if(!hero(u)||b.auto) setTimeout(()=>{if(E.battle===b&&b.active===u&&(!hero(u)||b.auto))E.aiTurn();},b.auto?95:330);
};
E.aiTurn = () => {
 const u=E.battle.active;
 const enemies=living().filter(v=>!!hero(v)!==!!hero(u)).sort((a,b)=>dist(a,u)-dist(b,u));
 const v=enemies.find(e=>dist(e,u)<=range(u)&&lineClear(u,e));
 if(!hero(u)&&u.hp<u.max/4&&E.roll(6)===1){u.fled=true;E.log(u.name+' flees.');}
 else if(v)E.strike(u,v);
 else if(enemies[0]){
  const target=enemies[0],moves=walking(u,maxWalk(u)).sort((a,b)=>dist(a,target)-dist(b,target)||a.d-b.d);
  Object.assign(u,{x:moves[0].x,y:moves[0].y});
 }
 E.nextTurn();
};
E.battleInput = (x,y) => {
 const b=E.battle,u=b.active,p=hero(u);
 if(!p||b.auto)return;
 const v=living().find(a=>a.x===x&&a.y===y),target={x,y};
 if(b.spell){
  const sp=b.spell;
  if(dist(u,target)>sp.range||(!sp.area&&!v)){E.log('Choose a target within '+sp.range+' squares.');E.render();return;}
  const targets=living().filter(a=>dist(a,target)<=sp.area);
  if(sp.id==='cloud'){
   if(x>=9||y>=6){E.log('Choose a tile with space for the 2 × 2 cloud.');E.render();return;}
   const cloud={x,y,until:b.round+p.level};
   b.clouds.push(cloud);
   living().filter(a=>inCloud(a,cloud)).forEach(cloudSave);
  }
  for(const a of targets){
   if(sp.effect==='heal'&&hero(a)){a.hp=Math.min(a.max,a.hp+sp.power+E.roll(6));hero(a).hp=a.hp;}
   if(sp.effect==='ward'&&hero(a))a.ward=b.round+2;
   if(sp.effect==='hasten'&&hero(a))a.haste=b.round+2;
   if(sp.effect==='cleanse'&&hero(a))a.stun=0;
   if(sp.effect==='repel'&&!hero(a)){
    const x=a.x+Math.sign(a.x-u.x),y=a.y+Math.sign(a.y-u.y);
    if(x>=0&&x<10&&y>=0&&y<7&&!occupied(x,y)){a.x=x;a.y=y;}
    damage(a,sp.power);
   }
   if(sp.id!=='cloud'&&sp.effect==='disable'&&(!hero(a)||sp.area)&&E.roll(20)<(hero(a)?E.saves(hero(a))[4]:14))a.stun=2;
   if(sp.effect==='damage'&&(!hero(a)||sp.area))damage(a,sp.power+E.roll(6));
  }
  if(sp.wand)p.wand=null;else p.spent[sp.id]=(p.spent[sp.id]||0)+1;
  E.log(p.name+' casts '+sp.name+'.');E.nextTurn();return;
 }
 if(b.mode==='move'||!v){
  if(!v&&walking(u,maxWalk(u)).some(a=>a.x===x&&a.y===y)){u.x=x;u.y=y;E.nextTurn();}
 }else if(!hero(v)){
  if(dist(u,v)<=range(u)&&lineClear(u,v)){E.strike(u,v);E.nextTurn();}
  else {E.log('Target out of reach. Move closer or equip a missile weapon.');E.render();}
 }
};
E.castMenu=()=>{
 const p=hero(E.battle.active);
 if(!p)return;
 const buttons=Object.entries(p.prepared).filter(([id,n])=>n>(p.spent[id]||0)).map(([id,n])=>E.button(E.spells[id].name+' · '+(n-(p.spent[id]||0))+' ready','spell:'+id));
 if(p.wand)buttons.push(E.button(E.items[p.wand].name,'spell:'+E.items[p.wand].spell+':wand'));
 E.dialog('Cast a spell',buttons.join('')||'<p>No prepared spells or readied wands.</p>');
};
E.turnUndead=()=>{
 const u=E.battle.active,p=hero(u);
 if(!p)return;
 const level=p.class==='Cleric'?p.level:p.class==='Paladin'?p.level-2:0;
 if(level<1){E.log('This adventurer cannot turn undead.');E.render();return;}
 for(const v of living().filter(v=>v.id&&dist(u,v)<=6&&E.monsters[v.id].traits.includes('undead'))){
  if(E.roll(20)+level>=10+E.monsters[v.id].level){v.fled=true;E.log(v.name+' recoils and flees.');}
 }
 E.nextTurn();
};
E.endBattle=outcome=>{
 const b=E.battle;E.battle=null;
 if(outcome==='victory'){
  const foes=b.units.filter(u=>u.id);
  E.award(E.s.party,foes.reduce((sum,u)=>sum+E.monsters[u.id].xp,0));
  foes.forEach(u=>E.s.seen[u.id]=2);
  E.winEncounter(b.origin);
  E.log('Victory. Experience is shared among the survivors.');
 }else if(outcome==='flee'){E.log('The company withdraws.');E.retreat();}
 else{E.log('The company has fallen.');E.dialog('The company has fallen',E.button('Load a save','saves')+E.button('Begin again','restart'));}
 E.render();
};
E.iso = (x,y) => [219+(x-y)*23,30+(x+y)*12];
E.drawBattle = canvas => {
 const ctx=canvas.getContext('2d'),b=E.battle;
 const backdrop=ctx.createLinearGradient(0,0,0,270);backdrop.addColorStop(0,'#201a18');backdrop.addColorStop(1,'#3d2820');ctx.fillStyle=backdrop;ctx.fillRect(0,0,480,270);
 const moving=b.mode==='move'&&hero(b.active)?walking(b.active,maxWalk(b.active)):[],spell=b.spell;
 for(let y=0;y<7;y++)for(let x=0;x<10;x++){
  const [sx,sy]=E.iso(x,y),marked=moving.some(t=>t.x===x&&t.y===y)||(spell&&dist(b.active,{x,y})<=spell.range);
  ctx.beginPath();ctx.moveTo(sx-23,sy);ctx.lineTo(sx,sy-12);ctx.lineTo(sx+23,sy);ctx.lineTo(sx,sy+12);ctx.closePath();
  ctx.fillStyle=b.clouds.some(cloud=>inCloud({x,y},cloud))?'#666947':marked?'#665637':(x+y)%2?'#3d3328':'#493c2d';ctx.fill();ctx.strokeStyle='#241d17';ctx.stroke();
 }
 const units=living().sort((a,b)=>a.x+a.y-b.x-b.y);
 for(const u of units){
  const [x,y]=E.iso(u.x,u.y);
  ctx.fillStyle='#1b1514';ctx.beginPath();ctx.ellipse(x,y,13,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=u===b.active?'#ddb372':hero(u)?'#8d9a61':'#a15844';ctx.fillRect(x-8,y-17,16,15);
  ctx.fillStyle=hero(u)?'#d1aa80':'#b8896a';ctx.fillRect(x-5,y-25,10,9);
  ctx.fillStyle='#211815';ctx.fillRect(x-11,y-30,22,3);ctx.fillStyle=hero(u)?'#a8b984':'#cb7654';ctx.fillRect(x-11,y-30,22*u.hp/u.max,3);
 }
};
E.combatClick=(px,py)=>{
 if(!E.battle)return;
 for(const u of living().sort((a,b)=>b.x+b.y-a.x-a.y)){
  const [x,y]=E.iso(u.x,u.y);if(Math.abs(x-px)<12&&py>=y-30&&py<=y+2)return E.battleInput(u.x,u.y);
 }
 const a=(px-219)/23,b=(py-30)/12,x=Math.round((a+b)/2),y=Math.round((b-a)/2);
 if(x>=0&&x<10&&y>=0&&y<7)E.battleInput(x,y);
};
