/**
 * SwiftSign Main Application Controller
 */

class AppController {
  constructor() {
    this.i18n = new I18n('en');
    this.currentDocType = null; // 'pdf' or 'image'
    this.originalPdfBytes = null;
    this.originalImage = null;
    this.currentFileName = 'document';
    this.exportResult = null;

    this.initElements();
    this.initSubsystems();
    this.bindEvents();
    this.renderSavedSignatures();
    this.setupInboundReceiver();
  }

  initElements() {
    // Screens
    this.welcomeScreen = document.getElementById('welcome-screen');
    this.editorScreen = document.getElementById('editor-screen');

    // Dropzone & Inputs
    this.dropzone = document.getElementById('dropzone');
    this.fileInput = document.getElementById('file-input');
    this.btnTrySample = document.getElementById('btn-try-sample');

    // Stage
    this.stageWrapper = document.getElementById('stage-wrapper');
    this.stageContainer = document.getElementById('stage-container');

    // Toolbar Controls
    this.pageIndicator = document.getElementById('page-indicator');
    this.btnPrevPage = document.getElementById('btn-prev-page');
    this.btnNextPage = document.getElementById('btn-next-page');
    this.btnZoomIn = document.getElementById('btn-zoom-in');
    this.btnZoomOut = document.getElementById('btn-zoom-out');
    this.btnFitWidth = document.getElementById('btn-fit-width');
    this.btnResetDoc = document.getElementById('btn-reset-doc');
    this.btnUndoPlacement = document.getElementById('btn-undo-placement');

    // Bottom Actions
    this.btnAddSig = document.getElementById('btn-add-sig');
    this.btnFinishExport = document.getElementById('btn-finish-export');

    // Signature Modal
    this.sigModal = document.getElementById('signature-modal');
    this.sigCanvasEl = document.getElementById('sig-canvas');
    this.btnCloseSigModal = document.getElementById('btn-close-sig-modal');
    this.btnUndoSig = document.getElementById('btn-undo-sig');
    this.btnClearSig = document.getElementById('btn-clear-sig');
    this.btnApplySig = document.getElementById('btn-apply-sig');
    this.btnSaveSigToDevice = document.getElementById('btn-save-sig-device');
    this.savedSigsContainer = document.getElementById('saved-sigs-list');

    // Signature Mode & Paper Scanner (PRO)
    this.tabSigDraw = document.getElementById('tab-sig-draw');
    this.tabSigScan = document.getElementById('tab-sig-scan');
    this.sigDrawSection = document.getElementById('sig-draw-section');
    this.sigScanSection = document.getElementById('sig-scan-section');
    this.scannerDropzone = document.getElementById('scanner-dropzone');
    this.scannerFileInput = document.getElementById('scanner-file-input');
    this.scannerResultArea = document.getElementById('scanner-result-area');
    this.scannerPreviewCanvas = document.getElementById('scanner-preview-canvas');
    this.btnRetakeScan = document.getElementById('btn-retake-scan');
    this.scannerThresholdSlider = document.getElementById('scanner-threshold-slider');
    this.sliderThresholdLabel = document.getElementById('slider-threshold-label');
    this.scannerInkColorBtns = document.querySelectorAll('#scanner-ink-color-group button');
    this.currentSigMode = 'draw';
    this.scannedImageSource = null;
    this.scannedResult = null;
    this.scannerThreshold = 190;
    this.scannerColor = 'original';

    // Export Modal
    this.exportModal = document.getElementById('export-modal');
    this.btnCloseExportModal = document.getElementById('btn-close-export-modal');
    this.exportMetaText = document.getElementById('export-meta-text');
    this.btnDownloadExport = document.getElementById('btn-download-export');
    this.btnDownloadLabel = document.getElementById('btn-download-label');
    this.btnShareExport = document.getElementById('btn-share-export');
    this.btnDoneExport = document.getElementById('btn-done-export');

    // Quick Annotate Toolbar buttons
    this.btnQuickSig = document.getElementById('btn-quick-sig');
    this.btnQuickDate = document.getElementById('btn-quick-date');
    this.btnQuickText = document.getElementById('btn-quick-text');
    this.btnQuickBatchSign = document.getElementById('btn-quick-batch-sign');
    this.btnNavBatchSign = document.getElementById('btn-nav-batch-sign');

    // Date Modal
    this.dateModal = document.getElementById('date-modal');
    this.btnCloseDateModal = document.getElementById('btn-close-date-modal');
    this.dateChoiceBtns = document.querySelectorAll('.date-choice-btn');
    this.btnPlaceDateStamp = document.getElementById('btn-place-date-stamp');
    this.dateColorDots = document.querySelectorAll('.date-color-dot');
    this.datePickerInput = document.getElementById('date-picker-input');
    this.btnDateToday = document.getElementById('btn-date-today');
    this.selectedDateFormat = 'medium';
    this.selectedDateBold = false;
    this.selectedDateColor = '#0f172a';

    // Text Modal
    this.textModal = document.getElementById('text-modal');
    this.btnCloseTextModal = document.getElementById('btn-close-text-modal');
    this.textStampInput = document.getElementById('text-stamp-input');
    this.btnPlaceTextStamp = document.getElementById('btn-place-text-stamp');
    this.templateChips = document.querySelectorAll('.template-chip');
    this.textColorDots = document.querySelectorAll('.text-color-dot');
    this.selectedTextBold = false;
    this.selectedTextColor = '#0f172a';

    // Pricing Modal
    this.pricingModal = document.getElementById('pricing-modal');
    this.btnOpenPricing = document.getElementById('btn-open-pricing');
    this.btnClosePricingModal = document.getElementById('btn-close-pricing-modal');
    this.btnChooseFree = document.getElementById('btn-choose-free');
    this.btnChooseProMonthly = document.getElementById('btn-choose-pro-monthly');
    this.btnChooseProAnnual = document.getElementById('btn-choose-pro-annual');
    this.btnRestorePurchases = document.getElementById('btn-restore-purchases');

    // Navigation & Hamburger Drawer
    this.btnOpenMenu = document.getElementById('btn-open-menu');
    this.navDrawer = document.getElementById('nav-drawer');
    this.navDrawerOverlay = document.getElementById('nav-drawer-overlay');
    this.btnCloseNavDrawer = document.getElementById('btn-close-nav-drawer');
    this.webProLockedModal = document.getElementById('web-pro-locked-modal');
    this.btnCloseWebProLocked = document.getElementById('btn-close-web-pro-locked');

    // Password Protected PDF Modal
    this.passwordModal = document.getElementById('password-modal');
    this.btnClosePasswordModal = document.getElementById('btn-close-password-modal');
    this.pdfPasswordInput = document.getElementById('pdf-password-input');
    this.btnTogglePasswordVisibility = document.getElementById('btn-toggle-password-visibility');
    this.pdfPasswordError = document.getElementById('pdf-password-error');
    this.btnCancelPassword = document.getElementById('btn-cancel-password');
    this.btnSubmitPassword = document.getElementById('btn-submit-password');
    this.pdfPasswordCallback = null;

    // Quick Tool: Company Stamp
    this.btnQuickCompanyStamp = document.getElementById('btn-quick-company-stamp');
    this.companyStampModal = document.getElementById('company-stamp-modal');
    this.btnCloseCompanyStampModal = document.getElementById('btn-close-company-stamp-modal');
    this.stampPreviewCanvas = document.getElementById('company-stamp-preview');
    this.stampShapeBtns = document.querySelectorAll('#stamp-shape-group .segmented-toggle-btn');
    this.stampCompanyInput = document.getElementById('stamp-company-input');
    this.stampDesignationInput = document.getElementById('stamp-designation-input');
    this.stampSubtextInput = document.getElementById('stamp-subtext-input');
    this.stampRegInput = document.getElementById('stamp-reg-input');
    this.stampIncludeDate = document.getElementById('stamp-include-date');
    this.stampSavePreset = document.getElementById('stamp-save-preset');
    this.stampColorDots = document.querySelectorAll('.stamp-color-dot');
    this.stampFinishBtns = document.querySelectorAll('#stamp-finish-group .segmented-toggle-btn');
    this.stampBorderBtns = document.querySelectorAll('#stamp-border-group .segmented-toggle-btn');
    this.stampTextSizeBtns = document.querySelectorAll('#stamp-textsize-group .segmented-toggle-btn');
    this.stampTemplateBtns = document.querySelectorAll('.stamp-template-btn');
    this.btnExportStandalonePng = document.getElementById('btn-export-standalone-png');
    this.btnShareStandaloneStamp = document.getElementById('btn-share-standalone-stamp');
    this.btnSaveStampVault = document.getElementById('btn-save-stamp-vault');
    this.stampPlaceOnDocContainer = document.getElementById('stamp-place-on-doc-container');
    this.stampPlaceOnDocTopContainer = document.getElementById('stamp-place-on-doc-top-container');
    this.btnPlaceCompanyStamp = document.getElementById('btn-place-company-stamp');
    this.btnPlaceCompanyStampTop = document.getElementById('btn-place-company-stamp-top');
    this.selectedStampShape = 'round';
    this.selectedStampColor = '#1d4ed8';
    this.selectedStampFinish = 'distressed';
    this.selectedStampBorder = 'double';
    this.selectedStampTextSize = 'md';
    this.isStampModalStandalone = false;
    this.autoOpenStampOnLoad = false;

    // Home Action Cards
    this.cardCreateStamp = document.getElementById('card-create-stamp');
    this.cardSignPdf = document.getElementById('card-sign-pdf');
    this.cardStampPdf = document.getElementById('card-stamp-pdf');
    this.cardImageToPdf = document.getElementById('card-image-to-pdf');
    this.cardSavedSignatures = document.getElementById('card-saved-signatures');
    this.cardSavedStamps = document.getElementById('card-saved-stamps');

    // Saved Stamps Modal
    this.savedStampsModal = document.getElementById('saved-stamps-modal');
    this.btnCloseSavedStampsModal = document.getElementById('btn-close-saved-stamps-modal');
    this.savedStampsGrid = document.getElementById('saved-stamps-grid');
    this.savedStampsEmptyState = document.getElementById('saved-stamps-empty-state');
    this.savedStampsCountBadge = document.getElementById('saved-stamps-count-badge');
    this.btnCreateStampFromSaved = document.getElementById('btn-create-stamp-from-saved');

    // Saved Signatures Modal
    this.savedSignaturesModal = document.getElementById('saved-signatures-modal');
    this.btnCloseSavedSigsModal = document.getElementById('btn-close-saved-sigs-modal');
    this.savedSigsGrid = document.getElementById('saved-sigs-grid');
    this.savedSigsEmptyState = document.getElementById('saved-sigs-empty-state');
    this.savedSigsCountBadge = document.getElementById('saved-sigs-count-badge');
    this.btnDrawSigFromSaved = document.getElementById('btn-draw-sig-from-saved');

    // Image-to-PDF Modal
    this.imageToPdfModal = document.getElementById('image-to-pdf-modal');
    this.btnCloseImgToPdfModal = document.getElementById('btn-close-img-to-pdf-modal');
    this.imgToPdfCountBadge = document.getElementById('img-to-pdf-count-badge');
    this.imgToPdfDropzone = document.getElementById('img-to-pdf-dropzone');
    this.imgToPdfFileInput = document.getElementById('img-to-pdf-file-input');
    this.imgToPdfList = document.getElementById('img-to-pdf-list');
    this.imgToPdfPageSize = document.getElementById('img-to-pdf-page-size');
    this.imgToPdfOrientation = document.getElementById('img-to-pdf-orientation');
    this.btnImgToPdfOpenSign = document.getElementById('btn-img-to-pdf-open-sign');
    this.btnImgToPdfDownload = document.getElementById('btn-img-to-pdf-download');
    this.btnImgToPdfShare = document.getElementById('btn-img-to-pdf-share');
    this.imgToPdfImages = [];

    // Settings, Profiles & Privacy Modal (Phase 5)
    this.btnOpenSettings = document.getElementById('btn-open-settings');
    this.settingsModal = document.getElementById('settings-modal');
    this.btnCloseSettingsModal = document.getElementById('btn-close-settings-modal');
    this.settingsProfilesList = document.getElementById('settings-profiles-list');
    this.btnAddNewProfile = document.getElementById('btn-add-new-profile');
    this.settingsRecentDocsList = document.getElementById('settings-recent-docs-list');
    this.btnClearRecentDocs = document.getElementById('btn-clear-recent-docs');
    this.btnDeleteAllData = document.getElementById('btn-delete-all-data');

    // Stamp Profiles Selector
    this.stampProfileSelect = document.getElementById('stamp-profile-select');
    this.btnSaveAsProfile = document.getElementById('btn-save-as-profile');
    this.btnAddProfileStamp = document.getElementById('btn-add-profile-stamp');

    // Lang
    this.btnToggleLang = document.getElementById('btn-toggle-lang');

    // Toast
    this.toastContainer = document.getElementById('toast-container');
  }

