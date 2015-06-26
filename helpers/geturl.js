var people = require('../storage/people');

module.exports = function getUrl (url, message) {
    return 'https://api.github.com' + url + '?access_token=' + people[message.from.id];
};
