# Hyperscribe Launch Checklist

Complete guide for launching Hyperscribe across browser platforms. Follow these checklists to ensure smooth submission and approval.

---

## Pre-Launch: Universal Tasks (Complete Before Any Submission)

### Code Quality
- [x] Remove debug console.log statements
- [ ] Test all features manually in Chrome
- [ ] Test all keyboard shortcuts
- [ ] Verify no console errors on load
- [ ] Test with empty state (first install)
- [ ] Test with populated state (existing notes)
- [ ] Verify storage usage calculation
- [ ] Test resize handle min/max bounds
- [ ] Test all themes switch correctly
- [ ] Verify emoji picker keyboard navigation
- [ ] Test template CRUD operations
- [ ] Test note export (TXT, MD, HTML)
- [ ] Test tabbed notes (create, switch, close)
- [ ] Test confirmation dialogs with "don't ask again"
- [ ] Verify all panels open/close correctly

### Assets Preparation
- [ ] Create 5 screenshots (1280x800 recommended):
  - Screenshot 1: Main notepad with Default Bright theme
  - Screenshot 2: Theme panel showing all 5 themes
  - Screenshot 3: Emoji picker with keyboard navigation
  - Screenshot 4: Templates panel with custom templates
  - Screenshot 5: Tabbed notes interface (premium feature)
- [ ] Create promotional tile: 440x280 PNG (for Chrome)
- [ ] Create store logo: 300x300 PNG (for Edge)
- [ ] Verify icons are crisp: 16x16, 48x48, 128x128
- [ ] Create marquee promo tile: 1400x560 PNG (optional, for featured placement)

### Documentation
- [x] Privacy policy written (PRIVACY_POLICY.md)
- [x] Chrome Web Store description ready (CHROME_WEB_STORE_LISTING.md)
- [ ] Host privacy policy on public URL (or prepare to paste inline)
- [ ] Prepare support email or GitHub issues link
- [ ] Create README.md for users (optional but recommended)
- [ ] Prepare FAQ document (optional)

### Legal/Attribution
- [ ] Verify icon attribution to Flaticon/Iconmas
- [ ] Add attribution in extension (Settings panel or About section)
- [ ] Choose license if open-sourcing (MIT recommended)
- [ ] Prepare terms of service for premium features (optional but recommended)

### Extension Package
- [ ] Create clean ZIP file (exclude dev files):
  ```bash
  zip -r hyperscribe-chrome-v1.0.0.zip . \
    -x "*.git*" \
    -x "*.md" \
    -x "node_modules/*" \
    -x ".DS_Store" \
    -x "*.zip"
  ```
- [ ] Verify ZIP size < 100MB (should be < 5MB for Hyperscribe)
- [ ] Test loading unpacked from extracted ZIP
- [ ] Verify manifest.json version number (should be 1.0.0)

---

## Phase 1: Chrome Web Store Launch

**Timeline**: Day 1-3
**Priority**: 🔴 HIGH
**Difficulty**: ⭐ Easy

### Pre-Submission
- [ ] Create Google Developer account at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] Pay $5 one-time developer registration fee
- [ ] Verify email address
- [ ] Prepare payment method for premium features (optional):
  - Option A: Chrome Web Store Payments (5% commission)
  - Option B: External processor (Stripe/Gumroad) + license key system

### Submission Steps
1. [ ] Click "New Item" in Developer Dashboard
2. [ ] Upload hyperscribe-chrome-v1.0.0.zip
3. [ ] Fill out store listing:
   - [ ] Product name: "Hyperscribe - Minimalist Terminal Notepad"
   - [ ] Summary: Copy from CHROME_WEB_STORE_LISTING.md (short description)
   - [ ] Detailed description: Copy from CHROME_WEB_STORE_LISTING.md
   - [ ] Category: Productivity
   - [ ] Language: English (add more if applicable)
