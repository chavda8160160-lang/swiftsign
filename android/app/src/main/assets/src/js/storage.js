/**
 * Storage & Entitlement Manager for SwiftSign
 * 
 * Rules:
 * 1. Free tier: Basic signing, 1 saved signature, 1 saved company stamp, unlimited exports.
 * 2. Pro tier: Unlimited saved signatures and stamps, paper scanner, multi-page batch signing.
 * 3. Zero export quotas, zero clock-tamper code, zero public storage scanning.
 */

const STORAGE_KEYS = {
  SIGNATURES: 'swiftsign_signatures_v1',
  STAMPS: 'swiftsign_stamps_v1',
  PROFILES: 'swiftsign_profiles_v1',
  ACTIVE_PROFILE: 'swiftsign_active_profile_v1',
  RECENT_DOCS: 'swiftsign_recent_docs_v1',
  PREFERENCES: 'swiftsign_prefs_v1',
  USER_TIER: 'swiftsign_user_tier_v1'
};

class StorageManager {

  // Universal reader (LocalStorage + Android Native SharedPreferences)
  static _getItem(key, defaultVal = null) {
    try {
      if (typeof window !== 'undefined' && window.AndroidBridge && window.AndroidBridge.getSecureItem) {
        const val = window.AndroidBridge.getSecureItem(key, '');
        if (val && val.length > 0) return val;
      }
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      console.warn('Storage read failed:', e);
    }
    return defaultVal;
  }

