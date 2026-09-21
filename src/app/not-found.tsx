import Link from "next/link";

export default function NotFound() {
  return (
    <section className="gutter flex min-h-svh flex-col items-start justify-center gap-10">
      <p className="mono text-bone/50">404</p>
      <h1 className="display t-xl">
        OUT OF
        <br />
        <em>FRAME.</em>
      </h1>
      <Link
        href="/"
        className="label inline-flex items-center gap-3 rounded-full border border-bone/25 px-6 py-4 transition-colors hover:border-bone"
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red" />
        Back to the start
      </Link>
    </section>
  );
}
