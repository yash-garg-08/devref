# DevRef

A personal developer command reference dashboard — your SSH connections, kubectl commands, deploy scripts, and CLI snippets in one fast, searchable, editable place.

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Prisma + SQLite**.

---

## Features

- **Tabbed categories** — group commands by project or tool, with custom colour coding per tab
- **Tab-coloured cards** — each card's header renders a gradient tinted with its parent tab's colour; card titles are tinted to match, making it instantly clear which tab a card belongs to even in the "All" view
- **Multiple card types** — Command Cards for code/text, IP Reference cards for server tables; extensible registry for future types
- **Inline editing** — edit any command block in-place; click ✎ on a card title to rename it
- **Full-text search** — instantly filters across all cards, titles, commands, and tags
- **Tab management** — add, rename, colour, and delete tabs via a `···` dropdown
- **Card management** — add, rename, move between tabs, and delete cards with confirmation
- **Persistent** — all changes saved to SQLite (dev) or PostgreSQL (prod) via REST API
- **Dark theme** — designed for daily terminal use; gradient header for visual hierarchy

---

## Tech stack

| Layer      | Tech                              |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Language   | TypeScript                        |
| Styling    | Tailwind CSS                      |
| ORM        | Prisma                            |
| Database   | SQLite (dev) / PostgreSQL (prod)  |

---

## Getting started

### 1. Clone & install

```bash
git clone https://github.com/your-username/devref.git
cd devref
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

The default `.env` uses SQLite — no extra setup needed for local development.

To use PostgreSQL, update `DATABASE_URL` in `.env` and change `provider` in `prisma/schema.prisma` to `"postgresql"`.

### 3. Set up the database

```bash
npm run db:push    # sync schema to SQLite
npm run db:seed    # populate with starter cards
```

> **Note:** The seed file ships with generic placeholder data. After first run, edit your cards directly in the UI — they persist to the DB automatically.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
devref/
├── app/
│   ├── api/
│   │   ├── tabs/
│   │   │   ├── route.ts          # GET all tabs + cards, POST new tab
│   │   │   └── [id]/route.ts     # PATCH (rename / colour), DELETE tab
│   │   └── cards/
│   │       ├── route.ts          # POST new card (with type)
│   │       └── [id]/route.ts     # PATCH (edit / move), DELETE card
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Server component — fetches initial data
│
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx         # Client root — all state lives here
│   │   ├── TabBar.tsx            # Tab bar with colour picker + dropdown menu
│   │   ├── AddCardModal.tsx      # Two-step card creation (type picker → form)
│   │   ├── CommandCard.tsx       # Command / code reference card
│   │   ├── IpReferenceCard.tsx   # IP address table card
│   │   ├── CodeBlock.tsx         # Inline-editable code block
│   │   └── SearchBar.tsx         # Search input
│   └── ui/
│       └── Modal.tsx             # Reusable modal + ModalInput / ModalSelect
│
├── lib/
│   ├── cardTypes.ts              # Card type registry (add new types here)
│   ├── db.ts                     # Prisma client singleton
│   └── utils.ts                  # cn(), slugify(), tagClass()
│
├── prisma/
│   ├── schema.prisma             # Tab + Card models
│   ├── seed.ts                   # Seed with generic starter data
│   └── migrations/               # SQL migration history
│
├── types/
│   └── index.ts                  # Shared TypeScript interfaces
│
└── .env.example
```

---

## Adding a new card type

Card types are defined in [`lib/cardTypes.ts`](lib/cardTypes.ts). Each entry is a `CardTypeDefinition`:

```ts
// lib/cardTypes.ts
export const CARD_TYPES: CardTypeDefinition[] = [
  {
    id: 'code',           // stored in the DB `type` column
    label: 'Command Card',
    description: 'Shell commands, code snippets, or any text reference',
    icon: '⌨',
    defaultCode: '',
    fields: ['code'],     // extra fields shown in the creation form
  },
  {
    id: 'ip-table',
    label: 'IP Reference',
    description: 'A table of server names and IP addresses',
    icon: '⬡',
    defaultCode: '[]',
    fields: [],
  },
  // ↓ add your own type here and it will appear in the card picker automatically
]
```

Then create a render component (e.g. `components/dashboard/MyNewCard.tsx`) and add a branch in `Dashboard.tsx` following the existing `isIpTable` pattern.

---

## Prisma + SQLite notes

The Prisma client in this repo was generated against the initial schema. Two columns (`Card.type` and `Tab.color`) were added later via `ALTER TABLE`. Because the generated client predates them, the API routes use `prisma.$queryRawUnsafe` / `prisma.$executeRawUnsafe` for those fields.

When deploying fresh — where you run `npx prisma generate` and `npx prisma db push` from a clean state — these columns will be part of the generated client and the raw-SQL workarounds become redundant (but are harmless to keep).

---

## Deploying

### Vercel + PostgreSQL (recommended)

1. Push the repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add a **Postgres** database from the Vercel Storage tab
4. Copy the `DATABASE_URL` into your project environment variables
5. Update `prisma/schema.prisma` provider to `"postgresql"`
6. Deploy — Vercel runs `prisma generate` automatically via the `postinstall` script

### Run migrations in prod

```bash
npx prisma migrate deploy
npx prisma db seed
```

---

## Scripts

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start dev server (localhost:3000)  |
| `npm run build`     | Production build                   |
| `npm run db:push`   | Sync schema to database            |
| `npm run db:seed`   | Seed database with starter data    |
| `npm run db:studio` | Open Prisma Studio (visual DB UI)  |

---

## License

MIT
