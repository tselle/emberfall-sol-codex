const townPlan=[
 '#################',
 '#...#A..D.#B....#',
 '#...#.....#.....#',
 '#..D#....D#....D#',
 '#...............#',
 '#C#...#...#...#H#',
 '#......#.#......#',
 '#....#.#.#.#....#',
 '#....#.....#....#',
 '#W...#.....#...>#',
 '#################'
];
const cellarPlans=[
 ['#################','#........#......#','#.##.###.###.##.#','#....#.#.....#..#','###D##.###D###.##','#....#..........#','#.##.######.###.#','#.#.............#','#.#.##D##.###.#.#','#<.....#......#>#','#################'],
 ['#################','#.......#.......#','#.#####.#.#####.#','#...#...D...#...#','###.#.#####.#.###','#...D...#...D...#','#.###.#.#.#.###.#','#.....#...#.....#','#.#####.###.###.#','#<.............>#','#################'],
 ['#################','#.......#.......#','#.#####.#.#####.#','#.......D.......#','####.###.###.####','#....#.....#....#','#.##.###.###.##.#','#...............#','#.###.#.#.#.###.#','#<.............>#','#################'],
 ['#################','#...#.......#...#','#.#.#.#####.#.#.#','#.#...#...#...#.#','#.#####.D.#####.#','#.....#...#.....#','#####.##D##.#####','#...............#','#.#.###.#.###.#.#','#<.............>#','#################']
];
// Individual plans retain common stair positions so each descent has a matching return point.
const authoredPlans=[
 [cellarPlans[0],cellarPlans[1],cellarPlans[2]],
 [
  ['#################','#.......#.......#','#.###.#.#.#.###.#','#.#...#...#...#.#','#.#.#####.###.#.#','#.#.....D.....#.#','#.#####.#.#####.#','#...............#','#..###.....###..#','#<.............>#','#################'],
  ['#################','#...............#','#.#.#.#.#.#.#.#.#','#...............#','#######D#D#######','#...#.......#...#','#.#.#.#####.#.#.#','#.#...#...#...#.#','#.#####.D.#####.#','#<.............>#','#################'],
  ['#################','#...............#','#.#####.#.#####.#','#.#...#.#.#...#.#','#.#.D##.#.##D.#.#','#.#...........#.#','#.#####.D.#####.#','#...............#','#..##.......##..#','#<.............>#','#################']
 ],
 [
  ['#################','#...#.......#...#','#.#.#.#####.#.#.#','#.#...#...#...#.#','#.#####.D.#####.#','#.....#...#.....#','#.###.##D##.###.#','#...............#','#.#.###.#.###.#.#','#<.............>#','#################'],
  ['#################','#...............#','#.###.#####.###.#','#...#.#...#.#...#','###D#.#...#.#D###','#.....D...D.....#','#.###.#####.###.#','#...#.......#...#','#.#.#.#####.#.#.#','#<.............>#','#################'],
  ['#################','#...............#','#.#############.#','#...#.......#...#','#.#.#.#####.#.#.#','#.#.D.#...#.D.#.#','#.#.#.#...#.#.#.#','#...#...D...#...#','#.######.######.#','#<.............>#','#################'],
  ['#################','#...............#','#.#####.D.#####.#','#.......#.......#','#.#####.#.#####.#','#.......#.......#','#.##.##.#.##.##.#','#.......D.......#','####.###.###.####','#<.............>#','#################']
 ],
 [
  ['#################','#...#...#...#...#','#.#.#.#.#.#.#.#.#','#.#...#...#...#.#','#.###.#####.###.#','#...#.......#...#','###D####D####D###','#...............#','#.###.#####.###.#','#<.............>#','#################'],
  ['#################','#...#...#...#...#','#...#...#...#...#','#...D...D...D...#','#.#######.#####.#','#...#.......#...#','#.#.#.#####.#.#.#','#.#.D...#...D.#.#','#.#.###.#.###.#.#','#<.............>#','#################'],
  ['#################','#...............#','#.##D#######D##.#','#.#...........#.#','#.#.#.#.#.#.#.#.#','#.#...........#.#','#.#####.D.#####.#','#...............#','#...####.####...#','#<.............>#','#################'],
  ['#################','#...D.......D...#','#.#.#####.###.#.#','#.#...........#.#','#.####.###.####.#','#......#.#......#','###D##.#.#.##D###','#......D.D......#','#.####.....####.#','#<.............>#','#################']
 ]
];
E.at = (map,x,y) => map.rows[y]?.[x] || '#';
E.reachable = (rows,x,y,pass) => {
 const open=[[x,y]],seen=new Set();
 for(let i=0;i<open.length;i++){
   const [cx,cy]=open[i], key=cx+','+cy;
   if(seen.has(key)||!pass(rows[cy]?.[cx])) continue;
   seen.add(key);
   open.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
 }
 return seen;
};
const generatedPlan=seed=>{
 const rng=E.seed(seed^0x918247),w=17,h=11;
 const rows=Array.from({length:h},()=>Array(w).fill('#'));
 const carve=(x,y)=>{
  rows[y][x]='.';
  const options=[[2,0],[-2,0],[0,2],[0,-2]].map(step=>[rng(),step]).sort((a,b)=>a[0]-b[0]);
  for(const [, [dx,dy]] of options){
   const nx=x+dx,ny=y+dy;
   if(nx<1||nx>=w-1||ny<1||ny>=h-1||rows[ny][nx]==='.')continue;
   rows[y+dy/2][x+dx/2]='.';carve(nx,ny);
  }
 };
 carve(1,9);
 for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
  if(rows[y][x]!=='#')continue;
  if(rows[y][x-1]==='.'&&rows[y][x+1]==='.'||rows[y-1][x]==='.'&&rows[y+1][x]==='.'){
   if(rng()<.28)rows[y][x]=rng()<.35?'D':'.';
  }
 }
 rows[9][1]='<';rows[9][15]='>';
 return rows.map(row=>row.join(''));
};
const makeMap=(rows,name,seed,level,mod,index)=>{
 rows=rows.map(r=>r.split(''));
 const map={rows,name,seed,level,index,events:{},traps:{},groups:{},loot:{}};
 if(index===0) {
   const services={A:'shop',B:'inn',C:'temple',H:'train',W:'commission','>':'leave'};
   rows.forEach((r,y)=>r.forEach((c,x)=>{if(services[c])map.events[x+','+y]=services[c];}));
   map.start=[8,8,0];
   return map;
 }
 map.start=[1,9,0];
 const secrets=E.seed(seed^0x8436), encounter=E.seed(seed^0x4214), trap=E.seed(seed^0xf361), reward=E.seed(seed^0x8f022);
 const floors=[], pockets=[];
 rows.forEach((row,y)=>row.forEach((c,x)=>{
   if(c==='.'&&(x>2||y<7))floors.push(x+','+y);
   if(c==='#'&&x>0&&x<row.length-1&&y>0&&[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>rows[y+dy]?.[x+dx]==='.').length===1)pockets.push([x,y]);
 }));
 const take=(list,rng)=>list.splice(Math.floor(rng()*list.length),1)[0];
 for(let n=1+Math.floor(secrets()*3);n&&pockets.length;n--){
   const [x,y]=take(pockets,secrets);
   rows[y][x]='S';
   map.loot[x+','+y]={gold:22*level,items:index===1&&n===1?[mod.relic,'tonic']:['tonic']};
 }
 const trapNames=['pit','darts','blade','spear','falling block','fire','gas'];
 for(let n=2+Math.floor(trap()*2);n;n--)map.traps[take(floors,trap)]={name:take(trapNames.slice(),trap),found:false};
 const pool=Object.values(E.monsters).filter(m=>Math.abs(m.level-level)<=1&&!E.modules.some(a=>a.boss===m.id));
 for(let n=0;n<2+Math.floor(encounter()*3);n++){
   const key=take(floors,encounter);
   const enemy=mod.id==='E0'?['rat','scrapper','husk'][Math.min(index-1,2)]:pool[Math.floor(encounter()*pool.length)].id;
   map.groups[key]={ids:Array.from({length:2+Math.floor(encounter()*2)},()=>enemy),ambush:encounter()<.2};
   map.loot[key]=E.hoard(level<3?'C':level<7?'D':level<11?'E':level<16?'G':'H',level,reward);
   if(!map.loot[key].items.length&&!map.loot[key].gold)map.loot[key].gold=E.roll(10,reward)+5*level;
 }
 if(index>1){
  const y=rows.findIndex(row=>row.includes('D'));
  if(y>=0)rows[y][rows[y].indexOf('D')]='L';
 }
 if(mod.band===undefined){
  const key=take(floors,encounter);
  map.events[key]='clue';
 }
 map.events['1,9']='up';
 map.events['15,9']=index===mod.dungeons.length?'finish':'down';
 if(index===mod.dungeons.length){map.groups['15,9']={ids:[mod.boss],boss:true};map.loot['15,9']=E.hoard('Z',level+2,reward);}
 return map;
};
for(let b=0;b<5;b++)for(let i=0;i<10;i++){
 const seed=4401+b*1039+i*917,rand=E.seed(seed),x=['Alder','Cairn','Frost','Glass','Mallow','Oaken','Rook','Salt','Thistle','Willow'][i];
 const y=['Pale','Sable','Riven','Ashen','Golden'][b];
 const count=i<4?2:i<7?3:i<9?4:6,level=1+b*4;
 const boss=Object.values(E.monsters).filter(m=>m.level>=level&&m.level<=level+3);
 E.modules.push({id:'W'+(b*10+i+1),name:'The '+y+' '+x+' Expedition',town:x+' Cross',entrance:x+' Gate',
  dungeons:Array.from({length:count},(_,n)=>x+' '+['Undercroft','Passage','Cistern','Gallery','Reliquary','Sanctum'][n]),
  boss:boss[Math.floor(rand()*boss.length)].id,giver:'Reeve of '+x,main:'End the threat beneath '+x+' Gate.',side:'Recover the account book of the lost survey.',
  intro:'The road to '+x+' Gate is quiet. Your commission calls for a survey of the lower halls.',seed,level,band:b});
}
E.modules.forEach((mod,i)=>{
 const seed=mod.seed||1102+i*117;
 mod.level=mod.level||[1,1,3,5][i];
 mod.questXP=mod.band===undefined?[12000,32000,80000,160000][i]:3000*mod.level**2;
 mod.sideXP=Math.floor(mod.questXP/5);
 mod.maxLevel=mod.band===undefined?[2,3,5,7][i]:mod.level+3;
 mod.relic='records-'+mod.id;
 E.addItem(mod.relic,['Lamplighter’s ledger','Missing ferry rolls','Guard roster','Chapel register'][i]||mod.town+' survey book','quest',0);
 mod.maps=[makeMap(townPlan,mod.town,seed,mod.level,mod,0),...mod.dungeons.map((name,n)=>
  makeMap(mod.band===undefined?authoredPlans[i][n]:generatedPlan(seed+n*19),name,seed+n*19,Math.min(20,mod.level+Math.floor(n/2)),mod,n+1))];
 mod.wild=E.makeWild(mod,seed);
});
