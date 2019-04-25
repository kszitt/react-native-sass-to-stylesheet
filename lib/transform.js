const base = require("./base");
const SassToCss = require("./sassToCss");
const CssToStyles = require("./cssToStyles");
const {ReplaceVariable} = require("./variable");
let options, SassToStyle;



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
    let mediaJS = "",
      getAdaptation = "",
      str = "";
    styles = `let styles = {\n${styles}\n};\n`;

    if(!/getAdaptation/.test(template) && options.adaptation){
      getAdaptation = `function getAdaptation(num){
${options.space}return parseFloat((num / pixelRatio).toFixed(2));
}`;
    }


    if(!/^{\s*?}$/s.test(JSON.stringify(media))){
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
          space_start = getSpace(media, index+1),
          space_end = getSpace(media, index+1);
        if(end) return "\n" + space_start + "};";
        if(comma) return "\n" + space_start + "},\n"+ space_end;
        return "\n" + space_start + "},";
      });
      media = media.replace(/{[^{]+?}/g,
        (text, index) => text.replace(/,/g, () => ",\n" + getSpace(media, index+1)));
      media = media.replace(/^let media = {\s+};/, "let media = {};");

      mediaJS = `// 媒体查询
width = parseFloat((width * pixelRatio).toFixed(2));
for(let k in media){
  if(eval(k)){
    for(let j in media[k]){
      styles[j] = Object.assign(styles[j] || {}, media[k][j]);
    }
  }
}`;
    } else {
      media = "";
    }

    if(getAdaptation) str += `\n\n${getAdaptation}`;
    str += `\n\n${styles}\n\n`;
    if(media) str += `${media}\n\n`;
    if(mediaJS) str += `${mediaJS}\n\n`;

    return str;
  });

  base.writeFile(path, template);
}


module.exports = Transform;