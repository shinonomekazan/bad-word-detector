export class BadWordDetector {
	private wordList: string[];

	constructor(wordList: string[]) {
		this.wordList = wordList;
	}

	private removeSpaces(word: string): string {
		return word.replace(/\s+/g, "");
	}

	private removeNonLetters(word: string): string {
		return word.replace(/([^\p{L}-]+)/ug, () => "");
	}

	private containsJapanese(word: string): boolean {
		const japaneseCharRegex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;

		if (!japaneseCharRegex.test(word)) return false;

		return true;
	}

	private hiraganaToKatakana(word: string): string {
		return word.replace(/[\u3041-\u3096]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 0x60));
	}

	private normalizeWord(word: string): string {
		const spacesRemoved = this.removeSpaces(word);

		const containsJapaneseOrFullWidthEnglish = this.containsJapanese(spacesRemoved);

		let normalized = spacesRemoved;
		if (containsJapaneseOrFullWidthEnglish) {
			const hiraganaToKatakana = this.hiraganaToKatakana(normalized);
			// 全角英語を半角にする、半角カタカナを全角にする
			normalized = hiraganaToKatakana.normalize("NFKC");
		}

		// 全角英語も「containsJapanese」になってしまうので、７１行目でノーマライズされたあとももう一回チェックする
		const containsJapanese = this.containsJapanese(normalized);
		if (!containsJapanese) {
			// "â"を"a"にするとか
			// NKFDは日本語が入っていると「ド」が「ト」になったりするので使えない
			normalized = normalized.normalize("NFKD");
		}

		const specialCharsRemoved = this.removeNonLetters(normalized);
		if (!specialCharsRemoved.length) throw new Error("Input contains no valid characters");

		return specialCharsRemoved.toLowerCase();
	}

	private containsExactMatch(word: string): boolean {
		return this.wordList.includes(word);
	}

	private containsPartialMatch(word: string): boolean {
		for (let i = 0; i < word.length; i++) {
			let maxIndex = i;

			while (maxIndex < word.length) {
				// This was already confirmed in containsExactMatch
				if (i === 0 && maxIndex === word.length - 1) {
					maxIndex++;
					continue;
				}

				const toCheck = word.substring(i, maxIndex + 1);

				if (this.wordList.includes(toCheck)) {
					return true;
				}
				maxIndex++;
			}
		}

		return false;
	}

	isBad(input: string): boolean {
		if (!input.length) throw new Error("Input is empty");

		const normalizedWord = this.normalizeWord(input);

		if (this.containsExactMatch(normalizedWord)) return true;

		if (this.containsPartialMatch(normalizedWord)) return true;

		return false;
	}
}
