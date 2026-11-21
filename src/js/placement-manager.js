/**
 * Placement Manager for SwiftSign
 * Handles dragging, resizing, rotating, and managing signature overlays on the document.
 */

class PlacementManager {
  constructor({ containerElement, onPlacementUpdated, onApplyToAllPages }) {
    this.container = containerElement;
    this.onPlacementUpdated = onPlacementUpdated;
    this.onApplyToAllPages = onApplyToAllPages;

    // Store placements: Array of { id, pageNumber, normX, normY, normW, normH, rotation, dataUrl, element }
    // We store normalized coordinates (0..1 relative to page width/height)
    // so when zooming or changing scale, signatures stay locked to the exact document position!
    this.placements = [];
    this.activeId = null;
    this.currentPageNumber = 1;
    this.undoStack = [];

    // Alignment Snap Guides (C4)
    this.snapGuideV = null;
    this.snapGuideH = null;
    if (this.container && typeof document !== 'undefined') {
      this.snapGuideV = document.createElement('div');
      this.snapGuideV.className = 'snap-guide-line vertical';
      this.container.appendChild(this.snapGuideV);

      this.snapGuideH = document.createElement('div');
      this.snapGuideH.className = 'snap-guide-line horizontal';
      this.container.appendChild(this.snapGuideH);
    }

    this.initInteractionHandlers();
  }

  updateSnapGuides(snappedX, snappedY) {
    if (this.snapGuideV) {
      this.snapGuideV.style.display = snappedX ? 'block' : 'none';
    }
    if (this.snapGuideH) {
      this.snapGuideH.style.display = snappedY ? 'block' : 'none';
    }
  }

  hideSnapGuides() {
    if (this.snapGuideV) this.snapGuideV.style.display = 'none';
    if (this.snapGuideH) this.snapGuideH.style.display = 'none';
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const action = this.undoStack.pop();

    if (action.type === 'add') {
      const idx = this.placements.findIndex(p => p.id === action.id);
      if (idx !== -1) {
        const p = this.placements[idx];
        if (p.element && p.element.parentNode) p.element.parentNode.removeChild(p.element);
        this.placements.splice(idx, 1);
        if (this.activeId === action.id) this.activeId = null;
      }
    } else if (action.type === 'delete') {
      const data = action.data;
      const el = this.createPlacementElement(data);
      data.element = el;
      this.container.appendChild(el);
      this.placements.push(data);
      this.select(data.id);
    } else if (action.type === 'transform') {
      const p = this.placements.find(item => item.id === action.id);
      if (p) {
        p.normX = action.oldState.normX;
        p.normY = action.oldState.normY;
        p.normW = action.oldState.normW;
        p.normH = action.oldState.normH;
        p.rotation = action.oldState.rotation;
      }
    } else if (action.type === 'batch') {
      for (const id of action.createdIds) {
        const idx = this.placements.findIndex(p => p.id === id);
        if (idx !== -1) {
          const p = this.placements[idx];
          if (p.element && p.element.parentNode) p.element.parentNode.removeChild(p.element);
          this.placements.splice(idx, 1);
        }
      }
    }

    this.renderPlacements();
    this.updateVisibility();
    if (this.onPlacementUpdated) this.onPlacementUpdated();
    return true;
  }

  setCurrentPage(pageNumber) {
    this.currentPageNumber = pageNumber;
    this.updateVisibility();
  }

  addSignature(options) {
    return this.addPlacement({ ...options, type: 'signature' });
  }

