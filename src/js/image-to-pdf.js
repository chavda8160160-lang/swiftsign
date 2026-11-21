/**
 * ImageToPdfConverter for SwiftSign
 * 
 * Features:
 * 1. Multi-image conversion into clean PDF
 * 2. Page sizes: A4 (595.28 x 841.89 pt), Letter (612 x 792 pt), and Fit to Image
 * 3. Preserves aspect ratio with centering
 * 4. Embeds JPEG without recompression (lossless direct embedding)
 * 5. Embeds PNG with alpha support
 * 6. Pure JS dimension parsing for JPEG and PNG (works in Node and browser)
 */

class ImageToPdfConverter {

  static get PAGE_SIZES() {
    return {
      a4: { width: 595.28, height: 841.89, label: 'A4' },
      letter: { width: 612.00, height: 792.00, label: 'Letter' },
      fit: { width: 0, height: 0, label: 'Fit to Image' }
    };
  }

  /**
   * Parse image dimensions (width, height, format) directly from image file header
   */
  static parseImageHeader(bytes) {
    if (!bytes || bytes.length < 8) return null;

    // Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      if (bytes.length >= 24) {
        // IHDR chunk dimensions at offset 16 and 20 (big-endian 32-bit uint)
        const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
        const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
        return { format: 'png', width, height };
      }
    }

    // Check JPEG signature: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      let offset = 2;
      while (offset < bytes.length - 8) {
        if (bytes[offset] !== 0xFF) {
          offset++;
          continue;
        }
        const marker = bytes[offset + 1];
        // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
          const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
          return { format: 'jpeg', width, height };
        }
        // Move to next segment
        const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
        offset += 2 + length;
      }
      return { format: 'jpeg', width: 800, height: 1000 }; // fallback
    }

    return null;
  }

  /**
   * Convert multiple images into a combined PDF document
   * Supports both:
   * 1. convertImagesToPdf({ images, pageSize, orientation, margin })
   * 2. convertImagesToPdf(imagesArray, { pageSize, orientation, margin })
   * 
   * @param {Object|Array} arg1
   * @param {Object} [arg2]
   * @returns {Promise<{ bytes: Uint8Array, pageCount: number }>}
   */
  static async convertImagesToPdf(arg1, arg2 = {}) {
    let images = [];
    let pageSize = 'a4';
    let orientation = 'auto';
    let margin = 0;

    if (Array.isArray(arg1)) {
      images = arg1;
      if (arg2 && typeof arg2 === 'object') {
        pageSize = arg2.pageSize || pageSize;
        orientation = arg2.orientation || orientation;
        margin = arg2.margin !== undefined ? arg2.margin : margin;
      }
    } else if (arg1 && typeof arg1 === 'object') {
      images = arg1.images || [];
      pageSize = arg1.pageSize || pageSize;
      orientation = arg1.orientation || orientation;
      margin = arg1.margin !== undefined ? arg1.margin : margin;
    }

    if (typeof PDFLib === 'undefined') {
      throw new Error('PDFLib is not available');
    }

    if (!images || images.length === 0) {
      throw new Error('No images provided for PDF conversion');
    }

    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      let bytes = item.bytes;
      if (!bytes && item.dataUrl) {
        bytes = this.dataUrlToUint8Array(item.dataUrl);
      }
      if (!bytes || bytes.length === 0) {
        continue;
      }

      // Ensure byteOffset is 0 for pdf-lib's DataView constructor
      if (bytes.byteOffset !== 0 || bytes.buffer.byteLength !== bytes.byteLength) {
        const clean = new Uint8Array(bytes.byteLength);
        clean.set(bytes);
        bytes = clean;
      }

      // Detect image format & natural dimensions
      const headerInfo = this.parseImageHeader(bytes);
      const isJpeg = (item.mimeType && item.mimeType.includes('jpeg')) || (headerInfo && headerInfo.format === 'jpeg');
      const isPng = (item.mimeType && item.mimeType.includes('png')) || (headerInfo && headerInfo.format === 'png');

      let embeddedImage = null;

      if (isJpeg) {
        try {
          embeddedImage = await pdfDoc.embedJpg(bytes);
        } catch (eJpg) {
          console.warn('embedJpg failed, attempting canvas fallback:', eJpg.message);
        }
      } else if (isPng) {
        try {
          embeddedImage = await pdfDoc.embedPng(bytes);
        } catch (ePng) {
          console.warn('embedPng failed, attempting canvas fallback:', ePng.message);
        }
      }

      // Universal Browser Canvas Fallback (handles WebP, progressive JPEGs, camera photos)
      if (!embeddedImage && typeof document !== 'undefined' && item.dataUrl) {
        try {
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = item.dataUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const cleanPngUrl = canvas.toDataURL('image/png');
          const cleanPngBytes = this.dataUrlToUint8Array(cleanPngUrl);
          embeddedImage = await pdfDoc.embedPng(cleanPngBytes);
        } catch (canvasErr) {
          console.warn('Canvas conversion fallback failed:', canvasErr.message);
        }
      }

      if (!embeddedImage) {
        console.warn(`Could not embed image #${i + 1}`);
        continue;
      }

      const imgWidth = embeddedImage.width || (headerInfo ? headerInfo.width : 595);
      const imgHeight = embeddedImage.height || (headerInfo ? headerInfo.height : 842);

      let pageWidth, pageHeight;
      let drawX = 0, drawY = 0, drawW = imgWidth, drawH = imgHeight;

      if (pageSize === 'fit') {
        // Page dimensions exactly match image dimensions (72 pt/inch scale)
        pageWidth = imgWidth;
        pageHeight = imgHeight;
        drawX = 0;
        drawY = 0;
        drawW = imgWidth;
        drawH = imgHeight;
      } else {
        // Standard paper size (A4 or Letter)
        const standardDims = this.PAGE_SIZES[pageSize] || this.PAGE_SIZES.a4;
        const isLandscape = orientation === 'landscape' || (orientation === 'auto' && imgWidth > imgHeight);

        if (isLandscape) {
          pageWidth = Math.max(standardDims.width, standardDims.height);
          pageHeight = Math.min(standardDims.width, standardDims.height);
        } else {
          pageWidth = Math.min(standardDims.width, standardDims.height);
          pageHeight = Math.max(standardDims.width, standardDims.height);
        }

        const availW = Math.max(10, pageWidth - margin * 2);
        const availH = Math.max(10, pageHeight - margin * 2);

        // Aspect ratio preservation (fit inside usable area)
        const scale = Math.min(availW / imgWidth, availH / imgHeight);
        drawW = imgWidth * scale;
        drawH = imgHeight * scale;
        drawX = margin + (availW - drawW) / 2;
        drawY = margin + (availH - drawH) / 2;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      page.drawImage(embeddedImage, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH
      });
    }

    const pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      throw new Error('No valid images could be converted to PDF pages');
    }

    const pdfBytes = await pdfDoc.save();
    return {
      bytes: pdfBytes,
      pageCount
    };
  }

  static dataUrlToUint8Array(dataUrl) {
    const base64Index = dataUrl.indexOf(';base64,');
    if (base64Index === -1) {
      throw new Error('Invalid data URL');
    }
    const base64 = dataUrl.substring(base64Index + 8);
    if (typeof atob !== 'undefined') {
      const raw = atob(base64);
      const arr = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        arr[i] = raw.charCodeAt(i);
      }
      return arr;
    } else {
      const buf = Buffer.from(base64, 'base64');
      const arr = new Uint8Array(buf.length);
      arr.set(buf);
      return arr;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageToPdfConverter;
}
