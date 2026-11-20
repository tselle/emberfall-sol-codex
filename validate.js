'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const files=['rules','data','modules','monsters','wilds','treasure','adventures'];
const load=()=>{
 const context=vm.createContext({});
 for(const file of files)vm.runInContext(fs.readFileSync(path.join(__dirname,file+'.js'),'utf8'),context,{filename:file+'.js'});
 return vm.runInContext('E',context);
};
const E=load();
assert.equal(E.modules.length,54);
assert.equal(JSON.stringify(E.modules),JSON.stringify(load().modules),'Adventure generation must be deterministic');
for(const hero of E.ready()){
 assert.ok(E.races[hero.race].includes(hero.class));
 assert.ok(E.items[hero.weapon]);
 for(const id of hero.book)assert.ok(E.spells[id],id);
}
for(const item of Object.values(E.items))if(item.spell)assert.ok(E.spells[item.spell],item.id);
let count=0;
for(const mod of E.modules){
 assert.ok(E.monsters[mod.boss],mod.boss);
 const wild=mod.wild, home=wild.sites.find(s=>s.kind==='town');
 const routes=E.reachable(wild.terrain,home.x,home.y,t=>E.terrain[t]?.[1]>0);
 for(const ids of Object.values(wild.tables))for(const id of ids)assert.ok(E.monsters[id],id);
 for(const site of wild.sites)assert.ok(routes.has(site.x+','+site.y),mod.id+' '+site.name);
 mod.maps.forEach((map,depth)=>{
  count++;
  const label=mod.id+' '+map.name;
  const [x,y]=map.start;
  const floor=E.reachable(map.rows,x,y,t=>!!t&&t!=='#');
  assert.ok(floor.has(x+','+y),label+' invalid spawn');
  map.rows.forEach((row,y)=>{
   assert.equal(row.length,map.rows[0].length,label+' uneven row '+y);
   row.forEach((tile,x)=>{if(tile!=='#')assert.ok(floor.has(x+','+y),label+' unreachable '+x+','+y);});
  });
  for(const obj of [map.events,map.traps,map.groups,map.loot])for(const key of Object.keys(obj))assert.ok(floor.has(key),label+' unreachable '+key);
  for(const [key,event] of Object.entries(map.events)){
   if(event==='up')assert.ok(depth===1||mod.maps[depth-1].events['15,9']==='down',label+' invalid up exit '+key);
   if(event==='down')assert.equal(mod.maps[depth+1]?.events['1,9'],'up',label+' invalid down exit '+key);
  }
  if(depth){
   assert.ok(Object.keys(map.traps).length>=2&&Object.keys(map.traps).length<=3,label+' trap count');
   const secrets=map.rows.flat().filter(t=>t==='S').length;
   assert.ok(secrets>=1&&secrets<=3,label+' secret count');
  }
  for(const group of Object.values(map.groups))for(const id of group.ids)assert.ok(E.monsters[id],id);
  for(const loot of Object.values(map.loot))for(const id of loot.items)assert.ok(E.items[id],id);
 });
}
console.log('Validated '+E.modules.length+' adventures, '+count+' local maps, '+Object.keys(E.monsters).length+' monsters, '+Object.keys(E.items).length+' items, and '+Object.keys(E.spells).length+' spells.');
