var request = require('request');
var people = require('../storage/people');
var token = require('../token');
var commands = require('../commands');

var credits = {
    client_id: token.clientId,
    client_secret: token.clientSecret,
    code: null
};

var successfullAuthMessage = [
    'You successfully authenticated on github.',
    'Now you have access for these commands:'
];

commands.main.forEach(function (e) {
    successfullAuthMessage.push('/' + e.title + ' - ' + e.description);
});

module.exports = function oauth (options) {
    var userId = options.message.from.id;
    var chatId = options.message.chat.id;

    credits.code = options.code;
    var params = {
        url: 'https://github.com/login/oauth/access_token',
        form: credits
    };

    request.get(params, function (err, res, body) {
        people[userId] = body.split('&')[0].split('=')[1];

        console.log(people[userId]);
        console.log(chatId);

        if (people[userId] !== 'bad_verification_code') {
            options.ctx.sendMessage({
                chat_id: chatId,
                text: successfullAuthMessage.join('\n')
            })
        }
    });
};