  initSubsystems() {
    // Signature drawing canvas
    this.canvasSignature = new CanvasSignature(this.sigCanvasEl, {
      color: '#0f172a',
      thickness: 3.5
    });

    // Placement manager
    this.placementManager = new PlacementManager({
      containerElement: this.stageContainer,
      onPlacementUpdated: () => {
        this.updateUndoButtonState();
        this.checkEmptyEditorHint();
      },
      onApplyToAllPages: (id) => this.handleBatchSignAllPages(id)
    });

    // PDF Handler
    this.pdfHandler = new PdfHandler({
      containerElement: this.stageContainer,
      onPageChanged: (info) => {
        this.updatePageControls(info.currentPage, info.totalPages);
        this.placementManager.setCurrentPage(info.currentPage);
      },
      onLoaded: (info) => {
        this.updatePageControls(info.currentPage, info.totalPages);
        this.placementManager.setCurrentPage(1);
      },
      onPassword: (updatePasswordCallback, reason) => {
        this.handlePdfPasswordRequired(updatePasswordCallback, reason);
      }
    });

    // Image Handler
    this.imageHandler = new ImageHandler({
      containerElement: this.stageContainer,
      onLoaded: () => {
        this.updatePageControls(1, 1);
        this.placementManager.setCurrentPage(1);
      }
    });
  }

