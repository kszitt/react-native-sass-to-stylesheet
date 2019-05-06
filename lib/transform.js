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

  options.template = options.template.replace(/let styles = {.*?};/s, `let styles = ${Styles};`);
  options.template = options.template.replace(/let media = {.*?};\s*/s, () => {
    if(/^{\s*}$/.test(Media)) return "\n";

    let str = `let media = ${Media};\n\n`;
    if(!/function\s*addMedia\(/.test(options.template)){
      str += `// 媒体查询
(function addMedia(){
  for(let k in media){
    if(eval(k)){
      for(let j in media[k]){
        styles[j] = Object.assign(styles[j] || {}, media[k][j]);
      }
    }
  }
}());

`;
    }

    return str;
  });

  base.writeFile(path, options.template);
}


module.exports = Transform;