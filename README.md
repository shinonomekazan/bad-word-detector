# bad-word-detector
Detect if Japanese/English input string contains blacklisted words, while allowing specified whitelisted words that contain blacklisted words.

Normalizes input string in the following ways:

- Removes accents from latin characters (`ë`→`e`)
- Fixes full-width latin characters to half-width (`ｆｒｕｉｔ`→`fruit`)
- Fixes half-width katakana to full-width (`ｼﾞｭｰｽ`→`ジュース`)
- Converts all hiragana to katakana (`じゅーす`→`ジュース`)
- Removes spaces & special characters

Optionally, you may specify a mode for each word in the bad word list to further control what gets marked as 'bad':

```
enum DetectionMode {
	Default = 1,
	ExactMatch = 2,
	UnNormalizedOnly = 3,
	UnNormalizedOnlyExactMatch = 4,
};
```

#### Example `isBad` outputs for the word `apples` with each detection mode are as follows:

|input|Default|ExactMatch|UnNormalizedOnly|UnNormalizedOnlyExactMatch|
|----|----|----|----|----|
|apples|true|true|true|true|
|APPLES|true|true|false|false|
|iloveapples|true|false|true|false|
|iloveAPPLES|true|false|false|false|

<br/>

#### Example `isBad` outputs for the word `モモ` with each detection mode are as follows:

|input|Default|ExactMatch|UnNormalizedOnly|UnNormalizedOnlyExactMatch|
|----|----|----|----|----|
|モモ|true|true|true|true|
|もも|true|true|false|false|
|モモが食べたい|true|false|true|false|
|ももが食べたい|true|false|false|false|

<br/>


## Usage

```
const badWordList = {
	苺: {
		whitelist: ["苺大福"],
	},
	ジュース: {
		whitelist: [],
	},
	watermelon: {
		mode: 2,
		whitelist: [],
	}
};

const badWordDetector = new BadWordDetector(badWordList);

badWordDetector.isBad("苺が食べたい"); // true
badWordDetector.isBad("ｼﾞｭｰｽ"); // true
badWordDetector.isBad("じゅーす"); // true
badWordDetector.isBad("ｗaｔ🍉ｅｒmëlon"); // true

badWordDetector.isBad("苺大福が食べたい"); // false
badWordDetector.isBad("シューズ"); // false
badWordDetector.isBad("シュース"); // false
badWordDetector.isBad("melon"); // false
badWordDetector.isBad("water"); // false
badWordDetector.isBad("containswatermelonbutok"); // false
badWordDetector.isBad("i loveｗaｔ🍉ｅｒmëlon"); // false
```
