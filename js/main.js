const model_path = "./models/CNN-16-cats/model.json";
const numChannels = 3;
let LABEL;
let CONFIDENCE;
let CONF_THRESH = 60;
let STACK = [];
className = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"Plus",
	"Decimal",
	"Divison",
	"Equals",
	"Multiply",
	"Subtract",
];
window.onload = () => {
	const reset = document.getElementById("reset");
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const lineWidth = 15;
	const lineColor = "#000000";
	const canvasWidth = 400;
	const canvasHeight = 400;

	let isDrawing = false;
	let curPos; // current position
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	/* Clear Canvas with white background*/
	clear();
	clearStack();

	function getPosition(clientX, clientY) {
		let box = canvas.getBoundingClientRect();
		return { x: clientX - box.x, y: clientY - box.y };
	}

	function draw(e) {
		if (isDrawing) {
			let pos = getPosition(e.clientX, e.clientY);
			ctx.strokeStyle = lineColor;
			ctx.lineWidth = lineWidth;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.beginPath();
			ctx.moveTo(curPos.x, curPos.y);
			ctx.lineTo(pos.x, pos.y);
			ctx.stroke();
			ctx.closePath();
			curPos = pos;
		}
	}

	canvas.onmousedown = function (e) {
		isDrawing = true;
		curPos = getPosition(e.clientX, e.clientY);
		draw(e);
	};

	canvas.onmousemove = function (e) {
		draw(e);
	};

	canvas.onmouseup = function (e) {
		isDrawing = false;
		const img = new Image();
		img.src = canvas.toDataURL();
		img.onload = predict();
	};

	reset.onclick = clear;

	function clear() {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		removePrediction();
	}
};

function predict() {
	pleaseWait();
	const model = tf.loadLayersModel(model_path);

	model.then(
		function (res) {
			let image = tf.browser.fromPixels(canvas, numChannels);
			image = tf.image.resizeBilinear(image, (size = [100, 100])); //resize to 100*100
			image = image.expandDims(0);
			const output = res.predict(image);
			const probDist = tf.softmax(output);

			let probArr = probDist.dataSync();

			let index;
			[index, CONFIDENCE] = getIndexAndConfidence(probArr);
			CONFIDENCE = Math.round(CONFIDENCE * 100);
			LABEL = className[index];

			//console.log(confidence, index, label);
			removePrediction();
			writePrediction(LABEL, CONFIDENCE);
		},
		function (err) {
			console.log(err);
		}
	);
}

function getIndexAndConfidence(probArr) {
	let highest = probArr[0];
	let index = 0;
	for (let i = 0; i < 16; i++) {
		if (probArr[i] > highest) {
			highest = probArr[i];
			index = i;
		}
	}
	return [index, highest];
}

function writePrediction(label, confidence) {
	let prediction = document.getElementById("prediction");

	if (confidence > 95) {
		prediction.innerHTML =
			"This is a " +
			"<strong class='green'>" +
			label +
			"</strong>" +
			" with " +
			"<strong class='green'>" +
			confidence +
			"%" +
			"</strong>" +
			" confidence 😎";
	} else if (confidence < 95 && confidence > 80) {
		prediction.innerHTML =
			"This maybe " +
			"<strong class='yellow'>" +
			label +
			"</strong>" +
			" with " +
			"<strong class='yellow'>" +
			confidence +
			"%" +
			"</strong>" +
			" confidence 🤔";
	} else if (confidence < 80 && confidence > CONF_THRESH) {
		prediction.innerHTML =
			"Umm, maybe it's " +
			"<strong class='red'>" +
			label +
			"</strong>" +
			" but with only " +
			"<strong class='red'>" +
			confidence +
			"%" +
			"</strong>" +
			" confidence 😕";
	} else {
		prediction.innerHTML = "I have no idea 😩";
	}
}

function removePrediction() {
	let prediction = document.getElementById("prediction");
	prediction.innerHTML = "";
}

function pleaseWait() {
	let prediction = document.getElementById("prediction");
	prediction.innerHTML = "Please Wait...";
}

function pushToStack() {
	if (CONFIDENCE > CONF_THRESH) {
		STACK.push(LABEL);
		showStack();
		//console.log(STACK);
	}
}

function clearStack() {
	STACK = [];
	stack = document.getElementById("stack");
	stack.innerHTML = "";
	ansBox = document.getElementById("answer");
	ansBox.innerHTML = "";
}

function showStack() {
	stack = document.getElementById("stack");
	let text = "";
	mappedArr = mapper(STACK);
	for (let i = 0; i < mappedArr.length; i++) {
		text += mappedArr[i];
		text += " ";
	}

	stack.innerHTML = text;
}
