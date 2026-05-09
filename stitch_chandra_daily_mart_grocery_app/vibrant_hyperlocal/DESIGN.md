---
name: Vibrant Hyperlocal
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#3e4a3c'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#6e7b6b'
  outline-variant: '#bdcab8'
  surface-tint: '#006e24'
  primary: '#006e24'
  on-primary: '#ffffff'
  primary-container: '#38b44e'
  on-primary-container: '#003f11'
  inverse-primary: '#66df73'
  secondary: '#994700'
  on-secondary: '#ffffff'
  secondary-container: '#fb7800'
  on-secondary-container: '#592600'
  tertiary: '#732ee4'
  on-tertiary: '#ffffff'
  tertiary-container: '#af88ff'
  on-tertiary-container: '#440099'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#82fc8c'
  primary-fixed-dim: '#66df73'
  on-primary-fixed: '#002106'
  on-primary-fixed-variant: '#005319'
  secondary-fixed: '#ffdbc8'
  secondary-fixed-dim: '#ffb68b'
  on-secondary-fixed: '#321200'
  on-secondary-fixed-variant: '#753400'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 1rem
  gutter: 0.75rem
  stack-sm: 0.25rem
  stack-md: 1rem
  stack-lg: 1.5rem
---

## Brand & Style

The brand personality for this design system is energetic, dependable, and community-focused. It aims to evoke a sense of "freshness delivered fast," combining the urgency of quick-commerce with the trustworthiness of a local neighborhood vendor. 

The design style is **Modern Corporate** with a focus on high-vibrancy accents. It utilizes a "Clean & Punchy" aesthetic: a base of pure white backgrounds and ample whitespace to make fresh produce photography pop, contrasted with high-saturation brand colors that guide the eye to primary actions. The interface feels approachable through the use of soft geometry and friendly typography, maintaining a professional edge that assures the user of logistical reliability in the Faridabad region.

## Colors

The color palette is rooted in the freshness of nature and the energy of rapid delivery. 

- **Primary (Fresh Green):** Used for "Add to Cart" actions, price tags, and availability indicators. It symbolizes growth and quality.
- **Secondary (Bright Orange):** Reserved for urgency—promotional banners, "Delivery in 10 mins" badges, and discount tags.
- **Tertiary (Deep Berry):** Used sparingly for loyalty programs or specialty categories like "Gourmet" to provide a sophisticated contrast.
- **Neutral:** A deep charcoal is used for text to ensure high legibility against the white (#FFFFFF) background. Surface colors use a very subtle cool gray (#F8FAFC) to define secondary container areas.

## Typography

This design system uses a dual-font strategy to balance character with readability. **Plus Jakarta Sans** is used for headings to provide a modern, slightly rounded, and optimistic feel. For long lists of product names and body descriptions, **Be Vietnam Pro** is utilized for its exceptional clarity at small sizes and its friendly, contemporary letterforms.

Visual hierarchy is maintained by using heavy weights (Bold/700) for product titles and prices, while secondary information like "weight per unit" or "origin" uses Medium or Regular weights in a lighter gray scale.

## Layout & Spacing

The design system employs a **Fluid Grid** optimized for mobile-first consumption. 

- **Margins:** A standard 16px (1rem) side margin ensures content does not bleed into the device edges.
- **Grid:** A 2-column layout is the standard for product listings to maximize the visibility of high-quality food imagery. 
- **Rhythm:** An 8pt spacing system is used to maintain vertical rhythm. Small components (icon + text) use 4px gaps, while distinct sections (Categories vs. Trending) are separated by 24px or 32px to create clear mental breaks.

## Elevation & Depth

This design system utilizes **Ambient Shadows** and **Tonal Layers** to create a sense of organized stacking without clutter.

- **Level 0 (Base):** Pure white background for the main canvas.
- **Level 1 (Cards):** Product cards use a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) to lift them slightly off the background.
- **Level 2 (Floating Action):** The "View Cart" bar and floating "Help" buttons use a more pronounced shadow with a slight primary-color tint (rgba(56, 180, 78, 0.2)) to signify high interactivity.
- **Navigation:** The top location bar (featuring "Vinay Nagar, Faridabad") remains pinned with a subtle bottom border or 2px elevation to indicate it sits above the scrolling content.

## Shapes

The shape language is consistently **Rounded**, reinforcing the friendly and approachable brand persona. 

- **Standard Buttons & Inputs:** 8px (0.5rem) corner radius.
- **Product Cards:** 16px (1rem) corner radius to soften the grid and make the interface feel more organic.
- **Search Bars:** Often utilize a pill-shape (fully rounded) to distinguish them as the primary entry point for navigation.
- **Images:** Fresh produce photography must always follow the container's roundedness to maintain a cohesive "packaged" look.

## Components

- **Location Header:** A specialized component at the top of the UI. It features a "Home" or "Work" icon, the bold text "Delivering to Vinay Nagar," and secondary text "Faridabad, Haryana." A small chevron indicates it is tappable for address changes.
- **Product Card:** Features a large 1:1 aspect ratio image at the top, a bold price, a strike-through original price (if applicable), and a prominent "ADD" button that transforms into a +/- stepper once an item is selected.
- **Vibe Banners:** High-contrast containers using the Secondary (Orange) or Tertiary (Berry) colors with white text for "Instant Deals" or "Flash Sales."
- **Category Chips:** Horizontal scrolling pills with a small icon and label, used for quick filtering (e.g., "Dairy," "Vegetables," "Atta & Dal").
- **Bottom Sheet:** Used for product details or cart summaries, featuring a 24px top-corner radius and a subtle "grabber" handle at the top.
- **Status Badges:** Small, high-visibility labels placed on the corner of product images (e.g., "Organic," "Bestseller").