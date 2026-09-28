import { defaultKeymap, history, historyKeymap, indentWithTab, redo, undo } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting, syntaxTree } from "@codemirror/language";
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
  return [syntaxHighlighting(defaultHighlightStyle, { fallback: true })];
}

const yamlValueHighlighting = ViewPlugin.fromClass(class {
  constructor(view) {
    this.decorations = this.build(view);
  }

  update(update) {
    if (update.docChanged || update.viewportChanged || update.transactions.length) {
      this.decorations = this.build(update.view);
    }
  }

  build(view) {
    const source = view.state.doc.toString();
    const decorations = [];
    const tree = syntaxTree(view.state);
    tree.iterate({
      enter(node) {
        if (node.name === "Comment") {
          decorations.push(Decoration.mark({ class: "cm-atlas-yaml-comment" }).range(node.from, node.to));
        }

        const isKey = node.node.parent?.name === "Key";
        if (node.name === "QuotedLiteral" && !isKey) {
          decorations.push(Decoration.mark({ class: "cm-atlas-yaml-string" }).range(node.from, node.to));
        }

        if ((node.name === "Literal" || node.name === "QuotedLiteral") && !isKey) {
          const quoted = node.name === "QuotedLiteral";
          const rawValue = source.slice(node.from, node.to);
          const value = (quoted ? rawValue.slice(1, -1) : rawValue).trim();
          const valueFrom = node.from + (quoted ? 1 : 0);
          const valueTo = node.to - (quoted ? 1 : 0);
          const className = /^true$/i.test(value)
            ? "cm-atlas-yaml-true"
            : /^false$/i.test(value)
              ? "cm-atlas-yaml-false"
              : /^unknown$/i.test(value)
                ? "cm-atlas-yaml-unknown"
                : !quoted && /^[+-]?(?:0x[\da-f_]+|0o[0-7_]+|0b[01_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?)$/i.test(value)
                  ? "cm-atlas-yaml-number"
                : null;
          if (className) decorations.push(Decoration.mark({ class: className }).range(valueFrom, valueTo));
        }

        if (node.name === "BlockLiteralContent") {
          const pair = node.node.parent?.parent;
          const key = pair?.getChild("Key");
          if (!key || source.slice(key.from, key.to).trim().toLowerCase() !== "query") return;
          const block = source.slice(node.from, node.to);
          const sqlKeyword = /\b(?:SELECT|FROM|WHERE|ROUND|SUM|AS|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|LIMIT|CASE|WHEN|THEN|ELSE|END|DISTINCT|COUNT|AVG|MIN|MAX|AND|OR|NOT|IN|IS|NULL|LIKE)\b/g;
          let match;
          while ((match = sqlKeyword.exec(block))) {
            const from = node.from + match.index;
            decorations.push(Decoration.mark({ class: "cm-atlas-sql-keyword" }).range(from, from + match[0].length));
          }
        }
      },
    });
    return Decoration.set(decorations.sort((left, right) => left.from - right.from));
  }
}, { decorations: value => value.decorations });

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
      decorations.push(Decoration.mark({ class: "cm-atlas-template-delimiter" }).range(expression.index, expression.index + 2));
      decorations.push(Decoration.mark({ class: "cm-atlas-template-delimiter" }).range(templateExpression.lastIndex - 2, templateExpression.lastIndex));
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

      const templateFunction = /\b(?:states|float|map|round)\b/gi;
      let functionMatch;
      while ((functionMatch = templateFunction.exec(body))) {
        const from = bodyStart + functionMatch.index;
        const to = from + functionMatch[0].length;
        if (stringRanges.some(([stringFrom, stringTo]) => from < stringTo && to > stringFrom)) continue;
        decorations.push(Decoration.mark({ class: "cm-atlas-template-function" }).range(from, to));
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
  if (["yaml", "yml"].includes(normalizedExtension)) return [yaml(), yamlValueHighlighting];
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
    ".cm-atlas-template-delimiter": { color: "#374151" },
    ".cm-atlas-template-function": { color: "#c2410c" },
    ".cm-atlas-yaml-comment": { color: "#008f87" },
    ".cm-atlas-yaml-string": { color: "#16803c" },
    ".cm-atlas-yaml-number": { color: "#9a3412" },
    ".cm-atlas-yaml-true": { color: "#16803c", fontWeight: "600" },
    ".cm-atlas-yaml-false": { color: "#c62828", fontWeight: "600" },
    ".cm-atlas-yaml-unknown": { color: "#b45309", fontWeight: "600" },
    ".cm-atlas-sql-keyword": { color: "#7c3aed", fontWeight: "600" },
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
      ".cm-atlas-template-number": { color: "#ffffff" },
      ".cm-atlas-template-delimiter": { color: "#ffffff" },
      ".cm-atlas-template-function": { color: "#ffd54f" },
      ".cm-atlas-yaml-comment": { color: "#4dd0e1" },
      ".cm-atlas-yaml-string": { color: "#81c784" },
      ".cm-atlas-yaml-number": { color: "#ffffff" },
      ".cm-atlas-yaml-true": { color: "#81c784", fontWeight: "600" },
      ".cm-atlas-yaml-false": { color: "#ff8a80", fontWeight: "600" },
      ".cm-atlas-yaml-unknown": { color: "#ffb74d", fontWeight: "600" },
      ".cm-atlas-sql-keyword": { color: "#ce93d8", fontWeight: "600" },
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
