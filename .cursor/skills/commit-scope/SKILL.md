---
name: commit-scope
description: >-
  Shows the git diff and a one-line commit message for the current decision.
  Does not run git commit. Use for "покажи diff", "show diff",
  "commit message", "какой скоуп", "what is the scope".
---

# Commit scope

## When to use

The code chat has finished one decision and must show its diff. Also when the user asks to see the diff or the commit message. Do not run this to end a build with a commit.

## Steps

1. Run `git status` and `git diff`. If this directory is not a git repository, stop. Do not run `git init`.
2. Show the diff in the reply. When it is long, show `git diff --stat` first, then the full diff of the files that belong to this decision. Name unrelated uncommitted files separately and leave them out of the scope.
3. Write the commit message as one sentence: the decision and why, in the style of `git log`. Not a file list.
4. Do not run `git commit`. Do not suggest force-push or amend.

## Notes

The user commits when the diff matches the decision. "Ok" on a prompt is not a commit.
