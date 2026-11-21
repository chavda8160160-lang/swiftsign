/**
 * SwiftSign Billing Controller
 * 
 * Manages Google Play Billing interactions on Android, product details display,
 * entitlement synchronization, and the paywall interface.
 * 
 * Fixed Rules:
 * - Runtime detection: Android App with AndroidBridge vs Plain Web Browser.
 * - In Android App: Google Play Billing, Monthly (₹99) and Annual (₹499).
 * - On Web: Free only. Never show purchase buttons or a paywall. Pro features
 *   show "Pro is available in the SwiftSign Android app" with "Get the Android app".
 * - No Pro unlock on the web by any flag, URL parameter, or localStorage value.
 * - Displayed prices come from Google Play ProductDetails on Android.
 * - Never show paywall on first app launch; only on gated Pro actions.
 * - If Play Console products are not available, display "Purchases not available yet" and keep Pro locked.
 * - No fake timers, fake discounts, or misleading renewal wording.
 */

class BillingController {
  constructor(config = PricingConfig) {
    this.config = config;
    this.playProductsAvailable = false;
    this.playProducts = {};
    this.billingError = null;

    if (this.isTestProMode()) {
      if (typeof StorageManager !== 'undefined') {
        StorageManager.setUserTier('pro');
      }
    }

    this.initNativeCallbacks();
    this.initTestControls();
  }