  addPlacement({ dataUrl, width, height, aspectRatio, pageNumber, type = 'signature' }) {
    const pageW = this.container.clientWidth || 400;
    const pageH = this.container.clientHeight || 600;

    let targetW;
    let targetH;

    if (type === 'check' || type === 'cross') {
      // Checkmarks for form checkboxes
      targetW = Math.min(width || 36, Math.max(pageW * 0.1, 26));
      targetH = targetW;
    } else if (type === 'date') {
      targetW = Math.min(width || 135, Math.max(pageW * 0.4, 90));
      targetH = targetW / (aspectRatio || 3.5);
    } else if (type === 'text') {
      targetW = Math.min(width || 160, Math.max(pageW * 0.5, 110));
      targetH = targetW / (aspectRatio || 3.5);
    } else if (type === 'stamp') {
      targetW = Math.min(width || 135, Math.max(pageW * 0.32, 110));
      targetH = targetW / (aspectRatio || 1);
    } else {
      // Default signature width: ~35% of page width
      targetW = Math.min(Math.max(pageW * 0.35, 120), 240);
      targetH = targetW / (aspectRatio || 2);
    }

    // Initial position: center of active viewing area
    const initialX = Math.max(10, (pageW - targetW) / 2);
    const initialY = Math.min(pageH * 0.65, pageH - targetH - 25);

    const id = 'place_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

    const placement = {
      id,
      pageNumber: pageNumber || this.currentPageNumber,
      normX: initialX / pageW,
      normY: initialY / pageH,
      normW: targetW / pageW,
      normH: targetH / pageH,
      rotation: 0,
      aspectRatio: aspectRatio || (targetW / targetH),
      dataUrl,
      type
    };

    const el = this.createPlacementElement(placement);
    placement.element = el;
    this.container.appendChild(el);
    this.placements.push(placement);
    this.undoStack.push({ type: 'add', id });

    this.select(id);
    this.renderPlacements();
    return id;
  }

