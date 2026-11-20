E.bestiary=()=>{
 E.dialog('Bestiary','<div class="entries">'+(Object.entries(E.s.seen).map(([id,known])=>{
  const m=E.monsters[id];return '<div class="entry"><strong>'+m.name+'</strong><p>'+m.description+'</p>'+(known>1?'Level '+m.level+' · AC '+m.ac+' · '+(m.traits.join(', ')||'No special defenses'):'Observed in the field')+'</div>';
 }).join('')||'<p>Creatures will appear here as you encounter them.</p>')+'</div>');
};
