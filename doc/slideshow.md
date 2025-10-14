# Slideshow Mode Documentation

## Introduction

The Firebot Mage Credits Generator supports two display modes: traditional scrolling credits and a modern slideshow presentation. Slideshow mode displays credits as a series of slides, with each slide showing a subset of users in a grid layout. This mode offers advanced customization options including CSS styling, fade transitions, blank slides, and per-category configuration.

Refer to [Display Customization](/doc/display-customization.md) for a general overview of the files that can be changed.

## Table of Contents

- [Global Slideshow Configuration](#global-slideshow-configuration)
- [Per-Section Slideshow Configuration](#per-section-slideshow-configuration)
- [Advanced Examples](#advanced-examples)
- [CSS Customization Elements](#css-customization-elements)
- [Fade Behavior](#fade-behavior)
- [Converting from Scroll to Slideshow Mode](#converting-from-scroll-to-slideshow-mode)

## Global Slideshow Configuration

The global slideshow configuration is defined in `config.slideshow` and provides defaults for all slides. Each parameter can be overridden on a per-section basis.

To enable the slideshow display mode, add the `displayMode` parameter to the configuration object in `credits-config.js`. (Refer to [Display Customization](/doc/display-customization.md) for instructions to find, edit, and activate changes to this file.)

```javascript
const config = {
    "displayMode": "slideshow",
    // ... other config options
}
```

Here is a more complete example of a slideshow configuration that can serve as a starting point. These parameters are described in subsequent sections.

```javascript
const config = {
    "displayMode": "slideshow",
    "slideshow": {
        "slideDuration": 5000,           // Time each slide displays (ms)
        "maxRows": 3,                    // Maximum rows per slide
        "maxColumns": 4,                 // Maximum columns per slide
        "fadeOutDuration": 500,          // Fade out duration (ms)
        "fadeInDuration": 500,           // Fade in duration (ms)
        "initialFadeInDuration": 0,      // First slide fade in (ms)
        "finalFadeOutDuration": 2000,    // Final fade out duration (ms)
        "categoryHeaderEnabled": true,    // Show category headers
        "fadeBetweenSameCategorySlides": true // Fade within categories
    }
}
```

### Basic Parameters

#### `slideDuration` (default: 5000 = 5 seconds)

Time in milliseconds each slide is displayed before transitioning to the next.

```javascript
"slideshow": {
    "slideDuration": 7000  // Each slide shows for 7 seconds
}
```

#### `maxRows` (default: 3)

Maximum number of rows of entries per slide. Controls vertical layout.

```javascript
"slideshow": {
    "maxRows": 4  // Up to 4 rows of users per slide
}
```

#### `maxColumns` (default: 4)

Maximum number of columns of entries per slide. Controls horizontal layout.

```javascript
"slideshow": {
    "maxColumns": 3  // Up to 3 columns of users per slide
}
```

**Note**: With `maxRows: 3` and `maxColumns: 4`, each slide can display up to 12 users (3×4 grid). If a category has more users, they'll be split across multiple slides.

### Fade Transition Parameters

Slideshow mode supports four different fade durations for professional transitions:

#### `fadeOutDuration` (default: 500)

Duration in milliseconds for fading out between slides during regular transitions.

#### `fadeInDuration` (default: 500)

Duration in milliseconds for fading in between slides during regular transitions.

#### `initialFadeInDuration` (default: 0)

Duration for the very first slide to fade in. Set to 0 for instant appearance, or a positive value for a gentle start.

#### `finalFadeOutDuration` (default: 2000)

Duration for the final slide to fade out when the slideshow completes. Typically longer for a dramatic ending.

```javascript
"slideshow": {
    "fadeOutDuration": 300,        // Quick fade out
    "fadeInDuration": 700,         // Slower fade in
    "initialFadeInDuration": 1000, // Gentle start
    "finalFadeOutDuration": 3000   // Dramatic ending
}
```

### Display Control Parameters

#### `categoryHeaderEnabled` (default: true)

Whether to display category headers at the top of each slide.

```javascript
"slideshow": {
    "categoryHeaderEnabled": false  // Hide all category headers
}
```

#### `fadeBetweenSameCategorySlides` (default: true)

Whether to fade between multiple slides of the same category. When `false`, slides within the same category transition instantly, while category changes still fade. Note that regardless of this setting, the category title itself will not fade in or out when transitioning between slides in the same category.

```javascript
"slideshow": {
    "fadeBetweenSameCategorySlides": false  // Instant transitions within categories
}
```

## Per-Section Slideshow Configuration

Each section can override global settings and add section-specific customization by including a `slideshow` object:

### Basic Section Overrides

```javascript
{
    "header": "Top Supporters",
    "key": "donation",
    "slideshow": {
        "slideDuration": 10000,    // Show this category longer
        "maxColumns": 2,           // Fewer columns for larger display
        "fadeBetweenSameCategorySlides": false  // No fade within this category
    }
}
```

### Blank Slides

Use `isBlankSlide` to create slides that display even when there are no entries, useful for title cards or thank you messages:

```javascript
{
    "header": "Thank You for Watching!",
    "key": "ending",
    "slideshow": {
        "isBlankSlide": true,
        "slideDuration": 4000
    }
}
```

### CSS Customization

Slideshow mode supports extensive CSS customization through both CSS classes and direct properties:

#### CSS Classes

Apply custom CSS classes to different slide elements:

```javascript
{
    "header": "VIP Supporters",
    "key": "vip",
    "slideshow": {
        "containerClass": "vip-slide premium-border",
        "headerClass": "golden-text large-header",
        "gridClass": "vip-grid",
        "contentClass": "vip-content"
    }
}
```

#### Direct CSS Properties

Apply CSS properties directly (these override class styles):

```javascript
{
    "header": "Top Donors",
    "key": "donation",
    "slideshow": {
        "containerCSS": {
            "backgroundColor": "rgba(255, 215, 0, 0.9)",
            "border": "3px solid #ffd700",
            "borderRadius": "15px"
        },
        "headerCSS": {
            "color": "#8b0000",
            "fontSize": "48px",
            "textShadow": "3px 3px 6px rgba(0, 0, 0, 0.8)"
        },
        "gridCSS": {
            "gap": "25px",
            "padding": "20px"
        },
        "contentCSS": {
            "background": "linear-gradient(45deg, #ffd700, #ffed4e)"
        }
    }
}
```

**CSS Property Notes**:

- Use camelCase for property names (e.g., `backgroundColor`, `fontSize`)
- The system automatically converts them to kebab-case for CSS
- CSS classes are applied first, then direct properties override class styles
- Styles reset between categories for clean transitions

### Perfect Vertical Centering

For blank slides or special presentations, achieve perfect vertical centering:

```javascript
{
    "header": "🎉 Stream Complete! 🎉",
    "key": "ending",
    "slideshow": {
        "isBlankSlide": true,
        "slideDuration": 5000,
        "contentCSS": {
            "justifyContent": "center",
            "alignItems": "center"
        },
        "headerCSS": {
            "margin": "0",           // Remove default margins
            "fontSize": "64px",
            "textAlign": "center"
        }
    }
}
```

## Advanced Examples

### Multi-Slide Category with Custom Styling

```javascript
{
    "header": "🏆 Hall of Fame Donors 🏆",
    "key": "donationByAmount",
    "limit": 20,  // Will create multiple slides if needed
    "slideshow": {
        "maxRows": 2,
        "maxColumns": 3,
        "slideDuration": 8000,
        "fadeBetweenSameCategorySlides": true,
        "containerCSS": {
            "backgroundColor": "rgba(218, 165, 32, 0.8)",
            "border": "5px solid gold",
            "borderRadius": "20px",
            "boxShadow": "0 0 30px rgba(255, 215, 0, 0.5)"
        },
        "headerCSS": {
            "color": "#ffffff",
            "fontSize": "42px",
            "textShadow": "2px 2px 4px rgba(0, 0, 0, 0.9)",
            "marginBottom": "20px"
        },
        "gridCSS": {
            "gap": "20px",
            "padding": "25px"
        }
    }
}
```

### Slideshow with Title and Ending Cards

```javascript
const sectionsConfig = [
    {
        "header": "🎮 Stream Highlights 🎮",
        "key": "intro",
        "slideshow": {
            "isBlankSlide": true,
            "slideDuration": 3000,
            "contentCSS": {
                "justifyContent": "center",
                "alignItems": "center",
                "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            "headerCSS": {
                "fontSize": "72px",
                "color": "#ffffff",
                "textAlign": "center",
                "margin": "0"
            }
        }
    },
    {
        "header": "💰 Top Supporters 💰",
        "key": "donation",
        "slideshow": {
            "maxColumns": 2,
            "slideDuration": 6000
        }
    },
    {
        "header": "🌟 New Followers 🌟",
        "key": "follow",
        "slideshow": {
            "maxColumns": 4,
            "slideDuration": 4000
        }
    },
    {
        "header": "Thanks for Watching! 💜",
        "key": "outro",
        "slideshow": {
            "isBlankSlide": true,
            "slideDuration": 4000,
            "contentCSS": {
                "justifyContent": "center",
                "alignItems": "center",
                "backgroundColor": "rgba(100, 65, 165, 0.9)"
            },
            "headerCSS": {
                "fontSize": "56px",
                "color": "#ffffff",
                "textAlign": "center",
                "margin": "0"
            }
        }
    }
];
```

## CSS Customization Elements

The slideshow provides four main elements you can customize:

1. **Container** (`slideshow-container`): The main slideshow wrapper
2. **Content** (`slide-content`): The slide content wrapper
3. **Header** (`category-header`): The category header text
4. **Grid** (`slide-grid`): The grid containing user entries

Each can be styled with both CSS classes and direct properties via the `slideshow` configuration object.

## Fade Behavior

Slideshow mode implements intelligent fading:

- **Category Changes**: Always fade out completely, then fade in new content
- **Same Category**: Behavior controlled by `fadeBetweenSameCategorySlides`
  - When `true`: Fade out grid only (header stays), then fade in new grid
  - When `false`: Instant transition (no fade)
- **Special Slides**:
  - First slide uses `initialFadeInDuration`
  - Last slide uses `finalFadeOutDuration`

## Converting from Scroll to Slideshow Mode

If you're currently using the traditional scrolling credits and want to switch to slideshow mode, follow these steps:

### Step 1: Change Display Mode

In your `credits-config.js` file, change the display mode (if necessary, add the new "displayMode" parameter):

```javascript
const config = {
    "displayMode": "slideshow", // Changed from "scroll" or added new
    // ... other config options
}
```

### Step 2: Add Slideshow Configuration

Add the slideshow configuration block to your config:

```javascript
const config = {
    "displayMode": "slideshow",
    "slideshow": {
        "slideDuration": 5000,           // Time each slide displays (ms)
        "maxRows": 3,                    // Maximum rows per slide
        "maxColumns": 4,                 // Maximum columns per slide
        "fadeOutDuration": 500,          // Fade out duration (ms)
        "fadeInDuration": 500,           // Fade in duration (ms)
        "initialFadeInDuration": 0,      // First slide fade in (ms)
        "finalFadeOutDuration": 2000,    // Final fade out duration (ms)
        "categoryHeaderEnabled": true,    // Show category headers
        "fadeBetweenSameCategorySlides": true // Fade within categories
    }
}
```

### Step 3: Update Section Configuration (Optional)

Your existing sections will work as-is, but you can enhance them with slideshow-specific options:

```javascript
// Before (scroll mode)
{
    "header": "Top Donors",
    "key": "donation",
    "limit": 10
}

// After (slideshow mode with customization)
{
    "header": "Top Donors",
    "key": "donation",
    "limit": 10,
    "slideshow": {
        "maxColumns": 2,        // Override global setting
        "slideDuration": 8000,  // Show longer for important category
        "containerCSS": {
            "backgroundColor": "rgba(255, 215, 0, 0.2)"
        }
    }
}
```

### Migration Tips

When converting from scroll to slideshow mode:

1. **Test with your data**: Run a test generation to see how many slides each category creates
2. **Adjust grid size**: Use `maxRows` and `maxColumns` to control information density
3. **Tune timing**: Adjust `slideDuration` based on how much time viewers need to read each slide
4. **Add blank slides**: Consider adding title/ending slides for better presentation flow
5. **Customize important categories**: Use CSS styling for key categories like donations or subscriptions
6. **Preview transitions**: Test different fade durations to find what feels right for your stream

The slideshow mode provides a modern, professional presentation that works especially well for end-of-stream credit rolls and special recognition segments.
