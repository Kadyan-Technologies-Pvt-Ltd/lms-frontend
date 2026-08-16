# RR Group of Library — Frontend

React 19 + TypeScript + Vite. See the [root README](../README.md) for the full quickstart (Docker or standalone).

```bash
npm install
npm run dev      # http://localhost:5173, proxies /api to http://localhost:8000
npm run build    # tsc -b && vite build
npm run lint      # oxlint
```

Path alias `@/*` resolves to `src/*`. UI primitives come from shadcn/ui —
add more with `npx shadcn@latest add <component>`.
