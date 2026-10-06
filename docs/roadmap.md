# Nook Roadmap

Nook is being built in deliberate phases.

Each phase has a primary learning and product objective.

The goal is not simply to add features.

Each version should increase both:

1. Product capability.
2. Engineering capability.

```mermaid
flowchart TD
    V1[Version 1<br/>Full Stack Foundations] --> V2
    V2[Version 2<br/>Backend Engineering] --> V25
    V25[Version 2.5<br/>Production Architecture] --> V3
    V3(((Version 3<br/>Frontend & Users))) --> V4
    V4[Version 4<br/>Spatial Intelligence]) --> V5
    V5[Version 5<br/>AI-Assisted Thinking Experience]
```

---

## GitHub Integration

### V1 — GitHub → Nook
- Synchronize GitHub issues into Nook artifacts
- Map repositories to workspaces
- Preserve issue identity and lifecycle state

### V2 — Nook → GitHub
- Create GitHub issues from Nook
- Link Nook artifacts to created issues

### V3 — Bidirectional synchronization
- Synchronize state changes in both directions

### V4 — Project workflow
- Ideas → Issues → PRs → Shipped
