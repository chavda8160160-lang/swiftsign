package com.swiftsign.app;

import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;

import com.swiftsign.app.billing.BillingManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "SwiftSign";
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024L; // 50 MB limit

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private WebViewAssetLoader assetLoader;
    private boolean isWebViewLoaded = false;
    private String pendingInboundJson = null;
    private BillingManager billingManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Clear cached inbound files on app startup
        clearInboundCache();

        if (savedInstanceState != null) {
            pendingInboundJson = savedInstanceState.getString("pendingInboundJson");
        }

        webView = findViewById(R.id.webview);

        // Apply system window insets so content never collides with status bar or navigation bar
        ViewCompat.setOnApplyWindowInsetsListener(webView, (v, windowInsets) -> {
            Insets insets = windowInsets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(insets.left, insets.top, insets.right, insets.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        setupWebView();

        // Initialize Google Play Billing Manager (Phase 4)
        initBillingManager();

        // Process any incoming cold-start intent (Share / Open With)
        processInboundIntent(getIntent());

        // Load via secure virtual HTTPS domain
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        processInboundIntent(intent);
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString("pendingInboundJson", pendingInboundJson);
    }

    @Override
    protected void onDestroy() {
        if (billingManager != null) {
            billingManager.destroy();
        }
        super.onDestroy();
    }

    private void initBillingManager() {
        billingManager = new BillingManager(this, new BillingManager.BillingCallback() {
            @Override
            public void onProductDetailsUpdated(String productsJson) {
                runOnUiThread(() -> {
                    if (webView != null) {
                        webView.evaluateJavascript("if (window.handleBillingProductDetails) { window.handleBillingProductDetails(" + productsJson + "); }", null);
                    }
                });
            }

            @Override
            public void onEntitlementUpdated(String tier, String reason) {
                runOnUiThread(() -> {
                    if (webView != null) {
                        webView.evaluateJavascript("if (window.handleEntitlementUpdated) { window.handleEntitlementUpdated('" + tier + "', '" + reason + "'); }", null);
                    }
                });
            }

            @Override
            public void onBillingMessage(String message, boolean isError) {
                runOnUiThread(() -> {
                    Toast.makeText(MainActivity.this, message, isError ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT).show();
                    if (webView != null) {
                        webView.evaluateJavascript("if (window.handleBillingMessage) { window.handleBillingMessage(" + JSONObject.quote(message) + ", " + isError + "); }", null);
                    }
                });
            }
        });
        billingManager.start();
    }

    /**
     * Hardened WebView Setup:
     * - Disables direct file and content URI access
     * - Disables file URL cross-origin access
     * - Disables HTML5 Database API
     * - Restricts network loading strictly to WebViewAssetLoader
     */
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);

        // Configure modern WebViewAssetLoader to serve assets securely over HTTPS
        assetLoader = new WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this))
                .build();

        // Native Android Bridge
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if ("appassets.androidplatform.net".equals(url.getHost())) {
                    return assetLoader.shouldInterceptRequest(url);
                }
                // Block all non-asset network requests
                Log.w(TAG, "Blocked unauthorized network request: " + url);
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden", null, null);
            }

            @SuppressWarnings("deprecation")
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, String urlString) {
                Uri url = Uri.parse(urlString);
                if ("appassets.androidplatform.net".equals(url.getHost())) {
                    return assetLoader.shouldInterceptRequest(url);
                }
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden", null, null);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                isWebViewLoaded = true;
                deliverPendingInboundToWebView();
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("SwiftSignJS", consoleMessage.message() + " [" 
                        + consoleMessage.sourceId() + ":" + consoleMessage.lineNumber() + "]");
                return true;
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }
                MainActivity.this.filePathCallback = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("*/*");
                String[] mimeTypes = {"application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"};
                intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);

                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    MainActivity.this.filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Cannot open file picker", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    // =========================================================================
    // Inbound Intent Handling (ACTION_VIEW, ACTION_SEND, ACTION_SEND_MULTIPLE)
    // =========================================================================

    private void processInboundIntent(Intent intent) {
        if (intent == null || intent.getAction() == null) return;
        String action = intent.getAction();

        try {
            if (Intent.ACTION_VIEW.equals(action)) {
                Uri uri = intent.getData();
                if (uri != null) processSingleUri(uri);
            } else if (Intent.ACTION_SEND.equals(action)) {
                Uri uri = intent.getParcelableExtra(Intent.EXTRA_STREAM);
                if (uri == null) uri = intent.getData();
                if (uri != null) processSingleUri(uri);
            } else if (Intent.ACTION_SEND_MULTIPLE.equals(action)) {
                ArrayList<Uri> uris = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
                if (uris != null && !uris.isEmpty()) {
                    processMultipleUris(uris);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing inbound intent", e);
            Toast.makeText(this, "Could not open shared file: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    private void processSingleUri(Uri uri) {
        try {
            String displayName = resolveDisplayName(uri, "shared_document");
            String mimeType = resolveMimeType(uri, displayName);

            File cachedFile = copyUriToInboundCache(uri, displayName);
            if (cachedFile == null) return; // Rejected (e.g. > 50MB)

            String base64 = readFileToBase64(cachedFile);
            JSONObject json = new JSONObject();
            json.put("type", "single");
            json.put("name", displayName);
            json.put("mimeType", mimeType);
            json.put("base64", base64);

            pendingInboundJson = json.toString();
            deliverPendingInboundToWebView();
        } catch (Exception e) {
            Log.e(TAG, "Failed to process single URI", e);
            Toast.makeText(this, "Error opening shared document", Toast.LENGTH_SHORT).show();
        }
    }

    private void processMultipleUris(ArrayList<Uri> uris) {
        try {
            JSONArray filesArray = new JSONArray();
            for (Uri uri : uris) {
                if (uri == null) continue;
                String displayName = resolveDisplayName(uri, "image_" + System.currentTimeMillis() + ".jpg");
                String mimeType = resolveMimeType(uri, displayName);
                File cachedFile = copyUriToInboundCache(uri, displayName);
                if (cachedFile != null) {
                    JSONObject fileObj = new JSONObject();
                    fileObj.put("name", displayName);
                    fileObj.put("mimeType", mimeType);
                    fileObj.put("base64", readFileToBase64(cachedFile));
                    filesArray.put(fileObj);
                }
            }

            if (filesArray.length() > 0) {
                JSONObject json = new JSONObject();
                json.put("type", "multiple");
                json.put("files", filesArray);

                pendingInboundJson = json.toString();
                deliverPendingInboundToWebView();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to process multiple URIs", e);
            Toast.makeText(this, "Error opening shared images", Toast.LENGTH_SHORT).show();
        }
    }

    private String resolveDisplayName(Uri uri, String fallback) {
        try (Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (nameIdx != -1) {
                    String name = cursor.getString(nameIdx);
                    if (name != null && !name.trim().isEmpty()) return name;
                }
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    private String resolveMimeType(Uri uri, String filename) {
        String mime = getContentResolver().getType(uri);
        if (mime != null && !mime.isEmpty()) return mime;
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) return "application/pdf";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    private File copyUriToInboundCache(Uri uri, String displayName) {
        File inboundDir = new File(getCacheDir(), "inbound");
        if (!inboundDir.exists()) inboundDir.mkdirs();

        String safeName = displayName.replaceAll("[^a-zA-Z0-9._-]", "_");
        File targetFile = new File(inboundDir, "inbound_" + System.currentTimeMillis() + "_" + safeName);

        byte[] buf = new byte[16384];
        long total = 0;
        try (InputStream is = getContentResolver().openInputStream(uri);
             FileOutputStream fos = new FileOutputStream(targetFile)) {
            if (is == null) throw new IOException("Cannot open InputStream for: " + uri);

            int read;
            while ((read = is.read(buf)) != -1) {
                total += read;
                if (total > MAX_FILE_SIZE) {
                    fos.close();
                    targetFile.delete();
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, 
                            "File is larger than the 50 MB limit. Please select a smaller file.", 
                            Toast.LENGTH_LONG).show());
                    return null;
                }
                fos.write(buf, 0, read);
            }
            fos.flush();
            return targetFile;
        } catch (Exception e) {
            Log.e(TAG, "copyUriToInboundCache failed for " + uri, e);
            if (targetFile.exists()) targetFile.delete();
            return null;
        }
    }

    private String readFileToBase64(File file) throws IOException {
        int length = (int) file.length();
        byte[] bytes = new byte[length];
        try (FileInputStream fis = new FileInputStream(file)) {
            int offset = 0;
            int numRead = 0;
            while (offset < bytes.length && (numRead = fis.read(bytes, offset, bytes.length - offset)) >= 0) {
                offset += numRead;
            }
        }
        return Base64.encodeToString(bytes, Base64.NO_WRAP);
    }

    private void clearInboundCache() {
        try {
            File inboundDir = new File(getCacheDir(), "inbound");
            if (inboundDir.exists() && inboundDir.isDirectory()) {
                File[] files = inboundDir.listFiles();
                if (files != null) {
                    for (File f : files) {
                        f.delete();
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to clear inbound cache", e);
        }
    }

    private void deliverPendingInboundToWebView() {
        if (!isWebViewLoaded || pendingInboundJson == null || pendingInboundJson.isEmpty()) {
            return;
        }
        final String data = pendingInboundJson;
        pendingInboundJson = null;
        runOnUiThread(() -> {
            String script = "if (window.handleInboundData) { window.handleInboundData(" + data + "); }";
            webView.evaluateJavascript(script, null);
        });
    }

    // =========================================================================
    // Native JavaScript Interface Bridge
    // =========================================================================

    public class AndroidBridge {

        @JavascriptInterface
        public String getPendingInboundData() {
            String data = pendingInboundJson;
            pendingInboundJson = null;
            return data != null ? data : "";
        }

        @JavascriptInterface
        public void clearInboundCache() {
            MainActivity.this.clearInboundCache();
        }

        // Persistent storage backed by SharedPreferences
        @JavascriptInterface
        public String getSecureItem(String key, String defaultValue) {
            try {
                android.content.SharedPreferences prefs = getSharedPreferences("swiftsign_vault", MODE_PRIVATE);
                return prefs.getString(key, defaultValue);
            } catch (Exception e) {
                return defaultValue;
            }
        }

        @JavascriptInterface
        public void setSecureItem(String key, String value) {
            try {
                android.content.SharedPreferences prefs = getSharedPreferences("swiftsign_vault", MODE_PRIVATE);
                prefs.edit().putString(key, value).apply();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Google Play Billing (Phase 4)
        @JavascriptInterface
        public void purchasePlan(String tier) {
            if (billingManager != null) {
                billingManager.launchPurchaseFlow(tier);
            }
        }

        @JavascriptInterface
        public void restorePurchases() {
            if (billingManager != null) {
                billingManager.queryPurchasesAndSyncEntitlements(true);
            }
        }

        @JavascriptInterface
        public void queryProducts() {
            if (billingManager != null) {
                billingManager.queryAvailableProducts();
            }
        }

        @JavascriptInterface
        public String getCachedEntitlement() {
            if (billingManager != null) {
                return billingManager.getCachedEntitlement();
            }
            return "free";
        }

        @JavascriptInterface
        public void setCachedEntitlement(String tier) {
            if (billingManager != null) {
                billingManager.setCachedEntitlement(tier);
            }
        }

        @JavascriptInterface
        public boolean isTestProMode() {
            if (billingManager != null) {
                return billingManager.isTestProMode();
            }
            return false;
        }

        @JavascriptInterface
        public void setTestProMode(boolean enabled) {
            if (billingManager != null) {
                billingManager.setTestProMode(enabled);
            }
        }

        @JavascriptInterface
        public void saveFile(String base64Data, String filename, String mimeType) {
            try {
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                boolean isImage = mimeType != null && mimeType.startsWith("image/");
                String targetFolder = isImage ? "Pictures/SwiftSign" : "Downloads/SwiftSign";
                boolean saved = false;

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    try {
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                        values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);

                        String relativePath = isImage
                                ? (Environment.DIRECTORY_PICTURES + "/SwiftSign")
                                : (Environment.DIRECTORY_DOWNLOADS + "/SwiftSign");
                        values.put(MediaStore.MediaColumns.RELATIVE_PATH, relativePath);
                        values.put(MediaStore.MediaColumns.IS_PENDING, 1);

                        Uri collection = isImage
                                ? MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                                : MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);

                        Uri itemUri = getContentResolver().insert(collection, values);
                        if (itemUri != null) {
                            try (OutputStream out = getContentResolver().openOutputStream(itemUri)) {
                                if (out != null) {
                                    out.write(bytes);
                                    out.flush();
                                }
                            }
                            values.clear();
                            values.put(MediaStore.MediaColumns.IS_PENDING, 0);
                            getContentResolver().update(itemUri, values, null, null);
                            saved = true;
                        }
                    } catch (Exception inner) {
                        inner.printStackTrace();
                    }
                }

                // Fallback for pre-Q or custom ROMs
                if (!saved) {
                    File baseDir = Environment.getExternalStoragePublicDirectory(
                            isImage ? Environment.DIRECTORY_PICTURES : Environment.DIRECTORY_DOWNLOADS
                    );
                    File appDir = new File(baseDir, "SwiftSign");
                    if (!appDir.exists()) appDir.mkdirs();
                    File destFile = new File(appDir, filename);
                    try (FileOutputStream fos = new FileOutputStream(destFile)) {
                        fos.write(bytes);
                        fos.flush();
                    }
                    MediaScannerConnection.scanFile(MainActivity.this, new String[]{destFile.getAbsolutePath()}, new String[]{mimeType}, null);
                }

                final String successMsg = "Saved to " + targetFolder + "/" + filename;
                runOnUiThread(() -> Toast.makeText(MainActivity.this, successMsg, Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Save failed: " + e.getMessage(), Toast.LENGTH_LONG).show());
            }
        }

        @JavascriptInterface
        public void shareFile(String base64Data, String filename, String mimeType) {
            try {
                byte[] bytes = Base64.decode(base64Data, Base64.DEFAULT);
                File cachePath = new File(getCacheDir(), "shared_docs");
                if (!cachePath.exists()) cachePath.mkdirs();

                File newFile = new File(cachePath, filename);
                try (FileOutputStream stream = new FileOutputStream(newFile)) {
                    stream.write(bytes);
                    stream.flush();
                }

                Uri contentUri = FileProvider.getUriForFile(MainActivity.this, "com.swiftsign.app.fileprovider", newFile);
                Intent shareIntent = new Intent(Intent.ACTION_SEND);
                shareIntent.setType(mimeType != null ? mimeType : "*/*");
                shareIntent.putExtra(Intent.EXTRA_STREAM, contentUri);
                shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(shareIntent, "Share Document"));
            } catch (Exception e) {
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Share failed: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        }

        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }
    }
}
