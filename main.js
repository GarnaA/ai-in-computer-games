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
    const piece = boardState[row][col];

    if (piece === -1) {
      selectedPiece = { row, col };
      validMoves = getValidMoves(row, col);
      renderBoard();
    }
  }

  function onValidMoveClick(row, col) {
  if (selectedPiece) {
    const move = validMoves.find((move) => move.row === row && move.col === col);
      if (move) {
        boardState[row][col] = boardState[selectedPiece.row][selectedPiece.col];
        boardState[selectedPiece.row][selectedPiece.col] = 0;
        selectedPiece = null;
        validMoves = [];
        renderBoard();
      }
    }
  }

  function getValidMoves(row, col) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    const piece = boardState[row][col];

    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (piece === -1 && dRow > 0) {
        return;
      } else if (piece === 1 && dRow < 0) {
        return;
      }

      if (
        newRow >= 0 && newRow < 8 &&
        newCol >= 0 && newCol < 8 &&
        boardState[newRow][newCol] === 0
      ) {
        moves.push({ row: newRow, col: newCol });
      }
    });
    return moves;
  }

  document.getElementById("restart").addEventListener("click", () => {
    location.reload();
  });
  renderBoard();
});
