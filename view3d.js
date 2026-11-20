E.view = (() => {
 const w=480,h=270,size=64, art={};
 // The masonry, timber and torch textures are generated once.
 for(const [key,base] of Object.entries({'#':[108,69,47],D:[105,61,31],L:[80,48,27],S:[108,69,47],A:[121,79,40],B:[131,81,48],C:[110,101,83],H:[99,66,54],W:[123,83,58],T:[111,75,50]})){
  const c=E.canvas(size,size),ctx=c.getContext('2d'),img=ctx.createImageData(size,size),rand=E.seed(199);
  const timber='DLABHW'.includes(key);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const row=Math.floor(y/13), seam=timber?x%10<2:y%13<2||(x+(row%2)*9)%19<2;
   const brick=Math.sin((row*79+Math.floor((x+(row%2)*9)/19))*8)*9;
   const noise=(rand()-.5)*30+brick+(seam?-37:y%13===2?13:0);
   const glow=key==='T'?Math.max(0,30-Math.hypot(x-32,y-25)*1.3):0;
   const i=(y*size+x)*4;
   for(let k=0;k<3;k++)img.data[i+k]=base[k]+noise+glow*(1-k*.29);
   img.data[i+3]=255;
  }
  ctx.putImageData(img,0,0);
  if(timber){
   ctx.fillStyle='#5d4637';ctx.fillRect(0,0,7,64);ctx.fillRect(57,0,7,64);
   ctx.strokeStyle='#37251d';ctx.lineWidth=4;ctx.strokeRect(7,6,50,58);
   ctx.strokeStyle='#b68557';ctx.lineWidth=1;ctx.strokeRect(10,8,44,55);
   ctx.fillStyle='#493026';ctx.fillRect(11,17,43,4);ctx.fillRect(11,45,43,4);
   ctx.fillStyle='#cb9953';ctx.fillRect(44,33,4,5);
   if('ABCWH'.includes(key)){ctx.fillStyle='#573720';ctx.fillRect(17,5,30,12);ctx.fillStyle='#edc487';ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText({A:'SHOP',B:'INN',C:'TEMPLE',H:'HALL',W:'WARD'}[key],32,14);}
  }
  if(key==='T'){
   ctx.fillStyle='#342219';ctx.fillRect(30,28,4,14);
   const glow=ctx.createRadialGradient(32,24,0,32,24,17);
   glow.addColorStop(0,'#ff9b3bc2');glow.addColorStop(1,'#ff9b3b00');
   ctx.fillStyle=glow;ctx.fillRect(15,7,34,34);
   ctx.fillStyle='#fdb350';ctx.beginPath();ctx.moveTo(28,29);ctx.lineTo(31,16);ctx.lineTo(35,23);ctx.lineTo(36,29);ctx.fill();ctx.fillStyle='#fff0b0';ctx.fillRect(31,24,2,5);
  }
  art[key]=c;
 }
 function draw(canvas,map,x,y,angle,state){
  const ctx=canvas.getContext('2d'), sin=Math.sin(angle),cos=Math.cos(angle), px=x+.5,py=y+.5;
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,map.index?'#14100e':'#241a1c');
  sky.addColorStop(.46,map.index?'#4a2d21':'#98604b');
  sky.addColorStop(.5,'#54382a');sky.addColorStop(1,'#2a1d17');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  if(!map.index){
   const moonX=((281-angle*90)%565+565)%565-40;
   const halo=ctx.createRadialGradient(moonX,46,8,moonX,46,63);
   halo.addColorStop(0,'#ffc28c55');halo.addColorStop(1,'#ffc28c00');
   ctx.fillStyle=halo;ctx.fillRect(0,0,w,h/2);
   ctx.fillStyle='#e9bd91';ctx.beginPath();ctx.arc(moonX,46,12,0,Math.PI*2);ctx.fill();
   const cloud=E.seed(3678);
   for(let i=0;i<35;i++){
    const cx=((cloud()*650-angle*55)%650+650)%650-80,cy=10+cloud()*104,len=36+cloud()*106;
    ctx.fillStyle=i%2?'#211b234a':'#b47a5340';ctx.fillRect(cx,cy,len,2+cloud()*4);
   }
  }
  for(let yy=h/2+3;yy<h;yy++){
   const d=91/(yy-h/2);
   if(Math.floor(d*2)!==Math.floor(91/(yy+1-h/2)*2)){ctx.fillStyle='#150f0c77';ctx.fillRect(0,yy,w,1);if(map.index)ctx.fillRect(0,h-yy,w,1);}
   for(let sx=0;sx<w;sx+=4){
    const lateral=(sx/w-.5)*d*1.45, wx=px+sin*d+cos*lateral, wy=py-cos*d+sin*lateral;
    if((wx*20|0)%10===0||(wy*20|0)%10===0){ctx.fillStyle='#140d0944';ctx.fillRect(sx,yy,4,1);}
   }
  }
  const depths=[];
  for(let sx=0;sx<w;sx+=2){
   const u=(sx/w-.5)*1.55,rx=sin+cos*u,ry=-cos+sin*u;
   let mx=Math.floor(px),my=Math.floor(py),dx=Math.abs(1/rx),dy=Math.abs(1/ry);
   const stepx=rx<0?-1:1,stepy=ry<0?-1:1;
   let tx=(rx<0?px-mx:mx+1-px)*dx,ty=(ry<0?py-my:my+1-py)*dy,d=.3,side=0,c='#';
   for(let n=0;n<35;n++){
    if(tx<ty){d=tx;tx+=dx;mx+=stepx;side=0;}else{d=ty;ty+=dy;my+=stepy;side=1;}
    const tile=E.at(map,mx,my),key=mx+','+my;
    if(tile==='#'||('DLSABCHW'.includes(tile)&&!state.open[key])){c=tile;break;}
   }
   depths[sx>>1]=d;
   if(c==='#'&&((mx*31+my*17+map.seed)%5===0||!map.index&&my===7&&(mx===7||mx===9))) c='T';
   const hit=side?px+d*rx:py+d*ry,tex=Math.floor((hit-Math.floor(hit))*64),height=Math.min(1200,203/Math.max(.09,d));
   ctx.drawImage(art[c]||art['#'],tex,0,1,64,sx,(h-height)/2,2,height);
   ctx.fillStyle='rgba(13,8,6,'+Math.min(.92,.09+(side?.04:.18)+d*.069)+')';ctx.fillRect(sx,(h-height)/2,2,height);
  }
  const sprites=Object.keys(state.groups).map(key=>{
    const [gx,gy]=key.split(',').map(Number),dx=gx+.5-px,dy=gy+.5-py,d=dx*sin-dy*cos;
    return {d,sx:w/2+(dx*cos+dy*sin)*w/(d*1.55),group:state.groups[key]};
  }).filter(s=>s.d>.2&&s.d<9).sort((a,b)=>b.d-a.d);
  for(const {d,sx,group} of sprites){
   if(depths[Math.floor(sx/2)]<d-.1||sx<0||sx>w)continue;
   const z=Math.min(75,47/d),sy=h/2+38/d;
   ctx.fillStyle='#0e0b09';ctx.fillRect(sx-z*.5,sy-z*.55,z,z*.61);
   ctx.fillStyle=group.boss?'#83452f':'#594437';ctx.fillRect(sx-z*.32,sy-z*.65,z*.64,z*.63);
   ctx.fillStyle='#9b785b';ctx.fillRect(sx-z*.21,sy-z*.87,z*.42,z*.26);
   ctx.fillStyle='#ffc35b';ctx.fillRect(sx-z*.12,sy-z*.77,z*.08,z*.045);ctx.fillRect(sx+z*.05,sy-z*.77,z*.08,z*.045);
  }
  const vignette=ctx.createRadialGradient(w/2,h/2,45,w/2,h/2,265);
  vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#090503a8');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
 }
 return {draw};
})();
