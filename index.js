const chokidar = require('chokidar');
const Transform = require("./lib/transform");
const AutoWriteStyles = require("./lib/autoWriteStyles");
const {SetGlobal} = require("./lib/variable");
const {GetFileContent} = require("./lib/base");
const SassToStyles = {};



let watcher,
  params = {
    space: 2,
    postfix: "Style.js",
    initTransform: false,
    ignored: /\.(jsx?|png|jpe?g|gif|json)$/,
    templatePath: "./template.js",
    global: {}
  };


function getOptions(){
  return params;
}

function getTemplate(){
  let template = GetFileContent(params.templatePath);
  if(!template){
    template = `import {StyleSheet, PixelRatio} from 'react-native';

let styles = {};
      
const styleSheet = StyleSheet.create(styles);

export default styleSheet;`;
  }

  params.template = template;
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

  // 模板
  getTemplate();

  // 设置全局样式
  await SetGlobal(path);

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
      getTemplate();
      console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}  正在编译：${path}`);
      Transform(path);
    });
  });
}


SassToStyles.init = init;
SassToStyles.getOptions = getOptions;
module.exports = SassToStyles;

