// src/template.mjs
// Maps a palette to a complete VS Code color theme object.
// Single source of truth for role -> VS Code key / TextMate scope mapping.

// Append a 2-digit hex alpha to a #rrggbb color (VS Code accepts #rrggbbaa).
const A = (hex, a) => `${hex}${a}`;

export function buildTheme(p) {
  const c = p.colors;
  const a = p.ansi;
  return {
    name: p.label,
    type: p.type,
    semanticHighlighting: true,
    colors: workbench(c, a),
    tokenColors: tokens(c),
    semanticTokenColors: semantic(c),
  };
}

function workbench(c, a) {
  return {
    // base
    "focusBorder": c.accent,
    "foreground": c.fg,
    "errorForeground": "#ff5c66",
    "descriptionForeground": c.comment,
    "icon.foreground": c.fg,
    // editor
    "editor.background": c.bg,
    "editor.foreground": c.fg,
    "editorCursor.foreground": c.cursor,
    "editor.selectionBackground": c.selection,
    "editor.selectionHighlightBackground": A(c.accent, "22"),
    "editor.wordHighlightBackground": A(c.func, "22"),
    "editor.lineHighlightBackground": c.bgLight,
    "editor.findMatchBackground": A(c.accent, "55"),
    "editor.findMatchHighlightBackground": A(c.accent, "33"),
    "editorLineNumber.foreground": c.comment,
    "editorLineNumber.activeForeground": c.fg,
    "editorIndentGuide.background1": c.bgLight,
    "editorIndentGuide.activeBackground1": c.comment,
    "editorWhitespace.foreground": c.bgLight,
    "editorBracketMatch.background": A(c.accent, "22"),
    "editorBracketMatch.border": c.accent,
    // bracket pair colorization
    "editorBracketHighlight.foreground1": c.keyword,
    "editorBracketHighlight.foreground2": c.func,
    "editorBracketHighlight.foreground3": c.string,
    "editorBracketHighlight.foreground4": c.cls,
    "editorBracketHighlight.foreground5": c.num,
    "editorBracketHighlight.foreground6": c.prop,
    "editorBracketHighlight.unexpectedBracket.foreground": "#ff5c66",
    // gutter + git decorations
    "editorGutter.modifiedBackground": c.func,
    "editorGutter.addedBackground": a.green,
    "editorGutter.deletedBackground": a.red,
    "gitDecoration.modifiedResourceForeground": c.func,
    "gitDecoration.untrackedResourceForeground": a.green,
    "gitDecoration.deletedResourceForeground": a.red,
    "gitDecoration.ignoredResourceForeground": c.comment,
    // diff editor
    "diffEditor.insertedTextBackground": A(a.green, "1a"),
    "diffEditor.removedTextBackground": A(a.red, "1a"),
    // tabs + groups
    "editorGroupHeader.tabsBackground": c.bgDark,
    "editorGroupHeader.noTabsBackground": c.bgDark,
    "tab.activeBackground": c.bg,
    "tab.inactiveBackground": c.bgDark,
    "tab.activeForeground": c.fg,
    "tab.inactiveForeground": c.comment,
    "tab.activeBorderTop": c.accent,
    "tab.border": c.bgDark,
    // title bar
    "titleBar.activeBackground": c.bgDark,
    "titleBar.activeForeground": c.fg,
    "titleBar.inactiveBackground": c.bgDark,
    "titleBar.inactiveForeground": c.comment,
    // activity bar
    "activityBar.background": c.bgDark,
    "activityBar.foreground": c.fg,
    "activityBar.inactiveForeground": c.comment,
    "activityBar.activeBorder": c.accent,
    "activityBarBadge.background": c.accent,
    "activityBarBadge.foreground": c.bg,
    // side bar
    "sideBar.background": c.bgDark,
    "sideBar.foreground": c.fg,
    "sideBarSectionHeader.background": c.bgDark,
    "sideBarTitle.foreground": c.fg,
    // lists
    "list.activeSelectionBackground": c.bgLight,
    "list.activeSelectionForeground": c.fg,
    "list.inactiveSelectionBackground": c.bgLight,
    "list.hoverBackground": A(c.bgLight, "aa"),
    "list.highlightForeground": c.accent,
    // status bar (signature: dark surface + accent top border)
    "statusBar.background": c.bgDark,
    "statusBar.foreground": c.comment,
    "statusBar.border": c.accent,
    "statusBar.noFolderBackground": c.bgDark,
    "statusBar.debuggingBackground": c.accent,
    "statusBar.debuggingForeground": c.bg,
    "statusBarItem.remoteBackground": c.accent,
    "statusBarItem.remoteForeground": c.bg,
    // inputs + dropdowns
    "input.background": c.bgLight,
    "input.foreground": c.fg,
    "input.border": c.bgLight,
    "input.placeholderForeground": c.comment,
    "inputOption.activeBorder": c.accent,
    "dropdown.background": c.bgLight,
    "dropdown.foreground": c.fg,
    // widgets
    "editorWidget.background": c.bgLight,
    "editorWidget.foreground": c.fg,
    "editorSuggestWidget.background": c.bgLight,
    "editorSuggestWidget.selectedBackground": c.bg,
    "editorSuggestWidget.highlightForeground": c.accent,
    "editorHoverWidget.background": c.bgLight,
    // peek view
    "peekView.border": c.accent,
    "peekViewEditor.background": c.bgDark,
    "peekViewResult.background": c.bgDark,
    "peekViewResult.selectionBackground": c.bgLight,
    "peekViewTitle.background": c.bgDark,
    "peekViewEditor.matchHighlightBackground": A(c.accent, "44"),
    // notifications + quick input / command palette
    "notifications.background": c.bgLight,
    "notificationCenterHeader.background": c.bgDark,
    "quickInput.background": c.bgDark,
    "quickInputList.focusBackground": c.bgLight,
    "pickerGroup.foreground": c.accent,
    "pickerGroup.border": c.bgLight,
    // scrollbar + badges + progress
    "scrollbarSlider.background": A(c.comment, "44"),
    "scrollbarSlider.hoverBackground": A(c.comment, "66"),
    "scrollbarSlider.activeBackground": A(c.comment, "88"),
    "badge.background": c.accent,
    "badge.foreground": c.bg,
    "progressBar.background": c.accent,
    // links
    "textLink.foreground": c.accent,
    "textLink.activeForeground": c.func,
    "textPreformat.foreground": c.string,
    // panel + terminal
    "panel.background": c.bgDark,
    "panel.border": c.bgLight,
    "panelTitle.activeForeground": c.fg,
    "panelTitle.activeBorder": c.accent,
    "terminal.background": c.bg,
    "terminal.foreground": c.fg,
    "terminalCursor.foreground": c.cursor,
    "terminal.ansiBlack": c.bgLight,
    "terminal.ansiBrightBlack": c.comment,
    "terminal.ansiRed": a.red,
    "terminal.ansiBrightRed": a.red,
    "terminal.ansiGreen": a.green,
    "terminal.ansiBrightGreen": a.green,
    "terminal.ansiYellow": a.yellow,
    "terminal.ansiBrightYellow": a.yellow,
    "terminal.ansiBlue": a.blue,
    "terminal.ansiBrightBlue": a.blue,
    "terminal.ansiMagenta": a.magenta,
    "terminal.ansiBrightMagenta": a.magenta,
    "terminal.ansiCyan": a.cyan,
    "terminal.ansiBrightCyan": a.cyan,
    "terminal.ansiWhite": c.fg,
    "terminal.ansiBrightWhite": "#ffffff",
    // breadcrumbs
    "breadcrumb.foreground": c.comment,
    "breadcrumb.focusForeground": c.fg,
    "breadcrumbPicker.background": c.bgDark,
  };
}

