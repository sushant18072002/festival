# 🎨 Utsav Design System & UX Strategy

> **The "Best" Strategy**: An Image-First, Emotionally Intelligent experience tailored for the Tier-2 Indian user.

## 1. Core UX Strategy

### A. The "3-Second Rule" (Methodology)
Our target user (Tier-2, 35+ years old) decides in **3 seconds** if the app is useful.
- **Old Way**: Show text ("This Day in History"). *User thinks: "Boring, looks like a book."*
- **New Way**: Show vibrant images immediately. *User thinks: "Wow, I can share this!"*

### B. Emotional Design (Principle)
People share festivals based on **Feelings**, not just Dates.
- instead of just searching "Republic Day", users browse "🇮🇳 Patriotic" or "❤️ Desh Bhakti".
- **Implementation**: "Vibe Pills" (❤️ 🇮🇳 🙏 😂) are the primary navigation filter.

### C. F-Pattern & Anchoring
- **Anchor**: The top banner ("Diwali in 3 days") anchors the user in *Time*.
- **Hook**: The "For You" image grid anchors the user in *Content*.
- **Action**: All key actions (Share, Download) are in the **Thumb Zone** (bottom 30% of screen).

---

## 2. Visual Identity

### 🎨 Color Palette: "Festive Vibrance"
We avoid "Corporate Blue" or "Minimalist White". We use colors that feel like an Indian celebration.

| Role | Color Name | Hex Code | Usage |
|------|------------|----------|-------|
| **Primary** | **Royal Purple** | `#4A148C` | App Bar, Primary Buttons, Brand Headers |
| **Secondary** | **Marigold** | `#FF6F00` | Floating Action Buttons, Highlights, "Joyful" Vibe |
| **Accent** | **Temple Gold** | `#FFD700` | Stars, Ratings, Premium features |
| **Success** | **Tulsi Green** | `#2E7D32` | "Patriotic" Vibe, Success toasts |
| **Error** | **Kumkum Red** | `#C62828` | "Religious" Vibe tags, Errors |
| **Background**| **Cream** | `#FFF8E1` | Main background (Warmth > White) |

### 🌈 Gradients (The "Wow" Factor)
Use gradients to create depth and richness.
- **"Mystic Evening"**: `LinearGradient(begin: topLeft, colors: [0xFF4A148C, 0xFF7B1FA2])`
- **"Sunrise Glory"**: `LinearGradient(begin: topLeft, colors: [0xFFFF6F00, 0xFFFFCA28])`

### ✨ Background & Atmosphere (The "Vibe")
To avoid the app looking "flat" or "empty", we use texture.
1.  **Light Mode**:
    -   Base: `#FFF8E1` (Cream).
    -   **Pattern**: Subtle "Mandala" watermark in top-right and bottom-left corners (Opacity 0.03).
    -   *Why*: Adds Indian festive context without distracting from content.
2.  **Dark Mode** (Night time / Battery saver):
    -   Base: `#120518` (Deep Eggplant) - NOT pure black.
    -   Surface: `#2D0C3F` (Lighter Purple) with Glassmorphism.
    -   *Why*: Pure black feels cold. Deep purple feels like a "Night Festival".

### ✍️ Typography (Google Fonts)
- **Headings**: **Playfair Display** (Serif). Feels traditional, grand, and respectful.
  - *Usage*: Festival Titles, "Happy Diwali" text on images.
- **Body**: **Lato** (Sans Serif). Clean, legible, modern.
  - *Usage*: Descriptions, buttons, dates.
- **Script**: **Great Vibes**.
  - *Usage*: Special greetings ("Shubh Deepavali").


---

## 3. UI Component Library

### A. "Glassmorphism" (The Premium Feel)
To make the app feel modern but light, we use glass effects on containers.
- **Blur**: `BackdropFilter(filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10))`
- **Opacity**: White with `0.1` to `0.2` opacity.
- **Border**: Thin white border (`0.5` width) with `0.3` opacity.

### B. Shadows (Depth)
Tier-2 users prefer "Material" depth over "Flat" design.
- **Card Shadow**: `BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 4))`
- **Float Shadow**: `BoxShadow(color: AppColors.secondary.withOpacity(0.4), blurRadius: 16, offset: Offset(0, 8))`

### C. Card Styles
1.  **Hero Card (Home)**:
    -   Full width, 240px height.
    -   Gradient overlay at bottom for text readability.
    -   Rounded corners (24px).
2.  **Compact Event Card**:
    -   Fixed size (120px width).
    -   Image covers 100%.
    -   Title floats on top (Glassmorphism chip).

### D. Iconography & Assets ("Others")
-   **Icons**: Use **Rounding Icons** (Material Rounded).
    -   Active: Filled (e.g., `Icons.home_filled`).
    -   Inactive: Outlined (e.g., `Icons.home_outlined`).
-   **Illustrations**:
    -   **Empty State**: A cute "Sleeping Elephant" or "Empty Diya".
    -   **Error State**: "Tangled Kite" (Manjha).
    -   **Loading**: Shimmer effect with a "Sparkle" moving across.

---

## 4. Functional Behaviors (Interactions)

### A. The "Infinite Flow"
- **Home Screen**:
    -   **0-30%**: Context (Banner + Upcoming).
    -   **40%+**: Infinite Image Grid.
    -   **Behavior**: As user scrolls down, the "App Bar" shrinks or disappears to give full focus to images.

### B. Micro-Interactions
-   **Heart Tap**: Exploding particle animation (like Instagram).
-   **Share Tap**: Simple "haptic feedback" (small vibration) to confirm action.
-   **Pull-to-Refresh**: Custom "Diwali Diya" or "Spinner" animation.

### C. Smart "For You" Logic
-   **First Launch**: Show mix of Trending (50%) + Upcoming Festival (50%).
-   **After 1 Share**: If user shares "Patriotic", boost "National" category images by 20%.

---

## 5. Implementation Checklist

- [ ] **Global**: Update `AppColors` in `app_colors.dart` with new Palette.
- [ ] **Global**: Add `google_fonts` package and configure `AppTextStyles`.
- [ ] **Widget**: Create reusable `GlassContainer` with new blur settings.
- [ ] **Widget**: Create `VibePill` widget with distinct colors (Green for Patriotic, Orange for Religious).
- [ ] **Layout**: Refactor `HomeView` to use `CustomScrollView` with `SliverAppBar` and `SliverGrid`.
