const chokidar = require('chokidar');
const Transform = require("./transform");
const AutoWriteStyles = require("./autoWriteStyles");
const SassToStyles = {};
let template = `import {StyleSheet, PixelRatio} from 'react-native';
const pixelRatio = PixelRatio.get();


let styles = {};


for(let i in css){
  for(let k in css[i]){
    if(typeof css[i][k] === "number"){
      if(k !== "flex"){
        css[i][k] = parseInt((css[i][k] / pixelRatio).toFixed(2));
      }
    }
  }
}

const styleSheet = StyleSheet.create(css);

export default styleSheet;
`;


var watcher,
  params = {
    space: 2,
    postfix: "Style.js",
    initTransform: false,
    ignored: /\.(jsx?|png|jpe?g|gif|json)$/,
    template
  };


function getOptions(){
  return params;
}


async function init(path, options){
  params = Object.assign(params, options);

  // 缩进
  if(params.space){
    let i = 0,
      space = params.space;

    params.space = "";
    while(i < space){
      params.space += " ";
      i++;
    }
  }

  if(params.initTransform){
    await AutoWriteStyles(path);
    console.log("初始化编译完成");
  }

  watcher = chokidar.watch(path, {
    ignored: params.ignored
  });

  watcher.on('ready', () => {
    console.log(`开始监听${path}`);
    watcher.on('change', (path) => {
      if(!/\.s?css$/.test(path)) return;

      let date = new Date();
      console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}  正在编译：${path}`);
      Transform(path);
    });
  });
}


SassToStyles.init = init;
SassToStyles.getOptions = getOptions;
module.exports = SassToStyles;

