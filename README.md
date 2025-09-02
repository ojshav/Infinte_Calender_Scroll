## Infinite Calendar

A lightweight React + Vite app that renders an infinitely scrollable calendar with optional journal entries.

### Run locally
- **Prerequisites**: Node.js 18+ and npm
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Lint (optional)**: `npm run lint`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

### Assumptions and design choices
- **Client-only app**: No backend. Journal data is loaded from `src/data/journalEntries.json` at runtime.
- **React + Vite**: Uses React 19 with Vite 7 for fast local development and builds.
- **Infinite navigation**: Months are generated on the fly via utilities in `src/utils/dateUtils.ts`; navigation and windowing are coordinated by hooks/components like `useInfiniteScroll` and `SwipeNavigator`.
- **State locality**: Calendar state (current month, selection, modal state) is kept in page/component state; no global store.
- **Styling**: Tailwind CSS (via `@tailwindcss/vite`) and app-level CSS in `src/index.css`/`src/App.css`.
- **Data model**: Journal entries are keyed by a date string (e.g., `YYYY-MM-DD`) and rendered in `JournalModal`/day cells. No persistence beyond the local JSON.
- **Accessibility & input**: Keyboard and touch interactions are supported where reasonable (e.g., swipe navigation component) without requiring a pointer.