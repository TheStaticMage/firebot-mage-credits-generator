// This is the configuration file for the Firebot Credits Browser Source. You
// should generally NOT overwrite this file when you upgrade the script because
// you'll lose your custom settings.
const config = {
    // Milliseconds per user displayed - for each user in the credits, add this
    // much time to the duration that the credits will be displayed. Larger
    // numbers will make the credits scroll slower.
    "durationPerUser": 1200,

    // Milliseconds per category displayed - for each category in the credits
    // that has at least one user in it, add this much time to the duration that
    // the credits will be displayed. Larger numbers will make the credits
    // scroll slower.
    "durationPerCategory": 500,

    // Firebot API base URL -- this is probably correct for most users. If you
    // have changed the API settings for Firebot, you may need to change this.
    // This is currently used only if you are having the browser source trigger
    // an effect list when the credits are done running, so you can ignore this
    // if you are not using that feature.
    "firebotBaseUrl": "http://127.0.0.1:7472/api/v1/effects/preset",

    // If you want the browser source to notify Firebot when the credits are
    // done running (e.g. to hide the browser source), set this to the ID of a
    // preset list. You can get this ID by finding the preset effect list in
    // Firebot, clicking Edit, and expanding the "How to trigger from
    // StreamDeck" section. Copy only the ID part, which is the long string that
    // looks like this: ff46a0f4-7928-429c-b87f-6be394d562d8
    "endAnimationEffectListId": "ff46a0f4-7928-429c-b87f-6be394d562d8",

    // Extra panel padding (in pixels) -- this controls how far the credits
    // container is initially pushed down from the bottom of the panel when the
    // credits start. This is useful if you want to have a brief pause before
    // the credits start scrolling. A higher number will result in the credits
    // taking longer to become visible when they start.
    "extraPanelPadding": 200
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
const sectionsConfig = [
    {
        "header": "Cheers and Bits",
        "key": "cheer"
    },
    {
        "header": "Donations and Tips",
        "key": "donation"
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
];
