import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-club-black px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:24px_24px]" />
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <span className="relative font-display text-[10rem] leading-none text-club-red md:text-[16rem]">404</span>
      <p className="relative mt-4 max-w-md text-lg text-zinc-400">
        El balón salió del campo. Esta página no existe.
      </p>
      <Link
        href="/"
        className="relative mt-8 rounded-full club-gradient px-8 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-all hover:shadow-lg hover:shadow-primary/30"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
