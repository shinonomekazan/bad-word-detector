import { BadWordDetector } from "../";

// BadWordDetector converts hiragana to katakana when checking, so base list should not contain hiragana
const wordList = {
	strawberry: [],
	スイカ: [],
	西瓜: [],
	メロン: [],
	passionfruit: [],
	桃: [],
	苺: [],
	キウィ: [],
	ジュース: [],
	アサイー: [],
	ピザ: [],
	サクランボ: ["サクランボボ", "オッケーサクランボ"]
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
	"オッケーサクランボサクランボ"
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
	"オッケーサクランボ"
];

describe("BadWordDetector", () => {
	const detector = new BadWordDetector(wordList);

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
