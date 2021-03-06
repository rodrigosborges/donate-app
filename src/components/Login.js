import React, { Component } from 'react';
import { StatusBar,Alert, AppRegistry, StyleSheet, View , Text, TextInput, Button, Image,ScrollView, ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import Modal from 'react-native-modal'
import { TextField } from 'react-native-material-textfield';
import Icon from 'react-native-vector-icons/FontAwesome'
import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      email: "",
      password: "",
      spinner: false,
    };
  }

  validaEmail(){
    if(this.state.email == "" || this.state.email.indexOf('@')==-1 || this.state.email.indexOf('.')==-1){
      this.setState({emailErro: "Insira um e-mail válido."})
      return false
    }
    return true
  }

  logar(){
    const { navigate } = this.props.navigation;
    const { goBack } = this.props.navigation;
    fetch('http://donate-ifsp.ga/app/logarUsuario', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
      })
    }).then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.nome){
        AsyncStorage.multiSet([['email', this.state.email],['password', this.state.password],['nome', responseJson.nome], ['id',JSON.stringify(responseJson.id)]])
        this.props.navigation.state.params.atualiza(this.state.email, this.state.password)
        this.props.navigation.goBack()
        this.spinner(false)
      }else{
        Alert.alert(
          'ERRO',
          "E-mail ou senha incorretos",
        );
        this.spinner(false)
      }
    })
    .catch((error) => {
      Alert.alert(
        'Sem conexão',
        'Verifique sua conexão com a internet',
      );
      this.spinner(false)
    });
  }

  spinner(bol){
    this.setState({spinner: bol})
  }

  render() {

    const { navigate } = this.props.navigation;
    const { goBack } = this.props.navigation;
    const { dispatch } = this.props.navigation;
    
    return (
        <View style={styles.container}>

            <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
            <View style={styles.login}>
              {/* <Image resizeMode="stretch" source={require("./../logo.png")} style={styles.logo} /> */}
              <View style={styles.loginContent}>
                <TextField textColor="#E0E0E0" error={this.state.emailErro} tintColor="#E0E0E0" baseColor="#E0E0E0" keyboardType="email-address" style={styles.input} label="E-mail" value={this.state.email} autoCapitalize="none" onChangeText={(email) => this.setState({email})}/>
                <TextField textColor="#E0E0E0" error={this.state.senhaErro} tintColor="#E0E0E0" autoCapitalize="none" baseColor="#E0E0E0" style={styles.input} label="Senha" value={this.state.password} onChangeText={(password) => this.setState({password})} secureTextEntry={true}/>
                <TouchableOpacity style={styles.esqueceuSenha} onPress={() => {dispatch(NavigationActions.navigate({routeName: 'EsqueceuSenha', key: '1234'}))}}>
                  <Text style={[styles.textoLogin, {fontSize: 14, textAlign: 'right'}]}>Esqueceu sua senha?</Text>
                </TouchableOpacity>
                <View style={styles.cadastrar}>
                  <Button onPress={() => {this.spinner(true),this.logar()}} title="LOGAR" color="#660000" />
                </View>

                <TouchableOpacity style={styles.containerMensagem} onPress={() => {this.spinner(true),setTimeout(() => dispatch(NavigationActions.navigate({routeName: 'Cadastro', key: '1234',params:{spinner: this.spinner.bind(this)}})),1)}}>
                  <Text style={styles.textoLogin}>Clique aqui para se cadastrar</Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
    );
  }
}

let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
  botaoVoltar:{
    position: 'absolute',
    left: width*0.01,
    top: height*0.04,
    height:width*0.18,
    width:width*0.18,
    borderRadius: width*0.1,
    alignItems: "center",
    justifyContent: "center",
  },
  mensagemAlerta: {
    fontSize: 22,
    fontWeight: "bold",
    textAlignVertical: 'center', 
  },
  header:{
      height: height*0.08,
      borderBottomWidth: 1,
      borderColor: "#E0E0E0",
  },
  successError:{
      height: "100%",
      justifyContent: "center",
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      alignItems: 'center',    
  },
  successError: {
      height: "100%",
      justifyContent: "center",
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      alignItems: 'center',    
  },
  loginContent:{
    paddingLeft: 20, 
    paddingRight: 20, 
    width:"80%",
    backgroundColor: "#800000",
  },
  cadastrar: {
    width: '50%',
    marginTop: '5%',
    marginLeft: "25%",
    marginBottom: '5%',
  },
  login:{
    flex: 1,
    alignItems : 'center',
    justifyContent: "center",
  },
  textfieldWithFloatingLabel: {
    height: 60,
    marginTop: 10,
    width:'60%',
  },
  container: {
    flex:1,
    backgroundColor: '#660000',
    overflow: 'hidden',
  },

  telaPrincipal:{
    flex:1,
    backgroundColor: '#800000',
  },
  texto:{
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },  
  fundo: {
    width: null,
    height: null,
    flex:1 ,
  }, 
  logo:{
    width: width*0.35,
    height: height*0.25,
  },
  modalContent: {
    backgroundColor: "white",
    justifyContent: "center",
    borderRadius: 15,
    borderColor: "grey",
    width: width*0.8,
    marginLeft: width*0.05,

    height: height*0.38,
  },
  modalMensagem: {
      height: height*0.22,
      width: width*0.8,
  },
  modalButton: {
      backgroundColor:"#E0E0E0",
      justifyContent: "center",
      alignItems: "center",
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,    
      borderColor: "rgba(0, 0, 0, 0.1)",
      height: height*0.08,
  },
  icone: {
    position: 'absolute',
    left: "5%",
  },
  textoLogin:{
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  containerMensagem:{
    width: "100%",
    justifyContent: 'center',
    paddingBottom: 15,
  },
  esqueceuSenha:{
    width: "100%",
    padding: 5,
  },
})