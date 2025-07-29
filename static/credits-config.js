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
