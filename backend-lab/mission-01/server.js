const http = require("http");

const server = http.createServer((request, response) => {
    console.log(request.method);
    console.log(request.url);

    if (request.url === "/" && request.method == "GET") {
        response.end("Welcome");
        return;
    }

    if (request.url === "/about" && request.method == "GET") {
        response.end("About");
        return;
    }

    if (request.url === "/dreams" && request.method == "GET") {
        response.end("List of Dreams");
        return;
    }

    response.statusCode = 404;
    response.end("Page Not Found");
});

server.listen(3002);