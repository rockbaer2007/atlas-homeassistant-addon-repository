import { defaultKeymap, history, historyKeymap, indentWithTab, redo, undo } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import { bracketMatching, defaultHighlightStyle, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
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
  Decoration,
  ViewPlugin,
} from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";

const languageCompartment = new Compartment();
const editableCompartment = new Compartment();
const lineWrappingCompartment = new Compartment();
const fontSizeCompartment = new Compartment();
const themeCompartment = new Compartment();

function atlasSyntaxHighlighting(dark) {
  const highlightStyle = HighlightStyle.define([
    { tag: tags.comment, color: dark ? "#8ab4f8" : "#174ea6" },
    { tag: tags.number, color: dark ? "#f2c14e" : "#9a3412" },
  ]);
  return [
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    syntaxHighlighting(highlightStyle),
  ];
}

const templateStringHighlighting = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.build(view);
  }

  update(update) {
    if (update.docChanged) this.decorations = this.build(update.view);
  }

  build(view) {
    const source = view.state.doc.toString();
    const decorations = [];
    const templateExpression = /\{\{([\s\S]*?)\}\}/g;
    let expression;

    while ((expression = templateExpression.exec(source))) {
      const body = expression[1];
      const bodyStart = expression.index + 2;
      const stringToken = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;
      const stringRanges = [];
      let stringMatch;
      while ((stringMatch = stringToken.exec(body))) {
        const from = bodyStart + stringMatch.index;
        const to = from + stringMatch[0].length;
        stringRanges.push([from, to]);
        decorations.push(Decoration.mark({ class: "cm-atlas-template-string" }).range(from, to));
      }

      const numberToken = /\b\d+(?:\.\d+)?\b/g;
      let numberMatch;
      while ((numberMatch = numberToken.exec(body))) {
        const from = bodyStart + numberMatch.index;
        const to = from + numberMatch[0].length;
        if (stringRanges.some(([stringFrom, stringTo]) => from < stringTo && to > stringFrom)) continue;
        decorations.push(Decoration.mark({ class: "cm-atlas-template-number" }).range(from, to));
      }
    }

    return Decoration.set(decorations.sort((left, right) => left.from - right.from));
  }
}, { decorations: value => value.decorations });

function extensionLanguage(extension) {
  const normalizedExtension = String(extension ?? "").trim().toLowerCase();
  if (["yaml", "yml"].includes(normalizedExtension)) return yaml();
  if (normalizedExtension === "json") return json();
  if (["js", "mjs", "ts"].includes(normalizedExtension)) return javascript({ typescript: normalizedExtension === "ts" });
  if (["md", "markdown"].includes(normalizedExtension)) return markdown();
  return [];
}

function createAtlasLightTheme(fontSize) {
  return [EditorView.theme({
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
    ".cm-atlas-template-string": { color: "#7e22ce" },
    ".cm-atlas-template-number": { color: "#9a3412" },
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
  }, { dark: false }),
  atlasSyntaxHighlighting(false),
  ];
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
      ".cm-atlas-template-string": { color: "#f0abfc" },
      ".cm-atlas-template-number": { color: "#f2c14e" },
      ".cm-activeLine, .cm-activeLineGutter": {
        backgroundColor: "var(--atlas-accent-soft)",
      },
    }, { dark: true }),
    atlasSyntaxHighlighting(true),
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
        templateStringHighlighting,
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
