#!/usr/bin/env node

const slackUserPassAuth = require('./index')

function usage() {
    console.log('Usage: slack-userpass-auth <workspace_name> <email> <password>')
}

if (process.argv.length !== 5) {
    usage()
} else {
    let workspace = process.argv[2];
    let email = process.argv[3];
    let password = process.argv[4];

    slackUserPassAuth(workspace, email, password, function (cookie, token) {
        console.log(JSON.stringify({'cookie':cookie,'token':token}))
    })
}
