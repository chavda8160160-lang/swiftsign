# SwiftSign ✍️

> **"Sign Documents Privately. Fast, Secure, and 100% On-Device."**
> A modern, lightweight, privacy-first mobile & web application built for professionals, freelancers, businesses, and individuals globally to sign PDFs and images without losing resolution.

---

## 🚀 Key Features

1. **⚡ Fast 10-Second Signing Workflow:**
   - Open any PDF or image from your phone or desktop.
   - Draw or choose a saved handwritten signature.
   - Freely place, resize, and rotate anywhere on the document.
   - Export and share via email, messaging apps, Drive, or direct download.

2. **🔒 100% On-Device Local Processing:**
   - Client-side processing using `pdf-lib` and HTML5 Canvas.
   - Documents **never leave your device** and are **never uploaded to any server or cloud**.

3. **💎 "No Quality Loss" Pipeline:**
   - **PDF:** Native vector overlay embedded into the PDF object stream. Selectable text stays crisp and selectable; file size remains compact without full-page screenshots.
   - **Image:** Composites transparent signatures directly onto original image pixels with 100% resolution preserved.

4. **✍️ Signature Studio:**
   - Smooth Bezier curves (responsive to finger or stylus/pen).
   - Classic Slate Black (`#0f172a`) and Professional Blue (`#1d4ed8`).
   - Thickness selector: Fine (2px), Medium (3.5px), Bold (5.5px).
   - Undo and Clear tools.
   - Auto-crop bounding box so only the signature itself is placed.
   - Local device storage: Save signatures on-device for 1-tap reuse.

5. **🌐 Global, Professional Experience:**
   - International, professional copy suited for contracts, NDAs, invoices, offer letters, and forms.
   - Clean, transparent plan pricing ($0 Free, $3.99/mo Basic, $9.99/mo Pro).
   - Standard international electronic signature notice.

---

## 🏃 Running the App

### Local Web Server:
```powershell
node server.js
```
Open **`http://localhost:3000`** in your browser.

### Native Android App:
```powershell
cd android
.\gradlew.bat installDebug
```
Or open the `android` folder in Android Studio and hit **Run ▶**.
