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
}

/** The Chinese text for a card, or null when it has not been translated yet. */
export function cardTranslation(cardId: string): CardTranslation | null {
  return CARD_TRANSLATIONS[cardId] ?? null
}

export const TRANSLATED_CARD_COUNT = Object.keys(CARD_TRANSLATIONS).length
