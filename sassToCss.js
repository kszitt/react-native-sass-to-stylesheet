// 删除注释
function deleteNotes(style){
  return style.replace(/[\t ]*?\/\/[\s\S]+?\n/g, "").replace(/\s*?\/\*[\s\S]+?\*\//g, "");
}

// 替换{}
function replace(style, index){
  if(!/\{/.test(style)) return style;

  style = style.replace(/\s*\..+\{[^\{]+?\}/, text => {
    let key = text.match(/\..+\{/)[0].replace(/\.|\s*\{/g, "");

    if(index === undefined) {
      index = 0;
    } else {
      index++;
    }

    text = text.replace(/[\S]+ *\*\d+%7B/g, s => "." + key + "_" + s.replace(/^\./, ""));

    return text.replace(/\{/, "*"+index+"%7B").replace(/\}/, "*"+index+"%7D");
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

  // console.log("index:", index, key);
  style = style.replace(eval("/\\"+ key +"[BD]/g"), text => {
    // console.log("text:", text);
    return text.replace(/\*\d+%/g, d => "*"+ index + "_%")
  });

  return port(style, index);
}

// 提取
function extract(style, i=0, css=""){
  if(!eval("/\\*"+ i +"_%7[BD]/").test(style)) return css;

  let str = style.match(eval("/[ ]*.+?\\*"+ i +"_%7B[\\s\\S]+?\\*"+ i +"_%7D/"));

  if(str){
    // console.log("str[0]:", JSON.stringify(str[0]));
    str = str[0].replace(eval("/\\*"+ i +"+_%7B/"), "{").replace(eval("/\\*"+ i +"+_%7D/"), "}") + "\n";
    // 删除多余的花括号
    str = str.replace(/\s*.+?\*\d+_%7B[\s\S]+\*\d+_%7D/, "");
    // 删除花括号前的空格
    // console.log("str:", i, JSON.stringify(str));
    // console.log("str:", i, str);
    str = str.replace(/\s*.+?\{[\s\S]+\}/, text => {
      // console.log("找到:", JSON.stringify(text));
      let space = text.match(/^[ ]*/)[0];
      space = /^[ ]*/.test(space) ? space : text.match(/^\t*/)[0];
      // console.log("space", space.length);
      text = text.replace(eval("/^"+ space +"/"), "");
      text = text.replace(eval("/\\n"+ space +"/g"), "\n");
      // console.log("text", JSON.stringify(text));
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
  // console.log("replace", sass);
  sass = port(sass);
  // console.log("port", sass);
  return extract(sass);
};