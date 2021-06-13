import * as React from 'react';
import { StyleSheet } from 'react-native';

import { View } from './layout/Themed';
import { Image } from 'react-native'

export default function Arrow(props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/arrow.png')}
        style={[styles.arrow, {transform: [{ rotate: props.heading + 'deg' }]}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: 160,
    height: 160,
  },
  container: {
    flex: 1,
    marginTop: '30%',
    alignItems: 'center',
  }
});
