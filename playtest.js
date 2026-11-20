'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,name),'utf8');
const elements=new Map(),saved=new Map(),queued=[];
const gradient={addColorStop(){}};
const drawing=new Proxy({
 createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
 createLinearGradient:()=>gradient,createRadialGradient:()=>gradient
},{get:(target,key)=>target[key]||(()=>{})});
const element=(id='')=>({
 id,width:id==='minimap'?220:480,height:id==='minimap'?140:270,hidden:id==='overlay',
 classList:{toggle(){}},getContext:()=>drawing,querySelectorAll:()=>[],addEventListener(){},
 value:'',textContent:'',innerHTML:''
});
const document={
 getElementById:id=>{if(!elements.has(id))elements.set(id,element(id));return elements.get(id);},
 createElement:()=>element(),addEventListener(){}
};
const localStorage={setItem:(key,value)=>saved.set(key,value),getItem:key=>saved.get(key)||null};
const context=vm.createContext({document,localStorage,matchMedia:()=>({matches:false}),performance,
 requestAnimationFrame:()=>{},setTimeout:fn=>queued.push(fn)});
for(const [,source] of read('index.html').matchAll(/<script src="([^"]+)"/g)){
 vm.runInContext(read(source),context,{filename:source});
}
const E=vm.runInContext('E',context);
const act=E.act;
assert.equal(E.s.party.length,6);
assert.equal(document.getElementById('place').textContent,'Thornwick');
act('move:forward');
assert.equal(E.s.y,7);
act('move:right');
assert.equal(E.s.dir,1);
act('save:1');
act('move:back');
act('load:1');
assert.equal(E.s.x,8);
assert.equal(E.s.dir,1);
act('journal');
assert.match(document.getElementById('dialogBody').innerHTML,/Main commission/);
act('close');
const navigate=(x,y)=>{
 const s=E.s,goal=x+','+y;
 const walk=[[s.x,s.y,[]]],seen=new Set();
 for(let i=0;i<walk.length;i++){
  const [cx,cy,steps]=walk[i],key=cx+','+cy;
  if(seen.has(key)||E.blocked(cx,cy))continue;
  seen.add(key);
  if(key===goal){
   for(const [dx,dy] of steps){
    s.dir=dy<0?0:dx>0?1:dy>0?2:3;
    act('move:forward');
   }
   return;
  }
  for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]])walk.push([cx+dx,cy+dy,[...steps,[dx,dy]]]);
 }
 assert.fail('No route to '+goal);
};
navigate(2,9);
E.s.dir=3;
act('interact');
assert.equal(document.getElementById('dialogTitle').textContent,'Warden Elspeth');
act('accept');
assert.equal(E.quest().accepted,true);
act('close');
navigate(15,9);
act('interact');
assert.equal(E.s.mode,'wild');
vm.runInContext('Math.random = () => .5',context);
for(let i=0;i<12;i++)act('move:right');
assert.equal(E.s.x,14);
act('interact');
assert.equal(E.s.depth,1);
assert.equal(E.s.mode,'local');
const [key]=Object.keys(E.mapState().groups);
const [x,y]=key.split(',').map(Number);
E.startBattle(['rat'],{key,x,y});
assert.ok(E.battle);
for(const p of E.s.party){p.hp=100;p.ac=-8;}
for(const u of E.battle.units.filter(u=>u.hero!==undefined)){u.hp=100;u.ac=-8;}
act('auto');
for(let tick=0;tick<1000&&E.battle;tick++){
 const action=queued.shift();
 assert.ok(action,'A combat turn must be queued');
 action();
}
assert.equal(E.battle,null);
assert.ok(!E.mapState().groups[key]);
assert.ok(E.s.party.some(p=>p.xp>0));
act('bestiary');
assert.match(document.getElementById('dialogBody').innerHTML,/Lantern Rat/);
act('close');
act('hero:3');
assert.match(document.getElementById('dialogBody').innerHTML,/Learn/);
act('item:3:1');
assert.ok(E.s.party[3].book.includes('cloud'));
E.s.items.push('scroll-cloud');
act('hero:3');
assert.match(document.getElementById('dialogBody').innerHTML,/disabled>Learn/);
act('close');
act('startModule:E2');
const mage=E.s.party.find(p=>p.class==='Mage');
assert.ok(E.slots(mage,2)>0);
mage.book.push('cloud');
mage.prepared.cloud=1;
E.enter(4);
E.startBattle(['iron-king'],{x:15,y:9,key:'15,9',surprise:true});
const battle=E.battle, caster=battle.units.find(u=>u.hero===3);
battle.active=caster;
act('spell:cloud');
E.battleInput(6,1);
assert.equal(mage.spent.cloud,1);
assert.equal(battle.clouds.length,1);
battle.units.find(u=>u.id==='iron-king').hp=0;
E.nextTurn();
assert.equal(E.quest().done,true);
E.enter(0);
E.service('commission');
const gold=E.s.gold, xp=E.s.party[0].xp;
act('claim');
assert.equal(E.quest().paid,true);
assert.equal(E.s.gold,gold+120*E.module().level);
assert.equal(E.s.party[0].xp-xp,Math.floor(Math.floor(E.module().questXP/4)/6*1.1));
act('claim');
assert.equal(E.s.gold,gold+120*E.module().level);
act('startModule:W41');
assert.equal(E.s.module,'W41');
assert.equal(E.s.party[0].level,17);
act('module:E3');
assert.equal(E.s.party[0].level,17);
assert.equal(E.s.module,'E3');
console.log('Passed movement, commission, wilderness travel, dungeon entry, combat, bestiary, spells, quest rewards, saves, and campaign transfer.');
