import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-club-black px-6 text-center">
      <span className="font-display text-[10rem] leading-none text-club-red md:text-[16rem]">404</span>
      <p className="mt-4 max-w-md text-lg text-zinc-400">Page not found. The ball went out of play.</p>
      <Link href="/" className="mt-8 rounded-full bg-club-red px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:bg-club-red-dark">
        Back to home
      </Link>
    </div>
  );
}
