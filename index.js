const http = require("http");
const https = require("https");
const fs = require("fs");
const url = require("url");
const qs = require("querystring");
const path = require("path");
const mysql = require("mysql");
const dateUtils = require("./COMP4537/labs/4/getDate/modules/utils");
const envjs = require("./env");

/**
 * FINAL CONSTANT VARIABLES
 */
const httpPort = 80;
const httpsPort = process.env.PORT || 443;

/**
 * Database Connection.
 */
const dbconnection = mysql.createConnection({
    host: "sql3.freemysqlhosting.net",
    user: "sql3400153",
    password: "1pCKQbqnDF",
    database: "sql3400153",
    port: 3306,
});

dbconnection.connect((error) => {
    if (error) {
        console.log(error.message);
    } else {
        console.log("Connected to database");
    }
});

/**
 * Handles urls.
 * @param {Response} req
 * @param {Request} res
 */
function router(req, res) {
    /**
     * Holds the parsed query.
     */
    const q = url.parse(req.url, true);

    let body = "";
    req.on("data", (data) => {
        body += data.toString();
    });

    req.on("end", () => {
        let parsedQuery = qs.parse(body);

        switch (q.path.split("?")[0]) {
            case "/":
                fs.readFile(
                    path.join(__dirname, "/index.html"),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537":
                fs.readFile(
                    path.join(__dirname, "/COMP4537/COMP4537.html"),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537/labs/1/quizQuestions":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/labs/1/quizQuestions/index.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537/labs/2/dynamicQuiz":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/labs/2/dynamicQuiz/index.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537/labs/2/dynamicQuiz/admin":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/labs/2/dynamicQuiz/admin.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537/labs/2/dynamicQuiz/user":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/labs/2/dynamicQuiz/user.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537/labs/4/getDate/":
                res.end(
                    `Hello ${
                        q.query.name
                        }, Here is the server's current date and time: ${dateUtils.getDate()}`
                );
                break;
            case "/COMP4537/labs/4/writeFile/":
                fs.appendFile(
                    path.join(__dirname, "/COMP4537/labs/4/readFile/file.txt"),
                    `\n${q.query["text"]}\n`,
                    (err) => {
                        if (err) {
                            res.writeHead(404);
                            return res.end(err.message);
                        }

                        res.writeHead(200);
                        return res.end(`'${q.query["text"]}' written to file`);
                    }
                );

                break;
            case "/COMP4537/labs/5/readDB":
                dbconnection.query(
                    "SELECT * from lab5",
                    (err, result, fields) => {
                        if (err)
                            return res.end("Error: fetching data from databse");

                        let parsedResult = "";

                        for (let i = 0; i < result.length; i++) {
                            let rowDataPacket = result[i];
                            parsedResult += `\nid: ${rowDataPacket.id}, name: ${rowDataPacket.name}, score: ${rowDataPacket.score}\n`;
                        }
                        return res.end(parsedResult);
                    }
                );

                break;
            case "/COMP4537/labs/5/writeDB/write":
                let sql = `INSERT INTO lab5 (name, score) VALUES (\'${parsedQuery.name}\', ${parsedQuery.score})`;

                dbconnection.query(sql, (err, result) => {
                    if (err) {
                        console.log(err.message);
                        return res.end(
                            `Unable to store ${parsedQuery.name}:${parsedQuery.score} in the database`
                        );
                    }

                    res.end(
                        `${parsedQuery.name}:${parsedQuery.score} was stored in the database`
                    );
                });

                break;
            case "/COMP4537/labs/5/writeDB/create":
                http.request(
                    {
                        port: httpPort,
                        path: "/COMP4537/labs/5/writeDB/write",
                        method: "POST",
                    },
                    (databaseResponse) => {
                        let responseData = "";
                        databaseResponse.on("data", (data) => {
                            responseData += data.toString();
                        });

                        databaseResponse.on("error", (error) => {
                            res.end(error.message);
                        });

                        databaseResponse.on("end", () => {
                            res.writeHead(200, {
                                "Content-Type": "text/plain",
                                "Access-Control-Allow-Origin": "*",
                            });
                            res.end(responseData);
                        });
                    }
                ).end(body);

                break;
            case "/COMP4537/assignments/quizindb":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/assignments/quizindb/index.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;
            case "/COMP4537/assignments/quizindb/admin":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/assignments/quizindb/admin.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;

            case "/COMP4537/assignments/quizindb/questions":
                switch (req.method) {
                    case "GET":
                        dbconnection.query(
                            "SELECT * from questions",
                            (err, result, fields) => {
                                if (err)
                                    return res.end(
                                        "Error: fetching data from databse"
                                    );

                                let questions = result.map((rowDataPacket) => ({
                                    ID: rowDataPacket.ID,
                                    QUIZ_ID: rowDataPacket.QUIZ_ID,
                                    TEXT: rowDataPacket.TEXT,
                                    ANSWERS: [],
                                }));

                                stringifiedResult = JSON.stringify(questions);

                                return res.end(stringifiedResult);
                            }
                        );

                        break;
                    case "POST":
                        dbconnection.query(
                            `
                            INSERT INTO questions(TEXT)
                            VALUES ("")
                            `,
                            (err, result, fields) => {
                                if (err)
                                    return res.end(
                                        "Error: fetching data from databse"
                                    );
                                return res.end("Question Created Successfully");
                            }
                        );
                        break;
                    case "PUT":
                        for (let answer of JSON.parse(body).ANSWERS) {
                            dbconnection.query(
                                `
                                UPDATE answers
                                SET TEXT = '${answer.TEXT}', CORRECT=${answer.CORRECT}
                                WHERE ID = ${answer.ID}
                                `,
                                (err, result, fields) => {
                                    if (err) console.log(err);
                                    console.log(result);
                                }
                            );
                        }
                        dbconnection.query(
                            `
                            UPDATE questions
                            SET TEXT = '${JSON.parse(body).TEXT}'
                            WHERE ID = ${JSON.parse(body).ID}
                            `,
                            (err, result, fields) => {
                                if (err) console.log(err);
                                return res.end("SUCCESSFULLY DELETED QUESTION");
                            }
                        );
                        break;
                    case "DELETE":
                        for (let answer of JSON.parse(body).ANSWERS) {
                            dbconnection.query(
                                `
                                DELETE FROM answers WHERE ID = ${answer.ID}
                                `,
                                (err, result, fields) => {
                                    if (err) console.log(err);
                                    console.log(result);
                                }
                            );
                        }
                        dbconnection.query(
                            `
                            DELETE FROM questions WHERE ID = ${
                                JSON.parse(body).ID
                                }
                            `,
                            (err, result, fields) => {
                                if (err) console.log(err);
                                return res.end("SUCCESSFULLY DELETED QUESTION");
                            }
                        );
                        break;
                }
                break;
            case "/COMP4537/assignments/quizindb/answers":
                switch (req.method) {
                    case "GET":
                        dbconnection.query(
                            "SELECT * from answers",
                            (err, result, fields) => {
                                if (err)
                                    return res.end(
                                        "Error: fetching data from databse"
                                    );

                                let answers = result.map((rowDataPacket) => ({
                                    ID: rowDataPacket.ID,
                                    QUESTION_ID: rowDataPacket.QUESTION_ID,
                                    TEXT: rowDataPacket.TEXT,
                                    CORRECT: rowDataPacket.CORRECT,
                                }));

                                stringifiedResult = JSON.stringify(answers);

                                return res.end(stringifiedResult);
                            }
                        );

                        break;
                    case "POST":
                        dbconnection.query(
                            `INSERT INTO answers(QUESTION_ID, CORRECT) VALUES(${
                                JSON.parse(body).ID
                                }, 0)`,
                            (err, result, fields) => {
                                if (err)
                                    return res.end(
                                        "Error: fetching data from databse"
                                    );
                                return res.end("SUCCESSFULLY ADDED ANSWER");
                            }
                        );
                        break;
                    case "DELETE":
                        dbconnection.query(
                            `DELETE FROM answers WHERE ID = ${
                                JSON.parse(body).ID
                                }`,
                            (err, result, fields) => {
                                if (err)
                                    return res.end(
                                        "Error: fetching data from databse"
                                    );
                                return res.end("SUCCESSFULLY DELETED ANSWER");
                            }
                        );
                        break;
                }
                break;
            case "/COMP4537/assignments/quizindb/student":
                fs.readFile(
                    path.join(
                        __dirname,
                        "/COMP4537/assignments/quizindb/student.html"
                    ),
                    (err, html) => {
                        if (err) throw err;
                        res.writeHead(200, {
                            "Content-Type": "text/html",
                            "Content-Length": html.length,
                        });
                        res.write(html);
                        res.end();
                    }
                );
                break;

            /**
             * Serve Static Files
             */
            default:
                fs.readFile(path.join(__dirname, q.path), (err, data) => {
                    if (err) {
                        res.writeHead(404);
                        console.log(err.message);
                        return res.end(`Error 404: ${q.pathname} Not Found`);
                    }
                    return res.end(data);
                });
        }
    });
}

/**
 * HTTP Server, redirects to https server.
 */
http.createServer((req, res) => {
    if (envjs.NODE_ENV == "production") {
        res.writeHead(302, {
            Location: "https://" + req.headers.host + req.url,
        });
        return res.end();
    }

    router(req, res);
}).listen(httpPort, () => {
    console.log(`Server listening at http://localhost:${httpPort}`);
});

/**
 * HTTPS server
 */
if (envjs.NODE_ENV == "production") {
    try {
        https
            .createServer(
                {
                    key: fs.readFileSync(
                        "/etc/letsencrypt/live/ktruong.net/privkey.pem",
                        "utf-8"
                    ),
                    cert: fs.readFileSync(
                        "/etc/letsencrypt/live/ktruong.net/fullchain.pem",
                        "utf-8"
                    ),
                },
                (req, res) => {
                    router(req, res);
                }
            )
            .listen(httpsPort, () => {
                console.log(
                    `Server listening at https://localhost:${httpsPort}`
                );
            });
    } catch (err) {
        console.log(err.message);
    }
}
