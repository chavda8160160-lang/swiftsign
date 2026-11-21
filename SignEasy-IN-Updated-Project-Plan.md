# SignEasy-IN

## Updated Product, Technical & Business Plan

**Document version:** 2.0\
**Updated:** 16 November 2026\
**Status:** Pre-development / validation\
**Primary market:** India\
**Initial platform:** Android\
**Framework:** Flutter\
**Initial cash budget:** ₹2,500\
**Founder availability:** Approximately 3--4 hours per day\
**Long-term side-income goal:** ₹50,000 per month

------------------------------------------------------------------------

# 1. Executive Summary

SignEasy-IN is a lightweight, privacy-focused mobile application that
allows users to add a handwritten signature to PDF documents and images
from an Android phone.

The product is intended for Indian students, job seekers, working
professionals, freelancers, tenants, and other people who occasionally
need to sign and return documents without printing, signing by hand,
scanning, and emailing them.

The core experience should be:

1.  Open a PDF or image from the phone.
2.  Draw or select a saved handwritten signature.
3.  Place, resize, and rotate the signature.
4.  Export the signed document.
5.  Share it through WhatsApp, email, Drive, or another Android sharing
    destination.

The product's positioning is:

**"Sign PDFs privately. No account. No upload. No watermark."**

This promise must only be used when the implementation genuinely
processes documents locally and does not upload them. If a feature uses
cloud processing, explain that separately and obtain clear user consent.

## 1.1 Business objective

The long-term objective is to build a sustainable side-income product
that may eventually generate ₹50,000 per month.

The recommended milestones are:

  ------------------------------------------------------------------------
  Milestone             Monthly gross revenue target Purpose
  --------------------- ---------------------------- ---------------------
  Validation                              ₹0--₹1,000 Prove that users need
                                                     and use the product

  Early traction                              ₹5,000 Prove initial
                                                     monetization

  Growth                            ₹10,000--₹20,000 Improve acquisition
                                                     and retention

  Long-term target                          ₹50,000+ Build a repeatable
                                                     acquisition and
                                                     revenue model
  ------------------------------------------------------------------------

These are goals, not forecasts. The first objective is evidence of
repeated user value, not immediate revenue.

## 1.2 Constraints

-   Keep the initial cash investment within ₹2,500.
-   Founder time is limited to approximately 3--4 hours daily.
-   Build Android first; do not build iOS in the initial release.
-   Prefer local/offline processing and free development tools.
-   Do not build a large PDF editor or cloud document platform in the
    MVP.
-   Do not spend on paid advertising until organic acquisition and
    activation have been measured.

------------------------------------------------------------------------

# 2. Problem, Audience & Value Proposition

## 2.1 User problem

People receive forms and documents as PDFs or images and need to return
a signed copy. A common process involves printing, signing, scanning,
and sharing. That process is inconvenient when the user has only a
phone.

SignEasy-IN aims to reduce this process to a few simple steps.

## 2.2 Target users

### Primary audience

1.  **College students:** internship forms, college submissions,
    scholarship forms, and application paperwork.
2.  **Job seekers:** offer letters, onboarding documents, declarations,
    and other employment paperwork.
3.  **Working professionals:** routine forms and documents received by
    email or messaging applications.
4.  **Freelancers:** client forms, proposals, and administrative
    documents.
5.  **Tenants and households:** routine paperwork where a handwritten
    signature image is accepted by the recipient.

The app must not imply that every recipient, institution, employer,
bank, landlord, or government department accepts a pasted handwritten
signature image.

## 2.3 Core value proposition

> Add a handwritten signature to a PDF from your phone, without printing
> or creating an account.

Supporting benefits:

-   Simple signing workflow.
-   No watermark on exported documents.
-   No account required for core local features.
-   Offline-first operation.
-   Local document processing wherever technically possible.
-   Preserve the original PDF's text and vector content wherever
    possible.
-   Easy sharing through Android's standard share sheet.

## 2.4 Product principles

1.  **Fast:** a returning user should be able to sign a straightforward
    one-page PDF in approximately 10 seconds after opening it.
2.  **Private:** documents should remain on-device unless a clearly
    disclosed feature requires a transfer.
