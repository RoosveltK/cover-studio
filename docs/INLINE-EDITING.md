# Inline editing on the cover — Specification

> Status: levels 1 and 2 implemented, with the single name, feature tags and empty slots
> Complements [SPECS.md](./SPECS.md) §6 and §9

---

## 1. Goal

Edit texts **directly on the preview**, as in Canva: click the name, type, and a floating toolbar
adjusts the size, font and colour of the selected element. The left panel remains the complete,
accessible path; inline editing is an addition, it replaces nothing.

## 2. Scope

### 2.1 Level 1 — text editable in place
- Hovering a text of the main preview: thin outline, text cursor.
- **Click** on an unselected text: it is selected (frame + toolbar).
- **Click on the selected text, double-click, or Enter** from the keyboard: editing starts, caret
  placed at the clicked point (at the end of the text from the keyboard).
- Typing updates the cover and the panel live (same `content.*` field as the form).
- **Enter** or **Escape** commit and leave editing; clicking elsewhere does too. **Escape** outside
  editing deselects (except from a panel field or an open popup).
- Clicking the stage background (outside the cover): deselection.
- Texts covered: badge (`badge`), name (`name`), description, chips (one by one), footer
  (`footer`).
- The matching panel field is highlighted while an element is selected.

### 2.2 Level 2 — contextual toolbar
Shown above the selected element (below it when there is not enough room), inside the window:
- **Size**: − / percentage / +, reset. Writes `style.textScale[element]` (already existing, bounded
  by `SCALE_MIN`–`SCALE_MAX`).
- **Font**: template font (default) or one of the `FONTS`. Writes `style.textFont[element]`.
- **Colour**: picker + suggested colours, reset. Writes `style.textColor[element]`.
- **Edit text**: starts editing (useful from the keyboard and on touch devices).
- **Close**: deselects.
- Clicking the toolbar does not take focus away from a text being edited: the size can be changed
  while typing.

Settings apply to the **element** (all chips together, the whole name), not to a single chip.

### 2.3 Single name with a free accent
- The app name is one field (`content.name`). Any part of it can be highlighted: while editing the
  name, select letters, then **Accent** in the toolbar. **Remove accent** clears it.
- The accent is a character range (`content.accent`). It follows the text: typing inside it grows
  it, typing at its edges stays outside, retyping the whole name drops it. While editing, the
  accent is a span inside the editable text, so its position in the DOM is the range.
- The panel keeps a single "Name" field; its help text points to the preview for the accent.
- The browser's own markup is never trusted: Chrome re-applies the colour of deleted text to
  what is typed next (`<font color>`, styled spans). On every input the editable text is rebuilt
  from the model (text + accent range) when its DOM is not the canonical form, keeping the
  selection, so the preview only ever shows the stored accent.

### 2.4 Badge shape
- When the badge is selected, the toolbar offers its shape: template shape (default), rectangle,
  rounded rectangle, pill, or no shape (no background, border nor horizontal padding). Stored in
  `style.badgeShape` and applied after the template's own badge style; the rounded radius is in
  `em` so it follows the badge size. Templates whose badge has no box (editorial: a line and text)
  only react to "no shape".

### 2.5 Features as tags
- A dashed **+** chip after the features adds one and starts typing it (shared chips block; the
  toolbar's **Add a feature** works in every template).
- The toolbar of a selected chip also has **Remove feature**. A chip emptied on commit is removed.

### 2.6 Empty slots
- In the editor, a text emptied by the user stays on the cover as a greyed slot showing the field
  label (and an empty feature list shows one slot chip), so it can be filled again in place.
- Slots never reach the PNG: the export captures a copy of the cover rendered **without** the
  editing context, mounted only for the export (`exportRender` in the store). The layout of the
  PNG is therefore exactly the cover without the empty elements.

### 2.7 Out of scope (level 3, later)
Moving, resizing with handles, rotation, snapping guides, adding free elements, undo/redo
(`zundo`), deleting a text from the toolbar.

## 3. Editing rules

| Rule | Behaviour |
|---|---|
| Plain text | `contentEditable="plaintext-only"`: no pasted formatting. |
| Single line | Line breaks (typed or pasted) become spaces. |
| Maximum length | The template schema's `maxLength`, enforced while typing. |
| Emptied text | Written as is: the element stays as an empty slot (§2.5); an empty chip is removed on commit. |
| Description | The N-line clamp (`line-clamp`) is lifted while editing in `TextBlock`; templates with their own text layout keep it. |
| Name accent | The custom name colour applies to the name; the accent keeps the template's accent style. |

## 4. Data model

Additions to `CoverConfig["style"]`, persisted like the rest of the style:

```ts
textFont?: Partial<Record<TextElement, string>>   // font id (lib/fonts)
textColor?: Partial<Record<TextElement, string>>  // hex
badgeShape?: "square" | "rounded" | "pill" | "none"
```

Content: `name: string` and `accent?: { start: number; end: number }` replace `nameMain` and
`nameAccent`. Saved state is migrated (persist version 3): the old second part becomes the accent.

UI state in the store, **not persisted**:

```ts
selection: { element: TextElement; path: string } | null   // path: "content.badge", "content.chips.2"…
editing: boolean
exportRender: boolean   // clean copy mounted for the export
```

## 5. Architecture

- **`templates/shared/editable.tsx`**: `EditingContext` and `<EditableText field index? />`.
  Templates stay independent from the store: the context provides the callbacks (`select`,
  `startEditing`, `update`, `commit`) and `maxLength`.
  - Without context (thumbnails, non-main preview): same output as before, plus a styled `<span>`
    only when a custom font or colour exists — it must show in thumbnails and in the export.
  - With context: a clickable `<span data-edit-path>`; while editing, the span is remounted
    (different element) and **not controlled** by React (text set on entry, read on each `input`)
    so the caret is never lost.
- **`TextBlock`, `Chips`, `Footer`** use `EditableText`: 11 templates covered at once; brutal,
  editorial, poster and store are adapted by hand.
- **`components/editor/inline-editing.tsx`** builds the context from the store and computes the
  selection frame (`getBoundingClientRect`, `ResizeObserver`); **`text-toolbar.tsx`** renders the
  toolbar in a fixed-position portal.
- **Export**: the captured node is a clean copy rendered without the editing context, so neither
  the frame, the toolbar, the empty slots nor the **+** chip can reach the PNG.
- Only the main preview (`CanvasStage`) enables editing; `FitPreview` never receives it.

## 6. Accessibility

- Editable texts are focusable (`tabIndex=0`, `role="button"`, `aria-label` = field label); Enter
  starts editing (`role="textbox"`).
- The toolbar is a labelled `role="toolbar"` with named buttons; its texts live in
  `messages/*.json`.
- The panel keeps every feature: inline editing is never the only path.

## 7. Acceptance criteria

1. Clicking then typing on a cover's name changes the name in the preview and in the panel field.
2. Enter commits; Escape deselects; the exported PNG contains neither frame nor toolbar.
3. The toolbar changes the element's size, font and colour; thumbnails and the export reflect them.
4. All templates expose their texts to inline editing (contract test).
5. No hard-coded UI text; `pnpm i18n:check`, `typecheck`, `lint`, unit and E2E tests pass.