  bindEvents() {
    // 6 Home Screen Action Cards
    if (this.cardCreateStamp) {
      this.cardCreateStamp.addEventListener('click', () => {
        this.openCompanyStampModal(true);
      });
    }

    if (this.cardSignPdf) {
      this.cardSignPdf.addEventListener('click', () => {
        this.fileInput.accept = 'application/pdf';
        this.fileInput.click();
      });
    }

    if (this.cardStampPdf) {
      this.cardStampPdf.addEventListener('click', () => {
        this.autoOpenStampOnLoad = true;
        this.fileInput.accept = 'application/pdf';
        this.fileInput.click();
      });
    }

    if (this.cardImageToPdf) {
      this.cardImageToPdf.addEventListener('click', () => {
        this.openImageToPdfModal();
      });
    }

    if (this.cardSavedSignatures) {
      this.cardSavedSignatures.addEventListener('click', () => {
        this.openSavedSignaturesModal();
      });
    }

    if (this.cardSavedStamps) {
      this.cardSavedStamps.addEventListener('click', () => {
        this.openSavedStampsModal();
      });
    }

    // Saved Stamps Modal Events
    if (this.btnCloseSavedStampsModal) {
      this.btnCloseSavedStampsModal.addEventListener('click', () => {
        if (this.savedStampsModal) this.savedStampsModal.classList.remove('active');
      });
    }
    if (this.savedStampsModal) {
      this.savedStampsModal.addEventListener('click', (e) => {
        if (e.target === this.savedStampsModal) this.savedStampsModal.classList.remove('active');
      });
    }
    if (this.btnCreateStampFromSaved) {
      this.btnCreateStampFromSaved.addEventListener('click', () => {
        if (this.savedStampsModal) this.savedStampsModal.classList.remove('active');
        this.openCompanyStampModal(true);
      });
    }

    // Saved Signatures Modal Events
    if (this.btnCloseSavedSigsModal) {
      this.btnCloseSavedSigsModal.addEventListener('click', () => {
        if (this.savedSignaturesModal) this.savedSignaturesModal.classList.remove('active');
      });
    }
    if (this.savedSignaturesModal) {
      this.savedSignaturesModal.addEventListener('click', (e) => {
        if (e.target === this.savedSignaturesModal) this.savedSignaturesModal.classList.remove('active');
      });
    }
    if (this.btnDrawSigFromSaved) {
      this.btnDrawSigFromSaved.addEventListener('click', () => {
        if (this.savedSignaturesModal) this.savedSignaturesModal.classList.remove('active');
        this.openSigModal();
      });
    }

    // File Selection
    this.dropzone.addEventListener('click', () => {
      this.fileInput.accept = 'application/pdf,image/png,image/jpeg,image/webp';
      this.fileInput.multiple = true;
      this.fileInput.click();
    });
    this.fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 1) {
        this.loadFile(files[0]);
      } else if (files.length > 1) {
        const allImages = files.every(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name));
        if (allImages) {
          this.openImageToPdfModal();
          this.addImageToPdfFiles(files);
        } else {
          this.loadFile(files[0]);
        }
      }
    });

    // Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropzone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(eventName => {
      this.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        this.dropzone.classList.remove('dragover');
      });
    });
    this.dropzone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length === 1) {
        this.loadFile(files[0]);
      } else if (files.length > 1) {
        const allImages = files.every(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name));
        if (allImages) {
          this.openImageToPdfModal();
          this.addImageToPdfFiles(files);
        } else {
          this.loadFile(files[0]);
        }
      }
    });

    // Try Sample Document
    this.btnTrySample.addEventListener('click', async () => {
      try {
        this.showToast('Loading sample document...');
        const res = await fetch('./sample-document.pdf');
        if (!res.ok) throw new Error('Sample not found');
        const buffer = await res.arrayBuffer();
        this.currentFileName = 'sample-document.pdf';
        await this.loadPdfBuffer(buffer);
      } catch (err) {
        this.showToast('Could not load sample PDF: ' + err.message);
      }
    });

    // Navigation
    this.btnPrevPage.addEventListener('click', () => {
      if (this.currentDocType === 'pdf') this.pdfHandler.prevPage();
    });
    this.btnNextPage.addEventListener('click', () => {
      if (this.currentDocType === 'pdf') this.pdfHandler.nextPage();
    });
    this.btnZoomIn.addEventListener('click', () => {
      if (this.currentDocType === 'pdf') this.pdfHandler.zoomIn();
      else if (this.currentDocType === 'image') this.imageHandler.zoomIn();
      setTimeout(() => this.placementManager.renderPlacements(), 50);
    });
    this.btnZoomOut.addEventListener('click', () => {
      if (this.currentDocType === 'pdf') this.pdfHandler.zoomOut();
      else if (this.currentDocType === 'image') this.imageHandler.zoomOut();
      setTimeout(() => this.placementManager.renderPlacements(), 50);
    });
    this.btnFitWidth.addEventListener('click', () => {
      if (this.currentDocType === 'pdf') this.pdfHandler.fitWidth();
      else if (this.currentDocType === 'image') this.imageHandler.fitWidth();
      setTimeout(() => this.placementManager.renderPlacements(), 50);
    });
    this.btnResetDoc.addEventListener('click', () => {
      if (confirm('Close this document and return to home?')) {
        this.resetToWelcome();
      }
    });

    // Undo Placement button
    if (this.btnUndoPlacement) {
      this.btnUndoPlacement.addEventListener('click', () => {
        if (this.placementManager && this.placementManager.canUndo()) {
          this.placementManager.undo();
          this.showToast('Undone');
        } else {
          this.showToast('Nothing to undo');
        }
      });
    }

    // Global keyboard shortcut Ctrl+Z / Cmd+Z for undoing placement
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;
        if (this.editorScreen && this.editorScreen.classList.contains('active')) {
          e.preventDefault();
          if (this.placementManager && this.placementManager.canUndo()) {
            this.placementManager.undo();
            this.showToast('Undone');
          } else {
            this.showToast('Nothing to undo');
          }
        }
      }
    });

    // Signature Modal Triggers
    this.btnAddSig.addEventListener('click', () => this.openSigModal());
    this.btnCloseSigModal.addEventListener('click', () => this.closeSigModal());
    this.sigModal.addEventListener('click', (e) => {
      if (e.target === this.sigModal) this.closeSigModal();
    });

    // Canvas tools
    this.btnUndoSig.addEventListener('click', () => this.canvasSignature.undo());
    this.btnClearSig.addEventListener('click', () => this.canvasSignature.clear());

    // Color pickers
    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const color = dot.getAttribute('data-color');
        this.canvasSignature.setColor(color);
      });
    });

    // Thickness pills
    document.querySelectorAll('.thickness-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.thickness-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const px = parseFloat(pill.getAttribute('data-thickness'));
        this.canvasSignature.setThickness(px);
      });
    });

    // Save & Apply Signature
    this.btnSaveSigToDevice.addEventListener('click', () => {
      if (this.currentSigMode === 'scan') {
        if (!this.scannedResult) {
          this.showToast('Please take or upload a photo of your paper signature first');
          return;
        }
        const quota = StorageManager.canSaveNewSignature();
        if (!quota.allowed) {
          this.showPaywall('Free tier includes 1 saved signature. Upgrade to Pro Pass for unlimited signatures.');
          return;
        }
        const res = StorageManager.saveSignature({
          dataUrl: this.scannedResult.dataUrl,
          width: this.scannedResult.width,
          height: this.scannedResult.height,
          aspectRatio: this.scannedResult.aspectRatio
        });
        if (res.success) {
          this.renderSavedSignatures();
          this.showToast('Paper signature saved to device!');
        }
        return;
      }

      if (this.canvasSignature.isEmpty()) {
        this.showToast('Please draw your signature first');
        return;
      }

      const quota = StorageManager.canSaveNewSignature();
      if (!quota.allowed) {
        this.showPaywall('Free tier includes 1 saved signature. Upgrade to Pro Pass for unlimited signatures.');
        return;
      }

      const crop = this.canvasSignature.toCroppedDataURL();
      if (crop) {
        const res = StorageManager.saveSignature({
          dataUrl: crop.dataUrl,
          width: crop.width,
          height: crop.height,
          aspectRatio: crop.aspectRatio
        });
        if (res.success) {
          this.renderSavedSignatures();
          this.showToast('Signature saved to device!');
        }
      }
    });

    this.btnApplySig.addEventListener('click', () => {
      if (this.currentSigMode === 'scan') {
        if (!this.scannedResult) {
          this.showToast('Please take or upload a photo of your paper signature first');
          return;
        }
        this.placementManager.addSignature({
          dataUrl: this.scannedResult.dataUrl,
          width: this.scannedResult.width,
          height: this.scannedResult.height,
          aspectRatio: this.scannedResult.aspectRatio,
          pageNumber: this.pdfHandler.currentPageNumber
        });
        this.closeSigModal();
        this.showToast('Paper signature placed! Drag or resize anywhere.');
        return;
      }

      if (this.canvasSignature.isEmpty()) {
        this.showToast('Please draw your signature first');
        return;
      }
      const crop = this.canvasSignature.toCroppedDataURL();
      if (crop) {
        this.placementManager.addSignature({
          dataUrl: crop.dataUrl,
          width: crop.width,
          height: crop.height,
          aspectRatio: crop.aspectRatio,
          pageNumber: this.pdfHandler.currentPageNumber
        });
        this.closeSigModal();
        this.showToast('Signature placed! Drag or resize anywhere.');
      }
    });

    // Paper Scanner Tab Mode Switch (Pro Gated)
    if (this.tabSigDraw) {
      this.tabSigDraw.addEventListener('click', () => this.switchSigMode('draw'));
    }
    if (this.tabSigScan) {
      this.tabSigScan.addEventListener('click', () => {
        if (!StorageManager.isPro()) {
          this.showPaywall('Paper Signature Scanner is a Pro Pass feature.');
          return;
        }
        this.switchSigMode('scan');
      });
    }

    // Scanner file input & dropzone
    if (this.scannerDropzone && this.scannerFileInput) {
      this.scannerDropzone.addEventListener('click', () => this.scannerFileInput.click());

      this.scannerFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          await this.processScannedFile(file);
        }
        this.scannerFileInput.value = '';
      });

      this.scannerDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.scannerDropzone.classList.add('dragover');
      });
      this.scannerDropzone.addEventListener('dragleave', () => {
        this.scannerDropzone.classList.remove('dragover');
      });
      this.scannerDropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        this.scannerDropzone.classList.remove('dragover');
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
          await this.processScannedFile(file);
        }
      });
    }

    if (this.btnRetakeScan) {
      this.btnRetakeScan.addEventListener('click', () => {
        this.scannedImageSource = null;
        this.scannedResult = null;
        if (this.scannerResultArea) this.scannerResultArea.style.display = 'none';
        if (this.scannerDropzone) this.scannerDropzone.style.display = 'flex';
      });
    }

    if (this.scannerThresholdSlider) {
      this.scannerThresholdSlider.addEventListener('input', (e) => {
        this.scannerThreshold = parseInt(e.target.value, 10) || 190;
        let label = 'Standard';
        if (this.scannerThreshold < 160) label = 'Light Paper';
        else if (this.scannerThreshold > 210) label = 'Darker / Shadows';
        if (this.sliderThresholdLabel) this.sliderThresholdLabel.textContent = label;
        this.runScannerExtraction();
      });
    }

    this.scannerInkColorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.scannerInkColorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.scannerColor = btn.getAttribute('data-color') || 'original';
        this.runScannerExtraction();
      });
    });

    // Quick Tool: Signature
    if (this.btnQuickSig) {
      this.btnQuickSig.addEventListener('click', () => this.openSigModal());
    }

    // Quick Tool: 1-Tap Date Stamp
    if (this.btnQuickDate) {
      this.btnQuickDate.addEventListener('click', () => {
        if (this.datePickerInput && !this.datePickerInput.value) {
          this.datePickerInput.value = this.getFormattedToday();
        }
        this.updateDateModalPreviews();
        this.dateModal.classList.add('active');
      });
    }
    if (this.btnCloseDateModal) {
      this.btnCloseDateModal.addEventListener('click', () => this.dateModal.classList.remove('active'));
    }
    if (this.dateModal) {
      this.dateModal.addEventListener('click', (e) => {
        if (e.target === this.dateModal) this.dateModal.classList.remove('active');
      });
    }

    // Change Date via input picker
    if (this.datePickerInput) {
      const onDateChange = () => this.updateDateModalPreviews();
      this.datePickerInput.addEventListener('input', onDateChange);
      this.datePickerInput.addEventListener('change', onDateChange);
    }

    // Reset to Today button
    if (this.btnDateToday) {
      this.btnDateToday.addEventListener('click', () => {
        if (this.datePickerInput) {
          this.datePickerInput.value = this.getFormattedToday();
          this.updateDateModalPreviews();
        }
      });
    }

    // Date format selection
    this.dateChoiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dateChoiceBtns.forEach(b => {
          b.classList.remove('active');
          b.style.borderColor = 'var(--slate-200)';
          b.style.background = '#ffffff';
        });
        btn.classList.add('active');
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'var(--primary-light)';
        this.selectedDateFormat = btn.getAttribute('data-format') || 'medium';
      });
    });

    // Date style toggle (Regular vs Bold)
    document.querySelectorAll('#date-style-group .segmented-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#date-style-group .segmented-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDateBold = btn.getAttribute('data-bold') === 'true';
      });
    });

    // Date ink color picker
    this.dateColorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.dateColorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.selectedDateColor = dot.getAttribute('data-color') || '#0f172a';
      });
    });

    // Place Date Stamp button
    if (this.btnPlaceDateStamp) {
      this.btnPlaceDateStamp.addEventListener('click', () => {
        const chosenDate = this.getSelectedDate();
        const stamp = StampGenerator.createDateStamp({
          date: chosenDate,
          format: this.selectedDateFormat,
          color: this.selectedDateColor,
          fontSize: 22,
          isBold: this.selectedDateBold
        });
        this.placementManager.addPlacement({
          ...stamp,
          pageNumber: this.pdfHandler.currentPageNumber
        });
        this.dateModal.classList.remove('active');
        this.showToast('Date stamped! Drag to position.');
      });
    }

    // Quick Tool: Text / Name
    if (this.btnQuickText) {
      this.btnQuickText.addEventListener('click', () => {
        if (this.textStampInput) {
          this.textStampInput.value = '';
          setTimeout(() => this.textStampInput.focus(), 100);
        }
        this.textModal.classList.add('active');
      });
    }
    if (this.btnCloseTextModal) {
      this.btnCloseTextModal.addEventListener('click', () => this.textModal.classList.remove('active'));
    }
    if (this.textModal) {
      this.textModal.addEventListener('click', (e) => {
        if (e.target === this.textModal) this.textModal.classList.remove('active');
      });
    }
    this.templateChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const txt = chip.getAttribute('data-text');
        if (this.textStampInput) this.textStampInput.value = txt;
      });
    });

    // Text style toggle (Regular vs Bold)
    document.querySelectorAll('#text-style-group .segmented-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#text-style-group .segmented-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTextBold = btn.getAttribute('data-bold') === 'true';
      });
    });

    this.textColorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.textColorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.selectedTextColor = dot.getAttribute('data-color') || '#0f172a';
      });
    });

    if (this.btnPlaceTextStamp) {
      this.btnPlaceTextStamp.addEventListener('click', () => {
        const val = this.textStampInput ? this.textStampInput.value.trim() : '';
        if (!val) {
          this.showToast('Please type your name or text');
          return;
        }
        const stamp = StampGenerator.createTextStamp({
          text: val,
          color: this.selectedTextColor,
          fontSize: 22,
          isBold: this.selectedTextBold
        });
        this.placementManager.addPlacement({
          ...stamp,
          pageNumber: this.pdfHandler.currentPageNumber
        });
        this.textModal.classList.remove('active');
        this.showToast('Text placed! Drag to position.');
      });
    }

    // Company Stamp & Seal Tool
    if (this.btnQuickCompanyStamp) {
      this.btnQuickCompanyStamp.addEventListener('click', () => {
        this.openCompanyStampModal(false);
      });
    }

    if (this.btnCloseCompanyStampModal) {
      this.btnCloseCompanyStampModal.addEventListener('click', () => {
        if (this.companyStampModal) this.companyStampModal.classList.remove('active');
      });
    }

    if (this.companyStampModal) {
      this.companyStampModal.addEventListener('click', (e) => {
        if (e.target === this.companyStampModal) this.companyStampModal.classList.remove('active');
      });
    }

    // Stamp Shape Switcher (Round vs Rectangular)
    this.stampShapeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stampShapeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedStampShape = btn.getAttribute('data-shape') || 'round';
        this.updateStampLivePreview();
      });
    });

    // Stamp Border Switcher (Double vs Single vs Heavy)
    this.stampBorderBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stampBorderBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedStampBorder = btn.getAttribute('data-border') || 'double';
        this.updateStampLivePreview();
      });
    });

    // Stamp Text Size Switcher (Small vs Medium vs Large)
    this.stampTextSizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stampTextSizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedStampTextSize = btn.getAttribute('data-size') || 'md';
        this.updateStampLivePreview();
      });
    });

    // Stamp Inputs live preview
    const updatePreviewOnInput = () => this.updateStampLivePreview();
    if (this.stampCompanyInput) this.stampCompanyInput.addEventListener('input', updatePreviewOnInput);
    if (this.stampDesignationInput) this.stampDesignationInput.addEventListener('input', updatePreviewOnInput);
    if (this.stampSubtextInput) this.stampSubtextInput.addEventListener('input', updatePreviewOnInput);
    if (this.stampRegInput) this.stampRegInput.addEventListener('input', updatePreviewOnInput);
    if (this.stampIncludeDate) this.stampIncludeDate.addEventListener('change', updatePreviewOnInput);

    // 11 Standard Business Templates
    this.stampTemplateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stampTemplateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const desig = btn.getAttribute('data-desig');
        const sub = btn.getAttribute('data-sub');
        const color = btn.getAttribute('data-color');
        const shape = btn.getAttribute('data-shape');

        if (desig && this.stampDesignationInput) this.stampDesignationInput.value = desig;
        if (sub && this.stampSubtextInput) this.stampSubtextInput.value = sub;

        if (color) {
          this.selectedStampColor = color;
          this.stampColorDots.forEach(d => {
            d.classList.toggle('active', d.getAttribute('data-color') === color);
          });
        }

        if (shape) {
          this.selectedStampShape = shape;
          this.stampShapeBtns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-shape') === shape);
          });
        }

        this.updateStampLivePreview();
      });
    });

    // Stamp Ink Color Dots
    this.stampColorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        this.stampColorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.selectedStampColor = dot.getAttribute('data-color') || '#1d4ed8';
        this.updateStampLivePreview();
      });
    });

    // Stamp Finish Toggles
    this.stampFinishBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stampFinishBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedStampFinish = btn.getAttribute('data-style') || 'distressed';
        this.updateStampLivePreview();
      });
    });

    // Standalone & Vault Action Buttons
    if (this.btnExportStandalonePng) {
      this.btnExportStandalonePng.addEventListener('click', () => this.handleExportStandaloneStampPng());
    }

    if (this.btnShareStandaloneStamp) {
      this.btnShareStandaloneStamp.addEventListener('click', () => this.handleShareStandaloneStamp());
    }

    if (this.btnSaveStampVault) {
      this.btnSaveStampVault.addEventListener('click', () => this.handleSaveStampToVault());
    }

    // Place Stamp on Document
    if (this.btnPlaceCompanyStamp) {
      this.btnPlaceCompanyStamp.addEventListener('click', () => this.handlePlaceCompanyStamp());
    }
    if (this.btnPlaceCompanyStampTop) {
      this.btnPlaceCompanyStampTop.addEventListener('click', () => this.handlePlaceCompanyStamp());
    }

    // Quick Tool: Sign All Pages (PRO Batch)
    if (this.btnQuickBatchSign) {
      this.btnQuickBatchSign.addEventListener('click', () => this.handleBatchSignAllPages());
    }
    if (this.btnNavBatchSign) {
      this.btnNavBatchSign.addEventListener('click', () => this.handleBatchSignAllPages());
    }

    // Export Trigger
    this.btnFinishExport.addEventListener('click', () => this.handleExport());

    // Export Modal Controls
    this.btnCloseExportModal.addEventListener('click', () => {
      this.closeExportModal();
      this.resetToWelcome();
    });
    this.exportModal.addEventListener('click', (e) => {
      if (e.target === this.exportModal) {
        this.closeExportModal();
        this.resetToWelcome();
      }
    });
    if (this.btnDoneExport) {
      this.btnDoneExport.addEventListener('click', () => {
        this.closeExportModal();
        this.resetToWelcome();
      });
    }
    this.btnDownloadExport.addEventListener('click', () => this.downloadExportedFile());
    this.btnShareExport.addEventListener('click', () => this.shareExportedFile());

    // Pricing / Plans Navigation
    if (this.btnOpenPricing) {
      this.btnOpenPricing.addEventListener('click', () => {
        if (!StorageManager.isAndroidApp()) {
          if (this.webProLockedModal) {
            const reasonEl = document.getElementById('web-pro-reason-text');
            if (reasonEl) reasonEl.textContent = 'SwiftSign on Web is 100% Free Forever';
            this.webProLockedModal.classList.add('active');
          } else {
            window.location.href = 'plans.html';
          }
          return;
        }
        this.refreshPricingUI();
        if (this.pricingModal) this.pricingModal.classList.add('active');
      });
    }
    if (this.btnClosePricingModal) {
      this.btnClosePricingModal.addEventListener('click', () => this.pricingModal.classList.remove('active'));
    }
    if (this.pricingModal) {
      this.pricingModal.addEventListener('click', (e) => {
        if (e.target === this.pricingModal) this.pricingModal.classList.remove('active');
      });
    }

    // Web Pro Locked Modal
    if (this.btnCloseWebProLocked && this.webProLockedModal) {
      this.btnCloseWebProLocked.addEventListener('click', () => {
        this.webProLockedModal.classList.remove('active');
      });
      this.webProLockedModal.addEventListener('click', (e) => {
        if (e.target === this.webProLockedModal) this.webProLockedModal.classList.remove('active');
      });
    }

    // Password Protected PDF Modal
    if (this.btnSubmitPassword) {
      this.btnSubmitPassword.addEventListener('click', () => this.submitPdfPassword());
    }
    if (this.pdfPasswordInput) {
      this.pdfPasswordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitPdfPassword();
        }
      });
    }
    if (this.btnCancelPassword) {
      this.btnCancelPassword.addEventListener('click', () => this.cancelPdfPassword());
    }
    if (this.btnClosePasswordModal) {
      this.btnClosePasswordModal.addEventListener('click', () => this.cancelPdfPassword());
    }
    if (this.btnTogglePasswordVisibility && this.pdfPasswordInput) {
      this.btnTogglePasswordVisibility.addEventListener('click', () => {
        const isPassword = this.pdfPasswordInput.type === 'password';
        this.pdfPasswordInput.type = isPassword ? 'text' : 'password';
        this.btnTogglePasswordVisibility.textContent = isPassword ? '🙈' : '👁️';
      });
    }

    // Navigation Drawer (Hamburger)
    if (this.btnOpenMenu && this.navDrawer && this.navDrawerOverlay) {
      this.btnOpenMenu.addEventListener('click', () => {
        this.navDrawer.classList.add('open');
        this.navDrawerOverlay.classList.add('active');
      });
    }
    const closeDrawer = () => {
      if (this.navDrawer) this.navDrawer.classList.remove('open');
      if (this.navDrawerOverlay) this.navDrawerOverlay.classList.remove('active');
    };
    if (this.btnCloseNavDrawer) {
      this.btnCloseNavDrawer.addEventListener('click', closeDrawer);
    }
    if (this.navDrawerOverlay) {
      this.navDrawerOverlay.addEventListener('click', closeDrawer);
    }

    // Android App Download handler (used across footer, web modal, and drawer)
    const handleGetAppClick = (e) => {
      if (e) e.preventDefault();
      const url = (PricingConfig && PricingConfig.playStoreUrl) ? PricingConfig.playStoreUrl : '';
      if (url && url.length > 0) {
        window.open(url, '_blank');
      } else {
        this.showToast('Android App: Coming soon to Google Play!');
      }
    };
    document.querySelectorAll('.btn-get-android-app').forEach(btn => {
      btn.addEventListener('click', handleGetAppClick);
    });

    if (this.btnChooseProMonthly) {
      this.btnChooseProMonthly.addEventListener('click', () => {
        if (window.billingController) window.billingController.purchasePlan('monthly');
      });
    }
    if (this.btnChooseProAnnual) {
      this.btnChooseProAnnual.addEventListener('click', () => {
        if (window.billingController) window.billingController.purchasePlan('annual');
      });
    }
    if (this.btnRestorePurchases) {
      this.btnRestorePurchases.addEventListener('click', () => {
        if (window.billingController) window.billingController.restorePurchases();
      });
    }

    // Language Toggle (if present)
    if (this.btnToggleLang) {
      this.btnToggleLang.addEventListener('click', () => {
        const nextLang = this.i18n.currentLang === 'en' ? 'hi' : 'en';
        this.i18n.setLanguage(nextLang);
        this.btnToggleLang.textContent = nextLang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English';
      });
    }

    // Image-to-PDF Modal Events
    if (this.btnCloseImgToPdfModal) {
      this.btnCloseImgToPdfModal.addEventListener('click', () => this.closeImageToPdfModal());
    }
    if (this.imageToPdfModal) {
      this.imageToPdfModal.addEventListener('click', (e) => {
        if (e.target === this.imageToPdfModal) this.closeImageToPdfModal();
      });
    }
    if (this.imgToPdfDropzone) {
      this.imgToPdfDropzone.addEventListener('click', () => {
        if (this.imgToPdfFileInput) this.imgToPdfFileInput.click();
      });
      ['dragenter', 'dragover'].forEach(name => {
        this.imgToPdfDropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.imgToPdfDropzone.style.borderColor = 'var(--primary-color)';
          this.imgToPdfDropzone.style.background = '#eef2ff';
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        this.imgToPdfDropzone.addEventListener(name, (e) => {
          e.preventDefault();
          this.imgToPdfDropzone.style.borderColor = 'var(--slate-300)';
          this.imgToPdfDropzone.style.background = '#f8fafc';
        });
      });
      this.imgToPdfDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) this.addImageToPdfFiles(files);
      });
    }
    if (this.imgToPdfFileInput) {
      this.imgToPdfFileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) this.addImageToPdfFiles(files);
        e.target.value = '';
      });
    }
    if (this.btnImgToPdfOpenSign) {
      this.btnImgToPdfOpenSign.addEventListener('click', () => this.handleImageToPdfOpenSign());
    }
    if (this.btnImgToPdfDownload) {
      this.btnImgToPdfDownload.addEventListener('click', () => this.handleImageToPdfSave());
    }
    if (this.btnImgToPdfShare) {
      this.btnImgToPdfShare.addEventListener('click', () => this.handleImageToPdfShare());
    }

    // Settings Modal & Profiles (Phase 5)
    if (this.btnOpenSettings) {
      this.btnOpenSettings.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }
    if (this.btnCloseSettingsModal) {
      this.btnCloseSettingsModal.addEventListener('click', () => {
        if (this.settingsModal) this.settingsModal.classList.remove('active');
      });
    }
    if (this.settingsModal) {
      this.settingsModal.addEventListener('click', (e) => {
        if (e.target === this.settingsModal) this.settingsModal.classList.remove('active');
      });
    }
    if (this.btnAddNewProfile) {
      this.btnAddNewProfile.addEventListener('click', () => this.handleAddNewProfile());
    }
    if (this.btnAddProfileStamp) {
      this.btnAddProfileStamp.addEventListener('click', () => this.handleAddNewProfile());
    }
    if (this.btnSaveAsProfile) {
      this.btnSaveAsProfile.addEventListener('click', () => this.handleSaveCurrentAsProfile());
    }
    if (this.stampProfileSelect) {
      this.stampProfileSelect.addEventListener('change', (e) => this.handleProfileSelectChange(e.target.value));
    }
    if (this.btnClearRecentDocs) {
      this.btnClearRecentDocs.addEventListener('click', () => {
        StorageManager.clearRecentDocuments();
        this.renderRecentDocsSettings();
        this.showToast('Recent documents cleared');
      });
    }
    if (this.btnDeleteAllData) {
      this.btnDeleteAllData.addEventListener('click', () => this.handleDeleteAllData());
    }
  }

  async loadFile(file) {
    try {
      this.currentFileName = file.name || 'document.pdf';
      const ext = (file.name || '').split('.').pop().toLowerCase();
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      // Check for PDF signature (%PDF)
      const isPdf = ext === 'pdf' ||
        file.type === 'application/pdf' ||
        (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46);

      if (isPdf) {
        await this.loadPdfBuffer(buffer);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext) || (file.type && file.type.startsWith('image/'))) {
        await this.loadImageFile(file);
      } else {
        alert('Unsupported file format. Please upload a PDF, JPG, or PNG.');
      }
    } catch (err) {
      console.error('loadFile error:', err);
      this.showToast('Could not load file: ' + err.message);
    }
  }

  async loadPdfBuffer(buffer) {
    try {
      this.currentDocType = 'pdf';
      const bytes = (buffer instanceof Uint8Array) ? buffer : new Uint8Array(buffer);
      // Deep copy the buffer so that when PDF.js transfers buffer to its Web Worker,
      // this.originalPdfBytes remains completely intact!
      const cloneBytes = new Uint8Array(bytes.length);
      cloneBytes.set(bytes);
      this.originalPdfBytes = cloneBytes;

      this.showEditor();

      // Reset handlers
      this.imageHandler.imgElement.style.display = 'none';
      this.pdfHandler.canvas.style.display = 'block';
      this.placementManager.clear();

      // Pass a fresh copy to PDF.js
      const pdfJsData = new Uint8Array(bytes.length);
      pdfJsData.set(bytes);
      await this.pdfHandler.loadFromBytes(pdfJsData);
      StorageManager.addRecentDocument({ name: this.currentFileName, size: bytes.length, type: 'pdf' });
      this.updateUndoButtonState();
      this.checkEmptyEditorHint();
      if (this.autoOpenStampOnLoad) {
        this.autoOpenStampOnLoad = false;
        setTimeout(() => this.openCompanyStampModal(false), 250);
      }
    } catch (err) {
      console.error('loadPdfBuffer error:', err);
      this.showToast('Error opening PDF: ' + (err.message || 'Corrupted file'));
      this.resetToWelcome();
    }
  }

  async loadImageFile(file) {
    this.currentDocType = 'image';
    this.imageMimeType = file.type || 'image/png';
    this.showEditor();

    this.pdfHandler.canvas.style.display = 'none';
    this.imageHandler.imgElement.style.display = 'block';
    this.placementManager.clear();

    await this.imageHandler.loadFromFile(file);
    StorageManager.addRecentDocument({ name: this.currentFileName, size: file.size, type: 'image' });
    this.updateUndoButtonState();
    this.checkEmptyEditorHint();
    if (this.autoOpenStampOnLoad) {
      this.autoOpenStampOnLoad = false;
      setTimeout(() => this.openCompanyStampModal(false), 250);
    }
  }

  showEditor() {
    this.welcomeScreen.style.display = 'none';
    this.editorScreen.classList.add('active');
  }

  resetToWelcome() {
    this.closeExportModal();
    if (this.passwordModal) this.passwordModal.classList.remove('active');
    if (this.pdfHandler) this.pdfHandler.currentPassword = null;
    if (this.pricingModal) this.pricingModal.classList.remove('active');
    if (this.sigModal) this.closeSigModal();
    if (this.dateModal) this.dateModal.classList.remove('active');
    if (this.textModal) this.textModal.classList.remove('active');
    if (this.companyStampModal) this.companyStampModal.classList.remove('active');
    if (this.imageToPdfModal) this.imageToPdfModal.classList.remove('active');
    if (this.settingsModal) this.settingsModal.classList.remove('active');
    this.editorScreen.classList.remove('active');
    this.welcomeScreen.style.display = 'flex';
    this.placementManager.clear();
    this.currentDocType = null;
    this.originalPdfBytes = null;
    this.originalImage = null;
    this.exportResult = null;
    if (this.fileInput) this.fileInput.value = '';
    if (this.btnQuickBatchSign) this.btnQuickBatchSign.style.display = 'none';
    if (this.btnNavBatchSign) this.btnNavBatchSign.style.display = 'none';
    const hint = document.getElementById('editor-empty-hint');
    if (hint) hint.remove();
    this.updateUndoButtonState();

    // Clear inbound cache after document closed or exported
    if (window.AndroidBridge && typeof window.AndroidBridge.clearInboundCache === 'function') {
      try {
        window.AndroidBridge.clearInboundCache();
      } catch (e) {
        console.warn('clearInboundCache failed:', e);
      }
    }
  }

  handlePdfPasswordRequired(updatePasswordCallback, reason) {
    this.pdfPasswordCallback = updatePasswordCallback;
    if (this.pdfPasswordError) {
      if (reason === 2) {
        this.pdfPasswordError.textContent = 'Incorrect password. Please try again.';
        this.pdfPasswordError.style.display = 'block';
      } else {
        this.pdfPasswordError.style.display = 'none';
      }
    }
    if (this.pdfPasswordInput) {
      this.pdfPasswordInput.value = '';
      setTimeout(() => this.pdfPasswordInput.focus(), 150);
    }
    if (this.passwordModal) {
      this.passwordModal.classList.add('active');
    }
  }

  submitPdfPassword() {
    const pwd = (this.pdfPasswordInput ? this.pdfPasswordInput.value : '').trim();
    if (!pwd) {
      if (this.pdfPasswordError) {
        this.pdfPasswordError.textContent = 'Please enter a password';
        this.pdfPasswordError.style.display = 'block';
      }
      return;
    }
    if (this.pdfPasswordError) this.pdfPasswordError.style.display = 'none';
    if (this.pdfPasswordCallback) {
      const cb = this.pdfPasswordCallback;
      this.pdfPasswordCallback = null;
      if (this.passwordModal) this.passwordModal.classList.remove('active');
      this.showToast('Unlocking document...');
      cb(pwd);
    }
  }

  cancelPdfPassword() {
    if (this.pdfPasswordCallback) {
      const cb = this.pdfPasswordCallback;
      this.pdfPasswordCallback = null;
      try { cb(new Error('Password cancelled')); } catch (e) {}
    }
    if (this.passwordModal) this.passwordModal.classList.remove('active');
    this.resetToWelcome();
  }

  getFormattedToday() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getSelectedDate() {
    if (this.datePickerInput && this.datePickerInput.value) {
      const parts = this.datePickerInput.value.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day);
        }
      }
    }
    return new Date();
  }

  updateDateModalPreviews() {
    if (this.datePickerInput && !this.datePickerInput.value) {
      this.datePickerInput.value = this.getFormattedToday();
    }
    const targetDate = this.getSelectedDate();
    const pMed = document.getElementById('date-preview-medium');
    const pDmy = document.getElementById('date-preview-dmy');
    const pMdy = document.getElementById('date-preview-mdy');
    const pIso = document.getElementById('date-preview-iso');
    if (pMed) pMed.textContent = StampGenerator.formatDate(targetDate, 'medium');
    if (pDmy) pDmy.textContent = StampGenerator.formatDate(targetDate, 'slash_dmy');
    if (pMdy) pMdy.textContent = StampGenerator.formatDate(targetDate, 'slash_mdy');
    if (pIso) pIso.textContent = StampGenerator.formatDate(targetDate, 'iso');
  }

  openCompanyStampModal(isStandalone = false) {
    this.isStampModalStandalone = isStandalone;
    const showPlaceBtn = (!isStandalone && !!this.currentDocType);
    if (this.stampPlaceOnDocContainer) {
      this.stampPlaceOnDocContainer.style.display = showPlaceBtn ? 'block' : 'none';
    }
    if (this.stampPlaceOnDocTopContainer) {
      this.stampPlaceOnDocTopContainer.style.display = showPlaceBtn ? 'block' : 'none';
    }
    if (this.companyStampModal) {
      this.renderStampProfileSelect();
      this.companyStampModal.classList.add('active');
      this.updateStampLivePreview();
    }
  }

  getCurrentStampOptions(highRes = false) {
    const company = (this.stampCompanyInput ? this.stampCompanyInput.value.trim() : '') || 'ACME TECHNOLOGIES PVT. LTD.';
    const designation = (this.stampDesignationInput ? this.stampDesignationInput.value.trim() : '') || 'AUTHORIZED SIGNATORY';
    const subtext = (this.stampSubtextInput ? this.stampSubtextInput.value.trim() : '') || '★ OFFICIAL SEAL ★';
    const regNumber = this.stampRegInput ? this.stampRegInput.value.trim() : '';
    const includeDate = this.stampIncludeDate ? this.stampIncludeDate.checked : false;
    const dateText = includeDate ? StampGenerator.formatDate(new Date(), 'medium') : '';

    return {
      shape: this.selectedStampShape,
      companyName: company,
      designation: designation,
      subtext: subtext,
      regNumber: regNumber,
      dateText: dateText,
      color: this.selectedStampColor,
      style: this.selectedStampFinish,
      border: this.selectedStampBorder || 'double',
      textSize: this.selectedStampTextSize || 'md',
      resolution: highRes ? 1800 : 600
    };
  }

  updateStampLivePreview() {
    if (!this.stampPreviewCanvas) return;
    const options = this.getCurrentStampOptions(false);
    const stamp = StampGenerator.createCompanySealStamp(options);

    const img = new Image();
    img.onload = () => {
      const cvs = this.stampPreviewCanvas;
      const ctx = cvs.getContext('2d');
      const w = 300;
      const h = Math.round(300 / (stamp.aspectRatio || 1));
      cvs.width = w;
      cvs.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
    };
    img.src = stamp.dataUrl;
  }

  handlePlaceCompanyStamp() {
    const options = this.getCurrentStampOptions(false);
    const stamp = StampGenerator.createCompanySealStamp(options);

    this.placementManager.addPlacement({
      ...stamp,
      pageNumber: this.pdfHandler.currentPageNumber
    });

    if (this.companyStampModal) this.companyStampModal.classList.remove('active');
    this.showToast('Official Stamp placed! Drag to position.');
  }

  handleExportStandaloneStampPng() {
    try {
      const options = this.getCurrentStampOptions(true);
      const stamp = StampGenerator.exportStandaloneStampPng(options, StampGenerator.STANDALONE_PNG_SIZE);
      const safeComp = options.companyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) || 'Stamp';
      const filename = `SwiftSign_${safeComp}_${Date.now()}.png`;

      if (window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function') {
        const base64Data = stamp.dataUrl.split(';base64,')[1];
        window.AndroidBridge.saveFile(base64Data, filename, 'image/png');
        this.showToast(`✓ Saved ${StampGenerator.STANDALONE_PNG_SIZE}px transparent PNG to Pictures/SwiftSign`);
      } else {
        const a = document.createElement('a');
        a.href = stamp.dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.showToast(`✓ Downloaded transparent PNG (${StampGenerator.STANDALONE_PNG_SIZE}px)`);
      }
    } catch (err) {
      console.error(err);
      this.showToast('Failed to export stamp: ' + err.message);
    }
  }

  async handleShareStandaloneStamp() {
    try {
      const options = this.getCurrentStampOptions(true);
      const stamp = StampGenerator.exportStandaloneStampPng(options, 1800);
      const safeComp = options.companyName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) || 'Stamp';
      const filename = `SwiftSign_${safeComp}_${Date.now()}.png`;

      if (window.AndroidBridge && typeof window.AndroidBridge.shareFile === 'function') {
        const base64Data = stamp.dataUrl.split(';base64,')[1];
        window.AndroidBridge.shareFile(base64Data, filename, 'image/png');
      } else if (navigator.share) {
        const blob = StampGenerator.dataUrlToBlob(stamp.dataUrl);
        const file = new File([blob], filename, { type: 'image/png' });
        await navigator.share({
          files: [file],
          title: `${options.companyName} Stamp`,
          text: 'Official Business Stamp created with SwiftSign'
        });
      } else {
        this.handleExportStandaloneStampPng();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        this.showToast('Share failed: ' + err.message);
      }
    }
  }

  handleSaveStampToVault() {
    const quota = StorageManager.canSaveNewStamp();
    if (!quota.allowed) {
      this.showPaywall('Free tier includes 1 saved stamp. Upgrade to Pro Pass for unlimited stamps.');
      return;
    }

    const options = this.getCurrentStampOptions(true);
    const stamp = StampGenerator.exportStandaloneStampPng(options, 1800);
    const name = `${options.companyName} (${options.designation})`;

    const result = StorageManager.saveStamp({
      dataUrl: stamp.dataUrl,
      width: stamp.width,
      height: stamp.height,
      aspectRatio: stamp.aspectRatio,
      name: name,
      options: options
    });

    if (result.success) {
      this.showToast('✓ Stamp saved to your device!');
      this.renderSavedStampsModal();
    } else {
      this.showToast('Could not save stamp: ' + (result.reason || 'Storage full'));
    }
  }

  openSavedStampsModal() {
    this.renderSavedStampsModal();
    if (this.savedStampsModal) {
      this.savedStampsModal.classList.add('active');
    }
  }

  renderSavedStampsModal() {
    const stamps = StorageManager.getStamps();
    const quota = StorageManager.canSaveNewStamp();
    if (this.savedStampsCountBadge) {
      this.savedStampsCountBadge.textContent = StorageManager.isPro()
        ? `${stamps.length} Saved (Pro)`
        : `${stamps.length} / ${quota.max} Saved`;
    }

    if (!this.savedStampsGrid || !this.savedStampsEmptyState) return;

    if (stamps.length === 0) {
      this.savedStampsEmptyState.style.display = 'block';
      this.savedStampsGrid.innerHTML = '';
      return;
    }

    this.savedStampsEmptyState.style.display = 'none';
    this.savedStampsGrid.innerHTML = '';

    stamps.forEach(item => {
      const card = document.createElement('div');
      card.className = 'saved-item-card';

      const preview = document.createElement('div');
      preview.className = 'saved-item-preview';
      const img = document.createElement('img');
      img.src = item.dataUrl;
      img.alt = item.name || 'Stamp';
      preview.appendChild(img);

      const title = document.createElement('div');
      title.className = 'saved-item-name-two-line';

      let comp = item.companyName || '';
      let desig = item.designation || '';
      if (!comp && item.name) {
        if (item.name.includes('(')) {
          const parts = item.name.split('(');
          comp = parts[0].trim();
          desig = parts[1].replace(')', '').trim();
        } else {
          comp = item.name;
        }
      }

      const compLine = document.createElement('div');
      compLine.className = 'saved-stamp-company';
      compLine.textContent = comp || 'Company Stamp';
      title.appendChild(compLine);

      if (desig) {
        const desigLine = document.createElement('div');
        desigLine.className = 'saved-stamp-desig';
        desigLine.textContent = desig;
        title.appendChild(desigLine);
      }

      const actions = document.createElement('div');
      actions.className = 'saved-item-actions';

      // Export PNG button (1800px)
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn-item-action primary';
      exportBtn.textContent = 'Export';
      exportBtn.title = 'Export high-res transparent PNG (1800px)';
      exportBtn.addEventListener('click', () => {
        const filename = `SwiftSign_Stamp_${item.id || Date.now()}.png`;
        if (window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function') {
          const base64Data = item.dataUrl.split(';base64,')[1];
          window.AndroidBridge.saveFile(base64Data, filename, 'image/png');
          this.showToast('✓ Saved 1800px transparent PNG to Pictures/SwiftSign');
        } else {
          const a = document.createElement('a');
          a.href = item.dataUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          this.showToast('✓ Downloaded transparent PNG (1800px)');
        }
      });
      actions.appendChild(exportBtn);

      // Rename button (A5)
      const renameBtn = document.createElement('button');
      renameBtn.className = 'btn-item-action';
      renameBtn.textContent = 'Rename';
      renameBtn.title = 'Rename this stamp';
      renameBtn.addEventListener('click', () => {
        const currentName = item.name || comp || 'Stamp';
        const newName = prompt('Enter new name for saved stamp:', currentName);
        if (newName && newName.trim() && newName.trim() !== currentName) {
          StorageManager.renameStamp(item.id, newName.trim());
          this.renderSavedStampsModal();
          this.showToast('✓ Stamp renamed');
        }
      });
      actions.appendChild(renameBtn);

      // If document is open, show "Use" button
      if (this.currentDocType) {
        const useBtn = document.createElement('button');
        useBtn.className = 'btn-item-action';
        useBtn.textContent = 'Use';
        useBtn.title = 'Place on document';
        useBtn.addEventListener('click', () => {
          this.placementManager.addPlacement({
            dataUrl: item.dataUrl,
            width: item.width || 135,
            height: item.height || 135,
            aspectRatio: item.aspectRatio || 1,
            type: 'stamp',
            pageNumber: this.pdfHandler.currentPageNumber
          });
          if (this.savedStampsModal) this.savedStampsModal.classList.remove('active');
          this.showToast('Stamp placed on document!');
        });
        actions.appendChild(useBtn);
      }

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-item-action danger';
      delBtn.textContent = '✕';
      delBtn.title = 'Delete stamp';
      delBtn.addEventListener('click', () => {
        if (confirm('Delete this saved stamp?')) {
          StorageManager.deleteStamp(item.id);
          this.renderSavedStampsModal();
          this.showToast('Stamp deleted.');
        }
      });
      actions.appendChild(delBtn);

      card.appendChild(preview);
      card.appendChild(title);
      card.appendChild(actions);
      this.savedStampsGrid.appendChild(card);
    });
  }

  openSavedSignaturesModal() {
    this.renderSavedSignaturesModal();
    if (this.savedSignaturesModal) {
      this.savedSignaturesModal.classList.add('active');
    }
  }

  renderSavedSignaturesModal() {
    const sigs = StorageManager.getSignatures();
    const quota = StorageManager.canSaveNewSignature();
    if (this.savedSigsCountBadge) {
      this.savedSigsCountBadge.textContent = StorageManager.isPro()
        ? `${sigs.length} Saved (Pro)`
        : `${sigs.length} / ${quota.max} Saved`;
    }

    if (!this.savedSigsGrid || !this.savedSigsEmptyState) return;

    if (sigs.length === 0) {
      this.savedSigsEmptyState.style.display = 'block';
      this.savedSigsGrid.innerHTML = '';
      return;
    }

    this.savedSigsEmptyState.style.display = 'none';
    this.savedSigsGrid.innerHTML = '';

    sigs.forEach(item => {
      const card = document.createElement('div');
      card.className = 'saved-item-card';

      const preview = document.createElement('div');
      preview.className = 'saved-item-preview';
      const img = document.createElement('img');
      img.src = item.dataUrl;
      img.alt = item.name || 'Signature';
      preview.appendChild(img);

      const title = document.createElement('div');
      title.className = 'saved-item-name';
      title.textContent = item.name || 'Handwritten Signature';

      const actions = document.createElement('div');
      actions.className = 'saved-item-actions';

      if (this.currentDocType) {
        const useBtn = document.createElement('button');
        useBtn.className = 'btn-item-action primary';
        useBtn.textContent = 'Use';
        useBtn.addEventListener('click', () => {
          this.placementManager.addSignature({
            dataUrl: item.dataUrl,
            width: item.width,
            height: item.height,
            aspectRatio: item.aspectRatio,
            pageNumber: this.pdfHandler.currentPageNumber
          });
          if (this.savedSignaturesModal) this.savedSignaturesModal.classList.remove('active');
          this.showToast('Signature placed on document!');
        });
        actions.appendChild(useBtn);
      }

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-item-action danger';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        if (confirm('Delete this saved signature?')) {
          StorageManager.deleteSignature(item.id);
          this.renderSavedSignaturesModal();
          this.renderSavedSignatures();
          this.showToast('Signature deleted.');
        }
      });
      actions.appendChild(delBtn);

      card.appendChild(preview);
      card.appendChild(title);
      card.appendChild(actions);
      this.savedSigsGrid.appendChild(card);
    });
  }

  updatePageControls(current, total) {
    this.pageIndicator.textContent = this.i18n.t('page_indicator', { current, total });
    this.btnPrevPage.disabled = current <= 1;
    this.btnNextPage.disabled = current >= total;

    if (this.btnQuickBatchSign) {
      if (total > 1) {
        this.btnQuickBatchSign.style.display = 'flex';
        const label = this.btnQuickBatchSign.querySelector('span');
        if (label) label.textContent = 'Apply All';
        this.btnQuickBatchSign.title = 'Apply to All Pages (PRO)';
        this.btnQuickBatchSign.classList.add('batch-sign-tool-btn');
      } else {
        this.btnQuickBatchSign.style.display = 'none';
        this.btnQuickBatchSign.classList.remove('batch-sign-tool-btn');
      }
    }

    if (this.btnNavBatchSign) {
      this.btnNavBatchSign.style.display = 'none';
    }

    if (total <= 1) {
      this.btnPrevPage.style.display = 'none';
      this.btnNextPage.style.display = 'none';
      document.body.classList.add('is-single-page');
    } else {
      this.btnPrevPage.style.display = 'inline-flex';
      this.btnNextPage.style.display = 'inline-flex';
      document.body.classList.remove('is-single-page');
    }

    this.updateUndoButtonState();
  }

  updateUndoButtonState() {
    if (!this.btnUndoPlacement) return;
    const canUndo = this.placementManager && this.placementManager.canUndo();
    this.btnUndoPlacement.disabled = !canUndo;
    if (canUndo) {
      this.btnUndoPlacement.classList.remove('disabled');
      this.btnUndoPlacement.style.opacity = '1';
      this.btnUndoPlacement.style.pointerEvents = 'auto';
    } else {
      this.btnUndoPlacement.classList.add('disabled');
      this.btnUndoPlacement.style.opacity = '0.38';
      this.btnUndoPlacement.style.pointerEvents = 'none';
    }
  }

  checkEmptyEditorHint() {
    let hint = document.getElementById('editor-empty-hint');
    const count = this.placementManager ? this.placementManager.placements.length : 0;
    if (count === 0 && this.currentDocType) {
      if (!hint && this.stageWrapper) {
        hint = document.createElement('div');
        hint.id = 'editor-empty-hint';
        hint.className = 'editor-empty-hint';
        hint.innerHTML = '<span>💡 Tap Sign, Date, Text or Stamp to add to your document</span>';
        hint.addEventListener('click', () => { hint.remove(); });
        this.stageWrapper.appendChild(hint);
      } else if (hint) {
        hint.style.display = 'block';
      }
    } else if (hint) {
      hint.style.display = 'none';
    }
  }

  handleBatchSignAllPages(placementId = null) {
    const totalPages = this.pdfHandler.totalPages || this.pdfHandler.getPageCount() || (this.pdfHandler.pdfDoc ? this.pdfHandler.pdfDoc.numPages : 0);

    if (!this.pdfHandler.pdfDoc || totalPages <= 1) {
      this.showToast('Apply All is for multi-page documents (this document has only 1 page)');
      return;
    }

    if (!StorageManager.isPro()) {
      this.showPaywall('Multi-page 1-tap "Sign All Pages" is a Pro Pass feature.');
      return;
    }

    if (!localStorage.getItem('swiftsign_batch_hint_shown')) {
      this.showToast('Apply to All Pages copies the active signature or stamp across every page.');
      localStorage.setItem('swiftsign_batch_hint_shown', 'true');
    }

    const res = this.placementManager.replicateToAllPages(placementId, totalPages);
    if (res.count > 0 || res.updatedCount > 0) {
      this.showToast(`✓ Applied to all ${totalPages} pages! Use < and > to inspect.`);
      this.updateUndoButtonState();
    } else {
      if (!res.sourcePlacement) {
        this.showToast('Please place your signature or date on this page first');
      } else {
        this.showToast(`All ${totalPages} pages already have this placement.`);
      }
    }
  }

  switchSigMode(mode) {
    this.currentSigMode = mode;
    if (mode === 'scan') {
      if (this.tabSigScan) this.tabSigScan.classList.add('active');
      if (this.tabSigDraw) this.tabSigDraw.classList.remove('active');
      if (this.sigDrawSection) this.sigDrawSection.style.display = 'none';
      if (this.sigScanSection) this.sigScanSection.style.display = 'block';
    } else {
      if (this.tabSigDraw) this.tabSigDraw.classList.add('active');
      if (this.tabSigScan) this.tabSigScan.classList.remove('active');
      if (this.sigDrawSection) this.sigDrawSection.style.display = 'block';
      if (this.sigScanSection) this.sigScanSection.style.display = 'none';
      setTimeout(() => this.canvasSignature.setupDPI(), 50);
    }
  }

  async processScannedFile(file) {
    try {
      this.showToast('Extracting signature from paper...');
      const img = await PaperScanner.loadImage(file);
      this.scannedImageSource = img;
      this.runScannerExtraction();
    } catch (err) {
      console.error('Failed to process paper signature:', err);
      this.showToast('Could not process photo. Please try another image.');
    }
  }

  runScannerExtraction() {
    if (!this.scannedImageSource) return;
    try {
      const result = PaperScanner.extractSignature(this.scannedImageSource, {
        threshold: this.scannerThreshold,
        color: this.scannerColor
      });

      if (!result) {
        this.showToast('No clear signature found. Try adjusting contrast or lighting.');
        return;
      }

      this.scannedResult = result;
      if (this.scannerDropzone) this.scannerDropzone.style.display = 'none';
      if (this.scannerResultArea) this.scannerResultArea.style.display = 'block';

      if (this.scannerPreviewCanvas) {
        this.scannerPreviewCanvas.width = result.width;
        this.scannerPreviewCanvas.height = result.height;
        const pCtx = this.scannerPreviewCanvas.getContext('2d');
        pCtx.clearRect(0, 0, result.width, result.height);
        pCtx.drawImage(result.canvas, 0, 0);
      }
    } catch (err) {
      console.error('Scanner error:', err);
      this.showToast('Error processing signature.');
    }
  }

  openSigModal() {
    this.switchSigMode('draw');
    this.sigModal.classList.add('active');
    // Setup canvas DPI after modal is visible
    setTimeout(() => {
      this.canvasSignature.setupDPI();
    }, 50);
  }

  closeSigModal() {
    this.sigModal.classList.remove('active');
  }

  renderSavedSignatures() {
    const list = StorageManager.getSignatures();
    this.savedSigsContainer.innerHTML = '';

    if (list.length === 0) {
      this.savedSigsContainer.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--slate-400); padding: 0.5rem 0;" data-i18n="no_saved_sigs">
          ${this.i18n.t('no_saved_sigs')}
        </div>
      `;
      return;
    }

    list.forEach(sig => {
      const item = document.createElement('div');
      item.className = 'saved-sig-thumbnail';
      item.title = 'Click to use saved signature';
      item.innerHTML = `
        <img src="${sig.dataUrl}" alt="Saved signature" draggable="false" />
        <div class="saved-sig-delete-icon" title="Delete">✕</div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.saved-sig-delete-icon')) {
          e.stopPropagation();
          StorageManager.deleteSignature(sig.id);
          this.renderSavedSignatures();
          return;
        }

        // Place on document
        this.placementManager.addSignature({
          dataUrl: sig.dataUrl,
          width: sig.width,
          height: sig.height,
          aspectRatio: sig.aspectRatio,
          pageNumber: this.pdfHandler.currentPageNumber
        });
        this.closeSigModal();
        this.showToast('Saved signature placed!');
      });

      this.savedSigsContainer.appendChild(item);
    });
  }

  async handleExport() {
    const placements = this.placementManager.getExportPlacements();
    if (placements.length === 0) {
      this.showToast('Please place at least one signature before finishing');
      return;
    }

    const origBtnHtml = this.btnFinishExport.innerHTML;
    try {
      this.btnFinishExport.disabled = true;
      this.btnFinishExport.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2.5" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        <span>Saving...</span>
      `;
      this.showToast('Saving signed document...');
      let result;

      if (this.currentDocType === 'pdf') {
        const docPassword = this.pdfHandler ? this.pdfHandler.currentPassword : null;
        result = await ExportEngine.exportPdf({
          originalPdfBytes: this.originalPdfBytes,
          placements: placements,
          pdfJsDoc: this.pdfHandler ? this.pdfHandler.pdfDoc : null,
          password: docPassword
        });
        result.filename = this.currentFileName.replace(/\.pdf$/i, '') + '-signed.pdf';
        result.mimeType = 'application/pdf';
        if (this.btnDownloadLabel) this.btnDownloadLabel.textContent = 'Download Signed PDF';
        const kb = Math.round(result.size / 1024);
        const lockNote = docPassword ? ' • Protected with Original Password' : ' • 100% Vector Quality';
        this.exportMetaText.textContent = `${result.filename} (${kb} KB)${lockNote} • No Watermark`;
      } else {
        const isJpg = this.imageMimeType === 'image/jpeg' || this.imageMimeType === 'image/jpg' || /\.jpe?g$/i.test(this.currentFileName);
        const isWebp = this.imageMimeType === 'image/webp' || /\.webp$/i.test(this.currentFileName);
        const ext = isJpg ? 'jpg' : (isWebp ? 'webp' : 'png');
        const targetMime = isJpg ? 'image/jpeg' : (isWebp ? 'image/webp' : 'image/png');

        result = await ExportEngine.exportImage({
          originalImage: this.imageHandler.imgElement,
          placements: placements,
          originalFormat: targetMime
        });
        result.filename = this.currentFileName.replace(/\.[^/.]+$/, '') + '-signed.' + ext;
        result.mimeType = targetMime;
        if (this.btnDownloadLabel) this.btnDownloadLabel.textContent = `Download Signed Image (${ext.toUpperCase()})`;
        const kb = Math.round(result.size / 1024);
        this.exportMetaText.textContent = `${result.filename} (${kb} KB) • Original Resolution • No Watermark`;
      }

      if (!result || !result.bytes || result.bytes.length === 0) {
        throw new Error('Export resulted in an empty file');
      }

      this.exportResult = result;
      this.exportModal.classList.add('active');

    } catch (err) {
      console.error('Export Error:', err);
      this.showToast('Saving failed: ' + err.message);
    } finally {
      this.btnFinishExport.disabled = false;
      this.btnFinishExport.innerHTML = origBtnHtml;
    }
  }

  closeExportModal() {
    this.exportModal.classList.remove('active');
  }

  refreshPricingUI() {
    if (window.billingController) {
      window.billingController.renderPaywallModal();
    }
  }

  showPaywall(reason = '') {
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (!isAndroid) {
      if (this.webProLockedModal) {
        const reasonEl = document.getElementById('web-pro-reason-text');
        if (reasonEl) {
          reasonEl.textContent = reason || 'SwiftSign on Web is 100% Free Forever';
        }
        this.webProLockedModal.classList.add('active');
      }
      return;
    }

    if (window.billingController) {
      window.billingController.showPaywall(reason);
    } else if (this.pricingModal) {
      this.refreshPricingUI();
      this.pricingModal.classList.add('active');
    }
  }

  handlePlanSelection(planKey) {
    if (window.billingController) {
      window.billingController.purchasePlan(planKey);
    }
  }

  handleRestorePurchases() {
    if (window.billingController) {
      window.billingController.restorePurchases();
    }
  }

  updateProBadges() {
    const isPro = StorageManager.isPro();
    document.querySelectorAll('.badge-pro, .pro-pill').forEach(el => {
      if (isPro) {
        el.style.opacity = '0.4';
      }
    });
  }

  async downloadExportedFile() {
    if (!this.exportResult) return;

    // 1. Android Native Bridge: Save directly to phone's public Downloads / Pictures
    if (window.AndroidBridge && window.AndroidBridge.saveFile) {
      try {
        const base64 = await this.blobToBase64(this.exportResult.blob);
        window.AndroidBridge.saveFile(base64, this.exportResult.filename, this.exportResult.mimeType);
        this.showToast('Document saved! Returning to home...');
        setTimeout(() => this.resetToWelcome(), 1200);
        return;
      } catch (err) {
        console.warn('Native Android save failed, falling back to browser download:', err);
      }
    }

    // 2. Browser standard download
    const a = document.createElement('a');
    a.href = this.exportResult.blobUrl;
    a.download = this.exportResult.filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 100);
    this.showToast('Downloaded ' + this.exportResult.filename + '! Returning to home...');
    setTimeout(() => this.resetToWelcome(), 1200);
  }

  async shareExportedFile() {
    if (!this.exportResult) return;

    // 1. Native Android Bridge Support
    if (window.AndroidBridge && window.AndroidBridge.shareFile) {
      try {
        const base64 = await this.blobToBase64(this.exportResult.blob);
        window.AndroidBridge.shareFile(base64, this.exportResult.filename, this.exportResult.mimeType);
        setTimeout(() => this.resetToWelcome(), 800);
        return;
      } catch (err) {
        console.warn('Native Android share failed, falling back:', err);
      }
    }

    // 2. Web Share API (Mobile browsers)
    if (navigator.canShare && navigator.canShare({ files: [new File([this.exportResult.blob], this.exportResult.filename, { type: this.exportResult.mimeType })] })) {
      try {
        const file = new File([this.exportResult.blob], this.exportResult.filename, { type: this.exportResult.mimeType });
        await navigator.share({
          files: [file],
          title: this.exportResult.filename,
          text: 'Here is my signed document from SwiftSign'
        });
        setTimeout(() => this.resetToWelcome(), 800);
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Web Share failed:', err);
        }
      }
    }

    // Fallback: download if sharing is not supported
    this.downloadExportedFile();
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // =========================================================================
  // Share-to-App & Inbound Intent Receiver (Phase 3)
  // =========================================================================

  setupInboundReceiver() {
    window.handleInboundData = (data) => {
      this.handleInboundData(data);
    };

    if (window.AndroidBridge && typeof window.AndroidBridge.getPendingInboundData === 'function') {
      try {
        const raw = window.AndroidBridge.getPendingInboundData();
        if (raw && raw.trim().length > 0) {
          const parsed = JSON.parse(raw);
          this.handleInboundData(parsed);
        }
      } catch (err) {
        console.error('Failed to read pending inbound data:', err);
      }
    }
  }

  async handleInboundData(data) {
    if (!data) return;
    try {
      if (data.type === 'single') {
        const mime = (data.mimeType || '').toLowerCase();
        const name = data.name || 'document.pdf';
        const binaryString = atob(data.base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        this.currentFileName = name;
        if (mime.includes('pdf') || name.toLowerCase().endsWith('.pdf')) {
          this.showToast(`Opening ${name}...`);
          await this.loadPdfBuffer(bytes.buffer);
        } else {
          this.showToast(`Opening ${name}...`);
          const blob = new Blob([bytes], { type: mime || 'image/jpeg' });
          const file = new File([blob], name, { type: mime || 'image/jpeg' });
          await this.loadImageFile(file);
        }
      } else if (data.type === 'multiple' && Array.isArray(data.files)) {
        this.showToast(`Received ${data.files.length} images`);
        this.openImageToPdfModal();
        for (const f of data.files) {
          const binaryString = atob(f.base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const mime = f.mimeType || 'image/jpeg';
          const blob = new Blob([bytes], { type: mime });
          const file = new File([blob], f.name || 'image.jpg', { type: mime });
          await this.addImageToPdfFile(file);
        }
        this.renderImageToPdfThumbnails();
        this.updateImageToPdfBadge();
      }
    } catch (err) {
      console.error('handleInboundData error:', err);
      this.showToast('Could not open shared file: ' + err.message);
    }
  }

  // =========================================================================
  // Image-to-PDF Conversion Engine & Modal (Phase 3)
  // =========================================================================

  openImageToPdfModal() {
    if (this.imageToPdfModal) {
      this.imageToPdfModal.classList.add('active');
      this.renderImageToPdfThumbnails();
      this.updateImageToPdfBadge();
    }
  }

  closeImageToPdfModal() {
    if (this.imageToPdfModal) {
      this.imageToPdfModal.classList.remove('active');
    }
  }

  updateImageToPdfBadge() {
    if (this.imgToPdfCountBadge) {
      const count = this.imgToPdfImages.length;
      this.imgToPdfCountBadge.textContent = `${count} Image${count === 1 ? '' : 's'}`;
    }
  }

  async addImageToPdfFile(file) {
    if (!file || !(file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name))) return;
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const dimensions = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
        img.onerror = () => resolve({ width: 800, height: 600 });
        img.src = dataUrl;
      });

      this.imgToPdfImages.push({
        id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: file.name,
        dataUrl: dataUrl,
        bytes: bytes,
        width: dimensions.width,
        height: dimensions.height
      });
    } catch (err) {
      console.warn('Failed to load image for PDF:', file.name, err);
    }
  }

  async addImageToPdfFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    this.showToast(`Loading ${fileList.length} image(s)...`);
    for (let i = 0; i < fileList.length; i++) {
      await this.addImageToPdfFile(fileList[i]);
    }
    this.renderImageToPdfThumbnails();
    this.updateImageToPdfBadge();
  }

  renderImageToPdfThumbnails() {
    if (!this.imgToPdfList) return;
    this.imgToPdfList.innerHTML = '';

    if (this.imgToPdfImages.length === 0) {
      this.imgToPdfList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--slate-400); padding: 1.5rem 0.5rem; font-size: 0.9rem;">
          No images added yet. Tap above to add photos.
        </div>
      `;
      return;
    }

    this.imgToPdfImages.forEach((img, idx) => {
      const card = document.createElement('div');
      card.className = 'img-thumb-card';
      card.setAttribute('data-idx', idx);

      const pageNum = document.createElement('span');
      pageNum.className = 'img-thumb-index';
      pageNum.textContent = `Page ${idx + 1}`;
      card.appendChild(pageNum);

      const previewBox = document.createElement('div');
      previewBox.className = 'img-thumb-preview';
      const imgEl = document.createElement('img');
      imgEl.src = img.dataUrl;
      imgEl.alt = img.name;
      previewBox.appendChild(imgEl);
      card.appendChild(previewBox);

      const nameEl = document.createElement('div');
      nameEl.className = 'img-thumb-name';
      nameEl.textContent = img.name;
      nameEl.title = img.name;
      card.appendChild(nameEl);

      const ctrlRow = document.createElement('div');
      ctrlRow.className = 'img-thumb-controls';

      // Move left/earlier
      const btnLeft = document.createElement('button');
      btnLeft.type = 'button';
      btnLeft.className = 'btn-thumb-ctrl';
      btnLeft.textContent = '←';
      btnLeft.title = 'Move up/earlier';
      btnLeft.disabled = idx === 0;
      btnLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveImageToPdf(idx, -1);
      });
      ctrlRow.appendChild(btnLeft);

      // Remove
      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn-thumb-ctrl btn-thumb-del';
      btnDel.textContent = '✕';
      btnDel.title = 'Remove';
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeImageToPdf(idx);
      });
      ctrlRow.appendChild(btnDel);

      // Move right/later
      const btnRight = document.createElement('button');
      btnRight.type = 'button';
      btnRight.className = 'btn-thumb-ctrl';
      btnRight.textContent = '→';
      btnRight.title = 'Move down/later';
      btnRight.disabled = idx === this.imgToPdfImages.length - 1;
      btnRight.addEventListener('click', (e) => {
        e.stopPropagation();
        this.moveImageToPdf(idx, 1);
      });
      ctrlRow.appendChild(btnRight);

      card.appendChild(ctrlRow);
      this.imgToPdfList.appendChild(card);
    });
  }

  moveImageToPdf(idx, direction) {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= this.imgToPdfImages.length) return;
    const item = this.imgToPdfImages.splice(idx, 1)[0];
    this.imgToPdfImages.splice(targetIdx, 0, item);
    this.renderImageToPdfThumbnails();
  }

  removeImageToPdf(idx) {
    if (idx < 0 || idx >= this.imgToPdfImages.length) return;
    this.imgToPdfImages.splice(idx, 1);
    this.renderImageToPdfThumbnails();
    this.updateImageToPdfBadge();
  }

  async convertImagesToPdfBytes() {
    if (!this.imgToPdfImages || this.imgToPdfImages.length === 0) {
      this.showToast('Please select at least one image');
      return null;
    }
    const pageSize = (this.imgToPdfPageSize && this.imgToPdfPageSize.value) || 'a4';
    const orientation = (this.imgToPdfOrientation && this.imgToPdfOrientation.value) || 'auto';
    this.showToast('Converting images to PDF...');
    const result = await ImageToPdfConverter.convertImagesToPdf(this.imgToPdfImages, {
      pageSize: pageSize,
      orientation: orientation
    });
    return result ? result.bytes : null;
  }

  async handleImageToPdfOpenSign() {
    try {
      const pdfBytes = await this.convertImagesToPdfBytes();
      if (!pdfBytes) return;
      this.closeImageToPdfModal();
      this.currentFileName = 'Images_' + new Date().toISOString().slice(0, 10) + '.pdf';
      await this.loadPdfBuffer(pdfBytes);
      this.showToast('✓ Opened in PDF signing workspace');
    } catch (err) {
      console.error('Image to PDF open sign error:', err);
      this.showToast('Failed to create PDF: ' + err.message);
    }
  }

  async handleImageToPdfSave() {
    try {
      const pdfBytes = await this.convertImagesToPdfBytes();
      if (!pdfBytes) return;
      const filename = `SwiftSign_Images_${Date.now()}.pdf`;

      if (window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function') {
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < pdfBytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, pdfBytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        window.AndroidBridge.saveFile(base64, filename, 'application/pdf');
        this.showToast('✓ Saved PDF to Downloads/SwiftSign');
      } else {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 200);
        this.showToast('✓ Downloaded ' + filename);
      }
    } catch (err) {
      console.error('Image to PDF save error:', err);
      this.showToast('Failed to save PDF: ' + err.message);
    }
  }

  async handleImageToPdfShare() {
    try {
      const pdfBytes = await this.convertImagesToPdfBytes();
      if (!pdfBytes) return;
      const filename = `SwiftSign_Images_${Date.now()}.pdf`;

      if (window.AndroidBridge && typeof window.AndroidBridge.saveFile === 'function') {
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < pdfBytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, pdfBytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        window.AndroidBridge.saveFile(base64, filename, 'application/pdf');
      } else {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: filename,
            text: 'Combined PDF from SwiftSign'
          });
        } else {
          await this.handleImageToPdfSave();
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Image to PDF share error:', err);
        this.showToast('Failed to share PDF: ' + err.message);
      }
    }
  }

  // =========================================================================
  // Settings, Profiles & Privacy Management (Phase 5)
  // =========================================================================

  openSettingsModal() {
    if (!this.settingsModal) return;
    this.renderProfilesSettings();
    this.renderRecentDocsSettings();
    this.settingsModal.classList.add('active');
  }

  renderProfilesSettings() {
    if (!this.settingsProfilesList) return;
    this.settingsProfilesList.innerHTML = '';
    const profiles = StorageManager.getProfiles();
    const active = StorageManager.getActiveProfile();

    if (profiles.length === 0) {
      this.settingsProfilesList.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--slate-500); padding: 0.75rem 0.5rem; text-align: center; background: #fff; border: 1px dashed var(--slate-300); border-radius: var(--radius-sm);">
          No company profiles saved yet. Tap "+ New Profile" above to create one.
        </div>
      `;
      return;
    }

    profiles.forEach(p => {
      const isActive = active && active.id === p.id;
      const row = document.createElement('div');
      row.style.cssText = `display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.75rem; background: ${isActive ? '#eff6ff' : '#fff'}; border: 1.5px solid ${isActive ? '#93c5fd' : 'var(--slate-200)'}; border-radius: var(--radius-sm);`;

      row.innerHTML = `
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <strong style="font-size: 0.88rem; color: var(--slate-800);">${p.name || p.companyName}</strong>
            ${isActive ? '<span style="font-size: 0.65rem; background: #2563eb; color: #fff; padding: 0.1rem 0.35rem; border-radius: 4px; font-weight: 700;">ACTIVE</span>' : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">${p.designation} ${p.location ? '• ' + p.location : ''}</div>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          ${!isActive ? `<button type="button" class="tool-btn btn-set-active-prof" data-id="${p.id}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Make Active</button>` : ''}
          <button type="button" class="tool-btn btn-del-prof" data-id="${p.id}" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; color: var(--rose-600);" title="Delete profile">✕</button>
        </div>
      `;

      const btnActive = row.querySelector('.btn-set-active-prof');
      if (btnActive) {
        btnActive.addEventListener('click', () => {
          StorageManager.setActiveProfile(p.id);
          this.renderProfilesSettings();
          this.renderStampProfileSelect();
          this.showToast(`Switched active profile to ${p.name || p.companyName}`);
        });
      }

      const btnDel = row.querySelector('.btn-del-prof');
      if (btnDel) {
        btnDel.addEventListener('click', () => {
          if (confirm(`Delete profile "${p.name || p.companyName}"?`)) {
            StorageManager.deleteProfile(p.id);
            this.renderProfilesSettings();
            this.renderStampProfileSelect();
            this.showToast('Profile deleted');
          }
        });
      }

      this.settingsProfilesList.appendChild(row);
    });
  }

  renderRecentDocsSettings() {
    if (!this.settingsRecentDocsList) return;
    this.settingsRecentDocsList.innerHTML = '';
    const recents = StorageManager.getRecentDocuments();

    if (recents.length === 0) {
      this.settingsRecentDocsList.innerHTML = `
        <div style="font-size: 0.82rem; color: var(--slate-400); padding: 0.5rem 0;">
          No recent documents found on device.
        </div>
      `;
      return;
    }

    recents.forEach(r => {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.6rem; background: #fff; border: 1px solid var(--slate-200); border-radius: var(--radius-sm); font-size: 0.8rem;';
      const dateStr = new Date(r.date).toLocaleDateString();
      const kb = r.size ? Math.round(r.size / 1024) + ' KB' : '';
      row.innerHTML = `
        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 75%; font-weight: 600; color: var(--slate-700);">
          ${r.name}
        </div>
        <div style="font-size: 0.72rem; color: var(--slate-400);">
          ${dateStr} ${kb ? '• ' + kb : ''}
        </div>
      `;
      this.settingsRecentDocsList.appendChild(row);
    });
  }

  renderStampProfileSelect() {
    if (!this.stampProfileSelect) return;
    const profiles = StorageManager.getProfiles();
    const active = StorageManager.getActiveProfile();
    this.stampProfileSelect.innerHTML = '';

    if (profiles.length === 0) {
      const emptyOpt = document.createElement('option');
      emptyOpt.value = 'current';
      emptyOpt.textContent = 'No Profiles Saved Yet (Default)';
      this.stampProfileSelect.appendChild(emptyOpt);
      return;
    }

    const currentOpt = document.createElement('option');
    currentOpt.value = 'current';
    currentOpt.textContent = 'Custom / Current Stamp';
    this.stampProfileSelect.appendChild(currentOpt);

    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name || p.companyName} (${p.designation})`;
      if (active && active.id === p.id) {
        opt.selected = true;
      }
      this.stampProfileSelect.appendChild(opt);
    });
  }

  handleProfileSelectChange(val) {
    if (val === 'current') return;
    const profiles = StorageManager.getProfiles();
    const found = profiles.find(p => p.id === val);
    if (!found) return;

    if (this.stampCompanyInput) this.stampCompanyInput.value = found.companyName || '';
    if (this.stampDesignationInput) this.stampDesignationInput.value = found.designation || '';
    if (this.stampSubtextInput) this.stampSubtextInput.value = found.location || '';
    if (this.stampRegInput) this.stampRegInput.value = found.regNo || '';
    if (found.defaultColor) {
      this.selectedStampColor = found.defaultColor;
      this.stampColorDots.forEach(dot => {
        if (dot.getAttribute('data-color') === found.defaultColor) {
          this.stampColorDots.forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
        }
      });
    }
    this.updateStampLivePreview();
    this.showToast(`Loaded profile: ${found.name || found.companyName}`);
  }

  handleAddNewProfile() {
    const quota = StorageManager.canSaveNewProfile();
    if (!quota.allowed) {
      this.showPaywall('Multiple company profiles is a Pro Pass feature. Upgrade to create unlimited profiles.');
      return;
    }

    const name = prompt('Enter Profile Name or Company Name:');
    if (!name || name.trim().length === 0) return;

    const newProfile = {
      name: name.trim(),
      companyName: this.stampCompanyInput ? this.stampCompanyInput.value.trim() : name.trim(),
      designation: this.stampDesignationInput ? this.stampDesignationInput.value.trim() : 'AUTHORIZED SIGNATORY',
      location: this.stampSubtextInput ? this.stampSubtextInput.value.trim() : '',
      regNo: this.stampRegInput ? this.stampRegInput.value.trim() : '',
      defaultColor: this.selectedStampColor || '#1d4ed8'
    };

    const res = StorageManager.saveProfile(newProfile);
    if (res.success) {
      this.renderProfilesSettings();
      this.renderStampProfileSelect();
      this.showToast(`✓ Profile "${name.trim()}" created!`);
    } else {
      this.showToast('Could not save profile: ' + res.reason);
    }
  }

  handleSaveCurrentAsProfile() {
    const active = StorageManager.getActiveProfile();
    const company = this.stampCompanyInput ? this.stampCompanyInput.value.trim() : '';
    if (!company) {
      this.showToast('Please enter a company name first');
      return;
    }

    if (active) {
      StorageManager.saveProfile({
        id: active.id,
        name: active.name || company,
        companyName: company,
        designation: this.stampDesignationInput ? this.stampDesignationInput.value.trim() : '',
        location: this.stampSubtextInput ? this.stampSubtextInput.value.trim() : '',
        regNo: this.stampRegInput ? this.stampRegInput.value.trim() : '',
        defaultColor: this.selectedStampColor
      });
      this.showToast(`✓ Saved to profile "${active.name || company}"`);
    } else {
      this.handleAddNewProfile();
    }
  }

  handleDeleteAllData() {
    const confirmed = confirm(
      '⚠️ Are you sure you want to permanently delete all your data?\\n\\n' +
      'This will erase all saved signatures, company stamps, company profiles, and recent document history on this device.\\n\\n' +
      'This action cannot be undone.'
    );
    if (!confirmed) return;

    StorageManager.clearAllData();
    this.renderProfilesSettings();
    this.renderRecentDocsSettings();
    this.renderStampProfileSelect();
    this.renderSavedSignatures();
    this.renderSavedStampsModal();
    this.showToast('✓ All user data has been permanently erased from device');
    if (this.settingsModal) this.settingsModal.classList.remove('active');
  }
}

// Global bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