3.  **Reliable:** never silently export a blank, corrupted, or
    incorrectly positioned document.
4.  **Simple:** avoid forcing registration before the user can complete
    a basic signing task.
5.  **Honest:** explain the difference between a handwritten signature
    image and a certificate-based digital signature.
6.  **Useful free tier:** the free version must provide genuine value.

------------------------------------------------------------------------

# 3. Competitor & Market Positioning

The app will compete with established PDF applications. It must not
claim that no other app offers free PDF signing.

Competitors to review:

-   Adobe Acrobat Reader
-   Xodo PDF
-   iLovePDF

## 3.1 Competitor research checklist

Before finalizing the Play Store positioning, manually verify each
competitor's current Android version and region-specific availability.

  Comparison area       What to investigate
  --------------------- ------------------------------------------------------
  PDF signing           Can users draw and place a signature?
  Account requirement   Which features work without signing in?
  Offline use           Can documents be signed without internet?
  Watermarks            Are exports watermarked on the free tier?
  PDF tools             Are merge, split, rotate, and compression available?
  Pricing               What are current monthly and annual prices in India?
  Privacy               What processing occurs locally and what is uploaded?
  User experience       How many steps are required to sign and export?

Do not publish competitor claims until they have been checked against
current official product pages or app listings. Pricing, feature
availability, and policies can change.

## 3.2 Differentiation strategy

SignEasy-IN should not attempt to compete as a full PDF editor.

Its initial differentiation should be:

-   A focused signing workflow.
-   Offline-first signing.
-   No account for core functionality.
-   No watermark.
-   Local document handling.
-   Simple English and Hindi onboarding.
-   A clear, lightweight Android experience.

## 3.3 Positioning statement

**For Indian mobile users who need to sign and return documents,
SignEasy-IN is a simple PDF signing tool that makes handwritten
signature placement and sharing quick and private, without requiring
account creation for core local features.**

------------------------------------------------------------------------

# 4. Scope & Feature Roadmap

## 4.1 MVP --- required for first public release

  -----------------------------------------------------------------------
  Feature                 Requirement             Priority
  ----------------------- ----------------------- -----------------------
  Draw signature          Finger/stylus drawing   P0
                          with smooth strokes     

  Ink settings            Black and blue,         P0
                          adjustable thickness    

  Clear and undo          Correct mistakes before P0
                          saving                  

  Save signature locally  Reuse a signature on    P0
                          the device              

  Import PDF              Android file picker and P0
                          supported document      
                          sources                 

  PDF rendering           View pages at useful    P0
                          zoom levels             

  Place signature         Drag, resize, rotate    P0

  Multi-page PDF          Navigate and sign more  P0
                          than one page           

  Export PDF              Preserve original       P0
                          content where possible  

  Share/export            Android share sheet and P0
                          local save              

  Offline signing         Core workflow works     P0
                          without network access  

  Error handling          Corrupt, encrypted,     P0
                          unsupported, and        
                          oversized files         

  Privacy information     Explain local           P0
                          processing and file     
                          handling                
  -----------------------------------------------------------------------

## 4.2 Phase 2 --- only after MVP validation

-   Multiple signature placements.
-   Initials and alternate saved signatures.
-   Text and date insertion.
-   Page rotation and reordering.
-   Merge and split PDF.
-   PDF compression.
-   Additional export options.
-   Optional encrypted backup, only if users request it and the privacy
    design is ready.

## 4.3 Explicitly out of scope initially

-   Aadhaar eSign integration.
-   Certificate-based digital signature issuance.
-   Legal identity verification.
-   A document management vault.
-   Team workflows and enterprise administration.
-   Cloud document synchronization.
-   iOS application.
-   AI document analysis.
-   Automated signature detection.

Do not add features simply because competitors have them. Add them when
user feedback and product data justify the work.

------------------------------------------------------------------------

# 5. User Experience & Main Workflows

## 5.1 First-time user workflow

1.  Open the app.
2.  See a short explanation of what the app does.
3.  Tap "Select PDF".
4.  Choose a document using Android's document picker.
5.  Draw a signature.
6.  Preview the signature.
7.  Place it on the required page.
8.  Adjust size and position.
9.  Preview the result.
10. Export and share.

