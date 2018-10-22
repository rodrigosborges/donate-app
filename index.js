import React, { Component } from 'react';
import { AppRegistry, Dimensions } from 'react-native';
import { DrawerNavigator } from 'react-navigation';

import SideMenu from './src/components/SideMenu'
import stackNav from './App';
import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings(['Warning']);
console.disableYellowBox = true;
global.___DEV___ = false

const drawernav = DrawerNavigator({
  Item1: {
      screen: stackNav,
    }
  }, {
    contentComponent: SideMenu,
    drawerWidth: Dimensions.get('window').width - 120,  
});

AppRegistry.registerComponent('donate', () => drawernav);