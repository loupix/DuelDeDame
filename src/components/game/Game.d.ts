interface GameProps {
    code: string;
    socket: any;
    color: 'white' | 'black';
}
export default function Game({ code, socket, color }: GameProps): import("react").JSX.Element;
export {};
