var Bot = require('node-telegram-bot');
var request = require('request');
// var Q = require('q');
var token = require('./token');
var api = require('./api/github');
var people = require('./storage/people');

var bot = new Bot({token: token.bot});

var startMessage = [
    'https://github.com/login/oauth/authorize?client_id=' + token.clientId,
    'redirect_uri=' + token.uri,
    'scope=user,repo'
];

var endpoints = {
    start: function (options) {
        if (options.code) {
            api.oauth(options)
        } else {
            options.ctx.sendMessage({
                chat_id: options.message.chat.id,
                text: 'At this point you must provide an auth code for request access_token.\nType /auth for me.'
            });
        }
    },
    auth: function (options) {
        options.ctx.sendMessage({
            chat_id: options.message.chat.id,
            text: startMessage.join('&')
        });
    }
};

function notFoundCommand (options) {
    options.ctx.sendMessage({
        chat_id: options.message.chat.id,
        text: 'I don\'t know the /' + options.command + ' command, sorry.'
    });
}

bot.on('message', function (message) {
    var self = this;
    var messageData;
    var command;
    var method;
    var options;

    console.dir(message);

    if (message.text) {

        messageData = message.text.toLowerCase().replace('@githubpgbbot', '').split(' ');
        command = messageData[0].slice(1);

        options = {
            code: messageData[1],
            command: command,
            ctx: self,
            message: message
        };

        if (!people[message.from.id]) {
            method = typeof endpoints[command] === 'function' ? endpoints[command] : notFoundCommand;
        } else {
            method = typeof api[command] === 'function' ? api[command] : notFoundCommand;
        }

        method(options);
    }

});

bot.start();
