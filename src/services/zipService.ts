import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getDocxBlob, MathMode } from './docxGenerator';
import { GeneratedLesson } from '../types';

export async function downloadAllAsZip(lessons: GeneratedLesson[], mathMode: MathMode = 'omml') {
  const zip = new JSZip();
  
  for (const lesson of lessons) {
    if (lesson.status === 'completed' && lesson.content) {
      const blob = await getDocxBlob(lesson.content, mathMode);
      const fileStem = lesson.info.tiet > 0
        ? `Giao_an_tiet_${lesson.info.tiet.toString().padStart(2, '0')}`
        : `Giao_an_${lesson.info.noi_dung.replace(/[<>:"/\\|?*]+/g, '_').slice(0, 80)}`;
      zip.file(`${fileStem}.docx`, blob);
    }
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'Giao_an_tron_bo.zip');
}
