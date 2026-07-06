# Repository Guidelines

## Project Structure & Module Organization

This is an Angular frontend application. Application code lives in `src/app`, with routes in `app.routes.ts`, global app wiring in `app.config.ts`, and feature folders grouped by responsibility. Reusable UI is in `src/app/components`, page-level screens are in `src/app/pages`, route guards are in `src/app/guards`, shared interfaces are in `src/app/models`, API/state logic is in `src/app/services`, and small helpers are in `src/app/utils`. Static public assets live in `public`; global Tailwind CSS and theme tokens are in `src/styles.css`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm start`: run the Angular dev server at `http://localhost:4200/`.
- `npm run build`: create a production build in `dist/`.
- `npm run watch`: build continuously with the development configuration.
- `npm test`: run Angular unit tests.

Use `npm run build` before opening a pull request when changing routing, services, or shared components.

## Coding Style & Naming Conventions

The project uses strict TypeScript and strict Angular template checking. Keep files lowercase and hyphenated, matching the current pattern: `meal-form.ts`, `food-preparation-card.html`, `recommendations.service.ts`. Use PascalCase for Angular classes and interfaces, camelCase for properties and methods, and explicit exported types for API contracts. Prefer Angular standalone components, `inject()` where already used, RxJS cleanup helpers such as `takeUntilDestroyed`, and colocated `.html` templates. Styling is primarily Tailwind utility classes plus shared tokens in `src/styles.css`.

## Testing Guidelines

No test files are currently checked in, but `npm test` is configured. Add tests as `*.spec.ts` beside the unit under test when introducing meaningful branching, service mapping, route guards, or state behavior. Favor focused tests for services and pure helpers before broad component tests. Keep test data small and include edge cases for date filters, authentication headers, and API response normalization.

## Commit & Pull Request Guidelines

Recent history uses concise Spanish, imperative commit summaries, for example `Agrega preparaciones y filtros de recomendaciones` and `Conecta recomendaciones a servicio filtrado`. Keep commits focused on one behavior change. Pull requests should include a short description, linked issue or task when available, test/build results, and screenshots for visible UI changes. Note any backend contract changes, especially fields consumed by services under `src/app/services`.

## Security & Configuration Tips

Backend configuration is currently in `src/environments/environment.ts` via `urlBackend`. Do not commit secrets or personal tokens. Authentication should continue to flow through `AuthService`; avoid duplicating token storage or manually constructing auth state in components.
