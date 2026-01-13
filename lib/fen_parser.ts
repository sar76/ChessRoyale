// Excuse comments that seem too basic; I am learning typescript as I work on this project

// 'export' keyword lets you access this class from other files
// we don't use default here, but could since this is the only class and we can easily import this from other files
export class PuzzleLoader {

    private positions: string[] = [];

    // allows us to interact with page while function loads positions (prevents freezing while we wait for this function to conclude)
    async loadPositionFromFile(filename: string, limit: number = 100): Promise<string[]> {

        try {

            // await ensures that our fetch returns a Promise ie. (I will give this to you later, when it is available)
            // await pauses our async function loadPositionFromFile until the promise resolves
            // response type is returned
            const response = await fetch(filename)

            // returns a boolean true & HTTP status in range 200-299 if request succeeded 
            if (!response.ok) {
                // throw immediately stops execution of the function
                // rejects the promise returned by the async function
                throw new Error(`Failed to fetch file: ${filename}`);
            }

            // response.text() returns Promise<string>, await unwraps it, and the result is assigned to variable "fen_string" of type string
            const fen_string = await response.text(); 
            // populate positions array with our fen strings we are parsing from the lichess csv puzzle database
            this.positions = this.parseCSV(fen_string, limit);

            return this.positions; 
        }

        catch (error) {

            console.error(`Error: Could not extract positions from file: ${filename}`, error);
            return [];
        }
    }

    // this function is beneficial for api responses or server-side loading (not sure which method ill be using right now so)
    // the reason why this isn't async is because 
    loadPositionsFromString(csvContent: string, limit: number = 100): string[] {
        this.positions = this.parseCSV(csvContent, limit);
        return this.positions; 
    }

    private parseCSV(csvContent: string, limit: number = 100): string[] {
        
        try {
            const positions: string[] = [];

            // split the entire CSV into new lines to get individual rows
            const lines = csvContent.split('\n');

            // skip the header line of the CSV (this is how the csv is structured) and begin with index 1 to read fens
            for (let i = 1; i < lines.length && positions.length < limit; i++) {
                // remove the whitespace on both ends
                const line = lines[i].trim()

                // skip lines that are empty
                if (!line) continue; 

                // returns an array of strings, index 1 is what we need for our fen values
                const columns = line.split(','); 

                // make sure we have at least two values / columns otherwise fen doesnt exist for some reason
                if (columns.length >= 2) {
                    const fenString = columns[1].trim()

                    if (fenString) {
                        positions.push(fenString);
                    }
                }
            }
            return positions;
        }

        catch (error) {
            console.error('Was unable to parse the database for fen strings properly');
            return [];
        }
    }

    // get a random position to play
    // positions variable is set as optional
    getRandomPosition(positions?: string[]): string {
        // If the positions parameter is given to us, use it, otherwise get from this.positions
        // i guess this works in scenarios where we want to use some custom logic for extracting positions

        // what takes priority here? we dont use if then? 
        // oh it returns first truthy value as it reads left to right
        const positionsToUse = positions || this.positions;

        // triple equals checks both the value and the data type of the objects being compared
        if (positionsToUse.length === 0) {
            console.warn('Warning: no positions are currently loaded.');
            return '';
        }

        // Math.random returns 0.0 to 0.999...
        // multiply by the length and then use floor to get the integer index

        const randomIndex = Math.floor(Math.random() * positionsToUse.length);
        return positionsToUse[randomIndex];
    }

    // get count of currently loaded positions
    getPositionCount(positions?: string[]): number {
        const positionsToUse = positions || this.positions; 

        if (positionsToUse.length === 0) {
            console.warn('Warning: no positions are currently loaded.'); 
            return 0;
        }

        return positionsToUse.length;
    }

    getPositions(): string[] {
        // returns shallow copy of currently loaded positions
        return [...this.positions];
    }
    
    // clear all the positions that are currently loaded
    clearPositions(): void {
        this.positions = [];
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    // function made for convenience for quick usage without instantiating class
}

    export async function loadPuzzles(
        filename: string = '/puzzles/lichess_db_puzzle.csv',
        limit: number = 100
    ): Promise<string[]> {
        const loader = new PuzzleLoader();
        return await loader.loadPositionFromFile(filename, limit);
    }

    // export singleton instance for shared state across entire app 
    // this way multiple components can access the same loaded puzzles

    export const puzzleLoader = new PuzzleLoader();
