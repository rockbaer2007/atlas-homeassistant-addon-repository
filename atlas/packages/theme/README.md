# @atlas/theme

Theme package for future design tokens, theme resolution and styling
integration.

---

# Status

Active theme package.

Theme provides the first stable design layer for Renderer output: token values,
CSS variable generation, selector-scoped stylesheets and browser-compatible
application to element style targets.

The package also provides a themed Renderer surface scenario for a small ATLAS
status view. It routes status output into a DOM-compatible surface, applies the
chosen tokens after a successful mount, and replaces previous status content on
later updates.

Theme is activated above Renderer and exposes its public API only through the
package root. It may depend on Renderer but remains unavailable to lower Atlas
layers.

The activation boundary keeps its Core and Renderer order. Home Assistant theme
binding and third-party styling dependencies remain outside this package.

Home Assistant remains a planned integration and is not activated by this Theme
package.

---

# Build Output

Compiled artifacts are emitted to `dist`.

Source files remain under `src`.
