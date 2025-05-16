import { SiGithub, SiIndeed, SiFacebook } from "@icons-pack/react-simple-icons";
import Link from "next/link";

function Footer() {
  return (
    <footer className="w-full bg-slate-800 px-4 py-4 md:py-8">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:gap-6">
        <div className="flex flex-row gap-6 md:gap-8">
          <Link
            href="https://github.com/ozbo1973-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-white transition-colors"
          >
            <span className="sr-only">GitHub</span>
            <SiGithub className="h-5 w-5 md:h-6 md:w-6 fill-current" />
          </Link>
          <Link
            href="https://indeed.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-white transition-colors"
          >
            <span className="sr-only">LinkedIn</span>
            <SiIndeed className="h-5 w-5 md:h-6 md:w-6 fill-current" />
          </Link>
          <Link
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-white transition-colors"
          >
            <span className="sr-only">Facebook</span>
            <SiFacebook className="h-5 w-5 md:h-6 md:w-6 fill-current" />
          </Link>
          <Link
            href="mailto:contact@example.com"
            className="text-primary hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 md:h-6 md:w-6 fill-current"
            >
              <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
              <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
            </svg>
            <span className="sr-only">Email</span>
          </Link>
        </div>

        <div className="text-white/70 text-xs md:text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} Ozbo1973. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
