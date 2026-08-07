/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: bun run cards:build
 *
 * Source: agricolacards.com community database, base-game decks only.
 * 337 cards — 181 occupations, 146 minor
 * improvements, 10 major improvements. 46 have effects the
 * engine applies automatically; the rest are dealt and scored, with their
 * ongoing text applied by the players.
 */

import type { Card } from './types'

export const CARDS: Card[] = [
  {
    "id": "occupation-academic",
    "title": "Academic",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "This card counts as 2 Occupations for Minor Improvements and when scoring the \"Reeve\" Occupation card.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-acrobat",
    "title": "Acrobat",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Traveling Players\" action on an Action space, after all of the other players have finished their turns you may move that person to a free \"Plow\" or \"Take 1 Grain\" Action space and take the action.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-adoptive-parents",
    "title": "Adoptive Parents",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you take a \"Family growth\" action, you can pay 1 Food to immediately place the offspring in you hut. This allows you to take an action with it this round. If you do this, the offspring does not count as \"newborn\".",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-alms",
    "title": "Alms",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "When you play this card, take 1 Food for each completed round of the game.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-animal-breeder",
    "title": "Animal Breeder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you fence unused spaces to create at least one new pasture, you can buy a pair of animals: 2 Sheep for 1 Food, 2 Wild boar for 2 Food, or 2 Cattle for 3 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-animal-dealer",
    "title": "Animal Dealer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use one of the \"Sheep\", \"Wild boar\" or \"Cattle\" Action spaces, you can pay 1 Food to take 1 additional animal of that type. (The \"Sheep\", \"Wild boar\" and \"Cattle\" cards are added in Stages 1,3, and 4.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-animal-feed",
    "title": "Animal Feed",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Immediately before scoring, you receive 1 additional animal of each type that you already have, if you have space in your pastures. (This does not apply to the House Goat and the Horse.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-animal-handler",
    "title": "Animal Handler",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 1 Sheep on the space for Round 7, 1 Wild boar on Round 10, and 1 Cattle on Round 14. At the start of these rounds, you can buy the animal for 1 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-animal-keeper",
    "title": "Animal Keeper",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can keep Sheep, Wild boar, and Cattle in the same pasture. This applies to all your pastures (except the Forest Pasture).",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-animal-tamer",
    "title": "Animal Tamer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can keep 1 animal in each room of your home. You may keep more than 1 type of animal in your home.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-animal-trainer",
    "title": "Animal Trainer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you take food from a \"Traveling Players\" space, you may immediately use it to buy animals: Pay 2 Food for each Sheep or Wild Boar and 3 Food for each Cattle.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-animal-yard",
    "title": "Animal Yard",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "On this card you can hold up to 2 animals of you choice. They need not be the same type of animal. (This card does not count as a pasture for scoring.)(This card does not give you animals.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-bakehouse",
    "title": "Bakehouse",
    "type": "minor",
    "cost": [
      {
        "stone": 3
      }
    ],
    "points": 5,
    "text": "Whenever you use the \"Bake bread\" Action, you can use the Bakehouse to convert up to 2 Grain into 5 Food each. When you play this card, you can also take the \"Bake bread\" Action.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 5,
        "limit": 2
      }
    ]
  },
  {
    "id": "occupation-baker",
    "title": "Baker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "During each Harvest, you may Bake bread at the start of the Feeding phase if you have an Improvement with the bread symbol. When you play this card, you may Bake bread as an additional action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-baker-s-kitchen",
    "title": "Baker's Kitchen",
    "type": "minor",
    "cost": [
      {
        "stone": 2
      }
    ],
    "points": 4,
    "text": "Whenever you use the \"Bake bread\" action, you can use the Baker's Kitchen to convert up to 2 Grain into 5 Food each. When you play this card, you can also take the \"Bake bread\" action.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 5,
        "limit": 2
      }
    ]
  },
  {
    "id": "occupation-basin-maker",
    "title": "Basin Maker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "For each Wild boar that you convert into Food, you can place up to 2 Wood from your personal supply on this card. At the end of the game, you receive 1 bonus point for each Wood on this card except the 1st, 4th, 7th and 10th.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-basketmaker",
    "title": "Basketmaker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In each Harvest, the Basketmaker can convert up to 1 Reed to 3 Food.",
    "minPlayers": 4,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "reed",
        "to": "food",
        "rate": 3,
        "limit": 1
      }
    ]
  },
  {
    "id": "minor-beehive",
    "title": "Beehive",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 2 Food on each remaining even-numbered Round space. At the start of these rounds, you take the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 2,
        "rounds": [
          2,
          4,
          6,
          8,
          10,
          12,
          14
        ]
      }
    ]
  },
  {
    "id": "occupation-berry-picker",
    "title": "Berry Picker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use a Family member's action to take Wood, you receive an additional 1 Food.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-boar-breeding",
    "title": "Boar Breeding",
    "type": "minor",
    "cost": [
      {
        "food": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, take 1 Wild boar.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-bookshelf",
    "title": "Bookshelf",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 1,
    "text": "Whenever you play 1 Occupation you receive 3 Food before you pay the costs of the Occupation.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-braggart",
    "title": "Braggart",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you receive 1/3/5/7/9 Bonus points for having 5/6/7/8/9+ Improvements in front of you.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-bread-paddle",
    "title": "Bread Paddle",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you play an Occupation, you may also take the \"Bake bread\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-bread-seller",
    "title": "Bread Seller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 1 Food for the supply for each Grain that is baked whenever any player (including you) Bakes bread. (To Bake, you need a Baking Improvement with the bread symbol.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-brewery",
    "title": "Brewery",
    "type": "minor",
    "cost": [
      {
        "grain": 2,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "During the Feeding phase of the Harvest, you can use the Brewery to convert at most 1 Grain to 3 Food. At the end of the game, you receive 1 Bonus point for your ninth Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-bricklayer",
    "title": "Bricklayer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Pay 1 less Clay for each Improvement and Renovation. Pay 2 less Clay for each Room.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-broom",
    "title": "Broom",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Discard all the remaining Minor Improvements in you hand, and draw 7 new Minor Improvements. You can play 1 more Minor Improvement immediately. (You must pay the costs of the new Improvement and, where appropriate, meet the conditions for playing it.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-brush-maker",
    "title": "Brush Maker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you convert Wild boar to Food, you can choose to place the boar on this card. At the end of the game, you receive 1/2/3 Bonus points for 2/3/4 slaughtered Wild boar.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-brushwood-collector",
    "title": "Brushwood Collector",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You may replace the required Reed with a total of 1 Wood for any Renovation or Extension. (You use brushwood to make the roof.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-brushwood-roof",
    "title": "Brushwood Roof",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Whenever you extend or renovate your home, you can replace 1 or 2 Reed with the same amount of Wood.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-builder-s-trowel",
    "title": "Builder's Trowel",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "You can Renovate your Wooden hut to a Clay hut at any time without using the \"Renovate\" action. (You must still pay for the Renovation.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-businessman",
    "title": "Businessman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Starting Player\" Action space, you can play an additional Minor Improvement or a Major Improvement after you play the Minor Improvement.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-butcher",
    "title": "Butcher",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can change your animals into Food at any time (even without an Improvement with the cooking symbol) Take 1 Food for each Sheep, 2 for each Wild boar and 3 for each Cattle.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-butter-churn",
    "title": "Butter Churn",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Whenever you have Sheep during the Field phase of a Harvest, you receive 1 Food for each third Sheep. Whenever you have Cattle during the Field phase, you receive 1 Food for each second Cattle.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-cabinetmaker",
    "title": "Cabinetmaker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In each Harvest, the Cabinetmaker can convert up to 1 Wood to 2 Food.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "wood",
        "to": "food",
        "rate": 2,
        "limit": 1
      }
    ]
  },
  {
    "id": "occupation-carpenter",
    "title": "Carpenter",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "To extend your home, you need only 3 of the appropriate building resource and 2 Reed for each new room. (For example, if you live in a Wooden hut, you need 3 Wood and 2 Reed.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-cattle-breeder",
    "title": "Cattle Breeder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Your Cattle breed at the end of Round 12, if there is space for the calf. When you play this card, you receive 1 Cattle.",
    "minPlayers": 4,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "cattle": 1
        }
      }
    ]
  },
  {
    "id": "minor-cattle-market",
    "title": "Cattle Market",
    "type": "minor",
    "cost": [
      {
        "sheep": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, return 1 Sheep to the supply and take 1 Cattle.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-cattle-whisperer",
    "title": "Cattle Whisperer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Add 5 and 9 to the current round. Place 1 Cattle on the corresponding Round spaces. At the start of these rounds, you receive the Cattle.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-chamberlain",
    "title": "Chamberlain",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the start of Round 11 (or immediately, if you play this card after the start of Round 11), turn over the Round cards for the remaining rounds. You (and only you) can use these actions immediately; the other players must wait until the appropriate round.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-charcoal-burner",
    "title": "Charcoal Burner",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 1 Food and 1 Wood whenever any player (including you) builds a Baking Improvement with a bread symbol.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-chicken-coop",
    "title": "Chicken Coop",
    "type": "minor",
    "cost": [
      {
        "wood": 2,
        "reed": 1
      },
      {
        "clay": 2,
        "reed": 1
      }
    ],
    "points": 1,
    "text": "Place 1 Food each on the next 8 remaining Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-chief",
    "title": "Chief",
    "type": "occupation",
    "cost": [
      {
        "food": 2
      }
    ],
    "points": 0,
    "text": "At the end of the game, you receive 1 Bonus point for each room in your Stone house. (In total, you receive 3 points per room instead of 2.) Playing this card costs an additional 2 Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "pointsPer",
        "per": "room",
        "points": 1,
        "each": 1
      }
    ]
  },
  {
    "id": "occupation-chief-s-daughter",
    "title": "Chief's Daughter",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If another player plays the \"Chief\" card, you can play this card immediately at no cost. (You can also play it using an Action space in the usual way.) At the end of the game, you receive 3 Bonus points if you have a Stone house, 1 if you have a Clay hut.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-church-warden",
    "title": "Church Warden",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If there are still 1/3/6/9 rounds to play, you immediately receive 1/2/3/4 Wood. At the end of the game, any player who performed actions with at least 5 people in Round 14 receives 3 Bonus points. (A Guest is counted.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-clapper",
    "title": "Clapper",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you use a \"Family growth\" action (or already have a person on that space when you play the Clapper), place 1 additional Grain on any of your fields that already contains at least 1 Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-deliveryman",
    "title": "Clay Deliveryman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 1 Clay on each of the spaces for rounds 6 to 14. At the start of these rounds, you receive the Clay.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "clay",
        "amount": 1,
        "rounds": [
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14
        ]
      }
    ]
  },
  {
    "id": "minor-clay-deposit",
    "title": "Clay Deposit",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "This card is an additional Action space. A player who uses this action must pay you 1 Food and receives 5 Clay. If you use the Clay Deposit yourself, you may choose to take 2 Bonus points instead of the Clay.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-digger",
    "title": "Clay Digger",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Include the \"1 Clay\" Action card from the 3-player game as an additional Clay pit. Immediately place 3 Clay on this card and add 1 Clay at the start of each round. Any player who uses this action must pay you 3 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-firer",
    "title": "Clay Firer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can use the Clay Firer at any time to convert 2/3 Clay to 1/2 Stone.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-hut-builder",
    "title": "Clay Hut Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you live in a Clay hut, place 2 Clay on each of the next 5 Round spaces. At the start of these rounds, you receive the Clay. (If you already live in a Clay hut or a Stone house when you play this card, place the Clay on the Round spaces immediately.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-clay-hut-extension",
    "title": "Clay Hut Extension",
    "type": "minor",
    "cost": [
      {
        "reed": 1,
        "clay": 4
      }
    ],
    "points": 0,
    "text": "When you play this card, immediately extend you Clay hut by 1 room. (The room does not cost anything, but you must pay the cost shown to play this card.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-mixer",
    "title": "Clay Mixer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever one of your people's actions gives you only Clay, you receive 2 additional Clay.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-clay-oven",
    "title": "Clay Oven",
    "type": "major",
    "cost": [
      {
        "clay": 3,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "\"Bake Bread\" action: At most 1 time Grain → 5 Food When you build this improvement, you can immediately take a \"Bake Bread\" action.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 5,
        "limit": 1
      }
    ]
  },
  {
    "id": "minor-clay-path",
    "title": "Clay Path",
    "type": "minor",
    "cost": [
      {
        "clay": 3
      }
    ],
    "points": 1,
    "text": "The player with the most valuable street receives 2 Bonus points when scoring. (The Paved Road that cost 5 Stone is more valuable than this Clay Path which is more valuable than the Wooden Path that costs 1 Wood.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-clay-pit",
    "title": "Clay Pit",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Whenever you use the \"Day Laborer\" Action space, you receive 3 additional Clay.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "onAction",
        "spaceId": "day-laborer",
        "goods": {
          "clay": 3
        }
      }
    ]
  },
  {
    "id": "occupation-clay-plasterer",
    "title": "Clay Plasterer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Renovating you Wooden hut to a Clay hut costs you only 1 Clay and 1 Reed. Each room of you Clay hut costs you 3 Clay and 2 Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-seller",
    "title": "Clay Seller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can use the Clay Seller an any time to convert: 2 Clay to 1 Sheep or 1 Reed, 3 Clay to 1 Wild boar or 1 Stone, and/or 4 Clay to 1 Cattle.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-clay-worker",
    "title": "Clay Worker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use an action to take Wood or Clay, you also receive 1 additional Clay.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-conjurer",
    "title": "Conjurer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Traveling Players\" action on an Action space, you receive 1 Grain in addition to the Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-conservator",
    "title": "Conservator",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can renovate your Wooden hut to a Stone house without first needing to renovate it to a Clay hut.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-constable",
    "title": "Constable",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If there are still 1/3/6/9 rounds to play, you immediately receive 1/2/3/4 Wood. At the end of the game, any player who has no negative points receives 5 Bonus points.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-cook",
    "title": "Cook",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In the Feeding phase of each Harvest, only 2 of your people eat 2 Food each; all others are satisfied with only 1 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-cooking-corner",
    "title": "Cooking Corner",
    "type": "minor",
    "cost": [],
    "points": 3,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 4 Food Sheep: 2 Food Wild boar: 3 Food Cattle: 4 Food Whenever you use the \"Bake bread\" action, you may convert: Grain: 3 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-cooking-hearth",
    "title": "Cooking Hearth",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 3 Food Sheep: 2 Food Wild boar: 3 Food Cattle: 4 Food Whenever you use the \"Bake bread: action, you may convert: Grain: 3 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-copse",
    "title": "Copse",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "When you Sow, you can plant up to 2 Wood on this card as shown. The Wood is treated the same as sown Grain and is harvested during the Field phase. (This card does not count as a Field when scoring.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-corn-profiteer",
    "title": "Corn Profiteer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can convert 1 Grain to 3 Food at any time. Any other player can stop this by paying you 2 Food to buy the Grain for themself. If more than one player offers, you choose one of them.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-corn-sheaf",
    "title": "Corn Sheaf",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "When you play this card, take 1 Grain.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "grain": 1
        }
      }
    ]
  },
  {
    "id": "minor-corn-storehouse",
    "title": "Corn Storehouse",
    "type": "minor",
    "cost": [
      {
        "wood": 2,
        "reed": 2
      },
      {
        "clay": 2,
        "reed": 2
      }
    ],
    "points": 1,
    "text": "Whenever you have empty Fields after the Field phase of the Harvest, you can Sow Grain in them immediately. Place 1 fewer Grain from the Supply on these fields.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-countryman",
    "title": "Countryman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "After all players have placed their Family members, you may move one of your Family members from a \"Take 1 Grain\" or \"Take 1 Vegetable\" Action space to a free \"Sow\" Action space after you have taken the Grain or Vegetable.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-cowherd",
    "title": "Cowherd",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Cattle\" Action space, you receive 1 additional Cattle from the supply. (The \"Take 1 Cattle\" Action is added in Stage 4.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-crooked-plow",
    "title": "Crooked Plow",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      }
    ],
    "points": 0,
    "text": "Once during the game, when you use the \"Plow 1 field\" action, you can Plow 3 fields instead of 1. This does not apply to the \"Plow 1 field and/or Sow\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-dancer",
    "title": "Dancer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Traveling Players\" action on an Action space, you receive at least 4 Food. (If there are 1 to 3 Food are on the space, take Food from the general supply until you total 4 Food.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-dock-worker",
    "title": "Dock Worker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At any time, you can use the Dock Worker to convert 3 Wood to either 1 Clay, 1 Reed or 1 Stone, or to convert 2 Clay, 2 Reed or 2 Stone to 1 other building resource.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-dovecote",
    "title": "Dovecote",
    "type": "minor",
    "cost": [
      {
        "stone": 2
      }
    ],
    "points": 2,
    "text": "Place 1 Food each on the spaces for rounds 10 to 14. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-drinking-trough",
    "title": "Drinking Trough",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "Each pasture (with or without a stable) can hold up to 2 more animals.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-duck-pond",
    "title": "Duck Pond",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 1 Food on each of the next 3 Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 1,
        "rounds": [
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "occupation-educator",
    "title": "Educator",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player plays an Occupation card, you can pay 3 Food to play one yourself. From you 4th Occupation on, this only costs 2 Food. (If you play an Occupation yourself, you cannot use this card to play a second Occupation.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-estate-manager",
    "title": "Estate Manager",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of a 3/4/5 player game, if no player has more animals of any type than you, you receive 2/3/4 Bonus points.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-farm-steward",
    "title": "Farm Steward",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you live in a Clay hut or Stone house, play your next \"Family growth\" action as \"Family growth even without room.\" (Similar to the Round card from Stage 5. All future Family growth is carried out as normal.)(If you use the Stage 2 Family growth space to take this action, you can still play a Minor Improvement afterwards.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-farmer",
    "title": "Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "The next time you build fences, take 1 Wild boar. Each time you build at least 1 fence after that, take 1 Cattle.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-feed-pellets",
    "title": "Feed Pellets",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "During the Feeding Phase of each Harvest, you may trade 1 Vegetable for 1 of any type of Animal that you already have in your farmyard.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-fence-builder",
    "title": "Fence Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you play this card, place one of your fences on an Action space of your choice. If you use an action on the Action space, you can also build fences as an additional action. (From now on, you only have 14 fences available for building.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-fence-deliveryman",
    "title": "Fence Deliveryman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Add 6 and 10 to the current round. Place 4 of your fences on each corresponding Round space. At the start of these rounds, you can pay 2 Food to build all 4 fences immediately. (You may build fewer than 4 fences. You do not need to pay Wood to build the fences.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-fence-overseer",
    "title": "Fence Overseer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Each round, for a cost of 1 Food, you can immediately Fence a pasture of 1 farmyard space around a stable that you just built. You do not need to pay Wood for the fences.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-fencer",
    "title": "Fencer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player builds 1 to 4 fences, you receive 1 Wood from the supply. Whenever another player builds 5 or more fences, you receive 2 Wood. (If you build fences yourself, you receive no benefit.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-field-warden",
    "title": "Field Warden",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can use the \"Take 1 Vegetable\", \"Plow 1 field\" and \"Plow 1 field and/or Sow\" action even if another player has placed a person on the space.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-field-watchman",
    "title": "Field Watchman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Grain\" Action space, you can also Plow up to 1 field.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-field-worker",
    "title": "Field Worker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player Sows one or more fields, you receive 1 Grain in a 3-player game or 1 Food in a 4 or 5 player game.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-fieldsman",
    "title": "Fieldsman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you Sow 1 field, place 2 extra goods from the supply on it. Whenever you Sow 2 fields, place 1 extra good from the supply on each. (If you Sow three or more fields, there is no advantage.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-fish-trap",
    "title": "Fish Trap",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you use the \"Fishing\" Action space or receive Reed from an Action space that provides Reed, you receive 1 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-fisherman",
    "title": "Fisherman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Fishing\" Action space, you can choose to take twice as much Food as is on the space. If you do this, you must give 1 Food each to the Fishing Rod, Raft, Canoe, Fish Trap and Landing Net.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-flagon",
    "title": "Flagon",
    "type": "minor",
    "cost": [
      {
        "clay": 1
      }
    ],
    "points": 0,
    "text": "Whenever the Well is built or upgraded to a Village Well, you receive 4 Food, and the other players receive 1 Food each. (If the Well has already been built, everyone receives the Food when the Flagon is played.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-flail",
    "title": "Flail",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you use the \"Plow 1 field\" or \"Plow 1 field and/or Sow\" actions, you can also take the \"Bake bread\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-foreman",
    "title": "Foreman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the start of the Work phase, you can place 1 Food from the general supply on an Action space of your choice.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-forest-pasture",
    "title": "Forest Pasture",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "This card can hold an unlimited number of Wild boar. (This card does not count as a pasture when scoring.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-forester",
    "title": "Forester",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Sow\" action, you can plant up to a maximum of up 3 Wood on this card, as shown. The Wood is treated the same as sown Grain and is harvested during the Field phase.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-frame-builder",
    "title": "Frame Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In each renovation, you may replace exactly 1 Clay or 1 Stone with 1 Wood. In each extension, you may replace exactly 2 Clay or 2 Stone with 1 Wood.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-gardener",
    "title": "Gardener",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Take Vegetables from the supply and not your Vegetable field whenever you harvest them—you keep the Vegetables on the fields.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-goose-pond",
    "title": "Goose Pond",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 1 Food each on the next 4 remaining Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-grain-cart",
    "title": "Grain Cart",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Grain\" Action space, you receive 2 additional Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-granary",
    "title": "Granary",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      },
      {
        "clay": 3
      }
    ],
    "points": 1,
    "text": "Place 1 Grain each on the spaces for rounds 8,10 and 12. At the start of these rounds, you receive the Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-greengrocer",
    "title": "Greengrocer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Grain\" Action space, you also receive 1 Vegetable.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-greenhouse",
    "title": "Greenhouse",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Add 4 and 7 to the current round and place 1 Vegetable on each corresponding Round space. At the start of these rounds, you can pay 1 Food to take the Vegetable.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-grocer",
    "title": "Grocer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Pile (from bottom to top) 1 Vegetable, Reed, Clay, Wood, Vegetable, Stone, Grain, Reed on this card. At any time, you may buy the top item for 1 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-groom",
    "title": "Groom",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you have a Stone house, you can build 1 stable at the beginning of each round at a cost of 1 Wood. You do not need to place a Family member on an Action space to do this.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-guest",
    "title": "Guest",
    "type": "minor",
    "cost": [
      {
        "food": 2
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive a Guest token, which you may place once in the next round as you would a person.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-guildmaster",
    "title": "Guildmaster",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 4 Wood when you acquire the Joinery or play the Cabinetmaker. When you acquire the Pottery or play the Potter, you receive 4 Clay. When you acquire the Basketmaker's Workshop or play the Basketmaker, you receive 3 Reed. If you have already played any of these cards when you play the Guildmaster, you receive 2 building resources of the appropriate type for each existing card.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-hand-mill",
    "title": "Hand Mill",
    "type": "minor",
    "cost": [
      {
        "stone": 1
      }
    ],
    "points": 0,
    "text": "During the Feeding phase of the Harvest, you can use the Hand Mill to turn either 1 Grain into 2 Food or 2 Grain into 4 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-harrow",
    "title": "Harrow",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Once during the game, when you use the \"Plow 1 field\" or \"Plow 1 field and/or Sow\" action, you can Plow 2 fields instead of 1. Each other player can also do this once during the game, but must pay you 2 Food to do it.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-harvest-helper",
    "title": "Harvest Helper",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the start of the Feeding phase in each Harvest, you can take 1 Grain from 1 field belonging to another player. That player receives 2 Food from the supply.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-head-of-the-family",
    "title": "Head of the Family",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can use any Build room(s) or Family growth Action space, even if another player has already placed a person on it.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-hedge-keeper",
    "title": "Hedge Keeper",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you build at least 1 fence, you can build 3 additional fences without paying any additional Wood. (You can only place fences if they enclose a complete pasture.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-herb-garden",
    "title": "Herb Garden",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 1 Food on each of the next 5 Round spaces. At the start of each round, you receive the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 1,
        "rounds": [
          1,
          2,
          3,
          4,
          5
        ]
      }
    ]
  },
  {
    "id": "occupation-hide-farmer",
    "title": "Hide Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you can pay 1 Food each for any number of unused fields. These do not lose you points in the scoring.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-hobby-farmer",
    "title": "Hobby Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you play this card, take 1 Vegetable that you may Sow immediately if you have an empty plowed field. (You can Sow just this one Vegetable with this extra action.)",
    "minPlayers": 4,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "vegetable": 1
        }
      }
    ]
  },
  {
    "id": "minor-holiday-house",
    "title": "Holiday House",
    "type": "minor",
    "cost": [
      {
        "wood": 3,
        "reed": 2
      },
      {
        "clay": 3,
        "reed": 2
      }
    ],
    "points": 8,
    "text": "In Round 14, you cannot place any Family members. (Playing this card bans you from placing people—including a Guest—in Round 14.) Play this card at the latest during Round 13. (Be prepared to play two Harvests in a row.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-horse",
    "title": "Horse",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "You receive 2 Bonus points for any one type of animal missing from your farm at the end of the game. (The horse replaces this type of animal.)(You still lose the points for the missing animal type.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-house-goat",
    "title": "House Goat",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "In each Feeding phase, you receive 1 Food. Apart from the House Goat, you cannot hold any other animal in your home. (even if you have the Animal Tamer.)(You cannot choose to let the House Goat run free to make room for a different animal in your home.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-house-steward",
    "title": "House Steward",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If there are still 1/3/6/9 rounds to play, you immediately receive 1/2/3/4 Wood. At the end of the game, the player(s) with the most rooms in their home receive 3 Bonus points each.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-hut-builder",
    "title": "Hut Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Play this card during Stage 1. At the start of Round 11, you can extend you hut by 1 room at no cost, as long as you have not yet renovated to a Stone house.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-juggler",
    "title": "Juggler",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Traveling Player\" action on an Action space, you can choose to take twice as much Food as is on the card. If you do this, you must give one Food each to the Magician, Conjurer, Street Musician, Puppeteer, Acrobat, Dancer, Animal Trainer and Storyteller.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-ladder",
    "title": "Ladder",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "You need 1 less Reed to extend or renovate your home or to build the Water Mill, Half-timbered House, Chicken Coop, Holiday Home, Mansion or Corn Storehouse.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-land-agent",
    "title": "Land Agent",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Vegetable\" Action space, you also receive 1 Grain. When you play this card, you receive 1 Vegetable from the supply.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "vegetable": 1
        }
      }
    ]
  },
  {
    "id": "minor-landing-net",
    "title": "Landing Net",
    "type": "minor",
    "cost": [
      {
        "reed": 1
      }
    ],
    "points": 0,
    "text": "Whenever you receive Reed on an Action space, you receive an additional 2 Food. This is reduced to 1 Food if you receive other building resources as well as Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-lasso",
    "title": "Lasso",
    "type": "minor",
    "cost": [
      {
        "reed": 1
      }
    ],
    "points": 0,
    "text": "You can place exactly two people immediately after one another, if at least one of them uses a \"Wild boar\", \"Cattle\" or \"Sheep\" Action space. (This does not apply to the \"Either 1 Sheep and 1 Food or 1 Wild boar...\" Action space from the 5-player game.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-layabout",
    "title": "Layabout",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you have played this card, you may not take part in the next Harvest. (You also do not need to feed your family during that Harvest.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-liquid-manure",
    "title": "Liquid Manure",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Whenever you Sow, place 1 additional Grain or Vegetable from the general supply on your newly planted fields.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-loom",
    "title": "Loom",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "Whenever you have at least 1/4/7 Sheep during the Field phase of a Harvest, you receive 1/2/3 Food. At the end of the game, you receive 1 Bonus point for every 3 Sheep.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-lord-of-the-manor",
    "title": "Lord of the Manor",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you receive 1 bonus point for each scoring category where you have scored the maximum 4 points. (The bonus point is also awarded for 4 fenced stables.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-lover",
    "title": "Lover",
    "type": "occupation",
    "cost": [
      {
        "food": 4
      }
    ],
    "points": 0,
    "text": "When you play this card, immediately carry out a \"Family growth even without room\" action (Similar to the Round card from Stage 5). Playing this card costs you an additional 4 Food.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-lumber",
    "title": "Lumber",
    "type": "minor",
    "cost": [
      {
        "stone": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive 3 Wood.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "wood": 3
        }
      }
    ]
  },
  {
    "id": "occupation-magician",
    "title": "Magician",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use your last person to choose the \"Traveling Players\" action on an Action space, you receive an additional 1 Grain and 1 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-maid",
    "title": "Maid",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you have built a Clay hut, place 1 Food on each remaining Round space. At the start of these rounds, you receive the Food. (If you already have a Clay hut or a Stone house when you play this card, place the Food immediately)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-manservant",
    "title": "Manservant",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you build a Stone house, place 3 Food on each remaining Round space. At the start of these rounds, you receive the Food. (If you already have a Stone house when you play this card, place the Food immediately.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-mansion",
    "title": "Mansion",
    "type": "minor",
    "cost": [
      {
        "wood": 3,
        "clay": 3,
        "reed": 2,
        "stone": 3
      }
    ],
    "points": 0,
    "text": "At the end of the game, you receive 2 Bonus points for each room in your Stone house. (In total, you receive 4 points per room instead of the usual 2 points.)",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "pointsPer",
        "per": "room",
        "points": 2,
        "each": 1
      }
    ]
  },
  {
    "id": "occupation-manufacturer",
    "title": "Manufacturer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you have a Clay hut or a Stone house, the Joiner, Pottery and Basketmaker's Workshop are Minor Improvements for you and their cost is reduced by 2 building resources of your choice.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-manure",
    "title": "Manure",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "At the end of each round that does not end with a Harvest, you can (optionally) take 1 Grain or Vegetable from each of your fields and place it in your personal supply.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-market-crier",
    "title": "Market Crier",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Grain\" Action, you can take an additional 1 Grain and 1 Vegetable. If you do this, the other players each receive 1 Grain from the supply.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-market-woman",
    "title": "Market Woman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you receive Vegetables through a Family member's action or through a Minor Improvement, you receive an additional 2 Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-mason",
    "title": "Mason",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once during the game, at any time after your Stone house reaches at least 4 rooms, you may extend it by 1 room at no cost.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-master-baker",
    "title": "Master Baker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player Bakes bread, you can Bake bread if you have a Baking Improvement with the bread symbol. If you take a Bake action yourself (not using this card), you receive 1 additional Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-master-brewer",
    "title": "Master Brewer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In the Feeding phase of each Harvest, the Master Brewer can convert up to 1 Grain to 3 Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 3,
        "limit": 1
      }
    ]
  },
  {
    "id": "occupation-master-builder",
    "title": "Master Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once during the game, at any time after your home reaches at least 5 rooms, you may extend it by 1 room at no cost.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-master-forester",
    "title": "Master Forester",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Include the \"2 Wood\" Action card from the 3-player game as an additional forest. At the start of each round, place 2 Wood on the card. Any player who uses this action must pay you 2 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-master-shepherd",
    "title": "Master Shepherd",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 1 Sheep on each of the next 3 Round spaces. At the start of these rounds, you receive the Sheep.",
    "minPlayers": 4,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "sheep",
        "amount": 1,
        "rounds": [
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "occupation-meat-seller",
    "title": "Meat Seller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If you have an Oven, you can change your animals into Food an any time. Take 2 Food for each Sheep, 3 for each Wild boar and 4 for each Cattle.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-mendicant",
    "title": "Mendicant",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you can discard up to 2 Begging card without losing points for them.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-merchant",
    "title": "Merchant",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Minor Improvement\" or \"Minor or Major Improvement\" action, you can pay 1 Food to use the action a second time.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-midwife",
    "title": "Midwife",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player has a larger family than you after s/he has offspring, you receive 1 Food. If s/he has at least 2 more Family members that you, you receive 2 Food. (The Food is taken from the supply, not from the other player.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-milking-hand",
    "title": "Milking Hand",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In the Field phase of the Harvest, you receive 1/2/3 Food for having at least 1/3/5 Cattle, without having to give up the Cattle. At the end of the game, you receive 1 Bonus point for every 2 Cattle.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-milking-shed",
    "title": "Milking Shed",
    "type": "minor",
    "cost": [
      {
        "clay": 2,
        "stone": 3
      }
    ],
    "points": 2,
    "text": "In each Harvest, at the beginning of the Field phase, count the total number of Sheep and Cattle in all players' farms. You receive 1 Food for each fifth Sheep and for each third Cattle.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-milking-stool",
    "title": "Milking Stool",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you have at least 1/3/5 Cattle during the Field phase of a Harvest, you receive 1/2/3 Food. At the end of the game, you receive 1 bonus point for every 2 Cattle.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-moldboard-plow",
    "title": "Moldboard Plow",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Twice during the game, when you use the \"Plow 1 field\" action, you may Plow 2 fields instead of 1. This does not apply to the \"Plow 1 field and/or Sow\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-mushroom-collector",
    "title": "Mushroom Collector",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use a Family member's action to take Wood from an Action space, you can leave 1 of the Wood on the space and take 2 Food in exchange.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-net-fisherman",
    "title": "Net Fisherman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If one of your people uses an Action space that provides Reed, you can take all the Food markers from the \"Fishing\" space in the Returning home phase. (Phase 4).",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-organic-farmer",
    "title": "Organic Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you receive 1 Bonus point for each pasture that contains at least 1 animal, but could contain at least 3 more animals than it does. (This also applies to the Forest Pasture.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-outrider",
    "title": "Outrider",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the most recent Round card with one of your people, you receive 1 additional Grain.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-ox-team",
    "title": "Ox Team",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      }
    ],
    "points": 1,
    "text": "When you play this card, count how many complete rounds are left to be played. You can Plow this many Fields, up to a maximum of 3.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-pastor",
    "title": "Pastor",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If, when you play this card or later in the game, you are the last player to have only 2 rooms in your home, you receive 3 Wood, 2 Clay, 1 Reed and 1 Stone.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-patron",
    "title": "Patron",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In the future, whenever you play an Occupation, you receive 2 Food before you pay the costs of the Occupation.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-paved-road",
    "title": "Paved Road",
    "type": "minor",
    "cost": [
      {
        "stone": 5
      }
    ],
    "points": 2,
    "text": "The player with the most valuable street receives 2 Bonus points when scoring. (This Paved Road is more valuable than the Clay Path that costs 3 Clay which is more valuable than the Wooden Path that costs 1 Wood.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-pelts",
    "title": "Pelts",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "For each Animal that you slaughter and return to the general supply, you may place 1 Food from your personal supply in 1 of your rooms. You may have a maximum of 1 Food in each room. You cannot use these Food any more, but each is worth 1 Bonus point at the end of the game.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-perpetual-student",
    "title": "Perpetual Student",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you play an Occupation card, you can ask another player to randomly draw one of your cards instead of choosing one yourself. If you do this, you receive 3 Food before you pay the costs of the card, but you must play the card that the other player draws. if you are unable to pay the costs of the card, you must draw Begging cards for any missing Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-pieceworker",
    "title": "Pieceworker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you receive Wood, Clay, Reed, Stone or Grain on an Action space, you can buy one more of the same good for 1 Food. Whenever you receive Vegetable(s) on an Action space, you can buy one more for 2 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-pig-breeder",
    "title": "Pig Breeder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Your Wild boar breed at the end of Round 12, if there is room for the piglet. When you play this card, you receive 1 Wild boar.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-pig-catcher",
    "title": "Pig Catcher",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use a person to take Wood that is on an Action space, you can leave 2 of the Wood on the space and take a Wild boar instead.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-pig-whisperer",
    "title": "Pig Whisperer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Add 4,7 and 10 to the current round and place 1 Wild boar on each corresponding Round space. At the start of these rounds, you receive the Wild boar.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-planter-box",
    "title": "Planter Box",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Whenever you Sow, each of the fields you Sow that is orthogonally adjacent to a room in your home gets an additional 2 Grain or 1 Vegetable.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-plow-driver",
    "title": "Plow Driver",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you have a Stone house, you can pay 1 Food at the start of each round to Plow (at most) 1 field.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-plow-maker",
    "title": "Plow Maker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use either the \"Plow 1 field\" or \"Plow 1 field and/or Sow\" Action spaces, you can pay 1 Food to Plow 1 additional field.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-plowman",
    "title": "Plowman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Add 4,7, and 10 to the current round and place 1 field on each corresponding Round space. At the start of these rounds, you can Plow that 1 field by paying 1 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-potter",
    "title": "Potter",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In each Harvest, the Potter can convert up to 1 Clay to 2 Food.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "clay",
        "to": "food",
        "rate": 2,
        "limit": 1
      }
    ]
  },
  {
    "id": "minor-punner",
    "title": "Punner",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever another player uses the Harrow or a Plow, you can immediately Plow 1 field as well. (If you use the Harrow or a Plow yourself, you do not get any advantage.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-puppeteer",
    "title": "Puppeteer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player chooses the \"Traveling Players\" action on an Action space, you can pay 1 Food to play an Occupation.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-quarry",
    "title": "Quarry",
    "type": "minor",
    "cost": [],
    "points": 2,
    "text": "Whenever you use the \"Day Laborer\" Action, you receive an additional 3 Stone.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-quarryman",
    "title": "Quarryman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can use the Quarryman at any time to convert Stone to Food. For each Stone you convert, take 2 Food.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-rake",
    "title": "Rake",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "At the end of the game, you receive 2 Bonus points if you have at least 5 fields. If you have played the Harrow, Punner, Yoke or a Plow, you require at least 6 fields.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-rancher",
    "title": "Rancher",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever, at the start of a round, you have fewer unused farmyards than any of the other players, you receive 1 Wood. (If there is a tie, you get nothing.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-ratcatcher",
    "title": "Ratcatcher",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In rounds 10 and 12, all other players may not place 1 of their family's Offspring* (if they have any).(You yourself may place all your Family members.)This card may only be played until the end of Round 9. (*) Offspring are a player's 3rd, 4th, and 5th Family members.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-reed-buyer",
    "title": "Reed Buyer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever Reed is taken for the first time in a round, you may give the player who takes it 1 Food in exchange for 1 of the Reed. The other player receives an additional 1 Food from the supply as compensation. (The other player cannot refuse this exchange.)(If you are the first person to take Reed in a round, you do not get any advantage from the Reed Buyer.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-reed-collector",
    "title": "Reed Collector",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 1 Reed on each of the next 4 Round spaces. At the start of these rounds, you receive the Reed.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "reed",
        "amount": 1,
        "rounds": [
          1,
          2,
          3,
          4
        ]
      }
    ]
  },
  {
    "id": "minor-reed-exchange",
    "title": "Reed Exchange",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      },
      {
        "clay": 2
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive 2 Reed.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "reed": 2
        }
      }
    ]
  },
  {
    "id": "minor-reed-hut",
    "title": "Reed Hut",
    "type": "minor",
    "cost": [
      {
        "wood": 1,
        "reed": 4
      }
    ],
    "points": 1,
    "text": "Place one Family member token that you have not yet brought into the game onto this card, where it will live for the rest of the game. It can be used to take actions (starting from the round when you play this card) and must be fed, but it is not worth any points while living in the Reed Hut. (You can move this person into your home later, using a \"Family growth\" action.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-reeve",
    "title": "Reeve",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Take 1/2/3/4 Wood if there are still 1/3/6/9 rounds to play. At the end of the game, all players with the most played Occupation cards receive 3 Bonus points each.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-renovator",
    "title": "Renovator",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Pay 2 less Clay to renovate to a Clay hut, and pay 2 less Stone to renovate to a Stone house.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-resource-seller",
    "title": "Resource Seller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Pile (from bottom to top) 1 Stone, Clay, Stone, Clay, Reed, Clay, Wood on this card. You receive the top marker when you receive that type of building resource.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-riding-plow",
    "title": "Riding Plow",
    "type": "minor",
    "cost": [
      {
        "wood": 4
      }
    ],
    "points": 0,
    "text": "Twice during the game, when you use either the \"Plow 1 field\" or \"Plow 1 field and/or Sow\" action, you can Plow 3 fields instead of 1.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-sawhorse",
    "title": "Sawhorse",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "The next stable you place in your farmyard, as well as your 3rd, 6th, 9th, 12th, and 15th fence, costs you nothing. (You can only place fences if they enclose a complete pasture.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-sawmill",
    "title": "Sawmill",
    "type": "minor",
    "cost": [],
    "points": 3,
    "text": "Each Harvest, you may convert up to 1 Wood to 3 Food. At the end of the game, you receive 1/2/3 Bonus points for 2/4/5 Wood. (A repurchased Joinery does not give any additional Bonus points, but can be used to convert an additional 1 Wood each Harvest.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-schnaps-distiller",
    "title": "Schnaps Distiller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In the Feeding phase of each Harvest, you can convert up to 1 Vegetable to 5 Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "vegetable",
        "to": "food",
        "rate": 5,
        "limit": 1
      }
    ]
  },
  {
    "id": "minor-schnaps-distillery",
    "title": "Schnaps Distillery",
    "type": "minor",
    "cost": [
      {
        "vegetable": 1,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "During the Feeding phase of the Harvest, you can use the Schnaps Distillery to convert at most 1 Vegetable into 4 Food. At the end of the game, you receive 1 Bonus point each for your 5th and 6th Vegetables.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-scholar",
    "title": "Scholar",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you have a Stone house, at the start of a round, you can always either pay 1 Food to play an Occupation card or play an Improvement card by paying its costs.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-seasonal-worker",
    "title": "Seasonal Worker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Day Laborer\" Action space, you receive 1 additional Grain. From Round 6, you can choose to receive 1 Vegetable instead.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-seed-seller",
    "title": "Seed Seller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Grain\" Action space, you receive 1 additional Grain. When you play this card, you receive 1 Grain.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "grain": 1
        }
      }
    ]
  },
  {
    "id": "occupation-serf",
    "title": "Serf",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Sow and/or Bake bread\" action, you receive 1 Grain before taking the action. Alternatively, you can exchange 1 Grain for 1 Vegetable",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-sheep-farmer",
    "title": "Sheep Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you take Sheep with one of your people, you receive an additional Sheep from the supply. You can exchange 3 Sheep for 1 Cattle and 1 Wild boar at any time (except during the breeding phase.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-sheep-whisperer",
    "title": "Sheep Whisperer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Add 4,7,9 and 11 to the current round and place 1 Sheep on each corresponding Round space. At the start of these rounds, you receive the Sheep.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-shepherd",
    "title": "Shepherd",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "During each Harvest, if you have at least 4 Sheep during the Breeding phase, you receive 2 lambs instead of 1 as long as you have room for them.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-shepherd-boy",
    "title": "Shepherd Boy",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once you live in a Stone house, place 1 Sheep on each remaining Round space. At the start of these rounds, you receive the Sheep. (If you already live in a Stone house, place the Sheep immediately.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-slaughterhouse",
    "title": "Slaughterhouse",
    "type": "minor",
    "cost": [
      {
        "clay": 2,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "Whenever another player turns 1 or more animals into Food, you receive 1 Food from the supply. During the Feeding phase of the Harvest, you are the last player to take a turn (so you can benefit if others players slaughter.)(If you slaughter, you receive no advantage.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-slaughterman",
    "title": "Slaughterman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player converts animals to Food, you receive 1 Food from the supply. In the Feeding phase, you are the last player to feed your family (so you can benefit if other players slaughter.)(If you slaughter, you receive no additional Food.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-sleeping-corner",
    "title": "Sleeping Corner",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 1,
    "text": "You can use any \"Family growth\" Action space, even if another player has already placed a person there.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-smallholder",
    "title": "Smallholder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Your pastures that can hold up to 2 animals can hold 3 animals. Also, while you have at most 2 Fields, add 1 extra Grain or Vegetable when you Sow.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-social-climber",
    "title": "Social Climber",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you are the first player to renovate to a Clay hut or a Stone house, you receive 3 Stone. If you are the second, you receive 2 Stone, the third, you receive 1 Stone. (This is not given for renovations performed before you played this card.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-spindle",
    "title": "Spindle",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you have 3/5 Sheep during the Field phase of a Harvest, you receive 1/2 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-spinney",
    "title": "Spinney",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 1,
    "text": "Whenever another player uses the \"3 Wood\" Action space, s/he must give you one of the Wood. (This does not apply to the \"4 Wood\" Action space in the 5-player game.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-spit-roast",
    "title": "Spit Roast",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you convert at least 1 animal to Food during the Feeding phase of the Harvest, you receive 1 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-stable",
    "title": "Stable",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, immediately build 1 stable. (The stable does not cost anything, but you must pay the cost shown to play this card.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-stablehand",
    "title": "Stablehand",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you build at least 1 fence, you also receive 1 stable which you must build immediately. (This may be built inside or outside the fenced area.)(You do not need to pay any Wood for the stable.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-stablemaster",
    "title": "Stablemaster",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "One (and only one) of your unfenced stables may hold up to 3 animals of the same type.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-stockman",
    "title": "Stockman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 1 Cattle when you build your second stable, 1 Wild boar when you build your third and 1 Sheep when you build your fourth. (If you build several stables at once, you my be entitled to take several animals as well.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-stone-breaker",
    "title": "Stone Breaker",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At any time, you can Renovate your Clay hut to a Stone house without using the \"Renovation\" Action space. (You must still pay the costs of the renovation.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-stone-buyer",
    "title": "Stone Buyer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever Stone is taken for the first time in a round, you may give the player who takes it 1 Food in exchange for 1 of the Stone. The other player receives an additional 1 Food from the supply. (The other player cannot refuse this exchange.)(If you are the first player to take Stone in a round, you do not get any advantage from the Stone Buyer.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-stone-carrier",
    "title": "Stone Carrier",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you take Stone with an action, you can also take 1 additional Stone. If you also receive other building resources, this costs you 1 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-stone-cart",
    "title": "Stone Cart",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Place 1 Stone on each remaining even-numbered Round space. At the start of these rounds, you receive the Stone.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "stone",
        "amount": 1,
        "rounds": [
          2,
          4,
          6,
          8,
          10,
          12,
          14
        ]
      }
    ]
  },
  {
    "id": "occupation-stone-carver",
    "title": "Stone Carver",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In each Harvest, the Stone Carver can convert up to 1 Stone to 3 Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "stone",
        "to": "food",
        "rate": 3,
        "limit": 1
      }
    ]
  },
  {
    "id": "occupation-stonecutter",
    "title": "Stonecutter",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "All Improvements, Rooms and Renovations cost 1 Stone less.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "discount",
        "good": "stone",
        "amount": 1,
        "applies": "both"
      }
    ]
  },
  {
    "id": "minor-stone-exchange",
    "title": "Stone Exchange",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      },
      {
        "clay": 2
      }
    ],
    "points": 0,
    "text": "When you play this card, take 2 Stone.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "stone": 2
        }
      }
    ]
  },
  {
    "id": "minor-stone-house-extension",
    "title": "Stone House Extension",
    "type": "minor",
    "cost": [
      {
        "reed": 1,
        "stone": 3
      }
    ],
    "points": 0,
    "text": "When you play this card, immediately extend your Stone house by 1 room. (The room does not cost anything, but you must pay the cost shown to play this card.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-stone-oven",
    "title": "Stone Oven",
    "type": "major",
    "cost": [
      {
        "clay": 2,
        "stone": 3
      }
    ],
    "points": 3,
    "text": "\"Bake Bread\" action: Up to 2 times Grain → 4 Food When you build this improvement, you can immediately take a \"Bake Bread\" action.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 4,
        "limit": 2
      }
    ]
  },
  {
    "id": "occupation-storehouse-clerk",
    "title": "Storehouse Clerk",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you have at least 5 Stone at the start of a round, you receive 1 extra Stone. If you have at least 6 Reed, you receive 1 Reed. If you have at least 7 Clay, you receive 1 Clay. If you have at least 8 Wood, you receive 1 Wood.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-storehouse-keeper",
    "title": "Storehouse Keeper",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use a Family member's action to take Reed and Stone, you also receive your choice of 1 Clay or 1 Grain.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-storyteller",
    "title": "Storyteller",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Traveling Players\" action on an Action space, you can leave 1 Food on the space and take 1 Vegetable instead.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-straw-thatched-roof",
    "title": "Straw-thatched Roof",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "You no longer need Reed when you extend or renovate your home.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-strawberry-patch",
    "title": "Strawberry Patch",
    "type": "minor",
    "cost": [],
    "points": 2,
    "text": "Place 1 Food on each of the next 3 Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 1,
        "rounds": [
          1,
          2,
          3
        ]
      }
    ]
  },
  {
    "id": "occupation-street-musician",
    "title": "Street Musician",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 1 Grain whenever another player takes the \"Traveling Players\" action on an Action space.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-swan-lake",
    "title": "Swan Lake",
    "type": "minor",
    "cost": [],
    "points": 2,
    "text": "Place 1 Food each on the next 5 remaining Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-swineherd",
    "title": "Swineherd",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Wild boar\" Action space, you receive 1 additional Wild Boar from the supply. (The \"Take 1 Wild Boar\" Action is added in Stage 3.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-swing-plow",
    "title": "Swing Plow",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      }
    ],
    "points": 0,
    "text": "Twice during the game, when you use the \"Plow 1 field\" action, you can Plow 3 fields instead of 1. The Swing Plow cannot be used with the \"Plow 1 field and/or Sow\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-sycophant",
    "title": "Sycophant",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Any other player that uses the \"Take 1 Grain\" Action space must first pay you 1 Food. In addition, you receive 1 Food from the supply, even when you take the Grain yourself.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-tanner",
    "title": "Tanner",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you convert Wild boar or Cattle to Food, you can choose to place them on this card. At the end of the game, you receive 1/2/3 Bonus points for 2/4/6 slaughtered Wild boar as well as for 2/3/4 Cattle.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-taster",
    "title": "Taster",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player is the Starting player, you can pay him/her 2 Food at the start of the round and be the first to place a Family member. After that, play starts with the Starting player as usual. (If you are the Starting player, you do not get any advantage.)",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-tavern",
    "title": "Tavern",
    "type": "minor",
    "cost": [
      {
        "wood": 2,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "The Tavern is an additional Action space. Whenever another player uses it, s/he receives 3 Food. Whenever you use it, you can choose either to take 3 Food or to score 2 Bonus points. (If another player uses the Tavern, you do not receive anything from it.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-tenant-farmer",
    "title": "Tenant Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You immediately receive a loan of one of each type of animal. Before scoring, return the 3 animals. For each animal that you cannot or do not want to return, you lose 1 point.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-thatcher",
    "title": "Thatcher",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Pay 1 Reed less to Build each room, for each Renovation, and for each of the Water Mill, Half-timbered House, Chicken Coop, Holiday Home, Mansion and Corn Storehouse.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-threshing-board",
    "title": "Threshing Board",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "Whenever you use the \"Plow 1 field\" or \"Plow 1 field and/or Sow\" actions, you can also take the \"Bake bread\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-tinsmith",
    "title": "Tinsmith",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can convert Clay into Food at any time. You receive 1 Food per Clay. If any player has build a Well (including the Village Well), you receive 3 Food for every 2 Clay.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-traveling-salesman",
    "title": "Traveling Salesman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you select the \"Minor Improvement\" action on an Action space, you can play a Major instead of a Minor Improvement. If you select the \"Major or Minor Improvement\" action, you can play 2 Minor Improvements.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-turner",
    "title": "Turner",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At any time, you can use the Turner to convert any number of Wood to 1 Food each.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-turnip-field",
    "title": "Turnip Field",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "When you Sow, you can plant Vegetables on this card as you would on a field. When you play this card, you can also take the \"Sow\" action. (This card does not count as a field when scoring.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-turnwrest-plow",
    "title": "Turnwrest Plow",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      }
    ],
    "points": 0,
    "text": "Once during the game, when you use either \"Plow 1 field\" or \"Plow 1 field and/or Sow\" action, you can Plow 3 fields instead of 1.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-tutor",
    "title": "Tutor",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you receive 1 Bonus point for each Occupation that you play after this one.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-undergardener",
    "title": "Undergardener",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you use the \"Day Laborer\" Action space, you also receive 1 Vegetable.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-veterinarian",
    "title": "Veterinarian",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you play this card, place 4 Sheep, 3 Wild boar and 2 Cattle in a container. At the start of each round, draw two animals. If they are the same, keep one. Return the 1 or 2 animals to the container.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-village-elder",
    "title": "Village Elder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "If there are still 1/3/6/9 rounds to play, you immediately receive 1/2/3/4 Wood. At the end of the game, all players with the most played Improvements receive 3 Bonus points each.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-village-well",
    "title": "Village Well",
    "type": "minor",
    "cost": [],
    "points": 5,
    "text": "Place 1 Food each on the next 3 remaining Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-water-carrier",
    "title": "Water Carrier",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Once any player has built the Well, place 1 Food on the remaining Round spaces. At the start of these rounds, you receive the Food. (If the Well has already been built, place the Food immediately.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-water-mill",
    "title": "Water Mill",
    "type": "minor",
    "cost": [
      {
        "wood": 1,
        "clay": 2,
        "reed": 1,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "After the Field phase of a Harvest, each player can use the Water Mill to convert up to 1 Grain to 3 Food. Each player that uses the Water Mill must give you 1 of the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 3,
        "limit": 1
      }
    ]
  },
  {
    "id": "occupation-weaver",
    "title": "Weaver",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you have at least 2 Sheep at the start of the Work phase, you receive 1 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-weekly-market",
    "title": "Weekly Market",
    "type": "minor",
    "cost": [
      {
        "grain": 3
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive 2 Vegetables.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "vegetable": 2
        }
      }
    ]
  },
  {
    "id": "occupation-well-builder",
    "title": "Well Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "For you, the Well is not a Major but a Minor Improvement and costs only 1 Stone and 1 Wood to build.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-wet-nurse",
    "title": "Wet Nurse",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you Build room(s), you may grow your family by up to the number of rooms that you build. This costs 1 Food per person. (The newborns are only available to take actions in the next round.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-wildlife-reserve",
    "title": "Wildlife Reserve",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "This card can hold up to 1 Sheep, 1 Wild boar and 1 Cattle. (This card does not count as a pasture when scoring.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-wood-buyer",
    "title": "Wood Buyer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever another player receives Wood from an action, you can buy 1 Wood from him/her for 1 Food (even without his/her agreement.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-wood-cart",
    "title": "Wood Cart",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      }
    ],
    "points": 0,
    "text": "Whenever you use a person to take Wood that is on an Action space, you receive 2 additional Wood.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-wood-carver",
    "title": "Wood Carver",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "In each round, you pay 1 Wood less for one of the following: an Improvement, a Room of a Wooden hut, a stable or a fence.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-wood-collector",
    "title": "Wood Collector",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 1 Wood on each of the next 5 Round spaces. At the start of these rounds, you receive the Wood.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "wood",
        "amount": 1,
        "rounds": [
          1,
          2,
          3,
          4,
          5
        ]
      }
    ]
  },
  {
    "id": "occupation-wood-deliveryman",
    "title": "Wood Deliveryman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 1 Wood on each remaining space for rounds 8 to 14. At the start of these rounds, you receive the Wood.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "wood",
        "amount": 1,
        "rounds": [
          8,
          9,
          10,
          11,
          12,
          13,
          14
        ]
      }
    ]
  },
  {
    "id": "occupation-wood-distributor",
    "title": "Wood Distributor",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the start of the Work phase, you can distribute the Wood from the \"3 Wood\" Action space as evenly as possible onto the neighboring Clay, Reed and Fishing spaces. When you play this card, you receive 2 Wood.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "wood": 2
        }
      }
    ]
  },
  {
    "id": "occupation-woodcutter",
    "title": "Woodcutter",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 1 additional Wood whenever you use a Family member's action to take Wood.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-wooden-crane",
    "title": "Wooden Crane",
    "type": "minor",
    "cost": [
      {
        "wood": 3
      }
    ],
    "points": 1,
    "text": "Whenever you use one of the \"Stone\" Action spaces that are placed in Stage 2 and 4, you receive 1 additional Stone. If you pay 1 Food, you can take 2 Stone instead of 1.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-wooden-hut-builder",
    "title": "Wooden Hut Builder",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you receive 1 bonus point for each room in your Wooden hut.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "pointsPer",
        "per": "room",
        "points": 1,
        "each": 1
      }
    ]
  },
  {
    "id": "minor-wooden-hut-extension",
    "title": "Wooden Hut Extension",
    "type": "minor",
    "cost": [
      {
        "reed": 1,
        "wood": 5
      }
    ],
    "points": 0,
    "text": "When you play this card, immediately extend your Wooden hut by 1 room. (The room does not cost anything, but you must pay the cost shown to play this card.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-wooden-path",
    "title": "Wooden Path",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "The player with the most valuable street receives 2 Bonus points when scoring. (The Paved Road that costs 5 Stone is more valuable than the Clay Path that costs 3 Clay which is more valuable that this Wooden Path.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-wooden-strongbox",
    "title": "Wooden Strongbox",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "At the end of the game, you get 2 Bonus points if your home contains 5 rooms or 4 Bonus points if you have 6 or more rooms.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-writing-desk",
    "title": "Writing Desk",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 1,
    "text": "Whenever you use an \"Occupation\" Action, you may play 2 Occupations one after another. The second Occupation costs you 2 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-yeoman-farmer",
    "title": "Yeoman Farmer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At the end of the game, you only lose points for Unused spaces and Begging cards.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-yoke",
    "title": "Yoke",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, you can immediately Plow 1 field for each Plow that has been played (by any player) and 1 field for the harrow, if it has been played.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-fireplace",
    "title": "Fireplace",
    "type": "major",
    "cost": [
      {
        "clay": 2
      }
    ],
    "points": 1,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 2 Food Sheep: 2 Food Wild boar: 2 Food Cattle: 3 Food Whenever you use the \"Bake bread\" action, you may convert: Grain: 2 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-fireplace-2",
    "title": "Fireplace",
    "type": "major",
    "cost": [
      {
        "clay": 3
      }
    ],
    "points": 1,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 2 Food Sheep: 2 Food Wild boar: 2 Food Cattle: 3 Food Whenever you use the \"Bake bread\" action, you may convert: Grain: 2 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-cooking-hearth",
    "title": "Cooking Hearth",
    "type": "major",
    "cost": [
      {
        "clay": 4
      }
    ],
    "points": 1,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 3 Food Sheep: 2 Food Wild boar: 3 Food Cattle: 4 Food Whenever you use the \"Bake bread\" action, you may convert: Grain: 3 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-cooking-hearth-2",
    "title": "Cooking Hearth",
    "type": "major",
    "cost": [
      {
        "clay": 5
      }
    ],
    "points": 1,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 3 Food Sheep: 2 Food Wild boar: 3 Food Cattle: 4 Food Whenever you use the \"Bake bread\" action, you may convert: Grain: 3 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-joinery",
    "title": "Joinery",
    "type": "major",
    "cost": [
      {
        "wood": 2,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "In each Harvest, you can use the Joinery to convert at most 1 Wood to 2 Food. At the end of the game, you receive 1/2/3 Bonus points for 3/5/7 Wood.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-pottery",
    "title": "Pottery",
    "type": "major",
    "cost": [
      {
        "clay": 2,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "In each Harvest, you can use the Pottery to convert at most 1 Clay to 2 Food. At the end of the game, you receive 1/2/3 Bonus points for 3/5/7 Clay.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-basketmaker-s-workshop",
    "title": "Basketmaker's Workshop",
    "type": "major",
    "cost": [
      {
        "reed": 2,
        "stone": 2
      }
    ],
    "points": 2,
    "text": "In each Harvest, you can use the Basketmaker's Workshop to convert at most 1 Reed to 3 Food. At the end of the game, you receive 1/2/3 Bonus points for 2/4/5 Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "major-well",
    "title": "Well",
    "type": "major",
    "cost": [
      {
        "wood": 1,
        "stone": 3
      }
    ],
    "points": 4,
    "text": "Place 1 Food each on the next 5 remaining Round spaces. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-field",
    "title": "Field",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "When you play this card, immediately Plow 1 field.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-fishing-rod",
    "title": "Fishing Rod",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you use the \"Fishing\" Action space, you receive 1 additional Food. From Round 8, you receive 2 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-axe",
    "title": "Axe",
    "type": "minor",
    "cost": [
      {
        "wood": 1,
        "stone": 1
      }
    ],
    "points": 0,
    "text": "Whenever you add a room to your Wooden hut, you only pay 2 Wood and 2 Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-baker-s-oven",
    "title": "Baker's Oven",
    "type": "minor",
    "cost": [],
    "points": 3,
    "text": "Whenever you use the \"Bake bread\" action, you can use the Baker's Oven to convert up to 2 Grain into 5 Food each. When you play this card, you can also take the \"Bake bread\" Action.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "convert",
        "from": "grain",
        "to": "food",
        "rate": 5,
        "limit": 2
      }
    ]
  },
  {
    "id": "minor-baking-tray",
    "title": "Baking Tray",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Clay Ovens and Stone Ovens are Minor Improvements for you. Clay, Stone and Wood-fired Ovens cost you 1 building resource (of your choice) less.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-building-material",
    "title": "Building Material",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "You receive either 1 Wood or 1 Clay when you play this card.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-windmill",
    "title": "Windmill",
    "type": "minor",
    "cost": [
      {
        "wood": 3,
        "stone": 1
      }
    ],
    "points": 2,
    "text": "At any time, you can convert Grain to 2 Food (without having to Bake bread.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-bean-field",
    "title": "Bean Field",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "When you Sow, you can plant Vegetables on this card as though it were a field. (This card does not count as a field when scoring.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-gypsy-s-crock",
    "title": "Gypsy's Crock",
    "type": "minor",
    "cost": [
      {
        "clay": 2
      }
    ],
    "points": 1,
    "text": "Whenever you convert any 2 goods to Food at one time using a Fireplace, Cooking Hearth or Cooking Corner, you receive 1 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-simple-fireplace",
    "title": "Simple Fireplace",
    "type": "minor",
    "cost": [
      {
        "clay": 1
      }
    ],
    "points": 1,
    "text": "At any time, you may convert goods to Food as follows: Vegetables: 2 Food Sheep: 1 Food Wild Boar: 2 Food Cattle: 3 Food Whenever you use the \"Bake bread\" action, you may convert: Grain: 2 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-half-timbered-house",
    "title": "Half-timbered House",
    "type": "minor",
    "cost": [
      {
        "wood": 1,
        "clay": 1,
        "reed": 1,
        "stone": 2
      }
    ],
    "points": 0,
    "text": "At the end of the game you receive 1 Bonus point for each room in your Stone house. (In total, you receive 3 points instead of 2 per room.)(If you have played the Mansion, you do not score extra points for having the Half-timbered House.)",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "pointsPer",
        "per": "room",
        "points": 1,
        "each": 1
      }
    ]
  },
  {
    "id": "minor-raft",
    "title": "Raft",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "Whenever you use the \"Fishing\" Action space, you receive an additional 1 Food or 1 Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-manger",
    "title": "Manger",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "At the end of the game, if your pastures occupy 6/7/8/9+ farmyard spaces, you receive 1/2/3/4 Bonus points.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-animal-pen",
    "title": "Animal Pen",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 2 Food on each remaining Round space. At the start of each round, you receive the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 2,
        "rounds": [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14
        ]
      }
    ]
  },
  {
    "id": "minor-spices",
    "title": "Spices",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Whenever you convert Vegetables to Food using a Fireplace, Cooking Hearth or Cooking Corner, you receive 1 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-plane",
    "title": "Plane",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you turn 1 Wood into Food using the Joinery, Sawmill or Cabinetmaker, you receive 1 additional Food. You can choose instead to turn a second Wood into exactly 2 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-wood-fired-oven",
    "title": "Wood-Fired Oven",
    "type": "minor",
    "cost": [
      {
        "wood": 3,
        "stone": 1
      }
    ],
    "points": 2,
    "text": "Whenever you use the \"Bake bread\" action, you can use the Wood-fired Oven to turn any number of Grain into 3 Food each. When you play this card, you can also take the \"Bake bread\" action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-clogs",
    "title": "Clogs",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "At the end of the game, you receive 1 Bonus point for a Clay hut or 2 Bonus points for a Stone house.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-shepherd-s-pipe",
    "title": "Shepherd's Pipe",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "You can hold up to 2 additional Sheep in each of the pastures where you keep Sheep. You can keep up to 2 Sheep in each unfenced stable.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-canoe",
    "title": "Canoe",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 1,
    "text": "Whenever you use the \"Fishing\" Action space, you receive an additional 1 Food and 1 Reed.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "onAction",
        "spaceId": "fishing",
        "goods": {
          "food": 1,
          "reed": 1
        }
      }
    ]
  },
  {
    "id": "minor-carp-pond",
    "title": "Carp Pond",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 1 Food on each remaining odd-numbered Round space. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 1,
        "rounds": [
          1,
          3,
          5,
          7,
          9,
          11,
          13
        ]
      }
    ]
  },
  {
    "id": "minor-potato-dibber",
    "title": "Potato Dibber",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you Sow fields with Vegetables, place 1 additional Vegetable on each field that you Sow.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-ceramics",
    "title": "Ceramics",
    "type": "minor",
    "cost": [
      {
        "clay": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive 2 Food. From now, the Pottery is a Minor Improvement for you and costs you nothing.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "food": 2
        }
      }
    ]
  },
  {
    "id": "minor-basket",
    "title": "Basket",
    "type": "minor",
    "cost": [
      {
        "reed": 1
      }
    ],
    "points": 0,
    "text": "Whenever you use a person's action to take Wood from an Action space, you can leave 2 of the Wood on the Action space and receive 3 Food in exchange.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-corn-scoop",
    "title": "Corn Scoop",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Whenever you use the \"Take 1 Grain\" Action, you receive 1 additional Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-clay-roof",
    "title": "Clay Roof",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "You can replace 1 or 2 Reed with the same amount of Clay whenever you extend or renovate your home.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-clay-supports",
    "title": "Clay Supports",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Whenever you add a room to your Clay hut, you can pay 2 Clay, 1 Wood and 1 Reed instead of 5 Clay and 2 Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-madonna-statue",
    "title": "Madonna Statue",
    "type": "minor",
    "cost": [],
    "points": 2,
    "text": "The Madonna Statue has no effect. (You must remove Improvements that are on the table in front of you. You may not discard cards from your hand. It is irrelevant whether you remove Major or Minor Improvements.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-market-stall",
    "title": "Market Stall",
    "type": "minor",
    "cost": [
      {
        "grain": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive 1 Vegetable.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "vegetable": 1
        }
      }
    ]
  },
  {
    "id": "minor-mini-pasture",
    "title": "Mini Pasture",
    "type": "minor",
    "cost": [
      {
        "food": 2
      }
    ],
    "points": 0,
    "text": "When you play this card, immediately Fence one space in your farmyard. (You do not need to pay Wood for the fences.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-millstone",
    "title": "Millstone",
    "type": "minor",
    "cost": [
      {
        "stone": 1
      }
    ],
    "points": 0,
    "text": "Whenever you Bake 1 or more Grain into bread, you receive 2 additional Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-helpful-neighbors",
    "title": "Helpful Neighbors",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      },
      {
        "clay": 1
      }
    ],
    "points": 0,
    "text": "When you play this card, you receive either 1 Stone or 1 Reed.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-fruit-tree",
    "title": "Fruit Tree",
    "type": "minor",
    "cost": [],
    "points": 1,
    "text": "Place 1 Food on each remaining Round space for rounds 8 to 14. At the start of these rounds, you receive the Food.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "food",
        "amount": 1,
        "rounds": [
          8,
          9,
          10,
          11,
          12,
          13,
          14
        ]
      }
    ]
  },
  {
    "id": "minor-outhouse",
    "title": "Outhouse",
    "type": "minor",
    "cost": [
      {
        "wood": 1,
        "clay": 1
      }
    ],
    "points": 2,
    "text": "The Outhouse has no effect. You can only build it if at least one other player has fewer than 2 Occupations. (It is irrelevant how many Occupations you have played.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-private-forest",
    "title": "Private Forest",
    "type": "minor",
    "cost": [
      {
        "food": 2
      }
    ],
    "points": 0,
    "text": "Place 1 Wood on each remaining even-numbered Round space. At the start of these rounds, you receive the Wood.",
    "minPlayers": 1,
    "enforced": true,
    "effects": [
      {
        "kind": "roundDrip",
        "good": "wood",
        "amount": 1,
        "rounds": [
          2,
          4,
          6,
          8,
          10,
          12,
          14
        ]
      }
    ]
  },
  {
    "id": "minor-acreage",
    "title": "Acreage",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "When you Sow, you can plant 2 Grain fields on this card. (This card does not count as a field when scoring.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-stump-jump-plow",
    "title": "Stump-Jump Plow",
    "type": "minor",
    "cost": [
      {
        "wood": 2
      }
    ],
    "points": 0,
    "text": "Once you live in a Clay hut or Stone house, whenever you use a Family member's action to take Wood you can pay 1 Food to Plow 1 field.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-keg",
    "title": "Keg",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Once all the Family members have been placed in this round, you may place a Guest marker to carry out an additional Action.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-brewer-s-copper",
    "title": "Brewer's Copper",
    "type": "minor",
    "cost": [
      {
        "grain": 1,
        "stone": 1
      }
    ],
    "points": 1,
    "text": "During the Feeding phase of each Harvest, you can use the Brewer's Copper to convert at most 1 Grain to 2 Food. At the end of the game, you receive 1 Bonus point if you have at least 7 Grain.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-bust",
    "title": "Bust",
    "type": "minor",
    "cost": [
      {
        "stone": 1
      }
    ],
    "points": 2,
    "text": "The Bust cannot be carved (this card can not be played) once all other players have 2 or more Occupations. (3 Occupations in a 3-player game, 4 Occupations in a 2-player game).",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-family-portrait",
    "title": "Family Portrait",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Pay 2 Food for each of your Family members, and receive 4 Bonus points. (Write them on the scoring pad).",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-barbecue",
    "title": "Barbecue",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "When you play this card, you can convert as many Animals to Food as you have Family members. For each Sheep, you receive 3 Food, for each Wild boar, 4 and for each Cattle, 5.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-pumpkin-seed-oil",
    "title": "Pumpkin Seed Oil",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Three times during the game (at most once per round), you can place 1 Vegetable on this card and receive 3 Food in exchange. The Vegetable(s) on this card are counted in the scoring at the end of the game.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-maypole",
    "title": "Maypole",
    "type": "minor",
    "cost": [
      {
        "wood": 1
      }
    ],
    "points": 0,
    "text": "Play this card before the end of Round 4. When you play this card, place one of your unbuilt fences upright on an unused farmyard space. If you have not knocked it over by the end of the game, you earn 2 Bonus points. (The farmyard space counts as \"used\".) (If another player knocks it over, you can replace it)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-ranch",
    "title": "Ranch",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "For each Round that has not yet begun when you play this card, you receive 1 Bonus point and 2 Food. (Write the Bonus point(s) on the scoring pad.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-dozing-bull",
    "title": "Dozing Bull",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "As long as you have at least 1 Cattle in your farm, you can knock down your fences and rebuild them at any time, for no cost. (Your animals do not run away.) (Fences must always be placed according to the rules.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-giant-pumpkin",
    "title": "Giant Pumpkin",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Place 1 Vegetable from your own supply on this card. At any time, you can Harvest this Vegetable and convert it to Food. If it is still on the card at the end of the game, you receive 2 Bonus points. (You can count the Vegetable in scoring at the end of the game.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "minor-scarecrow",
    "title": "Scarecrow",
    "type": "minor",
    "cost": [],
    "points": 0,
    "text": "Whenever you Sow, you can pay 1 Wood and Sow 2 Grain instead of 1 on an empty field.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-village-beauty",
    "title": "Village Beauty",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At any time, you can play 3 Food to take a \"Family growth\" action without placing one of your Family members. You must have room in your home. You can use the Newborn to take action from the following round.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-gentleman",
    "title": "Gentleman",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you manage to be the very last player to place a Family member in any round, you receive 1 Food after you take the final action. If you play the Gentleman card with the last Family member to be placed during the current round, you receive 2 Food.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-herald",
    "title": "Herald",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "At any time, you may look at all the remaining unplaced Round cards and re-sort them. (Cards must remain in the appropriate game stage.) When you play this card, you receive 2 Wood.",
    "minPlayers": 3,
    "enforced": true,
    "effects": [
      {
        "kind": "gain",
        "goods": {
          "wood": 2
        }
      }
    ]
  },
  {
    "id": "occupation-cooper",
    "title": "Cooper",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Whenever you or another player receives more than 2 Food from an Action space, you receive 1 Food from the General supply.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-mail-coach-driver",
    "title": "Mail Coach Driver",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "From now until the end of the game, the other players only receive goods from Action spaces when they return their Family members to their home. (This card applies to goods that are on Action spaces as well as goods that are taken from the Supply, but not to goods that are received from cards.)",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-taxidermist",
    "title": "Taxidermist",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you convert Animals to Food, you can place (some of) them on this card instead of returning them to the Supply. The card can hold a maximum of 1 Sheep, 1 Wild boar and 1 Cattle. These animals are counted in scoring.",
    "minPlayers": 4,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-sower",
    "title": "Sower",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You may immediately Sow each Vegetable that you receive outside the Harvest phase and would otherwise place in your Supply.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-seed-trader",
    "title": "Seed Trader",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "Place 2 Grain and 2 Vegetables on this card. You may buy them at any time. Each Grain costs 2 Food, each Vegetable costs 3 Food.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-game-designer",
    "title": "Game Designer",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You can exchange 1 Wood, 1 Clay, 1 Reed and 1 Stone for 2 Food and 1 Bonus point at any time and as often as you like. (Note the Bonus points in the appropriate section of the scoring pad.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-dance-instructor",
    "title": "Dance Instructor",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "You receive 4 Food before you pay the costs of playing this Occupation. Immediately return this card to your hand.",
    "minPlayers": 3,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-cube-cutter",
    "title": "Cube Cutter",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "During the Field phase of each Harvest, you can exchange 1 Wood and 1 Food for 1 Bonus point. (Note the Bonus points in the appropriate section of the scoring pad.)",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  },
  {
    "id": "occupation-mother-of-twins",
    "title": "Mother of Twins",
    "type": "occupation",
    "cost": [],
    "points": 0,
    "text": "When you have Family growth, you can pay 3 Food to bring 2 new Family members instead of 1 into the game. You need only have space for 1 Family member in your home.",
    "minPlayers": 1,
    "enforced": false,
    "effects": []
  }
]

export const OCCUPATIONS = CARDS.filter((card) => card.type === 'occupation')
export const MINOR_IMPROVEMENTS = CARDS.filter((card) => card.type === 'minor')
export const MAJOR_IMPROVEMENTS = CARDS.filter((card) => card.type === 'major')
