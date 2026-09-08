import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  ITableCellBorders,
  TableLayoutType,
  VerticalAlign,
  ShadingType,
  Math as DocxMath,
} from 'docx';
import fileSaver from 'file-saver';
import { createMathFromLatex } from './latexMathParser';

// file-saver is CommonJS. Using its named export works after Vite transforms it
// but breaks direct Node-based QA; normalize both shapes here.
const saveAs: typeof fileSaver = (fileSaver as any).saveAs || fileSaver;

const FONT = 'Times New Roman';
const BODY_SIZE = 26; // 13pt in half-points
const H1_SIZE = 28;   // 14pt
const H2_SIZE = 26;   // 13pt bold
const H3_SIZE = 26;   // 13pt bold
const H4_SIZE = 26;   // 13pt bold italic
const TABLE_INDENT_DXA = 120;
const TABLE_WIDTH_DXA = 8952; // 9072 usable DXA minus the 120-DXA table indent

/** Math rendering mode: 'omml' = Word equation objects, 'latex' = raw LaTeX text */
export type MathMode = 'omml' | 'latex';
let currentMathMode: MathMode = 'omml';

const TABLE_BORDERS: ITableCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
};

/**
 * Pre-process: normalize various LaTeX delimiters to standard $...$ and $$...$$
 */
function normalizeMathDelimiters(text: string): string {
  return text
    // \(...\) → $...$  (inline)
    .replace(/\\\\\((.+?)\\\\\)/g, (_, m) => `$${m}$`)
    .replace(/\\\((.+?)\\\)/g, (_, m) => `$${m}$`)
    // \[...\] → $$...$$ (display) 
    .replace(/\\\\\[(.+?)\\\\\]/g, (_, m) => `$$${m}$$`)
    .replace(/\\\[(.+?)\\\]/g, (_, m) => `$$${m}$$`);
}

/**
 * Tokenize math before parsing markdown. This preserves constructs such as
 * **Định lý $f'(x)>0$** and also turns $$...$$ inside table cells into OMML.
 */
function parseInlineFormattingWithMath(
  text: string,
  baseSize: number = BODY_SIZE,
  forceBold: boolean = false,
  forceItalics: boolean = false
): (TextRun | InstanceType<typeof DocxMath>)[] {
  const normalized = normalizeMathDelimiters(text);
  const mathChildren: (TextRun | InstanceType<typeof DocxMath>)[] = [];
  let tokenized = '';
  let cursor = 0;

  while (cursor < normalized.length) {
    if (normalized[cursor] !== '$' || normalized[cursor - 1] === '\\') {
      tokenized += normalized[cursor];
      cursor++;
      continue;
    }

    const delimiter = normalized[cursor + 1] === '$' ? '$$' : '$';
    const start = cursor + delimiter.length;
    let end = start;
    let found = false;

    while (end < normalized.length) {
      if (
        normalized.startsWith(delimiter, end) &&
        normalized[end - 1] !== '\\' &&
        (delimiter === '$$' || normalized[end + 1] !== '$')
      ) {
        found = true;
        break;
      }
      end++;
    }

    if (!found) {
      tokenized += delimiter;
      cursor += delimiter.length;
      continue;
    }

    const mathContent = normalized.slice(start, end).trim();
    if (!mathContent) {
      tokenized += delimiter + delimiter;
      cursor = end + delimiter.length;
      continue;
    }

    let mathChild: TextRun | InstanceType<typeof DocxMath>;
    if (currentMathMode === 'omml') {
      try {
        mathChild = createMathFromLatex(mathContent);
      } catch {
        mathChild = new TextRun({ text: mathContent, font: 'Cambria Math', size: baseSize, italics: true });
      }
    } else {
      mathChild = new TextRun({
        text: `${delimiter}${mathContent}${delimiter}`,
        font: 'Cambria Math',
        size: baseSize,
        italics: true,
      });
    }

    const marker = `\uE000${mathChildren.length}\uE001`;
    mathChildren.push(mathChild);
    tokenized += marker;
    cursor = end + delimiter.length;
  }

  const result: (TextRun | InstanceType<typeof DocxMath>)[] = [];

  const pushStyledSegment = (segment: string, bold: boolean, italics: boolean) => {
    const parts = segment.split(/(\uE000\d+\uE001)/g).filter(Boolean);
    for (const part of parts) {
      const tokenMatch = part.match(/^\uE000(\d+)\uE001$/);
      if (tokenMatch) {
        result.push(mathChildren[Number(tokenMatch[1])]);
      } else {
        result.push(new TextRun({
          text: part,
          bold: bold || forceBold,
          italics: italics || forceItalics,
          font: FONT,
          size: baseSize,
        }));
      }
    }
  };

  // Match ***bold italic***, **bold**, *italic*, plain text, or a lone *.
  const markdownRegex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)|(\*))/g;
  let match: RegExpExecArray | null;
  while ((match = markdownRegex.exec(tokenized)) !== null) {
    if (match[2] !== undefined) pushStyledSegment(match[2], true, true);
    else if (match[3] !== undefined) pushStyledSegment(match[3], true, false);
    else if (match[4] !== undefined) pushStyledSegment(match[4], false, true);
    else pushStyledSegment(match[5] ?? match[6] ?? '', false, false);
  }

  if (result.length === 0) {
    result.push(new TextRun({ text, font: FONT, size: baseSize, bold: forceBold, italics: forceItalics }));
  }

  return result;
}

