'use strict';

const http = require('http');
const URL  = require('url');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

function nowTime() {
  return new Date().toISOString().substr(11)
}

function createServer(serverName, dir) {
  return http.createServer(function(req, res){
    const request = URL.parse(req.url, true);

    console.log(serverName, nowTime(), req.method, request.href);

    let contentPath;
    if (request.pathname.startsWith('/lib/')) {
      contentPath = path.resolve(__dirname, request.pathname.replace(/^\/lib/, '../src'));
    } else {
      contentPath = path.join(dir, request.pathname);
    }

    if (contentPath.endsWith('/')) {
      contentPath += 'index.html';
    }

    if (req.method === 'GET') {
      fs.readFile(contentPath, (err, data) => {
        if (err) {
          if (contentPath.endsWith('.ico')) {
            res.writeHead(404, {
              'Content-Length': 0
            });
            res.end();
            return;
          }

          const rootPath = path.join(dir, 'index.html');
          fs.readFile(rootPath, (err, data) => {
            if (err) {
              res.writeHead(404, { 'Content-Length': 0 })
            } else {
              res.writeHead(200, {
                'Content-Length': data.length,
                'Content-Type': 'text/html;charset=utf-8'
              });
              res.write(data);
            }
            res.end();
          });
        } else {
          let cttType = 'text/html;charset=utf-8';
          if (contentPath.endsWith('.css')) cttType = 'text/stylesheet';
          if (contentPath.endsWith('.js')) cttType = 'text/javascript';
          res.writeHead(200, {
            'Content-Length': data.length,
            'Content-Type': cttType
          });
          res.write(data);
          res.end();
        }
      });
    } else {
      res.writeHead(405, { 'Content-Length': 0 });
      res.end();
    }
  });
}

const hashTestServer = createServer('hash\t', path.join(__dirname, 'hash'));
const historyTestServer = createServer('history\t', path.join(__dirname, 'history'));
hashTestServer.listen(3000);
historyTestServer.listen(8080);
console.log("Start hashTestServer:3000, historyTestServer:8080");