  // Universal writer (writes to both LocalStorage and Android SharedPreferences)
  static _setItem(key, value) {
    const strVal = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, strVal);
      }
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }

    try {
      if (typeof window !== 'undefined' && window.AndroidBridge && window.AndroidBridge.setSecureItem) {
        window.AndroidBridge.setSecureItem(key, strVal);
      }
    } catch (e) {
      console.warn('AndroidBridge write failed:', e);
    }
  }

  // Runtime Detection: Android App with AndroidBridge vs Plain Web Browser
  static isAndroidApp() {
    return (typeof window !== 'undefined' && !!(window.AndroidBridge)) ||
           (typeof global !== 'undefined' && !!global.__MOCK_ANDROID_APP__);
  }

  // User Tier & Entitlement (Derived from verified Play Billing on native Android)
  static getUserTier() {
    // WEB = FREE ONLY. Pro is available in the Android app only.
    // No Pro unlock on the web by any flag, URL parameter or localStorage value.
    if (!this.isAndroidApp()) {
      return 'free';
    }

    if (typeof window !== 'undefined' && window.AndroidBridge) {
      if (typeof window.AndroidBridge.isTestProMode === 'function') {
        try {
          if (window.AndroidBridge.isTestProMode()) return 'pro';
        } catch (e) {}
      }

      if (typeof window.AndroidBridge.getCachedEntitlement === 'function') {
        try {
          const nativeTier = window.AndroidBridge.getCachedEntitlement();
          if (nativeTier) return nativeTier;
        } catch (e) {
          console.warn('Native entitlement query failed:', e);
        }
      }
    }

    const storedTier = this._getItem(STORAGE_KEYS.USER_TIER, null);
    return storedTier || 'free';
  }

  static isPro() {
    return this.getUserTier() === 'pro';
  }

  static setUserTier(tier) {
    if (!this.isAndroidApp()) {
      return 'free';
    }
    this._setItem(STORAGE_KEYS.USER_TIER, tier);
    const isPro = tier === 'pro';
    if (typeof window !== 'undefined' && window.AndroidBridge) {
      try {
        if (typeof window.AndroidBridge.setCachedEntitlement === 'function') {
          window.AndroidBridge.setCachedEntitlement(tier);
        }
        if (typeof window.AndroidBridge.setTestProMode === 'function') {
          window.AndroidBridge.setTestProMode(isPro);
        }
      } catch (e) {
        console.warn('Native setCachedEntitlement/setTestProMode failed:', e);
      }
    }
    return tier;
  }

  // Limits
  static getMaxSavedSignatures() {
    return this.isPro() ? Infinity : 1; // Free tier allows 1 saved signature
  }

  static getMaxSavedStamps() {
    return this.isPro() ? Infinity : 1; // Free tier allows 1 saved stamp
  }

  // Signatures
  static getSignatures() {
    try {
      const data = this._getItem(STORAGE_KEYS.SIGNATURES) || this._getItem('signeasy_signatures_v1');
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
    } catch (e) {
      console.warn('Failed to parse signatures:', e);
      return [];
    }
  }

  static canSaveNewSignature() {
    const list = this.getSignatures();
    const max = this.getMaxSavedSignatures();
    return {
      allowed: list.length < max,
      current: list.length,
      max: max,
      tier: this.getUserTier()
    };
  }

  static saveSignature(signatureData) {
    try {
      const quota = this.canSaveNewSignature();
      if (!quota.allowed) {
        return { error: 'QUOTA_EXCEEDED', quota };
      }

      const list = this.getSignatures();
      const newSig = {
        id: 'sig_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        name: signatureData.name || `Signature ${list.length + 1}`,
        ...signatureData
      };
      list.unshift(newSig);
      const maxStored = this.getMaxSavedSignatures();
      const trimmed = list.slice(0, Math.min(list.length, maxStored));
      this._setItem(STORAGE_KEYS.SIGNATURES, trimmed);
      return { success: true, signature: newSig };
    } catch (e) {
      console.error('Failed to save signature:', e);
      return { error: e.message };
    }
  }

  static deleteSignature(id) {
    try {
      let list = this.getSignatures();
      list = list.filter(s => s.id !== id);
      this._setItem(STORAGE_KEYS.SIGNATURES, list);
      return true;
    } catch (e) {
      console.error('Failed to delete signature:', e);
      return false;
    }
  }

  // Stamps
  static getStamps() {
    try {
      const data = this._getItem(STORAGE_KEYS.STAMPS);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
    } catch (e) {
      console.warn('Failed to parse stamps:', e);
      return [];
    }
  }

  static canSaveNewStamp() {
    const list = this.getStamps();
    const max = this.getMaxSavedStamps();
    return {
      allowed: list.length < max,
      current: list.length,
      max: max,
      tier: this.getUserTier()
    };
  }

  static saveStamp(stampData) {
    try {
      const quota = this.canSaveNewStamp();
      if (!quota.allowed) {
        return { error: 'QUOTA_EXCEEDED', quota };
      }

      const list = this.getStamps();
      const newStamp = {
        id: 'stamp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        name: stampData.name || stampData.companyName || `Company Stamp ${list.length + 1}`,
        ...stampData
      };
      list.unshift(newStamp);
      const maxStored = this.getMaxSavedStamps();
      const trimmed = list.slice(0, Math.min(list.length, maxStored));
      this._setItem(STORAGE_KEYS.STAMPS, trimmed);
      return { success: true, stamp: newStamp };
    } catch (e) {
      console.error('Failed to save stamp:', e);
      return { error: e.message };
    }
  }

  static renameStamp(id, newName) {
    try {
      if (!newName || !newName.trim()) return false;
      const list = this.getStamps();
      const item = list.find(s => s.id === id);
      if (item) {
        item.name = newName.trim();
        this._setItem(STORAGE_KEYS.STAMPS, list);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to rename stamp:', e);
      return false;
    }
  }

  static deleteStamp(id) {
    try {
      let list = this.getStamps();
      list = list.filter(s => s.id !== id);
      this._setItem(STORAGE_KEYS.STAMPS, list);
      return true;
    } catch (e) {
      console.error('Failed to delete stamp:', e);
      return false;
    }
  }

  // Export permission - Free tier has NO document limit
  static canExportDocument() {
    return { allowed: true, tier: this.getUserTier() };
  }

  // Preferences
  static getPreferences() {
    try {
      const data = this._getItem(STORAGE_KEYS.PREFERENCES);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : {
        inkColor: '#0f172a',
        thickness: 3.5,
        lang: 'en'
      };
    } catch (e) {
      return { inkColor: '#0f172a', thickness: 3.5, lang: 'en' };
    }
  }

  static savePreferences(prefs) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      this._setItem(STORAGE_KEYS.PREFERENCES, updated);
      return updated;
    } catch (e) {
      return null;
    }
  }

  // =========================================================================
  // Company Profiles (Phase 5)
  // =========================================================================

  static getProfiles() {
    try {
      const data = this._getItem(STORAGE_KEYS.PROFILES);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
    } catch (e) {
      console.warn('Failed to parse profiles:', e);
      return [];
    }
  }

  static getMaxProfiles() {
    return this.isPro() ? Infinity : 1; // Free tier allows 1 profile, Pro allows unlimited
  }

  static canSaveNewProfile() {
    const list = this.getProfiles();
    const max = this.getMaxProfiles();
    return {
      allowed: list.length < max,
      current: list.length,
      max: max,
      tier: this.getUserTier()
    };
  }

  static getActiveProfile() {
    const list = this.getProfiles();
    if (list.length === 0) return null;
    const activeId = this._getItem(STORAGE_KEYS.ACTIVE_PROFILE);
    if (activeId) {
      const found = list.find(p => p.id === activeId);
      if (found) return found;
    }
    return list[0];
  }

  static setActiveProfile(id) {
    this._setItem(STORAGE_KEYS.ACTIVE_PROFILE, id);
    return id;
  }

  static saveProfile(profileData) {
    try {
      const list = this.getProfiles();
      const existingIdx = list.findIndex(p => p.id === profileData.id);

      if (existingIdx === -1) {
        // New profile creation - check quota
        const quota = this.canSaveNewProfile();
        if (!quota.allowed) {
          return { success: false, error: 'QUOTA_EXCEEDED', reason: `Limit reached (${quota.current}/${quota.max})` };
        }
        const newProfile = {
          id: profileData.id || ('prof_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
          name: profileData.name || profileData.companyName || 'Default Profile',
          companyName: profileData.companyName || '',
          designation: profileData.designation || 'AUTHORIZED SIGNATORY',
          location: profileData.location || '',
          regNo: profileData.regNo || '',
          defaultColor: profileData.defaultColor || '#1d4ed8',
          defaultTemplate: profileData.defaultTemplate || 'authorized_signatory',
          createdAt: Date.now()
        };
        list.push(newProfile);
        this._setItem(STORAGE_KEYS.PROFILES, list);
        this.setActiveProfile(newProfile.id);
        return { success: true, profile: newProfile };
      } else {
        // Update existing profile
        list[existingIdx] = {
          ...list[existingIdx],
          ...profileData,
          updatedAt: Date.now()
        };
        this._setItem(STORAGE_KEYS.PROFILES, list);
        return { success: true, profile: list[existingIdx] };
      }
    } catch (e) {
      console.error('Failed to save profile:', e);
      return { success: false, error: 'SAVE_FAILED', reason: e.message };
    }
  }

  static deleteProfile(id) {
    try {
      let list = this.getProfiles();
      list = list.filter(p => p.id !== id);
      this._setItem(STORAGE_KEYS.PROFILES, list);
      const activeId = this._getItem(STORAGE_KEYS.ACTIVE_PROFILE);
      if (activeId === id) {
        this._setItem(STORAGE_KEYS.ACTIVE_PROFILE, list.length > 0 ? list[0].id : '');
      }
      return true;
    } catch (e) {
      console.error('Failed to delete profile:', e);
      return false;
    }
  }

  // =========================================================================
  // Recent Documents (Metadata only, never contents - Phase 5)
  // =========================================================================

  static getRecentDocuments() {
    try {
      const data = this._getItem(STORAGE_KEYS.RECENT_DOCS);
      return data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
    } catch (e) {
      return [];
    }
  }

  static addRecentDocument(meta) {
    if (!meta || !meta.name) return;
    try {
      let recents = this.getRecentDocuments();
      // Store metadata only: name, date, size, type (NO document content)
      const entry = {
        name: meta.name,
        date: meta.date || Date.now(),
        size: meta.size || 0,
        type: meta.type || 'pdf'
      };
      recents = recents.filter(r => r.name !== entry.name);
      recents.unshift(entry);
      if (recents.length > 20) recents = recents.slice(0, 20); // Cap at 20
      this._setItem(STORAGE_KEYS.RECENT_DOCS, recents);
    } catch (e) {
      console.warn('Failed to add recent doc:', e);
    }
  }

  static clearRecentDocuments() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.RECENT_DOCS);
      }
      this._setItem(STORAGE_KEYS.RECENT_DOCS, []);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Data reset & Privacy (Phase 5)
  static clearAllData() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.SIGNATURES);
        localStorage.removeItem(STORAGE_KEYS.STAMPS);
        localStorage.removeItem(STORAGE_KEYS.PROFILES);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.RECENT_DOCS);
        localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
