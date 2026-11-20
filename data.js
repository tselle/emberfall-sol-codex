E.ready = () => [
  ['Aldric Voss','Human','Fighter',[17,13,16,10,11,12]],
  ['Brynja Flint','Human','Paladin',[16,11,16,10,15,16]],
  ['Sylvara Ashwind','Elf','Ranger',[15,17,14,12,14,11]],
  ['Mireth Vale','Half-Elf','Mage',[9,14,12,18,13,12]],
  ['Brother Cael','Dwarf','Cleric',[13,11,15,10,17,13]],
  ['Pip Underbough','Halfling','Thief',[11,18,13,13,10,14]]
].map(([name,race,cls,stats])=>E.makeHero(name,race,cls,stats));
E.items = {};
E.addItem = (id,name,type,price,extra={}) => E.items[id]={id,name,type,price,...extra};
E.addItem('staff','Ash staff','weapon',5,{die:6});
E.addItem('shortblade','Short blade','weapon',12,{die:6});
E.addItem('longsword','Longsword','weapon',25,{die:8});
E.addItem('bow','Yew bow','weapon',32,{die:6,range:5});
E.addItem('tonic','Mending draught','potion',18,{heal:8});
E.addItem('mail','Riveted mail','armour',65,{ac:4});
E.addItem('ration','Trail rations','supply',5);
E.spells = {};
const wizardNames = [
  'Cinder Dart,Slumber,Veil of Glass,Static Grasp,Frost Needle,Chalk Ward,Ember Fan,Mothlight,Iron Pulse',
  'Stinking Cloud,Mirror Husk,Web of Flax,Forked Spark,Ashblind,Quill Storm,Salt Shell,Dusk Step',
  'Coalburst,Storm Lance,Swift Current,Knotted Time,Cold Lantern,Gale Shear,Corrosive Haze,Unweave',
  'Frostfall,Obsidian Skin,Glass Prison,Ember Bridge,Quietus,Scalding Vortex,Thorn Crown,Sun Crucible',
  'Cinder Wall,Gravel Maw,Lucent Spear,Rime Chain,Black Briar,Star Grasp,Shatter Veil,Will Bind',
  'Ashen Nova,Waking Pyre,Copper Tempest,Void Shards,Winter Grasp,Blinding Sun,Storm Cage,Hourglass Bind',
  'Glass Meteor,Thunder Host,Furnace Tide,Frozen Hours,Ghost Chains,Penumbra,Starfire Wheel,Iron Comet',
  'Copper Eclipse,Silver Maelstrom,Glacial Rift,Twilight Hand,Hollow Star,Falling Sky,Quiet Star,Soulglass',
  'Dawn Collapse,Last Winter,Sunforge,Worldscar,Starfall,Still Storm,Glass Horizon,Empty Throne,Ember Crown,Black Aurora'
];
const priestNames = [
  'Mend,Sunmark,Blessed Ground,Briar Snare,Shelter,Unburden,Guiding Gleam,Sanctuary',
  'Warm Blood,Rootbind,Quiet Fear,Dawn Spear,Stone Skin,Cradle Light,Chain of Faith,Mercy',
  'Greater Mend,Daybreak,Cleanse,Bramble Field,Stone Hymn,Gateward,Glowing Brand,Wind Choir',
  'Living Flame,Staunch,Restoring Rain,Dusk Banish,Seed of Oak,Hearth Blessing,Iron Litany,Thorn Hail',
  'Healing Tide,Sun Column,Bone Quiet,Wave of Grace,Winter Mercy,Radiant Ring,Earth Bell,Spirit Knot',
  'Life Font,Ashen Banish,Light Enclosure,Dawn Tide,Recalling Hymn,Star Mercy,Wildfire Seal,Oak Mantle',
  'Full Renewal,Golden Reckoning,Field of Light,Sunward Crown,Broken Curse,Judgment,Candle of Life,Still Earth'
];
[wizardNames,priestNames].forEach((list,school)=>list.forEach((row,i)=>row.split(',').forEach((name,j)=>{
  const id=({'Cinder Dart':'cinder',Slumber:'slumber',Mend:'mend','Stinking Cloud':'cloud'})[name]||name.toLowerCase().replaceAll(' ','-');
  const effect=Object.entries({
   disable:/Cloud|Slumber|Bind|Snare|Prison|Frozen Hours|Still Storm|Sleep|Web|Ashblind|Quiet Fear/,
   heal:/Mend|Mercy|Heal|Renewal|Life Font|Staunch|Restoring Rain|Warm Blood|Hearth Blessing|Candle of Life/,
   ward:/Ward|Shell|Shelter|Skin|Blessed Ground|Mantle|Sanctuary|Mirror Husk|Crown|Cradle Light/,
   cleanse:/Cleanse|Unburden|Broken Curse/,
   hasten:/Swift Current|Dusk Step|Guiding Gleam/,
   repel:/Gale Shear|Rime Chain|Sun Column|Wind Choir/
  }).find(([,pattern])=>pattern.test(name))?.[0]||'damage';
  const area=id==='cloud'?2:id==='slumber'||/Storm|Wave|Rain|Field|Ring|Nova|Ground|Maelstrom/.test(name)?1:j%7===6?2:0;
  const range=id==='cloud'?9:['heal','ward','cleanse','hasten'].includes(effect)?4:5+j%4;
  E.spells[id]={id,name,school,tier:i+1,effect,range,area,power:4+i*4+j%4};
})));
