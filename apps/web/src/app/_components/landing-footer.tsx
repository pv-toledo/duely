import { FaGithub, FaLinkedin } from "react-icons/fa6";

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-muted-foreground sm:items-start sm:px-8">
        <span>
          © {new Date().getFullYear()} Duely — a personal project, not a commercial product.
        </span>
        <div className="flex items-center gap-4">
          <span>Built by Paulo Toledo</span>

          <a
            href="https://github.com/pv-toledo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <FaGithub className="size-4" />
            GitHub
          </a>

          <a
            href="https://www.linkedin.com/in/paulo-vinicius-toledo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <FaLinkedin className="size-4" />
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
