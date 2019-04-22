const base = require("./base");
const SassToCss = require("./sassToCss");
const CssToStyles = require("./cssToStyles");
const {ReplaceVariable} = require("./variable");
let options, SassToStyle;


function formatJson(json, options) {
  var reg = null,
    formatted = '',
    pad = 0,
    PADDING = '   '; // one can also use '\t' or a different number of spaces

  // optional settings
  options = options || {};
  // remove newline where '{' or '[' follows ':'
  // options.newlineAfterColonIfBeforeBraceOrBracket = !!options.newlineAfterColonIfBeforeBraceOrBracket;
  options.newlineAfterColonIfBeforeBraceOrBracket = true;
  // use a space after a colon
  // options.spaceAfterColon = !!options.spaceAfterColon;
  options.spaceAfterColon = true;

  // begin formatting...

  // make sure we start with the JSON as a string
  if (typeof json !== 'string') {
    json = JSON.stringify(json);
  }
  // parse and stringify in order to remove extra whitespace
  // json = JSON.stringify(JSON.parse(json));可以除去多余的空格
  json = JSON.parse(json);
  json = JSON.stringify(json);

  // add newline before and after curly braces
  reg = /([\{\}])/g;
  json = json.replace(reg, '\r\n$1\r\n');

  // add newline before and after square brackets
  reg = /([\[\]])/g;
  json = json.replace(reg, '\r\n$1\r\n');

  // add newline after comma
  reg = /(\,)/g;
  json = json.replace(reg, '$1\r\n');

  // remove multiple newlines
  reg = /(\r\n\r\n)/g;
  json = json.replace(reg, '\r\n');

  // remove newlines before commas
  reg = /\r\n\,/g;
  json = json.replace(reg, ',');

  // optional formatting...
  if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
    reg = /\:\r\n\{/g;
    json = json.replace(reg, ':{');
    reg = /\:\r\n\[/g;
    json = json.replace(reg, ':[');
  }
  if (options.spaceAfterColon) {
    reg = /\:/g;
    json = json.replace(reg, ': ');
  }

  json.split('\r\n').forEach((node, index) => {
    var i = 0,
      indent = 0,
      padding = '';

    if (node.match(/\{$/) || node.match(/\[$/)) {
      indent = 1;
    } else if (node.match(/\}/) || node.match(/\]/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else {
      indent = 0;
    }

    for (i = 0; i < pad; i++) {
      padding += PADDING;
    }

    formatted += padding + node + '\r\n';
    pad += indent;
  });

  return formatted;
}



function Transform(path){
  if(!SassToStyle) {
    SassToStyle = require("../index");
    options = SassToStyle.getOptions();
  }

  // Getting sass content
  let sass = base.GetFileContent(path);

  // Transformation variables
  sass = ReplaceVariable(sass);

  // SASS to CSS
  let css = SassToCss(sass);


 // CSS to STYLES
  let {styles, media} = CssToStyles(css);

  // Write in
   path =  path.replace(/\.s?css$/, `${options.postfix}`);
   let template = options.template;

  function getSpace(string, index, last){
    let str = string.substr(0, index),
      start = str.match(/{/g),
      end = str.match(/}/g),
      space = "",
      length = 0;
    if(!start) return options.space;

    length += start.length;
    if(end) length = start.length - end.length;
    while(length > 0){
      space += options.space;
      length--;
    }

    return space;
  }

  template = template.replace(/\n[\s]+?\n/, text => {
    styles = `let styles = {\n${styles}\n};\n`;
    media = `let media = ${JSON.stringify(media)};\n`;

    media = media.replace(/"{[^{]+?}"/g, text =>
      text.replace(/^"/, "")
        .replace(/"$/, "")
        .replace(/\\"/g, "\""));
    media = media.replace(/{/g, (text, index) => {
      let space = getSpace(media, index+1);

      return "{\n"+ space;
    });
    media = media.replace(/},?;?/g, (text, index) => {
      let comma = /,/.test(text),
        end = /;/.test(text),
        space_start = getSpace(media, index+1, true),
        space_end = getSpace(media, index+1);
      if(end) return "\n" + space_start + "};";
      if(comma) return "\n" + space_start + "},\n"+ space_end;
      return "\n" + space_start + "},";
    });
    media = media.replace(/^let media = {\s+};/, "let media = {};");

    let mediaJS = `// 媒体查询
width = parseFloat((width * pixelRatio).toFixed(2));
for(let k in media){
  if(eval(k)){
    for(let j in media[k]){
      styles[j] = Object.assign(styles[j] || {}, media[k][j]);
    }
  }
}`;

    return `\n\n${styles}\n${media}\n\n\n${mediaJS}\n`;
  });

  base.writeFile(path, template);
}


module.exports = Transform;