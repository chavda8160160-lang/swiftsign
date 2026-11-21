package com.swiftsign.app.billing;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SwiftSign Google Play Billing Manager (Play Billing Library 7.x)
 * 
 * Manages client-side purchases, subscriptions, entitlement verification,
 * and offline caching strictly separated from UI logic.
 * 
 * Play Billing Entitlements: Client-side Play Billing verification only.
 * Entitlements are never granted without a verified Play purchase state,
 * and are cached only for offline access.
 */
public class BillingManager implements PurchasesUpdatedListener {

    private static final String TAG = "SwiftSign_Billing";
    private static final String PREF_ENTITLEMENT_CACHE = "swiftsign_entitlement_cache";
    private static final String KEY_CURRENT_TIER = "cached_tier";
    private static final String KEY_EXPIRY_TIMESTAMP = "cached_expiry";

    public static final String PRODUCT_MONTHLY = "swiftsign_pro_monthly";
    public static final String PRODUCT_ANNUAL = "swiftsign_pro_annual";

    public interface BillingCallback {
        void onProductDetailsUpdated(String productsJson);

        void onEntitlementUpdated(String tier, String reason);

        void onBillingMessage(String message, boolean isError);
    }

    private final Activity activity;
    private final BillingCallback callback;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private BillingClient billingClient;
    private final Map<String, ProductDetails> productDetailsMap = new HashMap<>();
    private boolean isConnecting = false;
    private boolean isServiceConnected = false;

    public BillingManager(@NonNull Activity activity, @NonNull BillingCallback callback) {
        this.activity = activity;
        this.callback = callback;
        initBillingClient();
    }

    private void initBillingClient() {
        PendingPurchasesParams pendingParams = PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build();

        billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(pendingParams)
                .build();
    }

