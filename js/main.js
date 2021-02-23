window.onload = () => {
	const reset = document.getElementById("reset");
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const lineWidth = 15;
	const lineColor = "#000000";
	const canvasWidth = 20 * 20 + 1;
	const canvasHeight = 20 * 20 + 1;

	let isDrawing = false;
	let curPos; // current position
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	/* Clear Canvas with white background*/
	clear();

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
		img.src = canvas.toDataURL("image/jpeg", 1.0);

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
		"Plus Symbol",
		"Decimal Symbol",
		"Division Symbol",
		"Equals Symbol",
		"Multiplication Symbol",
		"Subtraction Symbol",
	];
	const model = tf.loadLayersModel("tfjs_model/model.json");
	model.then(
		function (res) {
			let image = tf.browser.fromPixels(canvas);
			image = tf.image.resizeBilinear(image, (size = [100, 100]));
			image = image.expandDims(0);
			//console.log(image);
			const output = res.predict(image);
			const probDist = tf.softmax(output);

			let probArr = probDist.dataSync();

			let index, confidence;
			[index, confidence] = getIndexAndConfidence(probArr);
			confidence = Math.round(confidence * 100);
			const label = className[index];
			console.log(confidence, label);
			removePrediction();
			writePrediction(label, confidence);
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
	}
	if (confidence < 95 && confidence > 80) {
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
	}

	if (confidence < 80 && confidence > 60) {
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
	}
	if (confidence < 60) {
		prediction.innerHTML = "I have no idea 😩";
	}
}

function removePrediction() {
	let prediction = document.getElementById("prediction");
	prediction.innerHTML = "";
}
