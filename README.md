### 语言
[English](https://github.com/kszitt/react-native-sass-to-styleSheet/blob/master/README_EN.md)

### 描述
css文件自动转换成react-native样式文件。  
1、支持变量  
2、支持媒体查询  
3、支持嵌套  
4、支持`transform`  
5、适配各种手机  
6、支持群组选择器

### 概述
- [安装](#安装)
- [使用](#使用)
  - [初始化](#初始化)
  - [启动](#启动)
  - [SCSS文件](#SCSS文件)
  - [转换后](#转换后)
  - [在react native中使用](#在react-native中使用)
- [示例](#示例)
  - [font](#font)
  - [padding](#padding)
  - [border](#border)
  - [text-decoration](#text-decoration)
  - [text-shadow](#text-shadow)
  - [transform](#transform)
  - [变量](#变量)
  - [群组选择器](#群组选择器)
  - [媒体查询](#媒体查询)
- [自动生成模板](#自动生成模板)
  - [默认的自动生成模板](#默认的自动生成模板)
  - [使用自定义模板](#使用自定义模板)

### 安装
``` javascript
npm install react-native-sass-to-stylesheet --save-dev
```

### 使用
##### 初始化  
新建`toStyles.js`，并添加以下内容
``` javascript
const ToStyles = require("react-native-sass-to-stylesheet");

ToStyles.init(path[, options]);
```
.init(path[, options])
- path{string} 要监听的文件夹路径，必须
- options{object}
    - space{number} css文件缩进值，默认`2`
    - postfix{string} 转换生成的js文件后缀，默认`Style.js`。例如：`home.scss`转换生成`homeStyle.js`
    - initTransform{boolean} 启动服务后，是否自动转换所有的css文件，默认`false`
    - adaptation{boolean} 适配各种手机，默认`true`。如果单个样式不需要适配，请添加` !important`标志
    - templatePath{string} 自动转换文件模板路径，默认`./template.js`
##### 启动  
``` javascript
node toStyles.js
```
##### SCSS文件
在`.init()`的`path`目录下，创建、修改`css`或者`scss`文件，保存。会在当前目录下生成`js`文件。例如
``` scss
.header {
  font: 12px/24px;
  .logo {
    position: absolute;
    .img {
      width: 100px;
      height: 100px;
    }
  }
}
```
##### 转换后
``` javascript
import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

function getAdaptation(num){    // 可以在"options.templatePath"模板中自定义该函数
  return parseFloat((num / pixelRatio).toFixed(2));
}

let styles = {
  header: {
    fontSize: getAdaptation(12),
    lineHeight: getAdaptation(24)
  },
  header_logo: {
    position: "absolute"
  },
  header_logo_img: {
    width: getAdaptation(100),
    height: getAdaptation(100)
  }
};

const styleSheet = StyleSheet.create(styles);
export default styleSheet;
```
##### 在react native中使用
``` javascript
import Style from "homeStyle.js";
...
render(){
    return (
       <View style={Style.header}>
           <View style={Style.header_logo}>
               <Image source={...} style={Style.header_logo_img}/>
           </View>
       </View>
    );
}
```

### 示例
##### font
``` scss
.main {
  font: italic bold 12px/24px "Arial";
  font-variant: small-caps, lining-nums;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    fontVariant: [
      "small-caps",
      "lining-nums"
    ],
    fontSize: getAdaptation(12),
    lineHeight: getAdaptation(24),
    fontStyle: "italic",
    fontWeight: "bold",
    fontFamily: "Arial"
  }
};
```
##### padding
``` scss
.main {
  padding: 1px 2px 3px;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    paddingTop: getAdaptation(1),
    paddingBottom: getAdaptation(3),
    paddingRight: getAdaptation(2),
    paddingLeft: getAdaptation(2),
  }
};
```
##### border
``` scss
.main {
  border: 1px solid #333;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    borderWidth: getAdaptation(1),
    borderColor: "#333",
    borderStyle: "solid"
  }
};
```
##### text-decoration
``` scss
.main {
  text-decoration: underline solid red;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    textDecorationLine: "underline",
    textDecorationColor: "red",
    textDecorationStyle: "solid"
  }
};
```
##### text-shadow
``` scss
.main {
  text-shadow: 5px 5px 10px red;
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    textShadowOffset: {
      width: getAdaptation(5),
      height: getAdaptation(5)
    },
    textShadowRadio: getAdaptation(10),
    textShadowColor: "red"
  }
};
```
##### transform
``` scss
.main {
  transform: translate(10px, 20px) rotateY(-10.3deg) scaleX(.5) skew(60deg);
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    transform: [
      {
        translateX: getAdaptation(10),
        translateY: getAdaptation(20)
      },
      {
        rotateY: "-10.3deg"
      },
      {
        scaleX: .5
      },
      {
        skewX: "60deg"
      }
    ]
  }
};
```
##### 变量
``` scss
$size: 12px !global; // 别的页面也可以使用
$color: red;
.header {
  font: $size/24px;
  .left {
    color: $color;
  }
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  header: {
    fontSize: getAdaptation(12),
    lineHeight: getAdaptation(24)
  },
  header_left: {
    color: "red"
  }
};
```
##### 群组选择器
``` scss
.main {
  display: flex;
  .left, .right {
    position: absolute;
    left: 0;
  }
  .left {
    left: 10px;
  }
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
let styles = {
  main: {
    display: "flex"
  },
  main_left: {
    position: "absolute",
    left: getAdaptation(10)
  },
  main_right: {
    position: "absolute",
    left: 0
  }
};
```
##### 媒体查询
``` scss
.main {
  width: 500px;
}
@media only screen and (min-width: 500px) and (max-width: 1000px) {
  .main {
    width: 100%;
    height: 1000px;
  }
}
```
↓ ↓ ↓ ↓ ↓ ↓
``` javascript
import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

function getAdaptation(num){    // 可以在"options.templatePath"模板中自定义该函数
  return parseFloat((num / pixelRatio).toFixed(2));
}

let styles = {
  main: {
    width: getAdaptation(500)
  },
  main_top: {
    fontSize: getAdaptation(12)
  }
};


let media = {
  "width>=500&&width<=1000": {
    main: {
      width: "100%",
      height: getAdaptation(1000)
    }
  }
};

// 媒体查询
(function addMedia(){   // 可以在"options.templatePath"模板中自定义该函数
  width = parseFloat((width * pixelRatio).toFixed(2));
  for(let k in media){
    if(eval(k)){
      for(let j in media[k]){
        styles[j] = Object.assign(styles[j] || {}, media[k][j]);
      }
    }
  }
}());
...
```

### 自动生成模板  
##### 默认的自动生成模板
``` javascript
import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

/*
自动生成区域
*/

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
```

##### 使用自定义模板  
修改`init(path[, options])`中`options.templatePath`模板路径，写入你的模板。
