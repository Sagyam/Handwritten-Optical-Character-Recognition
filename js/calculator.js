const map = {
	0: "0",
	1: "1",
	2: "2",
	3: "3",
	4: "4",
	5: "5",
	6: "6",
	7: "7",
	8: "8",
	9: "9",
	Plus: "+",
	Decimal: ".",
	Divison: "/",
	Equals: "=",
	Multiply: "*",
	Subtract: "-",
};

function mapper(stack) {
	let mappedArr = [];
	for (let i = 0; i < stack.length; i++) {
		mappedArr.push(map[stack[i]]);
	}

	return mappedArr;
}

function calc() {
	mappedStack = mapper(STACK);
	let finalExpression = mappedStack.join("");
	ansBox = document.getElementById("answer");
	ans = eval(finalExpression);
	if (ans.isFloat) {
		ans = ans.toPrecision(2);
	}

	ansBox.innerHTML = "The answer is <strong>" + ans + "</strong>";
}
