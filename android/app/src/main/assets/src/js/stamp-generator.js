/**
 * Stamp & Annotation Generator for SwiftSign
 * 
 * Features:
 * 1. 1-Tap Date Stamps (Multiple regional formats)
 * 2. Checkmarks (✓) and Crosses (✕) for form checkboxes
 * 3. Text & Name Fields (Custom names, job titles, IDs)
 * 4. Official Company Stamp & Seal Generator:
 *    - Dual shapes: Round Corporate Seal & Rectangular Business Stamp
 *    - Standalone Transparent PNG Export (>= 1600px, no white fringe, pure alpha)
 *    - 11 Standard Business Templates:
 *      PAID, APPROVED, RECEIVED, VERIFIED, REJECTED, AUTHORIZED SIGNATORY,
 *      FOR [COMPANY NAME], DIRECTOR, ACCOUNTS DEPARTMENT, PAYMENT RECEIVED,
 *      RECEIVED WITH THANKS
 *    - Dynamic auto-shrinking text handling up to 60 characters without clipping
 *    - Customizable shape, ink color, text size, border, style (ink-pad vs sharp)
 */

class StampGenerator {

  // Universal Standalone PNG Export Dimension (Synchronized with UI & toasts)
  static STANDALONE_PNG_SIZE = 1800;

  // All 11 Standard Business Templates
  static get TEMPLATES() {
    return [
      { id: 'authorized_signatory', name: 'Authorized Signatory', desig: 'AUTHORIZED SIGNATORY', sub: '★ OFFICIAL SEAL ★', color: '#1d4ed8', shape: 'round' },
      { id: 'director', name: 'Director', desig: 'DIRECTOR', sub: '★ OFFICIAL BUSINESS SEAL ★', color: '#1d4ed8', shape: 'round' },
      { id: 'for_company', name: 'For [Company Name]', desig: 'AUTHORIZED SIGNATORY', sub: 'PARTNER / DIRECTOR', color: '#1d4ed8', shape: 'rectangle' },
      { id: 'approved', name: 'Approved', desig: 'APPROVED', sub: '★ VERIFIED & VALID ★', color: '#047857', shape: 'round' },
      { id: 'verified', name: 'Verified', desig: 'VERIFIED', sub: '★ COMPLIANCE CHECKED ★', color: '#047857', shape: 'round' },
      { id: 'received', name: 'Received', desig: 'RECEIVED', sub: 'DOCUMENT OFFICE', color: '#1d4ed8', shape: 'rectangle' },
      { id: 'paid', name: 'Paid', desig: 'PAID', sub: 'ACCOUNTS DEPARTMENT', color: '#b91c1c', shape: 'rectangle' },
      { id: 'rejected', name: 'Rejected', desig: 'REJECTED', sub: 'DOES NOT COMPLY', color: '#b91c1c', shape: 'rectangle' },
      { id: 'accounts_dept', name: 'Accounts Department', desig: 'ACCOUNTS DEPARTMENT', sub: 'FINANCE & BILLING', color: '#581c87', shape: 'rectangle' },
      { id: 'payment_received', name: 'Payment Received', desig: 'PAYMENT RECEIVED', sub: 'WITH THANKS', color: '#047857', shape: 'rectangle' },
      { id: 'received_with_thanks', name: 'Received with Thanks', desig: 'RECEIVED WITH THANKS', sub: 'OFFICIAL RECEIPT', color: '#1d4ed8', shape: 'rectangle' }
    ];
  }

  /**
   * Helper to format dates
   */
  static formatDate(date = new Date(), format = 'medium') {
    const d = date instanceof Date ? date : new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[d.getMonth()];

    switch (format) {
      case 'slash_dmy':
        return `${day}/${monthNum}/${year}`;
      case 'slash_mdy':
        return `${monthNum}/${day}/${year}`;
      case 'iso':
        return `${year}-${monthNum}-${day}`;
      case 'medium':
      default:
        return `${day} ${monthName} ${year}`;
    }
  }

  /**
   * 1-Tap Date Stamp Generator
   */
  static createDateStamp({ date = new Date(), format = 'medium', color = '#0f172a', fontSize = 22, isBold = false } = {}) {
    const text = this.formatDate(date, format);
    return this.createTextStamp({
      text,
      color,
      fontSize,
      isBold,
      type: 'date'
    });
  }

