E.campaign=()=>{
 E.dialog('Campaign atlas','<p>Take the company and its equipment to another adventure. Each expedition keeps its own map and quest progress.</p><div class="entries">'+E.modules.map(m=>
 '<div class="entry"><strong>'+m.id+' · '+m.name+'</strong><br>Levels '+m.level+'–'+m.maxLevel+' · '+m.town+' '+E.button(m.id===E.s.module?'Current adventure':'Travel','module:'+m.id,m.id===E.s.module||!!E.battle)+E.button('Start here','standalone:'+m.id,!!E.battle)+'</div>').join('')+'</div>');
};
E.changeModule=id=>{
 if(E.battle||!E.modules.some(m=>m.id===id))return;
 E.s.module=id;E.enter(0);E.log(E.module().intro);E.close();
};
