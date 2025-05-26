import { House, Contact, Code, FolderCode } from "lucide-react";

export const navLinks = [
  { href: "/", label: "Home", icon: House },
  { href: "/about", label: "About", icon: Contact },
  { href: "/skills", label: "Skills", icon: Code },
  { href: "/projects", label: "Projects", icon: FolderCode },
];

export const maxRequestsData = { landing: 20, others: 10 };

export const blockedUserAgents = [
  "curl",
  "wget",
  "python-requests",
  "postman",
  "insomnia",
  "scrapy",
  "bot",
  "crawler",
  "spider",
  "headless",
];
