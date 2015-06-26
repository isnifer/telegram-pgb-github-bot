var Bot = require('node-telegram-bot');
var request = require('request');
var Q = require('q');
var token = require('./token');

var bot = new Bot({token: token.bot});

var startMessage = [
    'https://github.com/login/oauth/authorize?client_id=' + token.clientId,
    'redirect_uri=' + token.uri,
    'scope=user,repo'
];

var oauth = {
    client_id: token.clientId,
    client_secret: token.clientSecret,
    code: null
};

var people = {};

function getUrl (url, message) {
    return 'https://api.github.com' + url + '?access_token=' + people[message.from.id];
}

bot.on('message', function (message) {
    var self = this;
    var chat = message.chat.id;
    var messageData;
    var command;

    console.dir(message);

    if (message.text) {

        messageData = message.text.toLowerCase().replace('@githubpgbbot', '').split(' ');
        command = messageData[0].slice(1);

        if (command === 'start') {
            if (!people[message.from.id]) {
                if (messageData[1]) {
                    oauth.code = messageData[1];
                    request.get({
                        url: 'https://github.com/login/oauth/access_token',
                        form: oauth
                    },
                    function (err, res, body) {
                        console.log(body);
                        console.log(message.from.id);
                        people[message.from.id] = body.split('&')[0].split('=')[1];
                    });
                } else {
                    self.sendMessage({
                        chat_id: chat,
                        text: startMessage.join('&')
                    });
                }
            }
        }

        if (command === 'pulls' && people[message.from.id]) {
            var options = {
                url: getUrl('/repos/1pgb/1pgb/pulls', message),
                headers: {
                    'User-Agent': 'Awesome-Octocat-App'
                }
            };
            console.log(options.url);
            request.get(options, function (err, res, body) {
                body = JSON.parse(body);
                var message = body.map(function (pull, i) {
                    var index = i + 1;
                    return index + '. ' + pull.title + '\nАвтор: @' + pull.user.login + '\nАдрес: ' + pull.html_url + '\n';
                });

                self.sendMessage({
                    chat_id: chat,
                    text: message.join('\n')
                });
            });
        }

    }

});

bot.start();
