var splitPages = function () {
  var pageRegex = /[\s\S]*?<endPage>/gm;

  var split = function ( fileData ) {
    fileData = fileData.replace(/<\/body>/, '<endPage></body>')
    var filesDataArray = fileData.replace(/<div class="navigation"/g, '<endPage><div class="navigation"').match( pageRegex );
    var outPutFiles = filesDataArray.map(function ( data, index ) {
      pageNumRegex = /<div class="navigation"><p class="page">Page (\d+)<\/p><\/div>/;

      var result = pageNumRegex.exec( data );
      var filename = "";
      if ( result ) {
        filename = "Page_" + result[1] + ".html";
      } else {
        filename = "Start_Here.html";
      }
      return {
        pageContent: data.replace("<endPage>", ""),
        filename: filename
      };
    });
    return outPutFiles;
  };

  return {
    split: split
  };

}();

exports.splitPages = splitPages;