4. [ ] Upload assets:
   - [ ] Extension icon: 128x128 (auto-extracted from ZIP)
   - [ ] Screenshots: Upload all 5 prepared screenshots
   - [ ] Promotional tile: 440x280 PNG
   - [ ] Marquee tile (optional): 1400x560 PNG
5. [ ] Privacy practices:
   - [ ] Paste privacy policy URL or inline text
   - [ ] Declare data usage: "This extension does not collect user data"
   - [ ] Permissions justification:
     - Storage: "Save notes and preferences locally on user's device"
     - Downloads: "Export notes as text, markdown, or HTML files"
6. [ ] Pricing:
   - [ ] Free version: Select "This extension is free"
   - [ ] Premium features: Set up Chrome Web Store Payments if using built-in
7. [ ] Regions:
   - [ ] Select "All regions" or specific countries
8. [ ] Support:
   - [ ] Support URL: GitHub issues or support email
   - [ ] Support email: Your email address
9. [ ] Preview listing and check for errors
10. [ ] Submit for review

### Post-Submission
- [ ] Wait 1-3 business days for review
- [ ] Monitor email for approval/rejection notices
- [ ] If rejected: Address feedback and resubmit within 24 hours
- [ ] Once approved: Test install from Chrome Web Store
- [ ] Share store link on social media/communities

### Success Criteria
- ✅ Extension published and visible in Chrome Web Store
- ✅ Install button works
- ✅ All features function correctly after Chrome Web Store install
- ✅ Screenshots display correctly in listing

---

## Phase 2: Microsoft Edge Add-ons Launch

**Timeline**: Day 2-4 (1 day after Chrome submission)
**Priority**: 🔴 HIGH
**Difficulty**: ⭐ Easy

### Pre-Submission
- [ ] Create Microsoft Partner account at [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login)
- [ ] No fee required (free registration)
- [ ] Verify Microsoft account

### Submission Steps
1. [ ] Navigate to Microsoft Edge Extensions section
2. [ ] Click "Create new extension"
3. [ ] Upload same ZIP file as Chrome (hyperscribe-chrome-v1.0.0.zip)
4. [ ] Fill out store listing:
   - [ ] Product name: "Hyperscribe - Minimalist Terminal Notepad"
   - [ ] Short description: Copy from CHROME_WEB_STORE_LISTING.md
   - [ ] Long description: Copy from CHROME_WEB_STORE_LISTING.md
   - [ ] Category: Productivity & Tools
   - [ ] Language: English
5. [ ] Upload assets:
   - [ ] Store logo: 300x300 PNG
   - [ ] Screenshots: Upload all 5 prepared screenshots (same as Chrome)
   - [ ] Promotional images (optional): 1400x560 PNG
6. [ ] Privacy policy:
   - [ ] Paste privacy policy URL or inline text
   - [ ] Declare data practices (same as Chrome)
7. [ ] Support information:
   - [ ] Support URL: Same as Chrome
   - [ ] Contact email: Your email
8. [ ] Pricing:
   - [ ] Select pricing model (free or paid)
   - [ ] Set up Microsoft payment if using in-store premium (15% commission)
9. [ ] Preview and verify
10. [ ] Submit for certification

### Post-Submission
- [ ] Wait 24-72 hours for review
- [ ] Monitor Partner Center dashboard for status updates
- [ ] If rejected: Address feedback and resubmit
- [ ] Once approved: Test install from Edge Add-ons store
- [ ] Update website/README with Edge store link

### Success Criteria
- ✅ Extension published in Microsoft Edge Add-ons
- ✅ Listing displays correctly
- ✅ Extension installs and functions on Edge browser
- ✅ All features work identically to Chrome version

---

## Phase 3: Firefox Add-ons (AMO) Launch

**Timeline**: Week 2 (after Chrome/Edge are live)
**Priority**: 🟡 MEDIUM
**Difficulty**: ⭐⭐ Moderate (requires manifest modification)

