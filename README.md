# Firebot "Mage Credits Generator" Script

## Introduction

This is a script that helps with an "end credits" display for [Firebot](https://firebot.app/) (the all-in-one bot for Twitch streamers).

https://github.com/user-attachments/assets/8d1f81dd-fc10-41df-9eaf-f689dd18313a

Features:

- Tracks numerous events including:
  - New followers
  - Subs and re-subs
  - Gifted subs
  - Bits and cheering

- Handles credits that date back to before the current stream:
  - Existing followers
  - Existing subscribers
  - Existing gifters

- Customizable:
  - Basic usage should work with minimal changes
  - Most display settings are changeable via CSS file
  - Uses a JSON data structure for maximum customization possibility
  - Custom events can be tracked

Feel free to stop by my Twitch stream (<https://www.twitch.tv/thestaticmage>) where you will see me roll the credits at the end of every stream.

## Documentation

- [Installation and Configuration](/doc/installation.md) (**Start Here**)
  - [Initial Installation](/doc/installation.md#initial-installation)
  - [Configuration: OBS](/doc/installation.md#configuration-obs)
  - [Configuration: Roll Credits in Firebot](/doc/installation.md#configuration-roll-credits-in-firebot)
  - [Configuration: Register Credits in Firebot](/doc/installation.md#configuration-register-credits-in-firebot)
  - [Configuration: Hide Credits in Firebot (Optional)](/doc/installation.md#configuration-hide-credits-in-firebot-optional)
- [Upgrading](/doc/upgrading.md)
- [Custom credit types](/doc/custom-credits.md)
- [Display customization](/doc/display-customization.md)

## Support

The best way to get help is in my Discord server. Join the [The Static Discord](https://discord.gg/WdJaz8439X) and then visit the `#firebot-mage-credits-generator` channel there.

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