Avoid mandatory registration and unnecessary onboarding screens.

## 5.2 Returning user workflow

1.  Open a PDF.
2.  Select a saved signature.
3.  Place it.
4.  Preview.
5.  Export.

## 5.3 Important UX states

Design and test:

-   No recent documents.
-   No saved signature.
-   PDF loading.
-   Large PDF loading.
-   Password-protected PDF.
-   Unsupported PDF.
-   Export in progress.
-   Export completed.
-   Storage permission or destination issue.
-   Insufficient storage.
-   User cancels an operation.
-   App is interrupted during export.

The app must never show "Export successful" until the output file has
actually been written and validated.

------------------------------------------------------------------------

# 6. Technical Architecture

## 6.1 Recommended stack

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Notes
  ----------------------- ----------------------- -----------------------
  Mobile framework        Flutter / Dart          Android-first, one
                                                  codebase

  UI                      Flutter Material        Keep the interface
                                                  simple

  Signature capture       CustomPainter           Capture strokes and
                                                  render preview

  PDF viewing             Evaluate `pdfrx` and    Check licensing and
                          other maintained        Android compatibility
                          packages                

  PDF modification        Evaluate maintained PDF Verify true
                          libraries               vector-preserving
                                                  export

  Image processing        Dart image package or   Preserve source format
                          platform-native         where possible
                          processing              

  Local preferences       SharedPreferences or    Store non-sensitive
                          equivalent              settings

  Local structured data   SQLite/Drift or         Store metadata only
                          equivalent              when needed

  File access             Android Storage Access  Use user-selected file
                          Framework               access

  Crash reporting         Optional Firebase       Add only with clear
                          Crashlytics             privacy disclosures

  Analytics               Privacy-conscious       Track events, not
                          analytics               document contents

  Billing                 Google Play Billing     Use current Play
                                                  policies

  Ads                     Google AdMob            Only non-intrusive
                                                  placements
  -----------------------------------------------------------------------

Before selecting a package, verify its latest stable version,
maintenance activity, supported Android versions, license, export
capabilities, and known limitations.

## 6.2 High-level architecture

``` text
Flutter UI
   |
   +-- Home / Recent Documents
   |
   +-- PDF Import
   |
   +-- PDF Viewer
   |      |
   |      +-- Page Navigation
   |      +-- Zoom / Pan
   |
   +-- Signature Module
   |      |
   |      +-- Drawing Canvas
   |      +-- Stroke Smoothing
   |      +-- Signature Preview
   |      +-- Local Signature Storage
   |
   +-- Placement Module
   |      |
   |      +-- Drag
   |      +-- Resize
   |      +-- Rotate
   |      +-- Coordinate Conversion
   |
   +-- Export Module
   |      |
   |      +-- PDF Overlay
   |      +-- Validation
   |      +-- Output File
   |
   +-- Android Share Sheet
   |
   +-- Optional Billing / Ads / Analytics
```

## 6.3 Suggested project structure

``` text
signeasy_in/
|
+-- android/
+-- assets/
|   +-- icons/
|   +-- images/
|
+-- lib/
|   +-- main.dart
|   +-- app/
|   |   +-- app.dart
|   |   +-- routes.dart
|   |   +-- theme.dart
|   |
|   +-- core/
|   |   +-- constants/
|   |   +-- errors/
|   |   +-- permissions/
|   |   +-- utils/
|   |
|   +-- features/
|   |   +-- home/
|   |   |   +-- screens/
|   |   |   +-- widgets/
|   |   |
|   |   +-- pdf_import/
|   |   |   +-- data/
|   |   |   +-- domain/
|   |   |   +-- presentation/
|   |   |
|   |   +-- pdf_viewer/
|   |   |   +-- screens/
|   |   |   +-- widgets/
|   |   |
|   |   +-- signature/
|   |   |   +-- models/
|   |   |   +-- services/
|   |   |   +-- widgets/
|   |   |
|   |   +-- placement/
|   |   |   +-- models/
|   |   |   +-- services/
|   |   |
|   |   +-- pdf_export/
|   |   |   +-- services/
|   |   |   +-- validators/
|   |   |
|   |   +-- sharing/
|   |   +-- settings/
|   |   +-- billing/
|   |   +-- ads/
|   |
|   +-- shared/
|       +-- widgets/
|       +-- models/
|
+-- test/
|   +-- unit/
|   +-- widget/
|   +-- integration/
|
+-- pubspec.yaml
+-- README.md
```

