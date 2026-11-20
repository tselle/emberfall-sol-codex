E.canvas = (w,h) => Object.assign(document.createElement('canvas'),{width:w,height:h});
E.portrait = (canvas,index) => {
 const ctx=canvas.getContext('2d'),pal=[['#986a4f','#b58765','#796456'],['#975739','#dc9b6d','#a25234'],['#525739','#cf9b6e','#403b26'],['#55446b','#a57765','#392f4c'],['#746447','#daae7c','#896e43'],['#584e35','#be9060','#61452e']][index%6];
 const rand=E.seed(index+866);
 ctx.fillStyle='#211914';ctx.fillRect(0,0,46,48);
 const fill=(c,x,y,w,h)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
 for(let n=0;n<150;n++)fill(rand()<.5?'#35271c':'#2a211a',rand()*46,rand()*48,2,2);
 fill('#161211',5,39,36,10);fill(pal[0],9,34,28,14);fill(pal[0],13,30,20,10);
 fill(pal[2],11,12,24,21);fill(pal[2],15,7,16,5);fill(pal[1],16,15,15,16);fill(pal[1],18,29,12,5);
 fill(pal[1],13,19,5,5);fill('#3f2a24',17,19,5,2);fill('#3f2a24',26,19,5,2);
 fill('#e4c7a4',19,21,2,1);fill('#e4c7a4',27,21,2,1);fill('#855744',23,21,3,5);
 fill('#643d2e',20,28,8,2);fill('#e0ae7d',20,24,2,2);
 if([0,1,4].includes(index%6)){fill(pal[2],16,27,4,7);fill(pal[2],28,26,4,7);fill(pal[2],20,30,9,6);}
 else {fill(pal[2],12,23,5,13);fill(pal[2],30,12,5,23);}
 fill('#b29063',9,38,9,2);fill('#b29063',30,38,8,2);fill('#d3ac6c',22,38,4,4);
};
