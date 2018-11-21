import React, { Component } from 'react'
import { StatusBar, Alert, ActivityIndicator, AppRegistry, StyleSheet, View , Text, Button, Image,ReactNative, Dimensions, AsyncStorage } from 'react-native'
import logo from './../brasao.png'
import { NavigationActions } from 'react-navigation'

export default class SplashScreen extends Component {
    constructor(props){
        super(props);
        this.state = {
            email: null,
            password: null,
            timePassed: false,
            fundo: null,
            logo: null
        };
    }
  
    componentDidMount() {
        StatusBar.setHidden(true)
    }
    
    componentWillMount(){
        setTimeout(() => {
            this.props.navigation.dispatch({
                type: 'Navigation/RESET',
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Menu'})],
            });
        }
        ,1000)
    }

    render() {
        return (
            <View style={styles.telaPrincipal}>
                <View style={[styles.container]}>
                    <View style={styles.center}>
                        <Image resizeMode="stretch" source={logo} style={styles.logo}></Image>
                        <Text style={[styles.donate]}>Donate</Text>
                    </View>
                    <View style={{marginTop: 50}}>
                        <ActivityIndicator size="large" color="#800000" />
                    </View>
                </View>
            </View>
        );
    }
}
var height = Dimensions.get('window').height;
var width = Dimensions.get('window').width;
const styles = StyleSheet.create({

    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    telaPrincipal:{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#dfe1e2',
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    logo: {
        width: width*0.45,
        height: height*0.28,
        backgroundColor: '#dfe1e2',
        marginBottom: 20, 
    },
    text: {
        color: 'white',
        fontSize: 20,
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    donate: {
        fontFamily: 'Admiration Pains',
        color: '#800000',
        fontSize: 50,
    }
})