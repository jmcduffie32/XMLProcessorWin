#! .\node
var fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    exec = require('child_process').exec,
    splitPages = require('./splitPages').splitPages,
    jsdom = require('jsdom').jsdom,
    mjAPI = require('mathjax-node/lib/mj-page.js');

function getXMLNS(document) {
  var html = document.head.parentNode;
  for (var i = 0, m = html.attributes.length; i < m; i++) {
    var attr = html.attributes[i];
    if (attr.name.substr(0,6) === "xmlns:" &&
        attr.value === "http://www.w3.org/1998/Math/MathML")
    {return attr.name.substr(6)}
  }
  return "mml";
}


var rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});
rl.question('Drag your XML file onto this screen and then hit ENTER: \n', function( filename ) {
  var folder = path.dirname( filename );
  fs.mkdirSync( folder + '/XHTML' );
  //fs.mkdirSync( folder + '/XHTML/imgs' );
  //var copyImages = 'copy ' + folder + '\\*.jpg ' + folder + '\\XHTML\\imgs';
  //var copyCSS = 'copy main.css ' + folder + '\\XHTML';
  //exec( copyImages );
  //exec( copyCSS );

  rl.write("Here we go!\n");

  var inputData = fs.readFileSync( filename, 'utf8' );
  //replace the xml header with an HTML header
  var HTMLHeader = fs.readFileSync( '.header', 'utf8');
  var XMLHeader = fs.readFileSync( '.xmlHeader', 'utf8');

  var unusedTags = [
    /<\/?level\d*?>/g,
    /<\/?frontmatter>/g,
    /<\/?rearmatter>/g,
    /<\/?dtbook>/g,
    /<\/?bodymatter.*?>/g,
    /<\/?imggroup>/g,
    /<p \/>/g,
    /<col.*?\/>/g,
    /<doctitle>.*?<\/doctitle>/g,
    /<docauthor>.*?<\/docauthor>/g,
    /<\/?book.*?>/g,
    /^\s*$/gm
  ];

  var thingsToReplace = [
      [/([^"]) xml:lang="(.){1,15}">/g, '$1>'],
      ['&#x00A0;', ' '],
      ['&#x2009;', ' '],
      ['&#x0022;', '"'],
      ['”', '"'],
      ['“', '"'],
      ["’", "'"],
      ["‘", "'"],
      [/<mml:mtext>(tan|sin|cos|sec|csc|cot)<\/mml:mtext>/g, "<mml:mi>$1</mml:mi>"],
      ["&#x0027;", "&#x2032;"],
      ["<td ><div>", "<th>"],
      ["<\/div><\/td>", "<\/th>"],
      [/<td (colspan|rowspan)="([0-9]+)"><div>/g, "<th $1=\"$2\">"],
      [/<a href="#bookmark\d+">([^<]+)<\/a>/g,"$1"],
      [/<a id="bookmark\d+">([^<])<\/a>/g, "$1"],
      [/<a id="bookmark\d+">(.+)<\/a>/g, "$1"],
      [/<\/em>(\S)/g, "</em> $1"],
      [/<mml:mstyle ([^<]+)>/g, ''],
      ['</mml:mstyle>', ''],
      ['&#x200a;', ' '],
      [/<pagenum.*?>/g, '<div class="navigation"><p class="page">'],
      [/<\/pagenum>/g, '</p></div>'],
      [/src="/g, 'src="imgs/']
    ];
  inputData = inputData.replace(XMLHeader, HTMLHeader);
  unusedTags.forEach(function (thingToReplace){
    inputData = inputData.replace(thingToReplace, '');
  });
  thingsToReplace.forEach(function (thingToReplace){
    inputData = inputData.replace(thingToReplace[0], thingToReplace[1]);
  });

  inputData += "\n</body>\n</html>";

  fs.writeFileSync(filename + '.output.xhtml', inputData);
  var document = jsdom(inputData, {features:{FetchExternalResources: false}});
  var xmlns = getXMLNS(document);

  mjAPI.config({
    MathJax: {
      SVG: {
        font: 'TeX'
      }
    },
    extensions: ''
  });

  mjAPI.start();

  mjAPI.typeset({
    html: document.body.innerHTML,
    renderer: 'SVG',
    inputs: ['MathML'],
    equationNumbers: false,
    singleDollars: false,
    useFontCache: false,
    useGlobalCache: false,
    addPreview: false,
    speakText: true,
    speakRuleset: 'mathspeak',
    speakStyle: 'default',
    ex: 6,
    width: 100,
    linebreaks: true,
    xmlns: xmlns
  }, function (result) {
    document.body.innerHTML = result.html;
    document.head.appendChild(document.body.firstChild);

    var HTML = "<!DOCTYPE html>\n"+document.documentElement.outerHTML.replace(/^(\n|\s)*/,"");
    HTML = HTML.replace(/<desc\s/g, '<text ')
      .replace(/<\/desc>/g, '</text>');
    fs.writeFileSync(folder + '/XHTML/' + path.basename(filename) + 'Final.html', HTML);

    var splitResult = splitPages.split( HTML );

    splitResult.forEach(function( file ){
        var contents = HTMLHeader + file.pageContent + "\n</body>\n</html>";
        fs.writeFileSync( folder + '/XHTML/' + file.filename, contents );
    });



    rl.write( 'Conversion Complete!\n' );
    process.exit();
  });
});

