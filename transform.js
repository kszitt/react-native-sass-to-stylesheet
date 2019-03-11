const base = require("./base");
const SassToCss = require("./sassToCss");
const CssToStyles = require("./cssToStyles");
let options, SassToStyle;






function Transform(path){
  if(!SassToStyle) {
    SassToStyle = require("./index");
    options = SassToStyle.getOptions();
  }

  // 获取sass内容
  let sass = base.getFileContent(path);
  // console.log("sass文件内容：", sass);

  // sass转化为css
  let css = SassToCss(sass);

  // css转化为styles
  let styles = CssToStyles(css);
  // console.log("styles文件内容：", styles);

  // 写入
  path =  path.replace(/\.s?css$/, `${options.postfix}`);
  let nativeStyle = base.getFileContent(path);
  if(nativeStyle){
    nativeStyle = nativeStyle.replace(/let css += *\{[\s\S]+?\};/, text => `let css = {\n${styles}\n};`);
  } else {
    nativeStyle =  `import {StyleSheet, PixelRatio} from 'react-native';
const pixelRatio = PixelRatio.get();



let css = {
${styles}
};



for(let i in css){
  for(let k in css[i]){
    if(typeof css[i][k] === "number"){
      let num = parseInt(css[i][k] / pixelRatio);
      if(num <= 1) num = 1;
      
      css[i][k] = num;
    }
  }
}

const Style = StyleSheet.create(css);

export default Style;
`;
  }


  base.writeFile(path, nativeStyle);
}


module.exports = Transform;