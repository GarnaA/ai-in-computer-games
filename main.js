document.addEventListener("DOMContentLoaded", function () {
  const boardState = [
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [-1, 0, -1, 0, -1, 0, -1, 0],
    [0, -1, 0, -1, 0, -1, 0, -1],
    [-1, 0, -1, 0, -1, 0, -1, 0],
  ];

  const boardElement = document.getElementById("board");
  let selectedPiece = null;
  let validMoves = [];
  let currentTurn = "player";
  let jumpEndPosition = null;
  let additionalJumps = [];
  let jumpedThisTurn = false;

  function renderBoard() {
    boardElement.innerHTML = "";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.classList.add((row + col) % 2 === 0 ? "white" : "black");
        cell.dataset.row = row;
        cell.dataset.col = col;

        if (isValidMove(row, col)) {
          cell.classList.add("valid-move");
          cell.addEventListener("click", () => onValidMoveClick(row, col));
        }

        if (jumpEndPosition && jumpEndPosition.row === row && jumpEndPosition.col === col) {
          cell.classList.add("jump-end");
        }

        const piece = boardState[row][col];
        if (piece !== 0) {
          const pieceElement = document.createElement("div");
          pieceElement.className = "piece";
          pieceElement.classList.add(piece > 0 ? "playerA" : "playerB");

          if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
            pieceElement.classList.add("selected-piece");
          }

          pieceElement.addEventListener("click", () => onPieceClick(row, col));
          cell.appendChild(pieceElement);
        }
        boardElement.appendChild(cell);
      }
    }
  }

  function isValidMove(row, col) {
    return validMoves.some((move) => move.row === row && move.col === col);
  }

  function onPieceClick(row, col) {
    if (currentTurn !== "player") return;
    console.log(`Clicked piece at (${row}, ${col})`);

    const piece = boardState[row][col];
    if (piece === -1) {
      selectedPiece = { row, col };
      validMoves = getValidMoves(row, col);
      jumpEndPosition = null;
      jumpedThisTurn = false;
      console.log("Valid moves:", validMoves);
      renderBoard();
    }
  }

  function onValidMoveClick(row, col) {
    if (currentTurn !== "player") return;

    console.log(`Clicked move at (${row}, ${col})`);
    if (selectedPiece) {
      const move = validMoves.find((move) => move.row === row && move.col === col);
      if (move) {
        console.log('Performing move:', move);
        boardState[row][col] = boardState[selectedPiece.row][selectedPiece.col];
        boardState[selectedPiece.row][selectedPiece.col] = 0;

        if (move.jump) {
          boardState[move.jump.row][move.jump.col] = 0;
          jumpedThisTurn = true;
        }

        if (jumpedThisTurn) {
          additionalJumps = getValidMoves(row, col).filter((m) => m.jump);
          if (additionalJumps.length > 0) {
            selectedPiece = { row, col };
            validMoves = additionalJumps;
            jumpEndPosition = { row, col };
            console.log("Additional jumps available:", validMoves);
            renderBoard();
            return;
          }
        }

        selectedPiece = null;
        validMoves = [];
        jumpEndPosition = null;
        renderBoard();

        currentTurn = "AI";
        setTimeout(makeAIMove, 500);
      }
    }
  }

  function getValidMoves(row, col) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    const piece = boardState[row][col];

    const forwardDirections = piece === -1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    forwardDirections.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && boardState[newRow][newCol] === 0) {
        moves.push({ row: newRow, col: newCol });
      }
    });

    directions.forEach(([dRow, dCol]) => {
      const jumpRow = row + 2 * dRow;
      const jumpCol = col + 2 * dCol;
      const middleRow = row + dRow;
      const middleCol = col + dCol;

      if (
        jumpRow >= 0 && jumpRow < 8 &&
        jumpCol >= 0 && jumpCol < 8 &&
        boardState[jumpRow][jumpCol] === 0 &&
        Math.abs(boardState[middleRow][middleCol]) === 1 &&
        boardState[middleRow][middleCol] !== piece
      ) {
        moves.push({ row: jumpRow, col: jumpCol, jump: { row: middleRow, col: middleCol } });
      }
    });

    return moves;
  }

  function makeAIMove() {
    if (currentTurn !== "AI") return;
  
    const possibleMoves = getAllPossibleMoves(boardState, 1);
    const jumpMoves = possibleMoves.filter((move) => move.to.jump);
  
    let moveToMake;
  
    if (jumpedThisTurn && jumpMoves.length > 0) {
      moveToMake = jumpMoves[0];
    } else {
      moveToMake = jumpMoves.length > 0 ? jumpMoves[0] : possibleMoves.length > 0 ? possibleMoves[0] : null;
    }
  
    if (moveToMake) {
      const { from, to } = moveToMake;

      boardState[to.row][to.col] = boardState[from.row][from.col];
      boardState[from.row][from.col] = 0;

      if (to.jump) {
        const { row, col } = to.jump;
        boardState[row][col] = 0;
        jumpedThisTurn = true;
      } else {
        jumpedThisTurn = false;
      }
      renderBoard();
  
      if (jumpedThisTurn) {
        additionalJumps = getValidMoves(to.row, to.col).filter((move) => move.jump);
        if (additionalJumps.length > 0) {
          setTimeout(() => makeAIMove(), 500);
          return;
        }
      }
    }
  
    currentTurn = "player";
  }

  function getAllPossibleMoves(board, player) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === player) {
          for (const move of getValidMoves(row, col)) {
            moves.push({ from: { row, col }, to: move });
          }
        }
      }
    }
    return moves;
  }

  document.getElementById("restart").addEventListener("click", () => {
    location.reload();
  });

  renderBoard();
});
