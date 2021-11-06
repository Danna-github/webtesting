module.exports = {
    html: function(title, list, body, control) {
      return `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <img src="danna.jpg" alt="My Image">
        ${list}
        ${control}
        ${body}
      </body>
      </html>
      `
    },
    list: function(filelist) {
      /*
      var list = `
        <ul>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ul>`;
      */
      var list = '<ul>';
      var i = 0;
      while(i < filelist.length){
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i++;
      }
      list = list + '</ul>';
      return list;
    }
}