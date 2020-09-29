import { BadWordDetector, DetectionMode } from "../";

// In checkUnNormalized=false mode, BadWordDetector converts hiragana to katakana when checking, so base list should not contain hiragana
const wordList = {
	strawberry: {
		whitelist: [],
	},
	スイカ: {
		whitelist: [],
	},
	西瓜: {
		whitelist: [],
	},
	メロン: {
		whitelist: [],
	},
	passionfruit: {
		whitelist: [],
	},
	桃: {
		whitelist: [],
	},
	苺: {
		whitelist: [],
	},
	キウィ: {
		whitelist: [],
	},
	ジュース: {
		whitelist: [],
	},
	アサイー: {
		whitelist: [],
	},
	ピザ: {
		whitelist: [],
	},
	サクランボ: {
		whitelist: ["サクランボボ", "オッケーサクランボ"],
	},
	マスカット: {
		whitelist: [],
		mode: DetectionMode.ExactMatch,
	},
	ブドウ: {
		whitelist: [],
		mode: DetectionMode.ExactMatch,
	},
	pineapple: {
		whitelist: [],
		mode: DetectionMode.ExactMatch,
	},
	mango: {
		whitelist: [],
		mode: DetectionMode.ExactMatch,
	},
};

// BadWordDetector should detect all these
const testBlacklistedInput = [
	"STRáWBERRY",
	"日本語も紛れ込んでるSTｒáWBERｒYアアア",
	"wordwordwordSTRáWBëRRY",
	"   　STRAW🍓 BERRY",
	"すいか",
	"すい＊＊＊か",
	"西瓜",
	"めろん",
	"　め　ろ　ん　・・",
	"ｐássioｎｆｒｕｉｔ",
	"　桃",
	"白桃",
	"イ苺~~~~!!",
	"きうぃ",
	"じゅーす",
	"じ🍊ゅ＆＆ーす",
	"あさいー",
	"あささあさいーAbCd",
	"ぴざ",
	"ぴざAぽ",
	"サクランボ",
	"オッケーサクランボサクランボ",
	"superbadサクランボああ",
	"マスカット",
	"ぶどう",
	"   pine   apple   ",
	"mángo",
];

// BadWordDetector should allow these
const testOkInput = [
	"blueberry",
	"berry",
	"passion",
	"fruit",
	"すいこ",
	"ずいか",
	"メロ",
	"メロディー",
	"ひざ",
	"ひさ",
	"ピサ",
	"あざいー",
	"シューす",
	"シューズ",
	"スイーツ",
	"きう",
	"シマウマ",
	"黒猫",
	"アイス",
	"カワウソ",
	"elephant",
	"アアアアサクランボボテストテスト",
	"オッケーサクランボ",
	"マスカットが入っているけどOK",
	"ぶどうぶどうぶどう",
	"pineappleisthebest",
	"mango smoothie",
];

describe("BadWordDetector", () => {
	const detector = new BadWordDetector(wordList, { checkUnNormalized: false });

	it("Returns true when string contains a blacklisted word", () => {
		for (const badWord of testBlacklistedInput) {
			expect(detector.isBad(badWord)).toBe(true);
		}
	});

	it("Returns false when string does not contain blacklisted word", () => {
		for (const okWord of testOkInput) {
			expect(detector.isBad(okWord)).toBe(false);
		}
	});
});

// For checkUnNormalized = true (default) mode, you can input any characters.
// By default, it will check normalized and unnormalized versions of the input word
// If the bad word mode is set to DetectionMode.UnNormalizedOnly or DetectionMode.UnNormalizeOnlyExactMatch, only the unnormalized word will be compared

const wordListForUnNormalizedCheck = {
	STRAWberry: {
		whitelist: [],
	},
	すいか: {
		whitelist: [],
	},
	メロン: {
		whitelist: [],
		mode: DetectionMode.UnNormalizedOnly, // With unNormalizedOnly mode, めろん is OK
	},
	マロン: {
		whitelist: [], // No unNormalizedOnly mode, so まろん is not OK
	},
	PASSIONFRUIT: {
		whitelist: [],
	},
	blueberry: {
		whitelist: [],
		mode: DetectionMode.UnNormalizedOnlyExactMatch, // BLUEBERRY is OK, iloveblueberry is OK
	},
	"🌱": {
		whitelist: ["🌱🌱🌱"],
	},
};

const testUnNormalizedBadWords = [
	"STRAWberry",
	"あいラブすいか",
	"メロンメロンメロン",
	"PASSIONFRUIT",
	"マロン",
	"まろん",
	"blueberry",
	"🌱🌱",
];

const testUnNormalizedOkWords = [
	"strawberry",
	"スイカ",
	"めろん",
	"ｐássioｎｆｒｕｉｔ",
	"passionfruit",
	"BLUEBERRY",
	"iloveblueberry",
	"🌱🌱🌱",
];

describe("BadWordDetector (with checkUnNormalized option)", () => {
	const detector = new BadWordDetector(wordListForUnNormalizedCheck);

	it("Returns true when string contains a blacklisted word", () => {
		for (const badWord of testUnNormalizedBadWords) {
			expect(detector.isBad(badWord)).toBe(true);
		}
	});

	it("Returns false when string does not contain blacklisted word", () => {
		for (const okWord of testUnNormalizedOkWords) {
			expect(detector.isBad(okWord)).toBe(false);
		}
	});
});
