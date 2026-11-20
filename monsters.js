E.monsters={};
E.foe = (id,name,level,hp,ac,die,traits=[],description='') => E.monsters[id]={id,name,level,hp,ac,die,traits,description,xp:50*level*level+hp*7};
E.foe('rat','Lantern Rat',1,4,8,3,[],'It combs ashes for seed and fat.');
E.foe('scrapper','Briar Scrapper',1,7,7,4,[],'A storehouse scavenger carrying a chipped spear.');
E.foe('husk','Rootbound Husk',2,11,6,5,['undead'],'Roots bind its wrists and move its limbs.');
E.foe('cinder-reeve','Cinder Reeve',2,19,5,6,['undead','breath'],'The old cellar keeper cradles a watchfire in his ribs.');
E.foe('bell-wraith','Bell Wraith',3,30,4,7,['undead','drain','resist'],'The bell’s last echo clings to a drowned body.');
E.foe('iron-king','Iron King',5,52,1,10,['undead','paralysis','resist'],'Hammered iron plates hold together the bones of a buried monarch.');
E.foe('moor-queen','Witch-Queen of Ravenmoor',7,75,-1,12,['regeneration','breath'],'Her veil is threaded with the lights that lead travellers astray.');
const families=[
 ['Adder','poison'],['Asp','poison'],['Hound',''],['Wolf',''],['Boar',''],['Bear',''],['Stag',''],['Hare',''],['Moth',''],['Widow','poison'],
 ['Scorpion','poison'],['Centipede','poison'],['Beetle','resist'],['Eel','paralysis'],['Toad','poison'],['Crocodile',''],['Drake','breath'],['Wyvern','poison'],
 ['Wyrm','breath'],['Manticore','missile'],['Griffin',''],['Harpy','paralysis'],['Chimera','breath'],['Basilisk','paralysis'],
 ['Raider','missile'],['Skirmisher',''],['Brute',''],['Ogre',''],['Troll','regeneration'],['Giant',''],['Gargoyle','resist'],['Golem','resist'],
 ['Skeleton','undead'],['Revenant','undead'],['Wight','undead drain'],['Shade','undead resist'],['Ghoul','undead paralysis'],['Mummy','undead paralysis'],
 ['Lich','undead drain'],['Spectre','undead drain'],['Vampire','undead drain regeneration'],['Wisp','resist'],['Slime','regeneration'],
 ['Elemental','resist'],['Sprite','missile'],['Cyclops',''],['Minotaur',''],['Satyr','missile'],['Medusa','paralysis'],['Hydra','regeneration breath'],
 ['Roc',''],['Sphinx',''],['Cockatrice','paralysis'],['Hellhound','breath']
,
 ['Ape',''],['Baboon',''],['Bat',''],['Badger',''],['Ant','poison'],['Wasp','poison'],
 ['Tick','drain'],['Stirge','drain'],['Leech','drain'],['Weasel',''],['Lizard',''],['Salamander','resist'],
 ['Gorgon','breath'],['Grimalkin',''],['Raven','missile'],['Owl',''],['Jackal',''],['Hyena',''],
 ['Viper','poison'],['Python','paralysis'],['Crab','resist'],['Lobster','resist'],['Crayfish','resist'],['Swarmling','poison'],
 ['Hippogriff',''],['Pegasus',''],['Unicorn','resist'],['Owlbear',''],['Bulette','resist'],['Ankheg','breath'],
 ['Morkath','resist'],['Mimic','paralysis'],['Trapper','paralysis'],['Roper','paralysis'],['Delver','resist'],['Rust Grub','resist'],
 ['Gnoll','missile'],['Bugbear',''],['Kobold','missile'],['Goblin','missile'],['Orc',''],['Hobgoblin','missile'],
 ['Lizardfolk',''],['Centaur','missile'],['Dryad','paralysis'],['Tree Shepherd','regeneration'],
 ['Myconid','poison'],['Pudding','resist'],['Jelly','regeneration'],['Cube','paralysis'],
 ['Grave Hound','undead drain'],['Zombie','undead'],['Willow Hag','regeneration'],['Efreet','breath']
];
const habitats=['Moss','Flint','Umber'];
const traitNotes={
 poison:'Its venom weakens anyone who survives the first wound.',
 paralysis:'A strike can leave a victim unable to move.',
 resist:'Ordinary blades cut it poorly.',
 undead:'There is no breath behind its movements.',
 drain:'Its touch can steal a memory of earned skill.',
 regeneration:'Its wounds begin to close as soon as they open.',
 breath:'It can send a blast through a clustered party.',
 missile:'It attacks from beyond sword reach.'
};
families.forEach(([name,traits],i)=>habitats.forEach((habitat,j)=>{
 const abilities=traits?traits.split(' '):[],level=1+Math.floor(i/18)+j*7;
 const body=['It prowls the wet roads and culverts.','It shelters in broken stone and old fortifications.','It hunts in places untouched by daylight.'][j];
 E.foe(name.toLowerCase().replaceAll(' ','-')+'-'+j,habitat+' '+name,level,5+level*5,9-Math.floor(level*.8),
  4+Math.floor(level*.7),abilities,[body,...abilities.map(a=>traitNotes[a])].join(' '));
}));
