'use client';
import { useState } from 'react';
import Square from './Square';
export default function Board({ game, onMove }) {
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const board = game.getBoard();
    const handleSquareClick = (row, col) => {
        if (selectedSquare) {
            const [fromRow, fromCol] = selectedSquare;
            if (fromRow === row && fromCol === col) {
                setSelectedSquare(null);
                setValidMoves([]);
                return;
            }
            if (game.movePiece([fromRow, fromCol], [row, col])) {
                if (onMove)
                    onMove([fromRow, fromCol], [row, col]);
                setSelectedSquare(null);
                setValidMoves([]);
            }
        }
        else {
            const piece = board.getPiece([row, col]);
            if (piece && piece.getColor() === game.getCurrentPlayer().getColor()) {
                setSelectedSquare([row, col]);
                setValidMoves(piece.getValidMoves(board));
            }
        }
    };
    const isValidMove = (row, col) => {
        return validMoves.some(([r, c]) => r === row && c === col);
    };
    return (<div className="grid grid-cols-8 gap-0 border-2 border-gray-800">
      {Array(8).fill(null).map((_, row) => (Array(8).fill(null).map((_, col) => (<Square key={`${row}-${col}`} row={row} col={col} piece={board.getPiece([row, col])} isSelected={selectedSquare?.[0] === row && selectedSquare?.[1] === col} isValidMove={isValidMove(row, col)} onClick={() => handleSquareClick(row, col)}/>))))}
    </div>);
}
//# sourceMappingURL=Board.jsx.map