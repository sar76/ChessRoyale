'use client';

// hooks to manage component state and side effects
import { useState, useEffect } from 'react';

// custom chess logic classes we have made in our library
// @ stands for root directory of project
import { BoardState } from '@/lib/board_state';
import { puzzleLoader } from '@/lib/fen_parser';

// optimised next.js image component since it automatically optimises via lazy loads and prevents layout shift
import Image from 'next/image';

// | means that the value is one of these, not its usual bitwise OR representation
// these are string literals -- meaning the value of GameState has to be exactly one of these -- can't be reassigned to a typo -- a nice safeguard
type GameState = 'LOADING' | 'MENU' | 'MEMORIZING' | 'PLAYING';

export default function MemoryChessPage() {
    // the following are state variables
    // represented as react hooks that trigger a re-render when changed. otherwise when these states are changed, we wouldn't see it reflect on the UI. 

    // creates gameState state whose value must be of type GameState
    // automatically create a set function for it
    // intialize it to LOADING
    const [gameState, setGameState] = useState<GameState>('LOADING');

    const [solutionBoard, setSolutionBoard] = useState<BoardState>(new BoardState());

    const [userBoard, setUserBoard] = useState<BoardState>(new BoardState());

    const [timeLeft, setTimeLeft] = useState<number>(5);

    const [selectedPiece, setSelectedPiece] = useState<string>('');

    const [score, setScore] = useState<number | null>(null);

    // runs only once on mount -- hence dependency array is empty
    // async because we use await when trying to load puzzles -- site doesn't freeze while this is going on
    // I cut the original db by 99% to speed up runtime -- no need to load entire db -- i think 2.1k positons are loaded currently.
    useEffect(() => {

        async function loadPuzzles() {
            try {
                await puzzleLoader.loadPositionFromFile('/puzzles/lichess_puzzles.csv, 100');
                setGameState('MENU');
            }
            catch (error) {
                console.error('Failed to load puzzles: ', error);
                alert('OOPS: Failed to Load Puzzles. Ensure lichess_puzzles database is loaded')
            }
        }
        
        loadPuzzles();

    }, []);

    // this function syntax (modern) forces hoisting -- good for readability
    const startNewPuzzle = () => {
         const fen = puzzleLoader.getRandomPosition();

         if (!fen) {
            alert("No puzzles loaded! We were unable to find a valid FEN for a puzzle");
            return; 
         }

         const solution = new BoardState();
         solution.populateFromFEN(fen);

         setSolutionBoard(solution); // our answer
         setUserBoard(new BoardState()); // what user sees
         setGameState('MEMORIZING'); 
         setScore(null);
         setSelectedPiece('');
    }

    // arrow function that calculates the total # of squares that are correct out of 64
    const checkSolution = () => {
        const correct = userBoard.howManySquaresCorrect(solutionBoard);

        // triggers a re-render to update new score value when this function is called, due to the useState
        setScore(correct);
    };

     // this effect is used for setting up keyboard event listeners when two things occur: 1) the gameState switches from MEMORIZING to PLAYING 2) the userBoard changes

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // keyboard shortcuts can only be allowed when the user is playing
            if (gameState !== 'PLAYING') return; 

            // SPACE => CHECK SOLUTION
            if (e.key === ' ' || e.code === 'Space') {
                // space usually causes us to scroll down on a page, so we prevent this from happening
                e.preventDefault();
                checkSolution();
            }

            // C ==> CLEAR BOARD
            else if (e.key === 'c' || e.key === 'C') {
                setUserBoard(new BoardState());
                setScore(null);
            }

            // N => NEW PUZZLE
            else if (e.key === 'n' || e.key === 'N') {
                startNewPuzzle(); 
            }
        }

        // whenever any key is pressed anywhere in the window, call my handleKeyPress function
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup remove listener when the component unmounts of dependencies change (going to a different page other than MemoryChess)
        return () => window.removeEventListener('keydown', handleKeyPress);

    }, [gameState, userBoard]);

    // although we can use a regular functio to keep track of this timer, we instead use useEffect due to:
    // accessing it from other functions
    // pausing the countdown or if we load a new puzzle or something, pausing it right there and starting a new one
    // a normal function with a loop would make this extremely difficult 
    useEffect(() => {

        if (gameState === 'MEMORIZING' && timeLeft > 0) {
            // runs only once with delay of 1000 ms
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            // clear the timer if the component unmounts or if dependencies change --> if we leave the page, do not continue the timer
            return clearTimeout(timer);
        }

        else if (gameState === 'MEMORIZING' && timeLeft === 0) {
            setGameState('PLAYING');
        }


    }, [gameState, timeLeft]); // re-calculate when gameState or timeLeft changes

    // arrow function that takes square number as an input and performs action of putting our selected piece there
    const handleSquareClick = (squareIndex: number) => {
        if (gameState !== 'PLAYING') {
            return;
        }

        const newBoard = userBoard.clone();

        // truthy value for string representing our selected piece
        if (selectedPiece) {
            newBoard.setPieceAtSquare(squareIndex, selectedPiece);

            setUserBoard(newBoard);

            // reset the score: eg if we had 42 / 62 squares correct before, now that number 42 is invalid so we set it back to null so we can recalculate it
            setScore(null);
        }
    };

    // arrow function that takes square number and a right click as input and clears that square
    const handleRightClick = (e: React.MouseEvent, squareIndex: number) => {
        // preventing the right-click menu from appearing
        e.preventDefault();

        if (gameState !== 'PLAYING') {
            return; 
        }

        const newBoard = userBoard.clone();

        newBoard.setPieceAtSquare(squareIndex, ' ');

        setUserBoard(newBoard);

        setScore(null);
    };

    // returns the path of the image based on the FEN piece input
    const getPieceImagePath = (piece: string): string => {

        const pieceMap: Record<string, string> = {
            // White pieces (uppercase letters)
            'K': '/pieces/wK.png',
            'Q': '/pieces/wQ.png',
            'R': '/pieces/wR.png',
            'B': '/pieces/wB.png',
            'N': '/pieces/wN.png',
            'P': '/pieces/wP.png',
            // Black pieces (lowercase letters)
            'k': '/pieces/bK.png',
            'q': '/pieces/bQ.png',
            'r': '/pieces/bR.png',
            'b': '/pieces/bB.png',
            'n': '/pieces/bN.png',
            'p': '/pieces/bP.png',
        }

        // return the path of the piece image or empty string if the piece isnt found
        return pieceMap[piece] || '';
    };




}