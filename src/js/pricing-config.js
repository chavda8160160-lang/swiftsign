/**
 * SwiftSign Central Pricing & Entitlements Configuration
 * 
 * Fixed Rules:
 * - Pricing lives in ONE central config (product IDs, fallback display text, feature-to-tier map).
 * - Displayed prices come from Google Play ProductDetails when connected on Android.
 * - Plans: Free, Pro Monthly (₹99), Pro Annual (₹499).
 * - Web is Free only: Pro is available in the Android app only. Pro on Android does not unlock Pro on the web.
 * - Free tier: basic PDF signing, 1 saved signature, 1 saved company stamp, standard templates, transparent PNG export (1800px), PDF export, NO watermark, NO ads.
 * - Pro tier (Android only): unlimited saved signatures and stamps, multiple company profiles, paper signature scanner, multi-page "Sign All Pages", advanced templates and customization.
 * - Beta limitation: Client-side Play Billing on Android only (no backend). Entitlements come from Play Billing, never from backed-up local data.
 */

const PricingConfig = {
  // Application Information
  appName: 'SwiftSign',
  version: '1.0.0',
  supportEmail: 'support@swiftsign.app',
  playStoreUrl: '', // Set when Play Store listing is live; displays "Coming soon" when empty

  // Google Play Billing Product IDs (Android App Only)
  products: {
    monthly: {
      id: 'swiftsign_pro_monthly',
      type: 'subs',
      fallbackPrice: '₹99',
      periodText: '/month',
      badge: 'FLEXIBLE'
    },
    annual: {
      id: 'swiftsign_pro_annual',
      type: 'subs',
      fallbackPrice: '₹499',
      periodText: '/year',
      savingsText: 'Save 58%',
      badge: 'BEST VALUE'
    }
  },

  // Feature mapping by tier
  features: {
    free: [
      'Unlimited document exports',
      '1 saved signature',
      '1 saved company stamp',
      'Standard round & rectangular stamps',
      'Transparent PNG stamp export (1800px)',
      'Lossless vector PDF export',
      'Date & custom text placement',
      'Zero watermark, zero ads'
    ],
    pro: [
      'Unlimited saved signatures & stamps',
      'Multiple company profiles',
      '📷 Paper Signature Scanner',
      'Multi-page 1-tap "Sign All Pages"',
      'High-res transparent PNG stamp export',
      'Advanced templates & customization'
    ]
  },

  // Actions gated by Pro tier
  proGatedActions: {
    MULTIPLE_SIGNATURES: 'multiple_signatures',
    MULTIPLE_STAMPS: 'multiple_stamps',
    MULTIPLE_PROFILES: 'multiple_profiles',
    PAPER_SCANNER: 'paper_scanner',
    BATCH_SIGN_ALL_PAGES: 'batch_sign_all_pages',
    ADVANCED_TEMPLATES: 'advanced_templates'
  },

  // Legal wording (verbatim mandatory disclaimer)
  legalDisclaimer: 'SwiftSign creates graphical electronic signatures and business stamps for everyday documents. Acceptance and legal requirements for electronic signatures vary by document type and jurisdiction. SwiftSign does not provide cryptographic digital signatures, certificate-based signing, notarization or legal advice.',

  // Platform note
  platformNotice: 'Pro is available in the Android app only. Pro on Android does not unlock Pro on the web.',

  // Beta limitation note
  betaLimitation: 'Beta Version: Client-side Google Play Billing only. Entitlements are directly verified with Google Play Store on your device.'
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PricingConfig;
}
