import { BadWordDetector } from "../";

// BadWordDetector converts hiragana to katakana when checking, so base list should not contain hiragana
const blacklistedWordList = [
	"strawberry",
	"スイカ",
	"西瓜",
	"メロン",
	"passionfruit",
	"桃",
	"苺",
	"キウィ",
	"ジュース",
	"アサイー",
	"ピザ",
];

// BadWordDetector should detect all these
const testBlacklistedInput = [
	"STRáWBERRY",
	"   　STRAW🍓 BERRY",
	"すいか",
	"すい＊＊＊か",
	"西瓜",
	"めろん",
	"　め　ろ　ん　・・",
	"ｐássioｎｆｒｕｉｔ",
	"　桃",
	"苺~~~~!!",
	"きうぃ",
	"じゅーす",
	"じ🍊ゅ＆＆ーす",
	"あさいー",
	"ぴざ",
];

// BadWordDetector should allow these
const testOkInput = [
	"elephant",
	"blueberry",
	"berry",
	"passion",
	"fruit",
	"シマウマ",
	"黒猫",
	"アイス",
	"カワウソ",
	"メロディー",
	"ひざ",
	"ひさ",
	"ピサ",
	"シューす",
	"シューズ",
	"スイーツ",
	"きう",
];

describe("BadWordDetector", () => {
	const detector = new BadWordDetector(blacklistedWordList);

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
