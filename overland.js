E.travel=(dx,dy)=>{
 const s=E.s,w=E.module().wild,x=s.x+dx,y=s.y+dy,terrain=w.terrain[y]?.[x],cost=E.terrain[terrain]?.[1];
 if(!cost){E.log('The '+(terrain||'edge of the marches')+' blocks the route.');return;}
 const night=s.minutes%1440<360||s.minutes%1440>1200;
 const pace=s.party.some(p=>p.race!=='Human')?17:15;
 s.x=x;s.y=y;
 s.minutes+=Math.round(cost*pace*(s.fatigue>16?1.5:1)*(night?1.25:1));
 s.fatigue+=cost;
 const site=w.sites.find(a=>a.x===x&&a.y===y);
 if(site){E.log(site.name+' · Visit to enter.');return;}
 const roll=Math.random();
 if(roll<.018*cost*(night?2:1)*(s.fatigue>16?1.5:1)){
  const pool=w.tables[terrain];
  E.startBattle([pool[E.roll(pool.length)-1],pool[E.roll(pool.length)-1]],null);
 }else if(roll>.96){E.log('Friendly travellers share a rumour. '+w.rumours[E.roll(w.rumours.length)-1]);}
};
E.visit=()=>{
 const s=E.s,mod=E.module(),site=mod.wild.sites.find(a=>a.x===s.x&&a.y===s.y);
 if(!site){E.log('There is no site on this square.');return;}
 switch(site.kind){
  case 'town':E.enter(0);break;
  case 'dungeon':
   if((mod.band>=2||['E2','E3'].includes(mod.id))&&!E.quest().accepted){E.log('The gatekeeper requires a commission.');break;}
   E.enter(1);break;
  case 'hamlet':E.dialog(site.name,E.button('Rest for 5 gp','rest:inn')+E.button('Trade','service:shop'));break;
  case 'healer':E.service('temple');break;
  case 'camp':E.camp();break;
  case 'holy':{
   const key=mod.id+site.name;
   if(!s.holy[key]){s.holy[key]=true;E.award(s.party,60);E.log('The pilgrim shares a blessing. The company gains 60 XP.');}
   else E.log('The pilgrim’s lantern still burns.');
   break;
  }
  case 'lair':{
   const key=mod.id+site.name;
   if(s.holy[key]){E.log('The hollow is quiet.');break;}
   const pool=Object.values(E.monsters).filter(m=>m.level===mod.level);
   E.startBattle([pool[0].id,pool[0].id],{lair:key});break;
  }
 }
};
E.wildDraw=(canvas,mini=false)=>{
 const ctx=canvas.getContext('2d'),{terrain,sites}=E.module().wild,cols=terrain[0].length,rows=terrain.length,cell=Math.floor(Math.min(canvas.width/cols,canvas.height/rows)),left=(canvas.width-cols*cell)/2,top=(canvas.height-rows*cell)/2;
 ctx.fillStyle='#1b1713';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=Math.max(8,cell*.65)+'px Georgia';
 terrain.forEach((r,y)=>r.forEach((tile,x)=>{
  const sx=left+x*cell,sy=top+y*cell;
  ctx.fillStyle=E.terrain[tile][0];ctx.fillRect(sx,sy,cell-1,cell-1);
  const glyph={forest:'♠',hills:'∩',mountains:'▲',river:'≈',fen:'≋'}[tile];
  if(glyph){ctx.fillStyle='#14141099';ctx.fillText(glyph,sx+cell/2,sy+cell/2);}
 }));
 const marks={town:'♜',dungeon:'◆',holy:'✦',camp:'△',hamlet:'⌂',healer:'✚',lair:'⚑'};
 sites.forEach(site=>{ctx.fillStyle='#ffdb92';ctx.fillText(marks[site.kind],left+(site.x+.5)*cell,top+(site.y+.5)*cell);});
 ctx.fillStyle='#ffe5ab';ctx.strokeStyle='#422822';ctx.lineWidth=2;ctx.beginPath();ctx.arc(left+(E.s.x+.5)*cell,top+(E.s.y+.5)*cell,cell*.27,0,Math.PI*2);ctx.fill();ctx.stroke();
 if(!mini)E.wildBounds={cell,left,top};
};
