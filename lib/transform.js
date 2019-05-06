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
  sass = ReplaceVariable(sass);

  // SASS转换成对象
  let {Styles, Media} = await SassToObject(sass);
  path =  path.replace(/\.s?css$/, `${options.postfix}`);

  let template = options.template.replace(/\n(?=const styleSheet)/, text => {
    let mediaJS,
      getAdaptation,
      str = "",
      style, media;

    style = `let styles = ${Styles};\n`;

    // 媒体查询
    if(!/^{\s*}$/.test(Media)){
      media = `let media = ${Media};\n`;
      if(!/function\s*addMedia\(/.test(options.template)){
        mediaJS =
`// 媒体查询
(function addMedia(){
  for(let k in media){
    if(eval(k)){
      for(let j in media[k]){
        styles[j] = Object.assign(styles[j] || {}, media[k][j]);
      }
    }
  }
}());`;
      }
    }

    if(getAdaptation) str += `\n\n${getAdaptation}`;
    str += `\n\n${style}\n\n`;
    if(media) str += `${media}\n\n`;
    if(mediaJS) str += `${mediaJS}\n\n`;

    return str;
  });

  base.writeFile(path, template);
}


module.exports = Transform;