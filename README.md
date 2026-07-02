# BerryBox

Static frontend MVP for an original AI game maker SaaS. The app is built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide icons, and shadcn/ui-style local components.

## Pages

- `/` - landing page with prompt composer, product sections, featured games, pricing preview, and FAQ
- `/templates` - mock template gallery
- `/editor` - static AI game editor with chat, game preview, file tree, code preview, and assets
- `/gallery` - mock generated games gallery
- `/pricing` - static pricing cards
- `/roadmap` - future product phases

## Static-only constraints

This project does not connect real AI APIs, auth, payment, database, storage, or deployment. All content is mock data. Future provider interfaces live in `src/lib/future`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
```

