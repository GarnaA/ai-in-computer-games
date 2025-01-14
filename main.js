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

        const piece = boardState[row][col];
        if (piece !== 0) {
          const pieceElement = document.createElement("div");
          pieceElement.className = "piece";
          pieceElement.classList.add(
            piece > 0 ? "playerA" : "playerB"
          );

          if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
            pieceElement.classList.add("selected-piece");
          }

          if (Math.abs(piece) === 2 || Math.abs(piece) === -2) {
            pieceElement.classList.add(piece > 0 ? "king-white" : "king-black");
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
      renderBoard();
    }
  }

  function onValidMoveClick(row, col) {
    if (currentTurn !== "player") return;

    if (row === 0 && boardState[row][col] === -1) {
      boardState[row][col] = -2;
    } else if (row === 7 && boardState[row][col] === 1) {
      boardState[row][col] = 2;
    }
  
    if (selectedPiece) {
      const move = validMoves.find((move) => move.row === row && move.col === col);
      if (move) {
        boardState[row][col] = boardState[selectedPiece.row][selectedPiece.col];
        boardState[selectedPiece.row][selectedPiece.col] = 0;
  
        if (move.jump) {
          boardState[move.jump.row][move.jump.col] = 0;
          selectedPiece = { row, col };
          validMoves = getValidMoves(row, col).filter((m) => m.jump);

          if (validMoves.length > 0) {
            renderBoard();
            return;
          }
        }

        selectedPiece = null;
        validMoves = [];
        currentTurn = "AI";
        renderBoard();
        setTimeout(makeAIMove, 600);
      }
    }
  }

  function getValidMoves(row, col) {
    const moves = [];
    const piece = boardState[row][col];
  
    const normalDirections =
      piece === 1
        ? [[1, -1], [1, 1]]
        : piece === -1
        ? [[-1, -1], [-1, 1]]
        : [];
  
    const jumpDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  
    function checkMoves(directions, isJump = false) {
      directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;
  
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPiece = boardState[newRow][newCol];
  
          if (!isJump && targetPiece === 0) {
            moves.push({ row: newRow, col: newCol, from: { row, col } });
            break;
          } else if (isJump && Math.sign(targetPiece) !== Math.sign(piece) && targetPiece !== 0) {
            const jumpRow = newRow + dRow;
            const jumpCol = newCol + dCol;
  
            if (
              jumpRow >= 0 &&
              jumpRow < 8 &&
              jumpCol >= 0 &&
              jumpCol < 8 &&
              boardState[jumpRow][jumpCol] === 0
            ) {
              moves.push({
                row: jumpRow,
                col: jumpCol,
                from: { row, col },
                jump: { row: newRow, col: newCol },
              });
            }
            break;
          } else {
            break;
          }
        }
      });
    }
  
    checkMoves(jumpDirections, true);
    const jumpMoves = moves.filter((m) => m.jump);
  
    if (jumpMoves.length > 0) return jumpMoves;
  
    if (piece === 1 || piece === -1) {
      checkMoves(normalDirections, false);
    }
  
    return moves;
  }

  function makeAIMove() {
    if (currentTurn !== "AI") return;
  
    let move = alphaBeta(boardState, 7, -Infinity, Infinity, true);
  
    console.log("AI Selected Move:", move);
  
    while (move && move.from && move.to) {
      const { from, to, jump } = move;
  
      boardState[to.row][to.col] = boardState[from.row][from.col];
      boardState[from.row][from.col] = 0;
  
      if (jump) {
        boardState[jump.row][jump.col] = 0;
        const furtherMoves = getValidMoves(to.row, to.col).filter((m) => m.jump);
  
        if (furtherMoves.length > 0) {
          console.log("AI continues jumping...");
          move = alphaBeta(simulateMove(boardState, { from: to, to: furtherMoves[0].to, jump: furtherMoves[0].jump }), 6, -Infinity, Infinity, true);
          continue;
        }
      }
  
      break;
    }
  
    renderBoard();
    currentTurn = "player";
  }

  function alphaBeta(state, depth, alpha, beta, maximizingPlayer) {

    console.log(`AlphaBeta: Depth ${depth}, Maximizing ${maximizingPlayer}`);
    const possibleMoves = maximizingPlayer
      ? getAllPossibleMoves(1)
      : getAllPossibleMoves(-1);
  
    console.log("Possible moves:", possibleMoves);
    if (depth === 0 || isGameOver(state)) {
      return { score: evaluateBoard(state) };
    }
  
    if (!possibleMoves || possibleMoves.length === 0) {
      console.warn("No possible moves:", { maximizingPlayer, state });
      return { score: maximizingPlayer ? -Infinity : Infinity };
    }
  
    let bestMove = null;
  
    for (const move of possibleMoves) {
      if (!move.from || !move.to) {
        console.error("Skipping invalid move in alphaBeta:", move);
        continue;
      }
  
      const newState = simulateMove(state, move);
  
      const result = alphaBeta(newState, depth - 1, alpha, beta, !maximizingPlayer);
  
      if (maximizingPlayer) {
        if (result.score > alpha) {
          alpha = result.score;
          bestMove = move;
        }
        if (alpha >= beta) break;
      } else {
        if (result.score < beta) {
          beta = result.score;
          bestMove = move;
        }
        if (alpha >= beta) break;
      }
    }
  
    return bestMove
      ? { ...bestMove, score: maximizingPlayer ? alpha : beta }
      : { score: maximizingPlayer ? alpha : beta };
  }
  
  function simulateMove(state, move) {

    console.log("Simulating move:", move);
    if (!move || !move.from || !move.to) {
      console.error("Invalid move passed to simulateMove:", move);
      return state;
    }
  
    const newState = JSON.parse(JSON.stringify(state));
    const { from, to, jump } = move;
  
    newState[to.row][to.col] = newState[from.row][from.col];
    newState[from.row][from.col] = 0;
  
    if (jump) {
      newState[jump.row][jump.col] = 0;
    }

    return newState;
  }
  
  function evaluateBoard(state) {
    let score = 0;
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state[row][col];
        if (piece === 1) score += 5 + row;
        if (piece === -1) score -= 5 - row;
        if (piece === 2) score += 10;
        if (piece === -2) score -= 10;
      }
    }
  
    return score;
  }

  function getAllPossibleMoves(player) {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col] === player) {
          for (const move of getValidMoves(row, col)) {
            moves.push({ from: { row, col }, to: move, jump: move.jump });
          }
        }
      }
    }
  
    console.log(`Player: ${player}, Possible Moves:`, moves);
    return moves.sort((a, b) => (b.jump ? 1 : 0) - (a.jump ? 1 : 0));
  }
  

  function isGameOver(state) {
    return getAllPossibleMoves(1).length === 0 || getAllPossibleMoves(-1).length === 0;
  }

  document.getElementById("restart").addEventListener("click", () => {
    location.reload();
  });

  renderBoard();
});
