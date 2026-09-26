function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.27 7.77 10.77.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.94.1-.73.4-1.24.72-1.53-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.16-3.04-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.12 1.16a10.9 10.9 0 0 1 5.68 0c2.17-1.46 3.12-1.16 3.12-1.16.61 1.56.23 2.71.11 3 .72.79 1.16 1.8 1.16 3.04 0 4.35-2.66 5.31-5.19 5.59.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55A11.26 11.26 0 0 0 23.25 11.75C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col">
          <span className="font-mono text-lg font-bold tracking-tight text-foreground">
            Auto<span className="text-primary">Vector</span>
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            Toy Auto-Vectorization Compiler
          </span>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-5 font-mono text-sm text-muted-foreground">
          <a href="#visualizer" className="transition-colors hover:text-foreground">
            Visualizer
          </a>
          <a href="#examples" className="transition-colors hover:text-foreground">
            Examples
          </a>
          <a href="#about" className="transition-colors hover:text-foreground">
            About
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubMark className="size-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}
