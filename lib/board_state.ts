// we will be representing the current board state via a 12-bitboard strategy
// using BigInt, to hold 64-bit unsigned integers
// 12 bitboards --> 12 unique pieces (6 for each color) --> 12 64-bit unsigned integers
// bit is a 1 if the piece is on that position from 1->64, 0 otherwise
// simple integer operations can determine current board state at any time

export class BoardState {

    // *************************PRIVATE METHODS*************************
    
    // BigInt literals end with 'n' (e.g 0n would be BigInt zero)

    private whitePawns: bigint = 0n; 
    private whiteKnights: bigint = 0n;
    private whiteBishops: bigint = 0n;
    private whiteRooks: bigint = 0n;
    private whiteQueens: bigint = 0n;
    private whiteKing: bigint = 0n;
    private blackPawns: bigint = 0n;
    private blackKnights: bigint = 0n;
    private blackBishops: bigint = 0n;
    private blackRooks: bigint = 0n;
    private blackQueens: bigint = 0n;
    private blackKing: bigint = 0n;

    // this method will be called when user drags and drops a piece onto the chessboard
    private setBit(bitboard: bigint, squareIndex: number): bigint {
        // 'or' with our original bitboard because we want everything else to remain unchanged
        // bitwise operations should be done with the same types, hence we have to convert this number into bigint
        return bitboard | (1n << BigInt(squareIndex))
    }

    // when user wants to restart we clear the bitboards to get a blank chess board
    private clearAllBitboards(): void {
        this.whitePawns = 0n;
        this.whiteKnights = 0n;
        this.whiteBishops = 0n;
        this.whiteRooks = 0n;
        this.whiteQueens = 0n;
        this.whiteKing = 0n;
        this.blackPawns = 0n;
        this.blackKnights = 0n;
        this.blackBishops = 0n;
        this.blackRooks = 0n;
        this.blackQueens = 0n;
        this.blackKing = 0n;
    }

    // helper method to check whether a piece is in the right position
    // move the position you are checking all the way to the right
    // run and operation with 1n and check to see if only 1n is left, if its all 0s, then we do not have the piece there
    private isSet(bitboard: bigint, squareIndex: number): boolean {
        return ((bitboard >> BigInt(squareIndex)) & 1n) === 1n; 
    }

    // method to clear specific square across ALL bitboards
    // well usually we should only have 1 piece in general but in case we have an issue for some reason this is a foolproof way to clear that position

    private clearSquare(squareIndex: number): void {
        // left shift 1n to the position we want to remove
        // negate it so that everything is 1 except for that position, which is 0
        // and with all other bitboards so that everything that is already there stays and we ensure that the position we are at remains a 0

        const mask = ~(1n << BigInt(squareIndex));

        this.whitePawns &= mask;
        this.whiteKnights &= mask;
        this.whiteBishops &= mask;
        this.whiteRooks &= mask;
        this.whiteQueens &= mask;
        this.whiteKing &= mask;
        this.blackPawns &= mask;
        this.blackKnights &= mask;
        this.blackBishops &= mask;
        this.blackRooks &= mask;
        this.blackQueens &= mask;
        this.blackKing &= mask;
    }

    // *************************PUBLIC METHODS*************************

    // FEN format: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    // We only care about the first part (piece placement)
    // this is for setting up the starting position

    populateFromFEN(fenString: string): void {
        this.clearAllBitboards();

        let squareNumber = 0; 

        for (const c of fenString) {
            // end of the fen is reached -- other info is irrelevant
            if (c === ' ') {
                break;
            }

            // we also want to skip the rank separators
            if (c === '/') {
                continue;
            }

            // need to check if there is a digit, if so, we need to skip that many squares
            if (/\d/.test(c)) {
                // could also use Number(c)
                squareNumber += parseInt(c);
                continue;
            }

            // placing pieces on the board
            // works kinda like an if check but if one matches, that block executes, and so does everything under it. hence we need break
            switch (c) {
                // Black pieces (lowercase)
                case 'r':
                    this.blackRooks = this.setBit(this.blackRooks, squareNumber);
                    squareNumber++;
                    break;
                case 'n':
                    this.blackKnights = this.setBit(this.blackKnights, squareNumber);
                    squareNumber++;
                    break;
                case 'b':
                    this.blackBishops = this.setBit(this.blackBishops, squareNumber);
                    squareNumber++;
                    break;
                case 'q':
                    this.blackQueens = this.setBit(this.blackQueens, squareNumber);
                    squareNumber++;
                    break;
                case 'k':
                    this.blackKing = this.setBit(this.blackKing, squareNumber);
                    squareNumber++;
                    break;
                case 'p':
                    this.blackPawns = this.setBit(this.blackPawns, squareNumber);
                    squareNumber++;
                    break;
                
                // White pieces (uppercase)
                case 'R':
                    this.whiteRooks = this.setBit(this.whiteRooks, squareNumber);
                    squareNumber++;
                    break;
                case 'N':
                    this.whiteKnights = this.setBit(this.whiteKnights, squareNumber);
                    squareNumber++;
                    break;
                case 'B':
                    this.whiteBishops = this.setBit(this.whiteBishops, squareNumber);
                    squareNumber++;
                    break;
                case 'Q':
                    this.whiteQueens = this.setBit(this.whiteQueens, squareNumber);
                    squareNumber++;
                    break;
                case 'K':
                    this.whiteKing = this.setBit(this.whiteKing, squareNumber);
                    squareNumber++;
                    break;
                case 'P':
                    this.whitePawns = this.setBit(this.whitePawns, squareNumber);
                    squareNumber++;
                    break;
            }
        }
    }

