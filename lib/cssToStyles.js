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

  // transform
  css = css.replace(/\..+?{[\s\S]+?transform *:.+?;/g, text => {
    let s = text.match(/ *transform/),
      className = text.match(/[A-z\d_-]+/)[0],
      value = text.replace(/^.+?:\s*/, "")
        .replace(/\s*;$/, ""),
      translateX, translateY,
      scaleX, scaleY,
      rotate, rotateX, rotateY, rotateZ,
      skewX, skewY,
      transform = "";
    s = s ? s[0].replace(/transform/, "") : "";

    // translate
    value.replace(/(translate|scale|rotate|skew)(X|Y|Z)?\(.+?\)/g, text => {
      let key = text.match(/(translate|scale|rotate|skew)(X|Y|Z)?/)[0],
        nums = text.match(/\(.+?\)/)[0]
          .replace(/(\(|\))/g, "")
          .split(",");

      let num1 = nums[0] ? nums[0] : "",
        num2 = nums[1] ? nums[1] : "",
        num3 = nums[2] ? nums[2] : "";

      switch(key){
        case "translate":
          translateX = parseInt(num1);
          translateY = parseInt(num2);
          break;
        case "translateX":
          translateX = parseInt(num1);
          break;
        case "translateY":
          translateY = parseInt(num1);
          break;
        case "rotate":
          rotate = num1;
          break;
        case "rotateX":
          rotateX = num1;
          break;
        case "rotateY":
          rotateY = num1;
          break;
        case "rotateZ":
          rotateZ = num1;
          break;
        case "scale":
          scaleX = parseInt(num1);
          break;
        case "scaleX":
          scaleX = parseInt(num1);
          break;
        case "scaleY":
          scaleY = parseInt(num1);
          break;
        case "skew":
          skewX = num1;
          if(num2) skewY = num2;
          break;
        case "skewX":
          skewX = num1;
          break;
        case "skewY":
          skewY = num1;
          break;
      }

      return "";
    });

    // transform += `{\n`;
    if(translateX) transform += `${s}${options.space}translateX: ${translateX};\n`;
    if(translateY) transform += `${s}${options.space}translateY: ${translateY};\n`;
    if(scaleX) transform += `${s}${options.space}scaleX: ${scaleX};\n`;
    if(scaleY) transform += `${s}${options.space}scaleY: ${scaleY};\n`;
    if(rotate) transform += `${s}${options.space}rotate: ${rotate};\n`;
    if(rotateX) transform += `${s}${options.space}rotateX: ${rotateX};\n`;
    if(rotateY) transform += `${s}${options.space}rotateY: ${rotateY};\n`;
    if(rotateZ) transform += `${s}${options.space}rotateZ: ${rotateZ};\n`;
    if(skewX) transform += `${s}${options.space}skewX: ${skewX};\n`;
    if(skewY) transform += `${s}${options.space}skewY: ${skewY};\n`;
    transform += `${options.space}`;
    transform = transform.replace(/{\s+?}/, "{ }\n");

    text = text.replace(/\n[^\n]+transform *:.+?;/,
      `\n${s}.transform {\n${transform}}`);
    return text;
  });

  // text-shadow
  css = css.replace(/ *text-shadow *:.+?;/g, text => {
    let space = options.space,
      s = text.match(/ */),
      width, height, color, radio,
      textShadow = "",
      value = text.replace(/^.+?:\s*/, "")
        .replace(/\s*;$/, "")
        .split(" ");
    s = s ? s[0] : "";

    if(!value || value.length < 2) return text;

    width = parseFloat(value[0]);
    height = parseFloat(value[1]);
    if(/^-?\d+/.test(value[2])) {
      radio = parseFloat(value[2]);
    } else if(value[2]){
      color = value[2];
    }
    if(value[3]) color = value[3];

    textShadow += `${s}${space}textShadowOffset: {\n`;
    textShadow += `${s}${space}${space}width: ${width},\n`;
    textShadow += `${s}${space}${space}height: ${height}\n`;
    textShadow += `${s}}\n`;
    if(radio) textShadow += `${s}text-shadow-radio: ${radio};\n`;
    if(color) textShadow += `${s}text-shadow-color: ${color};\n`;
    textShadow = textShadow.replace(/\s+$/, "");

    return textShadow;
});

  // font-variant
  css = css.replace(/font-variant *:.+?;/g, text => {
    let value = text.match(/:[^;]+/, "")[0]
      .replace(/^: */, "")
      .trim().split(",");

    value = value.map((item, index) =>  `"${item}"`);

    return `font-variant: [${value}];`;
  });

  // font
  css = css.replace(/ *font *:.+?;/g, text => {
    let s = text.match(/^ */),
      value = text.replace(/^.+?:\s*/, "")
        .replace(/\s*;$/, ""),
      style = weight = "normal",
      size, height, family,
      variant = [],
      font = "";
    s = s ? s[0] : "";

    // font-style
    value = value.replace(/italic/, text => {
      style = text;

      return "";
    });

    // font-weight
    value = value.replace(/(bold|[1-9]00)/, str => {
      weight = str;

      return "";
    });

    // font-size  line-height
    value = value.replace(/\d+(px|em)(\/\d+(px|em))?/, str => {
      size = str.match(/^\d+/)[0];
      height = str.match(/\/\d+/);
      if(height) {
        height = height[0].replace(/^\//, "")
      }

      return "";
    });

    // font-family
    value = value.replace(/".+?"/, str => {
      family = str.replace(/"/g, "");

      return "";
    });

    // font-variant
    value = value.replace(/[A-z-,]+/, str => {
      variant = str.split(",");
      variant = variant.map(item =>  `"${item}"`);

      return "";
    });

    if(style !== "normal") font += `${s}font-style: ${style};\n`;
    if(variant.length > 0) font += `${s}font-variant: [${variant}];\n`;
    if(weight !== "normal") font += `${s}font-weight: ${weight};\n`;
    if(size) font += `${s}font-size: ${size};\n`;
    if(height) font += `${s}font-height: ${height};\n`;
    if(family) font += `${s}font-family: ${family};\n`;
    font = font.replace(/\s+$/, "");

    return font;
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
      .replace(/"-?\.?\d+"/g, s => s.replace(/"/g, ""))
      .replace(/(-[A-z]+)+ *:/g, s => s.replace(/-[A-z]/g, x => x.replace(/^-/, "").toUpperCase()));
  });

  // },
  css = css.replace(/}/g, options.space + "},");
  css = css.replace(/},\s+$/, "}");

  // Multiple borderStyle
  css = css.replace(/ borderStyle:[^}]+ borderStyle:.+?\n/g, text => text.replace(/\n[^\n]+\n$/, "\n"));

  // "[]"  =>  []
  css = css.replace(/"\[.+?]"/g,
    text => text.replace(/^"/, "")
      .replace(/"$/, ""));

  return css;
}

module.exports = CssToStyles;