This is a proposed structure. Keep the architecture proportionate to the
MVP; avoid unnecessary abstractions.

------------------------------------------------------------------------

# 7. PDF & Image Export Quality Requirements

Export quality is one of the most important technical requirements.

## 7.1 PDF export

Preferred approach:

-   Preserve the original PDF page content.
-   Add the signature as a vector or suitable PDF overlay.
-   Preserve selectable text.
-   Avoid converting the entire page into a screenshot.
-   Preserve page dimensions and page rotation.
-   Preserve content outside the signature area.
-   Keep output compatible with common PDF readers.

A library may have limitations around annotations, flattening,
encryption, fonts, transparency, and forms. Validate these before
committing to the implementation.

## 7.2 Coordinate conversion

The UI displays a rendered page, but PDF export uses PDF page
coordinates.

Implement and test conversion between:

-   Screen coordinates.
-   Zoomed viewer coordinates.
-   Page-local coordinates.
-   PDF coordinate system.
-   Rotated page coordinates.

Test placement at multiple zoom levels, scroll positions, screen sizes,
and page rotations.

## 7.3 Image export

For images:

-   Keep the original dimensions.
-   Keep transparency in the signature layer until compositing.
-   Avoid unnecessary resizing.
-   PNG can generally be re-encoded losslessly.
-   JPEG re-encoding can change pixels even at high quality.
-   Do not promise pixel-perfect JPEG output after re-encoding.
-   Preserve the original file where the format and implementation allow
    it.

## 7.4 Export validation

For each exported PDF:

1.  Confirm the output exists.
2.  Confirm the output can be reopened.
3.  Confirm page count is unchanged unless the user requested otherwise.
4.  Confirm page dimensions and rotation are preserved.
5.  Confirm the signature appears in the intended position.
6.  Confirm existing text remains selectable where expected.
7.  Confirm unrelated page content is not unintentionally altered.
8.  Test in multiple independent PDF readers.
9.  Check file size and rendering quality.

------------------------------------------------------------------------

# 8. Privacy, Security & Legal Boundaries

Documents can contain personal, employment, financial, and other
sensitive information. Privacy must be designed into the app.

## 8.1 Privacy requirements

-   Process documents locally for the core signing workflow.
-   Do not upload PDFs to analytics or crash-reporting services.
-   Do not log document text, signature strokes, or file contents.
-   Request access only to files selected by the user.
-   Store saved signatures locally with appropriate platform
    protections.
-   Clean up temporary files when safe.
-   Explain where exported documents are saved.
-   Provide a clear privacy policy.
-   Disclose any third-party SDK data collection.
-   Obtain consent before any optional cloud backup.

## 8.2 Signature terminology

The product adds a handwritten signature image to a document.

It does not automatically provide:

-   Aadhaar eSign.
-   A certificate-based digital signature.
-   Identity verification.
-   A trusted timestamp.
-   Proof that the signer is the person they claim to be.
-   Guaranteed legal acceptance.

Display an appropriate explanation in the app and Play Store listing.
Users must confirm that the recipient accepts this type of signature.

Seek qualified legal advice before making claims about regulatory
compliance or legal validity.

------------------------------------------------------------------------

# 9. Pricing & Monetization Strategy

## 9.1 Initial pricing experiments

  ------------------------------------------------------------------------
  Plan                            Initial test price Proposed features
  --------------------- ---------------------------- ---------------------
  Free                                            ₹0 3 documents/week, one
                                                     saved signature, no
                                                     watermark

  Basic                                    ₹29/month 15 documents/week,
                                                     three saved
                                                     signatures, no ads

  Pro Monthly                              ₹99/month Unlimited signing,
                                                     advanced tools,
                                                     multiple signatures

  Pro Annual                               ₹499/year Pro features with
                                                     annual billing
  ------------------------------------------------------------------------

