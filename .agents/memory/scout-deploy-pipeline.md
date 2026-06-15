---
name: Scout deploy pipeline (GitHub + Netlify)
description: How the Scout static site reaches production and how to verify a deploy after pushing.
---

# Scout deploy pipeline

The live site https://scoutcontent.studio is a Netlify site that auto-builds from
the GitHub repo on every push to `main`. There is no build step (static publish).

## Pushing
- Remote `origin` is `https://github.com/bissellcraig-byte/spectral`. GitHub reports
  the repo moved to `bissellcraig-byte/ReplitScout`, but the old URL still accepts
  pushes (same underlying repo) and Netlify deploys still fire.
- Authenticate with the `GITHUB_PAT` secret via a credential helper — never put the
  token in the remote URL.
- A trailing `update_ref failed ... main.lock` message after a successful push is
  **benign** (local tracking-ref lock). Confirm success via the `... main -> main`
  line, `git ls-remote origin`, and `git ls-tree -r HEAD` for the expected files.

## Verifying the deploy (important)
- Netlify's edge can keep serving the OLD build (or 404 for newly-added files) for
  several minutes after a push. Observed >9 min lag with no propagation in one case.
- Edge responses show `cache-status: "Netlify Edge"; hit` with an `age` header.
  Even cache-busting query strings can keep returning 404 until the new deploy
  actually publishes — i.e. the origin itself hasn't switched deploys yet.
- **Why:** the deploy is async and outside the agent's control (no Netlify dashboard
  access from the repl). Do not treat a post-push 404/stale page as a code failure.
- **How to apply:** push + confirm on the GitHub remote, verify the local build, then
  re-check production over time. If it stays stale for many minutes, the user should
  check the Netlify dashboard for a queued/failed deploy rather than re-pushing.

## Main agent vs task agent for pushing
- The **main agent cannot run destructive git** (commit/fetch/merge/rebase/pull) —
  attempts are blocked with "not allowed in the main agent." Plain `git push` is
  permitted but only fast-forwards; it is rejected if the remote has diverged.
  File edits are auto-committed by Replit checkpoints. To push, create a project task;
  the **assigned task agent** runs in an isolated env where full git works.

## Netlify pushes commits BACK to GitHub (remote diverges)
- Netlify periodically pushes its own commit to `origin/main` (user confirmed "the
  last push was from netlify"). This puts a commit on the remote that the local
  branch does NOT have, so a plain fast-forward push is **rejected** (non-ff).
- **Why:** the local checkpoint history and the GitHub remote drift apart on their
  own; you cannot assume `origin/main` == the last commit a push task left there.
- **How to apply:** every push task must FETCH first, then **rebase the local
  commits on top of `origin/main`** (preserve Netlify's commit — never force-push
  over it), then push. The main agent cannot do this (fetch/rebase blocked); it
  must be done by the isolated task agent.

## llms.txt was 404 in production (extra root files must be in the deployed tree)
- `robots.txt` and `sitemap.xml` serve 200 live, but `/llms.txt` returned 404 even
  after a push task for it was marked done — i.e. the file was not in the deployed
  tree (likely lost to the remote divergence above, not a routing/MIME issue).
- **How to apply:** after pushing, verify each newly-added root file directly with a
  live HTTP status check; a "merged" push task is not proof the file is live.
