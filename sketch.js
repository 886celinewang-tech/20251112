let gameState = 'START'; // START, QUIZ, RESULTS
let startButton;
let submitButton;

let consonants = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
let vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ'];

let quizChars = [];
let charCards = [];
let targetBoxes = [];

let draggingCard = null;
let dragOffsetX, dragOffsetY;

let score = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  startButton = createButton('開始測驗');
  startButton.mousePressed(startQuiz);

  submitButton = createButton('送出');
  submitButton.mousePressed(showResults);
  submitButton.hide();

  updateLayout();
}

function draw() {
  background(230);

  if (gameState === 'START') {
    drawStartScreen();
  } else if (gameState === 'QUIZ') {
    drawQuizScreen();
  } else if (gameState === 'RESULTS') {
    drawResultsScreen();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}

function updateLayout() {
    // 按鈕位置
    startButton.position(width / 2 - 50, height / 2 + 60);
    submitButton.position(width / 2 - 30, height - 50);

    // 目標區域
    targetBoxes = [
        { x: width / 2 - 170, y: height / 2 - 150, w: 100, h: 320, label: '子音', type: 'consonant', dropped: [] },
        { x: width / 2 - 60, y: height / 2 - 150, w: 100, h: 320, label: '母音', type: 'vowel', dropped: [] }
    ];
    resetCharCardPositions();
}

function drawStartScreen() {
  textSize(24);
  text('韓文子母音測驗', width / 2, height / 2 - 80);
  textSize(16);
  text('請將右方的字卡拖曳到左方對應的\n「子音」或「母音」方塊中。\n完成5題後，點擊「送出」查看分數。', width / 2, height / 2 - 20);
}

function drawQuizScreen() {
  // 繪製目標區域
  for (let box of targetBoxes) {
    stroke(0);
    strokeWeight(2);
    fill(255);
    rect(box.x, box.y, box.w, box.h, 10);
    noStroke();
    fill(0);
    textSize(18);
    text(box.label, box.x + box.w / 2, box.y + box.h / 2);
  }

  // 繪製字卡
  for (let card of charCards) {
    if (card !== draggingCard) {
      drawCard(card);
    }
  }
  // 繪製正在拖曳的卡片 (最上層)
  if (draggingCard) {
    drawCard(draggingCard);
  }

  // 檢查是否所有卡片都已放置
  let allDropped = charCards.every(card => card.droppedOn !== null);
  if (allDropped) {
    submitButton.show();
  } else {
    submitButton.hide();
  }
}

function drawCard(card) {
  push();
  translate(card.x, card.y);
  stroke(150);
  strokeWeight(1);
  fill(255, 255, 200);
  rect(0, 0, 50, 50, 5);
  noStroke();
  fill(0);
  textSize(28);
  text(card.char, 25, 25);
  pop();
}

function drawResultsScreen() {
  textSize(32);
  text('測驗結束！', width / 2, height / 2 - 60);
  textSize(24);
  text('你的分數是: ' + score, width / 2, height / 2);
}

function startQuiz() {
  gameState = 'QUIZ';
  startButton.hide();
  generateQuiz();
}

function generateQuiz() {
  quizChars = [];
  charCards = [];
  score = 0;

  // 隨機選3個子音和2個母音 (或反過來)
  let tempConsonants = [...consonants];
  let tempVowels = [...vowels];
  let numConsonants = random([2, 3]);

  for (let i = 0; i < numConsonants; i++) {
    let index = floor(random(tempConsonants.length));
    quizChars.push({ char: tempConsonants[index], type: 'consonant' });
    tempConsonants.splice(index, 1);
  }

  for (let i = 0; i < 5 - numConsonants; i++) {
    let index = floor(random(tempVowels.length));
    quizChars.push({ char: tempVowels[index], type: 'vowel' });
    tempVowels.splice(index, 1);
  }

  // 打亂順序
  quizChars = shuffle(quizChars);

  // 創建字卡物件
  for (let i = 0; i < quizChars.length; i++) {
    const originalX = width / 2 + 100;
    const originalY = height / 2 - 150 + i * 70;
    charCards.push({
      x: originalX,
      y: originalY,
      char: quizChars[i].char,
      type: quizChars[i].type,
      isDragging: false,
      droppedOn: null,
      originalX: originalX,
      originalY: originalY
    });
  }
}

function resetCharCardPositions() {
    for (let card of charCards) {
        if (!card.droppedOn) {
            card.x = width / 2 + 100;
            card.y = card.originalY; // Keep original Y to avoid re-shuffling
            card.originalX = card.x;
        }
    }
}

function mousePressed() {
  if (gameState !== 'QUIZ') return;

  for (let i = charCards.length - 1; i >= 0; i--) {
    let card = charCards[i];
    if (mouseX > card.x && mouseX < card.x + 50 && mouseY > card.y && mouseY < card.y + 50) {
      draggingCard = card;
      dragOffsetX = card.x - mouseX;
      dragOffsetY = card.y - mouseY;

      // 如果卡片已放置，將其從目標區域移除
      if (card.droppedOn) {
        let box = card.droppedOn;
        let cardIndex = box.dropped.indexOf(card);
        if (cardIndex > -1) { box.dropped.splice(cardIndex, 1); }
        card.droppedOn = null;
      }
      break;
    }
  }
}

function mouseDragged() {
  if (draggingCard) {
    draggingCard.x = mouseX + dragOffsetX;
    draggingCard.y = mouseY + dragOffsetY;
  }
}

function mouseReleased() {
  if (draggingCard) {
    let dropped = false;
    for (let box of targetBoxes) {
      // 檢查是否有卡片中心點在目標區域內
      if (
        mouseX > box.x && mouseX < box.x + box.w &&
        mouseY > box.y && mouseY < box.y + box.h
      ) {
        // 將卡片放置在目標區域內，稍微錯開以顯示堆疊效果
        const droppedCount = box.dropped.length;
        draggingCard.x = box.x + box.w / 2 - 25 + droppedCount * 5;
        draggingCard.y = box.y + 20 + droppedCount * 50;
        draggingCard.droppedOn = box;
        box.dropped.push(draggingCard);
        dropped = true;
        break;
      }
    }

    // 如果沒有放置在任何目標區域，則返回原位
    if (!dropped) {
      draggingCard.x = draggingCard.originalX;
      draggingCard.y = draggingCard.originalY;
      draggingCard.droppedOn = null;
    }

    draggingCard = null;
  }
}

function showResults() {
  score = 0;
  for (let card of charCards) {
    if (card.droppedOn && card.type === card.droppedOn.type) {
      score += 20;
    }
  }
  gameState = 'RESULTS';
  submitButton.hide();

  // 這裡可以加入一個 "再玩一次" 的按鈕
  let retryButton = createButton('再玩一次');
  retryButton.position(width / 2 - 40, height / 2 + 60);
  retryButton.mousePressed(() => {
    retryButton.remove();
    resetQuiz();
  });
}

function resetQuiz() {
  for (let box of targetBoxes) {
    box.dropped = [];
  }
  gameState = 'QUIZ';
  updateLayout();
  generateQuiz();
}
