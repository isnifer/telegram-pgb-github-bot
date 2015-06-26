var request = require('request');
var people = require('../storage/people');
var getUrl = require('../helpers/getUrl');

module.exports = function pulls (options) {
    var chatId = options.message.chat.id;
    var params = {
        url: getUrl('/repos/1pgb/1pgb/pulls', options.message),
        headers: {
            'User-Agent': 'Awesome-Octocat-App'
        }
    };

    request.get(params, function (err, res, body) {
        body = JSON.parse(body);

        var output = body.map(function (pull, i) {
            var index = i + 1;
            return index + '. ' + pull.title + '\nАвтор: @' + pull.user.login + '\nАдрес: ' + pull.html_url + '\n';
        });

        options.ctx.sendMessage({
            chat_id: chatId,
            text: output.join('\n')
        });
    });
};