  createPlacementElement(p) {
    const el = document.createElement('div');
    el.className = 'signature-placement-box';
    el.id = p.id;
    el.innerHTML = `
      <div class="sig-rotate-handle" title="Rotate">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
      </div>
      <div class="sig-batch-pill" title="Apply to All Pages (PRO)">
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2.5">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <polyline points="9 14 11 16 15 11"></polyline>
        </svg>
        <span>Apply to All Pages</span>
      </div>
      <img src="${p.dataUrl}" alt="Signature" class="sig-img" draggable="false" />
      <div class="sig-delete-btn" title="Delete">
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <div class="sig-resize-handle" title="Resize"></div>
    `;

    // Click to select
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.sig-delete-btn')) {
        e.stopPropagation();
        this.delete(p.id);
        return;
      }
      if (e.target.closest('.sig-batch-pill')) {
        e.stopPropagation();
        if (this.onApplyToAllPages) {
          this.onApplyToAllPages(p.id);
        }
        return;
      }
      this.select(p.id);
    });

    const batchBtn = el.querySelector ? el.querySelector('.sig-batch-pill') : null;
    if (batchBtn) {
      batchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onApplyToAllPages) {
          this.onApplyToAllPages(p.id);
        }
      });
      batchBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
    }

    return el;
  }

  select(id) {
    this.activeId = id;
    this.container.querySelectorAll('.signature-placement-box').forEach(el => {
      el.classList.toggle('selected', el.id === id);
    });
  }

  deselectAll() {
    this.activeId = null;
    this.container.querySelectorAll('.signature-placement-box').forEach(el => {
      el.classList.remove('selected');
    });
  }

  delete(id) {
    const idx = this.placements.findIndex(p => p.id === id);
    if (idx !== -1) {
      const p = this.placements[idx];
      this.undoStack.push({
        type: 'delete',
        data: {
          id: p.id,
          pageNumber: p.pageNumber,
          normX: p.normX,
          normY: p.normY,
          normW: p.normW,
          normH: p.normH,
          rotation: p.rotation,
          aspectRatio: p.aspectRatio,
          dataUrl: p.dataUrl,
          type: p.type
        }
      });
      if (p.element && p.element.parentNode) {
        p.element.parentNode.removeChild(p.element);
      }
      this.placements.splice(idx, 1);
      if (this.activeId === id) this.activeId = null;
      if (this.onPlacementUpdated) this.onPlacementUpdated();
    }
  }

  clear() {
    for (const p of this.placements) {
      if (p.element && p.element.parentNode) {
        p.element.parentNode.removeChild(p.element);
      }
    }
    this.placements = [];
    this.activeId = null;
  }

  /**
   * Replicate a placement across all pages (1..totalPages)
   * @param {string} sourceId - ID of placement to replicate (or activeId)
   * @param {number} totalPages - Total pages in document
   * @returns {{ count: number, sourcePlacement: Object }}
   */
  replicateToAllPages(sourceId, totalPages) {
    const idToUse = sourceId || this.activeId;
    let source = this.placements.find(p => p.id === idToUse);

    // If no specific selection, fallback to the latest placement on current page
    if (!source) {
      const pagePlacements = this.placements.filter(p => p.pageNumber === this.currentPageNumber);
      if (pagePlacements.length > 0) {
        source = pagePlacements[pagePlacements.length - 1];
      }
    }

    // Fallback to any placement on document
    if (!source && this.placements.length > 0) {
      source = this.placements[this.placements.length - 1];
    }

    if (!source) {
      return { count: 0, updatedCount: 0, sourcePlacement: null, reason: 'no_source' };
    }

    if (!totalPages || totalPages <= 1) {
      return { count: 0, updatedCount: 0, sourcePlacement: source, reason: 'single_page' };
    }

    const sourcePage = source.pageNumber;
    let addedCount = 0;
    let updatedCount = 0;
    const createdIds = [];

    for (let page = 1; page <= totalPages; page++) {
      if (page === sourcePage) continue;

      // Check if this page already has a placement with the exact same dataUrl and type
      const existing = this.placements.find(p => p.pageNumber === page && p.type === source.type && p.dataUrl === source.dataUrl);
      if (existing) {
        // Update position to match source
        existing.normX = source.normX;
        existing.normY = source.normY;
        existing.normW = source.normW;
        existing.normH = source.normH;
        existing.rotation = source.rotation || 0;
        updatedCount++;
        continue;
      }

      const id = 'place_' + Date.now() + '_' + page + '_' + Math.floor(Math.random() * 1000);
      const newPlacement = {
        id,
        pageNumber: page,
        normX: source.normX,
        normY: source.normY,
        normW: source.normW,
        normH: source.normH,
        rotation: source.rotation || 0,
        aspectRatio: source.aspectRatio,
        dataUrl: source.dataUrl,
        type: source.type
      };

      const el = this.createPlacementElement(newPlacement);
      newPlacement.element = el;
      this.container.appendChild(el);
      this.placements.push(newPlacement);
      createdIds.push(id);
      addedCount++;
    }

    if (createdIds.length > 0) {
      this.undoStack.push({ type: 'batch', createdIds });
    }

    this.updateVisibility();
    this.renderPlacements();
    if (this.onPlacementUpdated) this.onPlacementUpdated();

    return { count: addedCount, updatedCount, sourcePlacement: source };
  }

  updateVisibility() {
    for (const p of this.placements) {
      if (p.element) {
        p.element.style.display = p.pageNumber === this.currentPageNumber ? 'block' : 'none';
      }
    }
    this.renderPlacements();
  }

  renderPlacements() {
    const pageW = this.container.clientWidth;
    const pageH = this.container.clientHeight;
    if (!pageW || !pageH) return;

    for (const p of this.placements) {
      if (p.element && p.pageNumber === this.currentPageNumber) {
        const px = p.normX * pageW;
        const py = p.normY * pageH;
        const pw = p.normW * pageW;
        const ph = p.normH * pageH;

        p.element.style.left = `${px}px`;
        p.element.style.top = `${py}px`;
        p.element.style.width = `${pw}px`;
        p.element.style.height = `${ph}px`;
        p.element.style.transform = `rotate(${p.rotation || 0}deg)`;

        const batchPill = p.element.querySelector('.sig-batch-pill');
        if (batchPill) {
          if (py < 45) {
            batchPill.style.top = 'auto';
            batchPill.style.bottom = '-36px';
          } else {
            batchPill.style.top = '-36px';
            batchPill.style.bottom = 'auto';
          }
        }
      }
    }
  }

  initInteractionHandlers() {
    let mode = null; // 'drag', 'resize', 'rotate'
    let startX = 0, startY = 0;
    let initialNormX = 0, initialNormY = 0, initialNormW = 0, initialNormH = 0;
    let initialRotation = 0;
    let activePlacement = null;
    let centerX = 0, centerY = 0;

    const onPointerDown = (e) => {
      const target = e.target;
      const box = target.closest('.signature-placement-box');
      if (!box) {
        if (!e.target.closest('#editor-toolbar') && !e.target.closest('.modal')) {
          this.deselectAll();
        }
        return;
      }

      const id = box.id;
      this.select(id);
      activePlacement = this.placements.find(p => p.id === id);
      if (!activePlacement) return;

      const pageW = this.container.clientWidth;
      const pageH = this.container.clientHeight;

      startX = e.clientX;
      startY = e.clientY;
      initialNormX = activePlacement.normX;
      initialNormY = activePlacement.normY;
      initialNormW = activePlacement.normW;
      initialNormH = activePlacement.normH;
      initialRotation = activePlacement.rotation || 0;

      if (target.closest('.sig-rotate-handle')) {
        mode = 'rotate';
        const rect = box.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      } else if (target.closest('.sig-resize-handle')) {
        mode = 'resize';
      } else if (!target.closest('.sig-delete-btn') && !target.closest('.sig-batch-pill')) {
        mode = 'drag';
      }

      if (mode) {
        e.preventDefault();
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      }
    };

    const onPointerMove = (e) => {
      if (!mode || !activePlacement) return;
      e.preventDefault();

      const pageW = this.container.clientWidth;
      const pageH = this.container.clientHeight;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (mode === 'drag') {
        const normDx = deltaX / pageW;
        const normDy = deltaY / pageH;
        let nx = initialNormX + normDx;
        let ny = initialNormY + normDy;

        // Alignment Snap Guides (C4)
        const elemCenterNormX = nx + activePlacement.normW / 2;
        const elemCenterNormY = ny + activePlacement.normH / 2;
        const SNAP_THRESHOLD = 0.018;

        let snappedX = false;
        let snappedY = false;

        // Center snap horizontal
        if (Math.abs(elemCenterNormX - 0.5) < SNAP_THRESHOLD) {
          nx = 0.5 - activePlacement.normW / 2;
          snappedX = true;
        } else if (Math.abs(nx - 0.05) < SNAP_THRESHOLD) {
          nx = 0.05;
          snappedX = true;
        } else if (Math.abs(nx + activePlacement.normW - 0.95) < SNAP_THRESHOLD) {
          nx = 0.95 - activePlacement.normW;
          snappedX = true;
        }

        // Center snap vertical
        if (Math.abs(elemCenterNormY - 0.5) < SNAP_THRESHOLD) {
          ny = 0.5 - activePlacement.normH / 2;
          snappedY = true;
        } else if (Math.abs(ny - 0.05) < SNAP_THRESHOLD) {
          ny = 0.05;
          snappedY = true;
        } else if (Math.abs(ny + activePlacement.normH - 0.95) < SNAP_THRESHOLD) {
          ny = 0.95 - activePlacement.normH;
          snappedY = true;
        }

        // Clamp inside page bounds
        activePlacement.normX = Math.max(0, Math.min(1 - activePlacement.normW, nx));
        activePlacement.normY = Math.max(0, Math.min(1 - activePlacement.normH, ny));

        this.updateSnapGuides(snappedX, snappedY);
      } else if (mode === 'resize') {
        const minW = (activePlacement.type === 'check' || activePlacement.type === 'cross') ? 18 : 45;
        const newW = Math.max(minW, initialNormW * pageW + deltaX);
        const newH = newW / (activePlacement.aspectRatio || 2);

        activePlacement.normW = Math.min(newW / pageW, 0.9);
        activePlacement.normH = Math.min(newH / pageH, 0.9);
      } else if (mode === 'rotate') {
        const curAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        // Initial angle is roughly -90 deg (top handle)
        activePlacement.rotation = Math.round(curAngle + 90);
      }

      this.renderPlacements();
    };

    const onPointerUp = () => {
      if (mode && activePlacement) {
        const hasChanged = activePlacement.normX !== initialNormX ||
                           activePlacement.normY !== initialNormY ||
                           activePlacement.normW !== initialNormW ||
                           activePlacement.normH !== initialNormH ||
                           activePlacement.rotation !== initialRotation;
        if (hasChanged) {
          this.undoStack.push({
            type: 'transform',
            id: activePlacement.id,
            oldState: {
              normX: initialNormX,
              normY: initialNormY,
              normW: initialNormW,
              normH: initialNormH,
              rotation: initialRotation
            },
            newState: {
              normX: activePlacement.normX,
              normY: activePlacement.normY,
              normW: activePlacement.normW,
              normH: activePlacement.normH,
              rotation: activePlacement.rotation
            }
          });
        }
      }
      this.hideSnapGuides();
      mode = null;
      activePlacement = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      if (this.onPlacementUpdated) this.onPlacementUpdated();
    };

    this.container.addEventListener('pointerdown', onPointerDown);
  }

  /**
   * Get all placements converted to export format with rendered dimensions
   */
  getExportPlacements() {
    const pageW = this.container.clientWidth;
    const pageH = this.container.clientHeight;

    return this.placements.map(p => ({
      pageNumber: p.pageNumber,
      x: p.normX * pageW,
      y: p.normY * pageH,
      width: p.normW * pageW,
      height: p.normH * pageH,
      rotation: p.rotation || 0,
      renderedWidth: pageW,
      renderedHeight: pageH,
      dataUrl: p.dataUrl
    }));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlacementManager;
}
