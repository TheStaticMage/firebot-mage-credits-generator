# Custom Credits

## Introduction

The credits script has a number of pre-defined categories for common events such as follows, subscriptions, and cheers. These are recorded by the **Credit Generator: Register event** and **Credit Generator: Register event manually** effects. This covers the most common use cases for this script.

For maximum flexibility, the script allows you to record custom credit types as well. Perhaps you want to record users who answer a trivia question correctly, redeem a particular reward, or unlock a bits badge. Rather than forcing you to assign these occurrences to one of the existing credit types, you can use custom credits.

## Setup

Credits are recorded to custom credit types via the **Credit Generator: Register custom credit** effect. However, this effect is hidden by default and must be explitly enabled.

To enable this effect:

1. Go to Settings &gt; Scripts &gt; Manage Startup Scripts &gt; Mage Credits Generator &gt; Edit.

2. Check the box for &quot;Enable Custom Credit Types&quot; and click Save.

3. Restart Firebot.

## Usage

### Registering a custom credit type

![Register Custom Credit Effect](/doc/img/register-custom-credit-effect.png)

- **Credit Type**: You can name this whatever you want (with just a few exceptions).

  - The credit type you enter here will be used as the key in the JSON object that is parsed when you roll the credits. (This will not be directly shown to your users.)

  - If you have multiple calls to the **Register custom credit** effect that use the same credit type, these updates will be cumulative by user, and any amounts will be added. (This is useful if you have multiple events, preset effect lists, etc. that you want to update the same credit type.)

  - You cannot name your credit type the same as any of the built-in credit types. (If you want to credit one of the built-in credit types, you can use **Credit Generator: Register event** or **Credit Generator: Register event manually**.)

  - You cannot end the name of your credit type with 'ByAmount' because this has special meaning elsewhere in the program.

- **Username**: The username of the user to credit. This is often `$username` (but not always).

- **Amount**: This is a numeric amount to associate with the credit. For example, you may be tracking money donated per user, and in that case you could use a variable here to represent the donation amount. Some credit types don't really need an amount, like follows or individual subscriptions -- for these you can just hard-code a value such as `0` or `1`.

:bulb: You don't need to do anything to initialize the credit type anywhere else. The first time this effect is called for the custom credit type, it will be automatically initialized.

### Displaying custom credit types in the credits roll

In most cases, all that you will need to do is edit the `sectionsConfig` variable in your [`credits-config.js`](/browser-source-files/credits-config-template.js) file. Add another entry to the definition as follows:

- `header`: The human-readable title for the credit type that you want displayed on-screen.
- `key`: Must match the credit type name.

The following entry might represent the credit type shown in the screenshot above:

```json
{
    "header": "Super-Awesome Custom Viewers",
    "key": "custom_1"
}
```

:bulb: Remember, the users within each credit type are sorted by username by default. You can add `ByAmount` to the end of the key to have them sorted by amount instead.

### Accessing data for the custom credit type

To access data stored in custom credit types, use the same variables as for the built-in types.

Returning a list of users, sorted alphabetically, who had a `custom_1` credit:

```text
$creditedUserList[custom_1]
// => ["TheStaticBrock", "TheStaticMage"]
```

Returning a list of users, sorted by amount, who had a `custom_1` credit:

```text
$creditedUserList[custom_1ByAmount]
// => ["TheStaticMage", "TheStaticBrock"]
```

Returning a JSON object for users, sorted by username, who had a `custom_1` credit:

```text
$creditedUserListJSON[custom_1]
// => {
    "custom_1": [
        {
            "username": "thestaticmage",
            "displayName": "TheStaticMage",
            "profilePicUrl": "...",
            "amount": 69
        }
    ]
}
```

If you use `$creditedUserListJSON` with no argument, `custom_1` and `custom_1ByAmount` keys will contain sorted arrays sorted by username and amount, respectively. Keys will be included for any custom credit types that were triggered.
