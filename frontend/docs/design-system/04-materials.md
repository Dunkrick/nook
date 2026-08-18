# Materials

Every visible object belongs to one material level.

| Level | Token | Purpose |
| --- | --- | --- |
| Canvas | `--color-canvas` | Quiet outer environment |
| Surface | `--color-surface` | Desk / wall plane |
| Artifact | `--color-artifact` | Notes, cards, and contained content |
| Selection | `--color-selection` | Temporary chosen-state indicator |
| Overlay | `--color-overlay` | Modal or elevated attention state |

Elevation communicates level: use `--elevation-surface` for the wall, `--elevation-artifact` for notes, `--elevation-drag` while moving a thought, and `--elevation-overlay` for floating tools and panels. Borders and shadows indicate containment or elevation; they are not ornamental.