The prices are hypotheses, not validated willingness-to-pay data.

## 9.2 Monetization principles

-   Keep basic signing useful without payment.
-   Never add a watermark as a payment restriction.
-   Do not interrupt the signing workflow with ads.
-   Place a small banner only where it does not interfere with document
    interaction.
-   Avoid misleading subscription screens.
-   Clearly display billing period, renewal, price, and cancellation
    information.
-   Follow current Google Play Billing rules and applicable alternative
    billing requirements.
-   Verify current platform fees rather than hardcoding an assumed
    percentage.

## 9.3 When to introduce subscriptions

Do not prioritize billing before the app can reliably import, sign,
export, and share documents.

Introduce a paid plan when:

-   Users complete successful signing sessions.
-   Users return to the app.
-   Users ask for higher limits or advanced tools.
-   User interviews indicate willingness to pay.
-   Pricing can be tested without harming the free experience.

## 9.4 Revenue scenarios

The following table uses the proposed prices and assumes the customer
counts are active paying subscribers.

  -----------------------------------------------------------------------------
  Scenario         Basic ₹29        Pro ₹99    Annual ₹499   Monthly-equivalent
                                                                          gross
  ----------- -------------- -------------- -------------- --------------------
  Early                   50             25             25               ₹5,417

  Growing                100            100            100              ₹15,058

  Strong                 200            200            200              ₹30,117

  Target mix             400            400            400              ₹60,233
  -----------------------------------------------------------------------------

Formula:

`Monthly-equivalent gross = Basic × 29 + Pro monthly × 99 + Annual customers × 499 / 12`

The target mix above is 400 customers in each tier. It generates
approximately ₹60,233 per month in monthly-equivalent gross revenue, not
₹50,000 net income.

Annual subscription receipts are collected at purchase or renewal and
should not be confused with monthly cash receipts.

## 9.5 Net revenue planning

Use this formula:

``` text
Gross revenue
- Applicable app-store / billing fees
- Refunds and chargebacks
- Hosting and third-party service costs
- Marketing costs
- Other operating expenses
= Operating income before personal income tax
```

For planning only, test several fee assumptions such as 15%, 20%, and
25%. These are sensitivity scenarios, not a statement of the actual fee
applicable to the account.

To target ₹50,000 in operating income, the required gross revenue will
be higher. Calculate it again using actual billing statements and
expenses after launch.

------------------------------------------------------------------------

# 10. User Acquisition & Marketing Strategy

## 10.1 Initial marketing budget

Initial paid marketing budget: ₹0.

Do not spend on advertisements until there is evidence that users
complete the signing workflow and return.

## 10.2 Organic channels

-   Instagram Reels.
-   YouTube Shorts.
-   Student communities.
-   Relevant Reddit communities.
-   Quora answers where genuinely helpful.
-   College groups and student networks.
-   Personal referrals.

Follow each platform's community and promotion rules. Do not spam links.

## 10.3 Video content plan

  -----------------------------------------------------------------------
  Video topic                         Hook
  ----------------------------------- -----------------------------------
  College form                        "Need to sign a college PDF? No
                                      printer needed."

  Internship offer                    "Sign your offer letter from your
                                      phone."

  Rental paperwork                    "Add your handwritten signature to
                                      a PDF."

  Reusable signature                  "Create your signature once and
                                      reuse it."

  Offline privacy                     "Sign locally on your phone without
                                      uploading the document."
  -----------------------------------------------------------------------

Only make the offline/privacy claim after testing and confirming the
implementation.

## 10.4 Weekly content schedule

  Day         Activity
  ----------- ---------------------------------------
  Monday      Create a student-use-case video
  Tuesday     Publish a short signing demonstration
  Wednesday   Collect user feedback
  Thursday    Publish a job-seeker use case
  Friday      Publish a feature demonstration
  Saturday    Review analytics and comments
  Sunday      Plan the next week's content

Target 3--5 short videos per week. Test English, Hindi, and Hinglish
captions.

## 10.5 Store listing

Potential keyword themes:

-   Sign PDF.
-   PDF signature.
-   Sign documents.
-   Handwritten signature.
-   PDF signer.
-   Offline PDF signing.

