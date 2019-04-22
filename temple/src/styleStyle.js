import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

let styles = {
  header: {
    fontSize: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "$color"
  },
  header_logo: {
    width: 100,
    marginTop: 0,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    textDecorationLine: "underline",
    textDecorationColor: "white",
    textDecorationStyle: "solid"
  },
  main: {
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: 12,
    lineHeight: 24,
    fontFamily: "arial",
    transform: [
      {translateY: 5},
      {scaleY: 3},
      {rotate: "10deg"},
      {skewY: "20deg"},
    ],
    textShadowOffset: {
      width: 10,
      height: 20
    },
    textShadowRadio: 5,
    textShadowColor: "#ccc"
  },
  footer: {
    backgroundColor: "rgba(255, 255, 255, .8)"
  }
};

let media = {
  "width>=500&&width<=1000":{
    "header":{
      width: 1000
    },
    "main":{
      fontSize: 40
    },
  },
};



// 媒体查询
width = parseFloat((width * pixelRatio).toFixed(2));
for(let k in media){
  if(eval(k)){
    for(let j in media[k]){
      styles[j] = Object.assign(styles[j] || {}, media[k][j]);
    }
  }
}


// 适配
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
