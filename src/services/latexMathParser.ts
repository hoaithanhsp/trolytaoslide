/**
 * LaTeX Math Parser — converts LaTeX strings to docx Math components
 * Supports common math constructs used in Vietnamese education:
 * - Fractions: \frac{a}{b}
 * - Superscripts: x^{2} or x^2
 * - Subscripts: x_{i} or x_i
 * - Square roots: \sqrt{x}, \sqrt[3]{x}
 * - Greek letters: \alpha, \beta, \pi, \theta, etc.
 * - Operators: \pm, \times, \div, \cdot, \leq, \geq, \neq, \approx
 * - Special: \infty, \sum, \int, \lim
 * - Brackets: \left( ... \right), \left[ ... \right]
 * - Text in math: \text{...}
 */

import {
  Math as DocxMath,
  MathRun,
  MathFraction,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  MathRadical,
  MathSum,
  MathIntegral,
  MathRoundBrackets,
  MathSquareBrackets,
  MathCurlyBrackets,
  MathFunction,
} from 'docx';

// Re-export Math type for use in docxGenerator
export type MathComponent = InstanceType<typeof MathRun> | InstanceType<typeof MathFraction> |
  InstanceType<typeof MathSuperScript> | InstanceType<typeof MathSubScript> |
  InstanceType<typeof MathSubSuperScript> | InstanceType<typeof MathRadical> |
  InstanceType<typeof MathSum> | InstanceType<typeof MathIntegral> |
  InstanceType<typeof MathRoundBrackets> | InstanceType<typeof MathSquareBrackets> |
  InstanceType<typeof MathCurlyBrackets> | InstanceType<typeof MathFunction>;

/**
 * Map of LaTeX symbol commands to their Unicode equivalents
 */
const SYMBOL_MAP: Record<string, string> = {
  // Greek letters
  'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
  'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ',
  'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ',
  'nu': 'ν', 'xi': 'ξ', 'pi': 'π', 'rho': 'ρ',
  'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ', 'phi': 'φ',
  'chi': 'χ', 'psi': 'ψ', 'omega': 'ω',
  'Alpha': 'Α', 'Beta': 'Β', 'Gamma': 'Γ', 'Delta': 'Δ',
  'Epsilon': 'Ε', 'Zeta': 'Ζ', 'Eta': 'Η', 'Theta': 'Θ',
  'Iota': 'Ι', 'Kappa': 'Κ', 'Lambda': 'Λ', 'Mu': 'Μ',
  'Nu': 'Ν', 'Xi': 'Ξ', 'Pi': 'Π', 'Rho': 'Ρ',
  'Sigma': 'Σ', 'Tau': 'Τ', 'Upsilon': 'Υ', 'Phi': 'Φ',
  'Chi': 'Χ', 'Psi': 'Ψ', 'Omega': 'Ω',

  // Operators
  'pm': '±', 'mp': '∓', 'times': '×', 'div': '÷',
  'cdot': '·', 'ast': '∗', 'star': '⋆',
  'leq': '≤', 'le': '≤', 'geq': '≥', 'ge': '≥',
  'neq': '≠', 'ne': '≠', 'approx': '≈', 'equiv': '≡',
  'sim': '∼', 'simeq': '≃', 'cong': '≅',
  'll': '≪', 'gg': '≫',
  'subset': '⊂', 'supset': '⊃', 'subseteq': '⊆', 'supseteq': '⊇',
  'in': '∈', 'notin': '∉', 'ni': '∋', 'mid': '|',
  'vert': '|', 'lvert': '|', 'rvert': '|',
  'Vert': '∥', 'lVert': '∥', 'rVert': '∥',
  'cap': '∩', 'cup': '∪', 'setminus': '∖',
  'emptyset': '∅', 'varnothing': '∅',

  // Arrows
  'to': '→', 'rightarrow': '→', 'leftarrow': '←',
  'Rightarrow': '⇒', 'Leftarrow': '⇐',
  'leftrightarrow': '↔', 'Leftrightarrow': '⇔',
  'mapsto': '↦', 'uparrow': '↑', 'downarrow': '↓',

  // Misc
  'infty': '∞', 'partial': '∂', 'nabla': '∇',
  'forall': '∀', 'exists': '∃',
  'angle': '∠', 'triangle': '△', 'perp': '⊥', 'parallel': '∥',
  'therefore': '∴', 'because': '∵',
  'prime': '′', 'circ': '∘', 'colon': ':',
  'ldots': '…', 'cdots': '⋯', 'vdots': '⋮', 'ddots': '⋱',
  'quad': '  ', 'qquad': '    ',

  // Spacing
  ',': ' ', ';': '  ', '!': '', ' ': ' ',
};

