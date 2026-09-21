import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, portfolioIntro, projects, type Media as MediaType } from "@/content/portfolio";
import { siteConfig } from "@/content/siteConfig";
import { Media } from "@/components/ui/Media";
import { Footer } from "@/components/layout/Footer";
import { ProjectMotion } from "@/components/sections/ProjectMotion";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const image = (m: MediaType) => (m.type === "image" ? m.src : m.type === "video" ? m.poster : undefined);
  const cover = image(project.cover);
  return {
    title: project.title,
    description: `${project.line} ${project.category} by ${siteConfig.name}.`,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} | ${siteConfig.name}`,
      description: project.line,
      url: `/work/${project.slug}`,
      ...(cover ? { images: [{ url: cover }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  return (
    <ProjectMotion>
      <article aria-labelledby="project-title">
        {/* PROJECT NAME · ONE SHORT SENTENCE */}
        <header className="relative h-svh overflow-hidden">
          <div className="absolute inset-0">
            <Media media={project.cover} priority sizes="100vw" />
          </div>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0) 30%, rgba(5,5,5,0.2) 55%, rgba(5,5,5,0.95) 100%)",
            }}
          />
          <div className="gutter absolute inset-x-0 top-[calc(var(--nav-h)+1.5rem)] flex justify-between">
            <Link href="/#work" className="label text-bone/70 transition-colors hover:text-bone">
              ← {portfolioIntro.back}
            </Link>
            <span className="label text-bone/70">{project.category}</span>
          </div>
          <div className="gutter absolute inset-x-0 bottom-[10vh]">
            <h1 id="project-title" className="display t-hero">
              <span className="line-mask">
                <span data-rise className="block">
                  {project.title}
                </span>
              </span>
            </h1>
            <p className="mt-6 overflow-hidden">
              <span data-rise className="accent block text-[clamp(1.3rem,2.2vw,2rem)] normal-case text-bone/85">
                {project.line}
              </span>
            </p>
          </div>
        </header>

        {/* Full-screen visuals */}
        <section aria-label="Visuals" className="flex flex-col gap-[6vh] py-[10vh]">
          {project.gallery.map((m, i) => (
            <figure key={i} data-shutter className="relative h-[92svh] overflow-hidden bg-ink">
              <div data-parallax className="absolute inset-0">
                <Media media={m} sizes="100vw" />
              </div>
              <figcaption className="mono gutter absolute bottom-6 left-0 text-bone/50">
                {String(i + 1).padStart(2, "0")} / {String(project.gallery.length).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </section>

        {/* WHAT WE CREATED */}
        <section aria-labelledby="created-title" className="gutter py-[16vh]">
          <div className="grid gap-12 border-t border-line pt-12 md:grid-cols-[1fr_2fr]">
            <h2 id="created-title" className="eyebrow">
              {portfolioIntro.createdTitle}
            </h2>
            <ul data-list className="display t-lg">
              {project.created.map((c) => (
                <li key={c} className="line-mask">
                  <span data-item className="block">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next */}
        <nav aria-label="Next project" className="relative overflow-hidden border-t border-line">
          <Link href={`/work/${next.slug}`} className="group relative block h-[70svh] min-h-[420px]">
            <div className="absolute inset-0 opacity-40 transition-opacity duration-1000 group-hover:opacity-70">
              <Media media={next.cover} sizes="100vw" />
            </div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-void/70" />
            <div className="gutter absolute inset-x-0 bottom-[10vh] flex items-end justify-between gap-8">
              <div>
                <p className="label mb-6 flex items-center gap-3 text-bone/70">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red" />
                  {portfolioIntro.next}
                </p>
                <p className="display t-xl">{next.title}</p>
              </div>
              <span
                aria-hidden
                className="display t-lg translate-x-0 transition-transform duration-700 ease-[var(--ease-film)] group-hover:translate-x-3"
              >
                →
              </span>
            </div>
          </Link>
        </nav>
      </article>
      <Footer />
    </ProjectMotion>
  );
}
