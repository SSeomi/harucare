Perform a complete git push workflow for the Harucare project.

Follow these steps exactly:

1. Run `git status` to check for uncommitted changes.
2. If there are staged or unstaged changes, stop and tell the user to commit first (or ask if they want you to commit them).
3. Run `git log origin/master..HEAD --oneline` to list commits that will be pushed.
4. If there are no commits ahead of origin, tell the user there is nothing to push.
5. Show the user the list of commits that will be pushed and ask for confirmation before proceeding.
6. Once confirmed, run `git push origin master`.
7. Report success or failure clearly.

Never force-push. Never skip confirmation. Always show what will be pushed before pushing.
