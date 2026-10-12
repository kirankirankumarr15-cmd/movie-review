import SearchMovie from "@/components/movie/SearchMovie";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative py-20 px-4 min-h-[calc(100vh-64px)]">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
          Understand what audiences <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">really feel.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl">
          Instantly aggregate reviews from across the web. We analyze the sentiment of 
          millions of opinions to give you the ultimate verdict on any movie.
        </p>

        <SearchMovie />
      </div>
      
      {/* Footer text */}
      <div className="absolute bottom-8 text-center text-slate-500 text-sm">
        Powered by TMDB, OMDb, Reddit, and Claude AI
      </div>
    </div>
  );
}
