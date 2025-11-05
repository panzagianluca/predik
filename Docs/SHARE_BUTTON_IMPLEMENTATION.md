# 🚀 Share Button Implementation - V1

## Overview

Add share functionality to market detail pages allowing users to generate and share beautiful market images with charts. Using client-side image generation (html2canvas) with custom background provided by user.

**Timeline:** ~1-2 days
**Bundle Impact:** ~25KB (html2canvas)
**No API Keys Required:** ✅

---

## 📋 Task Breakdown

### **Task 1: Setup & Dependencies**

- [ ] **1.1** Install html2canvas
  ```bash
  npm install html2canvas
  npm install --save-dev @types/html2canvas
  ```
- [ ] **1.2** Add share background images to `/public/` folder
  - User provided two theme variants with logo already in place
  - Size: 1200x1200px (square format - Instagram/WhatsApp optimized)
  - Format: PNG or JPEG
  - Paths:
    - `/public/share-background-dark.png`
    - `/public/share-background-light.png`

---

### **Task 2: Create ShareableMarketCard Component**

**File:** `components/market/ShareableMarketCard.tsx`

- [ ] **2.1** Create hidden shareable card component

  - Fixed dimensions: 1200x1200px (square - optimal for Instagram/WhatsApp/Stories)
  - Absolute positioning, hidden by default
  - `data-share-card` attribute for targeting

- [ ] **2.2** Layout structure

  - Background image layer (theme-aware: dark or light)
  - Detect current theme from `useTheme()` hook or `document.documentElement.classList`
  - Use `/share-background-dark.png` for dark theme
  - Use `/share-background-light.png` for light theme
  - Market question overlay (centered or top)
  - Chart container (simplified version)
  - Outcome legends (probabilities)

- [ ] **2.3** Typography & Styling

  - Use existing font families (match app style)
  - Text shadows for readability over background
  - Gradients matching app theme (electric-purple palette)
  - Responsive text sizing for 1200x1200 square format

- [ ] **2.4** Chart Integration

  - Render simplified ProbabilityChart
  - Remove animations (static snapshot)
  - Increase line thickness for visibility
  - Match existing chart colors
  - No timeframe selector (show current state)

- [ ] **2.5** Outcome Legends
  - Display both outcomes with current probabilities
  - Use existing outcome color coding
  - Large, readable percentages
  - Translate using `translateOutcomeTitle()`

**Acceptance Criteria:**

- Card renders correctly at 1200x1200px (square)
- Background image loads properly
- Chart displays current market state
- Text is readable and well-positioned
- Uses existing app styling/colors
- Hidden from normal DOM flow

---

### **Task 3: Create Share Button Component**

**File:** `components/market/ShareButton.tsx`

- [ ] **3.1** Create button component

  - Accept `market` and `outcomes` props
  - Use existing Button component from `@/components/ui/button`
  - Icon: `Share2` from lucide-react
  - Text: "Compartir"

- [ ] **3.2** Implement loading state

  - Show spinner during image generation
  - Disable button while processing
  - Use existing app transition effects
  - Haptic feedback on mobile (use `triggerHaptic()` from `lib/haptics.ts`)

- [ ] **3.3** Image generation logic

  ```typescript
  const generateShareImage = async () => {
    // 1. Find shareable card element
    const element = document.querySelector("[data-share-card]");

    // 2. Temporarily show element (opacity: 0, visibility: hidden)
    // 3. Generate canvas with html2canvas
    // 4. Hide element again
    // 5. Convert canvas to blob
    // 6. Return blob
  };
  ```

- [ ] **3.4** Configuration for html2canvas

  - `backgroundColor: null` (preserve transparency)
  - `scale: 2` (retina quality)
  - `logging: false` (no console spam)
  - `useCORS: true` (for external images)
  - `allowTaint: true` (for local images)
  - `width: 1200, height: 1200` (square format)

- [ ] **3.5** Error handling
  - Try/catch around image generation
  - Fallback toast notification on error
  - Log errors to console for debugging
  - Graceful degradation (show error message)

**Acceptance Criteria:**

- Button matches app design system
- Loading state shows spinner
- Haptic feedback works on mobile
- Error handling prevents crashes
- Image generates in <1 second

---

### **Task 4: Implement Share Functionality**

- [ ] **4.1** Web Share API (Mobile Priority)

  ```typescript
  if (navigator.share && navigator.canShare({ files: [...] })) {
    await navigator.share({
      title: market.titleEs || market.title,
      text: `Predik: ${market.titleEs || market.title}`,
      files: [new File([blob], 'predik-market.png', { type: 'image/png' })]
    });
  }
  ```

- [ ] **4.2** Desktop Fallback (Download)

  - Create temporary `<a>` element
  - Set `href` to blob URL
  - Set `download` attribute to `predik-${market.slug}.png`
  - Programmatically click and cleanup
  - Show toast: "Imagen descargada"

- [ ] **4.3** Alternative: Copy to Clipboard (bonus)

  - Use Clipboard API: `navigator.clipboard.write()`
  - Copy image blob
  - Show toast: "Imagen copiada al portapapeles"
  - Only if Web Share not available

