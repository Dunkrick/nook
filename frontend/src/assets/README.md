# Nook assets

Import the stylesheet once from your app entry point:

```ts
import "./assets/styles/index.css";
```

`styles/index.css` is the only CSS entry point. It loads foundation tokens first, then workspace and artifact styles.

Legacy `nook-tokens.css` is intentionally not included. `nook-tokens.json` is retained as a framework-neutral token reference.
