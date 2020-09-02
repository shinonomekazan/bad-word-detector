# bad-word-detector
Detect if Japanese/English input string contains blacklisted words, while allowing specified whitelisted words that contain blacklisted words.

Normalizes input string in the following ways:

- Removes accents from latin characters (`ë`→`e`)
- Fixes full-width latin characters to half-width (`ｆｒｕｉｔ`→`fruit`)
- Fixes half-width katakana to full-width (`ｼﾞｭｰｽ`→`ジュース`)
- Converts all hiragana to katakana (`じゅーす`→`ジュース`)
- Removes spaces & special characters

## Usage

```
const badWordList = {
	苺: [],
	ジュース: [],
	watermelon: ["containswatermelonbutok", "watermelondontblacklist"],
};

const badWordDetector = new BadWordDetector(badWordList);

badWordDetector.isBad("苺が食べたい"); // true
badWordDetector.isBad("ｼﾞｭｰｽ"); // true
badWordDetector.isBad("じゅーす"); // true
badWordDetector.isBad("i loveｗaｔ🍉ｅｒmëlon"); // true

badWordDetector.isBad("シューズ"); // false
badWordDetector.isBad("シュース"); // false
badWordDetector.isBad("melon"); // false
badWordDetector.isBad("water"); // false
badWordDetector.isBad("containswatermelonbutok"); // false
```
