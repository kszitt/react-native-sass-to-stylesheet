import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');


const styleSheet = StyleSheet.create(styles);

export default styleSheet;
