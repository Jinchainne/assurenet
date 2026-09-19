# AssureNet Design System

AssureNet should feel like a calm financial instrument, not a speculative crypto dashboard. It combines editorial fintech clarity with Swiss grid discipline and restrained, Theatre-inspired choreography.

## Tokens

- Ink `#101814`: headings, dark surfaces, primary text.
- Paper `#f2f0e7`: page canvas.
- Signal lime `#b7ef66`: primary actions only.
- Mint `#dfffb1`: success surfaces.
- Rule `#c8c9bd`: dividers and input borders.
- Body `#4d5b53`: secondary copy.
- Danger `#b42318`: errors and destructive states only.

Use system sans for UI and Georgia only as an editorial accent. Display type is 800–900 weight and tightly tracked; body copy stays 400–600 with 1.5–1.7 line-height.

## Shape and layout

- 4px spacing base; common gaps 8, 16, 24, 32, 48, 80.
- Marketing sections use a 1200px visual container and generous vertical space.
- Functional inputs use 10–12px radius. Cards use 18–24px. Status uses pill radius.
- Minimum interactive height is 44px. Every control has hover, focus-visible and disabled states.
- Desktop hero is a 55/45 split. Tablet becomes two rows; mobile is one column.

## Motion

Choreograph only comprehension: the consensus scanner breathes, the proof point moves, cards lift 3px on hover, and transaction phases update in place. Keep transitions 180–300ms. Stop nonessential animation under `prefers-reduced-motion: reduce`. Never animate transactional controls while awaiting signature.

## Guardrails

Do use real empty states, canonical data, visible labels, concise copy and semantic status color. Test 375, 768, 1024 and 1440px.

Do not use fake metrics, generic AI gradients, glassmorphism, emoji as controls, excessive pills, hidden labels, autoplay video, or page-wide perpetual motion.
