# fast-diff-wrapper

[![NPM version](https://img.shields.io/npm/v/fast-diff-wrapper.svg)](https://www.npmjs.com/package/fast-diff-wrapper)
[![CircleCI](https://circleci.com/gh/yeori/fast-diff-wrapper.svg?style=svg)](https://circleci.com/gh/yeori/fast-diff-wrapper)

This library is a wrapper around `fast-diff`, providing higher-level abstractions for comparing text and managing changes. It allows you to analyze differences between two texts on a line-by-line or paragraph-by-paragraph basis and provides tools to manage these changes as a sequence of patches.

## Features

- **Text Diffing**: Compares two strings and provides a structured view of the differences.
- **Paragraph-level Analysis**: Processes diffs based on paragraphs or lines, making it easier to work with structured text.
- **Patch Management**: Represents changes as patches, which can be stored and applied.
- **History Traversal**: Provides a cursor to navigate through a history of patches, enabling undo/redo functionality.
- **Event-driven**: Emits events when patches or patch tables are created or modified.

## Installation

```bash
npm install fast-diff-wrapper
```

## Usage

### 1. Comparing Two Texts

The `createDiffTable` function is the primary way to compare two texts. It returns a `DiffTable` that contains the line-by-line differences.

```typescript
import { createDiffTable } from 'fast-diff-wrapper';

const prevText = "Hello world
This is the original text.";
const nextText = "Hello there
This is the updated text.";

const table = createDiffTable(prevText, nextText);

table.eachLine(({ prev, next }) => {
  if (prev && prev.updated) {
    console.log(`Line ${prev.linenum} was changed:`);
    console.log(`- ${prev.paraText}`);
    prev.ranges.forEach(range => {
      console.log(`  - Deleted: "${range.text}"`);
    });
  }
  if (next && next.updated) {
    console.log(`+ ${next.paraText}`);
    next.ranges.forEach(range => {
      console.log(`  + Inserted: "${range.text}"`);
    });
  }
});
```

## API Reference

### Core Functions

- `createDiffTable(prev: string, next: string, lineDelimeter: string = '
'): DiffTable` \* Creates a table that represents the differences between two texts.

### Main Classes

- **`DiffTable`**: Represents the comparison between two texts.

  - `.build(prevText: string, nextText: string)`: Constructs the diff table.
  - `.eachLine(consumer: (pair: ParaPair) => void)`: Iterates over each line/paragraph pair.
  - `.getPairs(option: { skipSamePara: boolean })`: Returns an array of paragraph pairs.

- **`IParagraph`**: Represents a line or paragraph in the text.

  - `.linenum`: The line number.
  - `.paraText`: The text content of the paragraph.
  - `.ranges`: An array of `IRange` objects indicating insertions or deletions within the paragraph.
  - `.updated`: A boolean indicating if the paragraph has changes.

- **`PatchFactory`**: The entry point for creating and managing patch tables.

  - `.createForwardTable(option?: PatchTableOption): IPatchTable`
  - `.createBackwardTable(option?: PatchTableOption): IPatchTable`
  - `.addPatchListener(listener: PatchListener)`

- **`IPatchTable`**: A container for a sequence of patches.

  - `.createPatch(text: string): IPatch`: Creates a new patch by comparing the given text with the latest text in the table.
  - `.getCursor(): ICursor`: Returns a cursor to navigate the patch history.

- **`ICursor`**: A navigator for traversing patch history.
  - `.currentText`: The text at the current cursor position.
  - `.next(): string`: Applies the next patch and returns the new text.
  - `.prev(): string`: Reverts the previous patch and returns the prior text.
  - `.hasNext(): boolean`
  - `.hasPrev(): boolean`