function tokens(c) {
  return [
    { name: "Comment", scope: ["comment", "punctuation.definition.comment"], settings: { foreground: c.comment, fontStyle: "italic" } },
    { name: "Keyword", scope: ["keyword", "keyword.control", "storage", "storage.type", "storage.modifier"], settings: { foreground: c.keyword } },
    { name: "Operator", scope: ["keyword.operator"], settings: { foreground: c.fg } },
    { name: "String", scope: ["string", "string.quoted", "string.template", "punctuation.definition.string"], settings: { foreground: c.string } },
    { name: "Function", scope: ["entity.name.function", "support.function", "meta.function-call", "entity.other.attribute-name"], settings: { foreground: c.func } },
    { name: "Class/Type", scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.name.tag"], settings: { foreground: c.cls } },
    { name: "This/Property", scope: ["variable.language.this", "variable.other.property", "support.variable.property", "meta.object-literal.key", "support.type.property-name"], settings: { foreground: c.prop } },
    { name: "Number/Constant", scope: ["constant.numeric", "constant.language", "constant.other"], settings: { foreground: c.num } },
    { name: "Variable", scope: ["variable", "variable.other.readwrite", "variable.parameter"], settings: { foreground: c.fg } },
    { name: "Markup heading", scope: ["markup.heading", "entity.name.section"], settings: { foreground: c.keyword, fontStyle: "bold" } },
    { name: "Markup bold", scope: ["markup.bold"], settings: { fontStyle: "bold" } },
    { name: "Markup italic", scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    { name: "Markup inline code", scope: ["markup.inline.raw", "markup.fenced_code"], settings: { foreground: c.string } },
    { name: "Markup link", scope: ["markup.underline.link", "string.other.link"], settings: { foreground: c.accent } },
    { name: "Invalid", scope: ["invalid", "invalid.illegal"], settings: { foreground: "#ff5c66" } },
  ];
}

function semantic(c) {
  return {
    namespace: c.cls,
    class: c.cls,
    type: c.cls,
    struct: c.cls,
    enum: c.cls,
    interface: c.cls,
    function: c.func,
    method: c.func,
    macro: c.func,
    variable: c.fg,
    parameter: c.fg,
    property: c.prop,
    enumMember: c.num,
    keyword: c.keyword,
    string: c.string,
    number: c.num,
    comment: { foreground: c.comment, fontStyle: "italic" },
  };
}
