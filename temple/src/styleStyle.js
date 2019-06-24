import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

function getAdaptation(num){
  let unitWidth = width / 1080; // 1080 => UI设计图的宽度
  return parseFloat((num*unitWidth).toFixed(2));
}

let styles = {
  header: {
    width: getAdaptation(100),
    color: "red",
    fontSize: getAdaptation(12)
  }
};

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