/**
 * Strip HTML tags from AI output — converts common HTML to markdown equivalents
 */
function stripHtml(content: string): string {
  return content
    // Convert HTML bold to markdown bold
    .replace(/<b>([^<]*)<\/b>/gi, '**$1**')
    .replace(/<strong>([^<]*)<\/strong>/gi, '**$1**')
    // Convert HTML italic to markdown italic
    .replace(/<i>([^<]*)<\/i>/gi, '*$1*')
    .replace(/<em>([^<]*)<\/em>/gi, '*$1*')
    // Convert <br> / <br/> to newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Strip remaining HTML tags (font, p, div, span, etc.)
    .replace(/<[^>]+>/g, '')  
    // Clean up HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Clean up excessive whitespace
    .replace(/\n{3,}/g, '\n\n');
}

/**
 * Parse a markdown table string into a docx Table
 * Pipes inside $...$/$$...$$ are math symbols, not column separators.
 */
function splitMarkdownTableRow(line: string): string[] {
  let body = line.trim();
  if (body.startsWith('|')) body = body.slice(1);
  if (body.endsWith('|') && body[body.length - 2] !== '\\') body = body.slice(0, -1);

  const cells: string[] = [];
  let cell = '';
  let mathDelimiter: '$' | '$$' | null = null;

  for (let index = 0; index < body.length; index++) {
    const char = body[index];

    if (char === '$' && body[index - 1] !== '\\') {
      const delimiter: '$' | '$$' = body[index + 1] === '$' ? '$$' : '$';
      if (mathDelimiter === null) mathDelimiter = delimiter;
      else if (mathDelimiter === delimiter) mathDelimiter = null;
      cell += delimiter;
      if (delimiter === '$$') index++;
      continue;
    }

    if (char === '|' && mathDelimiter === null && body[index - 1] !== '\\') {
      cells.push(cell.trim());
      cell = '';
      continue;
    }

    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

function parseMarkdownTable(tableLines: string[]): Table {
  const rows: string[][] = [];
  
  for (const line of tableLines) {
    const trimmed = line.trim();
    // Skip separator lines (|---|---|)
    if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;
    
    const cells = splitMarkdownTableRow(trimmed);
    
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  if (rows.length === 0) {
    return new Table({ rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph('')], borders: TABLE_BORDERS })] })], width: { size: 100, type: WidthType.PERCENTAGE } });
  }

  const colCount = Math.max(...rows.map(r => r.length));

  const getColumnRatios = (): number[] => {
    if (colCount === 2) {
      return [35, 65];
    }
    if (colCount === 3) {
      return [16, 42, 42];
    }
    return Array.from({ length: colCount }, () => 100 / colCount);
  };

  const ratios = getColumnRatios();
  const columnWidths = ratios.map(ratio => Math.floor(TABLE_WIDTH_DXA * ratio / 100));
  columnWidths[columnWidths.length - 1] += TABLE_WIDTH_DXA - columnWidths.reduce((sum, width) => sum + width, 0);

  const tableRows = rows.map((row, rowIndex) => {
    const cells = [];
    for (let i = 0; i < colCount; i++) {
      const cellText = row[i] || '';
      const isHeaderRow = rowIndex === 0;
      const cellChildren = parseInlineFormattingWithMath(cellText, BODY_SIZE, isHeaderRow);
      cells.push(new TableCell({
        children: [new Paragraph({
          children: cellChildren,
          spacing: { line: 276, before: 40, after: 40 },
        })],
        borders: TABLE_BORDERS,
        width: { size: columnWidths[i], type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 120, right: 120 },
        ...(isHeaderRow ? {
          shading: { type: ShadingType.CLEAR, fill: 'E7E6E6', color: 'auto' },
        } : {}),
      }));
    }
    return new TableRow({ children: cells, tableHeader: rowIndex === 0 });
  });

  return new Table({
    rows: tableRows,
    width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
    indent: { size: TABLE_INDENT_DXA, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.LEFT,
  });
}

/**
 * Build a docx Document from markdown-like content
 * Fixed: proper bullet handling, header formatting, table widths
 */
