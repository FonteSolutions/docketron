const http = require('http');

module.exports = {
    startService: function () {
        http.createServer((req, res) => {
            res.end('Opaa12111');
        }).listen(3000);
    }
};
