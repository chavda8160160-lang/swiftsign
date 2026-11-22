/**
 * PDF Handler for SwiftSign
 * Loads, renders, zooms, and navigates PDF documents using PDF.js
 */

class PdfHandler {
  constructor({ containerElement, onPageChanged, onLoaded, onPassword }) {
    this.container = containerElement;
    this.onPageChanged = onPageChanged;
    this.onLoaded = onLoaded;
    this.onPassword = onPassword;

    this.pdfDoc = null;
    this.originalBytes = null;
    this.currentPageNumber = 1;
    this.totalPages = 0;
    this.scale = 1.0;
    this.currentRenderTask = null;
    this.currentPassword = null;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }

  async loadFromBytes(arrayBuffer, password = null) {
    try {
      this.currentPassword = password;
      // Clone buffer so PDF.js worker transfer does not detach caller's buffer
      const dataCopy = arrayBuffer.slice ? arrayBuffer.slice(0) : new Uint8Array(arrayBuffer).slice().buffer;
      this.originalBytes = new Uint8Array(dataCopy);
      
      if (!window.pdfjsLib) {
        throw new Error('PDF rendering library is not loaded');
      }

      // Configure worker if needed
      if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = './vendor/pdf.worker.min.mjs';
      }

      const params = {
        data: dataCopy,
        cMapPacked: true,
        enableXfa: false
      };
      if (password) {
        params.password = password;
        this.currentPassword = password;
      }

      const loadingTask = window.pdfjsLib.getDocument(params);

      // Handle password protected PDFs seamlessly
      loadingTask.onPassword = (updatePassword, reason) => {
        // reason: 1 = NEED_PASSWORD, 2 = INCORRECT_PASSWORD
        if (this.onPassword) {
          this.onPassword((pwd) => {
            if (typeof pwd === 'string') {
              this.currentPassword = pwd;
            }
            updatePassword(pwd);
          }, reason);
        } else {
          updatePassword(new Error('Password required'));
        }
      };

      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      this.currentPageNumber = 1;

      // Automatically default to responsive fit on mobile devices
      if (window.innerWidth <= 768) {
        this.scale = 'fit';
      }

      if (this.onLoaded) {
        this.onLoaded({
          totalPages: this.totalPages,
          currentPage: this.currentPageNumber
        });
      }

      await this.renderCurrentPage();
    } catch (err) {
      console.error('PdfHandler.loadFromBytes error:', err);
      throw err;
    }
  }

  async renderCurrentPage() {
    if (!this.pdfDoc) return;

    if (this.currentRenderTask) {
      try {
        this.currentRenderTask.cancel();
      } catch (e) {}
    }

    try {
      const page = await this.pdfDoc.getPage(this.currentPageNumber);
      
      // Base 1.0 unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      
      // Calculate responsive display scale
      let finalScale = this.scale;
      if (this.scale === 'fit' || typeof this.scale !== 'number') {
        const wrapper = this.container.parentElement || document.getElementById('stage-wrapper');
        const availableWidth = wrapper ? (wrapper.clientWidth - 32) : (window.innerWidth - 32);
        finalScale = Math.min(Math.max(availableWidth / unscaledViewport.width, 0.3), 3.0);
      }

      const dpr = window.devicePixelRatio || 1;

      // Crisp HiDPI rendering: scale the rendering viewport by DPR
      const displayViewport = page.getViewport({ scale: finalScale });
      const renderViewport = page.getViewport({ scale: finalScale * dpr });

      const cssWidth = Math.floor(displayViewport.width);
      const cssHeight = Math.floor(displayViewport.height);

      // Physical pixel backing store
      this.canvas.width = Math.floor(renderViewport.width);
      this.canvas.height = Math.floor(renderViewport.height);

      // CSS display size (logical pixels)
      this.canvas.style.width = `${cssWidth}px`;
      this.canvas.style.height = `${cssHeight}px`;

      // Size container to match canvas exactly
      this.container.style.width = `${cssWidth}px`;
      this.container.style.height = `${cssHeight}px`;

      const renderContext = {
        canvasContext: this.ctx,
        viewport: renderViewport,
        annotationMode: (window.pdfjsLib && typeof window.pdfjsLib.AnnotationMode !== 'undefined')
          ? window.pdfjsLib.AnnotationMode.DISABLE
          : 0
      };

      this.currentRenderTask = page.render(renderContext);
      await this.currentRenderTask.promise;
      this.currentRenderTask = null;

      if (this.onPageChanged) {
        this.onPageChanged({
          currentPage: this.currentPageNumber,
          totalPages: this.totalPages,
          width: cssWidth,
          height: cssHeight,
          pdfWidth: unscaledViewport.width,
          pdfHeight: unscaledViewport.height
        });
      }
    } catch (err) {
      if (err && err.name === 'RenderingCancelledException') {
        return; // Page flip cancellation is normal
      }
      console.error('PdfHandler.renderCurrentPage error:', err);
      throw err;
    }
  }

  async goToPage(pageNum) {
    if (pageNum < 1 || pageNum > this.totalPages || pageNum === this.currentPageNumber) {
      return;
    }
    this.currentPageNumber = pageNum;
    await this.renderCurrentPage();
  }

  async nextPage() {
    if (this.currentPageNumber < this.totalPages) {
      await this.goToPage(this.currentPageNumber + 1);
    }
  }

  async prevPage() {
    if (this.currentPageNumber > 1) {
      await this.goToPage(this.currentPageNumber - 1);
    }
  }

  async zoomIn() {
    const current = typeof this.scale === 'number' ? this.scale : 1.0;
    this.scale = Math.min(current + 0.25, 3.0);
    await this.renderCurrentPage();
  }

  async zoomOut() {
    const current = typeof this.scale === 'number' ? this.scale : 1.0;
    this.scale = Math.max(current - 0.25, 0.4);
    await this.renderCurrentPage();
  }

  async fitWidth() {
    this.scale = 'fit';
    await this.renderCurrentPage();
  }

  getPageCount() {
    return this.totalPages;
  }

  get totalPageCount() {
    return this.totalPages;
  }

  getCurrentPageNumber() {
    return this.currentPageNumber;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PdfHandler;
}
