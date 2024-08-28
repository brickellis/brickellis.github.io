// 20 equations with operators
// Make equations disappear if they are not
// Start with blank screen 

const equationbox = document.querySelector("[data-equation-box]");
const alertContainer = document.querySelector("[data-alert-container]");
const ribbonContainer = document.querySelector("[data-ribbon]");
const LEVEL = 4;
const NUMBER_LIMIT = 14;
const NUM_EQUATIONS = 20;
var start_time = null;
var seed = "0000000000";
var numList = [];
var extraEquations = 0;
var interaction = false;
var displayseed = seed;

function linearRandomGenerator(seed, a, b, m, n) {
    const results = [];
    displayseed = seed;
    if (seed === "0000000000") {
        displayseed = String(Math.floor(Math.random() * 9999999999) + 1);
    }
    var calcseed = displayseed
    for (let i = 0; i < n; i++) {
        const sublist = [];
        for (let j = 0; j < 3; j++) {
            calcseed = (a * calcseed + b) % m;
            sublist.push(calcseed);
        }
        results.push(sublist);
    }
    return results;
}

function setEquations() {
    numList = linearRandomGenerator(seed, 27425, 17, 421717, NUM_EQUATIONS);
    numList.unshift([0,0,0], ['Blank',1,1], ['Blank',1,1]);
    const formulas = [...equationbox.querySelectorAll(".formula")];
    formulas.forEach((formula) => {
        var [equation, answer] = createEquation(numList.shift());
        setEquation(formula, equation, answer)
    })
}

function setEquation(formula, equation, answer) {
    formula.querySelector(".equation").textContent = equation;
    formula.querySelector(".answer").setAttribute('ans', answer);
    checkClear(answer.textContent);
}

function createEquation([num1, num2, operator]) {
    if (num1 === 'Blank') {
        return ['', ''];
    }
    num1 %= NUMBER_LIMIT;
    num2 %= NUMBER_LIMIT;
    if (operator % LEVEL === 3 && num1 === 0) {
        operator = 2
    }
    var sum = num1 + num2;
    var product = num1 * num2;
    if (operator % LEVEL === 0) return [`${num1} + ${num2} =`, sum];
    if (operator % LEVEL === 1) return [`${sum} - ${num1} =`, num2]
    if (operator % LEVEL === 2) return [`${num1} * ${num2} =`, product]
    if (operator % LEVEL === 3) return [`${product} / ${num1} =`, num2]
}

function startInteraction() {
    interaction = true;
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        document.addEventListener('touchstart', handleMouseClick, false);
      } else {
        document.addEventListener('click', handleMouseClick, false);
      }
    // document.addEventListener("touchstart", handleMouseClick);
    document.addEventListener("keydown", handleKeyPress);
}

function stopInteraction() {
    interaction = false;
}

function handleMouseClick(e) {
    if (interaction) {
        if (e.target.matches("[data-num]")) {
            addNum(e.target.dataset.num);
        }
        if (e.target.matches("[data-delete]")) {
            deleteNum();
        }
    }
    if (e.target.matches("[restart]")) {
        ribbonContainer.querySelector("[restart]").blur()
        restartAll();
    }
    if (e.target.matches("[set-seed]")) {
        ribbonContainer.querySelector("[set-seed]").blur()
        setSeed();
    }
    if (e.target.matches("[info]")) {
        ribbonContainer.querySelector("[info]").blur()
        showInfo();
    }
}

function handleKeyPress(e) {
    if (interaction) {
        if (e.key.match(/^[0-9]$/)) {
            addNum(e.key);
        }
        if (e.key === "Backspace" || e.key === "Delete") {
            deleteNum();
        }
    }
    if (e.key.match(/^r$/)) {
        restartAll();
    }
    if (e.key.match(/^s$/)) {
        setSeed();
    }
}

function addNum(num) {
    answer = getActiveAnswer();
    var temp = answer.textContent + num;
    const equationText = equationbox.querySelector(".formula .equation").textContent;

    if (temp.length < 6 || equationText === "Set Seed") {
        answer.textContent += num;
    }
    if (equationText === "Set Seed") {
        if (temp.length === 10) {
            seed = temp;
            equationbox.querySelector(".active").style.gridTemplateColumns = 'minmax(auto, 5em) 3em';
            restartAll();
        }
        return;
    }
    checkClear(answer.textContent);
}

function deleteNum() {
    answer = getActiveAnswer();
    var temp = answer.textContent;
    if (temp.length > 0) {
        temp = temp.slice(0, -1);
        answer.textContent = temp;
    }
}

function getActiveEquation() {
    return equationbox.querySelector(".active > .equation")
}

function getActiveAnswer() {
    return equationbox.querySelector('.active .answer');
}

function checkClear(ans) {
    const activeFormula = document.querySelector('.formula.active');
    answer = activeFormula.querySelector(".answer").getAttribute('ans')
    if (answer === ans || answer === '') {
        if (start_time === null) {
            start_time = new Date().getTime()
        }
        const nextFormula = activeFormula.nextElementSibling ? activeFormula.nextElementSibling : document.querySelector('.equation-box').firstElementChild;
        activeFormula.classList.remove("active"); if (extraEquations === 2) {
            gameOver();
            return;
        }
        nextFormula.classList.add("active");
        if (numList.length === 0) {
            extraEquations += 1;
            return;
        }
        activeFormula.querySelector(".answer").textContent = ""
        var [equation, answer] = createEquation(numList.shift());
        setEquation(activeFormula, equation, answer)
    }
}

function gameOver() {
    var seconds = String((new Date().getTime() - start_time) / 1000)
    showAlert(`Game Over!\r\nEquations: ${NUM_EQUATIONS}\r\nTime: ${seconds}s\r\nSeed: ${displayseed}`);
    stopInteraction();
}

function showAlert(message) {
    const alert = document.createElement("div");
    alert.textContent = message;
    alert.classList.add("alert");
    alertContainer.prepend(alert);
}

function startUp() {
    setEquations();
    startInteraction();
}

function restartAll() {
    equationbox.querySelectorAll('.formula').forEach(element => {
        element.style.gridTemplateColumns = 'minmax(auto, 5em) 3em';
    });
    clearAlerts();
    clearEquations();
    start_time = null;
    numList = [];
    extraEquations = 0;
    interaction = false;
    setEquations();
    startInteraction();
}

function clearEquations() {
    const active_formula = document.querySelector('.formula.active');
    if (active_formula) {
        active_formula.classList.remove("active");
    }
    equationbox.querySelector(".formula").classList.add("active")
    equationbox.querySelectorAll('.formula .equation, .formula .answer').forEach(element => {
        element.textContent = '';
    });
}

function clearAlerts() {
    while (alertContainer.firstChild) {
        alertContainer.removeChild(alertContainer.firstChild);
    }
}

function setSeed() {
    clearAlerts();
    clearEquations();
    equationbox.querySelector(".formula .equation").textContent = "Set Seed";
    equationbox.querySelector(".active").style.gridTemplateColumns = 'minmax(auto, 5em) 6em';
    startInteraction();
}

function showInfo() {
    clearAlerts()
    showAlert('Solve 20 equations as fast as possible.\r\nSeed with a 10-digit number to play against others.\r\nUse "0000000000" for a random seed.\r\nPress restart to exit this screen.\r\nP.S.- You can play this offline by right-clicking and saving as .html');
    stopInteraction();
    // 
}

startUp();

// Number of equations selector
// Operator selector
// Number ranges for both numbers