### Pre-Submission Preparation
- [ ] Create Firefox Developer account at [AMO](https://addons.mozilla.org/developers/)
- [ ] Install Firefox Developer Edition for testing
- [ ] Create Firefox-specific manifest.json

### Manifest Modifications
1. [ ] Create copy of manifest.json as manifest-firefox.json
2. [ ] Add browser_specific_settings:
   ```json
   "browser_specific_settings": {
     "gecko": {
       "id": "hyperscribe@yourdomain.com",
       "strict_min_version": "109.0"
     }
   }
   ```
3. [ ] Verify background field (Firefox prefers "scripts" array):
   ```json
   "background": {
     "scripts": ["background.js"]
   }
   ```
4. [ ] Keep everything else identical

### Testing in Firefox
- [ ] Load unpacked extension in Firefox Developer Edition:
  - Navigate to about:debugging
  - Click "This Firefox"
  - Click "Load Temporary Add-on"
  - Select manifest-firefox.json
- [ ] Test all features:
  - [ ] Extension loads without errors
  - [ ] All keyboard shortcuts work
  - [ ] Theme switching functions
  - [ ] Font controls work
  - [ ] Emoji picker navigation
  - [ ] Templates CRUD
  - [ ] Export TXT/MD/HTML
  - [ ] Resize handle
  - [ ] Tabbed notes
  - [ ] Storage usage display
- [ ] Check console for any Firefox-specific errors

### Package for Firefox
- [ ] Create Firefox-specific ZIP:
  ```bash
  # Copy manifest-firefox.json as manifest.json
  cp manifest.json manifest-chrome.json
  cp manifest-firefox.json manifest.json

  # Create Firefox ZIP
  zip -r hyperscribe-firefox-v1.0.0.zip . \
    -x "*.git*" \
    -x "*.md" \
    -x "manifest-chrome.json" \
    -x "*.zip"

  # Restore Chrome manifest
  mv manifest-chrome.json manifest.json
  ```

### Submission Steps
1. [ ] Log in to [AMO Developer Hub](https://addons.mozilla.org/developers/addon/submit/)
2. [ ] Click "Submit a New Add-on"
3. [ ] Upload hyperscribe-firefox-v1.0.0.zip
4. [ ] Fill out addon information:
   - [ ] Name: "Hyperscribe"
   - [ ] Summary: 250 characters max (from CHROME_WEB_STORE_LISTING.md)
   - [ ] Description: Full description (supports Markdown)
   - [ ] Categories: Productivity
   - [ ] Tags: notepad, notes, productivity, terminal, themes
5. [ ] Upload screenshots:
   - [ ] Upload all 5 prepared screenshots
   - [ ] Add captions describing each screenshot
6. [ ] Technical details:
   - [ ] License: Choose appropriate (MIT recommended if open-source)
   - [ ] Privacy policy: Paste URL or inline text
7. [ ] Support information:
   - [ ] Support email: Required (your email)
   - [ ] Support URL: GitHub issues or support page
   - [ ] Homepage: Extension website or GitHub repo
8. [ ] Version notes:
   - [ ] Add release notes: "Initial release - v1.0.0"
9. [ ] Source code (if applicable):
   - [ ] If code is minified/bundled: Upload source ZIP
   - [ ] For Hyperscribe: Not needed (no build process)
10. [ ] Submit for review

### Post-Submission
- [ ] **Automatic review**: If passes automated checks, published within minutes to hours
- [ ] **Manual review**: If flagged, 1-14 days
  - Mozilla will email with questions
  - Respond promptly and thoroughly
  - Common questions: permissions justification, privacy practices, code explanations
- [ ] Once approved: Test install from AMO
- [ ] Extension is automatically signed by Mozilla
- [ ] Update website/README with Firefox AMO link

### Success Criteria
- ✅ Extension published on addons.mozilla.org
- ✅ Extension signed by Mozilla
- ✅ Listing displays correctly with screenshots
- ✅ Extension installs and functions on Firefox
- ✅ All features work identically to Chrome/Edge versions

### Firefox-Specific Notes
- Firefox review is most thorough - be prepared for detailed questions
- Reviewers may ask about permission usage, privacy practices, or specific code patterns
- Quick response time helps speed up manual review
- Firefox users highly value privacy - emphasize local storage in description

---

## Phase 4: Opera Add-ons Launch (Optional)

**Timeline**: Week 3-4
**Priority**: 🟢 LOW
**Difficulty**: ⭐ Easy

### Pre-Submission
- [ ] Create Opera Developer account at [Opera Add-ons](https://addons.opera.com/developer)
- [ ] Free registration with Opera account

### Submission Steps
1. [ ] Log in to Opera Developer portal
2. [ ] Click "Add extension"
3. [ ] Upload same ZIP as Chrome (hyperscribe-chrome-v1.0.0.zip)
4. [ ] Fill out listing:
   - [ ] Name: "Hyperscribe - Minimalist Terminal Notepad"
   - [ ] Summary: Up to 132 characters
   - [ ] Description: Copy from CHROME_WEB_STORE_LISTING.md
   - [ ] Category: Productivity
5. [ ] Upload assets:
   - [ ] Icon: 128x128 PNG (same as Chrome)
   - [ ] Screenshots: Upload prepared screenshots (612x408 or 1280x800)
6. [ ] Privacy and support:
   - [ ] Privacy policy URL
   - [ ] Support URL
7. [ ] Submit for review

### Post-Submission
- [ ] Wait 1-3 days for review
- [ ] Monitor email for approval
- [ ] Once approved: Test install from Opera Add-ons
- [ ] Update website with Opera store link

### Success Criteria
- ✅ Extension published on Opera Add-ons
- ✅ Extension installs and functions on Opera browser
- ✅ All features work correctly

### Notes
- Opera has smallest user base
- Consider this optional unless targeting Opera users specifically
- Opera users can also install Chrome extensions via "Install Chrome Extensions" add-on

---

## Phase 5: Safari (Deferred)

**Timeline**: 2-3 months after initial launch
**Priority**: ⏸️ DEFERRED
**Difficulty**: ⭐⭐⭐⭐ Very Difficult

### When to Reconsider Safari
- [ ] Chrome/Edge/Firefox versions are stable and well-received
- [ ] Received at least 50+ user requests for Safari version
- [ ] Willing to invest $99/year for Apple Developer membership
- [ ] Have 1-2 weeks development time for conversion and testing
- [ ] Have macOS device with Xcode for development

### High-Level Requirements (for future reference)
- [ ] Apple Developer account ($99/year)
- [ ] macOS with Xcode 12+
- [ ] Convert extension using `xcrun safari-web-extension-converter`
- [ ] Replace chrome.* API with browser.* API
- [ ] Create native macOS/iOS app wrapper
- [ ] Submit through App Store Connect
- [ ] Pass full App Store review (7-14 days)

**Recommendation**: Only pursue if there's clear user demand and ROI justifies the investment.

---

## Post-Launch: All Platforms

### Monitoring (First Week)
- [ ] Check store dashboards daily for:
  - Install counts
  - User ratings
  - User reviews
  - Crash reports (if any)
- [ ] Monitor support channels:
  - Email
  - GitHub issues
  - Store support sections
- [ ] Test extension on latest browser versions
- [ ] Watch for any permission or policy warnings from stores

### User Feedback
- [ ] Respond to reviews within 24-48 hours
- [ ] Address bug reports promptly
- [ ] Create GitHub issues for feature requests
- [ ] Categorize feedback: bugs, features, usability, performance

### Marketing & Promotion
- [ ] Share on social media:
  - Twitter/X with #Chrome #Extension #Productivity hashtags
  - LinkedIn with developer-focused message
  - Reddit: r/chrome, r/firefox, r/productivity (follow subreddit rules)
  - Hacker News: Show HN post (if appropriate)
  - Product Hunt (consider launching after 1-2 weeks to gather reviews)
- [ ] Create launch blog post or landing page
- [ ] Update GitHub README with store links
- [ ] Add badges to README:
  - Chrome Web Store badge
  - Edge Add-ons badge
  - Firefox AMO badge
- [ ] Share in relevant communities:
  - Developer Discord servers
  - Productivity forums
  - Terminal enthusiast communities

### Week 1-2 Critical Bugs
- [ ] Fix any critical bugs immediately
- [ ] Push hotfix updates to all platforms
- [ ] Communicate with affected users via reviews/support

### Week 2-4 Iteration
- [ ] Analyze user feedback themes
- [ ] Prioritize quick wins (small improvements, high impact)
- [ ] Plan next version features
- [ ] Improve store listings based on user language/questions

---

## Update Workflow (After Launch)

### For Future Updates
1. **Develop and Test Locally**
   - [ ] Implement new features/fixes
   - [ ] Test thoroughly in all browsers
   - [ ] Update version number in manifest.json
   - [ ] Update CHANGELOG.md with release notes

2. **Chrome Web Store**
   - [ ] Create new ZIP with updated version
   - [ ] Upload to Chrome Developer Dashboard
   - [ ] Add version notes
   - [ ] Submit (usually auto-approved within 24h)
   - [ ] Wait for approval, then monitor for issues

3. **Microsoft Edge**
   - [ ] Upload same ZIP to Partner Center
   - [ ] Add release notes
   - [ ] Submit for certification

4. **Firefox AMO**
   - [ ] Create Firefox-specific ZIP (with Firefox manifest)
   - [ ] Upload to AMO
   - [ ] Add version notes
   - [ ] Submit (usually auto-approved if minor update)

5. **Opera**
   - [ ] Upload updated ZIP
   - [ ] Submit for review

6. **Stagger Strategy**
   - Release Chrome first
   - Monitor for 24-48 hours
   - If stable, push to other platforms
   - Prevents bad updates affecting all users simultaneously

---

## Emergency Rollback Plan

If critical bug discovered post-launch:

### Immediate Actions
1. [ ] Identify the issue and confirm severity
2. [ ] Fix the bug locally and test thoroughly
3. [ ] Create hotfix version (e.g., 1.0.1)

### Chrome/Edge/Opera
- [ ] Submit fixed version immediately (mark as urgent)
- [ ] Add note in submission: "Critical bug fix"
- [ ] Monitor for fast-track approval

### Firefox
- [ ] Submit fixed version with explanation in notes
- [ ] Email AMO reviewer support if time-sensitive
- [ ] Respond immediately to any reviewer questions

### User Communication
- [ ] Post update in store support sections
- [ ] Reply to affected user reviews
- [ ] Email users if you have contact info
- [ ] Post notice on GitHub/website

### Cannot Rollback
- Browser stores don't support rollback to previous versions
- Only option: Push fixed version as quickly as possible
- Reason: Thorough testing before launch is critical

---

## Success Metrics

### Week 1 Goals
- [ ] 100+ installs across all platforms
- [ ] 4.0+ average rating
- [ ] < 5 critical bug reports
- [ ] 10+ user reviews

### Month 1 Goals
- [ ] 1,000+ installs
- [ ] 4.5+ average rating
- [ ] At least 1 premium purchase (if implemented)
- [ ] 50+ user reviews
- [ ] Featured on at least one productivity blog/list

### Quarter 1 Goals
- [ ] 5,000+ installs
- [ ] 4.5+ average rating sustained
- [ ] Established support workflow
- [ ] v1.1 or v1.2 released with user-requested features
- [ ] Positive ROI on development time

---

## Developer Account Credentials Tracker

### Chrome Web Store
- [ ] Account email: ___________________________
- [ ] Developer ID: ___________________________
- [ ] Payment method: _________________________
- [ ] Registration fee paid: ☐ Yes

### Microsoft Edge
- [ ] Account email: ___________________________
- [ ] Partner ID: ___________________________
- [ ] Payment setup: __________________________

### Firefox AMO
- [ ] Account email: ___________________________
- [ ] Developer profile: _______________________

### Opera
- [ ] Account email: ___________________________
- [ ] Developer ID: ___________________________

**Security Note**: Store these credentials securely (password manager recommended).

---

## Final Pre-Launch Checklist

Before clicking "Submit" on any platform:

- [ ] ✅ All code quality checks passed
- [ ] ✅ All features tested and working
- [ ] ✅ No console errors
- [ ] ✅ Screenshots created and look professional
- [ ] ✅ Privacy policy finalized and accessible
- [ ] ✅ Store descriptions proofread (no typos)
- [ ] ✅ Support channels set up (email/GitHub)
- [ ] ✅ Extension ZIP created and tested
- [ ] ✅ Manifest version correct (1.0.0)
- [ ] ✅ Icon attribution included
- [ ] ✅ Permissions justified in description
- [ ] ✅ Pricing clearly explained (if applicable)
- [ ] ✅ Read store policies one more time
- [ ] ✅ Ready to respond to reviews/support within 24h
- [ ] ✅ Backup of all files and assets made

---

## Resources & Links

### Store Developer Portals
- **Chrome**: https://chrome.google.com/webstore/devconsole
- **Edge**: https://partner.microsoft.com/dashboard/microsoftedge
- **Firefox**: https://addons.mozilla.org/developers/
- **Opera**: https://addons.opera.com/developer

### Documentation
- **Chrome Extensions**: https://developer.chrome.com/docs/extensions/
- **Edge Extensions**: https://docs.microsoft.com/microsoft-edge/extensions-chromium/
- **Firefox Extensions**: https://extensionworkshop.com/
- **Opera Extensions**: https://dev.opera.com/extensions/

### Policies
- **Chrome Web Store Program Policies**: https://developer.chrome.com/docs/webstore/program-policies/
- **Edge Add-ons Policies**: https://docs.microsoft.com/microsoft-edge/extensions-chromium/store-policies/
- **Firefox AMO Policies**: https://extensionworkshop.com/documentation/publish/add-on-policies/

### Support
- **Chrome**: https://support.google.com/chrome_webstore/
- **Edge**: Partner Center support
- **Firefox**: https://extensionworkshop.com/
- **Opera**: https://forums.opera.com/

---

## Quick Start: Launch Chrome First (Fastest Path)

If you want to launch as quickly as possible:

### Day 1 (2-3 hours)
1. [ ] Create Chrome Developer account ($5)
2. [ ] Create 3 basic screenshots (main interface, themes, emoji picker)
3. [ ] Create simple 440x280 promotional tile
4. [ ] Host privacy policy on GitHub Pages or paste inline
5. [ ] Create extension ZIP
6. [ ] Fill out Chrome Web Store listing
7. [ ] Submit for review

### Day 2-3
- [ ] Wait for approval
- [ ] Test installed extension

### Day 4+
- [ ] Once Chrome is live and stable, expand to Edge
- [ ] Week 2: Firefox
- [ ] Week 3: Opera (optional)

This gets you to market fastest with minimal prep time.

---

## Questions Before Launch?

### Technical
- Tested on latest Chrome/Edge/Firefox?
- Any console errors or warnings?
- Manifest version number correct?
- All permissions necessary and justified?

### Legal
- Privacy policy covers all data practices?
- Icon attribution included?
- Terms of service for premium features?

### Marketing
- Screenshots show key features?
- Description clear and compelling?
- Support channel ready to handle questions?

### Business
- Pricing strategy decided?
- Payment processor set up (if applicable)?
- Refund policy defined?

---

**Good luck with the launch! 🚀**

Remember: Launch is just the beginning. The real work is iterating based on user feedback and growing your user base over time. Start with Chrome, gather feedback, then expand.
