"use strict";

// Store all changes and state updates for the game
let gameState = {
  currentTurn: true,
  cells: [],
  hasWinner: false,
  botPredence: [[0, 2, 6, 8], [4], [1, 3, 5, 7]],
  winningStates: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ],
};

const cellIdxPattern = /cell(\d+)/;
let cell_index = [];

const reset_game = () => {
  gameState["hasWinner"] = false;
  gameState["currentTurn"] = true;
  gameState["cells"].forEach((cell) => (cell.textContent = ""));
  gameState["cells"].forEach((cell) => (cell.style.background = "none"));
};

const highlightWinningCells = (winningCells) => {
  winningCells.forEach((winningCell) => {
    gameState["cells"][winningCell].style.background = "yellow";
  });
};

/**
 * Initialize the game once in the beginning of a new game
 */
const initializeGame = () => {
  for (let i = 0; i < 9; i++) {
    gameState["cells"] = [
      ...gameState["cells"],
      document.querySelector(`#cell${i}`),
    ];
  }

  gameState["cells"].forEach((cell) => (cell.textContent = ""));
  gameState["cells"].forEach((cell) => (cell.style.background = "none"));

  const setupEventListeners = async function () {
    setCurrentPlayer();
    for (let i = 0; i < gameState.cells.length; i++) {
      gameState["cells"][i].addEventListener("click", async () => {
        if (gameState["hasWinner"] === false) {
          await makeMove(i);
          let winner = checkWinningState();
          if (winner != null) {
            gameState["hasWinner"] = true;
            highlightWinningCells(winner["winning_cells"]);
          } else {
            await makeMove(i);
            let winner = checkWinningState();
            if (winner != null) {
              gameState["hasWinner"] = true;
              highlightWinningCells(winner["winning_cells"]);
            }
          }
        } else {
          alert("Already won! Reset the game.");
        }
      });
    }
  };

  setupEventListeners();
};

const swapPlayerTurn = () => {
  gameState.currentTurn = !gameState.currentTurn;
  setCurrentPlayer();
};

/**
 * Looks at the cell position of the tic-tac-toe grid and adds users selection
 */
const makeMove = async (cellPosition) => {
  let playerSymbol = gameState.currentTurn ? "X" : "O";
  if (gameState.currentTurn) {
    if (!gameState["cells"][cellPosition].textContent) {
      gameState["cells"][cellPosition].textContent = playerSymbol;
    }
  } else {
    await handleAIMove();
  }
  swapPlayerTurn();
};

const findFirstNonEmptyList = (list) => {
  for (let i = 0; i < list.length; i++) {
    if (list[i].length > 0) {
      return i;
    }
  }
  return null;
};

const handleAIMove = async () => {
  await new Promise((r) => setTimeout(r, 500));
  let unusedCells = aggregateEmptyCells();
  const precedenceIntersection = gameState["botPredence"].map((x) =>
    x.filter((value) => unusedCells.includes(value))
  );

  let precedenceArray =
    precedenceIntersection[findFirstNonEmptyList(precedenceIntersection)];
  gameState["cells"][
    precedenceArray[getRandomInt(precedenceArray.length)]
  ].textContent = "O";
};

const aggregateEmptyCells = () => {
  return gameState["cells"]
    .filter((cell) => cell.textContent == false)
    .map((cellObject) => Number(cellObject.id.match(cellIdxPattern)[1]));
};

/**
 * Updates the UI to say who the current player is
 */
const setCurrentPlayer = () => {
  document.querySelector("#turn").textContent = `Current turn: ${
    gameState.currentTurn ? "Player" : "AI"
  }`;
};

/**
 * Finds random value between 0 and [max]
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const checkWinningState = () => {
  // Iterate through each individual list of winning states
  for (let i = 0; i < gameState.winningStates.length; i++) {
    let currentWinningState = [
      ...new Set(
        gameState.winningStates[i]
          .map((cellNumber) => gameState["cells"][cellNumber].textContent)
          .map((cellTextContent) => cellTextContent.toLowerCase())
      ),
    ];

    if (currentWinningState.length == 1 && currentWinningState[0] != "") {
      return {
        player: currentWinningState[0],
        winning_cells: gameState.winningStates[i],
      };
    }
  }
  return null;
};

initializeGame();