- [ ] **4.4** Analytics tracking (optional)
  - Track share button clicks
  - Track successful shares
  - Use existing analytics setup (`lib/analytics.ts`)

**Acceptance Criteria:**

- Web Share API works on mobile (iOS/Android)
- Desktop users can download image
- Toast notifications appear
- No memory leaks (cleanup blob URLs)

---

### **Task 5: Integrate into Market Detail Page**

**File:** `app/markets/[slug]/page.tsx`

- [ ] **5.1** Import components

  ```typescript
  import { ShareButton } from "@/components/market/ShareButton";
  import { ShareableMarketCard } from "@/components/market/ShareableMarketCard";
  ```

- [ ] **5.2** Add ShareableMarketCard to page

  - Place at bottom of component (hidden)
  - Pass market and outcomes data
  - Ensure it's rendered but not visible

- [ ] **5.3** Add ShareButton to header section

  - Place near other action buttons (if any)
  - Below market title, above trading panel
  - Alternatively: In TradingPanel component
  - Use existing spacing/layout patterns

- [ ] **5.4** Ensure data availability
  - ShareableMarketCard needs current prices
  - Chart needs price history
  - Pass timeframe data (default to 7d or all)

**Acceptance Criteria:**

- ShareButton appears in logical location
- ShareableMarketCard is hidden from view
- No layout shifts when adding components
- Existing UI remains unchanged
- Mobile responsive

---

### **Task 6: Styling & Transitions**

- [ ] **6.1** Button hover/active states

  - Use existing button variant styles
  - Smooth transitions (200ms ease)
  - Scale effect on hover (scale-[1.02])
  - Maintain accessibility (focus states)

- [ ] **6.2** Loading state animation

  - Spinner rotation (animate-spin)
  - Button background pulse effect
  - Use existing loading animations

- [ ] **6.3** Modal/Toast animations (if needed)

  - Match existing toast animations
  - Slide in from bottom on mobile
  - Fade in on desktop
  - Use framer-motion if already in project

- [ ] **6.4** Shareable card rendering
  - Ensure fonts load before capture
  - Wait for chart canvas render
  - Add small delay (100ms) before capture
  - Pre-load background image

**Acceptance Criteria:**

- All animations smooth (60fps)
- Transitions match app style
- No janky loading states
- Accessible (keyboard navigation)

---

### **Task 7: Performance Optimization**

- [ ] **7.1** Lazy load html2canvas

  ```typescript
  const html2canvas = (await import("html2canvas")).default;
  ```

  - Don't include in main bundle
  - Load only when share button clicked
  - Show loading state during import

- [ ] **7.2** Debounce share button

  - Prevent double-clicks
  - Min 1 second between clicks
  - Visual feedback (disabled state)

- [ ] **7.3** Image caching (optional)

  - Cache generated image for 5 minutes
  - Store in memory (not localStorage - too large)
  - Invalidate on price changes

- [ ] **7.4** Optimize background images
  - Compress both user-provided images (dark + light)
  - Use WebP format if supported
  - Fallback to PNG/JPEG
  - Max file size per image: 500KB
  - Pre-load both images on page load (optional)

**Acceptance Criteria:**

- html2canvas loads on-demand
- Share button can't be spam-clicked
- Image generation < 1 second
- Bundle size increase < 30KB

---

### **Task 8: Mobile Optimization**

- [ ] **8.1** Touch-friendly button size

  - Min 44x44px tap target
  - Adequate spacing from other elements
  - Use existing mobile breakpoints

- [ ] **8.2** Haptic feedback

  - Import `triggerHaptic` from `lib/haptics.ts`
  - Light haptic on button press
  - Success haptic on share complete

- [ ] **8.3** Mobile-specific share text

  - Shorter text for small screens
  - Icon-only option for very small screens
  - Tooltip on hover (desktop only)

- [ ] **8.4** Test on real devices
  - iOS Safari
  - Android Chrome
  - Check Web Share API support
  - Verify image quality

**Acceptance Criteria:**

- Button easy to tap on mobile
- Haptics work correctly
- Web Share API opens native share sheet
- Image displays correctly in share preview

---

### **Task 9: Testing & Quality Assurance**

- [ ] **9.1** Unit tests (optional for V1)

  - Test share button component
  - Mock html2canvas
  - Test error handling

- [ ] **9.2** Manual testing checklist

  - [ ] Desktop Chrome: Download works
  - [ ] Desktop Safari: Download works
  - [ ] Desktop Firefox: Download works
  - [ ] Mobile iOS: Web Share API works
  - [ ] Mobile Android: Web Share API works
  - [ ] Image quality: Retina display
  - [ ] Chart renders correctly
  - [ ] Text readable on background
  - [ ] Logo visible and positioned
  - [ ] Colors match app theme

- [ ] **9.3** Edge cases

  - [ ] Long market titles (truncate)
  - [ ] Markets with 3+ outcomes (adjust layout)
  - [ ] Missing chart data (show placeholder)
  - [ ] Slow networks (show loading longer)

