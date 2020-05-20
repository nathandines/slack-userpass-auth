const request = require('request');
const cheerio = require('cheerio');
const qs = require('querystring');

function parseBreadcrumb(dom) {
    const $ = cheerio.load(dom);
    return JSON.parse($('div #props_node')[0]['attribs']['data-props'])['crumbValue'];
}

function jsObjectKeyValueExtract(key, dom) {
    // I don't like doing this, but couldn't think of a nicer way to parse
    // JS key values from the DOM
    let rx = '"' + key + '":"([^"]+?)"';
    let rxArray = dom.match(rx);
    return rxArray[1];
}

function getSessionCredentials(slackWorkspaceName, slackEmail, slackPassword, callback) {
    let j = request.jar()
    let r = request.defaults({ jar: j })

    let slackWorkspaceUrl = 'https://' + slackWorkspaceName + '.slack.com';

    r.get(slackWorkspaceUrl, function (error, response, body) {
        let crumb = parseBreadcrumb(body);

        let loginForm = {
            'signin': 1,
            'has_remember': true,
            'remember': 'off',
            'crumb': crumb,
            'email': slackEmail,
            'password': slackPassword
        }
        r.post({
            'uri': slackWorkspaceUrl,
            'form': loginForm,
            'followAllRedirects': true
        }, function (error, response, body) {
            let teamID = jsObjectKeyValueExtract("team_id", body);

            let authQuery = {
                'app': 'client', 'lc': null,
                'return_to': 'client/' + teamID, 'teams': '', 'iframe': 1
            }

            r.get('https://app.slack.com/auth?' + qs.stringify(authQuery), function (error, response, body) {
                let token = jsObjectKeyValueExtract("token", body);
                let cookie = j.getCookieString(slackWorkspaceUrl);

                callback(cookie, token);
            });
        })
    });
}

module.exports = getSessionCredentials;
