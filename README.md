# Emberfall · The Emberwild Saga

Emberfall is an original party-based browser RPG with first-person exploration, wilderness routes and turn-based tactical combat. Open `index.html` in a browser. You can also serve this folder from any static site directory. The game has no runtime dependencies or external assets.

## First expedition

The ready-made company starts at Thornwick. Find Warden Elspeth at the southwest watch office and accept her commission. Leave through the southeast gate, follow the road across the bridge and visit Briar Gate. Search the cellars for traps, hidden doors and the lamplighter’s ledger. Return to Elspeth after defeating the Cinder Reeve.

The Atlas lists the four authored adventures and fifty seeded expeditions. **Travel** transfers your current company to another adventure. **Start here** begins a separate company at that adventure’s suggested level. Menu → Save and load gives you four manual slots and an autosave. Saves use the browser’s local storage for the current file or site.

## Controls

| Input | Action |
| --- | --- |
| W/S or ↑/↓ | Advance and back up |
| A/D or ←/→ | Turn, or move west/east on the overland map |
| Q/E | Sidestep |
| Enter | Interact with a doorway, landmark or square ahead |
| F / C / R | Search / creep / camp |
| M / J / B | Map / journal / bestiary |
| 1–6 | Character sheets |
| Esc | Open the menu or close a panel |

The Move button toggles the touch pad. Tap an adjacent tile on the wilderness map to travel. In combat, select a tile to move, select an enemy to attack, or use the command bar to cast, guard, turn undead or flee.

## Checks

Run `node validate.js` to check deterministic generation, references, topology, traps, secrets and destinations. Run `node playtest.js` to exercise movement, saving, the first commission, overland travel, dungeon entry, combat, the bestiary, scroll learning, quest rewards and campaign transfer against the application scripts.

The game adapts tabletop mechanics to a square-grid browser RPG. Regional monster variants, spell effects and hoards use shared rules and original tables. The four authored adventures use custom dungeon plans and clues. Expedition layouts are generated independently from their seeds.

## Rules references

- Advancement, saving throws and wizard spell range use the second-edition tabletop rules as a reference. [Player’s Handbook](https://eldalin.com/private/dnd/2nd_Ed/TSR%202159%20-%20Player%27s%20Handbook.pdf)
- Hoards use lettered treasure types with coin values scaled for the game. [First-edition Monster Manual](https://s3-us-west-1.amazonaws.com/rpgpdf.angelochiriaco.com/AdvancedDungeonsandDragons/MM.pdf)

## License

MIT. See [LICENSE](LICENSE).