  isTestProMode() {
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (!isAndroid) return false;
    if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.isTestProMode === 'function') {
      try {
        return window.AndroidBridge.isTestProMode();
      } catch (e) {}
    }
    return false;
  }

  setTestProMode(enabled) {
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (!isAndroid) return; // Web = Free only. No Pro unlock on the web.

    try {
      if (typeof StorageManager !== 'undefined') {
        StorageManager.setUserTier(enabled ? 'pro' : 'free');
      }
      if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.setTestProMode === 'function') {
        window.AndroidBridge.setTestProMode(enabled);
      }
    } catch (e) {
      console.warn('setTestProMode error:', e);
    }

    this.renderPaywallModal();
    if (window.app && typeof window.app.updateProBadges === 'function') {
      window.app.updateProBadges();
    }
    if (window.app && typeof window.app.renderSettingsBetaTest === 'function') {
      window.app.renderSettingsBetaTest();
    }
  }

  initTestControls() {
    if (typeof document === 'undefined') return;
    const btnToggleTestPro = document.getElementById('btn-toggle-test-pro');
    if (btnToggleTestPro) {
      btnToggleTestPro.addEventListener('click', () => {
        const isPro = typeof StorageManager !== 'undefined' ? StorageManager.isPro() : false;
        this.setTestProMode(!isPro);
        const newTier = typeof StorageManager !== 'undefined' ? StorageManager.getUserTier().toUpperCase() : 'FREE';
        if (window.app && typeof window.app.showToast === 'function') {
          window.app.showToast(`Switched to ${newTier} (Beta Test Mode)`);
        }
        const modal = document.getElementById('pricing-modal');
        if (modal && !isPro) modal.classList.remove('active');
      });
    }
  }

  initNativeCallbacks() {
    // Only register and query when AndroidBridge is present
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (!isAndroid) return;

    // 1. Product details received from Play Store
    window.handleBillingProductDetails = (data) => {
      this.onProductDetailsReceived(data);
    };

    // 2. Entitlement updated from Play Store verification
    window.handleEntitlementUpdated = (tier, reason) => {
      this.onEntitlementUpdated(tier, reason);
    };

    // 3. User messages from Play Billing
    window.handleBillingMessage = (message, isError) => {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast(message);
      }
    };

    // Initial query on startup if Android bridge is available
    if (window.AndroidBridge && typeof window.AndroidBridge.queryProducts === 'function') {
      try {
        window.AndroidBridge.queryProducts();
      } catch (e) {
        console.warn('Initial Play Store query failed:', e);
      }
    }
  }

  onProductDetailsReceived(data) {
    if (!data) return;
    this.playProductsAvailable = !!data.available;
    this.billingError = data.error || null;

    if (data.products) {
      this.playProducts = data.products;
    }

    // Refresh paywall UI if open
    this.renderPaywallModal();
  }

  onEntitlementUpdated(tier, reason) {
    if (this.isTestProMode()) {
      if (typeof StorageManager !== 'undefined') {
        StorageManager.setUserTier('pro');
      }
      this.renderPaywallModal();
      if (window.app && typeof window.app.updateProBadges === 'function') {
        window.app.updateProBadges();
      }
      return;
    }
    const cleanTier = (tier || 'free').toLowerCase();
    if (typeof StorageManager !== 'undefined') {
      StorageManager.setUserTier(cleanTier);
    }
    this.renderPaywallModal();
    if (window.app && typeof window.app.updateProBadges === 'function') {
      window.app.updateProBadges();
    }
  }

  getMonthlyPriceText() {
    if (this.playProducts.monthly && this.playProducts.monthly.formattedPrice) {
      return this.playProducts.monthly.formattedPrice;
    }
    return this.config.products.monthly.fallbackPrice;
  }

  getAnnualPriceText() {
    if (this.playProducts.annual && this.playProducts.annual.formattedPrice) {
      return this.playProducts.annual.formattedPrice;
    }
    return this.config.products.annual.fallbackPrice;
  }

  /**
   * Triggers purchase flow for selected plan ('monthly', 'annual')
   */
  purchasePlan(planKey) {
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (!isAndroid) {
      // On web: never allow purchase flows. Show info notice.
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('Pro is available in the SwiftSign Android app.');
      }
      return;
    }
    if (window.AndroidBridge && typeof window.AndroidBridge.purchasePlan === 'function') {
      window.AndroidBridge.purchasePlan(planKey);
    }
  }

  /**
   * Restores existing purchases (Android only)
   */
  restorePurchases() {
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (isAndroid && window.AndroidBridge && typeof window.AndroidBridge.restorePurchases === 'function') {
      window.AndroidBridge.restorePurchases();
    } else {
      if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('SwiftSign on the web is Free only.');
      }
    }
  }

  /**
   * Opens the paywall modal triggered by a specific Pro action.
   * On Web: Opens web locked notice modal ("Pro is available in the SwiftSign Android app")
   * On Android: Opens native Play Billing paywall modal
   */
  showPaywall(reasonText = '') {
    const isAndroid = typeof StorageManager !== 'undefined' ? StorageManager.isAndroidApp() : false;
    if (!isAndroid) {
      // WEB: Never show purchase buttons or paywall. Show the Web Pro Locked Modal.
      const webModal = document.getElementById('web-pro-locked-modal');
      if (webModal) {
        const reasonEl = document.getElementById('web-pro-reason-text');
        if (reasonEl) {
          reasonEl.textContent = reasonText || 'This advanced feature requires SwiftSign Pro.';
        }
        webModal.classList.add('active');
        return;
      }
    }

    // ANDROID APP:
    const modal = document.getElementById('pricing-modal');
    if (!modal) return;

    const banner = document.getElementById('paywall-context-banner');
    if (banner) {
      if (reasonText && reasonText.trim().length > 0) {
        banner.textContent = reasonText;
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }

    this.renderPaywallModal();
    modal.classList.add('active');
  }

  renderPaywallModal() {
    const currentTier = typeof StorageManager !== 'undefined' ? StorageManager.getUserTier() : 'free';
    const isProActive = currentTier === 'pro';

    // Elements
    const freeBtn = document.getElementById('btn-choose-free');
    const proMonthlyBtn = document.getElementById('btn-choose-pro-monthly');
    const proAnnualBtn = document.getElementById('btn-choose-pro-annual');
    const unavailableBanner = document.getElementById('pricing-unavailable-banner');

    const monthlyPriceEl = document.getElementById('pricing-monthly-display');
    const annualPriceEl = document.getElementById('pricing-annual-display');

    // Update display prices from Play ProductDetails
    if (monthlyPriceEl) monthlyPriceEl.textContent = this.getMonthlyPriceText();
    if (annualPriceEl) annualPriceEl.textContent = this.getAnnualPriceText();

    // Play Store availability state
    if (!this.playProductsAvailable) {
      if (unavailableBanner) {
        unavailableBanner.style.display = 'block';
      }
      if (proMonthlyBtn) proMonthlyBtn.disabled = true;
      if (proAnnualBtn) proAnnualBtn.disabled = true;
    } else {
      if (unavailableBanner) unavailableBanner.style.display = 'none';
      if (proMonthlyBtn) proMonthlyBtn.disabled = isProActive;
      if (proAnnualBtn) proAnnualBtn.disabled = isProActive;
    }

    const btnToggleTestPro = document.getElementById('btn-toggle-test-pro');
    if (btnToggleTestPro) {
      btnToggleTestPro.textContent = isProActive ? '✓ Pro Test Active (Switch to Free)' : '⚡ Enable Pro Mode for Testing';
      btnToggleTestPro.style.background = isProActive ? '#059669' : '#2563eb';
    }

    if (freeBtn) {
      freeBtn.textContent = !isProActive ? 'Active Plan' : 'Free Tier';
      freeBtn.disabled = !isProActive;
    }

    if (proMonthlyBtn && isProActive) proMonthlyBtn.textContent = 'Pro Active';
    if (proAnnualBtn && isProActive) proAnnualBtn.textContent = 'Pro Active';
  }
}

// Global instance
if (typeof window !== 'undefined') {
  window.billingController = new BillingController(PricingConfig);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BillingController;
}