Do not use misleading keywords such as Aadhaar eSign if the product does
not provide that service.

Test screenshots that demonstrate the real workflow:

1.  Select a PDF.
2.  Draw a signature.
3.  Place the signature.
4.  Preview the document.
5.  Export and share.

------------------------------------------------------------------------

# 11. 90-Day Execution Plan

## Month 1 --- Validate and build the MVP

### Week 1: Product validation and prototype

-   Interview 15--20 target users.
-   Ask what they currently use to sign PDFs.
-   Identify the most frustrating steps.
-   Build a simple clickable or working prototype.
-   Test whether users understand the workflow.
-   Evaluate PDF library choices and licenses.

**Deliverable:** validated basic workflow and technical proof of
concept.

### Week 2: Flutter foundation

-   Create Flutter project.
-   Set up navigation and theme.
-   Implement home screen.
-   Implement Android PDF selection.
-   Integrate PDF rendering.
-   Test common PDF files.

**Deliverable:** user can open and view a PDF.

### Week 3: Signature creation and placement

-   Build signature canvas.
-   Add undo and clear.
-   Add ink thickness and color.
-   Add local signature save/reuse.
-   Implement drag and resize.
-   Implement coordinate conversion.

**Deliverable:** signature can be drawn and positioned.

### Week 4: Export and sharing

-   Implement PDF overlay.
-   Validate page count and layout.
-   Implement export.
-   Implement Android share sheet.
-   Test offline operation.
-   Fix critical bugs.

**Deliverable:** working end-to-end MVP.

## Month 2 --- Quality and public launch

### Week 5: Quality assurance

-   Test different Android devices.
-   Test scanned and text-based PDFs.
-   Test multi-page documents.
-   Test rotated pages.
-   Test large files.
-   Test password-protected PDFs.
-   Test export and reopening.

### Week 6: Closed testing

-   Recruit 20--50 testers.
-   Observe real signing sessions.
-   Record where users get stuck.
-   Fix crashes and incorrect exports.
-   Improve onboarding.

### Week 7: Store preparation

-   Create app icon.
-   Prepare screenshots.
-   Write accurate store description.
-   Publish privacy policy.
-   Complete required data safety disclosures.
-   Configure app signing and release tracks.
-   Review current Play Console testing and registration requirements.

### Week 8: Launch

-   Submit for review.
-   Respond to review feedback.
-   Publish when approved.
-   Start organic content.
-   Collect initial ratings and reviews without incentives that violate
    platform policies.

## Month 3 --- Validate business demand

### Week 9--10

-   Review activation and successful export data.
-   Fix onboarding issues.
-   Interview active and inactive users.
-   Identify most common document types.
-   Publish consistent marketing content.

### Week 11--12

-   Evaluate repeat usage.
-   Test free limits.
-   Interview users about paid features.
-   Test pricing and subscription interest.
-   Decide whether billing should be introduced.
-   Prepare the next feature roadmap.

**Month 3 decision:** continue, reposition, or pause based on actual
usage and user feedback.

------------------------------------------------------------------------

# 12. Daily Time Allocation

Available time: approximately 3--4 hours per day.

Suggested weekly allocation:

  Activity                      Hours/week
  --------------------------- ------------
  Development and testing               10
  Marketing and content                  5
  User feedback and support              3
  Analytics and planning                 2
  **Total**                         **20**

During the first month, development may take more time. After launch,
gradually increase time spent on acquisition and user feedback.

------------------------------------------------------------------------

# 13. KPI Dashboard

Track the following metrics from the beginning.

## 13.1 Product metrics

  Metric                          Initial internal target
  ----------------------------- -------------------------
  Download-to-first-signature                        50%+
  Successful PDF exports                             90%+
  Day-7 retention                                    15%+
  Day-30 retention                    Measure and improve
  App rating                                         4.3+
  Crash-free sessions                                99%+

These are working targets, not guaranteed benchmarks.

## 13.2 Business metrics

