'use strict';
const E = {};
E.seed = function (seed) {
  return function () {
    seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
    return seed / 4294967296;
  };
};
E.roll = (sides, rng=Math.random) => 1+Math.floor(rng()*sides);
E.clamp = (n,min,max) => Math.max(min,Math.min(max,n));
E.abilities = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];
E.alignments = ['Lawful Good','Neutral Good','Chaotic Good','Lawful Neutral','True Neutral','Chaotic Neutral','Lawful Evil','Neutral Evil','Chaotic Evil'];
E.races = {
  Human:['Fighter','Paladin','Ranger','Mage','Cleric','Thief'],
  Dwarf:['Fighter','Cleric','Thief'], Elf:['Fighter','Ranger','Mage','Thief'],
  Gnome:['Fighter','Mage','Cleric','Thief'], 'Half-Elf':['Fighter','Ranger','Mage','Cleric','Thief'],
  Halfling:['Fighter','Cleric','Thief']
};
E.classes = {
  Fighter:[10,0,2000,1], Paladin:[10,0,2250,1], Ranger:[10,0,2250,1],
  Mage:[4,3,2500,1/3], Cleric:[8,4,1500,2/3], Thief:[6,1,1250,1/2]
};
const advancement={
 Fighter:[[0,2000,4000,8000,16000,32000,64000,125000,250000],250000,3],
 Paladin:[[0,2250,4500,9000,18000,36000,75000,150000,300000],300000,3],
 Ranger:[[0,2250,4500,9000,18000,36000,75000,150000,300000],300000,3],
 Mage:[[0,2500,5000,10000,20000,40000,60000,90000,135000,250000,375000,750000],375000,1],
 Cleric:[[0,1500,3000,6000,13000,27500,55000,110000,225000],225000,2],
 Thief:[[0,1250,2500,5000,10000,20000,40000,70000,110000,160000],220000,2]
};
E.xpFor = (cls,level) => {
 const [table,step]=advancement[cls];
 return table[level-1]??table[table.length-1]+(level-table.length)*step;
};
E.levelLimit=p=>p.race==='Human'?20:({
 Dwarf:{Fighter:15,Cleric:10,Thief:12},Elf:{Fighter:12,Ranger:15,Mage:15,Thief:12},
 Gnome:{Fighter:11,Mage:15,Cleric:9,Thief:13},
 'Half-Elf':{Fighter:14,Ranger:16,Mage:12,Cleric:14,Thief:12},
 Halfling:{Fighter:9,Cleric:8,Thief:15}
}[p.race][p.class]||20);
E.grow=p=>{
 const hp=p.level<(p.class==='Thief'?10:9)?E.roll(E.classes[p.class][0])+Math.max(0,p.stats[2]-15):advancement[p.class][2];
 p.level++;p.max+=hp;if(p.hp>0)p.hp+=hp;
};
const savesByGroup={
 Warrior: {step:2,table:[[14,16,15,17,17],[13,15,14,16,16],[11,13,12,13,14],[10,12,11,12,13],[8,10,9,9,11],[7,9,8,8,10],[5,7,6,5,8],[4,6,5,4,7],[3,5,4,4,6]]},
 Priest: {step:3,table:[[10,14,13,16,15],[9,13,12,15,14],[7,11,10,13,12],[6,10,9,12,11],[5,9,8,11,10],[4,8,7,10,9],[2,6,5,8,7]]},
 Rogue: {step:4,table:[[13,14,12,16,15],[12,12,11,15,13],[11,10,10,14,11],[10,8,9,13,9],[9,6,8,12,7],[8,4,7,11,5]]},
 Wizard: {step:5,table:[[14,11,13,15,12],[13,9,11,13,10],[11,7,9,11,8],[10,5,7,9,6],[8,3,5,7,4]]}
};
E.saves = p => {
 const {step,table}=savesByGroup[{Mage:'Wizard',Cleric:'Priest',Thief:'Rogue'}[p.class]||'Warrior'];
 return table[Math.min(table.length-1,Math.floor((p.level-1)/step))].map(n=>p.class==='Paladin'?Math.max(2,n-2):n);
};
E.thac0 = p => 20-Math.floor((p.level-1)*E.classes[p.class][3]);
const wizardSlots=[
 '1','2','21','32','421','422','4321','4422','44321','44432',
 '444421','444422','5554321','5554422','5555521','55555221','55555332','555553331','555553332','555554433'
];
const priestSlots=[
 '1','2','21','32','331','332','3321','3332','44321','44332',
 '544421','654432','665542','6665431','7775521','7776641','8886652','9997752','9998862','9998872'
];
const paladinSlots=['1','2','21','22','221','222','3321','3331','3332','3333','3333','3333'];
const rangerSlots=['1','2','21','22','221','222','322','332','333','333','333','333','333'];
E.slots=(p,tier)=>{
 const l=p.level-1,t=tier-1;
 const row=({Mage:wizardSlots[l],Cleric:priestSlots[l],Paladin:paladinSlots[l-8],Ranger:rangerSlots[l-7]})[p.class];
 return Number(row?.[t]||0);
};
E.thief = p => Object.fromEntries(['Find / remove traps','Move silently','Hide in shadows','Open locks','Listen'].map((k,i)=>[k,Math.min(95,[25,30,20,25,35][i]+p.level*5+(p.stats[1]-12)*3)]));
E.makeHero = (name,race,cls,stats,alignment=cls==='Paladin'?'Lawful Good':'Neutral Good') => {
  const hp=E.classes[cls][0]+Math.max(0,stats[2]-15);
  return {name,race,class:cls,stats,alignment,hp,max:hp,level:1,xp:0,ac:['Mage','Thief'].includes(cls)?8:5,
    weapon:cls==='Mage'?'staff':cls==='Thief'?'shortblade':'longsword', specialization:cls==='Fighter'?'longsword':null,
    book:cls==='Mage'?['cinder','slumber']:[],prepared:{},spent:{},drain:0};
};
E.award = (party,xp) => {
  const alive=party.filter(p=>p.hp>0);
  alive.forEach(p=>p.xp+=Math.floor(xp/alive.length*(p.stats[E.classes[p.class][1]]>=16?1.1:1)));
};