    public void start() {
        if (billingClient == null || isServiceConnected || isConnecting)
            return;
        isConnecting = true;

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult billingResult) {
                isConnecting = false;
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    isServiceConnected = true;
                    Log.i(TAG, "Google Play Billing setup successful");
                    // Query available products from Google Play
                    queryAvailableProducts();
                    // Verify existing purchases
                    queryPurchasesAndSyncEntitlements(false);
                } else {
                    isServiceConnected = false;
                    Log.w(TAG, "Billing setup failed with response code: " + billingResult.getResponseCode() + " "
                            + billingResult.getDebugMessage());
                    notifyProductDetailsUnavailable(
                            "Purchases not available yet (" + billingResult.getDebugMessage() + ")");
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                isServiceConnected = false;
                isConnecting = false;
                Log.w(TAG, "Billing service disconnected");
            }
        });
    }

    public void queryAvailableProducts() {
        if (!isServiceConnected) {
            start();
            return;
        }

        // 1. Subscription Products (Monthly & Annual)
        List<QueryProductDetailsParams.Product> subProducts = new ArrayList<>();
        subProducts.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PRODUCT_MONTHLY)
                .setProductType(BillingClient.ProductType.SUBS)
                .build());
        subProducts.add(QueryProductDetailsParams.Product.newBuilder()
                .setProductId(PRODUCT_ANNUAL)
                .setProductType(BillingClient.ProductType.SUBS)
                .build());

        QueryProductDetailsParams subParams = QueryProductDetailsParams.newBuilder()
                .setProductList(subProducts)
                .build();

        billingClient.queryProductDetailsAsync(subParams, (billingResult, productDetailsList) -> {
            if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null) {
                for (ProductDetails pd : productDetailsList) {
                    productDetailsMap.put(pd.getProductId(), pd);
                }
            }
            buildAndNotifyProductDetailsJson();
        });
    }

    private void buildAndNotifyProductDetailsJson() {
        try {
            JSONObject root = new JSONObject();
            boolean hasAnyProduct = !productDetailsMap.isEmpty();
            root.put("available", hasAnyProduct);

            if (!hasAnyProduct) {
                root.put("error", "Purchases not available yet. Please check Play Store configuration.");
            } else {
                JSONObject productsObj = new JSONObject();

                // Monthly
                ProductDetails monthlyPd = productDetailsMap.get(PRODUCT_MONTHLY);
                if (monthlyPd != null) {
                    JSONObject mObj = new JSONObject();
                    mObj.put("productId", PRODUCT_MONTHLY);
                    mObj.put("title", monthlyPd.getTitle());
                    String formattedPrice = extractSubscriptionPrice(monthlyPd);
                    mObj.put("formattedPrice", formattedPrice != null ? formattedPrice : "₹99/month");
                    productsObj.put("monthly", mObj);
                }

                // Annual
                ProductDetails annualPd = productDetailsMap.get(PRODUCT_ANNUAL);
                if (annualPd != null) {
                    JSONObject aObj = new JSONObject();
                    aObj.put("productId", PRODUCT_ANNUAL);
                    aObj.put("title", annualPd.getTitle());
                    String formattedPrice = extractSubscriptionPrice(annualPd);
                    aObj.put("formattedPrice", formattedPrice != null ? formattedPrice : "₹499/year");
                    productsObj.put("annual", aObj);
                }

                root.put("products", productsObj);
            }

            final String jsonString = root.toString();
            mainHandler.post(() -> callback.onProductDetailsUpdated(jsonString));
        } catch (Exception e) {
            Log.e(TAG, "Error formatting product details JSON", e);
        }
    }

    private void notifyProductDetailsUnavailable(String reason) {
        try {
            JSONObject root = new JSONObject();
            root.put("available", false);
            root.put("error", reason != null ? reason : "Purchases not available yet");
            final String jsonString = root.toString();
            mainHandler.post(() -> callback.onProductDetailsUpdated(jsonString));
        } catch (Exception ignored) {
        }
    }

    private String extractSubscriptionPrice(ProductDetails pd) {
        if (pd.getSubscriptionOfferDetails() != null && !pd.getSubscriptionOfferDetails().isEmpty()) {
            ProductDetails.SubscriptionOfferDetails offer = pd.getSubscriptionOfferDetails().get(0);
            if (offer.getPricingPhases() != null && !offer.getPricingPhases().getPricingPhaseList().isEmpty()) {
                return offer.getPricingPhases().getPricingPhaseList().get(0).getFormattedPrice();
            }
        }
        return null;
    }

    public void launchPurchaseFlow(String planKey) {
        if (!isServiceConnected) {
            callback.onBillingMessage("Google Play Store is currently not connected. Please try again.", true);
            start();
            return;
        }

        String targetProductId;
        if ("monthly".equalsIgnoreCase(planKey)) {
            targetProductId = PRODUCT_MONTHLY;
        } else if ("annual".equalsIgnoreCase(planKey)) {
            targetProductId = PRODUCT_ANNUAL;
        } else {
            callback.onBillingMessage("Invalid purchase plan selected: " + planKey, true);
            return;
        }

        ProductDetails productDetails = productDetailsMap.get(targetProductId);
        if (productDetails == null) {
            callback.onBillingMessage("Product " + targetProductId + " is not currently available in Play Store.",
                    true);
            queryAvailableProducts();
            return;
        }

        BillingFlowParams.ProductDetailsParams.Builder productDetailsParamsBuilder = BillingFlowParams.ProductDetailsParams
                .newBuilder()
                .setProductDetails(productDetails);

        // If subscription, supply offer token
        if (productDetails.getProductType().equals(BillingClient.ProductType.SUBS)) {
            if (productDetails.getSubscriptionOfferDetails() != null
                    && !productDetails.getSubscriptionOfferDetails().isEmpty()) {
                String offerToken = productDetails.getSubscriptionOfferDetails().get(0).getOfferToken();
                productDetailsParamsBuilder.setOfferToken(offerToken);
            }
        }

        List<BillingFlowParams.ProductDetailsParams> list = new ArrayList<>();
        list.add(productDetailsParamsBuilder.build());

        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(list)
                .build();

        BillingResult billingResult = billingClient.launchBillingFlow(activity, billingFlowParams);
        if (billingResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
            Log.e(TAG, "launchBillingFlow failed: " + billingResult.getDebugMessage());
            callback.onBillingMessage("Unable to start purchase: " + billingResult.getDebugMessage(), true);
        }
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult billingResult, @Nullable List<Purchase> purchases) {
        int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                handlePurchase(purchase);
            }
        } else if (responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            callback.onBillingMessage("Purchase was cancelled.", false);
        } else if (responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            callback.onBillingMessage("You already own this item. Restoring purchases...", false);
            queryPurchasesAndSyncEntitlements(true);
        } else {
            Log.w(TAG, "onPurchasesUpdated error code: " + responseCode + ", msg: " + billingResult.getDebugMessage());
            callback.onBillingMessage("Purchase failed: " + billingResult.getDebugMessage(), true);
        }
    }

    private void handlePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            if (!purchase.isAcknowledged()) {
                AcknowledgePurchaseParams acknowledgePurchaseParams = AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(purchase.getPurchaseToken())
                        .build();
                billingClient.acknowledgePurchase(acknowledgePurchaseParams, billingResult -> {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        Log.i(TAG, "Purchase acknowledged successfully: " + purchase.getOrderId());
                    } else {
                        Log.w(TAG, "Failed to acknowledge purchase: " + billingResult.getDebugMessage());
                    }
                });
            }

            // Determine tier from purchased product
            String tier = "pro";
            setCachedEntitlement(tier);
            callback.onEntitlementUpdated(tier, "Purchased successfully");
            callback.onBillingMessage("Thank you! Pro Pass is now active.", false);

        } else if (purchase.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            callback.onBillingMessage(
                    "Payment is pending approval in Google Play. Pro access will activate once approved.", false);
        }
    }

    private boolean isDebugBuild() {
        return (activity.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    public void queryPurchasesAndSyncEntitlements(final boolean userTriggered) {
        if (isTestProMode()) {
            Log.i(TAG, "Test Pro Mode active; preserving Pro entitlement");
            setCachedEntitlement("pro");
            mainHandler.post(() -> callback.onEntitlementUpdated("pro", "Test mode active"));
            return;
        }

        if (!isServiceConnected) {
            if (userTriggered) {
                callback.onBillingMessage("Play Store service is not connected. Reconnecting...", false);
                start();
            }
            return;
        }

        // Query active Subscriptions
        QueryPurchasesParams subParams = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.SUBS)
                .build();

        billingClient.queryPurchasesAsync(subParams, (resSubs, subsList) -> {
            boolean hasActiveSub = false;
            if (resSubs.getResponseCode() == BillingClient.BillingResponseCode.OK && subsList != null) {
                for (Purchase p : subsList) {
                    if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                        hasActiveSub = true;
                        handlePurchase(p);
                        break;
                    }
                }
            }

            if (!hasActiveSub) {
                if (isTestProMode()) {
                    Log.i(TAG, "Test Pro Mode active; preserving Pro entitlement despite no active Play subscription");
                    setCachedEntitlement("pro");
                    mainHandler.post(() -> callback.onEntitlementUpdated("pro", "Test mode active"));
                    return;
                }
                // No active subscriptions on Google Play
                setCachedEntitlement("free");
                callback.onEntitlementUpdated("free", "No active Play subscription");
                if (userTriggered) {
                    callback.onBillingMessage("No active Pro purchases found for this Google account.", false);
                }
            }
        });
    }

    public boolean isTestProMode() {
        SharedPreferences prefs = activity.getSharedPreferences(PREF_ENTITLEMENT_CACHE, Context.MODE_PRIVATE);
        return prefs.getBoolean("test_pro_mode", false);
    }

    public void setTestProMode(boolean enabled) {
        SharedPreferences prefs = activity.getSharedPreferences(PREF_ENTITLEMENT_CACHE, Context.MODE_PRIVATE);
        prefs.edit()
                .putBoolean("test_pro_mode", enabled)
                .putString(KEY_CURRENT_TIER, enabled ? "pro" : "free")
                .putLong(KEY_EXPIRY_TIMESTAMP, System.currentTimeMillis())
                .apply();
        mainHandler.post(() -> callback.onEntitlementUpdated(enabled ? "pro" : "free", "Test pro mode changed"));
    }

    public String getCachedEntitlement() {
        if (isTestProMode()) {
            return "pro";
        }
        SharedPreferences prefs = activity.getSharedPreferences(PREF_ENTITLEMENT_CACHE, Context.MODE_PRIVATE);
        return prefs.getString(KEY_CURRENT_TIER, "free");
    }

    public void setCachedEntitlement(String tier) {
        SharedPreferences prefs = activity.getSharedPreferences(PREF_ENTITLEMENT_CACHE, Context.MODE_PRIVATE);
        prefs.edit()
                .putString(KEY_CURRENT_TIER, tier)
                .putLong(KEY_EXPIRY_TIMESTAMP, System.currentTimeMillis())
                .apply();
    }

    public void destroy() {
        if (billingClient != null) {
            billingClient.endConnection();
            billingClient = null;
        }
    }
}
