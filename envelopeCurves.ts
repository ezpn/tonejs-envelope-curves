/**
 * This code comes from Tone.js (https://tonejs.github.io/) 
 * and is licensed under the MIT License.
 * 
 * Repository: https://github.com/Tonejs/Tone.js/
 * Source file: https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/component/envelope/Envelope.ts
 * 
 * It is used directly with small changes required to expose the methods and interfaces to visualize envelope curves in the application.
 * 
 * Original license:
 * 
 * MIT License
 * Copyright (c) 2014-2020 Yotam Mann
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
export interface EnvelopeCurveObject {
	In: number[];
	Out: number[];
}

export interface EnvelopeCurveMap {
	linear: "linear";
	exponential: "exponential";
	bounce: EnvelopeCurveObject;
	cosine: EnvelopeCurveObject;
	sine: EnvelopeCurveObject;
	ripple: EnvelopeCurveObject;
	step: EnvelopeCurveObject;
}

export type EnvelopeCurveName = keyof EnvelopeCurveMap;

/**
 * Generate some complex envelope curves.
 */
export const EnvelopeCurves: EnvelopeCurveMap = (() => {
	const curveLen = 128;

	let i: number;
	let k: number;

	// cosine curve
	const cosineCurve: number[] = [];
	for (i = 0; i < curveLen; i++) {
		cosineCurve[i] = Math.sin((i / (curveLen - 1)) * (Math.PI / 2));
	}

	// ripple curve
	const rippleCurve: number[] = [];
	const rippleCurveFreq = 6.4;
	for (i = 0; i < curveLen - 1; i++) {
		k = i / (curveLen - 1);
		const sineWave =
			Math.sin(k * (Math.PI * 2) * rippleCurveFreq - Math.PI / 2) + 1;
		rippleCurve[i] = sineWave / 10 + k * 0.83;
	}
	rippleCurve[curveLen - 1] = 1;

	// stairs curve
	const stairsCurve: number[] = [];
	const steps = 5;
	for (i = 0; i < curveLen; i++) {
		stairsCurve[i] = Math.ceil((i / (curveLen - 1)) * steps) / steps;
	}

	// in-out easing curve
	const sineCurve: number[] = [];
	for (i = 0; i < curveLen; i++) {
		k = i / (curveLen - 1);
		sineCurve[i] = 0.5 * (1 - Math.cos(Math.PI * k));
	}

	// a bounce curve
	const bounceCurve: number[] = [];
	for (i = 0; i < curveLen; i++) {
		k = i / (curveLen - 1);
		const freq = Math.pow(k, 3) * 4 + 0.2;
		const val = Math.cos(freq * Math.PI * 2 * k);
		bounceCurve[i] = Math.abs(val * (1 - k));
	}

	/**
	 * Invert a value curve to make it work for the release
	 */
	function invertCurve(curve: number[]): number[] {
		const out = new Array(curve.length);
		for (let j = 0; j < curve.length; j++) {
			out[j] = 1 - curve[j];
		}
		return out;
	}

	/**
	 * reverse the curve
	 */
	function reverseCurve(curve: number[]): number[] {
		return curve.slice(0).reverse();
	}

	/**
	 * attack and release curve arrays
	 */
	return {
		bounce: {
			In: invertCurve(bounceCurve),
			Out: bounceCurve,
		},
		cosine: {
			In: cosineCurve,
			Out: reverseCurve(cosineCurve),
		},
		exponential: "exponential" as const,
		linear: "linear" as const,
		ripple: {
			In: rippleCurve,
			Out: invertCurve(rippleCurve),
		},
		sine: {
			In: sineCurve,
			Out: invertCurve(sineCurve),
		},
		step: {
			In: stairsCurve,
			Out: invertCurve(stairsCurve),
		},
	};
})();