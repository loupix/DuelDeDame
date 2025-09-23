import { Game } from '@/models/Game';
interface BoardProps {
    game: Game;
    onMove?: (from: [number, number], to: [number, number]) => void;
}
export default function Board({ game, onMove }: BoardProps): import("react").JSX.Element;
export {};
