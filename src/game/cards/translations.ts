/**
 * Traditional Chinese card text.
 *
 * Hand-translated, keyed by card id. This file is deliberately NOT generated:
 * card rules text is the part players read most closely, and a machine
 * translation that subtly changes a rule is worse than showing English.
 *
 * Cards absent from this map fall back to their English title and text, and
 * the UI marks them so players know the translation is pending. Terminology
 * follows the UI bundle in src/lib/i18n/zh-HK.ts:
 *   木材 wood · 黏土 clay · 蘆葦 reed · 石頭 stone · 穀物 grain · 蔬菜 vegetable
 *   食物 food · 綿羊 sheep · 野豬 boar · 牛 cattle
 *   農場 farm · 牧場 pasture · 馬廄 stable · 房間 room · 田地 field
 *   職業 occupation · 小進步 minor improvement · 主要進步 major improvement
 *   收成 harvest · 回合 round · 家庭成員 family member
 */

export type CardTranslation = {
  title: string
  text: string
}

export const CARD_TRANSLATIONS: Record<string, CardTranslation> = {
  // ---- Major improvements: the ten base-game cards, all translated. ----
  'major-fireplace': {
    title: '壁爐',
    text: '任何時候：將蔬菜換 2 食物、綿羊換 2 食物、野豬換 2 食物、牛換 3 食物。',
  },
  'major-fireplace-2': {
    title: '壁爐',
    text: '任何時候：將蔬菜換 2 食物、綿羊換 2 食物、野豬換 2 食物、牛換 3 食物。',
  },
  'major-cooking-hearth': {
    title: '爐灶',
    text: '任何時候：將蔬菜換 3 食物、綿羊換 2 食物、野豬換 3 食物、牛換 4 食物。',
  },
  'major-cooking-hearth-2': {
    title: '爐灶',
    text: '任何時候：將蔬菜換 3 食物、綿羊換 2 食物、野豬換 3 食物、牛換 4 食物。',
  },
  'major-clay-oven': {
    title: '黏土烤爐',
    text: '「烤麵包」行動：最多可將 1 穀物轉換成 5 食物。',
  },
  'major-stone-oven': {
    title: '石造烤爐',
    text: '「烤麵包」行動：最多可將 2 穀物各轉換成 4 食物。',
  },
  'major-joinery': {
    title: '木工坊',
    text: '任何時候：將 1 木材轉換成 2 食物。計分時，供應區有 3-4 木材得 1 分，5-6 木材得 2 分，7 或以上得 3 分。',
  },
  'major-pottery': {
    title: '陶器坊',
    text: '任何時候：將 1 黏土轉換成 2 食物。計分時，供應區有 3-4 黏土得 1 分，5-6 黏土得 2 分，7 或以上得 3 分。',
  },
  "major-basketmaker-s-workshop": {
    title: '編籃工坊',
    text: '任何時候：將 1 蘆葦轉換成 3 食物。計分時，供應區有 2-3 蘆葦得 1 分，4 蘆葦得 2 分，5 或以上得 3 分。',
  },
  'major-well': {
    title: '水井',
    text: '在接下來 5 個回合的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },

  // ---- Minor improvements with mechanically enforced effects. ----
  'minor-clay-pit': {
    title: '黏土坑',
    text: '每當你使用「打零工」行動格時，額外獲得 3 黏土。',
  },
  'minor-beehive': {
    title: '蜂巢',
    text: '在每個剩餘的偶數回合格上放 2 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-duck-pond': {
    title: '鴨池',
    text: '在接下來 3 個回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-corn-sheaf': {
    title: '麥捆',
    text: '打出此卡時，獲得 1 穀物。',
  },
  'minor-alms': {
    title: '救濟',
    text: '打出此卡時，每完成一個回合獲得 1 食物。',
  },
  'minor-cooking-corner': {
    title: '炊事角',
    text: '任何時候：將蔬菜換 4 食物、綿羊換 2 食物、野豬換 2 食物、牛換 3 食物。',
  },
  'minor-brushwood-roof': {
    title: '柴草屋頂',
    text: '每當你擴建或翻修房屋時，可用等量的木材代替 1 或 2 蘆葦。',
  },

  // ---- Occupations with mechanically enforced effects. ----
  'occupation-stonecutter': {
    title: '石匠',
    text: '所有進步卡、房間與翻修的費用減少 1 石頭。',
  },
  'occupation-basketmaker': {
    title: '編籃匠',
    text: '每次收成時，編籃匠最多可將 1 蘆葦轉換成 3 食物。',
  },
  'occupation-clay-deliveryman': {
    title: '黏土送貨員',
    text: '在第 6 至 14 回合的回合格上各放 1 黏土。這些回合開始時，你獲得該黏土。',
  },
  'occupation-chief': {
    title: '酋長',
    text: '遊戲結束時，你的石屋每個房間額外得 1 分。（合計每個房間 3 分，而非 2 分。）',
  },
  'occupation-conservator': {
    title: '保育員',
    text: '你可以只用 1 木材翻修木屋，不需其他材料。',
  },
  'occupation-brushwood-collector': {
    title: '柴草收集者',
    text: '任何翻修或擴建時，你可用合計 1 木材代替所需的蘆葦。',
  },

  // ---- Immediate gains. ----
  'minor-lumber': {
    title: '木料',
    text: '打出此卡時，獲得 3 木材。',
  },
  'minor-stone-exchange': {
    title: '石頭交易所',
    text: '打出此卡時，獲得 2 石頭。',
  },
  'minor-reed-exchange': {
    title: '蘆葦交易所',
    text: '打出此卡時，獲得 2 蘆葦。',
  },
  'minor-weekly-market': {
    title: '週市集',
    text: '打出此卡時，獲得 2 蔬菜。',
  },
  'minor-market-stall': {
    title: '市集攤位',
    text: '打出此卡時，獲得 1 蔬菜。',
  },
  'minor-ceramics': {
    title: '陶藝',
    text: '打出此卡時，獲得 2 食物。此後陶器坊對你而言視為小進步卡，且不需費用。',
  },
  'occupation-cattle-breeder': {
    title: '養牛人',
    text: '若有空間容納小牛，你的牛在第 12 回合結束時繁殖。打出此卡時，獲得 1 牛。',
  },
  'occupation-hobby-farmer': {
    title: '業餘農夫',
    text: '打出此卡時，獲得 1 蔬菜；若你有已開墾的空田，可立即播種這 1 蔬菜。',
  },
  'occupation-land-agent': {
    title: '土地經紀',
    text: '每當你使用「取得 1 蔬菜」行動格時，同時獲得 1 穀物。打出此卡時，從供應區獲得 1 蔬菜。',
  },
  'occupation-seed-seller': {
    title: '種子商人',
    text: '每當你使用「取得 1 穀物」行動格時，額外獲得 1 穀物。打出此卡時，獲得 1 穀物。',
  },
  'occupation-wood-distributor': {
    title: '木材分配者',
    text: '行動階段開始時，你可將「3 木材」行動格上的木材盡量平均分配到相鄰的黏土、蘆葦與釣魚格上。打出此卡時，獲得 2 木材。',
  },
  'occupation-herald': {
    title: '傳令官',
    text: '任何時候你都可以查看尚未放置的回合卡並重新排序（必須留在對應的階段內）。打出此卡時，獲得 2 木材。',
  },

  // ---- Goods placed on future round spaces. ----
  'minor-herb-garden': {
    title: '香草園',
    text: '在接下來 5 個回合格上各放 1 食物。每個回合開始時，你獲得該食物。',
  },
  'minor-strawberry-patch': {
    title: '草莓園',
    text: '在接下來 3 個回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-animal-pen': {
    title: '畜欄',
    text: '在每個剩餘的回合格上放 2 食物。每個回合開始時，你獲得該食物。',
  },
  'minor-carp-pond': {
    title: '鯉魚池',
    text: '在每個剩餘的奇數回合格上放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-fruit-tree': {
    title: '果樹',
    text: '在第 8 至 14 回合的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-stone-cart': {
    title: '石頭推車',
    text: '在每個剩餘的偶數回合格上放 1 石頭。這些回合開始時，你獲得該石頭。',
  },
  'minor-private-forest': {
    title: '私有林地',
    text: '在每個剩餘的偶數回合格上放 1 木材。這些回合開始時，你獲得該木材。',
  },
  'occupation-master-shepherd': {
    title: '牧羊大師',
    text: '在接下來 3 個回合格上各放 1 綿羊。這些回合開始時，你獲得該綿羊。',
  },
  'occupation-reed-collector': {
    title: '蘆葦採集者',
    text: '在接下來 4 個回合格上各放 1 蘆葦。這些回合開始時，你獲得該蘆葦。',
  },
  'occupation-wood-collector': {
    title: '木材採集者',
    text: '在接下來 5 個回合格上各放 1 木材。這些回合開始時，你獲得該木材。',
  },
  'occupation-wood-deliveryman': {
    title: '木材送貨員',
    text: '在第 8 至 14 回合剩餘的回合格上各放 1 木材。這些回合開始時，你獲得該木材。',
  },

  // ---- Conversions into food. ----
  'minor-bakehouse': {
    title: '麵包坊',
    text: '每當你進行「烤麵包」行動時，可用麵包坊將最多 2 穀物各轉換成 5 食物。打出此卡時，你也可以立即進行一次「烤麵包」行動。',
  },
  'minor-baker-s-kitchen': {
    title: '麵包師廚房',
    text: '每當你進行「烤麵包」行動時，可用麵包師廚房將最多 2 穀物各轉換成 5 食物。打出此卡時，你也可以立即進行一次「烤麵包」行動。',
  },
  'minor-baker-s-oven': {
    title: '麵包師烤爐',
    text: '每當你進行「烤麵包」行動時，可用麵包師烤爐將最多 2 穀物各轉換成 5 食物。打出此卡時，你也可以立即進行一次「烤麵包」行動。',
  },
  'minor-water-mill': {
    title: '水磨坊',
    text: '收成的田地階段之後，每位玩家都可用水磨坊將最多 1 穀物轉換成 3 食物。使用水磨坊的玩家必須給你其中 1 食物。',
  },
  'occupation-cabinetmaker': {
    title: '細木工',
    text: '每次收成時，細木工最多可將 1 木材轉換成 2 食物。',
  },
  'occupation-potter': {
    title: '陶匠',
    text: '每次收成時，陶匠最多可將 1 黏土轉換成 2 食物。',
  },
  'occupation-stone-carver': {
    title: '石雕師',
    text: '每次收成時，石雕師最多可將 1 石頭轉換成 3 食物。',
  },
  'occupation-master-brewer': {
    title: '釀酒大師',
    text: '每次收成的餵食階段，釀酒大師最多可將 1 穀物轉換成 3 食物。',
  },
  'occupation-schnaps-distiller': {
    title: '烈酒蒸餾師',
    text: '每次收成的餵食階段，你最多可將 1 蔬菜轉換成 5 食物。',
  },

  // ---- Ongoing action-space bonuses. ----
  'minor-canoe': {
    title: '獨木舟',
    text: '每當你使用「釣魚」行動格時，額外獲得 1 食物和 1 蘆葦。',
  },

  // ---- Scoring bonuses. ----
  'minor-mansion': {
    title: '宅邸',
    text: '遊戲結束時，你的石屋每個房間額外得 2 分。（合計每個房間 4 分，而非一般的 2 分。）',
  },
  'minor-half-timbered-house': {
    title: '半木結構房屋',
    text: '遊戲結束時，你的石屋每個房間額外得 1 分。（合計每個房間 3 分，而非 2 分。）若你已打出宅邸，則此卡不再額外得分。',
  },
  'occupation-wooden-hut-builder': {
    title: '木屋建造者',
    text: '遊戲結束時，你的木屋每個房間得 1 分。',
  },

  // ---- Cooking improvements with multi-good conversion tables. ----
  'minor-cooking-hearth': {
    title: '爐灶',
    text: '任何時候可將物品換成食物：蔬菜 3 食物、綿羊 2 食物、野豬 3 食物、牛 4 食物。進行「烤麵包」行動時，可將穀物換 3 食物。',
  },
  'minor-simple-fireplace': {
    title: '簡易壁爐',
    text: '任何時候可將物品換成食物：蔬菜 2 食物、綿羊 1 食物、野豬 2 食物、牛 3 食物。進行「烤麵包」行動時，可將穀物換 2 食物。',
  },
  'minor-brewery': {
    title: '釀酒廠',
    text: '在收成的餵食階段，可用釀酒廠將最多 1 穀物轉換成 3 食物。',
  },
  "minor-brewer-s-copper": {
    title: '釀酒銅鍋',
    text: '每次收成的餵食階段，可用釀酒銅鍋將最多 1 穀物轉換成 2 食物。',
  },
  'minor-schnaps-distillery': {
    title: '烈酒蒸餾廠',
    text: '在收成的餵食階段，可用烈酒蒸餾廠將最多 1 蔬菜轉換成 5 食物。',
  },
  'minor-sawmill': {
    title: '鋸木廠',
    text: '每次收成時，最多可將 1 木材轉換成 3 食物。遊戲結束時，2／4／5 木材可得 1／2／3 分。',
  },
  'occupation-corn-profiteer': {
    title: '穀物投機商',
    text: '任何時候可將 1 穀物轉換成 3 食物。其他玩家可付你 2 食物買下該穀物來阻止；若多人出價，由你選擇對象。',
  },

  // ---- Food placed on future round spaces. ----
  'minor-chicken-coop': {
    title: '雞舍',
    text: '在接下來 8 個剩餘的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-goose-pond': {
    title: '鵝池',
    text: '在接下來 4 個剩餘的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-swan-lake': {
    title: '天鵝湖',
    text: '在接下來 5 個剩餘的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-village-well': {
    title: '村井',
    text: '在接下來 3 個剩餘的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },

  // ---- Minor improvements, batch 1. ----
  'minor-boar-breeding': {
    title: '野豬繁殖',
    text: '打出此卡時，獲得 1 野豬。',
  },
  'minor-field': {
    title: '田地',
    text: '打出此卡時，立即開墾 1 塊田地。',
  },
  'minor-building-material': {
    title: '建築材料',
    text: '打出此卡時，獲得 1 木材或 1 黏土。',
  },
  'minor-straw-thatched-roof': {
    title: '茅草屋頂',
    text: '你擴建或翻修房屋時不再需要蘆葦。',
  },
  'minor-helpful-neighbors': {
    title: '熱心鄰居',
    text: '打出此卡時，獲得 1 石頭或 1 蘆葦。',
  },
  'minor-drinking-trough': {
    title: '飲水槽',
    text: '每個牧場（無論是否有馬廄）可額外容納 2 隻動物。',
  },
  'minor-cattle-market': {
    title: '牛隻市場',
    text: '打出此卡時，將 1 綿羊退回供應區並取得 1 牛。',
  },
  'minor-bread-paddle': {
    title: '麵包鏟',
    text: '每當你打出職業卡時，也可以進行一次「烤麵包」行動。',
  },
  'minor-axe': {
    title: '斧頭',
    text: '每當你為木屋擴建房間時，只需支付 2 木材和 2 蘆葦。',
  },
  'minor-corn-scoop': {
    title: '穀物勺',
    text: '每當你使用「取得 1 穀物」行動時，額外獲得 1 穀物。',
  },
  'minor-windmill': {
    title: '風車',
    text: '任何時候都可以將穀物轉換成 2 食物（不需進行烤麵包）。',
  },
  'minor-millstone': {
    title: '石磨',
    text: '每當你將 1 個或以上的穀物烤成麵包時，額外獲得 2 食物。',
  },
  'minor-quarry': {
    title: '採石場',
    text: '每當你使用「打零工」行動時，額外獲得 3 石頭。',
  },
  'minor-grain-cart': {
    title: '穀物推車',
    text: '每當你使用「取得 1 穀物」行動格時，額外獲得 2 穀物。',
  },
  'minor-scarecrow': {
    title: '稻草人',
    text: '每當你播種時，可支付 1 木材，在一塊空田上種 2 穀物而非 1 個。',
  },
  'minor-raft': {
    title: '木筏',
    text: '每當你使用「釣魚」行動格時，額外獲得 1 食物或 1 蘆葦。',
  },
  'minor-bookshelf': {
    title: '書架',
    text: '每當你打出 1 張職業卡時，在支付費用前先獲得 3 食物。',
  },
  'minor-spindle': {
    title: '紡錘',
    text: '收成的田地階段，若你有 3／5 隻綿羊，額外獲得 1／2 食物。',
  },
  'minor-wood-cart': {
    title: '木材推車',
    text: '每當你派家庭成員取走行動格上的木材時，額外獲得 2 木材。',
  },
  'minor-potato-dibber': {
    title: '點播器',
    text: '每當你在田地播種蔬菜時，每塊播種的田地額外放 1 蔬菜。',
  },
  'minor-clay-roof': {
    title: '黏土屋頂',
    text: '擴建或翻修房屋時，你可用等量的黏土代替 1 或 2 蘆葦。',
  },
  'minor-clogs': {
    title: '木屐',
    text: '遊戲結束時，黏土屋得 1 分，石屋得 2 分。',
  },
  'minor-sleeping-corner': {
    title: '睡覺角落',
    text: '即使其他玩家已佔用「家庭成長」行動格，你仍可使用該格。',
  },
  'minor-dovecote': {
    title: '鴿舍',
    text: '在第 10 至 14 回合的回合格上各放 1 食物。這些回合開始時，你獲得該食物。',
  },
  'minor-family-portrait': {
    title: '全家福',
    text: '為每位家庭成員支付 2 食物，獲得 4 分。（記錄在計分紙上。）',
  },

  // ---- Minor improvements, batch 2. ----
  'minor-forest-pasture': {
    title: '林地牧場',
    text: '此卡可容納無限隻野豬。（計分時此卡不算作牧場。）',
  },
  'minor-manger': {
    title: '飼料槽',
    text: '遊戲結束時，若你的牧場佔據 6／7／8／9 格以上，得 1／2／3／4 分。',
  },
  'minor-acreage': {
    title: '耕地',
    text: '播種時，你可以在此卡上種 2 塊穀物田。（計分時此卡不算作田地。）',
  },
  'minor-granary': {
    title: '穀倉',
    text: '在第 8、10、12 回合的回合格上各放 1 穀物。這些回合開始時，你獲得該穀物。',
  },
  'minor-liquid-manure': {
    title: '液肥',
    text: '每當你播種時，從供應區在新播種的田地上額外放 1 穀物或 1 蔬菜。',
  },
  'minor-clay-supports': {
    title: '黏土支架',
    text: '每當你為黏土屋擴建房間時，可支付 2 黏土、1 木材和 1 蘆葦，取代 5 黏土和 2 蘆葦。',
  },
  'minor-wildlife-reserve': {
    title: '野生動物保護區',
    text: '此卡最多可容納 1 綿羊、1 野豬和 1 牛。（計分時此卡不算作牧場。）',
  },
  'minor-flail': {
    title: '連枷',
    text: '每當你使用「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動時，也可以進行「烤麵包」行動。',
  },
  'minor-threshing-board': {
    title: '打穀板',
    text: '每當你使用「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動時，也可以進行「烤麵包」行動。',
  },
  'minor-mini-pasture': {
    title: '小牧場',
    text: '打出此卡時，立即在農場圍起 1 格。（不需支付柵欄的木材。）',
  },
  'minor-guest': {
    title: '客人',
    text: '打出此卡時，獲得 1 個客人指示物，可在下一回合當作家庭成員放置一次。',
  },
  'minor-spit-roast': {
    title: '烤肉叉',
    text: '每當你在收成的餵食階段將至少 1 隻動物轉換成食物時，額外獲得 1 食物。',
  },
  'minor-fishing-rod': {
    title: '釣竿',
    text: '每當你使用「釣魚」行動格時，額外獲得 1 食物；第 8 回合起改為額外 2 食物。',
  },
  'minor-wooden-strongbox': {
    title: '木製保險箱',
    text: '遊戲結束時，若你的房屋有 5 個房間得 2 分，6 個或以上得 4 分。',
  },
  'minor-spices': {
    title: '香料',
    text: '每當你使用壁爐、爐灶或炊事角將蔬菜轉換成食物時，額外獲得 1 食物。',
  },
  'minor-keg': {
    title: '小木桶',
    text: '本回合所有家庭成員都放置完畢後，你可以放置 1 個客人標記進行額外行動。',
  },
  'minor-hand-mill': {
    title: '手推磨',
    text: '在收成的餵食階段，可用手推磨將 1 穀物換成 2 食物，或 2 穀物換成 4 食物。',
  },
  'minor-writing-desk': {
    title: '書桌',
    text: '每當你使用「職業」行動時，可連續打出 2 張職業卡；第二張需支付 2 食物。',
  },
  'minor-turnwrest-plow': {
    title: '翻轉犁',
    text: '遊戲中一次，當你使用「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動時，可改為開墾 3 塊田地。',
  },
  'minor-bean-field': {
    title: '豆田',
    text: '播種時，你可以把此卡當作田地種植蔬菜。（計分時此卡不算作田地。）',
  },
  'minor-fish-trap': {
    title: '魚簍',
    text: '每當你使用「釣魚」行動格，或從提供蘆葦的行動格取得蘆葦時，額外獲得 1 食物。',
  },
  'minor-ox-team': {
    title: '牛隊',
    text: '打出此卡時，計算尚未進行的完整回合數，可開墾同樣數量的田地，最多 3 塊。',
  },
  'minor-riding-plow': {
    title: '乘坐式犁',
    text: '遊戲中兩次，當你使用「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動時，可改為開墾 3 塊田地。',
  },
  'minor-stump-jump-plow': {
    title: '越樁犁',
    text: '當你住在黏土屋或石屋後，每當你派家庭成員取得木材時，可支付 1 食物開墾 1 塊田地。',
  },
  'minor-feed-pellets': {
    title: '飼料顆粒',
    text: '每次收成的餵食階段，你可以用 1 蔬菜換取 1 隻你農場已有種類的動物。',
  },

  // ---- Minor improvements, batch 3. ----
  "minor-shepherd-s-pipe": {
    title: '牧羊笛',
    text: '每個養有綿羊的牧場可額外容納 2 隻綿羊。每座無圍欄的馬廄可容納 2 隻綿羊。',
  },
  "minor-builder-s-trowel": {
    title: '泥刀',
    text: '你可以在任何時候將木屋翻修成黏土屋，不需使用「翻修」行動（仍需支付翻修費用）。',
  },
  "minor-gypsy-s-crock": {
    title: '吉普賽陶罐',
    text: '每當你使用壁爐、爐灶或炊事角一次將 2 個物品轉換成食物時，額外獲得 1 食物。',
  },
  'minor-planter-box': {
    title: '種植箱',
    text: '每當你播種時，每塊與房間正交相鄰的播種田地額外獲得 2 穀物或 1 蔬菜。',
  },
  'minor-stable': {
    title: '馬廄',
    text: '打出此卡時，立即建造 1 座馬廄。（馬廄本身免費，但仍需支付此卡的費用。）',
  },
  'minor-baking-tray': {
    title: '烤盤',
    text: '黏土烤爐與石造烤爐對你而言視為小進步卡。黏土、石造與柴燒烤爐的費用各減少 1 個你選擇的建材。',
  },
  'minor-ranch': {
    title: '大牧場',
    text: '打出此卡時，每個尚未開始的回合各得 1 分和 2 食物。（將分數記錄在計分紙上。）',
  },
  'minor-basket': {
    title: '籃子',
    text: '每當你派家庭成員從行動格取得木材時，可留下 2 木材在格上，換取 3 食物。',
  },
  'minor-clay-hut-extension': {
    title: '黏土屋擴建',
    text: '打出此卡時，立即為黏土屋擴建 1 個房間。（房間本身免費，但仍需支付此卡的費用。）',
  },
  'minor-wooden-hut-extension': {
    title: '木屋擴建',
    text: '打出此卡時，立即為木屋擴建 1 個房間。（房間本身免費，但仍需支付此卡的費用。）',
  },
  'minor-ladder': {
    title: '梯子',
    text: '擴建或翻修房屋，以及建造水磨坊、半木結構房屋、雞舍、渡假屋、宅邸或穀物倉庫時，所需蘆葦減少 1。',
  },
  'minor-stone-house-extension': {
    title: '石屋擴建',
    text: '打出此卡時，立即為石屋擴建 1 個房間。（房間本身免費，但仍需支付此卡的費用。）',
  },
  'minor-crooked-plow': {
    title: '曲轅犁',
    text: '遊戲中一次，當你使用「開墾 1 塊田地」行動時，可改為開墾 3 塊田地。不適用於「開墾 1 塊田地及／或播種」行動。',
  },
  'minor-moldboard-plow': {
    title: '壁犁',
    text: '遊戲中兩次，當你使用「開墾 1 塊田地」行動時，可改為開墾 2 塊田地。不適用於「開墾 1 塊田地及／或播種」行動。',
  },
  'minor-yoke': {
    title: '牛軛',
    text: '打出此卡時，任何玩家每打出過 1 張犁卡，你就可以立即開墾 1 塊田地；若耙已被打出，再多開墾 1 塊。',
  },
  'minor-corn-storehouse': {
    title: '穀物倉庫',
    text: '收成的田地階段之後，若你有空田，可立即在其中播種穀物；從供應區放置的穀物少 1 個。',
  },
  'minor-greenhouse': {
    title: '溫室',
    text: '在目前回合數加 4 和加 7 的回合格上各放 1 蔬菜。這些回合開始時，你可支付 1 食物取得該蔬菜。',
  },
  'minor-landing-net': {
    title: '撈網',
    text: '每當你從行動格取得蘆葦時，額外獲得 2 食物；若同時取得其他建材，則減為 1 食物。',
  },
  'minor-spinney': {
    title: '小樹林',
    text: '每當其他玩家使用「3 木材」行動格時，必須給你其中 1 木材。（不適用於「4 木材」行動格。）',
  },
  'minor-outhouse': {
    title: '茅房',
    text: '茅房沒有任何效果。只有在至少一位其他玩家的職業卡少於 2 張時才能建造。（與你打出多少張職業卡無關。）',
  },
  'minor-punner': {
    title: '夯錘',
    text: '每當其他玩家使用耙或犁時，你也可以立即開墾 1 塊田地。（你自己使用耙或犁時則沒有這個好處。）',
  },
  'minor-rake': {
    title: '耙子',
    text: '遊戲結束時，若你有至少 5 塊田地得 2 分。若你已打出耙、夯錘、牛軛或任何犁卡，則需要至少 6 塊田地。',
  },
  'minor-manure': {
    title: '肥料',
    text: '在每個非收成回合結束時，你可以選擇從每塊田地取 1 穀物或 1 蔬菜放入個人供應區。',
  },
  'minor-wooden-crane': {
    title: '木製起重機',
    text: '每當你使用第 2 與第 4 階段出現的「石頭」行動格時，額外獲得 1 石頭；支付 1 食物則可改取 2 石頭。',
  },
  'minor-barbecue': {
    title: '烤肉架',
    text: '打出此卡時，可轉換不超過你家庭成員數量的動物成食物：每隻綿羊 3 食物、野豬 4 食物、牛 5 食物。',
  },

  // ---- Minor improvements, batch 4: the remainder. ----
  'minor-loom': {
    title: '織布機',
    text: '收成的田地階段，若你有至少 1／4／7 隻綿羊，獲得 1／2／3 食物。遊戲結束時，每 3 隻綿羊得 1 分。',
  },
  'minor-milking-stool': {
    title: '擠奶凳',
    text: '收成的田地階段，若你有至少 1／3／5 隻牛，獲得 1／2／3 食物。遊戲結束時，每 2 隻牛得 1 分。',
  },
  'minor-swing-plow': {
    title: '搖擺犁',
    text: '遊戲中兩次，當你使用「開墾 1 塊田地」行動時，可改為開墾 3 塊田地。搖擺犁不能用於「開墾 1 塊田地及／或播種」行動。',
  },
  'minor-plane': {
    title: '刨刀',
    text: '每當你使用木工坊、鋸木廠或細木工將 1 木材轉換成食物時，額外獲得 1 食物；或者改為將第二個木材轉換成剛好 2 食物。',
  },
  'minor-bust': {
    title: '半身像',
    text: '當所有其他玩家都已有 2 張或以上的職業卡時，就不能再打出此卡。（3 人遊戲為 3 張，2 人遊戲為 4 張。）',
  },
  'minor-sawhorse': {
    title: '鋸馬',
    text: '你下一座放置的馬廄，以及第 3、6、9、12、15 段柵欄免費。（柵欄仍必須圍成完整的牧場才能放置。）',
  },
  'minor-animal-feed': {
    title: '動物飼料',
    text: '計分前，若牧場仍有空間，你已擁有的每種動物各額外獲得 1 隻。（不適用於家羊與馬。）',
  },
  'minor-milking-shed': {
    title: '擠奶棚',
    text: '每次收成的田地階段開始時，計算所有玩家農場上綿羊與牛的總數。每 5 隻綿羊和每 3 隻牛，你獲得 1 食物。',
  },
  'minor-wood-fired-oven': {
    title: '柴燒烤爐',
    text: '每當你進行「烤麵包」行動時，可用柴燒烤爐將任意數量的穀物各轉換成 3 食物。打出此卡時，也可以立即進行一次「烤麵包」行動。',
  },
  'minor-animal-yard': {
    title: '畜養場',
    text: '此卡最多可容納 2 隻你選擇的動物，種類不必相同。（計分時此卡不算作牧場，也不會給你動物。）',
  },
  'minor-turnip-field': {
    title: '蕪菁田',
    text: '播種時，你可以把此卡當作田地種植蔬菜。打出此卡時，也可以立即進行一次「播種」行動。（計分時此卡不算作田地。）',
  },
  'minor-butter-churn': {
    title: '攪乳器',
    text: '收成的田地階段，你每 3 隻綿羊獲得 1 食物，每 2 隻牛獲得 1 食物。',
  },
  'minor-clapper': {
    title: '響板',
    text: '每當你使用「家庭成長」行動（或打出響板時該格已有你的家庭成員），在任一已有至少 1 穀物的田地上額外放 1 穀物。',
  },
  'minor-horse': {
    title: '馬',
    text: '遊戲結束時，你農場缺少的任一種動物可得 2 分（馬代替該種動物）。你仍會因缺少該動物而失分。',
  },
  'minor-copse': {
    title: '小樹叢',
    text: '播種時，你最多可在此卡上種 2 木材。木材視同已播種的穀物，在田地階段收成。（計分時此卡不算作田地。）',
  },
  'minor-pumpkin-seed-oil': {
    title: '南瓜籽油',
    text: '遊戲中三次（每回合最多一次），你可以在此卡上放 1 蔬菜換取 3 食物。卡上的蔬菜在遊戲結束時仍計入分數。',
  },
  'minor-clay-deposit': {
    title: '黏土礦床',
    text: '此卡是一個額外的行動格。使用此行動的玩家必須付你 1 食物並獲得 5 黏土。你自己使用時，可選擇改為得 2 分。',
  },
  'minor-madonna-statue': {
    title: '聖母像',
    text: '聖母像沒有任何效果。（你必須移除面前桌上的進步卡，不能棄掉手牌；移除主要或小進步卡皆可。）',
  },
  'minor-flagon': {
    title: '大酒壺',
    text: '每當水井被建造或升級為村井時，你獲得 4 食物，其他玩家各獲得 1 食物。（若水井已建成，則在打出大酒壺時分配。）',
  },
  'minor-dozing-bull': {
    title: '打盹的公牛',
    text: '只要你農場上至少有 1 隻牛，就可以隨時免費拆除並重建柵欄，動物不會走失。（柵欄仍須依規則放置。）',
  },
  'minor-clay-path': {
    title: '黏土小徑',
    text: '計分時，擁有最有價值道路的玩家得 2 分。（5 石頭的石板路價值高於此黏土小徑，黏土小徑高於 1 木材的木板路。）',
  },
  'minor-paved-road': {
    title: '石板路',
    text: '計分時，擁有最有價值道路的玩家得 2 分。（此石板路價值高於 3 黏土的黏土小徑，黏土小徑高於 1 木材的木板路。）',
  },
  'minor-wooden-path': {
    title: '木板路',
    text: '計分時，擁有最有價值道路的玩家得 2 分。（5 石頭的石板路價值高於 3 黏土的黏土小徑，兩者都高於此木板路。）',
  },
  'minor-harrow': {
    title: '耙',
    text: '遊戲中一次，當你使用「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動時，可改為開墾 2 塊田地。其他玩家也各可使用一次，但須付你 2 食物。',
  },
  'minor-holiday-house': {
    title: '渡假屋',
    text: '第 14 回合你不能放置任何家庭成員（包括客人）。最晚須在第 13 回合打出此卡。（請準備連續兩次收成。）',
  },
  'minor-broom': {
    title: '掃帚',
    text: '棄掉手上所有小進步卡，抽 7 張新的小進步卡，並可立即再打出 1 張小進步卡（仍須支付費用並符合條件）。',
  },
  'minor-house-goat': {
    title: '家羊',
    text: '每次餵食階段你獲得 1 食物。除家羊外，你的房屋不能容納其他動物，也不能放走家羊以騰出空間。',
  },
  'minor-lasso': {
    title: '套索',
    text: '若其中至少一位使用「野豬」、「牛」或「綿羊」行動格，你可以連續放置兩位家庭成員。',
  },
  'minor-tavern': {
    title: '酒館',
    text: '酒館是一個額外的行動格。其他玩家使用時獲得 3 食物；你自己使用時可選擇取 3 食物或得 2 分。（其他玩家使用時你不獲得任何東西。）',
  },
  'minor-giant-pumpkin': {
    title: '巨型南瓜',
    text: '從你的供應區放 1 蔬菜在此卡上。任何時候都可以收成並轉換成食物。若遊戲結束時仍留在卡上，得 2 分（該蔬菜仍計入計分）。',
  },
  'minor-slaughterhouse': {
    title: '屠宰場',
    text: '每當其他玩家將 1 隻或以上的動物轉換成食物時，你從供應區獲得 1 食物。收成的餵食階段你最後行動，以便從他人的屠宰中獲益。',
  },
  'minor-pelts': {
    title: '毛皮',
    text: '每屠宰並退回 1 隻動物，你可以從個人供應區放 1 食物到一個房間，每個房間最多 1 食物。這些食物不能再使用，但遊戲結束時各值 1 分。',
  },
  'minor-maypole': {
    title: '五月柱',
    text: '須在第 4 回合結束前打出。打出時，將一段未建造的柵欄豎立在一個未使用的農場格上。若到遊戲結束仍未倒下，得 2 分。（該格視為已使用。）',
  },
  'minor-reed-hut': {
    title: '蘆葦小屋',
    text: '將一個尚未進入遊戲的家庭成員放在此卡上，往後都住在這裡。他可以進行行動（從打出此卡的回合起）也必須被餵食，但住在蘆葦小屋期間不計分。',
  },

  // ---- Occupations, batch 1. ----
  'occupation-clay-firer': {
    title: '燒陶工',
    text: '任何時候都可以用燒陶工將 2／3 黏土轉換成 1／2 石頭。',
  },
  'occupation-undergardener': {
    title: '園丁助手',
    text: '每當你使用「打零工」行動格時，同時獲得 1 蔬菜。',
  },
  'occupation-greengrocer': {
    title: '蔬果商',
    text: '每當你使用「取得 1 穀物」行動格時，同時獲得 1 蔬菜。',
  },
  'occupation-turner': {
    title: '車工',
    text: '任何時候都可以用車工將任意數量的木材各轉換成 1 食物。',
  },
  'occupation-yeoman-farmer': {
    title: '自耕農',
    text: '遊戲結束時，你只會因未使用格與乞討卡而失分。',
  },
  'occupation-field-watchman': {
    title: '田地看守員',
    text: '每當你使用「取得 1 穀物」行動格時，也可以開墾最多 1 塊田地。',
  },
  'occupation-bricklayer': {
    title: '砌磚工',
    text: '每張進步卡與每次翻修少付 1 黏土，每個房間少付 2 黏土。',
  },
  'occupation-clay-worker': {
    title: '黏土工',
    text: '每當你以行動取得木材或黏土時，額外獲得 1 黏土。',
  },
  'occupation-woodcutter': {
    title: '伐木工',
    text: '每當你派家庭成員取得木材時，額外獲得 1 木材。',
  },
  'occupation-stablemaster': {
    title: '馬廄總管',
    text: '你其中一座（且僅限一座）無圍欄的馬廄最多可容納 3 隻同種動物。',
  },
  'occupation-weaver': {
    title: '織工',
    text: '每當行動階段開始時你有至少 2 隻綿羊，就獲得 1 食物。',
  },
  'occupation-berry-picker': {
    title: '採莓人',
    text: '每當你派家庭成員取得木材時，額外獲得 1 食物。',
  },
  'occupation-clay-mixer': {
    title: '拌泥工',
    text: '每當你的家庭成員行動只取得黏土時，額外獲得 2 黏土。',
  },
  'occupation-mendicant': {
    title: '乞食者',
    text: '遊戲結束時，你可以棄掉最多 2 張乞討卡而不因此失分。',
  },
  'occupation-renovator': {
    title: '翻修師',
    text: '翻修成黏土屋少付 2 黏土，翻修成石屋少付 2 石頭。',
  },
  'occupation-tutor': {
    title: '家庭教師',
    text: '遊戲結束時，在此卡之後打出的每張職業卡各得 1 分。',
  },
  'occupation-outrider': {
    title: '前導騎士',
    text: '每當你派家庭成員使用最新的回合卡時，額外獲得 1 穀物。',
  },
  'occupation-street-musician': {
    title: '街頭樂手',
    text: '每當其他玩家使用「流浪藝人」行動格時，你獲得 1 穀物。',
  },
  'occupation-well-builder': {
    title: '水井匠',
    text: '對你而言水井是小進步卡而非主要進步卡，且只需 1 石頭和 1 木材即可建造。',
  },
  'occupation-plow-driver': {
    title: '犁田手',
    text: '當你擁有石屋後，每回合開始時可支付 1 食物開墾最多 1 塊田地。',
  },
  'occupation-academic': {
    title: '學者',
    text: '此卡在小進步卡與「里正」職業卡計分時視為 2 張職業卡。',
  },
  'occupation-animal-tamer': {
    title: '馴獸師',
    text: '你的每個房間各可容納 1 隻動物，且可以是不同種類。',
  },
  'occupation-quarryman': {
    title: '採石工',
    text: '任何時候都可以用採石工將石頭轉換成食物，每 1 石頭換 2 食物。',
  },
  'occupation-braggart': {
    title: '吹牛者',
    text: '遊戲結束時，面前有 5／6／7／8／9 張以上進步卡，分別得 1／3／5／7／9 分。',
  },
  'occupation-patron': {
    title: '贊助人',
    text: '此後每當你打出職業卡時，在支付費用前先獲得 2 食物。',
  },
  'occupation-foreman': {
    title: '工頭',
    text: '行動階段開始時，你可以從供應區放 1 食物到任一你選擇的行動格上。',
  },
  'occupation-conjurer': {
    title: '魔術師',
    text: '每當你使用「流浪藝人」行動格時，除食物外還獲得 1 穀物。',
  },
  'occupation-farmer': {
    title: '農夫',
    text: '你下次建造柵欄時獲得 1 野豬；此後每次建造至少 1 段柵欄，獲得 1 牛。',
  },
  'occupation-charcoal-burner': {
    title: '燒炭工',
    text: '每當任何玩家（包括你）建造帶有麵包符號的烘焙進步卡時，你獲得 1 食物和 1 木材。',
  },
  'occupation-dance-instructor': {
    title: '舞蹈教師',
    text: '在支付此卡費用前先獲得 4 食物，然後立即將此卡收回手中。',
  },
  'occupation-master-builder': {
    title: '建築大師',
    text: '遊戲中一次，當你的房屋達到至少 5 個房間後，可隨時免費擴建 1 個房間。',
  },
  'occupation-storehouse-keeper': {
    title: '倉庫管理員',
    text: '每當你派家庭成員取得蘆葦與石頭時，另外獲得 1 黏土或 1 穀物（由你選擇）。',
  },
  'occupation-estate-manager': {
    title: '莊園管家',
    text: '在 3／4／5 人遊戲結束時，若沒有玩家的任一種動物比你多，你得 2／3／4 分。',
  },
  'occupation-head-of-the-family': {
    title: '一家之主',
    text: '即使其他玩家已佔用「擴建房間」或「家庭成長」行動格，你仍可使用該格。',
  },
  'occupation-cook': {
    title: '廚師',
    text: '每次收成的餵食階段，只有 2 位家庭成員各需 2 食物，其餘每人只需 1 食物。',
  },
  'occupation-wood-carver': {
    title: '木雕師',
    text: '每回合，你在下列其中一項少付 1 木材：進步卡、木屋的房間、馬廄或柵欄。',
  },
  'occupation-field-worker': {
    title: '農工',
    text: '每當其他玩家在一塊或多塊田地播種時，3 人遊戲你獲得 1 穀物，4 或 5 人遊戲獲得 1 食物。',
  },
  'occupation-mason': {
    title: '石工',
    text: '遊戲中一次，當你的石屋達到至少 4 個房間後，可隨時免費擴建 1 個房間。',
  },
  'occupation-cooper': {
    title: '桶匠',
    text: '每當你或其他玩家從行動格取得超過 2 食物時，你從供應區獲得 1 食物。',
  },
  'occupation-sower': {
    title: '播種者',
    text: '在收成階段以外獲得、原本要放入供應區的每個蔬菜，你都可以立即播種。',
  },

  // ---- Occupations, batch 2. ----
  'occupation-puppeteer': {
    title: '木偶師',
    text: '每當其他玩家選擇「流浪藝人」行動格時，你可以支付 1 食物打出 1 張職業卡。',
  },
  'occupation-animal-keeper': {
    title: '動物飼育員',
    text: '你可以在同一個牧場飼養綿羊、野豬和牛，適用於你所有的牧場（林地牧場除外）。',
  },
  'occupation-gardener': {
    title: '園丁',
    text: '收成蔬菜時從供應區取得，而非從你的蔬菜田——田地上的蔬菜保留不動。',
  },
  'occupation-hide-farmer': {
    title: '隱田農夫',
    text: '遊戲結束時，你可以為任意數量的未使用田地各支付 1 食物，使其不再扣分。',
  },
  'occupation-pig-breeder': {
    title: '養豬人',
    text: '若有空間容納小豬，你的野豬在第 12 回合結束時繁殖。打出此卡時，獲得 1 野豬。',
  },
  'occupation-clay-plasterer': {
    title: '泥水匠',
    text: '將木屋翻修成黏土屋只需 1 黏土和 1 蘆葦。黏土屋的每個房間只需 3 黏土和 2 蘆葦。',
  },
  'occupation-seed-trader': {
    title: '種子商',
    text: '在此卡上放 2 穀物和 2 蔬菜，任何時候都可以購買：每個穀物 2 食物，每個蔬菜 3 食物。',
  },
  'occupation-wood-buyer': {
    title: '木材買家',
    text: '每當其他玩家透過行動取得木材時，你可以用 1 食物向他購買 1 木材（不需對方同意）。',
  },
  'occupation-market-woman': {
    title: '市場女商販',
    text: '每當你透過家庭成員行動或小進步卡取得蔬菜時，額外獲得 2 穀物。',
  },
  'occupation-storyteller': {
    title: '說書人',
    text: '每當你使用「流浪藝人」行動格時，可留下 1 食物在格上，改為取得 1 蔬菜。',
  },
  'occupation-merchant': {
    title: '商人',
    text: '每當你使用「小進步」或「小／主要進步」行動時，可支付 1 食物再使用該行動一次。',
  },
  'occupation-plow-maker': {
    title: '製犁匠',
    text: '每當你使用「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動格時，可支付 1 食物額外開墾 1 塊田地。',
  },
  'occupation-cattle-whisperer': {
    title: '馴牛人',
    text: '在目前回合數加 5 和加 9 的回合格上各放 1 牛。這些回合開始時，你獲得該牛。',
  },
  'occupation-pig-catcher': {
    title: '捕豬人',
    text: '每當你派家庭成員取走行動格上的木材時，可留下 2 木材在格上，改為取得 1 野豬。',
  },
  'occupation-layabout': {
    title: '懶漢',
    text: '打出此卡後，你不能參與下一次收成。（該次收成你也不需要餵食家庭成員。）',
  },
  'occupation-magician': {
    title: '魔法師',
    text: '每當你用最後一位家庭成員選擇「流浪藝人」行動格時，額外獲得 1 穀物和 1 食物。',
  },
  'occupation-clay-seller': {
    title: '黏土商',
    text: '任何時候都可以用黏土商轉換：2 黏土換 1 綿羊或 1 蘆葦、3 黏土換 1 野豬或 1 石頭、4 黏土換 1 牛。',
  },
  'occupation-seasonal-worker': {
    title: '季節工',
    text: '每當你使用「打零工」行動格時，額外獲得 1 穀物；第 6 回合起可改為選擇 1 蔬菜。',
  },
  'occupation-meat-seller': {
    title: '肉販',
    text: '若你擁有烤爐，任何時候都可以將動物轉換成食物：每隻綿羊 2 食物、野豬 3 食物、牛 4 食物。',
  },
  'occupation-sheep-whisperer': {
    title: '馴羊人',
    text: '在目前回合數加 4、7、9、11 的回合格上各放 1 綿羊。這些回合開始時，你獲得該綿羊。',
  },
  'occupation-field-warden': {
    title: '田地管理員',
    text: '即使其他玩家已佔用「取得 1 蔬菜」、「開墾 1 塊田地」或「開墾 1 塊田地及／或播種」行動格，你仍可使用。',
  },
  'occupation-shepherd': {
    title: '牧羊人',
    text: '每次收成的繁殖階段，若你有至少 4 隻綿羊且有空間容納，可獲得 2 隻小羊而非 1 隻。',
  },
  'occupation-mushroom-collector': {
    title: '採菇人',
    text: '每當你派家庭成員取走行動格上的木材時，可留下 1 木材在格上，換取 2 食物。',
  },
  'occupation-stone-carrier': {
    title: '石材搬運工',
    text: '每當你以行動取得石頭時，可額外取得 1 石頭；若同時取得其他建材，則需支付 1 食物。',
  },
  'occupation-smallholder': {
    title: '小農',
    text: '你原本只能容納 2 隻動物的牧場改為可容納 3 隻。此外，當你的田地不超過 2 塊時，播種可額外多放 1 穀物或 1 蔬菜。',
  },
  'occupation-frame-builder': {
    title: '框架建造者',
    text: '每次翻修時，可用 1 木材代替剛好 1 黏土或 1 石頭；每次擴建時，可用 1 木材代替剛好 2 黏土或 2 石頭。',
  },
  'occupation-cowherd': {
    title: '牧牛人',
    text: '每當你使用「取得 1 牛」行動格時，從供應區額外獲得 1 牛。（該行動格在第 4 階段加入。）',
  },
  'occupation-pig-whisperer': {
    title: '馴豬人',
    text: '在目前回合數加 4、7、10 的回合格上各放 1 野豬。這些回合開始時，你獲得該野豬。',
  },
  'occupation-grocer': {
    title: '雜貨商',
    text: '在此卡上由下至上疊放：蔬菜、蘆葦、黏土、木材、蔬菜、石頭、穀物、蘆葦各 1。任何時候都可以用 1 食物購買最上面那個。',
  },
  'occupation-serf': {
    title: '農奴',
    text: '每當你使用「播種及／或烤麵包」行動時，在行動前先獲得 1 穀物；或者你可以用 1 穀物換 1 蔬菜。',
  },
  'occupation-animal-handler': {
    title: '動物管理員',
    text: '在第 7 回合格放 1 綿羊、第 10 回合格放 1 野豬、第 14 回合格放 1 牛。這些回合開始時，你可用 1 食物買下該動物。',
  },
  'occupation-rancher': {
    title: '牧場主',
    text: '每當回合開始時你的未使用農場格比所有其他玩家都少，你獲得 1 木材。（平手則沒有。）',
  },
  'occupation-stone-breaker': {
    title: '碎石工',
    text: '你可以在任何時候將黏土屋翻修成石屋，不需使用「翻修」行動格（仍需支付翻修費用）。',
  },
  'occupation-pastor': {
    title: '牧師',
    text: '若在打出此卡時或之後，你是最後一位只有 2 個房間的玩家，你獲得 3 木材、2 黏土、1 蘆葦和 1 石頭。',
  },
  'occupation-hut-builder': {
    title: '小屋建造者',
    text: '須在第 1 階段打出。第 11 回合開始時，只要你尚未翻修成石屋，就可以免費擴建 1 個房間。',
  },
  'occupation-businessman': {
    title: '生意人',
    text: '每當你使用「起始玩家」行動格時，在打出小進步卡之後，可以再打出 1 張小進步卡或 1 張主要進步卡。',
  },
  'occupation-harvest-helper': {
    title: '收成幫手',
    text: '每次收成的餵食階段開始時，你可以從其他玩家的 1 塊田地取 1 穀物，該玩家從供應區獲得 2 食物。',
  },
  'occupation-swineherd': {
    title: '養豬倌',
    text: '每當你使用「取得 1 野豬」行動格時，從供應區額外獲得 1 野豬。（該行動格在第 3 階段加入。）',
  },
  'occupation-resource-seller': {
    title: '資源商販',
    text: '在此卡上由下至上疊放：石頭、黏土、石頭、黏土、蘆葦、黏土、木材各 1。當你取得該種建材時，即獲得最上面的標記。',
  },
  'occupation-net-fisherman': {
    title: '撒網漁夫',
    text: '若你的家庭成員使用提供蘆葦的行動格，你可以在返家階段（第 4 階段）取走「釣魚」格上所有的食物標記。',
  },
}

/** The Chinese text for a card, or null when it has not been translated yet. */
export function cardTranslation(cardId: string): CardTranslation | null {
  return CARD_TRANSLATIONS[cardId] ?? null
}

export const TRANSLATED_CARD_COUNT = Object.keys(CARD_TRANSLATIONS).length
