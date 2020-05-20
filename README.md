# slack-userpass-auth

This is a hack which enables you to use your Slack username and password to
authenticate against the Slack SDK. **This should not be used in production
applications.** I simply developed this as a quick way to auth against the Slack
API without needing to create dedicated Slack apps (previously you would have
used legacy tokens for this).

I've only done some brief testing of this against the Slack Web API, and the
error handling is a bit light, but overall it works. This is just for testing
functionality of the Slack API, not for running applications with your personal
credentials.

Since this does not use a public API supported by Slack, the functionality of
this module may or may not continue to work in the future.

Does not currently support 2FA. PRs welcome.

## Install

```sh
npm install slack-userpass-auth
# or
yarn add slack-userpass-auth
```

## CLI Usage

If you've installed the package globally, it should be available on your CLI

```sh
# Usage: slack-userpass-auth <workspace_name> <email> <password>
$ unset HISTFILE # Don't persist unencrypted credentials to filesystem
$ slack-userpass-auth example joe@example.com this_isnt_a_real_password
{"cookie":"some_cookie_data_here","token":"auth_token_here"}
$ curl 'https://slack.com/api/chat.postMessage' \
    -H 'content-type: application/json; charset=utf-8' \
    -H "Cookie: some_cookie_data_here" \
    -H "Authorization: Bearer auth_token_here" \
    -d '{"channel":"ABCDEF123", "text":"Hello there"}'
```

## Module Usage

```js
const { WebClient } = require('@slack/web-api');
const slackUserPassAuth = require('slack-userpass-auth');

const WORKSPACE = 'example';
const USERNAME = 'joe@example.com';
const PASSWORD = 'this_isnt_a_real_password';

slackUserPassAuth(WORKSPACE, USERNAME, PASSWORD, function (cookie, authToken) {
    let web = new WebClient(authToken, {'headers': {'Cookie': cookie}});

    const conversationId = 'ABCDEF123';

    (async () => {
        // See: https://api.slack.com/methods/chat.postMessage
        let res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });

        // `res` contains information about the posted message
        console.log('Message sent: ', res.ts);
    })();
});
```
