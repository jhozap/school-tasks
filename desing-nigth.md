# Design System Documentation: The Midnight Botanical Editorial
 
## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Midnight Garden."** 
 
We are moving away from the "utility dashboard" aesthetic and toward a high-end, editorial experience. This system should feel like a premium digital sanctuary—quiet, deep, and intentional. We achieve this by eschewing traditional rigid grids in favor of **intentional asymmetry** and **tonal depth**. 
 
The goal is to create a UI that feels "grown" rather than "built." By utilizing rich charcoals and deep botanical greens, we provide a low-strain environment where task urgency is communicated through vibrant, jewel-toned semantic markers rather than shouting alerts.
 
## 2. Colors: Depth Through Tonality
Our palette is rooted in the "Midnight" spectrum. We use color not just for decoration, but to define the physical architecture of the interface.
 
### The Palette
*   **Primary (The Growth):** `#78dc77` (Primary) / `#4caf50` (Container). This is our "Completed" state and our main brand touchpoint.
*   **Secondary (The Sun):** `#eac32b` (Secondary) / `#cca800` (Container). Used for "Upcoming" tasks and mid-level attention.
*   **Tertiary (The Alert):** `#ffb3ae` (Tertiary) / `#ff6b67` (Container). Used for "Urgent" tasks.
*   **Neutrals:** `#131313` (Background) and `#e5e2e1` (On-Surface). Our text is never pure white; it is a soft "off-white" to reduce eye fatigue and maintain the editorial feel.
 
### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. 
Structure must be defined by:
1.  **Background Shifts:** Use `surface-container-low` for secondary sections sitting on a `surface` background.
2.  **Tonal Transitions:** Use a slightly lighter or darker surface token to define a boundary.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Layer 0 (Base):** `surface` (`#131313`)
*   **Layer 1 (Sections):** `surface-container-low` (`#1c1b1b`)
*   **Layer 2 (Cards/Interaction):** `surface-container` (`#201f1f`) or `surface-container-high` (`#2a2a2a`)
 
### Signature Textures: Glass & Gradient
To elevate the experience, floating elements (like Modals or Navigation Bars) should use **Glassmorphism**. Apply `surface-container` at 80% opacity with a `20px` backdrop blur. 
*   **The CTA Glow:** Main action buttons should use a subtle linear gradient from `primary` (`#78dc77`) to `primary_container` (`#4caf50`) at a 135-degree angle to provide a sense of "soul" and dimension.
 
## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. It is a modern, geometric sans-serif that balances technical precision with organic warmth.
 
*   **Display (The Headline):** Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em). This is for high-impact moments or "Hero" task counts.
*   **Headline & Title:** These should feel authoritative. Use `headline-lg` for page titles. Always ensure a 2x scale jump between headlines and body text to maintain editorial contrast.
*   **Body & Labels:** Use `body-lg` (1rem) for primary reading. Labels (`label-md`) should be used sparingly for metadata, often in all-caps with slightly increased letter-spacing (+0.05em) to differentiate from body prose.
 
## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural scaffolding.
 
*   **The Layering Principle:** To create a "lifted" card, place a `surface-container-highest` object onto a `surface-container-low` background. The eye perceives the shift in luminosity as a change in physical height.
*   **Ambient Shadows:** If a shadow is required for a floating state, it must be "Ambient."
    *   **Blur:** 32px to 64px.
    *   **Opacity:** 4% to 8%.
    *   **Color:** Use a tinted shadow (a darker version of the background green/charcoal) rather than pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use the `outline-variant` token (`#3f4a3c`) at 20% opacity. It should be felt, not seen.
 
## 5. Components
 
### Cards & Lists
*   **Constraint:** Zero dividers. 
*   **Style:** Separate list items using `spacing-md` (0.75rem) or subtle background shifts. 
*   **Interaction:** On hover, a card should shift from `surface-container` to `surface-container-high`.
 
### Buttons
*   **Primary:** Gradient fill (`primary` to `primary-container`), rounded-xl (1.5rem). Use `on-primary` (`#00390a`) for text.
*   **Secondary:** Ghost style. No fill, `outline` stroke at 20% opacity. 
*   **Tertiary (Urgent):** Use `tertiary_container` fill with `on-tertiary_container` text for high-visibility "Delete" or "Urgent Action" states.
 
### Urgency Chips
*   **Urgent:** `tertiary_container` (`#ff6b67`) background.
*   **Upcoming:** `secondary_container` (`#cca800`) background.
*   **Completed:** `primary_container` (`#4caf50`) background.
*   **Shape:** Always `full` rounded (pills).
 
### Input Fields
*   **State:** Background should be `surface-container-lowest`. 
*   **Active State:** No heavy glow. Instead, transition the `outline` to the `primary` color at 50% opacity.
 
## 6. Do’s and Don’ts
 
### Do:
*   **Embrace Negative Space:** Give elements 1.5x more "breathing room" than you think they need.
*   **Use Asymmetry:** Align a large `display-lg` headline to the left while keeping the body content centered to create a sophisticated, non-template look.
*   **Layer with Intent:** Always know which `surface-container` tier you are on.
 
### Don’t:
*   **Don’t use dividers:** Never use a line to separate content. Use space or color.
*   **Don’t use "Pure" colors:** Avoid `#000000` and `#FFFFFF`. Stick to our defined neutral tokens to maintain the "Midnight" atmosphere.
*   **Don’t use sharp corners:** Every interactive element must use at least `DEFAULT` (0.5rem) roundedness to keep the "Botanical" feel.