# Browser Compatibility Guide for Hyperscribe

This guide covers how to launch Hyperscribe on different browser platforms, what modifications are needed, and platform-specific considerations.

---

## Table of Contents

1. [Chrome Web Store](#chrome-web-store)
2. [Microsoft Edge Add-ons](#microsoft-edge-add-ons)
3. [Firefox Add-ons (AMO)](#firefox-add-ons-amo)
4. [Opera Add-ons](#opera-add-ons)
5. [Safari Web Extensions](#safari-web-extensions)
6. [Brave Browser](#brave-browser)

---

## Chrome Web Store

### Compatibility: ✅ FULLY COMPATIBLE

**Status**: Hyperscribe is built for Chrome Manifest V3 and requires zero modifications.

### Submission Process

1. **Create Developer Account**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay $5 one-time developer registration fee
   - Verify your email and identity

2. **Prepare Extension Package**
   ```bash
   # Create a zip file of the extension (exclude git files, docs, etc.)
   zip -r hyperscribe-v1.0.0.zip . \
     -x "*.git*" \
     -x "CLAUDE.md" \
     -x "MODULE_EXTRACTION_GUIDE.md" \
     -x "CHROME_WEB_STORE_LISTING.md" \
     -x "BROWSER_COMPATIBILITY_GUIDE.md" \
     -x "PRIVACY_POLICY.md" \
     -x "LAUNCH_CHECKLIST.md"
   ```

3. **Required Assets**
   - ✅ Extension zip file
   - ✅ 128x128 icon (already in icons/icon128.png)
   - 📸 At least 1 screenshot (1280x800 or 640x400 recommended)
   - 🎨 Promotional tile: 440x280 PNG/JPG
   - Optional: Marquee promo tile (1400x560) for featured placement

4. **Fill Out Store Listing**
   - Use content from CHROME_WEB_STORE_LISTING.md
   - Category: Productivity
   - Language: English (add more as needed)
   - Privacy policy: Link to your hosted PRIVACY_POLICY.md or paste inline

5. **Pricing**
   - Free version: No payment setup needed
   - Premium (£5 lifetime): Set up Chrome Web Store Payments or use external payment processor
   - Note: Chrome Web Store Payments takes 5% commission

6. **Review Process**
   - Initial review: 1-3 business days
   - Updates: Usually within 24 hours
   - Rejections: Common issues include unclear privacy policy, permissions explanation, or insufficient screenshots

### Testing Before Submission

```bash
# Load unpacked extension
# 1. Navigate to chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select hyperscribe/
# 4. Test all features thoroughly
```

---

## Microsoft Edge Add-ons

### Compatibility: ✅ FULLY COMPATIBLE

**Status**: Edge uses Chromium, so Chrome extensions work without modification.

### Submission Process

1. **Create Developer Account**
   - Visit [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login)
   - Free registration (no fee)
   - Requires Microsoft account

2. **Prepare Extension**
   - Use the same zip file as Chrome (Manifest V3 supported)
   - No modifications needed to manifest.json

3. **Required Assets**
   - ✅ Extension zip file
   - ✅ Icons (same as Chrome)
   - 📸 At least 1 screenshot (1280x800 or 640x400)
   - 🎨 Store logo: 300x300 PNG
   - Optional: Promotional images (1400x560)

4. **Fill Out Store Listing**
   - Similar to Chrome Web Store
   - Category: Productivity & Tools
   - Privacy policy required

5. **Pricing**
   - Free version: Straightforward
   - Premium: Use Microsoft Partner Center's payment system or external processor
   - Microsoft takes 15% commission for in-store purchases

6. **Review Process**
   - Typically 24-72 hours
   - Generally faster than Chrome Web Store
   - Similar requirements around privacy and permissions

### Testing

```bash
# Edge supports Chrome extension development workflow
# edge://extensions -> "Load unpacked"
```

### Platform Notes

- Edge Add-ons store has less traffic than Chrome Web Store
- Edge users can install Chrome extensions directly from Chrome Web Store (with a warning)
- Consider listing on both for maximum reach

---

## Firefox Add-ons (AMO)

### Compatibility: ⚠️ REQUIRES MODIFICATIONS

**Status**: Firefox supports Manifest V3 as of Firefox 109+, but with some differences.

### Required Changes to manifest.json

```json
{
  "manifest_version": 3,
  "name": "Hyperscribe",

  // ADD Firefox-specific fields
  "browser_specific_settings": {
    "gecko": {
      "id": "hyperscribe@yourdomain.com",
      "strict_min_version": "109.0"
    }
  },

  // MODIFY: Firefox uses "browser" API instead of "chrome"
  // However, chrome.* API is aliased to browser.* so code works as-is

  // VERIFY: Background service worker
  "background": {
    "scripts": ["background.js"]  // Firefox prefers this over service_worker
  },

  // REST OF MANIFEST STAYS THE SAME
}
```

### Code Changes Required

**Option 1: No changes needed** (Recommended)
Firefox aliases `chrome.*` to `browser.*`, so your existing code works.

**Option 2: Universal compatibility** (For best practices)
```javascript
// Add to top of background.js, popup.js
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Then use browserAPI.storage.local instead of chrome.storage.local
```

For Hyperscribe, **Option 1 is sufficient** - no code changes needed.

### Submission Process

1. **Create Developer Account**
   - Visit [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
   - Free registration
   - Requires Firefox account

2. **Prepare Extension**
   - Create Firefox-specific manifest.json (see above)
   - Test in Firefox Developer Edition
   - Create signed XPI or submit unsigned ZIP

3. **Required Assets**
   - ✅ Extension ZIP file (with Firefox manifest)
   - ✅ Icons (same as Chrome, but verify 48x48 icon looks good)
   - 📸 At least 1 screenshot (1280x800 recommended)
   - No promotional tiles required

4. **Fill Out Listing**
   - Summary (250 characters)
   - Full description (uses Markdown)
   - Categories: Productivity
   - License: Choose appropriate license (MIT, GPL, proprietary, etc.)
   - Privacy policy: Required

5. **Review Process**
   - **Automatic review**: If code passes automated checks, published within minutes
   - **Manual review**: If flagged, 1-14 days (extensive code review)
   - Firefox has strictest review process of all browsers
   - Expect detailed questions about permissions, privacy, and code functionality

6. **Signing**
   - All Firefox extensions must be signed by Mozilla
   - Happens automatically during submission
   - Can't distribute unsigned extensions to regular Firefox users

### Testing

```bash
# Firefox Developer Edition
# about:debugging -> "This Firefox" -> "Load Temporary Add-on"
# Select manifest.json file
```

### Platform Notes

- Firefox users are privacy-conscious - emphasize local storage and zero tracking
- AMO has excellent search discoverability
- No ability to do paid extensions through AMO - must use external payment
- Consider offering a donate link instead of paid premium

---

## Opera Add-ons

### Compatibility: ✅ FULLY COMPATIBLE

**Status**: Opera uses Chromium, so Chrome extensions work directly.

### Submission Process

1. **Create Developer Account**
   - Visit [Opera Add-ons Developer Portal](https://addons.opera.com/developer)
   - Free registration
   - Requires Opera account

2. **Prepare Extension**
   - Use same zip file as Chrome
   - Zero modifications needed

3. **Required Assets**
   - ✅ Extension zip file
   - ✅ Icons (same as Chrome)
   - 📸 At least 1 screenshot (612x408 or 1280x800)
   - 🎨 Icon: 128x128 PNG

4. **Fill Out Listing**
   - Summary (up to 132 characters)
   - Description
   - Category: Productivity
   - Support URL
   - Privacy policy

5. **Review Process**
   - Usually 1-3 days
   - Less strict than Chrome or Firefox
   - Manual review by Opera team

### Platform Notes

- Smallest user base of the major browsers
- Opera users can install Chrome extensions via [Install Chrome Extensions](https://addons.opera.com/en/extensions/details/install-chrome-extensions/) add-on
- Consider this lower priority unless targeting Opera specifically

---

## Safari Web Extensions

### Compatibility: ❌ REQUIRES SIGNIFICANT CONVERSION

**Status**: Safari supports Web Extensions as of Safari 14+, but requires Xcode and significant conversion work.

### Required Changes

Safari extensions are packaged as native macOS/iOS apps with an embedded web extension component. This is a major architectural change.

### Conversion Process

1. **Requirements**
   - macOS with Xcode 12+
   - Apple Developer account ($99/year for distribution)
   - Swift/Objective-C knowledge helpful but not required

2. **Use Safari Web Extension Converter**
   ```bash
   # Install Xcode Command Line Tools
   xcode-select --install

   # Run Safari converter (built into Xcode)
   xcrun safari-web-extension-converter /path/to/hyperscribe
   ```

3. **What Changes**
   - Creates Xcode project with Swift app wrapper
   - Converts manifest.json to Safari format
   - Creates native macOS/iOS app bundle
   - Extension runs inside this app container

4. **Required Code Changes**
   - Replace `chrome.*` API with `browser.*` API
   - Safari has more restrictive CSP
   - Some Chrome APIs may not be available
   - Permissions work differently

5. **Submission Process**
   - Submit through App Store Connect (same as iOS apps)
   - Full App Store review process (7-14 days typical)
   - Much stricter review than browser extension stores
   - Requires app privacy labels, descriptions, etc.

### Recommendation for Hyperscribe

**⏸️ DEFER SAFARI SUPPORT**

Reasons:
- Requires $99/year Apple Developer membership
- Significant development time (1-2 weeks for conversion and testing)
- App Store review is most stringent
- Safari extension market is much smaller than Chrome/Firefox/Edge
- Complex update process

**Suggested Timeline:**
1. Launch on Chrome, Edge, Firefox first
2. Gather user feedback and iterate
3. If demand for Safari version exists, invest in conversion
4. Alternatively, consider web app version for Safari users

---

## Brave Browser

### Compatibility: ✅ FULLY COMPATIBLE

**Status**: Brave uses Chromium and directly supports Chrome extensions.

### Distribution

Brave doesn't have its own extension store. Users install extensions via:

1. **Chrome Web Store** (recommended)
   - Brave users can install Chrome extensions directly
   - No modifications needed
   - No additional submission required

2. **Manual Installation**
   - Users can load unpacked extensions in Brave
   - Same process as Chrome Developer mode

### Platform Notes

- Brave has privacy-focused user base - emphasize local storage
- No additional work required beyond Chrome Web Store listing
- Mention Brave compatibility in Chrome Web Store description

---

## Summary Matrix

| Browser | Compatibility | Code Changes | Review Time | Cost | Priority |
|---------|--------------|--------------|-------------|------|----------|
| **Chrome** | ✅ Native | None | 1-3 days | $5 one-time | **HIGH** |
| **Edge** | ✅ Native | None | 1-3 days | Free | **HIGH** |
| **Firefox** | ⚠️ Minor | Manifest only | Minutes-14 days | Free | **MEDIUM** |
| **Opera** | ✅ Native | None | 1-3 days | Free | **LOW** |
| **Brave** | ✅ Via Chrome | None | N/A | Via Chrome | **AUTO** |
| **Safari** | ❌ Major | Significant | 7-14 days | $99/year | **DEFER** |

---

## Recommended Launch Strategy

### Phase 1: Chromium Browsers (Week 1)
1. ✅ Chrome Web Store
2. ✅ Microsoft Edge Add-ons
3. ✅ (Automatic) Brave support via Chrome Store

**Why**: Same codebase, 80%+ browser market share, fastest path to users.

### Phase 2: Firefox (Week 2-3)
1. ⚠️ Create Firefox-specific manifest
2. ⚠️ Test in Firefox Developer Edition
3. ⚠️ Submit to AMO

**Why**: Privacy-conscious user base aligns with Hyperscribe values, second-largest extension market.

### Phase 3: Opera (Optional, Week 3-4)
1. ✅ Submit same package as Chrome

**Why**: Low effort, small additional user base.

### Phase 4: Safari (Future, 2-3 months out)
1. ❌ Defer until Chrome/Edge/Firefox are established
2. ❌ Gather user demand data
3. ❌ Invest in conversion if ROI justifies cost

**Why**: High cost/effort, smaller market, complex maintenance.

---

## Platform-Specific Marketing Tips

### Chrome
- Emphasize productivity and keyboard shortcuts
- Target developers and power users
- Showcase themes and customization

### Edge
- Highlight Microsoft ecosystem integration
- Professional/enterprise angle
- Productivity and workflow optimization

### Firefox
- Lead with privacy and local storage
- Open-source ethos (consider open-sourcing)
- No tracking, no telemetry messaging

### Opera
- Emphasize speed and minimalism
- Gaming/streaming audience secondary use case
- Built-in features complement Hyperscribe

### Brave
- Privacy-first messaging
- Crypto-friendly user base (potential Web3 features later?)
- No-tracking, local-first architecture

---

## Testing Checklist Across Browsers

Before submitting to each store, test:

- [ ] Extension loads without errors
- [ ] All keyboard shortcuts work
- [ ] Theme switching functions
- [ ] Font controls update correctly
- [ ] Emoji picker keyboard navigation
- [ ] Templates CRUD operations
- [ ] Note export (TXT, MD, HTML)
- [ ] Resize handle behavior
- [ ] Storage usage display
- [ ] Settings import/export
- [ ] Tabbed notes (premium)
- [ ] Confirmation dialogs
- [ ] All panels open/close correctly
- [ ] Scrollbar styling (Firefox may differ)
- [ ] Icon displays correctly in toolbar

---

## Support Documentation per Platform

### Chrome Web Store
- Use Support tab in listing
- Link to GitHub issues
- Email support address

### Edge Add-ons
- Support URL field (link to GitHub or support page)
- Microsoft Partner Center messages

### Firefox AMO
- Support email required
- Support URL (GitHub recommended)
- Active response expected (impacts ratings)

### Opera
- Support URL field
- Less formal support expectation

---

## Legal Considerations

### Privacy Policies
- **Required**: Chrome, Edge, Firefox, Opera
- Must be publicly accessible URL or inline text
- Same policy can be used across all platforms
- Update if adding cloud sync or any data collection

### Terms of Service
- **Optional** for free extensions
- **Recommended** for paid premium features
- Should cover refund policy, feature availability, account terms

### Open Source Licensing
- If open-sourcing, choose license (MIT, GPL, Apache)
- Must disclose in Firefox AMO listing
- Recommended for Firefox audience
- Can help with Firefox review process

### Attribution
- Icon credits (Flaticon) must be visible
- Consider adding "About" section in extension with attributions
- Some stores require third-party code/asset attribution

---

## Monitoring & Analytics (Privacy-Friendly)

Since Hyperscribe doesn't collect data, consider:

1. **Store Metrics Only**
   - Each store provides install counts, ratings, reviews
   - Use these for growth tracking
   - No additional code needed

2. **Optional: Privacy-Friendly Analytics**
   - If you want usage insights later:
     - Plausible Analytics (GDPR-compliant, no cookies)
     - Simple Analytics (privacy-first)
     - Self-hosted Matomo with anonymization
   - **Important**: Must update privacy policy and add consent if implemented

3. **Feedback Channels**
   - GitHub Issues (recommended)
   - Chrome Web Store reviews/support
   - Email (if comfortable)
   - Discord/community (if extension grows)

---

## Update Strategy Across Platforms

When pushing updates:

1. **Chrome**: Upload new ZIP, auto-review usually <24h
2. **Edge**: Upload new ZIP, similar to Chrome
3. **Firefox**: Automatic review if no major changes, manual if permissions change
4. **Opera**: Upload new ZIP, manual review

**Best Practice**: Stagger releases
- Release to Chrome first
- Monitor for 24-48 hours for critical bugs
- If stable, push to Edge, Firefox, Opera
- This prevents bad updates affecting all users simultaneously

---

## Revenue Considerations by Platform

### Chrome Web Store
- Chrome Web Store Payments: 5% commission
- Supports one-time payments (perfect for £5 lifetime)
- Alternative: External payment (Stripe, PayPal) + license key system

### Edge Add-ons
- Microsoft in-store: 15% commission
- Supports one-time payments
- Alternative: External payment

### Firefox AMO
- **No built-in payment system**
- Must use external payment processor
- Options:
  - License key system (Gumroad, Paddle, Stripe)
  - "Donate" model (Ko-fi, Patreon, Buy Me a Coffee)
  - Free with optional donations

### Opera
- No built-in payment system
- Use external processor

### Recommendation for Hyperscribe
- Use Chrome Web Store Payments for Chrome users (easy, built-in)
- Use same license key system across all other platforms
- Consider creating a simple license verification server
- Or: Keep free, add "Support Development" donate link

---

## Common Rejection Reasons (All Platforms)

1. **Privacy Policy Issues**
   - Missing or inaccessible
   - Doesn't explain permissions
   - Contradicts actual behavior

2. **Permissions Overreach**
   - Requesting more permissions than needed
   - Not explaining why each permission is needed

3. **Broken Functionality**
   - Extension doesn't work as described
   - Critical bugs during review

4. **Insufficient Screenshots**
   - Too few screenshots
   - Screenshots don't show key features
   - Low quality or unclear images

5. **Misleading Descriptions**
   - Promising features that don't exist
   - Unclear pricing information
   - False claims about privacy/security

6. **Copyright/Trademark Issues**
   - Using trademarked terms inappropriately
   - Copyrighted images without permission
   - Confusing branding

---

## Next Steps

1. ✅ Chrome Web Store - **LAUNCH FIRST** (1-2 days)
2. ✅ Microsoft Edge Add-ons - **LAUNCH SAME WEEK** (1 day after Chrome)
3. ⚠️ Firefox AMO - **LAUNCH WEEK 2** (after creating Firefox manifest)
4. ✅ Opera Add-ons - **LAUNCH WEEK 3** (optional, low priority)
5. ❌ Safari - **DEFER** (revisit in 2-3 months if demand exists)

Focus on Chrome and Edge first for maximum impact with minimal effort.
