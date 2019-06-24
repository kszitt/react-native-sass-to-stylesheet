const base = require("./base");
const {ReplaceVariable} = require("./variable");
const path = require("path");
let Styles = {},
  Media = {},
  options = {};

// 格式化
function formatStr(style){
  // 删除注释
  style = style.replace(/ *?\/\/[\s\S]+?\n/g, "")
    .replace(/\s*?\/\*[\s\S]+?\*\//g, "");

  // 替换#
  style = style.replace(/#[\S ]+?[;{]/g, text => {
    if(/^#[A-z\d]{3,6}( *!important)?;$/.test(text)){
      return text;
    }
    return text.replace(/#/, ".");
  });

  // . => &SPOT
  style = style.replace(/(\.\d+)|(\d+\.\d+)/g, text =>
    text.replace(/\./, "&SPOT"));

  // 格式化
  style = style.replace(/\s*({|;|\.|,|:|})\s*/g, text =>
    text.replace(/\s+/g, ""))
    .replace(/,\./g, ",");

  // .left .right{ => .left_right{
  style = style.replace(/\.[A-z][A-z\d]*(\.[A-z][A-z\d]*)+{/g, text =>
    text.replace(/\S\./g,s =>
      s.replace(/\./, "_")));

  // 转换成大写
  style = style.replace(/[;{(][^:)]+/g, text =>
    text.replace(/-[A-z]/g, s =>
      s.replace(/-/, "").toUpperCase()));

  return style;
}

// media
function replaceMedia(style){
  style = style.replace(/@media.+?{/g, text => {
    let media = "";
    text.replace(/and\s*\(.+?\)/g, text => {
      text = text.replace(/^and\s*\(\s*/, "")
        .replace(/\s*;?\s*\)$/, "");

      let key = text.match(/[^:]+/)[0],
        value = parseFloat(text.match(/:\s*\d+/)[0]
          .replace(/:\s*/, ""));

      if(media) media += "&&";
      switch(key){
        case "minWidth":
          media += "width>="+value;
          break;
        case "maxWidth":
          media += "width<="+value;
          break;
        case "minHeight":
          media += "height>="+value;
          break;
        case "maxHeight":
          media += "height<="+value;
          break;
      }

      return "";
    });

    if(!media) return text;

    return text.replace(/^@media.+?{/, `.@media${media}{`);
  });

  return style;
}

// 赋值
function assignment(sass){
  sass.replace(/\.[A-z\d_,]+{[^.]+/g, (text, index) => {
    let key = text.match(/[A-z\d_,]+/)[0],
      value = text.match(/{[^.]+$/)[0]
        .replace(/^{/, "")
        .replace(/;?}*$/, "")
        .split(";"),
      mediaFlag,
      prevStr = sass.substr(0, index),
      obj = {};

    // 删除没用的样式
    prevStr = removeEnd(prevStr);
    mediaFlag = /@media/.test(prevStr);
    // 获取key
    key = mediaFlag ? getMediaKey(prevStr, key) : getStyleKey(prevStr, key);

    // 获取值
    value = value.filter(item => item);
    value.forEach(item => {
      let k = item.match(/[^:]+/)[0],
        v = item.match(/[^:]+$/)[0];
      obj[k] = v;
    });

    // 赋值
    if(mediaFlag){
      Media[key.mediaKey][key.key] = Object.assign(Media[key.mediaKey][key.key]||{}, obj);
    } else {
      Styles[key] = Object.assign(Styles[key]||{}, obj);
    }
  });
}

// 删除一个{}中没用的样式
function removeEnd(str, length=0){
  let reg = /\.[A-z\d_,@><=&]+{[^{}]*}/;
  if(!reg.test(str)) return str;

  str = str.replace(reg, s => {
    length += s.length;
    return "";
  });

  return removeEnd(str);
}

// 获取Style的key
function getStyleKey(str, lastKey){
  let array = str.match(/\.[A-z\d_,]+{/g) || [],
    key = [],
    i = 0;

  array.push(lastKey);
  while(array[i]){
    let value = array[i].replace(/^\./, "")
      .replace(/{$/, "");

    key.push(value);
    i++;
  }

  return key.join("_");
}

// 获取Media的key
function getMediaKey(str, lastKey){
  let array = str.match(/\.[A-z\d_,@><=&]+{/g) || [],
    mediaKey,
    key = [],
    i = 0;

  array.push(lastKey);
  while(array[i]){
    let value = array[i].replace(/^\./, "")
      .replace(/{$/, "");

    if(/^@media/.test(value)){
      mediaKey = value.replace(/^@media/, "");
    } else {
      key.push(value);
    }

    i++;
  }

  Media[mediaKey] = Media[mediaKey] || {};

  return {
    mediaKey,
    key: key.join("_")
  };
}

// 群组选择器
function replaceGroup(){
  let flag = false;
  for(let key in Styles){
    group(key);
  }
  for(let key in Media){
    for(let k in Media[key]){
      group(k, Media[key]);
    }
  }

  for(let key in Styles){
    if(/,/.test(key)){
      flag = true;
    }
  }
  for(let key in Media){
    for(let k in Media[key]){
      if(/,/.test(k)){
        flag = true;
      }
    }
  }

  if(flag){
    replaceGroup();
  }

  function group(key, mediaClass){
    if(!/,/.test(key)) return;

    let reg = /[^_]+?(,[^_,]+)+/,
      Obj = mediaClass || Styles,
      keys = [];

    key.replace(reg, str => {
      keys = str.split(",");
      return key;
    });

    keys.forEach(item => {
      let nowKey = key.replace(reg, () => item);

      Obj[nowKey] = Object.assign({...Obj[key]}, Obj[nowKey]||{});
    });

    delete Obj[key];
  }
}

// margin
function margin(key, obj, objKey, objVal){
  if(!/^margin$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let array = objVal.split(" "),
    length = array.length;

  obj.marginTop = getAdaptation(array[0], important);
  obj.marginBottom = getAdaptation(array[(length===1||length===2) ? 0 : 2], important);
  obj.marginRight = getAdaptation(array[length===1 ? 0 : 1], important);
  obj.marginLeft = getAdaptation(array[length===1 ? 0 : (length===4?3:1)], important);
  delete obj[objKey];
}

// padding
function padding(key, obj, objKey, objVal){
  if(!/^padding$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let array = objVal.split(" "),
    length = array.length;

  obj.paddingTop = getAdaptation(array[0], important);
  obj.paddingBottom = getAdaptation(array[(length===1||length===2) ? 0 : 2], important);
  obj.paddingRight = getAdaptation(array[length===1 ? 0 : 1], important);
  obj.paddingLeft = getAdaptation(array[length===1 ? 0 : (length===4?3:1)], important);
  delete obj[objKey];
}

// background
function background(key, obj, objKey, objVal){
  if(!/^background$/.test(objKey)) return;

  obj.backgroundColor = objVal;
  delete obj.background;
}

// border
function border(key, obj, objKey, objVal){
  if(!/^border(Left|Right|Top|Bottom)?$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let array = objVal.split(" "),
    width, color, style,
    i = 0;

  while(array[i]){
    let value = array[i];
    if(value === "none"){
      width = 0;
      color = "none";
      break;
    } else if(/^-?[\d.]+(px|em)$/.test(value)){
      width = getAdaptation(value, important);
    } else if(/^(solid|dotted|dashed)$/.test(value)){
      style = value;
    } else {
      color = value;
    }

    i++;
  }

  if(width || width === 0) obj[`${objKey}Width`] = width;
  if(color) obj[`${objKey}Color`] = color;
  if(style) obj.borderStyle = style;

  delete obj[objKey];
}

// text-decoration
function textDecoration(key, obj, objKey, objVal){
  if(!/^textDecoration$/.test(objKey)) return;

  let lineReg = /(none|underline|line-through|underline line-through)/,
    styleReg = /(solid|dotted|dashed)/,
    line = objVal.match(lineReg),
    color = objVal.replace(lineReg, "")
      .replace(styleReg, "")
      .trim(),
    style = objVal.match(styleReg);

  if(line) obj.textDecorationLine = line[0];
  if(color) obj.textDecorationColor = color;
  if(style) obj.textDecorationStyle = style[0];
  delete obj[objKey];
}

// text-shadow
function textShadow(key, obj, objKey, objVal){
  if(!/^textShadow$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let array = objVal.split(" "),
    width, height, radio, color,
    i = 0;

  while(array[i]){
    let value = array[i];
    if(/^-?[\d.]+(px|em)$/.test(value)){
      if(!width){
        width = getAdaptation(value, important);
      } else if(!height){
        height = getAdaptation(value, important);
      } else {
        radio = getAdaptation(value, important);
      }
    } else {
      color = value;
    }

    i++;
  }

  if(width) obj.textShadowOffset = {width};
  if(height) obj.textShadowOffset.height = height;
  if(radio) obj.textShadowRadio = radio;
  if(color) obj.textShadowColor = color;

  delete obj[objKey];
}

// box-shadow
function boxShadow(key, obj, objKey, objVal){
  if(!/^boxShadow$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let array = objVal.split(" "),
    width, height, opacity, radio, color,
    i = 0;

  while(array[i]){
    let value = array[i].trim();
    if(/^-?[\d.]+(px|em)$/.test(value)){
      if(!width){
        width = getAdaptation(value, important);
      } else if(!height){
        height = getAdaptation(value, important);
      } else {
        radio = getAdaptation(value, important);
      }
    } else if(/^[&SPOT\d]+$/.test(value)){
      opacity = value;
    } else {
      color = value;
    }

    i++;
  }

  if(width) obj.shadowOffset = {width};
  if(height) obj.shadowOffset.height = height;
  if(radio) obj.shadowRadio = radio;
  if(opacity) obj.shadowOpacity = opacity;
  if(color) obj.shadowColor = color;

  delete obj[objKey];
}

// font
function font(key, obj, objKey, objVal){
  if(!/^font$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let familyReg = /["'].+?["']/,
    array = objVal.replace(familyReg, "")
      .split(" "),
    style, weight,
    size, height, family=objVal.match(familyReg),
    i = 0;
  array.map(item => item.trim());

  while(array[i]){
    let value = array[i];
    if(/^italic$/.test(value)){
      style = value;
    } else if(/-?[\d.]+(px|em)(\/-?[\d.]+(px|em))?/.test(value)){
      size = value.replace(/\/.+/, "");
      size = getAdaptation(size, important);
      height = value.match(/\/-?[\d.]+(px|em)/);
      if(height){
        height = height[0].replace(/^\//, "");
        height = getAdaptation(height, important);
      }
    } else if(/^(bold|[1-9]00(?!px|em))$/.test(value)){
      weight = value;
    }

    i++;
  }

  if(size) obj.fontSize = size;
  if(height) obj.lineHeight = height;
  if(style) obj.fontStyle = style;
  if(weight) obj.fontWeight = weight;
  if(family) obj.fontFamily = family[0].replace(/"/g, "");

  delete obj[objKey];
}

// font-variant
function fontVariant(key, obj, objKey, objVal){
  if(!/^fontVariant$/.test(objKey)) return;

  let variant = objVal.split(",");
  variant = variant.map(item => item.trim());

  obj[objKey] = variant;
}

// transform
function transform(key, obj, objKey, objVal){
  if(!/^transform$/.test(objKey)) return;

  let important = /\s*!important/.test(objVal);
  objVal = objVal.replace(/\s*!important/, "");

  let array = objVal.split(" "),
    i = 0,
    arr = [],
    translateX, translateY,
    scaleX, scaleY,
    rotate, rotateX, rotateY, rotateZ,
    skewX, skewY;

  while(array[i]){
    let key = array[i].match(/[^(]+/)[0],
      value = array[i].match(/\(.+?\)/)[0]
        .replace(/[()]/g, "")
        .split(",");

    switch(key){
      case "translate":
        translateX = getAdaptation(value[0], important);
        translateY = getAdaptation(value[1] || value[0], important);
        arr.push({translateX, translateY});
        break;
      case "translateX":
        translateX = getAdaptation(value[0], important);
        arr.push({translateX});
        break;
      case "translateY":
        translateY = getAdaptation(value[0], important);
        arr.push({translateY});
        break;
      case "rotate":
        rotate = value[0];
        arr.push({rotate});
        break;
      case "rotateX":
        rotateX = value[0];
        arr.push({rotateX});
        break;
      case "rotateY":
        rotateY = value[0];
        arr.push({rotateY});
        break;
      case "rotateZ":
        rotateZ = value[0];
        arr.push({rotateZ});
        break;
      case "scale":
      case "scaleX":
        scaleX = getAdaptation(value[0], important);
        arr.push({scaleX});
        break;
      case "scaleY":
        scaleY = getAdaptation(value[0], important);
        arr.push({scaleY});
        break;
      case "skew":
        if(value[1]){
          skewY = value[1];
          arr.push({skewY});
        }
        skewX = value[0];
        arr.push({skewX});
        break;
      case "skewX":
        skewX = value[0];
        arr.push({skewX});
        break;
      case "skewY":
        skewY = value[0];
        arr.push({skewY});
        break;
    }

    i++;
  }

  obj.transform = arr;
}

// 适配
function getAdaptation(value, important){
  if(!options.adaptation && !/px|em/.test(value)) return value;

  return value.replace(/-?[\d.]+(px|em)/g, num =>
    options.adaptation && !important ?
      `getAdaptation(${parseFloat(num)})` :
      parseFloat(num));
}

// 格式化对象
function formatObject(){
  Styles = JSON.stringify(Styles, null, options.space);
  Media = JSON.stringify(Media, null, options.space);

  Styles = replaceStr(Styles);
  Media = replaceStr(Media);

  function replaceStr(string){
    // 去掉important
    string = string.replace(/"[^"]+?!important"/,
      text => text.replace(/ *!important/, "")
        .replace(/px|em/g, "")
        .replace(/"/g, ""));

    // &SPOT => .
    string = string.replace(/&SPOT/g, ".");

    // 适配
    string = string.replace(/"-?[\d.]+(px|em)"/g,
      text => text.replace(/-?[\d.]+(px|em)/,
        s => options.adaptation ? `getAdaptation(${parseFloat(s)})` : parseFloat(s)));

    // "12" => 12  ||  "getAdaptation()" => getAdaptation()
    string = string.replace(/"(getAdaptation\()?-?[\d.]+\)?"/g,
      text => text.replace(/"/g, ""));

    // "...":  => ...:
    string = string.replace(/"[^"<=>]+":/g,
      text => text.replace(/"/g, ""));


    return string;
  }
}

// 编译
function compile(){
  margin(...arguments);
  padding(...arguments);
  background(...arguments);
  border(...arguments);
  textDecoration(...arguments);
  textShadow(...arguments);
  font(...arguments);
  fontVariant(...arguments);
  transform(...arguments);
  boxShadow(...arguments);
}

module.exports = function SassToObject(sass, filePath){
  if(!options.space){
    options = require("../index").getOptions();
  }
  Styles = {};
  Media = {};

  // @import
  sass = sass.replace(/@import +["'].+?["'];?/g, text => {
    let str = text.replace(/^.+?["']/, "")
      .replace(/["'];?$/, ""),
      importPath = path.resolve(filePath.replace(/[^/\\]+$/, ""), str);

    // 获取内容
    let importSass = base.GetFileContent(importPath);

    // 替换变量
    importSass = ReplaceVariable(importSass, filePath);

    return importSass;
  });

  // 格式化
  sass = formatStr(sass);

  // 替换媒体查询
  sass = replaceMedia(sass);

  // 赋值
  assignment(sass);

  // 群组选择器
  replaceGroup();

  // 样式编译
  for(let key in Styles){
    let obj = Styles[key];
    for(let objKey in obj){
      let arguments = [key, obj, objKey, obj[objKey]];
      compile(...arguments);
    }
  }

  // 媒体查询编译
  for(let key in Media){
    for(let k in Media[key]){
      let obj = Media[key][k];
      for(let objKey in obj){
        let arguments = [key, obj, objKey, obj[objKey]];
        compile(...arguments);
      }
    }
  }

  // 格式化对象
  formatObject();

  return {
    Styles,
    Media
  };
};


