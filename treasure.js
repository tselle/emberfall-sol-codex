const weaponForms=['Arming sword','Battle axe','War hammer','Long spear','Falchion','Sling','Crossbow','Great sword','Morningstar','Longbow','Dagger','Glaive','Mace','Quarterstaff'];
const armourForms=['Hide coat','Leather jack','Ring shirt','Scale coat','Chain hauberk','Brigandine','Splint harness','Field plate','Tower shield','Kite shield'];
const itemMarks=['Wayfarer','Watch','Briar','Runic','Ember','High Court'];
weaponForms.forEach((form,i)=>itemMarks.forEach((mark,j)=>E.addItem('w'+i+'-'+j,mark+' '+form,'weapon',10+(i+2)*(j+1)*8,{die:4+i%6,bonus:j,range:[5,6,9].includes(i)?6:1,band:j})));
armourForms.forEach((form,i)=>itemMarks.forEach((mark,j)=>E.addItem('a'+i+'-'+j,mark+' '+form,'armour',25+(i+1)*(j+1)*14,{ac:8-Math.floor(i*.6)-j,band:j})));
Object.values(E.spells).forEach(s=>{
 if(!s.school) E.addItem('scroll-'+s.id,'Scroll of '+s.name,'scroll',20*s.tier,{spell:s.id,band:Math.floor((s.tier-1)/2)});
});
['jasper','moonstone','garnet','amber','sapphire','opal','ruby','diamond'].forEach((gem,i)=>{
 E.addItem('gem-'+i,gem[0].toUpperCase()+gem.slice(1),'gem',10*(i+1)**2,{band:Math.floor(i/2)});
 E.addItem('jewel-'+i,gem[0].toUpperCase()+gem.slice(1)+' pendant','jewellery',30*(i+1)**2,{band:Math.floor(i/2)});
 E.addItem('potion-'+i,['Restorative','Greater restorative','Hunter’s cordial','Pilgrim’s tonic','Rookroot cure','Starlight cordial','Phoenix draught','Royal elixir'][i],'potion',24+15*i,{heal:10+7*i,band:Math.floor(i/2)});
 E.addItem('wand-'+i,'Wand of '+Object.values(E.spells)[i*9].name,'wand',75+75*i,{spell:Object.values(E.spells)[i*9].id,band:Math.floor(i/2)});
 E.addItem('charm-'+i,['Lantern ring','Flint brooch','Shielding mantle','Sable girdle','Star clasp','Ember diadem','Moon signet','Sun circlet'][i],'magic',65+65*i,{ac:7-i,band:Math.floor(i/2)});
});
// Coin columns are copper, silver, electrum, gold and platinum.
const treasureRows={
 A:['25:1-6 30:1-6 35:1-6 40:1-10 25:1-4','60:4-40','50:3-30','30:3:any'],
 B:['50:1-8 25:1-6 25:1-4 25:1-3 -','30:1-8','20:1-4','10:1:arms'],
 C:['20:1-12 30:1-6 10:1-4 - -','25:1-6','20:1-3','10:2:any'],
 D:['10:1-8 15:1-12 15:1-8 50:1-6 -','30:1-10','25:1-6','15:2:any,1:potion'],
 E:['5:1-10 25:1-12 25:1-6 25:1-8 -','15:1-12','10:1-2','25:3:any,1:scroll'],
 F:['- 10:1-20 15:1-12 40:1-10 35:1-8','20:3-20','10:1-10','30:3:curio,1:potion,1:scroll'],
 G:['- - - 50:10-40 50:1-20','30:5-20','25:1-10','35:4:any,1:scroll'],
 H:['25:5-20 40:1-100 40:10-40 55:10-60 25:5-50','50:1-100','50:1-40','15:4:any,1:potion,1:scroll'],
 I:['- - - - 30:3-18','55:2-20','50:1-12','15:1:any'],
 J:['100:3-24 - - - -','-','-','-'],
 K:['- 100:3-18 - - -','-','-','-'],
 L:['- - 100:2-12 - -','-','-','-'],
 M:['- - - 100:2-8 -','-','-','-'],
 N:['- - - - 100:1-6','-','-','-'],
 O:['25:1-4 20:1-3 - - -','-','-','-'],
 P:['- 30:1-6 25:1-2 - -','-','-','-'],
 Q:['- - - - -','50:1-4','-','-'],
 R:['- - - 40:2-8 50:10-60','55:4-32','45:1-12','-'],
 S:['- - - - -','-','-','40:2-8:potion'],
 T:['- - - - -','-','-','50:1-4:scroll'],
 U:['- - - - -','90:10-80','80:5-30','70:1:weapon,1:armour,1:wand,1:magic'],
 V:['- - - - -','-','-','85:2:weapon,2:armour,2:wand,2:magic'],
 W:['- - - 60:5-30 15:1-8','60:10-80','50:5-40','55:1:map'],
 X:['- - - - -','-','-','60:1:magic,1:potion'],
 Y:['- - - 70:2-12 -','-','-','-'],
 Z:['20:1-3 25:1-4 25:1-4 30:1-4 30:1-6','55:10-60','50:5-30','50:3:any']
};
E.addItem('chart','Surveyor’s chart','map',44);
E.treasureTypes=treasureRows;
E.stock=level=>Object.values(E.items).filter(item=>item.id==='ration'||item.id==='tonic'||item.type!=='quest'&&(item.band||0)===Math.min(5,Math.floor((level-1)/4)));
E.hoard=(type,level,rng=Math.random)=>{
 const [coins,gems,jewels,magic]=treasureRows[type]||treasureRows.A;
 const band=Math.min(5,Math.floor((level-1)/4)),items=[];
 const amount=range=>{
  const [lo,hi=lo]=range.split('-').map(Number);
  return lo+Math.floor(rng()*(hi-lo+1));
 };
 const roll=entry=>{
  const [chance,range]=entry.split(':');
  return range&&E.roll(100,rng)<=Number(chance)?amount(range):0;
 };
 // Condense coin denominations into a single company purse and scale caches to the expedition.
 const personal='JKLMN'.includes(type);
 const gold=Math.floor(coins.split(' ').reduce((total,entry,i)=>total+roll(entry)*[.05,.1,.5,1,5][i],0)*(personal?1:Math.max(2,level)));
 const categories={any:['weapon','armour','potion','wand','scroll','magic'],arms:['weapon','armour'],curio:['wand','magic','armour']};
 const pick=(count,kind)=>{
  const pool=Object.values(E.items).filter(i=>(i.band||0)<=band&&(categories[kind]||[kind]).includes(i.type));
  if(!pool.length)return;
  for(let n=0;n<count;n++)items.push(pool[E.roll(pool.length,rng)-1].id);
 };
 pick(Math.min(1+band,roll(gems)),'gem');
 pick(Math.min(1+band,roll(jewels)),'jewellery');
 const [chance,...drops]=magic.split(':');
 if(E.roll(100,rng)<=Number(chance)){
  for(const drop of drops.join(':').split(',')){
   const [count,kind]=drop.split(':');pick(amount(count),kind);
  }
 }
 return {gold,items};
};
