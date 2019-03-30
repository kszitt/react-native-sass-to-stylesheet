let options = {};


// Processing sass text
function CssToStyles(css){
  if(!options.space){
    options = require("../index").getOptions();
  }

  // margin, padding
  css = css.replace(/ *(margin|padding)\s*:.+?;/g, text => {
    let margin = text.match(/(margin|padding)/)[0],
      s = text.match(/^ */),
      array = text.match(/\d+[a-z]*/g);
    s = s ? s[0] : "";


    switch(array.length){
      case 1:
        return `${s}${margin}: ${parseInt(array[0])};`;
      case 2:
        return  `${s}${margin}-top: ${parseInt(array[0])};\n` +
          `${s}${margin}-bottom: ${parseInt(array[0])};\n` +
          `${s}${margin}-right: ${parseInt(array[1])};\n` +
          `${s}${margin}-left: ${parseInt(array[1])};`;
      case 3:
        return  `${s}${margin}-top: ${parseInt(array[0])};\n` +
          `${s}${margin}-right: ${parseInt(array[1])};\n` +
          `${s}${margin}-bottom: ${parseInt(array[2])};\n` +
          `${s}${margin}-left: ${parseInt(array[1])};`;
      case 4:
        return  `${s}${margin}-top: ${parseInt(array[0])};\n` +
          `${s}${margin}-right: ${parseInt(array[1])};\n` +
          `${s}${margin}-bottom: ${parseInt(array[2])};\n` +
          `${s}${margin}-left: ${parseInt(array[3])};`;
    }
  });

  // background
  css = css.replace(/ *background *:.+?;/g, text => text.replace(/background/, "background-color"));

  // border
  css = css.replace(/ *border(-left|-right|-top|-bottom)? *:.+?;/g, text => {
    let border = text.match(/border[-A-z]*/)[0],
      s = text.match(/^ */),
      array = text.match(/:\s*[^;]+/);
    s = s ? s[0] : "";

    array = array[0].replace(/^:\s*/, "").match(/[\S]+/g);

    return  `${s}${border}-width: ${parseInt(array[0])};\n` +
      `${s}border-style: ${array[1]};\n` +
      `${s}${border}-color: ${array[2]};`;
  });

  // text-decoration
  css = css.replace(/ *text-decoration *:.+?;/g, text => {
    let s = text.match(/^ */),
      array = text.match(/:\s*[^;]+/);
    s = s ? s[0] : "";

    array = array[0].replace(/^:\s*/, "").match(/[\S]+/g);

    return  `${s}text-decoration-line: ${array[0]};\n` +
      `${s}text-decoration-color: ${array[1]};\n` +
      `${s}text-decoration-style: ${array[2]};`;
  });

  // .red
  css = css.replace(/\.[^\d][A-z\d\-_]+/g, text => {
    return options.space + text.replace(/^\./, "") + ":";
  });

  // "color": "red";
  css = css.replace(/[A-z\d-]+\s*:\s*.+?;/g, text => {
    return options.space + text.replace(/"/g, "'")
      .replace(/\s*:/, ":")
      .replace(/:\s*/, ": \"")
      .replace(/\s*;$/, "\",")
      .replace(/\d+(px|em)/g, s => parseFloat(s))
      .replace(/"\.?\d+"/g, s => s.replace(/"/g, ""))
      .replace(/(-[A-z]+)+ *:/g, s => s.replace(/-[A-z]/g, x => x.replace(/^-/, "").toUpperCase()));
  });

  // },
  css = css.replace(/}/g, options.space + "},");
  css = css.replace(/},\s+$/, "}");

  // Multiple borderStyle
  css = css.replace(/ borderStyle:[^}]+ borderStyle:.+?\n/g, text => text.replace(/\n[^\n]+\n$/, "\n"));

  return css;
}

module.exports = CssToStyles;
