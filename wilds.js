E.terrain={
  grass:['#606743',1],road:['#a58159',.5],bridge:['#b49a6a',.6],forest:['#354d35',2],hills:['#786449',2],fen:['#555a55',3],mountains:['#3a3431',0],river:['#365668',0]
};
E.makeWild = (module,seed) => {
  const rand=E.seed(seed^0x4c327);
  const terrain=Array.from({length:12},(_,y)=>Array.from({length:17},(_,x)=>{
    if(x===8) return y===6?'bridge':'river';
    if(y===6) return 'road';
    return ['grass','grass','forest','forest','hills','fen','mountains'][Math.floor(rand()*7)];
  }));
  const sites=[
    {x:2,y:6,kind:'town',name:module.town},{x:14,y:6,kind:'dungeon',name:module.entrance},
    {x:4,y:5,kind:'hamlet',name:'Hazelbank'},{x:6,y:7,kind:'holy',name:'The Pilgrim’s Lantern'},
    {x:10,y:5,kind:'camp',name:'Wayfarer’s Ring'},{x:13,y:7,kind:'lair',name:'Foxglove Hollow'},
    {x:3,y:7,kind:'healer',name:'The Stillroom'}
  ];
  sites.filter(s=>s.y!==6).forEach(s=>terrain[s.y][s.x]='grass');
  const encounters=Object.values(E.monsters).filter(m=>Math.abs(m.level-module.level)<=1&&m.id!==module.boss);
 const tables=Object.fromEntries(Object.entries(E.terrain).filter(([,spec])=>spec[1]>0).map(([ground])=>{
  const pool=encounters.filter(m=>ground==='fen'?m.traits.includes('poison'):ground==='forest'?!m.traits.includes('undead'):true);
  const available=pool.length?pool:encounters;
  return [ground,Array.from({length:4},()=>available[E.roll(available.length,rand)-1].id)];
 }));
 return {terrain,sites,tables,rumours:[module.intro,'The river road is safest in daylight.','A pilgrim tends a lantern by the western road.']};
};
