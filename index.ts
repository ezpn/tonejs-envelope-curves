import { EnvelopeCurves, type EnvelopeCurveName } from "./envelopeCurves";

type CurveData = {
	name: EnvelopeCurveName;
	values: number[];
};

const curveOrder: EnvelopeCurveName[] = [
	"linear",
	"exponential",
	"cosine",
	"sine",
	"ripple",
	"bounce",
	"step",
];

const curveColors: Record<EnvelopeCurveName, string> = {
	linear: "#2d7dd2",
	exponential: "#f45d01",
	cosine: "#00b4d8",
	sine: "#90be6d",
	ripple: "#f72585",
	bounce: "#9b5de5",
	step: "#f9c74f",
};

const defaultVisible: EnvelopeCurveName[] = [
	"linear",
	"exponential",
	"cosine",
	"sine",
];

function buildCurveData(direction: "In" | "Out"): CurveData[] {
	const curveLen = EnvelopeCurves.cosine.In.length;
	const linearCurve = new Array(curveLen)
		.fill(0)
		.map((_, i) => i / (curveLen - 1));
	const exponentialCurve = new Array(curveLen)
		.fill(0)
		.map((_, i) => Math.pow(i / (curveLen - 1), 2.4));
	const linearRelease = linearCurve.slice().reverse();
	const exponentialRelease = exponentialCurve.slice().reverse();

	return curveOrder.map((name) => {
		const curve = EnvelopeCurves[name];
		if (curve === "linear") {
			return {
				name,
				values: direction === "In" ? linearCurve : linearRelease,
			};
		}
		if (curve === "exponential") {
			return {
				name,
				values: direction === "In" ? exponentialCurve : exponentialRelease,
			};
		}
		return { name, values: curve[direction] };
	});
}

function drawGrid(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	padding: number,
	gridLines: number,
) {
	ctx.save();
	ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
	ctx.lineWidth = 1;
	for (let i = 0; i <= gridLines; i++) {
		const t = i / gridLines;
		const x = padding + t * (width - padding * 2);
		const y = padding + t * (height - padding * 2);
		ctx.beginPath();
		ctx.moveTo(x, padding);
		ctx.lineTo(x, height - padding);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(width - padding, y);
		ctx.stroke();
	}
	ctx.restore();
}

function drawScales(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	padding: number,
	gridLines: number,
) {
	ctx.save();
	ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
	ctx.font = "12px Inter, system-ui, -apple-system, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	for (let i = 0; i <= gridLines; i++) {
		const t = i / gridLines;
		const x = padding + t * (width - padding * 2);
		ctx.fillText(t.toFixed(2).replace(/\.00$/, ""), x, height - padding + 8);
	}
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	for (let i = 0; i <= gridLines; i++) {
		const t = i / gridLines;
		const y = height - padding - t * (height - padding * 2);
		ctx.fillText(t.toFixed(2).replace(/\.00$/, ""), padding - 8, y);
	}
	ctx.restore();
}

function drawCurve(
	ctx: CanvasRenderingContext2D,
	values: number[],
	color: string,
	width: number,
	height: number,
	padding: number,
) {
	const len = values.length;
	if (!len) return;
	ctx.save();
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.beginPath();
	for (let i = 0; i < len; i++) {
		const x = padding + (i / (len - 1)) * (width - padding * 2);
		const y = height - padding - values[i] * (height - padding * 2);
		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	ctx.stroke();
	ctx.restore();
}

function init() {
	const controls = document.getElementById("controls");
	const attackCanvas = document.getElementById(
		"attack-canvas",
	) as HTMLCanvasElement | null;
	const releaseCanvas = document.getElementById(
		"release-canvas",
	) as HTMLCanvasElement | null;
	if (!controls || !attackCanvas || !releaseCanvas) {
		return;
	}

	const attackData = buildCurveData("In");
	const releaseData = buildCurveData("Out");
	const visibility = new Map<EnvelopeCurveName, boolean>();
	curveOrder.forEach((name) =>
		visibility.set(name, defaultVisible.includes(name)),
	);

	for (const name of curveOrder) {
			const item = document.createElement("div");
		item.className = "control-item";
			const button = document.createElement("button");
			button.type = "button";
			button.className = "control-button";
			const accent = curveColors[name];
			button.style.setProperty("--accent", accent);
			button.style.setProperty("--accent-bg", hexToRgba(accent, 0.18));
			const isVisible = visibility.get(name) ?? false;
			button.classList.toggle("is-active", isVisible);
			button.setAttribute("aria-pressed", String(isVisible));
			button.addEventListener("click", () => {
				const next = !(visibility.get(name) ?? false);
				visibility.set(name, next);
				button.classList.toggle("is-active", next);
				button.setAttribute("aria-pressed", String(next));
				draw(attackCtx!, attackData, attackCanvas);
				draw(releaseCtx!, releaseData, releaseCanvas);
			});
		const dot = document.createElement("span");
		dot.className = "color-dot";
			dot.style.background = accent;
		const label = document.createElement("span");
		label.textContent = name;
			button.append(dot, label);
			item.appendChild(button);
		controls.appendChild(item);
	}

		function hexToRgba(hex: string, alpha: number) {
			const normalized = hex.replace("#", "");
			const bigint = parseInt(normalized, 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			return `rgba(${r}, ${g}, ${b}, ${alpha})`;
		}

	const attackCtx = attackCanvas.getContext("2d");
	const releaseCtx = releaseCanvas.getContext("2d");
	if (!attackCtx || !releaseCtx) {
		return;
	}

	function resizeCanvas(
		canvasEl: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
	) {
		const height = 360;
		const width = 500;
		const dpr = window.devicePixelRatio || 1;
		canvasEl.width = Math.floor(width * dpr);
		canvasEl.height = Math.floor(height * dpr);
		canvasEl.style.height = `${height}px`;
		canvasEl.style.width = `${width}px`;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function draw(
		ctx: CanvasRenderingContext2D,
		data: CurveData[],
		canvasEl: HTMLCanvasElement,
	) {
		const width = canvasEl.width / (window.devicePixelRatio || 1);
		const height = canvasEl.height / (window.devicePixelRatio || 1);
		const padding = 36;
		const gridLines = 4;
		ctx.clearRect(0, 0, width, height);
		drawGrid(ctx, width, height, padding, gridLines);
		drawScales(ctx, width, height, padding, gridLines);
		for (const curve of data) {
			if (!visibility.get(curve.name)) continue;
			drawCurve(
				ctx,
				curve.values,
				curveColors[curve.name],
				width,
				height,
				padding,
			);
		}
	}

	resizeCanvas(attackCanvas, attackCtx);
	resizeCanvas(releaseCanvas, releaseCtx);
	draw(attackCtx, attackData, attackCanvas);
	draw(releaseCtx, releaseData, releaseCanvas);
	window.addEventListener("resize", () => {
		resizeCanvas(attackCanvas, attackCtx);
		resizeCanvas(releaseCanvas, releaseCtx);
		draw(attackCtx, attackData, attackCanvas);
		draw(releaseCtx, releaseData, releaseCanvas);
	});
}

window.addEventListener("DOMContentLoaded", init);
