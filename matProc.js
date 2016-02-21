#! .\node

var fs = require('fs'),
    readline = require('readline');

var rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout
});

rl.question('So where\'s that folder we\'re converting?', function( folder ) {
  fs.readdir( folder, function( err, files ) {
    console.log( files );
    files.forEach(function ( filename ) {
      if ( filename.search( /\.html/ ) !== -1 ) {
        fs.readFile( folder + "/" + filename, 'utf8', function ( err, data ) {
          var matrixMatch = /left brack(\W|\w)*?<mml:mo>\]<\/mml:mo>/gi;
          var found = data.match( matrixMatch );
          var rowMatch = /<mml:mtr columnalign=\"(?:right|left)\">/gi;
          var colMatch = /<mml:mtd columnalign=\"(?:right|left)\">/gi;

          if ( found ) {
            found.forEach(function( matrix ) {
              var stringToReplace = matrix.match( /left brack.*?right brack/gi )[0];
              var splitString = stringToReplace.replace( /\s{2,}/g,' ' );
              var splitStringArray = splitString.match( /\b\d(\.|\d)+\b|(Minus )?StartFraction.*?EndFraction|left brack|right brack|Minus\s\d+|Minus[^\d]*?EndFraction|\b\w\b/g );
              try {
                var numRows = matrix.match(rowMatch).length;
                var numCols = matrix.match(colMatch).length / numRows;
              } catch (error) {
                try {
                  var numRows = matrix.match( /<mml:mtr>/g ).length;
                  var numCols = matrix.match( /<mml:mtd>/g ).length / numRows;
                } catch ( error ) {
                  console.log( error );
                }
              }

              var numElements = splitStringArray.length
              for ( var i = 1, j = 0; i < numElements && j < numRows; i += numCols + 1 ) {
                j += 1
                numElements += 1
                splitStringArray.splice( i, 0, 'Row' );
              }

              var replacementString = 'Matrix ' + numRows + ' By ' + numCols + ' ' + splitStringArray.join(' ');
              data = data.replace( stringToReplace, replacementString );
            });

            fs.writeFile( folder + '/' + filename, data, function( err ) {
              if ( err ) {
                throw err;
                process.exit();
              }

              rl.write( 'Done\n' );
            });
          }
        });
      }
    });
  });
});
