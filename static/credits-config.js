// This file is intended for users to modify to suit their own needs. To do
// this, copy this file to a directory of your choice, and then point the
// **Credit Generator: Generate Credits** effect at it.
//
// Note: This file is JavaScript, and it must correctly compile in order to
// work. If you are not familiar with JavaScript, you may want to read some
// tutorials on the language before attempting to modify this file. The code in
// this file is intended to be easy to read and understand, but it is still
// JavaScript...

const config = {
    // Display mode: "scroll" (traditional scrolling) or "slideshow" (slide-based)
    "displayMode": "scroll",

    // Milliseconds per user displayed - for each user in the credits, add this
    // much time to the duration that the credits will be displayed. Larger
    // numbers will make the credits scroll slower.
    "durationPerUser": 1200,

    // Milliseconds per category displayed - for each category in the credits
    // that has at least one user in it, add this much time to the duration that
    // the credits will be displayed. Larger numbers will make the credits
    // scroll slower.
    "durationPerCategory": 500,

    // Extra panel padding (in pixels) -- this controls how far the credits
    // container is initially pushed down from the bottom of the panel when the
    // credits start. This is useful if you want to have a brief pause before
    // the credits start scrolling. A higher number will result in the credits
    // taking longer to become visible when they start.
    "extraPanelPadding": 200,

    // Slideshow mode configuration (only used when displayMode is "slideshow")
    // Note: Four separate fade durations can be configured:
    // - initialFadeInDuration: First slide appearance (default: 0ms - instant)
    // - fadeInDuration: Regular slide transitions fade-in (default: 500ms)
    // - fadeOutDuration: Regular slide transitions fade-out (default: 500ms)
    // - finalFadeOutDuration: Final slideshow disappearance (default: 2000ms)
    "slideshow": {
        // Default time each slide is displayed (milliseconds)
        "slideDuration": 5000,
        // Default maximum rows per slide
        "maxRows": 3,
        // Default maximum columns per slide
        "maxColumns": 4,
        // Duration of fade out transitions between slides (milliseconds)
        "fadeOutDuration": 500,
        // Duration of fade in transitions between slides (milliseconds)
        "fadeInDuration": 500,
        // Duration of fade in for the very first slide (milliseconds) - 0 means instant appearance
        "initialFadeInDuration": 0,
        // Duration of fade out for the very last slide/slideshow completion (milliseconds)
        "finalFadeOutDuration": 2000,
        // Whether to show category header at the top of each slide
        "categoryHeaderEnabled": true,
        // Whether to fade between multiple slides of the same category
        // (always fades when switching categories or ending slideshow)
        "fadeBetweenSameCategorySlides": true
    }
}