/**
 * Extract a brace-delimited group {…} from the LaTeX string starting at pos.
 * Returns the content inside braces and the new position after '}'.
 */
function extractGroup(latex: string, pos: number): { content: string; newPos: number } {
  if (pos >= latex.length || latex[pos] !== '{') {
    // No group, take one character
    if (pos < latex.length) {
      return { content: latex[pos], newPos: pos + 1 };
    }
    return { content: '', newPos: pos };
  }

  let depth = 0;
  let start = pos + 1;
  let i = pos;

  while (i < latex.length) {
    if (latex[i] === '{') depth++;
    else if (latex[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: latex.substring(start, i), newPos: i + 1 };
      }
    }
    i++;
  }

  // Unmatched brace, return rest of string
  return { content: latex.substring(start), newPos: latex.length };
}

/**
 * Extract an optional bracket-delimited group [...] from the LaTeX string.
 */
function extractOptionalGroup(latex: string, pos: number): { content: string | null; newPos: number } {
  if (pos >= latex.length || latex[pos] !== '[') {
    return { content: null, newPos: pos };
  }

  let depth = 0;
  let start = pos + 1;
  let i = pos;

  while (i < latex.length) {
    if (latex[i] === '[') depth++;
    else if (latex[i] === ']') {
      depth--;
      if (depth === 0) {
        return { content: latex.substring(start, i), newPos: i + 1 };
      }
    }
    i++;
  }

  return { content: null, newPos: pos };
}

/**
 * Skip whitespace
 */
function skipSpaces(latex: string, pos: number): number {
  while (pos < latex.length && latex[pos] === ' ') pos++;
  return pos;
}

function extractDelimiter(latex: string, pos: number): { delimiter: string; newPos: number } {
  pos = skipSpaces(latex, pos);
  if (pos >= latex.length) return { delimiter: '', newPos: pos };

  if (latex[pos] !== '\\') {
    return { delimiter: latex[pos], newPos: pos + 1 };
  }

  pos++;
  let command = '';
  if (/[a-zA-Z]/.test(latex[pos] || '')) {
    while (pos < latex.length && /[a-zA-Z]/.test(latex[pos])) {
      command += latex[pos++];
    }
  } else if (pos < latex.length) {
    command = latex[pos++];
  }

  const delimiters: Record<string, string> = {
    '{': '{', '}': '}', '|': '|',
    vert: '|', lvert: '|', rvert: '|',
    Vert: '∥', lVert: '∥', rVert: '∥',
  };
  return { delimiter: delimiters[command] || command, newPos: pos };
}

/**
 * Parse LaTeX string into an array of docx MathComponents.
 * This is a recursive parser that handles nested constructs.
 */
