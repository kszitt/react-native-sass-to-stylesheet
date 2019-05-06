import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

function getAdaptation(num){
  let unitWidth = width / 1080; // 1080 => UI设计图的宽度
  return parseFloat((num*unitWidth).toFixed(2));
}

let styles = {
  header: {
    shadowOffset: {
      width: getAdaptation(10),
      height: getAdaptation(10)
    },
    shadowRadio: getAdaptation(5),
    shadowColor: "#888888"
  }
};
let media = {
  "width>=500": {
    header: {
      color: "white"
    }
  }
};

// 媒体查询
(function addMedia(){
  for(let k in media){
    if(eval(k)){
      for(let j in media[k]){
        styles[j] = Object.assign(styles[j] || {}, media[k][j]);
      }
    }
  }
}());

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
