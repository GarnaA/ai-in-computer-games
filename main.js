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
          if (Math.abs(piece) === 1) {
            pieceElement.classList.add(piece > 0 ? "playerA" : "playerB");
          } else if (Math.abs(piece) === 2) {
            pieceElement.classList.add(piece > 0 ? "king-black" : "king-white");
          }

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
    const piece = boardState[row][col];
    if (piece === -1 || piece === -2) {
      selectedPiece = { row, col };
      validMoves = getValidMoves(row, col);
      jumpEndPosition = null;
      jumpedThisTurn = false;
      renderBoard();
    }
  }

  function onValidMoveClick(row, col) {
    if (currentTurn !== "player") return;

    if (selectedPiece) {
      const move = validMoves.find((move) => move.row === row && move.col === col);
      if (move) {
        boardState[row][col] = boardState[selectedPiece.row][selectedPiece.col];
        boardState[selectedPiece.row][selectedPiece.col] = 0;

        if (move.jump) {
          boardState[move.jump.row][move.jump.col] = 0;
          jumpedThisTurn = true;
        }

        if ((row === 0 && boardState[row][col] === -1) || (row === 7 && boardState[row][col] === 1)) {
          boardState[row][col] = boardState[row][col] > 0 ? 2 : -2;
        }

        if (jumpedThisTurn) {
          additionalJumps = getValidMoves(row, col).filter((m) => m.jump);
          if (additionalJumps.length > 0) {
            selectedPiece = { row, col };
            validMoves = additionalJumps;
            jumpEndPosition = { row, col };
            renderBoard();
            return;
          }
        }

        selectedPiece = null;
        validMoves = [];
        jumpEndPosition = null;
        renderBoard();

        currentTurn = "AI";
        setTimeout(makeAIMove, 600);
      }
    }
  }

  function getValidMoves(row, col) {
    const moves = [];
    const piece = boardState[row][col];
    const isKing = Math.abs(piece) === 2;
  
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];
  
    if (isKing) {
      directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;
        let jumped = false;
  
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPiece = boardState[newRow][newCol];
  
          if (targetPiece === 0) {
            if (!jumped) {
              moves.push({ row: newRow, col: newCol });
            } else {
              moves.push({ row: newRow, col: newCol, jump: jumped });
            }
          } else if (!jumped && Math.sign(targetPiece) !== Math.sign(piece)) {
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
  
            if (
              jumpRow >= 0 && jumpRow < 8 &&
              jumpCol >= 0 && jumpCol < 8 &&
              boardState[jumpRow][jumpCol] === 0
            ) {
              jumped = { row: newRow, col: newCol };
              newRow = jumpRow;
              newCol = jumpCol;
              continue;
            } else {
              break;
            }
          } else {
            break;
          }

          newRow += dRow;
          newCol += dCol;
        }
      });
    } else {
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
          Math.sign(boardState[middleRow][middleCol]) !== Math.sign(piece) &&
          boardState[middleRow][middleCol] !== 0
        ) {
          moves.push({ row: jumpRow, col: jumpCol, jump: { row: middleRow, col: middleCol } });
        }
      });
    }

    return moves;
  }

  function makeAIMove() {
    if (currentTurn !== "AI") return;

    const possibleMoves = getAllPossibleMoves(boardState, 1);
    const jumpMoves = possibleMoves.filter((move) => move.to.jump);

    let moveToMake;

    if (jumpMoves.length > 0) {
      moveToMake = jumpMoves[0];
    } else if (possibleMoves.length > 0) {
      moveToMake = possibleMoves[0];
    }

    if (moveToMake) {
      const { from, to } = moveToMake;

      boardState[to.row][to.col] = boardState[from.row][from.col];
      boardState[from.row][from.col] = 0;

      if (to.jump) {
        const { row, col } = to.jump;
        boardState[row][col] = 0;
        jumpedThisTurn = true;
      }

      if (to.row === 0 && boardState[to.row][to.col] === 1) {
        boardState[to.row][to.col] = 2;
      }
  
      if (to.row === 7 && boardState[to.row][to.col] === 1) {
        boardState[to.row][to.col] = 2;
      }
  
      renderBoard();

      if (jumpedThisTurn) {
        additionalJumps = getValidMoves(to.row, to.col).filter((move) => move.jump);
        if (additionalJumps.length > 0) {
          setTimeout(() => makeAIMove(), 600);
          return;
        }
      }
      currentTurn = "player";
    }
  }

  function getAllPossibleMoves(board, player) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === player || board[row][col] === player * 2) {
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
