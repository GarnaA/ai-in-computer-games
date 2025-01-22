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
          pieceElement.classList.add(piece > 0 ? "playerA" : "playerB");
  
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
  
    if (selectedPiece) {
      const move = validMoves.find((move) => move.row === row && move.col === col);
      if (move) {
        boardState[row][col] = boardState[selectedPiece.row][selectedPiece.col];
        boardState[selectedPiece.row][selectedPiece.col] = 0;

        if (row === 0 && boardState[row][col] === -1) {
          boardState[row][col] = -2;
        } else if (row === 7 && boardState[row][col] === 1) {
          boardState[row][col] = 2;
        }
  
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
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  
    if (Math.abs(piece) === 2) {
      directions.forEach(([dRow, dCol]) => {
        let newRow = row + dRow;
        let newCol = col + dCol;
        let captured = false;
  
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPiece = boardState[newRow][newCol];
  
          if (targetPiece === 0 && !captured) {
            moves.push({ row: newRow, col: newCol, from: { row, col } });
          } else if (
            targetPiece !== 0 &&
            Math.sign(targetPiece) !== Math.sign(piece) &&
            !captured
          ) {
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
              captured = true;
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
      const normalDirections =
        piece === 1
          ? [[1, -1], [1, 1]]
          : piece === -1
          ? [[-1, -1], [-1, 1]]
          : [];
  
      normalDirections.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
  
        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          boardState[newRow][newCol] === 0
        ) {
          moves.push({ row: newRow, col: newCol, from: { row, col } });
        }
      });
  
      directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow;
        const newCol = col + dCol;
  
        if (
          newRow >= 0 &&
          newRow < 8 &&
          newCol >= 0 &&
          newCol < 8 &&
          Math.sign(boardState[newRow][newCol]) !== Math.sign(piece) &&
          boardState[newRow][newCol] !== 0
        ) {
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
        }
      });
    }
  
    const jumpMoves = moves.filter((m) => m.jump);
    return jumpMoves.length > 0 ? jumpMoves : moves;
  }

  function makeAIMove() {
    if (currentTurn !== "AI") return;
  
    let move = alphaBeta(boardState, 7, -Infinity, Infinity, true);
  
    console.log("AI Selected Move:", move);
  
    while (move && move.from && move.to) {
      const { from, to, jump } = move;
  
      boardState[to.row][to.col] = boardState[from.row][from.col];
      boardState[from.row][from.col] = 0;
  
      if (to.row === 7 && boardState[to.row][to.col] === 1) {
        boardState[to.row][to.col] = 2;
      }
  
      if (jump) {
        boardState[jump.row][jump.col] = 0;
        const furtherMoves = getValidMoves(to.row, to.col).filter((m) => m.jump);
  
        if (furtherMoves.length > 0) {
          console.log("AI continues jumping...");
          move = alphaBeta(simulateMove(boardState, { from: to, to: furtherMoves[0].to, jump: furtherMoves[0].jump }), 1, -Infinity, Infinity, true);
          continue;
        }
      }
  
      break;
    }
  
    renderBoard();

    currentTurn = "player";

    if (isGameOver()) {
      return;
    }
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
        if (Math.sign(boardState[row][col]) === player) {
          const pieceMoves = getValidMoves(row, col);
          for (const move of pieceMoves) {
            moves.push({
              from: { row, col },
              to: { row: move.row, col: move.col },
              jump: move.jump,
            });
          }
        }
      }
    }
    return moves.sort((a, b) => (b.jump ? 1 : 0) - (a.jump ? 1 : 0));
  }

  function displayWinner(message) {
    const winnerMessage = document.createElement("div");
    winnerMessage.className = "winner-message";
    winnerMessage.textContent = message;
  
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.appendChild(winnerMessage);

    document.body.appendChild(overlay);
  }

  function isGameOver() {
    const playerMoves = getAllPossibleMoves(-1); 
    const aiMoves = getAllPossibleMoves(1);
  
    const playerPieces = countPieces(-1);
    const aiPieces = countPieces(1);
  
    if (playerPieces === 0) {
      displayWinner("AI (Black pieces) wins!");
      return true;
    } else if (aiPieces === 0) {
      displayWinner("Player (White pieces) wins!");
      return true;
    }
  
    if (playerMoves.length === 0) {
      displayWinner("AI (Black pieces) wins!");
      return true;
    } else if (aiMoves.length === 0) {
      displayWinner("Player (White pieces) wins!");
      return true;
    }
  
    return false;
  }
  
  function countPieces(player) {
    let pieceCount = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col] === player || boardState[row][col] === player * 2) {
          pieceCount++;
        }
      }
    }
    return pieceCount;
  }  

  document.getElementById("restart").addEventListener("click", () => {
    location.reload();
  });

  renderBoard();
});
