# Installation and Configuration

## Installation: Script

1. From the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases), download:

    - `firebot-mage-credits-generator-<version>.js` into your Firebot scripts directory

        (File &gt; Open Data Folder, then select the "scripts" directory)

2. Enable custom scripts in Firebot (Settings &gt; Scripts) if you have not already done so.

3. Go to Settings &gt; Scripts &gt; Manage Startup Scripts &gt; Add New Script and add the `firebot-mage-credits-generator-<version>.js` script.

    :bulb: For now, it is suggested to leave the script settings at their defaults. You can always come back to change these later.

4. Restart Firebot.

## Installation: Browser Files

1. Copy the files from zip file in the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases), or from this repository's [`browser-source-files`](/browser-source-files/) directory, to some directory on your computer where you can easily find them later.

    - This does not necessarily have to be anywhere in Firebot's directory hierarchy.
    - If you have already organized other assets (e.g. images and sounds), putting this directory in the same general area is recommended.

2. Copy the file `credits-json-template.js` and name it `credits-json.js` in the same directory as the other browser files.

    - You don't need to edit this file at all, because this is where Firebot will write the credits data. The template that we provide is just there to get you up and running at the beginning.

3. Copy the file `credits-config-template.js` and name it `credits-config.js` in the same directory as the other browser files.

    - You don't need to edit this file right now. The defaults will get you up and running with a basic setup. (Later on, you may want to [customize the display](/doc/display-customization.md).)

## Configuration: OBS

1. Add a Browser Source to the scene(s) where you want to display the credits.

    - Uncheck the "Local file" checkbox
    - The URL doesn't really matter yet since this will be set in Firebot later
    - Set the width and height of the Browser Source to match your screen size
    - Check the "Shutdown source when not visible" checkbox
    - Check the "Refresh browser when scene becomes active" checkbox
    - Select "No access to OBS" for the page permissions

## Configuration: Credits URL

Locate the `credits.html` file (in the browser files) as a `file:///` URL. You will need to enter this into a Firebot effect in the next section.

This URL will ultimately look something like:

(Mac/Linux):

```text
file:///home/bob/obs/browser-source-files/credits.html
```

(Windows):

```text
file:///C:/Users/bob/obs/browser-source-files/credits.html
```

:bulb: Windows users: note that URLs use the forward slash (`/`) and not the backslash (`\`) as the directory separator.

One way to help you find this URL is to open your web browser and type `file:///` in the address bar. This should bring up a directory listing, from which you may be able to click until you reach the credits file. Then you can copy the final URL from your browser.

You'll need this URL for step 2 in the next section.

## Configuration: Roll Credits in Firebot

Create a Preset Effect List (perhaps called "Roll Credits") containing the following effects:

1. **Write To File**

    - File: Choose the `credits-json.js` file that you installed with the browser files
    - Write Mode: Replace
    - Text: _Copy and paste the following exactly as it appears below_
        ```text
        // File maintained by Firebot -- DO NOT EDIT
        const data = `$creditedUserListBase64encode[$creditedUserListJSON]`;
        ```

2. **Set OBS Browser Source URL**

    - OBS Browser Source: Select the browser source you created
    - URL: The `file:///` URL from the previous section

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

For other events or within preset effect lists, the **Credit Generator: Register event manually** effect can used. With this effect, you must select the event type and supply the username to credit and the amount to record.

- The username is often `$username` in Firebot, but not necessarily all the time.
- The amount is typically used for enumerable events, like the number of subs gifted or number of bits cheered. There are some events that really don't have an associated number, like following or chatting, so you can just set this to `1` in those cases.

:bulb: Use the "Credit Generator: Register event" instead of the "Credit Generator: Register event manually" event whenever possible.

## Try It Out

At this point you should have a working system, so let's test it.

1. Start both OBS and Firebot.

2. Simulate some events in Firebot, such as follows or subscriptions. (Events &gt; Simulate Event)

3. Roll the credits. (Preset Effect Lists &gt; _click the "play" button next to the "Roll credits" list you created_)

:bulb: You can also watch the credits in an ordinary browser. Just copy the `file:///` URL from Firebot into the browser's address bar. This is a good way to troubleshoot if necessary.

## Configuration: Hide Credits in Firebot (Optional)

If you would like to have the browser source be hidden automatically once the credits have all run, you can set that up as follows:

1. Create a Preset Effect List (perhaps called "Hide Credits") containing the following effects:

    - **Toggle OBS Source Visibility**

        - Sources: Select the browser source for the credits file
        - Choose **Hide**

2. Obtain the ID for the preset effect list by editing the list and expanding the "How to trigger from StreamDeck" section. The ID is a string at the end of the URL that looks like `be44bd33-e347-47bd-b758-f5062e6a35a7`.

3. Edit the `credits-config.js` file. Copy/paste the ID for your preset effect list into the "endAnimationEffectListId" field. (Copy just the ID, not any slashes.)

:bulb: If you are a very advanced user who has changed the address or port that the Firebot API listens on, you will also need to update `firebotBaseUrl` in the `credits-config.js` file. Only the most advanced users are likely to have changed this. The default value in this file should work for just about everyone.
