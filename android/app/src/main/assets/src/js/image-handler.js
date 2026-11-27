/**
 * Image Handler for SwiftSign
 * Loads and renders images (JPG, PNG) for signing with zero quality loss
 */

class ImageHandler {
  constructor({ containerElement, onLoaded }) {
    this.container = containerElement;
    this.onLoaded = onLoaded;

    this.imgElement = document.createElement('img');
    this.imgElement.className = 'document-image-canvas';
    this.imgElement.draggable = false;
    this.container.appendChild(this.imgElement);

    this.originalFile = null;
    this.originalUrl = null;
    this.scale = 1.0;
  }

  async loadFromFile(file) {
    this.originalFile = file;
    const url = URL.createObjectURL(file);
    await this.loadFromUrl(url);
  }

  async loadFromUrl(url) {
    this.originalUrl = url;
    return new Promise((resolve, reject) => {
      this.imgElement.onload = () => {
        this.updateDimensions();
        if (this.onLoaded) {
          this.onLoaded({
            naturalWidth: this.imgElement.naturalWidth,
            naturalHeight: this.imgElement.naturalHeight,
            width: this.imgElement.clientWidth,
            height: this.imgElement.clientHeight
          });
        }
        resolve();
      };
      this.imgElement.onerror = () => {
        reject(new Error('Could not open image. If this is an iPhone HEIC photo, please save or share it as JPG/PNG or PDF.'));
      };
      this.imgElement.src = url;
    });
  }

  updateDimensions() {
    const parentW = this.container.parentElement.clientWidth - 32;
    const natW = this.imgElement.naturalWidth || 800;
    const natH = this.imgElement.naturalHeight || 1000;

    let targetW = parentW;
    let targetH = (natH / natW) * targetW;

    if (this.scale !== 'fit' && typeof this.scale === 'number') {
      targetW = targetW * this.scale;
      targetH = targetH * this.scale;
    }

    this.imgElement.style.width = `${Math.floor(targetW)}px`;
    this.imgElement.style.height = `${Math.floor(targetH)}px`;

    this.container.style.width = `${Math.floor(targetW)}px`;
    this.container.style.height = `${Math.floor(targetH)}px`;
  }

  async zoomIn() {
    this.scale = (typeof this.scale === 'number' ? this.scale : 1.0) + 0.2;
    this.updateDimensions();
  }

  async zoomOut() {
    this.scale = Math.max((typeof this.scale === 'number' ? this.scale : 1.0) - 0.2, 0.4);
    this.updateDimensions();
  }

  async fitWidth() {
    this.scale = 'fit';
    this.updateDimensions();
  }

  getCurrentRenderedDimensions() {
    return {
      width: this.imgElement.clientWidth,
      height: this.imgElement.clientHeight
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageHandler;
}
