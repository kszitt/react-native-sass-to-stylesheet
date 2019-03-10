const chokidar = require('chokidar');
const Transform = require("./transform");
const AutoWriteStyles = require("./autoWriteStyles");
const SassToStyles = {};


var watcher,
  params = {
    space: 2,
    postfix: "Style.js",
    initAuto: true,
    ignored: /\.(jsx?|png|jpe?g|gif|json)$/
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

  if(params.initAuto){
    await AutoWriteStyles(path);
    console.log("初始化编译完成");
  }

  watcher = chokidar.watch(path, {
    ignored: params.ignored
  });

  watcher.on('ready', () => {
    console.log(`开始监听${path}`);
    watcher.on('change', (path, stats) => {
      if(!/\.s?css$/.test(path)) return;

      console.log(`正在编译：${path}`);
      Transform(path);
    });
  });
}


SassToStyles.init = init;
SassToStyles.getOptions = getOptions;
module.exports = SassToStyles;

