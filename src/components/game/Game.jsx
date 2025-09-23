'use client';
import { useEffect, useState } from 'react';
import { Game as GameModel } from "../../models/Game";
import Board from './Board';
import GameInfo from './GameInfo';
export default function Game({ code, socket, color }) {
    const [game, setGame] = useState(() => new GameModel());
    const [yourTurn, setYourTurn] = useState(color === 'white');
    useEffect(() => {
        if (!socket)
            return;
        const handleMove = (move) => {
            game.movePiece(move.from, move.to);
            setGame(game.clone());
            setYourTurn(true);
        };
        socket.on('move', handleMove);
        return () => {
            socket.off('move', handleMove);
        };
    }, [socket, game]);
    const handleMove = (from, to) => {
        if (!yourTurn)
            return;
        if (game.movePiece(from, to)) {
            setGame(game.clone());
            socket.emit('move', { code, move: { from, to } });
            setYourTurn(false);
        }
    };
    return (<div className="flex flex-col items-center gap-8">
      <GameInfo game={game}/>
      <div className="mb-2 text-lg font-semibold">
        {yourTurn ? 'À toi de jouer !' : 'En attente de ton adversaire...'}
      </div>
      <Board game={game} onMove={yourTurn ? handleMove : undefined}/>
    </div>);
}
//# sourceMappingURL=Game.jsx.map