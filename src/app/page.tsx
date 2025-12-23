import { CaptionGenerator } from "@/components/caption-generator";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
          Caption Wala AI
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Never run out of words. Upload your photo and let our AI generate the
          perfect caption for you.
        </p>
      </header>
      <main className="w-full">
        <CaptionGenerator />
      </main>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Designed & Developed By Pandey Adarsh © 2025 - All Right Reserved</p>
      </footer>
    </div>
  );
}
