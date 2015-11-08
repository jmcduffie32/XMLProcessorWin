#! .\node

var fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    exec = require('child_process').exec,
    splitPages = require('./splitPages').splitPages;

var rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

rl.question('Drag your XML file onto this screen and then hit ENTER: \n', function( filename ) {
  var folder = path.dirname( filename );
  fs.mkdirSync( folder + '/XHTML' );
  fs.mkdirSync( folder + '/XHTML/imgs' );
  var copyImages = 'copy ' + folder + '\\*.jpg ' + folder + '\\XHTML\\imgs';
  var copyCSS = 'copy main.css ' + folder + '\\XHTML';
  exec( copyImages );
  exec( copyCSS );

  rl.write("Here we go!\n");
  var commentArray = [
    "Don't worry this might take a while...\n",
    "Declassifying Matrices...\n",
    "Wait for it...\n",
    "What if I told you I'd be done in 30 seconds... I won't be... probably\n",
    "We have the technology; We can rebuild it...\n",
    "Progress bars are for chumps...\n",
    "Math magic is happeing right now...\n",
    "If you could see what I'm doing you'd be really impressed...\n",
    "Was that a snail...\n",
    "Still working here...\n",
    "Pick a random number between 1 and 10... Nope that's not it...\n",
    "Wamboozling the fiddle-faddle... technical terms of course...\n",
    "Enjoy the elevator muzak... wait... you don't hear that...\n",
    "Programming the flux capacitor...\n",
    "Approaching 88 miles per hour...\n",
    "Satellites moving into position...\n",
    "Commencing rocket launch... or did you want to skip that bit...\n",
    "Warming up the particle collider... prepare for super powers...\n",
    "I was actually done 3 minutes ago... it's more fun to wait though...\n",
    "You know I can only push the goblins so hard before they strike...\n",
    "So... many... hamsters...\n",
    "You are likely to be eaten by a grue...\n",
    "Brain the size of a planet and all you want me to do is recite a funny loading message...\n",
    "Those responsible for previous faulty messages have been sacked...\n",
    "Counting backwards from infinity...\n",
    "Don't panic... you remembered your towel right...\n",
    "Simulating the future...\n",
    "Life lesson 347: Don't taunt the octopus...\n",
    "Skynet just acheived self awareness... congratulations...\n"

  ];

  setInterval(function(){
    var comment = commentArray[ Math.floor( Math.random() * commentArray.length ) ];
    rl.write( comment );
  }, 5000 );

  fs.readFile( filename, 'utf8', function ( err, data ) {


    var replaceHeader = function ( data ) {
      fs.readFile( '.header', 'utf8', function( err, htmlHeader ) {
        fs.readFile( '.xmlHeader', 'utf8', function( err, xmlHeader ) {
          data = data.replace( xmlHeader, htmlHeader );

          return removeUnusedTags( data );
        });
      });
    };

    var removeUnusedTags = function ( data ) {
      // Delete each of these from the file
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

      unusedTags.forEach(function(tag) {
        data = data.replace(tag, '');
      });

      // Implementation of RYMEC
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
        ['&#x200a;', ' ']
      ];
      // Replace each thing in the current file
      thingsToReplace.forEach(function ( thingToReplace ) {
        data = data.replace( thingToReplace[0], thingToReplace[1] );
      });

      return replacePagenums( data );
    };

    var replacePagenums = function ( data ) {
      data = data.replace(/<pagenum.*?>/g,'<div class="navigation"><p class="page">');
      data = data.replace(/<\/pagenum>/g, '</p></div>');
      data = data.replace(/src="/g, 'src="imgs/');

      fs.writeFile(filename + '.output.xhtml', data, function() {
        fs.appendFile(filename + '.output.xhtml', "\n</body>\n</html>", function () {
          exec( 'node page2png < ' + filename + '.output.xhtml > '+ folder + '/XHTML/' + path.basename(filename) + 'Final.html', function( error, stdout, stderror) {
            fs.readFile( folder + '/XHTML/' + path.basename(filename) + 'Final.html', 'utf8', function( error, data){
              var splitResult = splitPages.split( data );
              fs.readFile('.header', 'utf8', function ( err, HTMLheader ) {
                splitResult.forEach(function ( file ) {
                  fs.writeFileSync( folder + '/XHTML/' + file.filename, HTMLheader + file.pageContent );
                  fs.appendFileSync( folder + '/XHTML/' + file.filename, "\n</body>\n</html>" );
                });
                rl.write( 'Conversion Complete!' );
                process.exit();
              });
            });
          });
        });
      });
    };
    data = replaceHeader( data );
  });
});