export function parseLatexToMathComponents(latex: string): MathComponent[] {
  const components: MathComponent[] = [];
  let pos = 0;
  let textBuffer = '';

  function flushText() {
    if (textBuffer) {
      components.push(new MathRun(textBuffer));
      textBuffer = '';
    }
  }

  while (pos < latex.length) {
    const ch = latex[pos];

    // Handle backslash commands
    if (ch === '\\') {
      pos++;
      if (pos >= latex.length) break;

      // Extract command name
      let cmd = '';
      if (/[a-zA-Z]/.test(latex[pos])) {
        while (pos < latex.length && /[a-zA-Z]/.test(latex[pos])) {
          cmd += latex[pos];
          pos++;
        }
      } else {
        // Single character command like \, \; \! \{ \}
        cmd = latex[pos];
        pos++;
      }

      // Process command
      switch (cmd) {
        case 'frac': case 'dfrac': case 'tfrac': {
          flushText();
          pos = skipSpaces(latex, pos);
          const num = extractGroup(latex, pos);
          pos = skipSpaces(latex, num.newPos);
          const den = extractGroup(latex, pos);
          pos = den.newPos;
          components.push(new MathFraction({
            numerator: parseLatexToMathComponents(num.content),
            denominator: parseLatexToMathComponents(den.content),
          }));
          break;
        }

        case 'sqrt': {
          flushText();
          pos = skipSpaces(latex, pos);
          const degree = extractOptionalGroup(latex, pos);
          pos = skipSpaces(latex, degree.newPos);
          const radicand = extractGroup(latex, pos);
          pos = radicand.newPos;
          if (degree.content) {
            components.push(new MathRadical({
              children: parseLatexToMathComponents(radicand.content),
              degree: parseLatexToMathComponents(degree.content),
            }));
          } else {
            components.push(new MathRadical({
              children: parseLatexToMathComponents(radicand.content),
            }));
          }
          break;
        }

        case 'sum': {
          flushText();
          // Check for _ and ^ after \sum
          const sumResult = parseLimits(latex, pos);
          pos = sumResult.newPos;
          components.push(new MathSum({
            children: sumResult.body.length > 0 ? sumResult.body : [new MathRun('')],
            ...(sumResult.sub ? { subScript: sumResult.sub } : {}),
            ...(sumResult.sup ? { superScript: sumResult.sup } : {}),
          }));
          break;
        }

        case 'int': {
          flushText();
          const intResult = parseLimits(latex, pos);
          pos = intResult.newPos;
          components.push(new MathIntegral({
            children: intResult.body.length > 0 ? intResult.body : [new MathRun('')],
            ...(intResult.sub ? { subScript: intResult.sub } : {}),
            ...(intResult.sup ? { superScript: intResult.sup } : {}),
          }));
          break;
        }

        case 'lim': {
          flushText();
          // \lim is rendered as a function with "lim" name
          const limResult = parseLimits(latex, pos);
          pos = limResult.newPos;
          
          const limName: MathComponent[] = [new MathRun('lim')];
          if (limResult.sub) {
            components.push(new MathFunction({
              name: [new MathSubScript({
                children: limName,
                subScript: limResult.sub,
              })],
              children: limResult.body.length > 0 ? limResult.body : [new MathRun('')],
            }));
          } else {
            components.push(new MathFunction({
              name: limName,
              children: limResult.body.length > 0 ? limResult.body : [new MathRun('')],
            }));
          }
          break;
        }

        case 'sin': case 'cos': case 'tan': case 'cot':
        case 'sec': case 'csc': case 'log': case 'ln':
        case 'exp': case 'min': case 'max': {
          flushText();
          components.push(new MathRun(cmd));
          break;
        }

        case 'text': {
          flushText();
          pos = skipSpaces(latex, pos);
          const textContent = extractGroup(latex, pos);
          pos = textContent.newPos;
          components.push(new MathRun(textContent.content));
          break;
        }

        case 'mathrm': case 'mathbf': case 'mathit': case 'mathsf':
        case 'mathtt': case 'operatorname': case 'textbf': case 'textit': {
          flushText();
          pos = skipSpaces(latex, pos);
          const styledContent = extractGroup(latex, pos);
          pos = styledContent.newPos;
          components.push(...parseLatexToMathComponents(styledContent.content));
          break;
        }

        case 'mathbb': case 'mathcal': {
          flushText();
          pos = skipSpaces(latex, pos);
          const alphabetContent = extractGroup(latex, pos);
          pos = alphabetContent.newPos;
          const doubleStruck: Record<string, string> = {
            N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ', H: 'ℍ', P: 'ℙ',
          };
          components.push(new MathRun(
            cmd === 'mathbb'
              ? (doubleStruck[alphabetContent.content] || alphabetContent.content)
              : alphabetContent.content
          ));
          break;
        }

        // Style-only commands do not need a visible token in Word Equation.
        case 'displaystyle': case 'textstyle': case 'scriptstyle': case 'scriptscriptstyle': {
          break;
        }

        case 'vec': case 'overrightarrow': case 'hat': case 'bar': case 'overline': {
          flushText();
          pos = skipSpaces(latex, pos);
          const accentContent = extractGroup(latex, pos);
          pos = accentContent.newPos;
          const accent = cmd === 'hat' ? '\u0302' : cmd === 'bar' || cmd === 'overline' ? '\u0305' : '\u20D7';
          const accentedText = Array.from(accentContent.content)
            .map(character => `${character}${accent}`)
            .join('');
          components.push(new MathRun(accentedText));
          break;
        }

        case 'left': {
          flushText();
          const leftDelimiter = extractDelimiter(latex, pos);
          const leftBracket = leftDelimiter.delimiter || '(';
          pos = leftDelimiter.newPos;
          
          // Find matching \right
          let depth = 1;
          let innerStart = pos;
          while (pos < latex.length && depth > 0) {
            if (latex.substring(pos, pos + 5) === '\\left') {
              depth++;
              pos += 5;
            } else if (latex.substring(pos, pos + 6) === '\\right') {
              depth--;
              if (depth === 0) {
                const innerContent = latex.substring(innerStart, pos);
                pos += 6; // skip \right
                const rightDelimiter = extractDelimiter(latex, pos);
                const rightBracket = rightDelimiter.delimiter;
                pos = rightDelimiter.newPos;
                
                const innerComponents = parseLatexToMathComponents(innerContent);
                
                if (
                  leftBracket === '|' || leftBracket === '∥' || leftBracket === '.' ||
                  rightBracket === '|' || rightBracket === '∥' || rightBracket === '.'
                ) {
                  if (leftBracket !== '.') components.push(new MathRun(leftBracket));
                  components.push(...innerComponents);
                  if (rightBracket && rightBracket !== '.') components.push(new MathRun(rightBracket));
                } else if (leftBracket === '(') {
                  components.push(new MathRoundBrackets({ children: innerComponents }));
                } else if (leftBracket === '[') {
                  components.push(new MathSquareBrackets({ children: innerComponents }));
                } else if (leftBracket === '{') {
                  components.push(new MathCurlyBrackets({ children: innerComponents }));
                } else {
                  components.push(new MathRoundBrackets({ children: innerComponents }));
                }
                break;
              }
            } else {
              pos++;
            }
          }
          break;
        }

        // Escaped braces
        case '{': { textBuffer += '{'; break; }
        case '}': { textBuffer += '}'; break; }

        default: {
          // Check symbol map
          if (SYMBOL_MAP[cmd] !== undefined) {
            flushText();
            components.push(new MathRun(SYMBOL_MAP[cmd]));
          } else {
            // Unknown command — render as text
            flushText();
            components.push(new MathRun('\\' + cmd));
          }
          break;
        }
      }
      continue;
    }

    // Superscript
    if (ch === '^') {
      flushText();
      pos++;
      pos = skipSpaces(latex, pos);
      const sup = extractGroup(latex, pos);
      pos = sup.newPos;

      // Check if also has subscript immediately after
      pos = skipSpaces(latex, pos);
      if (pos < latex.length && latex[pos] === '_') {
        pos++;
        pos = skipSpaces(latex, pos);
        const sub = extractGroup(latex, pos);
        pos = sub.newPos;
        
        const base = components.pop();
        const baseChildren = base ? [base] : [new MathRun('')];
        components.push(new MathSubSuperScript({
          children: baseChildren,
          superScript: parseLatexToMathComponents(sup.content),
          subScript: parseLatexToMathComponents(sub.content),
        }));
      } else {
        const base = components.pop();
        const baseChildren = base ? [base] : [new MathRun('')];
        components.push(new MathSuperScript({
          children: baseChildren,
          superScript: parseLatexToMathComponents(sup.content),
        }));
      }
      continue;
    }

    // Subscript
    if (ch === '_') {
      flushText();
      pos++;
      pos = skipSpaces(latex, pos);
      const sub = extractGroup(latex, pos);
      pos = sub.newPos;

      // Check if also has superscript immediately after
      pos = skipSpaces(latex, pos);
      if (pos < latex.length && latex[pos] === '^') {
        pos++;
        pos = skipSpaces(latex, pos);
        const sup = extractGroup(latex, pos);
        pos = sup.newPos;
        
        const base = components.pop();
        const baseChildren = base ? [base] : [new MathRun('')];
        components.push(new MathSubSuperScript({
          children: baseChildren,
          superScript: parseLatexToMathComponents(sup.content),
          subScript: parseLatexToMathComponents(sub.content),
        }));
      } else {
        const base = components.pop();
        const baseChildren = base ? [base] : [new MathRun('')];
        components.push(new MathSubScript({
          children: baseChildren,
          subScript: parseLatexToMathComponents(sub.content),
        }));
      }
      continue;
    }

    // Group in braces — parse recursively
    if (ch === '{') {
      flushText();
      const grp = extractGroup(latex, pos);
      pos = grp.newPos;
      const inner = parseLatexToMathComponents(grp.content);
      components.push(...inner);
      continue;
    }

    // Regular character — accumulate
    textBuffer += ch;
    pos++;
  }

  flushText();
  return components;
}

