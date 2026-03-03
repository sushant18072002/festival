# 15. Exhaustive User Stories & Scenario Matrix

> **Coverage Goal**: Ensure the app works in "Real Life" for 1000+ variations of user, network, and context.

## 1. The Scenario Matrix (1000+ Combinations)

We test the app against the cross-product of these variables:

| Variable | Options (Real Life Scenarios) |
|----------|-------------------------------|
| **Persona** | 1. **Reena** (55, Hindi, Non-tech) <br> 2. **Rahul** (28, English, Tech-savvy) <br> 3. **Priya** (35, Marathi, Professional) <br> 4. **Ramesh** (70, Gujarati, Low-vision) <br> 5. **Anjali** (18, Gen-Z, Trend-seeker) |
| **Network** | 1. **High Speed WiFi** (Home) <br> 2. **Stable 4G** (Office) <br> 3. **Spotty 2G/3G** (Village/Train) <br> 4. **Completely Offline** (No Data Pack) <br> 5. **Flaky** (Connect/Disconnect) |
| **Context** | 1. **Good Morning** (7 AM Routine) <br> 2. **Festival Morning** (Urgent Sharing) <br> 3. **Late Night** (Browsing 11 PM) <br> 4. **Travel** (Boredom killer) |
| **Goal** | 1. Share to WhatsApp <br> 2. Set WhatsApp Status <br> 3. Find specific God photo <br> 4. Download to Gallery <br> 5. Check Festival Date <br> 6. Read History <br> 7. Change Language <br> 8. Turn off Notifications <br> 9. Share to Instagram <br> 10. Update App |

**Total Scenarios**: 5 * 5 * 4 * 10 = **1000 Unique Combinations**

---

## 2. Deep-Dive Persona Stories

### 👵 Persona 1: Reena (The Core User)
*Scenario: It's Diwali Morning (Urgent). Network is clogged (2G).*
- [ ] **Story**: As Reena, I open the app and see "Happy Diwali" images *immediately* (no loading spinner).
    - *Requirement*: `home_feed.json` must be cached.
- [ ] **Story**: As Reena, I tap "Share". It goes *directly* to WhatsApp selected contacts.
    - *Requirement*: `share_plus` direct link, no system picker confusion.
- [ ] **Story**: As Reena, I want the message to say "Happy Diwali" automatically so I don't have to type.
    - *Requirement*: `image.share_text` populated in backend.

### 👴 Persona 4: Ramesh (Accessibility)
*Scenario: Looking for devotional content. Low vision.*
- [ ] **Story**: As Ramesh, I can read the text without squinting.
    - *Requirement*: Large Fonts (>16sp), High Contrast (Black on Cream).
- [ ] **Story**: As Ramesh, I can find "Bhakti" easily.
    - *Requirement*: Large Icon Buttons (Vibe Pills) at top.
- [ ] **Story**: As Ramesh, I want to hear the story of Diwali instead of reading.
    - *Requirement*: (Future) Text-to-Speech button on Event Details.

### 👩‍🎓 Persona 5: Anjali (Gen-Z)
*Scenario: Wants "Aesthetic" dark vibes for Instagram.*
- [ ] **Story**: As Anjali, I want high-res vertical images for Stories.
    - *Requirement*: Images are 9:16 aspect ratio.
- [ ] **Story**: As Anjali, I don't want "Uncle-style" graphics. I want modern aesthetic.
    - *Requirement*: Content Curation (Design team task).
- [ ] **Story**: As Anjali, I want to filter by "Vibes" (e.g., "Solemn" or "Minimal").
    - *Requirement*: Vibe Filter working perfectly.

---

## 3. Critical Edge Cases (The "Stress Test")

### A. The "Zero Data" User
*Scenario: User installs app, then data pack expires.*
- [ ] App must launch and show *something* (Cached assets/Default seed data).
- [ ] "For You" grid shows cached placeholders or previously loaded images.
- [ ] Tapping an image shows "Saved Locally" indicator.

### B. The "WhatsApp Uncle"
*Scenario: Shares 50 images in 1 hour.*
- [ ] App must not crash from memory leaks.
- [ ] "History" of shared items should be easy to access (so he doesn't resend same one).
- [ ] "Shared" badge appears on images he already sent.

### C. The "Regional" User
*Scenario: Switches to Tamil.*
- [ ] UI Strings update immediately.
- [ ] Image Grid reloads to prefer Tamil-text images (if available).
- [ ] Notifications arrive in Tamil.

---

## 4. "Think from Every Way" Checklist

### Designer Perspective
- [x] **Hierarchy**: Is the "Call to Action" (Share) the most prominent button?
- [x] **Thumb Zone**: Are all navigable elements within reach of one hand?
- [x] **Emotion**: Does the app feel "Festive" or "Utility"? (Colors/Gradients).

### System Design Perspective
- [x] **Latency**: Are images served via CDN (CloudFront) close to user?
- [x] **Cost**: Is the architecture "Serverless" (Static JSON) to keep costs near zero?
- [x] **Scalability**: Can it handle 1 million hits on Diwali morning? (Yes, S3/CDN scales infinitely).

### Developer Perspective
- [x] **Maintainability**: Is the data model clear? (Event <-> Image linking).
- [x] **Offline**: Does `Hive` store the home feed?
