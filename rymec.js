// Javascript port of RYMEC
// origianl script written by Ryan Wilson
// port by Jon McDuffie
var rymec = function( data ){
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
  // Pass the data back
  return data;
};
exports.rymec = rymec
