# Firebot "Mage Credits Generator" Script

## Introduction

This is a script that helps with an "end credits" display for [Firebot](https://firebot.app/) (the all-in-one bot for Twitch streamers).

Features:
- Tracks numerous events including:
  - New followers
  - Subs and re-subs
  - Gifted subs
  - Bits and cheering

- Customizable:
  - Basic usage should work with minimal changes
  - Most display settings are changeable via CSS file
  - Uses a JSON data structure for maximum customization possibility

- Handles credits that date back to before the current stream:
  - Existing followers
  - Existing subscribers
  - Existing gifters

Feel free to stop by my Twitch stream (<https://www.twitch.tv/thestaticmage>) where you will see me roll the credits at the end of every stream.

## Installation

1. From the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases), download:

    - `firebot-mage-credits-generator-<version>.js` into your Firebot scripts directory

        (File &gt; Open Data Folder, then select the "scripts" directory)

        :warning: If you are upgrading from a prior version, delete any older versions of this script.

2. Enable custom scripts in Firebot (Settings &gt; Scripts).

3. Add the `firebot-mage-credits-generator-<version>.js` script that you just added as a startup script (Settings &gt; Scripts &gt; Manage Startup Scripts &gt; Add New Script).

    :warning: If you are upgrading from a prior version, delete any references to the older versions.

    :bulb: Read about the _Enumerate Existing Followers_ and _Enumerate Existing Subscribers_ settings and check these boxes appropriately. Generally, only very small channels without a lot of other activity will want to show all of their followers on the credits screen.

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
        const data = `$creditedUserListJSON`;
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

In order to show credits, you need to get events of interest registered with the credits system. The **Credit Generator: Register event** effect can be added to a number of common Firebot events to register the event without specifying parameters. The associated user and corresponding amount is automatically determined from the event metadata. This effect should be preferred over the more manual one when available.

You should this effect to any of the following events that you want to track with the credits system:

- Cheer (Twitch)
- Community Subs Gifted (Twitch)
- Donation (StreamElements)
- Follow (Twitch)
- Gift Sub Upgraded (Twitch) - _Credited as a new subscription_
- Incoming Raid (Twitch)
- Sub (Twitch)
- Sub Gifted (Twitch) - _Credits the gifter_
- Viewer Arrived (Twitch) - _Used for VIP and Moderator recognition_

The **Credit Generator: Register event manually** effect can be added to any Firebot event or effect list to register an event. You must supply the username to credit, and the amount to record. (The amount is typically used for enumerable events, like the number of subs gifted or number of bits cheered. But for events that really don't have an associated number, like following or chatting, you can just set this to any number, e.g. `0` or `1`).

## Configuration: Hide Credits in Firebot (Optional)

1. Create a Preset Effect List containing the following effects:

    - **Toggle OBS Source Visibility**

        - Sources: Select the browser source for the credits file
        - Choose **Hide**

2. Obtain the ID for the preset effect list by editing the list and expanding the "How to trigger from StreamDeck" section. The ID is a string at the end of the URL that looks like `be44bd33-e347-47bd-b758-f5062e6a35a7`.

3. Edit the `credits-config.js` file. Copy/paste the ID for your preset effect list into the "endAnimationEffectListId" field. (Copy just the ID, not any slashes.)

## Support

The best way to get help is in this project's thread on Discord. Join the [Crowbar Tools Discord](https://discord.gg/crowbartools-372817064034959370) and then visit the [thread for Mage Credits Generator]() there.

  - Please do not DM me on Discord.
  - Please do not ask for help in my chat when I am live on Twitch.

Bug reports and feature requests are welcome via [GitHub Issues](https://github.com/TheStaticMage/firebot-mage-credits-generator/issues).

## Contributing

Contributions are welcome via [Pull Requests](https://github.com/TheStaticMage/firebot-mage-credits-generator/pulls). I _strongly suggest_ that you contact me before making significant changes, because I'd feel really bad if you spent a lot of time working on something that is not consistent with my vision for the project. Please refer to the [Contribution Guidelines](/.github/contributing.md) for specifics.

## License

This project is released under the [GNU General Public License version 3](/LICENSE). That makes it free to use whether your stream is monetized or not.

If you use this on your stream, I would appreciate a shout-out. (Appreciated, but not required.)

- <https://www.twitch.tv/thestaticmage>

## Alternatives

This project was inspired by [CaveMobster's firebot-setup-end-credits script](https://github.com/CaveMobster/firebot-setup-end-credits), which implements an end-credits screen entirely with a Firebot setup (and no custom scripting).
