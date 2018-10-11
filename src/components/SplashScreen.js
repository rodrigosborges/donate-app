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

        AsyncStorage.multiGet(['email','password']).then((values) => {
            this.setState({email: values[0][1]})
            this.setState({password: values[1][1]})
        })
    
        let that = this;
        var images = [
            [require("./../images/tema1.jpg"),require("./../logo1.png")],
            [require("./../images/tema2.jpg"),require("./../logo2.png")],
            [require("./../images/tema3.jpg"),require("./../logo1.png")]
        ]
        var num = Math.floor(Math.random()*images.length);
        this.setState({fundo: images[num][0], logo: images[num][1]})
        setTimeout(function(){that.verificar()}, 1000);
    }

    selecionaImagem(){
        
    }


    verificar=()=>{
        const { navigate } = this.props.navigation
        fetch('http://192.168.11.51/ouvidoria/app/checkarAuth', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            email: this.state.email,
            password: this.state.password,
            }),
        }).then((response) => response.json())
        .then((responseJson) => {
                if(responseJson == true){
                    this.props.navigation.dispatch({
                        type: 'Navigation/RESET',
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Menu', params:{fundo: this.state.fundo,logo: this.state.logo} })],
                    });
                }else{
                    this.props.navigation.dispatch({
                        type: 'Navigation/RESET',
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Home' , params:{fundo: this.state.fundo, logo: this.state.logo}})],
                    });
                }
        })
        .catch((error) => {
            const resetAction = NavigationActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Home',params:{fundo: this.state.fundo, logo: this.state.logo} })],
            });
            
            this.props.navigation.dispatch(resetAction);
        });
    }

    render() {
        return (
            <View style={styles.telaPrincipal}>
                <View style={[styles.container]}>
                    <View style={styles.center}>
                        <Image resizeMode="stretch" source={logo} style={styles.logo}></Image>
                        <Text style={styles.text}>Prefeitura Municipal da Estância</Text>
                        <Text style={styles.text}>Balneária de Caraguatatuba</Text>
                    </View>
                    <View style={{marginTop: 50}}>
                        <ActivityIndicator size="large" color="white" />
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
        backgroundColor: '#2C3E50',
    },
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    logo: {
        width: width*0.45,
        height: height*0.28,
        backgroundColor: '#2C3E50',
        marginBottom: 20, 
    },
    text: {
        color: 'white',
        fontSize: 20,
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    }
})