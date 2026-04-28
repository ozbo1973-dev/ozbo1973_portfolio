## Ozbo1973 Portfolio

## Project Overview

This is a portfolio website for Brady Bovero (OzBo1973) built with Next.js 16, React 19, and TypeScript. It's a single-page application with scroll-based navigation and a contact form submission system.

## Common Commands

```bash
# Development
pnpm dev              # Start dev server at localhost:3000

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run Next.js linter
```

## Architecture

### App Structure

- **Next.js App Router**: Uses the modern app directory structure
- **Single Page Application**: All content is on the home page with scroll-based section navigation
- **Client/Server Split**: Server actions for form submission, client components for UI interactions

### Key Architectural Patterns

**Navigation System**:

- Single-page scroll navigation using `NavigationProvider` context (src/context/navigation-context.tsx)
- Sections are div elements with IDs ("home", "about", "skills", "projects", "contact")
- Navigation links in config use route-like strings ("/", "/about", etc.) but map to section IDs
- Active section tracking via scroll position with IntersectionObserver logic
- Navbar shrinks from h-24 to h-16 when scrolled past hero section (tracked via `isScrolled` state)

**Form Submission Flow**:

1. Client-side form component (src/components/sections/contact.tsx)
2. Server action (src/lib/actions/submitProspectiveCustomer.ts)
3. MongoDB storage via Mongoose (src/lib/models/ProspectiveCustomer.ts)
4. Email notifications via Resend (owner + customer confirmation)

**Security Layers**:

- Middleware protection (src/middleware.ts) for rate limiting and suspicious request detection
- Honeypot field ("company") in contact form to catch bots
- User-agent filtering against common automation tools (curl, wget, postman, etc.)
- IP-based rate limiting with in-memory storage (Maps)
- Suspicious IP tracking in MongoDB (src/lib/models/SuspiciousID.ts)
- Multiple security checks: referer validation, blacklist, rate limits

**Database Connection**:

- MongoDB via Mongoose with connection caching (src/lib/db/connect.ts)
- Global caching prevents connection exhaustion during hot reloads
- Connection string in DATABASE_URI environment variable

### Directory Structure

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx          # Root layout with fonts, metadata, providers
│   ├── page.tsx            # Home page (renders all sections)
│   └── globals.css         # Tailwind v4 CSS with theme variables
├── components/
│   ├── navigation/         # Navbar, mobile menu, navigation buttons
│   ├── sections/           # Main sections (hero, about, skills, projects, contact)
│   ├── ui/                 # shadcn/ui components (button, input, textarea, etc.)
│   ├── email-template.tsx  # Owner notification email
│   └── customer-confirmation-email.tsx  # Customer confirmation email
├── context/
│   └── navigation-context.tsx  # Global navigation state and scroll handling
├── lib/
│   ├── actions/            # Server actions (submitProspectiveCustomer)
│   ├── db/                 # MongoDB connection
│   ├── models/             # Mongoose schemas (ProspectiveCustomer, SuspiciousID)
│   ├── security/           # Rate limiting, suspicious request detection
│   ├── config.ts           # Navigation links, rate limits, blocked user agents
│   └── utils.ts            # cn() utility for className merging
├── hooks/
│   └── use-mobile.ts       # Mobile breakpoint detection
└── middleware.ts           # Request protection and security headers
```

### Technology Stack

- **Framework**: Next.js 15.3 with App Router
- **React**: v19 with React Server Components
- **Styling**: Tailwind CSS v4 with CSS variables, tw-animate-css plugin
- **UI Library**: shadcn/ui (New York style variant)
- **Icons**: lucide-react, @icons-pack/react-simple-icons
- **Database**: MongoDB via Mongoose
- **Email**: Resend API
- **Validation**: Zod schemas
- **Notifications**: sonner toast library

### Important Implementation Details

**Styling Approach**:

- Tailwind CSS v4 uses CSS-first configuration via @import in globals.css
- Theme defined using CSS custom properties with oklch color space
- Dark mode support via .dark class variant
- Responsive breakpoints include custom xs breakpoint (25rem/400px)
- cn() utility combines clsx and tailwind-merge for conditional classes

**Path Aliases**:

- `@/*` maps to `src/*`
- Components, utils, lib, hooks all use @ prefix imports

**Environment Variables Required**:

- `DATABASE_URI`: MongoDB connection string
- `RESEND_API_KEY`: Resend email API key
- `NOTIFICATION_EMAIL`: Email address for notifications
- `NEXT_PUBLIC_APP_URL`: Application URL for referer validation

**MongoDB Models**:

- ProspectiveCustomer: firstName, lastName, email, description (all required)
- SuspiciousID: ip, reason, createdAt (for tracking suspicious activity)

**Rate Limiting Configuration** (src/lib/config.ts):

- Landing page: 20 requests per minute
- Other routes: 10 requests per minute
- Contact form action: 3 submissions per 5 minutes
- Blacklist after 10 failed attempts

### Component Conventions

- UI components use shadcn/ui patterns with cn() for className composition
- Section components wrapped in SectionWrapper for consistent layout
- Navigation uses custom NavButton and ContactButton components
- Mobile menu uses sheet component from shadcn/ui
- All section wrappers accept bgImage prop for background images