  /**
   * Checkmark (✓) and Cross (✕) Symbol Generator
   */
  static createSymbolStamp({ type = 'check', color = null } = {}) {
    const isCheck = type === 'check';
    const finalColor = color || (isCheck ? '#16a34a' : '#dc2626');

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = finalColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (isCheck) {
      ctx.moveTo(24, 66);
      ctx.lineTo(52, 96);
      ctx.lineTo(104, 30);
    } else {
      ctx.moveTo(32, 32);
      ctx.lineTo(96, 96);
      ctx.moveTo(96, 32);
      ctx.lineTo(32, 96);
    }
    ctx.stroke();

    const dataUrl = canvas.toDataURL('image/png');
    return {
      dataUrl,
      width: 44,
      height: 44,
      aspectRatio: 1,
      type: isCheck ? 'check' : 'cross'
    };
  }

  /**
   * Custom Text & Name Stamp Generator
   */
  static createTextStamp({ text = '', color = '#0f172a', fontSize = 22, isBold = false, type = 'text' } = {}) {
    if (!text || text.trim().length === 0) {
      text = 'Sample Text';
    }

    const scale = 3;
    const scaledFontSize = fontSize * scale;

    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    const fontSpec = `${isBold ? '700' : '400'} ${scaledFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
    measureCtx.font = fontSpec;

    const textMetrics = measureCtx.measureText(text);
    const textWidth = Math.ceil(textMetrics.width);
    const textHeight = Math.ceil(scaledFontSize * 1.25);
    const pad = 12 * scale;

    const canvas = document.createElement('canvas');
    canvas.width = textWidth + pad * 2;
    canvas.height = textHeight + pad * 2;
    const ctx = canvas.getContext('2d');

    ctx.font = fontSpec;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, pad, canvas.height / 2);

    const dataUrl = canvas.toDataURL('image/png');
    const displayW = Math.round(canvas.width / scale);
    const displayH = Math.round(canvas.height / scale);

    return {
      dataUrl,
      width: displayW,
      height: displayH,
      aspectRatio: displayW / displayH,
      text,
      type
    };
  }

  /**
   * Helper to draw text along a circular arc with auto-shrink
   */
  static _drawCurvedText(ctx, text, cx, cy, radius, isTop, maxAllowedAngle = Math.PI * 0.82) {
    if (!text || !text.length) return;
    const cleanText = text.trim().toUpperCase();
    const len = cleanText.length;
    if (len === 0) return;

    // Parse current font spec
    const fontParts = (ctx.font || '700 26px sans-serif').split(' ');
    let currentSize = 26;
    let fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    for (const part of fontParts) {
      if (part.endsWith('px')) {
        currentSize = parseFloat(part);
        break;
      }
    }

    // Auto-shrink font size if text is long (up to 60 characters)
    let totalTextWidth = 0;
    for (let i = 0; i < len; i++) {
      totalTextWidth += ctx.measureText(cleanText[i]).width;
    }

    const maxArcLength = radius * maxAllowedAngle;
    if (totalTextWidth * 1.15 > maxArcLength) {
      const shrinkFactor = maxArcLength / (totalTextWidth * 1.15);
      currentSize = Math.max(Math.floor(currentSize * shrinkFactor), 10);
      ctx.font = `800 ${currentSize}px ${fontFamily}`;

      // Re-measure with shrunk font
      totalTextWidth = 0;
      for (let i = 0; i < len; i++) {
        totalTextWidth += ctx.measureText(cleanText[i]).width;
      }
    }

    let totalAngle = (totalTextWidth * 1.14) / radius;
    if (totalAngle > maxAllowedAngle) {
      totalAngle = maxAllowedAngle;
    }

    const angleStep = totalAngle / Math.max(len - 1, 1);

    if (isTop) {
      let currentAngle = -Math.PI / 2 - totalAngle / 2;
      for (let i = 0; i < len; i++) {
        const char = cleanText[i];
        ctx.save();
        ctx.translate(cx + radius * Math.cos(currentAngle), cy + radius * Math.sin(currentAngle));
        ctx.rotate(currentAngle + Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 0, 0);
        ctx.restore();
        currentAngle += angleStep;
      }
    } else {
      let currentAngle = Math.PI / 2 + totalAngle / 2;
      for (let i = 0; i < len; i++) {
        const char = cleanText[i];
        ctx.save();
        ctx.translate(cx + radius * Math.cos(currentAngle), cy + radius * Math.sin(currentAngle));
        ctx.rotate(currentAngle - Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char, 0, 0);
        ctx.restore();
        currentAngle -= angleStep;
      }
    }
  }

  /**
   * Helper to apply authentic wet-ink / rubber stamp distress effect
   */
  static _applyDistressEffect(ctx, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const count = Math.floor((width * height) / 1100);
    for (let i = 0; i < count; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const radius = 0.6 + Math.random() * 1.6;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.random() * 0.35})`;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let j = 0; j < 8; j++) {
      const sx = Math.random() * (width - 40);
      const sy = Math.random() * height;
      const sw = 10 + Math.random() * 30;
      const sh = 0.8 + Math.random() * 1.2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(sx, sy, sw, sh);
    }
    ctx.restore();
  }

  /**
   * Official Company Stamp & Seal Generator
   * Generates high-res authentic Round or Rectangular corporate seals
   */
  static createCompanySealStamp({
    shape = 'round',
    companyName = 'ACME TECHNOLOGIES PVT. LTD.',
    designation = 'AUTHORIZED SIGNATORY',
    subtext = '★ OFFICIAL SEAL ★',
    regNumber = '',
    dateText = '',
    color = '#1d4ed8',
    textSize = 'md', // sm, md, lg
    border = 'double', // double, single, heavy
    style = 'distressed',
    resolution = 600 // 600 for preview / document, >= 1600 (e.g. 1800) for high-res PNG export
  } = {}) {
    const isRound = shape === 'round';
    const scale = resolution / 600;

    // Text size multiplier
    let sizeMultiplier = 1.0;
    if (textSize === 'sm') sizeMultiplier = 0.88;
    else if (textSize === 'lg') sizeMultiplier = 1.12;

    if (isRound) {
      const size = Math.round(600 * scale);
      const cx = size / 2;
      const cy = size / 2;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Transparent background - never fill rect, ensures 100% alpha = 0 outside stamp
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // 1. Outer Border
      if (border === 'heavy') {
        ctx.lineWidth = 12 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, 272 * scale, 0, Math.PI * 2);
        ctx.stroke();
      } else if (border === 'single') {
        ctx.lineWidth = 6 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, 274 * scale, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Double border (Default)
        ctx.lineWidth = 8 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, 276 * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, 262 * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Inner Center Ring (Dashed security ring)
      const rInner = 196 * scale;
      ctx.lineWidth = 2.5 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Circular Text Band - Increased arc-text size for readability
      const rText = 229 * scale;
      const topFontSize = Math.round(31 * scale * sizeMultiplier);
      ctx.font = `800 ${topFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
      this._drawCurvedText(ctx, companyName || 'ACME TECHNOLOGIES PVT. LTD.', cx, cy, rText, true);

      // Curved Bottom Text (City / Reg No / Subtext)
      const bottomText = (subtext || 'OFFICIAL SEAL') + (regNumber ? ` • ${regNumber}` : '');
      const bottomFontSize = Math.round(25 * scale * sizeMultiplier);
      ctx.font = `700 ${bottomFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
      this._drawCurvedText(ctx, bottomText, cx, cy, rText, false);

      // Side Star Separators at 9 o'clock and 3 o'clock (reduced clutter)
      const starSize = Math.round(18 * scale * sizeMultiplier);
      ctx.font = `800 ${starSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('•', cx - rText, cy);
      ctx.fillText('•', cx + rText, cy);

      // 4. Center Divider Lines
      ctx.lineWidth = 2.5 * scale;
      ctx.beginPath();
      ctx.moveTo(cx - 145 * scale, cy - 40 * scale);
      ctx.lineTo(cx + 145 * scale, cy - 40 * scale);
      ctx.moveTo(cx - 145 * scale, cy + 40 * scale);
      ctx.lineTo(cx + 145 * scale, cy + 40 * scale);
      ctx.stroke();

      // 5. Upper Section: Ribbon (reduced clutter, single star)
      const topStarsSize = Math.round(22 * scale * sizeMultiplier);
      ctx.font = `800 ${topStarsSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('★', cx, cy - 70 * scale);

      // 6. Main Central Designation (between the two lines)
      const desig = (designation || 'AUTHORIZED SIGNATORY').trim().toUpperCase();
      const words = desig.split(' ');

      if (words.length > 1 && desig.length > 10) {
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');
        const desigSize = Math.round(24 * scale * sizeMultiplier);
        ctx.font = `800 ${desigSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(line1, cx, cy - 16 * scale);
        ctx.fillText(line2, cx, cy + 18 * scale);
      } else {
        const singleDesigSize = Math.round(36 * scale * sizeMultiplier);
        ctx.font = `900 ${singleDesigSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(desig, cx, cy);
      }

      // 7. Lower Section: Date or Bottom Star (clean, uncluttered)
      if (dateText && dateText.trim().length > 0) {
        const dateSize = Math.round(18 * scale * sizeMultiplier);
        ctx.font = `700 ${dateSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(dateText.trim().toUpperCase(), cx, cy + 70 * scale);
      } else {
        const bottomStarsSize = Math.round(20 * scale * sizeMultiplier);
        ctx.font = `800 ${bottomStarsSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText('★', cx, cy + 70 * scale);
      }

      // 8. Distress / Ink-Pad Effect
      if (style === 'distressed') {
        this._applyDistressEffect(ctx, size, size);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const displaySize = 135;

      return {
        canvas,
        dataUrl,
        width: displaySize,
        height: displaySize,
        pixelWidth: size,
        pixelHeight: size,
        aspectRatio: 1,
        type: 'stamp'
      };

    } else {
      // Rectangular Stamp
      const w = Math.round(600 * scale);
      const h = Math.round(260 * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      const pad = 12 * scale;
      const r = 16 * scale;

      // Outer Box
      if (border === 'heavy') {
        ctx.lineWidth = 10 * scale;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
        else ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
        ctx.stroke();
      } else if (border === 'single') {
        ctx.lineWidth = 5 * scale;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
        else ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
        ctx.stroke();
      } else {
        // Double border (Default)
        ctx.lineWidth = 8 * scale;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad, pad, w - pad * 2, h - pad * 2, r);
        else ctx.rect(pad, pad, w - pad * 2, h - pad * 2);
        ctx.stroke();

        ctx.lineWidth = 2.5 * scale;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pad + 10 * scale, pad + 10 * scale, w - (pad + 10 * scale) * 2, h - (pad + 10 * scale) * 2, Math.max(r - 4 * scale, 4));
        else ctx.rect(pad + 10 * scale, pad + 10 * scale, w - (pad + 10 * scale) * 2, h - (pad + 10 * scale) * 2);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Line 1: For [Company Name] (With auto-shrink for up to 60 characters)
      const cleanComp = (companyName || 'ACME TECHNOLOGIES PVT. LTD.').trim().toUpperCase();
      let compFontSize = Math.round(24 * scale * sizeMultiplier);
      ctx.font = `800 ${compFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

      const maxTextW = (w - pad * 2) * 0.85;
      let textW = ctx.measureText('FOR ' + cleanComp).width;
      if (textW > maxTextW) {
        compFontSize = Math.max(Math.floor(compFontSize * (maxTextW / textW)), 10 * scale);
        ctx.font = `800 ${compFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      }
      ctx.fillText('FOR ' + cleanComp, w / 2, 58 * scale);

      // Line 2: Signature guideline
      ctx.lineWidth = 1.5 * scale;
      ctx.setLineDash([5 * scale, 4 * scale]);
      ctx.beginPath();
      ctx.moveTo(w * 0.12, 115 * scale);
      ctx.lineTo(w * 0.88, 115 * scale);
      ctx.stroke();
      ctx.setLineDash([]);

      // Line 3: Designation / Stamp Text
      const desigText = (designation || 'AUTHORIZED SIGNATORY').trim().toUpperCase();
      const desigFontSize = Math.round(28 * scale * sizeMultiplier);
      ctx.font = `800 ${desigFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(desigText, w / 2, 158 * scale);

      // Line 4: Subtext / Reg No / Date
      let sub = subtext || 'OFFICIAL BUSINESS SEAL';
      if (regNumber) sub += ` • ${regNumber}`;
      if (dateText) sub = `${dateText} • ` + sub;
      const subFontSize = Math.round(18 * scale * sizeMultiplier);
      ctx.font = `600 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText(sub.trim().toUpperCase(), w / 2, 206 * scale);

      if (style === 'distressed') {
        this._applyDistressEffect(ctx, w, h);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const displayW = 180;
      const displayH = Math.round(displayW * (h / w));

      return {
        canvas,
        dataUrl,
        width: displayW,
        height: displayH,
        pixelWidth: w,
        pixelHeight: h,
        aspectRatio: displayW / displayH,
        type: 'stamp'
      };
    }
  }

  /**
   * Standalone High-Resolution Transparent PNG Exporter (1800px)
   * Guaranteed:
   * 1. Output dimension matches StampGenerator.STANDALONE_PNG_SIZE (1800px).
   * 2. Pure alpha transparency (no background filled, no white halo/fringe).
   * 3. Lossless full-fidelity rasterization.
   */
  static exportStandaloneStampPng(options, targetSize = StampGenerator.STANDALONE_PNG_SIZE) {
    const minLongestSide = Math.max(targetSize, StampGenerator.STANDALONE_PNG_SIZE);
    return this.createCompanySealStamp({
      ...options,
      resolution: minLongestSide
    });
  }

  /**
   * DataURL to Blob converter
   */
  static dataUrlToBlob(dataUrl) {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StampGenerator;
}
