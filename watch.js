E.camp=()=>{
 const controls=E.button('Rest eight hours','rest:camp')+E.button('Rest until healed','rest:heal');
 E.dialog('Make camp','<p>'+E.s.rations+' rations remaining. The company uses one ration each night.</p>'+controls);
};
E.refreshSpells=()=>{
 for(const p of E.s.party){
  const schools=Object.values(E.spells).filter(sp=>sp.school);
  const defaults=p.class==='Mage'?p.book:p.class==='Cleric'?['mend',...schools.filter(sp=>sp.tier>1&&sp.effect==='heal').map(sp=>sp.id),...schools.map(sp=>sp.id)]:['mend',...schools.map(sp=>sp.id)];
  for(let tier=1;tier<=9;tier++){
   const chosen=Object.keys(p.prepared).some(id=>p.prepared[id]&&E.spells[id].tier===tier);
   const id=defaults.find(id=>E.spells[id].tier===tier);
   if(!chosen&&id&&E.slots(p,tier))p.prepared[id]=1;
  }
  p.spent={};
 }
};
E.rest=kind=>{
 if(E.battle)return;
 const s=E.s,inn=kind==='inn';
 if(inn&&s.gold<5){E.log('An inn room costs 5 gp.');return;}
 if(!inn&&!s.rations){E.log('The company has no rations.');return;}
 if(inn)s.gold-=5;
 let nights=0;
 do{
  nights++;
  if(!inn)s.rations--;
  s.minutes+=480;s.fatigue=0;
  E.refreshSpells();
  for(const p of s.party.filter(p=>p.hp>0)){
   p.hp=Math.min(p.max,p.hp+(inn?p.max:2));
   for(const [id,count] of Object.entries(p.prepared)){
    const sp=E.spells[id];
    if(sp.effect!=='heal')continue;
    for(let i=0;i<count;i++){
     const target=s.party.filter(a=>a.hp>0&&a.hp<a.max).sort((a,b)=>b.max-b.hp-(a.max-a.hp))[0];
     if(target)target.hp=Math.min(target.max,target.hp+sp.power+E.roll(6));
    }
   }
  }
 }while(kind==='heal'&&s.rations&&s.party.some(p=>p.hp>0&&p.hp<p.max));
 E.refreshSpells();E.close();E.log('The company rests for '+nights*8+' hours.');
};
