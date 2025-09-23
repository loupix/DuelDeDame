import { Piece } from '@/models/Piece';
interface SquareProps {
    row: number;
    col: number;
    piece: Piece | null;
    isSelected: boolean;
    isValidMove: boolean;
    onClick: () => void;
}
export default function Square({ row, col, piece, isSelected, isValidMove, onClick }: SquareProps): import("react").JSX.Element;
export {};
