# Working on this codebase

## The layering rule

`prisma` may only be imported from `lib/` and `actions/`. If a component needs
data, it gets it as a prop from a Server Component. This is the one convention
that keeps the other layers from collapsing into each other.

## Adding a field to Property

Touch these four, in order:

1. `prisma/schema.prisma` — add the column, then `npx prisma migrate dev`
2. `lib/validations.ts` — add it to `propertySchema`
3. `components/property/property-form.tsx` — add the input
4. `app/properties/[id]/page.tsx` — display it

`lib/queries.ts:propertyCardSelect` only needs a change if the search card shows
the field.

## Adding a role

`Role` in the schema → `middleware.ts:GUARDED` → a layout under `app/dashboard/`
that calls `requireRole()`. Never gate on the client alone.

## Conventions

- Server Components by default; `"use client"` only for state, effects or events.
- Every mutation validates with Zod on the server, even when the client already did.
- Errors say what happened and what to do next. They don't apologise.
- Buttons name the outcome ("Publish listing"), and the toast that follows uses
  the same word ("Published").
