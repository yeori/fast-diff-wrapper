# Fast-diff-wrapper

This is an wrapper implementation of `fast-diff`([https://github.com/jhchen/fast-diff](https://github.com/jhchen/fast-diff)).

It provides additional functionalities

1. Range information - provides range(start, end) information where texts are deleted in the paragraph.

# Sample

## 1. html page

```html
<html>
  <head>
    ...
    <script type="text/javascript" src="/fiast-diff-wrapper.umd.js"></script>
  </head>
  <body>
    ...
  </body>
  <script>
    const cmd = ["-", " ", "+"]; // [delete, unchanged, insert]
    window.onload = () => {
      const diff = window["fast-diff-wrapper"];
      /**
       * PREV     NEXT
       * 0 ab    0 ABcd
       * 1 cd    1 efGH
       * 2 ef    2 XYZ!
       *
       */
      const prev = "abc\ndef\nhi";
      const next = "AbcDef\nXYZ";
      const table = diff.createDiffTable(prev, next);
      table.forEach((pair) => {
        const { prev, next } = pair;
        // 1. prev paragraph
        console.log(
          `PREV "${prev.paraText}" at [${prev.textOffset}, ${prev.length})`
        );
        // 2. ranges in a prev paragraph
        prev.ranges.forEach((range) => {
          const { type, start, end, text, linenum } = range;
          console.log(
            `[${
              cmd[type + 1]
            }] [${start}, ${end}) "${text}" at LINE: ${linenum}`
          );
        });
        // 3. next paragraph
        console.log(
          `NEXT "${next.paraText}" at [${next.textOffset}, ${next.length})`
        );
        // 2. ranges in a next paragraph
        next.ranges.forEach((range) => {
          const { type, start, end, text, linenum } = range;
          console.log(
            `[${
              cmd[type + 1]
            }] [${start}, ${end}) "${text}" at LINE: ${linenum}`
          );
        });
      });
    };
  </script>
</html>
```

```
PREV "ab" at [0, 2)
  [-] [0, 2) "ab" at LINE: 0
NEXT "ABcd" at [0, 4)
  [+] [0, 2) "AB" at LINE: 0
PREV "cd" at [3, 2)
NEXT "ABcd" at [0, 4)
  [+] [0, 2) "AB" at LINE: 0
PREV "ef" at [6, 2)
NEXT "efGH" at [5, 4)
  [+] [2, 4) "GH" at LINE: 1
PREV "ef" at [6, 2)
NEXT "XYZ!" at [10, 4)
  [+] [0, 4) "XYZ!" at LINE: 2
```
