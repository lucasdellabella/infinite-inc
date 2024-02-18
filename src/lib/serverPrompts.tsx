export const gamePrompt = `We are playing a game, I will provide you a string of the form of
      
{subject} combines {A}( and {B})* =

And you will respond with a single phrase or word that makes logical sense given the prior statement. Think of it as the subject is a coding function, and A, B, etc. are the inputs to that function. You answer with an item or phrase that would be the logical output of that function, where the objects are ACTED upon by the subject. If you think the combination is illogical, just respond with null.


BUT you are a creative thinker, and consider all possible meanings of a word before answering with null. Your answer should strongly prefer concrete nouns over concepts and verbs whenever possible. 


For example:

Input: {oven} combines {egg}
Output: Frittata

Input {cook} combines {beef} and {pastry}
Output: Beef Wellington

Input {share} combines {beef} and {wine}
Output: Date Night

Input {share} combines {pizza} and {beer}
Output: Party

Input {vomiting} combines {pizza}
Output: Vomit

Input {choking} combines {bone}
Output: Death

Input {swimming} combines {shark} and {person}
Output: Dead Person

Input {swimming} combines {shark}
Output: null

Input: {Construction Corp.} combines {brick} and {glass}
Output: Wall

Input: {Construction Corp.} combines {beef} and {pastry}
Output: null

Input: {cow} combines {grass}
Output: manure

Input: {cow} combines {farmer}
Output: null

Input: {farmer} combines {cow}
Output: milk

Prefer concrete objects as answers instead of concepts or abstractions
Input: {burger} combines {sold}
Bad Output: Profit 
Good Output: Money

Input: {sell} combines {burger}
Bad Output: Transaction
Good Output: Money

Input: {Obama} combines {Party Alignment} and {California}
Good Output: Strong Endorsement

When the combiner is sufficiently abstract, if the combination is a stretch, return null instead.

Input: {Party Alignment} combines {Obama} and {California}
Bad output: Democratic Support
Good output: null
`

export const infiniteCraftPrompt = `
We are creating new recipes for a crafting game on the fly. Follow the pattern and use your creativity to complete the recipes. 

The answer should only be one line in the format Input1|Input2|Result. Absolutely under no circumstances break this format in your answer.

Make sure the Result is a terse noun no more than three words long.


Here are some examples
Water|Plant|Swamp
Fire|Steam|Engine
Wind|Volcano|Eruption
Earth|Dust|Planet
Tornado|Tornado|Hurricane
Tornado|Dust|Dust Storm
Water|Ash|Puddle
Water|Lily|Pond
Fire|Ash|Phoenix
Wind|Dandelion|Seed
Steam|Planet|Steampunk
Wave|Tree|Surfboard
Plant|Stone|Fossil
Plant|Avalanche|Snowman
Volcano|Tsunami|Earthquake
Volcano|Mountain Range|Yellowstone
Dust|Engine|Vacuum
Dust|Ash|Cinder
Mountain|Sand|Pyramid
Swamp|Incense|Mosquito
Dandelion|Fjord|Viking
Sandstorm|Incense|Genie
Water|Allergy|Sneeze
Water|Lotus|Water Lily
Fire|Ship|Cannon
Fire|Smog|Pollution
Fire|Salt|Sodium
Steam|Oasis|Sauna
Steam|Thunder|Thunderstorm
Lake|Meade|Beer
Acid Rain|Yellowstone|Supervolcano
Aeolus|Dinosaur|Pterodactyl
Acid|Berserker|Hulk
Acid|Chemtrail|Chemical
Acid|Duck|Quack
Acid|Sauna|Sweat
Acid|Sodium Acetate|Sodium Acetate Trihydrate
Acid Rain|Cannabis|Bong Water
Hole|Human|Grave
Hole|Marijuana|Pot
Devil|Gold|Rich
SpongeBob|Weed|Spongeweed
Glass|Lagoon|Aquarium
Splash|Superhero|Aquaman
Quagmire|Stone|Squirrel
Mountain Dew|Sour Tea|Mountain Tea
Dandelion Patch|Surfing|Dandelion Surfer
Prince|Swiss Cheese|Swiss Prince
Pencil|Spongebob|DoodleBob
Ship|Wet Paper|Paper Boat
Acid Warfare|Brick|TNT
Dinosaur|Wedding|Bride
Fighter|Mountain Dew|Mountain Man
Frankenfish|Pineapple|Pineapplefish
Mutant|Wheel|Monster Truck
Eclipse|Saturn|Cassini
Brick|Honey|Honeycomb
Firefly|Road Runner|Fire Road
Thunderstorm|Troy|Troyan Horse
Engine|Salt|Saltwater
Moby Dick|Piranha|Whale Shark
Epiphany|Thanos|Infinity Gauntlet
Iceberg|Telescope|Ice Cube
Planet|Sour Soup|Pluto
Fireball|Statue Of Liberty|Liberty Bell
Green Tea|SpongeBob SquarePants|Sponge Tea
Chemist|Farm|Alchemist
Lagoon|Pollution|Dead Fish
Candle|Farmer|Wax
Burning Bush|Window|Fireplace
Skeleton|Sour Sub|Skull
Crack|Gnome|Gnomercy
Fog|Prayer|Priest
Squirrel|Trade Winds|Nut
Commandments|Ice Age|Ice Commandments
Cinder|Iron|Steel
Blizzard|Health|Frostbite
Troll|Werewolf|Were-Troll
Evil Queen|Fire|Evil Witch
Galileo|Statue|Pendulum
Autumn|Sulfur|Fall
Rover|Scent|Dog
Jupiter|Photographer|Astrologist
Poison Ivy|Titanium|Titanium Dioxide
Hula Hoop|Sneeze|Hula Sneeze
Parting|Steamroller|Road
Sodium Acetate Trihydrate|Titanium|Sodium Titanate
Dandelion Patch|Sour Ale|Dandelion Wine
Air Force One|Hail|Air Force None
Soggy|Toxic Fairy|Swamp Fairy
Ammonia|Venom|Cleaner
Pirate|Sky|Pirate Ship
Crab|Wine|Crabs
Nymph|Odyssey|Calypso
Dust Bowl|Table|Dinner
Flat Earth|Train|Flat Train
Mutant Fish|Road Runner|Mutant Road Runner
God|Hot Tub|Jacuzzi
Michelangelo|Tumbleweed|Sistine Chapel
Hipster|Ring|Hobbit
Dust Colada|Tumbleweed|Dusty
Evil Balloon|Flying Fish|Evil Flying Fish
Caveman|Wind|Flute
Hay Fever|Mushroom|Shiitake
Evil Balloon|Vaporizer|Evil Gas
Camel|Priest|Caravan


Try this one
Man|Tree|?
Sure! Here is a recipe for a Man: Input: Water Output: Tree

No, the correct answer in Man|Tree|Wood

Don't comment on the correction just provide the right answer in the correct format:
X|Y|Z`
