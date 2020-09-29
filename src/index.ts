import { deburr } from "lodash";

// key is the word itself, value is an array of words containing key which should be allowed (whitelist)
export interface WordList {
	[wordToDetect: string]: {
		whitelist: string[];
		mode?: DetectionMode;
	};
}

interface WordToCheck {
	word: string;
	isSlice: boolean;
	isNormalized: boolean;
}

export enum DetectionMode {
	Default = 1,
	ExactMatch = 2, // ngWord: apples. iloveapples = false, iloveAPPLES = false, APPLES = true, apples = true
	UnNormalizedOnly = 3, // ngWord: apples. iloveapples = true, iloveAPPLES = false, APPLES = false, apples = true
	UnNormalizedOnlyExactMatch = 4, // ngWord: apples. iloveapples = false, iloveAPPLES = false, APPLES = false, apples = true
};

interface Options {
	checkUnNormalized?: boolean;
}

export class BadWordDetector {
	constructor(private wordList: WordList, private options: Options = { checkUnNormalized: true }) {}

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

	private containsExactMatch(wordToCheck: WordToCheck): boolean {
		const { word, isSlice, isNormalized } = wordToCheck;

		const isContained = this.wordList.hasOwnProperty(word);

		if (!isContained) return false;

		const { mode } = this.wordList[word];

		if (mode) {
			// The string has been sliced already, so 'exact match' mode words are OK
			if ([DetectionMode.ExactMatch, DetectionMode.UnNormalizedOnlyExactMatch].includes(mode) && isSlice) return false;

			// The string has been normalized so 'unnormalized only' mode words are OK
			if ([DetectionMode.UnNormalizedOnly, DetectionMode.UnNormalizedOnlyExactMatch].includes(mode) && isNormalized) return false;
		}

		return true;
	}

	private containsMatch(word: WordToCheck): boolean {
		return this.containsExactMatch(word) || this.containsPartialMatch(word);
	}

	private containsMatchAfterRemovingWhitelistedWord(wordToCheck: WordToCheck, whitelistedWord: string, indexOccurredAt: number): boolean {
		const { word, isNormalized } = wordToCheck;

		const wordBefore = word.substring(0, indexOccurredAt);
		const wordAfter = word.substr(indexOccurredAt + whitelistedWord.length);

		if (wordBefore.length) {
			const containsBadWord = this.containsMatch({ word: wordBefore, isSlice: true, isNormalized });
			if (containsBadWord) return true;
		}

		if (wordAfter.length) {
			const containsBadWord = this.containsMatch({word: wordAfter, isSlice: true, isNormalized });
			if (containsBadWord) return true;
		}

		return false;
	}

	private containsPartialMatch(wordToCheck: WordToCheck): boolean {
		const { word, isNormalized } = wordToCheck;

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
					const { whitelist, mode } = this.wordList[toCheck];

					// If an 'exact match' word got past the exact match method, then it doesn't need to be flagged here
					if (mode) {
						if ([DetectionMode.ExactMatch, DetectionMode.UnNormalizedOnlyExactMatch].includes(mode) || mode === DetectionMode.UnNormalizedOnly && isNormalized) {
							maxIndex++;
							continue;
						}
					}

					if (!whitelist.length) return true;

					for (const okWord of whitelist) {
						const occurringIndex = word.indexOf(okWord);

						if (occurringIndex < 0) continue;

						return this.containsMatchAfterRemovingWhitelistedWord(wordToCheck, okWord, occurringIndex);
					}

					// the bad word was not whitelisted
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

		const normalizedIsBad = this.containsMatch({ word: normalizedWord, isSlice: false, isNormalized: true });
		const unNormalizedIsBad = this.options && this.options.checkUnNormalized ? this.containsMatch({ word: input, isSlice: false, isNormalized: false }) : false;

		return normalizedIsBad || unNormalizedIsBad;
	}
}
