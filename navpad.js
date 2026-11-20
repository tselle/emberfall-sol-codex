E.padMarkup=()=>'<div class="pad">'+[
 ['↶','left','Turn left'],['↑','forward','Forward'],['↷','right','Turn right'],['⇤','strafeLeft','Step left'],['↓','back','Back'],['⇥','strafeRight','Step right']
].map(([glyph,action,label])=>E.button('<span aria-label="'+label+'" title="'+label+'">'+glyph+'</span>','move:'+action)).join('')+'</div>';
