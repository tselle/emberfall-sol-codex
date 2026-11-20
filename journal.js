E.quest=()=>E.s.quests[E.s.module]||(E.s.quests[E.s.module]={});
E.note=text=>E.s.notes.push({module:E.s.module,day:1+Math.floor(E.s.minutes/1440),text});
E.journal=()=>{
 const mod=E.module(),q=E.quest(),notes=E.s.notes.filter(n=>n.module===mod.id);
 E.dialog('Quest journal','<h3>'+mod.name+'</h3><p>'+mod.giver+' · '+(q.paid?'Commission completed':q.accepted?'Commission accepted':'Commission available')+'</p>'+
 '<div class="entry"><strong>Main commission</strong><p>'+mod.main+'</p><p>'+ (q.paid?'Reward received':q.done?'Return to the commission giver':'Reward · '+(120*mod.level)+' gp and '+mod.questXP+' XP')+'</p></div>'+
 '<div class="entry"><strong>Side commission</strong><p>'+mod.side+'</p><p>'+(q.side?'Reward received':'Reward · '+(40*mod.level)+' gp and '+mod.sideXP+' XP')+'</p></div>'+
 '<h3>Notes</h3>'+notes.reverse().map(n=>'<p>Day '+n.day+' · '+E.escape(n.text)+'</p>').join('')+
 '<label>Add a note <input id="note" maxlength="160"></label>'+E.button('Add','note'));
};
