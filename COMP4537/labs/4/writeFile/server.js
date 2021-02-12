let http = require('http');
let url = require('url');
let fs = require('fs');

http.createServer(function (req, res) {
    let q = url.parse(req.url, true);
    let filename = '.' + q.pathname + 'COMP4537/labs/4/readFile/file.txt';
    let data = q.query['text'] + '\n';
    console.log(filename);
    fs.appendFile(filename, data, function(err) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end(q.pathname + " 404 Not Found!");
        }
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(data);
        return res.end();
    });
}).listen(8888);
console.log("Server is listening");