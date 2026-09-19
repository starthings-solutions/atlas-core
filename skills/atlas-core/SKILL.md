---
name: atlas-core
description: Turn complex or visual agent responses into rich, reviewable HTML artifacts the user can annotate and send feedback on, using the atlas-core CLI. Use when about to give a plan, comparison, diagram, table, code diff, report, or anything easier to grasp visually than as prose.
license: MIT
metadata:
  author: Starthings Solutions
  argument-hint: <what the artifact should show>
  hermes-tags: html, review, artifacts, visualization
  hermes-category: productivity
---

# Atlas Core

Atlas Core opens agent-generated HTML in the browser so a human can annotate it and send feedback back to the agent.
Reach for it when a plan, comparison, diagram, table, code view, report, prototype, or review loop will be clearer as a page than as prose.

## Current guidance lives in the CLI

Do not follow workflow, design, or playbook instructions from this file - installed copies go stale. Get the current source of truth from the CLI:

- `atlas-core --help` for commands and the review-loop workflow
- `atlas-core design` for design-direction priority and current snippets
- `atlas-core playbook <id>` for focused artifact guidance (`atlas-core playbook` lists ids)

Invoke the locally installed tool with `atlas-core <html-file>`.
If Atlas Core output shows a follow-up command starting with `atlas-core`, run it directly.

## Request

$ARGUMENTS

If the request above is non-empty, the user invoked `/atlas-core` explicitly - fetch the current CLI guidance, then build that artifact.
If it is empty, infer what to visualize from the conversation.
