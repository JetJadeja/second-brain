import { PDFParse } from 'pdf-parse'
import type { ExtractedContent, PdfSource } from '@second-brain/shared'

interface ExtractionResult {
  content: ExtractedContent
  warning?: string
}

const MIN_MEANINGFUL_TEXT = 50

export async function extractPdf(
  buffer: Buffer,
  fileName: string,
  storagePath: string,
): Promise<ExtractionResult> {
  const fallback = buildFallback(fileName, storagePath)

  try {
    const pdf = new PDFParse(buffer)
    const result = await pdf.getText()
    const content = result.text.trim()
    const pageCount = result.total

    if (content.length < MIN_MEANINGFUL_TEXT) {
      return {
        content: {
          ...fallback,
          source: { filename: fileName, page_count: pageCount, storage_path: storagePath },
        },
        warning: 'This PDF appears to be scanned images. Saved the file but couldn\'t extract text.',
      }
    }

    const title = capTitle(fileName.replace(/\.pdf$/i, '') || 'PDF Document')

    const source: PdfSource = {
      filename: fileName,
      page_count: pageCount,
      storage_path: storagePath,
    }

    return {
      content: {
        title,
        content,
        sourceType: 'pdf',
        source,
      },
    }
  } catch {
    return {
      content: fallback,
      warning: "Couldn't parse this PDF. Saved the file.",
    }
  }
}

function buildFallback(fileName: string, storagePath: string): ExtractedContent {
  return {
    title: fileName.replace(/\.pdf$/i, '') || 'PDF Document',
    content: '',
    sourceType: 'pdf',
    source: { filename: fileName, storage_path: storagePath } as PdfSource,
  }
}