-   Daily active users.
-   Monthly active users.
-   Number of successful signing sessions.
-   Repeat signing users.
-   Free-to-paid conversion.
-   Active Basic subscribers.
-   Active Pro subscribers.
-   Annual subscription renewals.
-   Monthly recurring revenue.
-   Refund rate.
-   App-store fees.
-   Operating costs.
-   Revenue after fees.

## 13.3 Analytics events

Suggested events:

``` text
app_opened
onboarding_completed
pdf_import_started
pdf_import_succeeded
pdf_import_failed
signature_created
signature_saved
signature_selected
signature_placed
pdf_export_started
pdf_export_succeeded
pdf_export_failed
document_shared
subscription_screen_viewed
subscription_started
subscription_cancelled
```

Do not send document content, filenames, signature images, or personal
information to analytics.

## 13.4 Decision rules

-   Many downloads but few first signatures: improve onboarding.
-   Many imports but few exports: investigate signing and export UX.
-   Good first use but poor repeat use: investigate recurring use cases
    and retention.
-   Good repeat use but low paid conversion: test pricing and feature
    value.
-   Strong conversion but poor reviews: investigate reliability and
    customer support.

------------------------------------------------------------------------

# 14. Budget & Cost Controls

## 14.1 Initial budget

  Expense                                          Planned amount
  ---------------------------------------------- ----------------
  Google Play developer registration provision             ₹2,500
  Flutter and Dart                                             ₹0
  Development tools                                            ₹0
  Initial backend                                              ₹0
  Initial organic marketing                                    ₹0
  Design tools using free tiers                                ₹0
  **Initial budget ceiling**                           **₹2,500**

Google Play's developer registration fee is charged in USD. Verify the
current amount, exchange rate, and applicable taxes/charges before
payment. Do not assume ₹2,500 is the exact final amount.

## 14.2 Cost-control rules

-   Build and test before purchasing the developer account.
-   Avoid paid hosting in the MVP.
-   Avoid cloud document processing.
-   Do not purchase paid marketing before validation.
-   Avoid unnecessary third-party SDKs.
-   Review all package licenses and ongoing costs.
-   Revisit the budget after the first 100 active users.

------------------------------------------------------------------------

# 15. Risks & Mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Strong competition      Difficult acquisition   Focus on offline-first
                                                  simplicity

  Low repeat usage        Weak subscription value Measure repeat use
                                                  before scaling

  Low conversion          Low revenue             Interview users and
                                                  test pricing

  PDF export corruption   Loss of trust           Validate every export
                                                  path

  Incorrect signature     Poor user experience    Test coordinate
  position                                        conversion thoroughly

  Large PDF performance   Crashes and slow        Test large files and
                          response                memory usage

  Privacy concerns        User distrust           Local processing and
                                                  transparent disclosures

  Legal misunderstanding  Misleading product      Explain handwritten
                          claims                  signature image
                                                  limitations

  Play Store rejection    Launch delay            Follow current Play
                                                  policies

  Billing complexity      Monetization delay      Add billing after MVP
                                                  validation

  Marketing inconsistency Low acquisition         Maintain a realistic
                                                  content schedule

  Scope creep             Delayed launch          Keep Phase 2 out of MVP
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 16. Go / No-Go Decision Gates

Do not continue adding features automatically. Use evidence.

## Gate 1: Prototype validation

Proceed if users can understand and complete the signing workflow
without extensive help.

If users struggle, simplify the experience before adding more features.

## Gate 2: MVP quality

Proceed to public launch only when:

-   PDF import works reliably.
-   Signature placement is accurate.
-   Exported documents reopen correctly.
-   Multi-page PDFs are tested.
-   Offline operation works as advertised.
-   Privacy disclosures are ready.

## Gate 3: Early product traction

Review:

-   Number of active users.
-   Successful signing sessions.
-   Export failures.
-   Repeat users.
-   User reviews and feedback.

If downloads are high but successful signing is low, fix the product
before increasing marketing.

## Gate 4: Monetization

Introduce subscriptions when users demonstrate repeat value and interest
in paid features.

If users do not want to pay, do not force a subscription model. Consider
a smaller set of optional premium tools or non-intrusive advertising.

## Gate 5: Scale

Invest more time or money only when:

-   Acquisition channels are repeatable.
-   Product quality is stable.
-   Retention is improving.
-   Revenue is being measured accurately.
-   Support and maintenance are manageable.

