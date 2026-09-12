# Coding conventions

- Use TypeScript and @/* imports.
- Use PascalCase for React components and camelCase for variables/functions.
- Prefer small components and explicit props.
- Use Zustand selectors to subscribe only to the state each component needs.
- Keep API calls in services, never directly in components.
- Keep DTO/domain types in src/types; do not spread untyped API data through pages.
- Use Tailwind utilities and the existing theme tokens. The primary brand accent is #E50914.
- Provide accessible labels, keyboard focus states, and useful empty/loading/error states.
- Use motion/react for restrained opacity/transform/filter animation and honor reduced-motion settings.
- Do not treat route guards as backend security; server authorization is authoritative.

