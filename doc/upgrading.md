# Upgrading

## Versioning Philosophy

- A **patch release** changes the last number (e.g. `0.0.3` -> `0.0.4`). These releases may fix bugs or add features, but your existing setup should continue to work just fine. _You may review the upgrade notes for any specific information, e.g. if you need to update any custom style sheet or configuration to take advantage of new features._

- A **minor release** changes the middle number (e.g. `0.0.4` -> `0.1.0`). These releases typically make some kind of considerable (but backward-compatible) change, in addition to possibly fixing bugs or adding features. Your existing setup should continue to work just fine. However, we may _deprecate_ certain ways of doing things -- this doesn't break anything yet, but warns you to switch to the recommended way of doing things at some point. _You should review the upgrade notes below when upgrading to a minor version to check for newly deprecated items._

- A **major release** changes the first number (e.g. `0.1.5` -> `1.0.0`). These releases correspond to a major milestone in the project, and they might contain breaking changes. We will have tried our best to warn you of this in advance by deprecating old ways of doing things in previous releases, but this is when we actually "pull the plug." _It is essential that you review the upgrade notes below when upgrading a major version to check for breaking changes and newly deprecated items._

## General Upgrade Procedure

1. Review the upgrade notes below, especially if you are upgrading more than just a patch release.

2. From the latest [Release](https://github.com/TheStaticMage/firebot-mage-credits-generator/releases), download: `firebot-mage-credits-generator-<version>.js` into your Firebot scripts directory

    (File &gt; Open Data Folder, then select the "scripts" directory)

    :warning: Be sure you download the file from the releases page, not the source code of the GitHub repository!

3. Go in to Settings &gt; Scripts &gt; Manage Startup Scripts and click the **Edit** button next to Mage Credits Generator. Select the correctly versioned script from the dropdown. (If necessary, click on the icon to refresh the directory contents.)

4. Restart Firebot. (The new version of the script will _not_ be loaded until you actually restart Firebot.)

:bulb: You may optionally remove older versions of the script from the scripts directory once you have installed new ones.

## Upgrade Notes

### From 0.0.x -> 0.1

_Oh, ye brave soul, who tried a `0.0.x` version of software!_

Your current setup (now the "old way" of doing this) should continue to work for the foreseeable future. At this time, we have no plans to deprecate the "write file" effects or the `$creditedUserListJSON` variable that you were using before.

However, we have a much better and easier way of distributing and configuring the browser sources starting in version 0.1.0. We have embedded the browser files directly into the script now, so a separate download of the browser sources is no longer needed. We have also greatly simplified the setup of the OBS browser source by eliminating the need to figure out the `file:///` URL, as we now serve the browser files directly from Firebot's built-in web server. If you switch over to this "new way" now, it will be much easier for you to upgrade in the future.

To use the "new way," revisit the updated [Configuration: Roll Credits in Firebot](/doc/installation.md#configuration-roll-credits-in-firebot) section of the installation instructions:

- Set up the new **Credit Generator: Generate Credits** effect as instructed

    :bulb: If you customized any of the previous browser source files that you downloaded (such as `credits.css` or `credits-config.js`), you can select the location of these files while you are configuring this effect. _You only need to select these files if you have actually changed them. If you leave these selections blank, the script will serve up the default content, which has the benefit of auto-updating with future versions._

- Replace the browser source URL with the new URL involving `$effectOutput[creditsUrl]` variable as instructed

- Remove any previous "write files" effect that wrote out the JavaScript code including `$creditedUserListJSON` to a file, because this is no longer needed
