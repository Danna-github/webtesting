var http = require('http');
var fs = require('fs');
var url = require('url'); //'url' 모듈을 사용하겠다.
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

//refactoring: code 효율성 개선
var app = http.createServer(function(request,response){
    var _url = request.url; //퀴리문
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname; //"localhost:3000/pathname"
    
    //console.log(queryData.id); //객체
    //console.log(url.parse(_url, true));
    if(pathname === '/') { //home이나 page로 갔을 경우 모두 해당
      //console.log(__dirname + url);
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          /*
          var list = templateList(filelist);
          var template = templateHTML(title, list, `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(template);
          */
          var list = template.list(filelist);
          var html = template.html(title, list, `<h2>${title}</h2>${description}`,
          `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescripttion = sanitizeHtml(description, { allowedTags:['h1']});
            var list = template.list(filelist);
            var html = template.html(title, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescripttion}`,
            `<a href="/create">create</a>
            <a href="update?id=${sanitizedTitle}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`);
            response.writeHead(200);
            response.end(html); //사용자에게 전송하는 data가 변경된다
          });
        });
      }
    } else if(pathname === '/create') {
      fs.readdir('./data', function(error, filelist){
        var title = 'Web - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
          <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
              <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
              <input type="submit">
          </p>
          </form>
        `, '');
        response.writeHead(200);
        response.end(html);
      });
    } else if (pathname === '/create_process') {
      var body = '';
      request.on('data', function(data){ //POST: 데이터 전송량이 많을 경우 대비 --> 조각조각 합치기
         body = body + data; //callback이 실행될 때마다 data 추가
      });
      request.on('end', function(){ //정보 수신이 끝났을 경우
        var post = qs.parse(body); //post data에 대한 정보가 저장됨.
        console.log(post);
        var title = post.title;
        var description = post.description;
        //파일 저장
        fs.writeFile(`data/${title}`, description, 'utf8',
        function(err){
          response.writeHead(302, {Location: `/?id=${title}`}); //리다이렉션 Location: 헤더정보
          response.end();
        })
      });
    } else if (pathname === '/update') {
      fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.html(title, list, `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
              <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
              <input type="submit">
          </p>
          </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (pathname === '/update_process') {
      var body = '';
      request.on('data', function(data){
         body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`, `data/${title}`, function(err){
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
        });
      });
    } else if (pathname === '/delete_process') {
      var body = '';
      request.on('data', function(data){
         body = body + data;
      });
      request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(err){
          response.writeHead(302, {Location: `/`});
          response.end();
        });
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000); //port: 3000