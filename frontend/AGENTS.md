<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All backend calls go through `src/lib/api.ts`, which parses raw responses into `src/types` models; components never transform API data. Why: the FastAPI contract is provisional.
- Sample data lives only in `src/data/demoData.ts` and is selected by `src/lib/queries.ts` based on the mode in `src/lib/mode.ts`; never silently fall back to sample data on API failure. Why: sample results must never pass as live findings.
- Mode is client-side (localStorage), so data hooks use client `useQuery`, not SSR loaders. Why: the server cannot know the user's mode.