// This configures the sections of the credits. Each section will be displayed
// in the order they are listed here, and each section will have a header
// displayed above the users in that section. The key is used to identify the
// section in the JSON data. The header is the text that will be displayed above
// the users in that section. You can add or remove sections as needed, but the
// keys must match the keys in the JSON data.
//
// Note: If there are no users in a section, that section will be skipped
// automatically.
//
// For slideshow mode, you can add a "slideshow" object to any section with the following properties:
// - "maxRows": Maximum rows of entries per slide for this section (overrides default)
// - "maxColumns": Maximum columns of entries per slide for this section (overrides default)
// - "slideDuration": Time in milliseconds to display each slide for this section (overrides default)
// - "fadeBetweenSameCategorySlides": Whether to fade between slides within this category (overrides default)
// - "isBlankSlide": Set to true to display this slide even with no entries (useful for ending slides)
//
// CSS Customization (slideshow mode only - within "slideshow" object):
// Direct CSS Properties:
// - "containerCSS": Object containing CSS properties for the main slideshow container
// - "contentCSS": Object containing CSS properties for the slide content wrapper
// - "headerCSS": Object containing CSS properties for the category header text
// - "gridCSS": Object containing CSS properties for the entries grid layout
//
// CSS Classes (applied in addition to direct CSS):
// - "containerClass": CSS class name(s) to add to the slideshow container
// - "contentClass": CSS class name(s) to add to the slide content wrapper
// - "headerClass": CSS class name(s) to add to the category header
// - "gridClass": CSS class name(s) to add to the entries grid
//
// CSS property names should be in camelCase (e.g., "backgroundColor", "fontSize").
// The system will automatically convert them to kebab-case for CSS.
// Classes are applied before direct CSS, so CSS properties will override class styles.
// Styles and classes are reset between category changes, so each category starts clean.
//
// For perfect vertical centering (especially useful for blank slides), use:
// "contentCSS": { "justifyContent": "center", "alignItems": "center" }
// "headerCSS": { "margin": "0" } // Remove default margins
//
// Example slideshow configuration with CSS classes and properties:
// {
//     "header": "Top Donors",
//     "key": "donation",
//     "slideshow": {
//         "maxRows": 2,
//         "maxColumns": 3,
//         "slideDuration": 8000,
//         "fadeBetweenSameCategorySlides": false,
//         "containerClass": "donor-category special-border",
//         "headerClass": "gold-text large-header",
//         "containerCSS": {
//             "backgroundColor": "rgba(255, 100, 100, 0.9)",
//             "borderColor": "#ff6666"
//         },
//         "headerCSS": {
//             "color": "#ffdd00",
//             "fontSize": "48px"
//         }
//     }
// }
//
// Example blank ending slide (header automatically centered vertically):
// {
//     "header": "Thank You!",
//     "key": "ending",
//     "slideshow": {
//         "isBlankSlide": true,
//         "slideDuration": 3000,
//         "containerCSS": {
//             "backgroundColor": "rgba(0, 0, 0, 0.8)"
//         },
//         "headerCSS": {
//             "fontSize": "64px",
//             "color": "#ffffff",
//             "textAlign": "center"
//         }
//     }
// }
const sectionsConfig = [
    {
        "header": "Cheers and Bits",
        "key": "cheer"
    },
    {
        "header": "Charity Donations",
        "key": "charityDonation"
    },
    {
        "header": "Tips",
        "key": "donation"
        // Example of custom CSS classes and properties for a specific category:
        // "slideshow": {
        //     "containerClass": "donation-category premium-border",
        //     "headerClass": "donation-header",
        //     "containerCSS": {
        //         "backgroundColor": "rgba(255, 215, 0, 0.9)",
        //         "borderColor": "#ffd700",
        //         "border": "3px solid #ffd700"
        //     },
        //     "headerCSS": {
        //         "color": "#8b0000",
        //         "fontSize": "48px",
        //         "textShadow": "3px 3px 6px rgba(0, 0, 0, 0.8)"
        //     },
        //     "gridCSS": {
        //         "gap": "25px"
        //     }
        // }
    },
    {
        "header": "Subs and Re-Subs",
        "key": "sub"
    },
    {
        "header": "New Gift Subs",
        "key": "gift"
    },
    {
        "header": "Raids",
        "key": "raid"
    },
    {
        "header": "New Follows",
        "key": "follow"
    },
    {
        "header": "Moderators",
        "key": "moderator"
    },
    {
        "header": "VIPs",
        "key": "vip"
    },
    {
        "header": "Gifters",
        "key": "existingGifters"
    },
    {
        "header": "Subscribers",
        "key": "existingPaidSubs"
    }

    // Uncomment the section below to add a blank slide at the end of your slideshow
    // This is useful for displaying a "Thank You" message or other ending content
    // The header will be automatically centered vertically on blank slides
    // {
    //     "header": "Thank You for Watching!",
    //     "key": "ending",
    //     "slideshow": {
    //         "isBlankSlide": true,
    //         "slideDuration": 3000,
    //         "containerCSS": {
    //             "backgroundColor": "rgba(50, 50, 50, 0.95)"
    //         },
    //         "headerCSS": {
    //             "fontSize": "48px",
    //             "color": "#ffffff",
    //             "textAlign": "center"
    //         }
    //     }
    // }
];
