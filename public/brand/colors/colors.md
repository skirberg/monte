# Monte colours

Clay means the number. Ink means the action.

OKLCH is the source. HEX and RGB are sRGB. CMYK (C/M/Y/K) is a naive approximation with no print profile: proof it before printing.

| Name | Role | Light: HEX · RGB · OKLCH · CMYK approx. | Dark: HEX · RGB · OKLCH · CMYK approx. |
|---|---|---|---|
| Clay | The number: curves, bars, answers, the mark. | #cd5811 · 205, 88, 17 · oklch(0.6 0.165 45) · 0/57/92/20 | #ef8448 · 239, 132, 72 · oklch(0.72 0.15 48) · 0/45/70/6 |
| Clay ink | Clay as small text, and a right answer. | #a63d02 · 166, 61, 2 · oklch(0.5 0.15 42) · 0/63/99/35 | #fa9d68 · 250, 157, 104 · oklch(0.78 0.13 50) · 0/37/58/2 |
| Ink | Words and the action: every main button. | #1b1511 · 27, 21, 17 · oklch(0.2 0.012 50) · 0/22/37/89 | #f2eee7 · 242, 238, 231 · oklch(0.95 0.01 75) · 0/2/5/5 |
| Paper | The page. | #faf6f1 · 250, 246, 241 · oklch(0.975 0.008 75) · 0/2/4/2 | #130e0c · 19, 14, 12 · oklch(0.17 0.01 50) · 0/26/37/93 |
| Sand | Quiet surfaces and stages. | #f3ece1 · 243, 236, 225 · oklch(0.945 0.016 75) · 0/3/7/5 | #1e1815 · 30, 24, 21 · oklch(0.215 0.012 50) · 0/20/30/88 |
| Sand 2 | A step deeper than sand: pressed and hovered surfaces. | #ece1d5 · 236, 225, 213 · oklch(0.915 0.02 72) · 0/5/10/7 | #29211d · 41, 33, 29 · oklch(0.255 0.014 50) · 0/20/29/84 |
| Ink muted | Secondary text. | #625952 · 98, 89, 82 · oklch(0.47 0.016 55) · 0/9/16/62 | #beb6ad · 190, 182, 173 · oklch(0.78 0.015 70) · 0/4/9/25 |
| Line | Hairlines and borders. | #dbd3c9 · 219, 211, 201 · oklch(0.87 0.016 70) · 0/4/8/14 | #38312d · 56, 49, 45 · oklch(0.32 0.012 55) · 0/13/20/78 |
| Line strong | Control borders, the pegs on the board. | #90847a · 144, 132, 122 · oklch(0.62 0.02 60) · 0/8/15/44 | #6a615b · 106, 97, 91 · oklch(0.5 0.015 60) · 0/8/14/58 |
| Clay tint | The clay highlight behind a chosen answer. | #fbe5d6 · 251, 229, 214 · oklch(0.935 0.032 55) · 0/9/15/2 | #402315 · 64, 35, 21 · oklch(0.29 0.05 45) · 0/45/67/75 |
| Danger | A wrong answer. Never a joke. | #b7162d · 183, 22, 45 · oklch(0.5 0.19 22) · 0/88/75/28 | #ff9492 · 255, 148, 146 · oklch(0.78 0.13 22) · 0/42/43/0 |

## Contrast (WCAG 2)

| Pair | Use | Needs | Light | Dark |
|---|---|---|---|---|
| ink on paper | body text | 4.5 | 16.87 | 16.53 |
| ink on sand | text on sand panels | 4.5 | 15.42 | 15.16 |
| ink-muted on paper | secondary text | 4.5 | 6.38 | 9.55 |
| ink-muted on sand | secondary text on sand | 4.5 | 5.83 | 8.75 |
| ink-muted on sand-2 | secondary text on sand-2 | 4.5 | 5.32 | 7.89 |
| paper on btn | primary button | 4.5 | 13.17 | 16.53 |
| clay-ink on paper | clay as small text and links | 4.5 | 5.96 | 9.20 |
| clay-ink on sand | clay text on sand | 4.5 | 5.45 | 8.44 |
| clay on paper | clay marks and large text | 3 | 3.92 | 7.34 |
| clay on sand | clay marks on sand | 3 | 3.59 | 6.73 |
| ink on clay-tint | text on the clay highlight | 4.5 | 14.89 | 12.38 |
| danger on paper | error text | 4.5 | 6.17 | 9.04 |
| success on paper | right-answer text | 4.5 | 5.96 | 9.20 |
| line-strong on paper | input and control borders | 3 | 3.40 | 3.18 |