function buildDocument(content: string): Document {
  const cleanedContent = normalizeMathDelimiters(stripHtml(content));
  const lines = cleanedContent.split('\n');
  const children: (Paragraph | Table)[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Detect display math block: $$...$$
    if (trimmed.startsWith('$$')) {
      let mathContent = trimmed.slice(2);
      // Single-line display math: $$formula$$
      if (mathContent.endsWith('$$') && mathContent.length > 2) {
        mathContent = mathContent.slice(0, -2);
      } else {
        // Multi-line display math — collect until closing $$
        mathContent = mathContent.endsWith('$$') ? mathContent.slice(0, -2) : mathContent;
        i++;
        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (nextLine.endsWith('$$')) {
            mathContent += ' ' + nextLine.slice(0, -2);
            break;
          }
          mathContent += ' ' + nextLine;
          i++;
        }
      }
      if (currentMathMode === 'omml') {
        try {
          children.push(new Paragraph({
            children: [createMathFromLatex(mathContent.trim())],
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 120 },
          }));
        } catch {
          children.push(new Paragraph({
            children: [new TextRun({ text: `$$${mathContent}$$`, font: FONT, size: BODY_SIZE })],
            spacing: { after: 80 },
          }));
        }
      } else {
        // LaTeX mode: keep as styled text
        children.push(new Paragraph({
          children: [new TextRun({ text: `$$${mathContent.trim()}$$`, font: 'Cambria Math', size: BODY_SIZE, italics: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
        }));
      }
      i++;
      continue;
    }

    // Detect markdown table block
    if (trimmed.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        children.push(parseMarkdownTable(tableLines));
        children.push(new Paragraph({ spacing: { after: 100 } })); // spacing after table
      } else {
        // Not a real table, treat as text
        for (const tl of tableLines) {
          children.push(new Paragraph({
            children: parseInlineFormattingWithMath(tl.trim()),
            spacing: { after: 60 },
          }));
        }
      }
      continue;
    }

    // Accept every Markdown heading level, including malformed AI output such
    // as "#####Hoạt động". No # marker is allowed to leak into Word.
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].replace(/\s+#+\s*$/, '').trim();
      const headingSize = level === 1 ? H1_SIZE : level === 2 ? H2_SIZE : level === 3 ? H3_SIZE : H4_SIZE;
      children.push(new Paragraph({
        children: parseInlineFormattingWithMath(headingText, headingSize, true, level >= 4),
        alignment: level === 1 ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: {
          before: level <= 2 ? 200 : level === 3 ? 160 : 120,
          after: level <= 2 ? 100 : 60,
        },
        keepNext: true,
        keepLines: true,
      }));
      i++;
      continue;
    }

    // AI sometimes uses Markdown blockquotes for definitions/theorems. Word
    // output should retain the emphasis and indentation, never the literal >.
    if (/^>+/.test(trimmed)) {
      const quoteText = trimmed
        .replace(/^>+\s*/, '')
        .replace(/^[-*]\s+/, '');
      children.push(new Paragraph({
        children: parseInlineFormattingWithMath(quoteText),
        spacing: { line: 300, after: 60 },
        indent: { left: 360 },
      }));
      i++;
      continue;
    }

    // Keep genuine lists as Word bullets, but a)-d), Bước 1... and standalone
    // bold labels are structural paragraphs, not list items.
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (bulletMatch) {
      const indentLength = bulletMatch[1].replace(/\t/g, '    ').length;
      const bulletLevel = indentLength >= 2 ? 1 : 0;
      const bulletText = bulletMatch[2].trim();
      const plainBulletText = bulletText.replace(/\*+/g, '').trim();
      const isSemanticLabel =
        /^[a-d][.)]\s*(?:Mục tiêu|Nội dung|Sản phẩm|Tổ chức thực hiện)\b/i.test(plainBulletText) ||
        /^Bước\s+\d+[.:)]?/i.test(plainBulletText) ||
        /^\*\*[^*\n]{2,120}:\*\*\s*$/.test(bulletText);

      children.push(new Paragraph({
        children: parseInlineFormattingWithMath(bulletText),
        ...(isSemanticLabel
          ? { indent: { left: bulletLevel === 0 ? 360 : 720 } }
          : { bullet: { level: bulletLevel } }),
        spacing: { line: 300, after: 60 },
      }));
      i++;
      continue;
    }

    // Numbered list (1. item, 2. item, etc.) — keep the number prefix in text
    if (/^\d+\.\s/.test(trimmed)) {
      children.push(new Paragraph({
        children: parseInlineFormattingWithMath(trimmed),
        spacing: { line: 300, after: 60 },
        indent: { left: 360 },
      }));
      i++;
      continue;
    }

    // Default: regular paragraph with inline formatting
    children.push(new Paragraph({
      children: parseInlineFormattingWithMath(trimmed),
      spacing: { line: 300, after: 80 },
    }));
    i++;
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1134,    // 2cm
            right: 1134,
            bottom: 1134,
            left: 1701,   // 3cm left margin for binding
          }
        }
      },
      children: children
    }]
  });
}

/**
 * Generate and download a single DOCX file
 */
export async function generateDocx(content: string, fileName: string, mathMode: MathMode = 'omml') {
  currentMathMode = mathMode;
  const doc = buildDocument(content);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileName}.docx`);
}

/**
 * Get DOCX as Blob (for zip packaging)
 */
export async function getDocxBlob(content: string, mathMode: MathMode = 'omml'): Promise<Blob> {
  currentMathMode = mathMode;
  const doc = buildDocument(content);
  return await Packer.toBlob(doc);
}