/**
 * Helper to parse optional sub/superscript limits after \sum, \int, etc.
 */
function parseLimits(latex: string, pos: number): {
  sub: MathComponent[] | null;
  sup: MathComponent[] | null;
  body: MathComponent[];
  newPos: number;
} {
  let sub: MathComponent[] | null = null;
  let sup: MathComponent[] | null = null;

  pos = skipSpaces(latex, pos);

  // Parse _ and ^ in any order
  for (let i = 0; i < 2; i++) {
    pos = skipSpaces(latex, pos);
    if (pos < latex.length && latex[pos] === '_') {
      pos++;
      pos = skipSpaces(latex, pos);
      const g = extractGroup(latex, pos);
      pos = g.newPos;
      sub = parseLatexToMathComponents(g.content);
    } else if (pos < latex.length && latex[pos] === '^') {
      pos++;
      pos = skipSpaces(latex, pos);
      const g = extractGroup(latex, pos);
      pos = g.newPos;
      sup = parseLatexToMathComponents(g.content);
    }
  }

  return { sub, sup, body: [], newPos: pos };
}

/**
 * Create a docx Math paragraph element from a LaTeX string.
 */
export function createMathFromLatex(latex: string): InstanceType<typeof DocxMath> {
  const normalized = latex
    .replace(/\\begin\{array\}(?:\{[^{}]*\})?/g, '')
    .replace(/\\end\{array\}/g, '')
    .replace(/\\begin\{(?:aligned|align|cases|matrix|pmatrix|bmatrix)\}/g, '')
    .replace(/\\end\{(?:aligned|align|cases|matrix|pmatrix|bmatrix)\}/g, '')
    .replace(/\\\\/g, '; ')
    .replace(/&/g, ' ')
    .trim();
  const components = parseLatexToMathComponents(normalized);
  return new DocxMath({
    children: components.length > 0 ? components : [new MathRun('')],
  });
}
