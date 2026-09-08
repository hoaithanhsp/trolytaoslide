import mammoth from 'mammoth';
import JSZip from 'jszip';

/** Supported image MIME types */
const IMAGE_MIMES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

/** Result from parsing a file — either text or image data */
export interface ParsedFile {
  type: 'text' | 'image';
  text?: string;
  imageData?: { base64: string; mimeType: string };
}

/** Check if file is an image */
export function isImageFile(file: File): boolean {
  const ext = getExt(file.name);
  return ext in IMAGE_MIMES;
}

function getExt(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

/** Convert file to base64 string */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Parse DOCX file → text */
async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Parse PPTX slides in their actual order and keep slide boundaries. */
async function parsePptxFile(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideNames = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const aNum = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
      const bNum = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
      return aNum - bNum;
    });

  const slides: string[] = [];
  for (const [index, name] of slideNames.entries()) {
    const xml = await zip.file(name)?.async('string');
    if (!xml) continue;
    const texts = [...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/gi)]
      .map(match => decodeXmlText(match[1]).trim())
      .filter(Boolean);
    if (texts.length > 0) slides.push(`--- Slide ${index + 1} ---\n${texts.join('\n')}`);
  }

  if (slides.length === 0) throw new Error('Không tìm thấy nội dung chữ trong file PowerPoint.');
  return slides.join('\n\n');
}

/** Parse PDF file → text (dynamic import) */
async function parsePdfFile(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      textParts.push(`--- Trang ${i} ---\n${pageText}`);
    }
    return textParts.join('\n');
  } catch (err) {
    console.error('PDF parsing error:', err);
    throw new Error('Không thể đọc file PDF. Vui lòng thử chuyển sang định dạng .docx.');
  }
}

/**
 * Universal file parser — supports .docx, .pdf, .pptx, .txt, and images
 * Returns ParsedFile with either text or base64 image data
 */
export async function parseFileAdvanced(file: File): Promise<ParsedFile> {
  const ext = getExt(file.name);

  // Image files → return base64 for Gemini Vision
  if (ext in IMAGE_MIMES) {
    const base64 = await fileToBase64(file);
    return {
      type: 'image',
      imageData: { base64, mimeType: IMAGE_MIMES[ext] },
    };
  }

  // Document files → extract text
  let text: string;
  if (ext === '.pdf') {
    text = await parsePdfFile(file);
  } else if (ext === '.docx') {
    text = await parseDocxFile(file);
  } else if (ext === '.pptx') {
    text = await parsePptxFile(file);
  } else if (ext === '.txt') {
    text = await file.text();
  } else {
    throw new Error(`Định dạng không hỗ trợ: ${file.name}. Chỉ hỗ trợ .docx, .pdf, .pptx, .txt, .png, .jpg, .webp`);
  }

  return { type: 'text', text };
}

/**
 * Simple parseFile — backward compatible, returns text only. 
 * For images, returns placeholder (use parseFileAdvanced instead).
 */
export async function parseFile(file: File): Promise<string> {
  const result = await parseFileAdvanced(file);
  if (result.type === 'image') {
    return `[FILE ẢNH: ${file.name}]`;
  }
  return result.text || '';
}

// Backward compat
export { parseDocxFile as parseDocx };
