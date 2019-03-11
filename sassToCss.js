
// 删除注释， 替换#,\t
function deleteNotes(style){
  let space = require("./index").getOptions().space;

  style = style.replace(/\t/g, space);

  style = style.replace(/ *?\/\/[\s\S]+?\n/g, "").replace(/\s*?\/\*[\s\S]+?\*\//g, "");
  return style.replace(/#[\S]+?[ ;{]/g, text => {
    if(/^#[A-z\d]{3,6};$/.test(text)){
      return text;
    }
    return text.replace(/#/, ".");
  });
}

// 替换{}
function replace(style, index){
  if(!/{/.test(style)) return style;

  // 找到最里面的{}
  style = style.replace(/\s*\..+{[^{]+?}/, text => {
    // key: className
    let key = text.match(/\..+{/)[0].replace(/\.|\s*{/g, "");

    if(index === undefined) {
      index = 0;
    } else {
      index++;
    }

    // 替换className, %7B
    text = text.replace(/[\S]+ *\*\d+%7B/g, s => "." + key + "_" + s.replace(/^\./, ""));

    // 替换{}
    return text.replace(/{/, "*"+index+"%7B").replace(/}/, "*"+index+"%7D");
  });

  return replace(style, index);
}

// 排序
function port(style, index){
  let key = style.match(/\*\d+%7/);
  if(key){
    key = key[0];
  } else {
    return style;
  }

  if(index === undefined) {
    index = 0;
  } else {
    index++;
  }

  style = style.replace(eval("/\\"+ key +"[BD]/g"), text => {
    return text.replace(/\*\d+%/g, d => "*"+ index + "_%")
  });

  return port(style, index);
}

// 提取
function extract(style, i=0, css=""){
  if(!eval("/\\*"+ i +"_%7[BD]/").test(style)) return css;

  // 获取一个完整的*\d_%7B  *\d_%7D
  let str = style.match(eval("/ *.+?\\*"+ i +"_%7B[\\s\\S]+?\\*"+ i +"_%7D/"));

  if(str){
    // 最外面的替换回{}
    str = str[0].replace(eval("/\\*"+ i +"+_%7B/"), "{").replace(eval("/\\*"+ i +"+_%7D/"), "}") + "\n";
    // 删除多余的花括号
    str = str.replace(/\s*.+?\*\d+_%7B[\s\S]+\*\d+_%7D/, "");
    // 删除花括号前的空格（格式化）
    str = str.replace(/\s*.+?{[\s\S]+}/, text => {
      let space = text.match(/^ */)[0];

      text = text.replace(eval("/^"+ space +"/"), "");
      text = text.replace(eval("/\\n"+ space +"/g"), "\n");

      return text;
    });
    css += str;
  }

  i++;
  return extract(style, i, css);
}

module.exports = function SassToCss(sass){
  sass = deleteNotes(sass);
  sass = replace(sass);
  sass = port(sass);

  return extract(sass);
};