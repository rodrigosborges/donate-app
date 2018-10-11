import React, { Component } from 'react';
import { StatusBar,Alert, AppRegistry, StyleSheet, View , Text, TextInput, Button, Image,ScrollView, ReactNative, AsyncStorage, TouchableHighlight, Dimensions, ImageBackground } from 'react-native';
import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
        email: null,
        password: null,
        isVisible: false,
        spinner: false,
        visible: false,
    };
  }

  componentDidMount(){
    StatusBar.setHidden(false)
  }

  logar(){
    const { navigate } = this.props.navigation;
    const { goBack } = this.props.navigation;
    fetch('http://192.168.11.51/ouvidoria/app/loginUsuario', {
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
        AsyncStorage.setItem('email', this.state.email)
        AsyncStorage.setItem('password', this.state.password)
        navigate('Contatos')
      }else{
          this.setState({isVisible:true})
      }
    })
    .catch((error) => {
      console.error(error);
    });

  }

  logar(){
    const { navigate } = this.props.navigation
    navigate('Login')
  }

  cadastrar(){
    const { navigate } = this.props.navigation
    navigate('Cadastro')
  }

  spinner(bol){
    this.setState({spinner: bol})
  }

  render() {
    const { dispatch } = this.props.navigation;
    return (
        <View style={styles.container}>
            <ImageBackground resizeMode="stretch" style={styles.fundo} source={this.props.navigation.state.params.fundo} >
              <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />

              <Image resizeMode="stretch" source={this.props.navigation.state.params.logo} style={styles.logo} />

              <View style={{marginTop: '50%'}}>
              
                <TouchableHighlight underlayColor="rgba(179, 179, 179, 0.7)" style={styles.botao} onPress={() => {dispatch(NavigationActions.navigate({routeName: 'Login', key: '123', params:{fundo: this.props.navigation.state.params.fundo, logo: this.props.navigation.state.params.logo}}))}}>
                  <View style={styles.botaologar}>
                    <Text style={{color: "white", fontWeight: "bold"}}>LOGAR</Text>
                  </View>
                </TouchableHighlight>

                <TouchableHighlight style={styles.botao} underlayColor="rgba(77, 166, 255, 0.7)" onPress={() => {this.spinner(true), setTimeout(() => dispatch(NavigationActions.navigate({routeName: 'CadastroManifestacao', key: '123',params:{spinner: this.spinner.bind(this)}})),1)}}>
                  <View style={styles.botaocadastrar}>
                    <Text style={{color: "white", fontWeight: "bold"}}>MANIFESTAR</Text>
                  </View>
                </TouchableHighlight>
                
              </View>
            </ImageBackground>
        </View>
    );
  }
}

var height = Dimensions.get('window').height;
var width = Dimensions.get('window').width;
const styles = StyleSheet.create({

  container: {
    flex:1,
    backgroundColor: '#2C3E50',
    overflow: 'hidden',
  },

  telaPrincipal:{
    flex:1,
    backgroundColor: '#2C3E50',
  },
  texto:{
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },  
  fundo: {
    width: "100%",
    height: "100%",
    flex:1 ,
  }, 
  logo:{
    width: '80%',
    height: '20%',
    marginLeft: '10%',
    marginTop: '30%',
    resizeMode: 'contain'
  },
  botao: {
    marginTop: '10%',
    height: height*0.07,
    width: '80%',
    marginLeft: '10%',
  },
  botaologar: {
    height: height*0.07,
    width: width*0.8,
    backgroundColor: "rgba(179, 179, 179, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  botaocadastrar: {
    height: height*0.07,
    width: width*0.8,
    backgroundColor: "rgba(77, 166, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    borderColor: "grey",
    width: '80%',
    marginLeft: '5%',

    height: '50%',
  },
  bottomModal: {
    justifyContent: "flex-end",
    margin: 0
  }
})