------------------------------------------------------------------------

# 17. Longer-Term Roadmap

## Months 4--6

Only if the MVP shows traction:

-   Improve signature workflow.
-   Add date and text insertion.
-   Add multiple signature placements.
-   Improve multi-page handling.
-   Test premium pricing.
-   Improve Play Store conversion.
-   Build a small user-support process.

## Months 7--9

Only if users request these features:

-   Page rotation and reordering.
-   Merge and split.
-   PDF compression.
-   Additional saved signature profiles.
-   Optional encrypted backup.

## Months 10--12

Evaluate:

-   Whether the product can reach the ₹50,000 monthly revenue goal.
-   Whether Android acquisition is sustainable.
-   Whether iOS development is justified.
-   Whether a web landing page or web-based signing companion would
    help.
-   Whether more advanced document workflows are worth building.

Do not expand to iOS or cloud features just because the roadmap says so.
Use actual demand.

------------------------------------------------------------------------

# 18. Immediate Next Actions

## Before development

-   [ ] Review this plan and freeze MVP scope.
-   [ ] Interview 15--20 potential users.
-   [ ] Identify 5--10 representative PDFs for testing.
-   [ ] Compare PDF libraries for export and licensing.
-   [ ] Create a basic Flutter prototype.
-   [ ] Test signature placement and export quality.
-   [ ] Confirm local/offline processing.
-   [ ] Define privacy and temporary-file handling.

## Before public launch

-   [ ] Complete MVP.
-   [ ] Run unit, widget, and integration tests.
-   [ ] Test on multiple Android devices.
-   [ ] Recruit closed testers.
-   [ ] Fix critical bugs.
-   [ ] Prepare app icon and screenshots.
-   [ ] Publish privacy policy.
-   [ ] Complete Play Console declarations.
-   [ ] Verify current billing and advertising requirements.
-   [ ] Purchase developer registration only when ready.

## After launch

-   [ ] Review product analytics weekly.
-   [ ] Publish 3--5 useful videos per week.
-   [ ] Collect user feedback.
-   [ ] Improve first-signature completion.
-   [ ] Monitor export failures.
-   [ ] Measure repeat usage.
-   [ ] Validate willingness to pay.
-   [ ] Review revenue and operating costs monthly.

------------------------------------------------------------------------

# 19. Final Business Recommendation

SignEasy-IN is worth validating as a low-cost side project because it
addresses a recognizable mobile workflow and can be developed
incrementally.

However, the market already has established PDF tools. A good
implementation alone does not guarantee downloads or revenue.

The strongest initial strategy is:

1.  Build a focused Android MVP.
2.  Make local/offline signing genuinely work.
3.  Validate with real users before expanding.
4.  Build organic distribution through practical demonstrations.
5.  Measure successful signing and repeat usage.
6.  Introduce subscriptions only after demonstrating paid value.
7.  Scale spending only when actual data supports it.

**Primary objective:** prove that users prefer SignEasy-IN for a real
signing task.

**First financial milestone:** ₹5,000 monthly gross revenue.

**Next milestones:** ₹10,000, ₹20,000, and ultimately ₹50,000 monthly
gross revenue.

**Long-term objective:** build a reliable, maintainable product that can
generate side income without requiring continuous full-time attention.

------------------------------------------------------------------------

# 20. Assumptions & Items Requiring Verification

The following must be checked before implementation or publication:

-   Current Google Play registration fee and account requirements.
-   Current Play Store testing and release requirements.
-   Current Google Play Billing and alternative billing rules for India.
-   Applicable service fees and taxes.
-   Current competitor pricing and features.
-   PDF package licenses and export limitations.
-   Android storage and file-access behavior.
-   Privacy disclosures for all third-party SDKs.
-   Legal wording around handwritten signature images and digital
    signatures.
-   Actual user demand and willingness to pay.

Do not treat estimates in this plan as verified market statistics.

------------------------------------------------------------------------

**Document version:** 2.0\
**Project:** SignEasy-IN\
**Status:** Ready for user validation and MVP planning\
**Next review:** After prototype testing and initial user interviews