- [ ] **9.4** Accessibility
  - [ ] Keyboard accessible
  - [ ] Screen reader friendly
  - [ ] ARIA labels on button
  - [ ] Focus indicators visible

**Acceptance Criteria:**

- All major browsers tested
- Mobile share works natively
- No console errors
- Accessible to all users

---

### **Task 10: Documentation & Cleanup**

- [ ] **10.1** Code comments

  - Document complex logic in ShareButton
  - Explain html2canvas configuration
  - JSDoc for component props

- [ ] **10.2** Update component exports

  - Export ShareButton from `components/market/index.ts`
  - Export ShareableMarketCard if needed elsewhere

- [ ] **10.3** Git commit

  - Commit message: `feat: add share button with image generation`
  - Include all new files
  - Run prettier/eslint
  - Push to main

- [ ] **10.4** Remove this markdown file
  ```bash
  rm Docs/SHARE_BUTTON_IMPLEMENTATION.md
  ```

**Acceptance Criteria:**

- Code is well-documented
- Clean git history
- No linting errors
- Implementation doc removed

---

## 📁 File Structure

```
components/market/
├── ShareButton.tsx          # NEW - Main share button component
├── ShareableMarketCard.tsx  # NEW - Hidden card for image generation
├── MarketCard.tsx           # UNCHANGED
├── ProbabilityChart.tsx     # UNCHANGED (reused in shareable card)
└── index.ts                 # UPDATED - Export new components

app/markets/[slug]/
└── page.tsx                 # UPDATED - Add share button + shareable card

public/
├── share-background-dark.png    # NEW - User-provided dark theme background
└── share-background-light.png   # NEW - User-provided light theme background

lib/
├── haptics.ts               # UNCHANGED (already exists)
└── analytics.ts             # UNCHANGED (optional usage)

package.json                 # UPDATED - Add html2canvas
```

---

## 🎨 ShareableMarketCard Layout Spec

```tsx
// 1200x1200px square canvas
<div className="relative w-[1200px] h-[1200px]">
  {/* Background Image Layer - Theme Aware */}
  <Image
    src={
      theme === "dark"
        ? "/share-background-dark.png"
        : "/share-background-light.png"
    }
    fill
    className="object-cover"
    alt="background"
  />

  {/* Content Overlay */}
  <div className="absolute inset-0 flex flex-col justify-between p-16">
    {/* Top: Market Question */}
    <div className="text-center px-8">
      <h1 className="text-6xl font-bold text-white drop-shadow-lg leading-tight">
        {market.titleEs || market.title}
      </h1>
    </div>

    {/* Middle: Chart */}
    <div className="flex-1 flex items-center justify-center px-12 py-16">
      <div className="w-full h-[500px]">
        <ProbabilityChart
          outcomes={outcomes}
          timeframe="all"
          hideControls={true}
        />
      </div>
    </div>

    {/* Bottom: Outcome Legends */}
    <div className="flex justify-around px-8">
      {outcomes.map((outcome) => (
        <div key={outcome.id} className="text-center">
          <div className="text-3xl font-semibold text-white/90">
            {translateOutcomeTitle(outcome.title)}
          </div>
          <div className="text-7xl font-bold text-white drop-shadow-lg">
            {outcome.price}%
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## 🚀 Implementation Order

1. ✅ Setup (Task 1) - 10 min
2. ✅ ShareableMarketCard (Task 2) - 2 hours
3. ✅ ShareButton (Task 3) - 1 hour
4. ✅ Share Functionality (Task 4) - 1 hour
5. ✅ Integration (Task 5) - 30 min
6. ✅ Styling (Task 6) - 1 hour
7. ✅ Performance (Task 7) - 1 hour
8. ✅ Mobile (Task 8) - 1 hour
9. ✅ Testing (Task 9) - 2 hours
10. ✅ Cleanup (Task 10) - 30 min

**Total Estimated Time:** ~10 hours (~1.5 days)

---

## ⚠️ Important Notes

- **User provided:** Two background images (1200x1200px square) - dark and light themes with logos positioned
- **Theme detection:** ShareableMarketCard will detect current theme and use appropriate background
- **No API keys needed:** Everything runs client-side
- **No UI changes:** Existing components remain untouched
- **Performance first:** Lazy load html2canvas, optimize images
- **Mobile priority:** Web Share API is the primary sharing method (square format perfect for Instagram/WhatsApp)
- **Accessibility:** Full keyboard navigation and screen reader support

---

## 🎯 Success Metrics (Post-Launch)

- Share button click rate: > 5% of market views
- Successful shares: > 80% of share attempts
- Image generation time: < 1 second average
- Mobile share adoption: > 70% on mobile devices
- No performance regression: Lighthouse score maintained

---

## 🔄 Future Enhancements (Not V1)

- [ ] Customize share text per platform
- [ ] Multiple share templates/styles
- [ ] Video generation (animated charts)
- [ ] Share to specific platforms directly
- [ ] Social media preview optimization
- [ ] A/B test different share image layouts
- [ ] Share analytics dashboard

---

**Status:** 📝 Ready for Implementation
**Version:** 1.0
**Last Updated:** November 5, 2025