    // get the piece at that specific position 
    // returns the piece character in the fen string or ' ' for the empty square
    // could be useful as a helper method in converting back to fen in some cases

    getPieceAt(squareIndex: number): string {
         // Check black pieces first
        if (this.isSet(this.blackRooks, squareIndex)) return 'r';
        if (this.isSet(this.blackKnights, squareIndex)) return 'n';
        if (this.isSet(this.blackBishops, squareIndex)) return 'b';
        if (this.isSet(this.blackQueens, squareIndex)) return 'q';
        if (this.isSet(this.blackKing, squareIndex)) return 'k';
        if (this.isSet(this.blackPawns, squareIndex)) return 'p';
        
        // Check white pieces
        if (this.isSet(this.whiteRooks, squareIndex)) return 'R';
        if (this.isSet(this.whiteKnights, squareIndex)) return 'N';
        if (this.isSet(this.whiteBishops, squareIndex)) return 'B';
        if (this.isSet(this.whiteQueens, squareIndex)) return 'Q';
        if (this.isSet(this.whiteKing, squareIndex)) return 'K';
        if (this.isSet(this.whitePawns, squareIndex)) return 'P';
        
        // Empty square
        return ' ';
    }

    // comparing board states for equality
    // we are naming this other because we are comparing it to the boardState of the current object, our instance of BoardState
    equals(other: BoardState): boolean {
        return (
            // beauty of the 12 bitboard convention -- we only need 12 integer operations to check equality of boardState!
            this.whitePawns === other.whitePawns &&
            this.whiteKnights === other.whiteKnights &&
            this.whiteBishops === other.whiteBishops &&
            this.whiteRooks === other.whiteRooks &&
            this.whiteQueens === other.whiteQueens &&
            this.whiteKing === other.whiteKing &&
            this.blackPawns === other.blackPawns &&
            this.blackKnights === other.blackKnights &&
            this.blackBishops === other.blackBishops &&
            this.blackRooks === other.blackRooks &&
            this.blackQueens === other.blackQueens &&
            this.blackKing === other.blackKing
        )
    }

    howManySquaresCorrect(target: BoardState): number {
        let correct = 0;

        if (this.equals(target)) {
            return 64;
        }

        for (let i = 0; i < 64; i++) {
            if (this.getPieceAt(i) === target.getPieceAt(i)) {
                correct += 1;
            }
        }
        return correct;
    }

    // high level view of setting a piece at a square -- instead of calling setbit function each time for different pieces
    // params for this are just piece and position
    // setbit manipulates the bitboard directly

    setPieceAtSquare(squareIndex: number, piece: string): void {

        // first we clear the square, since it might be populated from another bitboard
        this.clearSquare(squareIndex);

        switch(piece) {
            case 'P':
                this.whitePawns = this.setBit(this.whitePawns, squareIndex);
                break;
            case 'N':
                this.whiteKnights = this.setBit(this.whiteKnights, squareIndex);
                break;
            case 'B':
                this.whiteBishops = this.setBit(this.whiteBishops, squareIndex);
                break;
            case 'R':
                this.whiteRooks = this.setBit(this.whiteRooks, squareIndex);
                break;
            case 'Q':
                this.whiteQueens = this.setBit(this.whiteQueens, squareIndex);
                break;
            case 'K':
                this.whiteKing = this.setBit(this.whiteKing, squareIndex);
                break;
            case 'p':
                this.blackPawns = this.setBit(this.blackPawns, squareIndex);
                break;
            case 'n':
                this.blackKnights = this.setBit(this.blackKnights, squareIndex);
                break;
            case 'b':
                this.blackBishops = this.setBit(this.blackBishops, squareIndex);
                break;
            case 'r':
                this.blackRooks = this.setBit(this.blackRooks, squareIndex);
                break;
            case 'q':
                this.blackQueens = this.setBit(this.blackQueens, squareIndex);
                break;
            case 'k':
                this.blackKing = this.setBit(this.blackKing, squareIndex);
                break;
            case ' ':
                // Erasing a piece basically
                break;
        }

    }

    // helper method that is useful for React UI, not sure if really needed but i guess

    getBoardAs2DArray(): string[][] {
        const board: string[][] = [];

        // loop structure: 
        // populate the row array first, and then push the entire thing into the board 2D array at once
        // kinda did it in a gay modulo 8 way before 
        for (let rank = 0; rank < 8; rank++) {
            const row: string[] = [];
            for (let file = 0; file < 8; file++) {
                // basically jumping up to the correct row and then moving right to the correct column 
                const squareIndex = rank * 8 + file; 
                row.push(this.getPieceAt(squareIndex));
            }
            board.push(row);
        }

        return board;
    }

    // another method useful for React
    // clone the current board state, useful for state management

    clone(): BoardState {
        const newBoard = new BoardState();

        newBoard.whitePawns = this.whitePawns;
        newBoard.whiteKnights = this.whiteKnights;
        newBoard.whiteBishops = this.whiteBishops;
        newBoard.whiteRooks = this.whiteRooks;
        newBoard.whiteQueens = this.whiteQueens;
        newBoard.whiteKing = this.whiteKing;
        newBoard.blackPawns = this.blackPawns;
        newBoard.blackKnights = this.blackKnights;
        newBoard.blackBishops = this.blackBishops;
        newBoard.blackRooks = this.blackRooks;
        newBoard.blackQueens = this.blackQueens;
        newBoard.blackKing = this.blackKing;
        
        return newBoard;

    }

    // no need to add any convenience functions or any duplicated crap that confuses function names in the long run, this is enough
}

