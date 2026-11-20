E.drawMap=(canvas)=>{
 if(E.s.mode==='wild')return E.wildDraw(canvas,true);
 const ctx=canvas.getContext('2d'),map=E.mapData(),state=E.mapState(),w=map.rows[0].length,h=map.rows.length,tile=Math.floor(Math.min(canvas.width/w,canvas.height/h)),ox=(canvas.width-tile*w)/2,oy=(canvas.height-tile*h)/2;
 ctx.fillStyle='#14110e';ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const key=x+','+y,t=E.at(map,x,y),visible=!map.index||state.explored[key],trap=state.traps[key];
  if(!visible)continue;
  const wall=t==='#'||t==='S'&&!state.open[key];
  ctx.fillStyle=wall?'#30271f':map.events[key]?'#9a6e43':trap?.found?'#a45140':state.groups[key]&&state.spotted[key]?'#973e34':state.loot[key]?'#a78a53':t==='D'||t==='L'?'#705238':'#514235';
  ctx.fillRect(ox+x*tile,oy+y*tile,tile-1,tile-1);
 }
 ctx.save();ctx.translate(ox+(E.s.x+.5)*tile,oy+(E.s.y+.5)*tile);ctx.rotate(E.s.dir*Math.PI/2);ctx.fillStyle='#ffcb81';
 ctx.beginPath();ctx.moveTo(0,-tile*.43);ctx.lineTo(tile*.32,tile*.34);ctx.lineTo(-tile*.32,tile*.34);ctx.fill();ctx.restore();
};
E.fullMap=()=>{
 E.dialog(E.s.mode==='wild'?'Wilderness map':'Map of '+E.mapData().name,'<canvas id="largeMap" width="640" height="400"></canvas><p>'+(E.s.mode==='wild'?'♜ Town · ◆ Dungeon · ✦ Holy site · △ Camp · ⌂ Hamlet · ✚ Healer · ⚑ Lair':'▲ Party · Ochre landmarks · Red hazards · Gold loot')+'</p>');
 E.drawMap(E.el('largeMap'));
};
