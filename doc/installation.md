# Installation and Configuration

## Initial Installation

1. From the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases), download:

    - `firebot-mage-credits-generator-<version>.js` into your Firebot scripts directory

        (File &gt; Open Data Folder, then select the "scripts" directory)

        :warning: If you are upgrading from a prior version, delete any older versions of this script.

2. Enable custom scripts in Firebot (Settings &gt; Scripts).

3. Add the `firebot-mage-credits-generator-<version>.js` script that you just added as a startup script (Settings &gt; Scripts &gt; Manage Startup Scripts &gt; Add New Script).

    :warning: If you are upgrading from a prior version, delete any references to the older versions.

    :bulb: For now, it is suggested to leave the additional settings at their defaults. You can always come back to change these later.

4. Restart Firebot.

## Configuration: Browser Files

1. Copy the files from the [`browser-source-files`](/browser-source-files/) directory to some directory on your computer where you can easily find them later. This does not necessarily have to be anywhere in Firebot's directory hierarchy. If you have already organized your other OBS assets, like images and sounds, putting this directory in that area is ideal.

    :warning: You may customize these files, so don't blindly overwrite existing files when a new version is released.

    :bulb: The current version of these files is also available as a zip file in the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases).

2. Copy the file `credits-json-template.js` and name it `credits-json.js` in the same directory as the other files. You don't need to edit this file for now, because this is where Firebot will write the credits data later.

3. Copy the file `credits-config-template.js` and name it `credits-config.js` in the same directory as the other files.

  You don't need to make changes to this file immediately. However, this is the place you will go later to set up or customize:

  - How fast the credits scroll
  - What categories to show, and in what order
  - Triggering a Firebot effect list when the credits are done scrolling

## Configuration: OBS

1. Add a Browser Source to the scene(s) where you want to display the credits.

    - Uncheck the "Local file" checkbox
    - The URL doesn't really matter yet since this will be set in Firebot later
    - Set the width and height of the Browser Source to match your screen size
    - Check the "Shutdown source when not visible" checkbox
    - Check the "Refresh browser when scene becomes active" checkbox
    - Select "No access to OBS" for the page permissions

## Configuration: Roll Credits in Firebot

Create a Preset Effect List containing the following effects:

1. **Write To File**

    - File: Choose the `credits-json.js` file that you installed with the browser files
    - Write Mode: Replace
    - Text: _Copy and paste the following exactly as it appears below_
        ```text
        // File maintained by Firebot -- DO NOT EDIT
        const data = `$creditedUserListBase64encode[$creditedUserListJSON]`;
        ```

2. **Set OBS Browser Source URL**

    - OBS Browser Source: Select the browser source you created in the prior section
    - URL: This should be the `file:///` URL to the `credits.html` file from the browser files

        Example URL (Mac/Linux):

        ```text
        file:///home/bob/obs/browser-source-files/credits.html?ts=$unixTimestamp
        ```

        Example URL (Windows):

        ```text
        file:///C:/Users/bob/obs/browser-source-files/credits.html?ts=$unixTimestamp
        ```

        :bulb: Appending the Unix timestamp to the URL ensures that the browser does not cache the page.

3. **Toggle OBS Source Visibility**

    - Sources: Select the browser source for the credits file
    - Choose **Show**

:bulb: If you're having trouble figuring out the correct URL, you can test it in a browser (minus the `?ts=$unixTimestamp` part). You can run this preset effect list manually to generate the underlying data. Assuming that you have at least one subscriber to your channel to display when enumerating existing subs, the page should load and roll the credits in an ordinary browser.

## Configuration: Register Credits in Firebot

In order to show credits, you need to get events of interest registered with the credits system.

The **Credit Generator: Register event** effect can be added to a number of common Firebot events to register the event without specifying parameters. The associated user and corresponding amount is automatically determined from the event metadata.

:bulb: Use this effect instead of the "Credit Generator: Register event manually" one whenever possible.

Add this effect to any of the following events that you want to track with the credits system:

- Cheer (Twitch)
- Community Subs Gifted (Twitch)
- Donation (StreamElements)
- Follow (Twitch)
- Gift Sub Upgraded (Twitch) - _Upgrading a gift sub is credited as a new subscription_
- Incoming Raid (Twitch)
- Sub (Twitch)
- Sub Gifted (Twitch) - _Gifting a sub credits the gifter_
- Viewer Arrived (Twitch) - _This is used for VIP and Moderator recognition_

For other events, the **Credit Generator: Register event manually** effect can used. With this effect, you must supply the username to credit, and the amount to record.

- The username is often `$username` in Firebot, but not necessarily all the time.
- The amount is typically used for enumerable events, like the number of subs gifted or number of bits cheered. There are some events that really don't have an associated number, like following or chatting, so you can just set this to `0` or `1` in those cases.

## Configuration: Hide Credits in Firebot (Optional)

1. Create a Preset Effect List containing the following effects:

    - **Toggle OBS Source Visibility**

        - Sources: Select the browser source for the credits file
        - Choose **Hide**

2. Obtain the ID for the preset effect list by editing the list and expanding the "How to trigger from StreamDeck" section. The ID is a string at the end of the URL that looks like `be44bd33-e347-47bd-b758-f5062e6a35a7`.

3. Edit the `credits-config.js` file. Copy/paste the ID for your preset effect list into the "endAnimationEffectListId" field. (Copy just the ID, not any slashes.)
