import Link from 'next/link';
// link is used for client-side navigation between pages, so that we do not have some bs 

export default function HomePage() {

  // games array containing game metadata objects with params: name (string), path: (string), and availability (boolean)
  const games = [
    {name: 'Memory Chess', path: '/memorychess', available: true},
    { name: 'Coming Soon', path: '#', available: false },
    { name: 'Coming Soon', path: '#', available: false },
    { name: 'Coming Soon', path: '#', available: false },
    { name: 'Coming Soon', path: '#', available: false },
    { name: 'Coming Soon', path: '#', available: false },
  ];


  return (
    // styling: flexbox, flex direction is column, vertically and horizontally centered text, min height of 100vh, baackground gradient going from dark grey on top to slightly lighter dark gray on bottom
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-red-200 to-red-800">
      {/*styling: center the text, space of 2rem between boxes, and 2rem padding*/}
      <div className="text-center space-y-8 p-8"> 
        <h1 className="text-7xl font-bold">
          Welcome to Chess Royale
        </h1>
      </div>

      <div className = "grid grid-cols-3 gap-6 max-w-5xl w-full">
        {games.map((game, index) => (
          // if game is avilable show its name and 'click to play'
          // if not available then show game name, which we defined above as 'coming soon'
          game.available ? (
            <Link
              key = {index}
              href = {game.path}
              className = "border-4 border-white rounded-xl h-48 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <div className = "text-center">
                  <p className = "text-2xl font-bold text-white mb-2">{game.name}</p>
                  <p className = "text-lg text-white/80">Click To Play</p>
                </div>
              </Link>
          ) : (
            <div
              key = {index}
              className = "border-4 border-white/40 border-dashed rounded-xl h-48 flex items-center justify-center"
            >
              <p className="text-xl text-white/50">{game.name}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
}