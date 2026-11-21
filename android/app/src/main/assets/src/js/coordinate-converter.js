/**
 * Coordinate Converter for SwiftSign
 * Accurately translates UI placement coordinates (CSS pixels, top-left origin)
 * to native PDF page points (72 DPI, bottom-left origin), accounting for
 * page scale, signature dimensions, user rotation, and native page rotation.
 */

class CoordinateConverter {
  /**
   * Convert UI placement to PDF drawing parameters
   * @param {Object} options
   * @param {number} options.pageWidth - PDF page width in points (page.getWidth())
   * @param {number} options.pageHeight - PDF page height in points (page.getHeight())
   * @param {number} options.pageRotation - PDF page rotation in degrees (0, 90, 180, 270)
   * @param {number} options.renderedWidth - Rendered canvas display width in CSS px
   * @param {number} options.renderedHeight - Rendered canvas display height in CSS px
   * @param {Object} options.placement - { x, y, width, height, rotation } in CSS px
   * @returns {Object} { x, y, width, height, rotateDegrees }
   */
  static screenToPdf({
    pageWidth,
    pageHeight,
    pageRotation = 0,
    renderedWidth,
    renderedHeight,
    placement
  }) {
    const rot = (pageRotation % 360 + 360) % 360;
    
    // Scale factors
    // If page is rotated 90 or 270, renderedWidth maps to pageHeight and renderedHeight maps to pageWidth
    let effectivePdfW = pageWidth;
    let effectivePdfH = pageHeight;
    if (rot === 90 || rot === 270) {
      effectivePdfW = pageHeight;
      effectivePdfH = pageWidth;
    }

    const scaleX = effectivePdfW / renderedWidth;
    const scaleY = effectivePdfH / renderedHeight;

    const w = placement.width * scaleX;
    const h = placement.height * scaleY;

    // Center of placement in screen-rendered coordinates
    const screenCx = (placement.x + placement.width / 2) * scaleX;
    const screenCy = (placement.y + placement.height / 2) * scaleY;

    // Signature user rotation in degrees (clockwise in UI)
    const userRot = placement.rotation || 0;

    let pdfCx, pdfCy;
    let finalRotation = -userRot; // Invert for PDF (PDF rotation is counter-clockwise)

    if (rot === 0) {
      pdfCx = screenCx;
      pdfCy = effectivePdfH - screenCy;
    } else if (rot === 90) {
      // In 90-degree rotated page:
      // Screen X maps to PDF Y (from top), Screen Y maps to PDF X
      pdfCx = screenCy;
      pdfCy = screenCx;
      finalRotation -= 90;
    } else if (rot === 180) {
      pdfCx = effectivePdfW - screenCx;
      pdfCy = screenCy;
      finalRotation -= 180;
    } else if (rot === 270) {
      pdfCx = effectivePdfW - screenCy;
      pdfCy = effectivePdfH - screenCx;
      finalRotation -= 270;
    }

    // PDFLib page.drawImage rotates around its bottom-left origin (x, y)
    // To rotate around the center (pdfCx, pdfCy), calculate the offset:
    const rad = (finalRotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Unrotated offset from bottom-left to center: (w / 2, h / 2)
    // Rotated offset:
    const dx = (w / 2) * cos - (h / 2) * sin;
    const dy = (w / 2) * sin + (h / 2) * cos;

    const pdfX = pdfCx - dx;
    const pdfY = pdfCy - dy;

    return {
      x: pdfX,
      y: pdfY,
      width: w,
      height: h,
      rotateDegrees: ((finalRotation % 360) + 360) % 360
    };
  }

  /**
   * Convert UI placement to full-resolution Image Canvas coordinates
   */
  static screenToImage({
    imageNaturalWidth,
    imageNaturalHeight,
    renderedWidth,
    renderedHeight,
    placement
  }) {
    const scaleX = imageNaturalWidth / renderedWidth;
    const scaleY = imageNaturalHeight / renderedHeight;

    return {
      x: placement.x * scaleX,
      y: placement.y * scaleY,
      width: placement.width * scaleX,
      height: placement.height * scaleY,
      rotation: placement.rotation || 0
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CoordinateConverter;
}
