const base = require("./base");
const SassToObject = require("./sassToObject");
const {ReplaceVariable} = require("./variable");
let options;



async function Transform(path){
  if(!options) {
    options = require("../index").getOptions();
  }

  // 获取内容
  let sass = base.GetFileContent(path);

  // 替换变量
  sass = ReplaceVariable(sass, path);
  // console.log("模板", options.template);

  // SASS转换成对象
  let {Styles, Media} = await SassToObject(sass, path),
    styleReg = /let styles = {.+?};/s;
  path =  path.replace(/\.s?css$/, `${options.postfix}`);

  // if(styleReg.test(options.template)){
  //   options.template = options.template.replace(styleReg, `let styles = ${Styles};`);
  // }

  let string = options.template.replace(/const styleSheet/, text => {
    let styles = `let styles = ${Styles};\n\n`,
      media = "";

    if(!/^{\s*}$/.test(Media)){
      media += `let media = ${Media};\n`;
      if(!/function\s*addMedia\(/.test(options.template)){
        media += `// 媒体查询
(function addMedia(){
  for(let k in media){
    if(eval(k)){
      for(let j in media[k]){
        styles[j] = Object.assign(styles[j] || {}, media[k][j]);
      }
    }
  }
}());\n\n`;
      }
    }

    return styles + media + text;
  });

  base.writeFile(path, string);
}


module.exports = Transform;
