import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-6 text-ink">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brass-2">404</p>
        <h1 className="mt-3 font-display text-5xl">Page not found</h1>
        <p className="mt-3 text-stone">The page you requested does not exist or is no longer available.</p>
        <Link href="/" className="btn btn-dark mt-8 inline-flex">
          Back home
        </Link>
      </div>
    </div>
  );
}
