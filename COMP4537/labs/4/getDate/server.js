let http = require('http');

let dt = require('../../../modules/utils');
let url = require('url');
http.createServer(function (req, res) {
    let q = url.parse(req.url, true);
    console.log(q.query);
    res.writeHead(200, {"Content-Type": "text/html"}); 
    res.write("Hello " + q.query['name'] + ", Here is the server's current date and time: " +  dt.getDate());
    res.end();
}).listen(8888);