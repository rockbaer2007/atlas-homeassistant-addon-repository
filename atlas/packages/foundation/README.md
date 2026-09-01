# ATLAS Foundation

> Every great framework begins with a heartbeat.

The Foundation package provides the core infrastructure used throughout the
ATLAS framework.

Its primary goal is to offer a small, predictable and well-tested foundation
that higher-level packages can build upon.

---

# Status

Active foundation package.

Current release line:

**0.2.0-alpha.1**

---

# Public API

The package root exports the current foundation domains:

- capabilities
- diagnostics
- identity
- lifecycle
- metadata
- registry
- result
- types

Use `@atlas/foundation` rather than deep imports. The package is deliberately
small and does not yet expose runtime, module or event-bus APIs.

---

# Philosophy

The Foundation package is intentionally conservative.

New abstractions are introduced only when they solve an existing problem.

The goal is not to build the largest framework.

The goal is to build a framework developers can trust.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.

---

© ATLAS Framework
