/**
 * Internationalization & Global Content for SwiftSign
 */

const I18N_DICTIONARY = {
  en: {
    app_title: 'SwiftSign',
    app_tagline: 'Sign Documents Privately. Fast, Secure, and 100% On-Device.',
    privacy_badge: '100% Offline & Private',
    btn_select_file: 'Choose Document (PDF or Image)',
    btn_try_sample: 'Try Sample Document',
    drag_drop_hint: 'Drop your PDF, JPG, or PNG here (or click to browse)',
    features_title: 'Why SwiftSign?',
    feat_1_title: '⚡ Fast & Simple',
    feat_1_desc: 'Sign contracts, NDAs, offer letters, or invoices in seconds. No account needed.',
    feat_2_title: '🔒 100% On-Device Privacy',
    feat_2_desc: 'Documents are processed locally on your device. No document uploads to SwiftSign servers.',
    feat_3_title: '💎 True Vector Quality',
    feat_3_desc: 'Text stays crisp and selectable. Never rasterized into blurry screenshots or degraded.',
    feat_4_title: '🚫 Zero Watermarks',
    feat_4_desc: 'Clean, professional output ready for clients, employers, banks, and business paperwork.',

    // Editor UI
    page_indicator: 'Page {current} of {total}',
    btn_prev_page: 'Previous',
    btn_next_page: 'Next',
    btn_zoom_in: 'Zoom In',
    btn_zoom_out: 'Zoom Out',
    btn_fit_width: 'Fit Width',
    btn_add_signature: 'Add Signature',
    btn_export: 'Finish & Sign',
    // Footer & Legal
    copyright_notice: '© 2026 SwiftSign™. All rights reserved.',
    app_footer_notice: 'SwiftSign™ is a graphical electronic signature and business stamp utility.',
    btn_clear_all: 'Reset',

    // Signature Modal
    modal_sign_title: 'Create Your Signature',
    ink_black: 'Black Ink',
    ink_blue: 'Blue Ink',
    btn_undo: 'Undo',
    btn_clear_canvas: 'Clear',
    btn_save_signature: 'Save to Device',
    btn_use_signature: 'Place on Document',
    saved_signatures: 'Saved Signatures',
    no_saved_sigs: 'No saved signatures yet. Draw one above to save it locally!',

    // Placement instructions
    placement_tip: 'Drag signature to move, use corner handle to resize, or top handle to rotate.',

    // Export Modal
    modal_export_title: 'Your Signed Document is Ready!',
    export_disclaimer: 'SwiftSign creates graphical electronic signatures and business stamps for everyday documents. Acceptance and legal requirements for electronic signatures vary by document type and jurisdiction. SwiftSign does not provide cryptographic digital signatures, certificate-based signing, notarization or legal advice.',
    btn_download: 'Download Signed Document',
    btn_share: 'Share via WhatsApp / Email',
    btn_back_editor: 'Back to Editor',
    export_success: 'Document signed successfully!',
    export_error: 'Failed to export document. Please try again.',

    // Pricing Modal
    pricing_title: 'Simple, Transparent Plans',
    tier_free: 'Free Forever',
    tier_free_price: '₹0',
    tier_free_features: ['Unlimited document exports', '1 saved signature', '1 saved company stamp', 'Lossless vector PDF export', 'No watermark ever'],
    tier_pro: 'Pro Pass',
    tier_pro_price: '₹99 / mo or ₹499 / yr',
    tier_pro_features: ['Unlimited saved signatures & stamps', 'Multiple company profiles', 'Paper signature scanner', 'Multi-page 1-tap sign', 'High-res transparent PNG export']
  }
};

class I18n {
  constructor(lang = 'en') {
    this.currentLang = lang;
  }

  setLanguage(lang) {
    if (I18N_DICTIONARY[lang]) {
      this.currentLang = lang;
      this.applyToDOM();
    }
  }

  t(key, params = {}) {
    const dict = I18N_DICTIONARY[this.currentLang] || I18N_DICTIONARY.en;
    let text = dict[key] || I18N_DICTIONARY.en[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
  }

  applyToDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', this.t(key));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.setAttribute('title', this.t(key));
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18n, I18N_DICTIONARY };
}
