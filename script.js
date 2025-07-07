let flags = {}, countries = [];
let score = 0, wrong = 0, timer, timeLeft = 15, currentCountry = "";
let highScore = localStorage.getItem("flagHighScore") || 0;
document.getElementById("highScoreDisplay").innerText = highScore;

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
}

function initGame() {
  fetch('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
    .then(res => res.json())
    .then(data => {
      data = data.filter(c => c.code.length === 2);
      flags = {};
      countries = [];
      data.forEach(c => {
        flags[c.name] = c.emoji;
        countries.push(c.name);
      });
      startGame();
    });
}

function startGame() {
  score = 0;
  wrong = 0;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "flex";
  nextRound();
}

function nextRound() {
  clearInterval(timer);
  timeLeft = 15;
  document.getElementById("timerDisplay").style.display = "block";
  document.getElementById("scoreDisplay").style.display = "block";
  document.getElementById("countryName").style.display = "block";
  document.getElementById("timerDisplay").innerText = `Time left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timerDisplay").innerText = `Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleWrong(null);
    }
  }, 1000);

  currentCountry = countries[Math.floor(Math.random() * countries.length)];
  document.getElementById("countryName").innerText = currentCountry;

  let options = [currentCountry];
  while (options.length < 4) {
    let opt = countries[Math.floor(Math.random() * countries.length)];
    if (!options.includes(opt)) options.push(opt);
  }
  options.sort(() => Math.random() - 0.5);

  const grid = document.getElementById("flagOptions");
  grid.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "flag-btn";
    btn.innerText = flags[opt];
    btn.onclick = () => checkAnswer(opt);
    grid.appendChild(btn);
  });
}

function checkAnswer(selected) {
  if (selected === currentCountry) {
    document.getElementById("correctSound").play();
    score += 10;
    document.getElementById("gameMessage").innerText = "Correct!";
    document.getElementById("scoreDisplay").innerText = `Score: ${score}`;
    setTimeout(nextRound, 1000);
  } else {
    handleWrong(selected);
  }
}

function handleWrong(selected) {
  document.getElementById("wrongSound").play();
  wrong++;
  if (wrong >= 3) {
    clearInterval(timer);
    if (score > highScore) {
      localStorage.setItem("flagHighScore", score);
      document.getElementById("highScoreDisplay").innerText = score;
    }

    document.getElementById("countryName").style.display = "none";
    document.getElementById("timerDisplay").style.display = "none";
    document.getElementById("scoreDisplay").style.display = "none";

    document.getElementById("flagOptions").innerHTML = `
      <div class="game-over-container">
        <div class="game-over-text">Game Over!!!!!</div>
        <div>Your Score: ${score}</div>
        <div>High Score: ${Math.max(score, highScore)}</div>
        <button class="btn" onclick="initGame()">New Game</button>
        <button class="btn" onclick="initMultiplayer()">Multiplayer</button>
      </div>
    `;
    document.getElementById("gameMessage").innerText = "";
    return;
  }

  document.getElementById("gameMessage").innerText = `Wrong! Correct answer: ${flags[currentCountry]} — Next question in 5 seconds`;
  document.getElementById("scoreDisplay").innerText = `Score: ${score}`;
  setTimeout(nextRound, 5000);
}

function initMultiplayer() {
  fetch('https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/index.json')
    .then(res => res.json())
    .then(data => {
      data = data.filter(c => c.code.length === 2);
      flags = {};
      countries = [];
      data.forEach(c => {
        flags[c.name] = c.emoji;
        countries.push(c.name);
      });

      document.getElementById("startScreen").style.display = "none";
      document.getElementById("gameScreen").style.display = "none";
      document.getElementById("multiplayerScreen").style.display = "flex";
      startPlayer("player1");
      startPlayer("player2");
    });
}

function startPlayer(playerId) {
  let score = 0, wrongs = 0;
  const countryElem = document.getElementById(`${playerId}Country`);
  const grid = document.getElementById(`${playerId}Flags`);
  const scoreElem = document.getElementById(`${playerId}Score`);
  const msgElem = document.getElementById(`${playerId}Message`);

  function next() {
    const country = countries[Math.floor(Math.random() * countries.length)];
    countryElem.innerText = country;

    let options = [country];
    while (options.length < 4) {
      let opt = countries[Math.floor(Math.random() * countries.length)];
      if (!options.includes(opt)) options.push(opt);
    }
    options.sort(() => Math.random() - 0.5);

    grid.innerHTML = "";
    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "flag-btn";
      btn.innerText = flags[opt];
      btn.onclick = () => {
        if (opt === country) {
          score += 10;
          scoreElem.innerText = `Score: ${score}`;
          msgElem.innerText = "Correct!";
          next();
        } else {
          wrongs++;
          msgElem.innerText = `Wrong! Correct: ${flags[country]} ${country}`;
          if (wrongs >= 3) {
            grid.innerHTML = "";
            msgElem.innerHTML = `<div class='message big'>Game Over for You</div>`;
            countryElem.innerText = "";
          } else {
            setTimeout(next, 5000);
          }
        }
      };
      grid.appendChild(btn);
    });
  }

  next();
}

window.onload = () => {
  document.getElementById("startScreen").style.display = "flex";
};
