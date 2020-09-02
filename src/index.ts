import { deburr } from "lodash";

// key is the word itself, value is an array of words containing key which should be allowed (whitelist)
interface WordList {
	[wordToDetect: string]: string[];
}

export class BadWordDetector {
	private wordList: WordList;

	constructor(wordList: WordList) {
		this.wordList = wordList;
	}

	private removeSpaces(word: string): string {
		return word.replace(/\s+/g, "");
	}

	private removeNonLetters(word: string): string {
		return word.replace(/([^\p{L}-]+)/ug, () => "");
	}

	private hiraganaToKatakana(word: string): string {
		return word.replace(/[\u3041-\u3096]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 0x60));
	}

	private normalizeWord(word: string): string {
		const spacesRemoved = this.removeSpaces(word);

		const hiraganaToKatakana = this.hiraganaToKatakana(spacesRemoved);
		// 全角英語を半角にする、半角カタカナを全角にする
		const widthNormalized = hiraganaToKatakana.normalize("NFKC");
		const accentsRemoved = deburr(widthNormalized);

		const specialCharsRemoved = this.removeNonLetters(accentsRemoved);
		if (!specialCharsRemoved.length) throw new Error("Input contains no valid characters");

		return specialCharsRemoved.toLowerCase();
	}

	private containsExactMatch(word: string): boolean {
		return this.wordList.hasOwnProperty(word);
	}

	private containsMatch(word: string): boolean {
		return this.containsExactMatch(word) || this.containsPartialMatch(word);
	}

	private containsMatchAfterRemovingWhitelistedWord(word: string, whitelistedWord: string, indexOccurredAt: number): boolean {
		const wordBefore = word.substring(0, indexOccurredAt);
		const wordAfter = word.substr(indexOccurredAt + whitelistedWord.length);

		if (wordBefore.length) {
			const containsBadWord = this.containsMatch(wordBefore);
			if (containsBadWord) return true;
		}

		if (wordAfter.length) {
			const containsBadWord = this.containsMatch(wordAfter);
			if (containsBadWord) return true;
		}

		return false;
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

				if (this.wordList.hasOwnProperty(toCheck)) {
					const whiteList = this.wordList[toCheck];
					if (!whiteList.length) return true;

					for (const okWord of whiteList) {
						const occurringIndex = word.indexOf(okWord);

						if (occurringIndex < 0) continue;

						return this.containsMatchAfterRemovingWhitelistedWord(word, okWord, occurringIndex);
					}
				}
				maxIndex++;
			}
		}

		return false;
	}

	isBad(input: string): boolean {
		if (!input.length) throw new Error("Input is empty");

		const normalizedWord = this.normalizeWord(input);

		return this.containsMatch(normalizedWord);
	}
}
