import { defaultKeymap, history, historyKeymap, indentWithTab, redo, undo } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";

const languageCompartment = new Compartment();
const editableCompartment = new Compartment();
const lineWrappingCompartment = new Compartment();
const fontSizeCompartment = new Compartment();
const themeCompartment = new Compartment();

function extensionLanguage(extension) {
  const normalizedExtension = String(extension ?? "").trim().toLowerCase();
  if (["yaml", "yml"].includes(normalizedExtension)) return yaml();
  if (normalizedExtension === "json") return json();
  if (["js", "mjs", "ts"].includes(normalizedExtension)) return javascript({ typescript: normalizedExtension === "ts" });
  if (["md", "markdown"].includes(normalizedExtension)) return markdown();
  return [];
}

function createAtlasLightTheme(fontSize) {
  return EditorView.theme({
    "&": {
      height: "100%",
      minHeight: "100%",
      fontSize: `${fontSize}px`,
      backgroundColor: "var(--atlas-panel-soft)",
      color: "var(--atlas-text)",
    },
    ".cm-scroller": {
      fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
      lineHeight: "1.55",
    },
    ".cm-content": {
      minHeight: "100%",
      caretColor: "var(--atlas-accent)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--atlas-panel)",
      borderRight: "1px solid var(--atlas-border)",
      color: "var(--atlas-muted)",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "var(--atlas-accent-soft)",
    },
    "&.cm-focused": {
      outline: "2px solid color-mix(in srgb, var(--atlas-accent) 30%, transparent)",
    },
  }, { dark: false });
}

function createAtlasDarkTheme(fontSize) {
  return [
    oneDark,
    EditorView.theme({
      "&": {
        height: "100%",
        minHeight: "100%",
        fontSize: `${fontSize}px`,
        backgroundColor: "var(--atlas-panel-soft)",
        color: "var(--atlas-text)",
      },
      ".cm-scroller": {
        fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
        lineHeight: "1.55",
      },
      ".cm-gutters": {
        backgroundColor: "var(--atlas-panel)",
        borderRight: "1px solid var(--atlas-border)",
        color: "var(--atlas-muted)",
      },
      ".cm-activeLine, .cm-activeLineGutter": {
        backgroundColor: "var(--atlas-accent-soft)",
      },
    }, { dark: true }),
  ];
}

function themeExtension(fontSize) {
  return document.documentElement.dataset.theme === "dark"
    ? createAtlasDarkTheme(fontSize)
    : createAtlasLightTheme(fontSize);
}

function createEditor(host, options = {}) {
  const onChange = typeof options.onChange === "function" ? options.onChange : () => {};
  const onCursor = typeof options.onCursor === "function" ? options.onCursor : () => {};
  let currentFontSize = Number.isFinite(options.fontSize) ? options.fontSize : 14;

  const view = new EditorView({
    parent: host,
    state: EditorState.create({
      doc: options.content ?? "",
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
        languageCompartment.of(extensionLanguage(options.extension)),
        editableCompartment.of(EditorView.editable.of(options.readonly !== true)),
        lineWrappingCompartment.of(options.wordWrap === false ? [] : EditorView.lineWrapping),
        fontSizeCompartment.of(EditorView.theme({
          "&": { fontSize: `${currentFontSize}px` },
        })),
        themeCompartment.of(themeExtension(currentFontSize)),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            onChange();
          }
          if (update.selectionSet || update.docChanged) {
            onCursor(getCursorPosition(view));
          }
        }),
      ],
    }),
  });

  return {
    getValue() {
      return view.state.doc.toString();
    },
    setValue(value) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value ?? "",
        },
      });
    },
    setReadOnly(readonly) {
      view.dispatch({
        effects: editableCompartment.reconfigure(EditorView.editable.of(readonly !== true)),
      });
    },
    setLanguage(extension) {
      view.dispatch({
        effects: languageCompartment.reconfigure(extensionLanguage(extension)),
      });
    },
    setWordWrap(wordWrap) {
      view.dispatch({
        effects: lineWrappingCompartment.reconfigure(wordWrap === false ? [] : EditorView.lineWrapping),
      });
    },
    setFontSize(fontSize) {
      currentFontSize = fontSize;
      view.dispatch({
        effects: fontSizeCompartment.reconfigure(EditorView.theme({
          "&": { fontSize: `${fontSize}px` },
        })),
      });
    },
    refreshTheme() {
      view.dispatch({
        effects: themeCompartment.reconfigure(themeExtension(currentFontSize)),
      });
    },
    cursorPosition() {
      return getCursorPosition(view);
    },
    undo() {
      return undo(view);
    },
    redo() {
      return redo(view);
    },
    focus() {
      view.focus();
    },
  };
}

function getCursorPosition(view) {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  return {
    line: line.number,
    column: head - line.from + 1,
  };
}

window.AtlasFileStudioEditor = {
  create: createEditor,
};
