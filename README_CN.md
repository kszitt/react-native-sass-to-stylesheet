## 语言
[English](https://github.com/kszitt/react-native-sass-to-styleSheet/blob/master/README.md)

## 描述
sass或者css文件自动转换成react-native样式文件。

## 安装
``` javascript
npm install react-native-sass-to-stylesheet --save-dev
```

## 使用
#### 1、新建`toStyles.js`，并添加以下内容
``` javascript
const SassToStyles = require("react-native-sass-to-stylesheet");

SassToStyles.init(<path>);
```

##### .init(path[, options])
- path{string} 要监听的文件夹路径，必须
- options{object}
    - space{number} css文件缩进值，默认`2`
    - postfix{string} 转换生成的js文件后缀，默认`Style.js`。例如：`home.scss => homeStyle.js`
    - initTransform{boolean} 启动服务后，是否自动转换所有的css文件，默认`false`
    - ignored{reg} 忽略文件，默认`/\.(jsx?|png|jpe?g|gif|json)$/`
    - templatePath{string} 自动转换文件模板路径

#### 2、`package.json`的scripts中，添加
``` json
"transition": "node toStyles.js"
```

### 3、启动
``` javascript
npm run transition
```

## 效果
### 例1
``` scss
#header {
  font-size: 12px;
  .logo {
    width: 100px;
  }
}
.footer {
  background: rgba(255, 255, 255, .8);
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  header: {
    fontSize: 12,
  },
  header_logo: {
    width: 100,
  },
  footer: {
    backgroundColor: "rgba(255, 255, 255, .8)",
  }
};
```
### 例2
``` scss
/* 注释 */
#header {
  // 注释
  background: #888;
  border: 1px solid #ccc;
  flex-direction: row;
  margin: 0 10px 10px;
  text-decoration: underline white solid;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  header: {
    backgroundColor: "#888",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
    flexDirection: "row",
    marginTop: 0,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    textDecorationLine: "underline",
    textDecorationColor: "white",
    textDecorationStyle: "solid",
  }
}
```
### 例3
``` scss
$size: 12px !global;  // 全局变量在任何文件中，都可以直接用
$color: red;
#home {
  flex-direction: column;
  font-size: $size;
  background: $color;
}
.main {
  font-size: $size;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  home: {
    flexDirection: "column",
    fontSize: 12,
    backgroundColor: "red",
  },
  main: {
    fontSize: 12,
  }
};
```
### 例4
``` scss
#header{
  font: italic bold 12px/24px "arial";
  transform: translateY(5px) scaleY(3) rotate(10deg) skewY(20deg);
  text-shadow: 10px 20px 5px #ccc;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  header:{
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: 12,
    fontHeight: 24,
    fontFamily: "arial",
    transform: {
      translateY: 5,
      scaleY: 3,
      rotate: "10deg",
      skewY: "20deg",
    },
    textShadowOffset: {
      width: 10,
      height: 20
    },
    textShadowRadio: 5,
    textShadowColor: "#ccc",
  }
};
```

## 模板
将转换的`styles`对象插入到模板的`let styles = {};`中，在`react-native`中直接引用。  

### 默认的模板
``` javascript
import {StyleSheet, PixelRatio} from 'react-native';

let styles = {};

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
```
### 使用自定义模板
在项目根目录创建`template.js`文件，写入你的模板。其中，`let styles = {};`不可以修改。例如：
``` javascript
import {StyleSheet, PixelRatio} from 'react-native';
const pixelRatio = PixelRatio.get();

let styles = {};

for(let i in styles){
  for(let k in styles[i]){
    if(typeof styles[i][k] === "number"){
      if(k !== "flex"){
        styles[i][k] = parseFloat((styles[i][k] / pixelRatio).toFixed(2));
      }
    }
  }
}

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
```

## 注意
#### 1、请按照类似以下形式，编写scss。每个样式后面有`;`结尾，缩进格数可以自定义。
``` scss
#header {
  font-size: 12px;
}
```
#### 2、以下转换不成功，请避免使用
``` scss
.aa, .bb {

}
.cc .dd {

}
```