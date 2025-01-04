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

    function renderBoard() {
        boardElement.innerHTML = "";
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement("div");
                cell.className = "cell";
                cell.classList.add((row + col) % 2 === 0 ? "white" : "black");
                cell.dataset.row = row;
                cell.dataset.col = col;

                const piece = boardState[row][col];
                if (piece !== 0) {
                    const pieceElement = document.createElement("div");
                    pieceElement.className = "piece";
                    pieceElement.classList.add(piece > 0 ? "playerA" : "playerB");
                    
                     cell.appendChild(pieceElement);
                }

                boardElement.appendChild(cell);
            }
        }
    }
    renderBoard();
});
