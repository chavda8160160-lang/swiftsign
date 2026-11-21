/**
 * CanvasSignature - Smooth bezier signature drawing canvas
 * Supports touch, stylus with pressure, undo/redo, auto-crop, and high-DPI export.
 */

class CanvasSignature {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.color = options.color || '#0f172a'; // Default slate black
    this.thickness = options.thickness || 3.5;
    
    this.strokes = []; // Array of { points: [{x, y, p}], color, thickness }
    this.currentStroke = null;
    this.isDrawing = false;
    
    this.setupDPI();
    this.bindEvents();
  }

  setupDPI() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    this.dpr = dpr;

    // Set physical canvas dimensions
    const displayWidth = rect.width || 600;
    const displayHeight = rect.height || 260;

    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    this.ctx.scale(dpr, dpr);
    this.redraw();
  }

  bindEvents() {
    this.canvas.style.touchAction = 'none'; // Prevent browser scroll gestures

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        p: e.pressure && e.pressure > 0 ? e.pressure : 0.5
      };
    };

    const startDraw = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);

      this.currentStroke = {
        color: this.color,
        thickness: this.thickness,
        points: [pos]
      };
      this.strokes.push(this.currentStroke);

      this.ctx.beginPath();
      this.ctx.fillStyle = this.color;
      this.ctx.arc(pos.x, pos.y, (this.thickness / 2) * (pos.p * 0.8 + 0.6), 0, Math.PI * 2);
      this.ctx.fill();
    };

    const moveDraw = (e) => {
      if (!this.isDrawing || !this.currentStroke) return;
      e.preventDefault();
      const pos = getPos(e);
      const pts = this.currentStroke.points;
      
      const lastPt = pts[pts.length - 1];
      const dist = Math.hypot(pos.x - lastPt.x, pos.y - lastPt.y);
      if (dist < 2) return; // Ignore micro-jitters

      pts.push(pos);
      this.drawLatestSegment();
    };

    const stopDraw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      this.isDrawing = false;
      this.currentStroke = null;
    };

    this.canvas.addEventListener('pointerdown', startDraw);
    this.canvas.addEventListener('pointermove', moveDraw);
    this.canvas.addEventListener('pointerup', stopDraw);
    this.canvas.addEventListener('pointercancel', stopDraw);
    this.canvas.addEventListener('pointerleave', stopDraw);
  }

  drawLatestSegment() {
    if (!this.currentStroke || this.currentStroke.points.length < 2) return;
    const pts = this.currentStroke.points;
    const len = pts.length;
    
    const p1 = pts[len - 2];
    const p2 = pts[len - 1];
    
    // Smooth using midpoints
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const ctx = this.ctx;
    ctx.beginPath();
    ctx.strokeStyle = this.currentStroke.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const pressureScale = p2.p ? (p2.p * 0.8 + 0.6) : 1;
    ctx.lineWidth = this.currentStroke.thickness * pressureScale;

    if (len === 2) {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(midX, midY);
    } else {
      const p0 = pts[len - 3];
      const prevMidX = (p0.x + p1.x) / 2;
      const prevMidY = (p0.y + p1.y) / 2;
      ctx.moveTo(prevMidX, prevMidY);
      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }
    ctx.stroke();
  }

  redraw() {
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.width / this.dpr;
    const h = rect.height || this.canvas.height / this.dpr;
    
    ctx.clearRect(0, 0, w, h);

    for (const stroke of this.strokes) {
      const pts = stroke.points;
      if (!pts || pts.length === 0) continue;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (pts.length === 1) {
        ctx.arc(pts[0].x, pts[0].y, stroke.thickness / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      ctx.lineWidth = stroke.thickness;
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length; i++) {
        const p1 = pts[i - 1];
        const p2 = pts[i];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      }

      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();
    }
  }

  undo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.redraw();
      return true;
    }
    return false;
  }

  clear() {
    this.strokes = [];
    this.redraw();
  }

  isEmpty() {
    return this.strokes.length === 0;
  }

  setColor(colorHex) {
    this.color = colorHex;
  }

  setThickness(px) {
    this.thickness = px;
  }

  /**
   * Automatically crops transparent padding around the signature
   * and returns high-resolution transparent PNG Data URL.
   */
  toCroppedDataURL(padding = 10) {
    if (this.isEmpty()) return null;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const imgData = this.ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let minX = w, minY = h, maxX = 0, maxY = 0;
    let hasPixels = false;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = data[(y * w + x) * 4 + 3];
        if (alpha > 10) { // non-transparent
          hasPixels = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasPixels) return null;

    // Add padding (in physical pixels)
    const pad = Math.round(padding * this.dpr);
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w - 1, maxX + pad);
    maxY = Math.min(h - 1, maxY + pad);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Off-screen canvas for cropped signature
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');

    cropCtx.drawImage(
      this.canvas,
      minX, minY, cropW, cropH,
      0, 0, cropW, cropH
    );

    return {
      dataUrl: cropCanvas.toDataURL('image/png'),
      width: cropW / this.dpr,
      height: cropH / this.dpr,
      aspectRatio: cropW / cropH
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasSignature;
}
