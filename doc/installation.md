# Installation and Configuration

## Requirements

| Plugin Version | Minimum Firebot Version |
| --- | --- |
| 1.0.0+ | 5.65 |
| 0.2.5 and earlier | 5.64 and earlier |

If you have Firebot 5.64 or earlier, you should use version 0.2.5. For Firebot 5.65 and higher, use version 1.0.0 or later. See [Upgrading](/doc/upgrading.md) for more information.

## Installation: Script

1. Enable custom scripts in Firebot (Settings &gt; Scripts) if you have not already done so.

2. From the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases), download `firebot-mage-credits-generator-<version>.js` into your Firebot scripts directory

    (File &gt; Open Data Folder, then select the "scripts" directory)

    :warning: Be sure you download the file from the releases page, not the source code of the GitHub repository!

3. Go to Settings &gt; Scripts &gt; Manage Startup Scripts &gt; Add New Script and add the `firebot-mage-credits-generator-<version>.js` script.

    :bulb: For now, it is suggested to leave the script settings at their defaults. You can always come back to change these later.

4. Restart Firebot. (The script will _not_ be loaded until you actually restart Firebot.)

## Configuration: OBS

1. Add a Browser Source to the scene where you want to display the credits.

    - Uncheck the "Local file" checkbox
    - You can leave the URL as-is (Firebot will set this later)
    - Set the width and height of the Browser Source
        - Width: 525
        - Height: Set to the height of your screen (e.g. 1080)
    - Check the "Shutdown source when not visible" checkbox
    - Check the "Refresh browser when scene becomes active" checkbox
    - Select "No access to OBS" for the page permissions

2. Position the browser source where you would like the credits to be displayed.

:bulb: You can always come back later, when you are [customizing](/doc/display-customization.md) things, and adjust the size and positioning of the browser source. For now, we recommend using the suggested values so that you can get up and running quickly.

## Configuration: Roll Credits in Firebot

Create a Preset Effect List (perhaps called "Roll Credits") containing the following effects:

1. **Credit Generator: Generate Credits**

    - You can leave all of the customization settings unconfigured for now to use the defaults. Once you have things up and running, you can [customize](/doc/display-customization.md) things further.

2. **Set OBS Browser Source URL**

    - OBS Browser Source: Select the browser source you created
    - URL: `http://localhost:7472/$effectOutput[creditsUrl]`

    :bulb: If you have changed the address or port that Firebot runs on, you will need to adjust this URL accordingly. (Most users have not done this. If you are not sure, you almost certainly have not done this.)

3. **Toggle OBS Source Visibility**

    - Sources: Select the browser source for the credits file
    - Choose **Show**

## Configuration: Register Credits in Firebot

In order to show credits, you need to get events of interest registered with the credits system.

The **Credit Generator: Register event** effect can be added to a number of common Firebot events to register the event without specifying parameters. The associated user and corresponding amount is automatically determined from the event metadata.

Add this effect to any of the following events that you want to track with the credits system:

- Cheer (Twitch)
- Community Subs Gifted (Twitch)
- Donation (StreamElements)
- Follow (Twitch)
- Gift Sub Upgraded (Twitch) - _Upgrading a gift sub is credited as a new subscription_
- Incoming Raid (Twitch)
- Sub (Twitch) - _Covers both new subs and renewals_
- Sub Gifted (Twitch) - _Gifting a sub credits the gifter_
- Viewer Arrived (Twitch) - _This is used for VIP and Moderator recognition_

If you are using my [Twitch combo support script](https://github.com/TheStaticMage/firebot-combo-event), you can add this effect to the "Combo" event.

If you are using my [Kick integration](https://github.com/TheStaticMage/firebot-mage-kick-integration), you can add this effect to the following Kick events:

- Community Subs Gifted (Kick)
- Follow (Kick)
- Host (Kick) (will be treated as raid)
- Kicks Gifted (will be treated as bits)
- Sub Gifted (Kick)
- Viewer Arrived (Kick)

## Configuration: Manual Events

For other events or within preset effect lists, the **Credit Generator: Register event manually** effect can used. With this effect, you must select the event type and supply the username to credit and the amount to record.

- The username is often `$username` in Firebot, but not necessarily all the time.
- The amount is typically used for enumerable events, like the number of subs gifted or number of bits cheered. There are some events that really don't have an associated number, like following or chatting, so you can just set this to `1` in those cases.

You can use this effect to register credit for any of the built-in events. If you want to register custom credit types, see: [Custom Credits](/doc/custom-credits.md).

:bulb: Use the "Credit Generator: Register event" instead of the "Credit Generator: Register event manually" event whenever possible.

## Try It Out

At this point you should have a working system, so let's test it.

1. Start both OBS and Firebot.

2. Simulate some events in Firebot, such as follows or subscriptions. (Events &gt; Simulate Event)

    :warning: You need to enter the username of an actual user who is in your user database when you simulate events. If you leave the username as "Firebot" (a known bot), the credits will not be displayed because this bot is not in your user database.

    :bulb: It is not necessary to look up the Twitch User ID when you simulate events. You may leave this blank.

3. Roll the credits. (Preset Effect Lists &gt; _click the "play" button next to the "Roll credits" list you created_)

:bulb: You can also watch the credits in an ordinary browser. Just copy the URL that Firebot sets in OBS into your browser's address bar. This is a good way to troubleshoot if necessary.

## Configuration: Hide Credits in Firebot (Optional)

If you would like to have the browser source be hidden automatically once the credits have all run, you can set that up as follows:

1. Go to Events and add an event for **Credits Ended**.

2. Add effect(s) that you want to run when the credits are finished. For example:

    - **Toggle OBS Source Visibility**

        - Sources: Select the browser source for the credits file
        - Choose **Hide**
