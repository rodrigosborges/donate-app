import React, { Component } from 'react';
import { Alert, AppRegistry, StyleSheet, View , Text, TextInput, Button,Dimensions, AsyncStorage, Image,ScrollView, ReactNative, ImageBackground } from 'react-native';
import { TextField } from 'react-native-material-textfield'
import { NavigationActions } from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Consulta extends Component {
  constructor(props){
    super(props);
    this.state = {
      manifestacao: null,
      seila: null,
      codigo: "",
      erro: null,
      token: null,
      spinner: false,
    };
  }

  componentDidMount(){
    AsyncStorage.getItem("token").then((val) => {
      this.setState({token: val})
    }).done()
  }

  componentWillMount(){
    setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
  }
  
  pesquisar() {
    this.spinner(true)
    var nav = this.props.navigation
    fetch(`http://192.168.11.51/ouvidoria/app/pesquisaManifestacao?codigo=`+this.state.codigo+"&token="+this.state.token, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
    .then((responseJson) => {
      if(responseJson.manifestacao != ""){
        var manifestacao = responseJson.manifestacao
        manifestacao.descricao = manifestacao.descricao.replace(new RegExp("<br />", 'g'), "")
        manifestacao.envolvidos = manifestacao.envolvidos.replace(new RegExp("<br />", 'g'), "")
        var encaminhamentos = responseJson.encaminhamentos
        var respostaFinal = responseJson.respostaFinal
        if(respostaFinal != "")
          respostaFinal.tratamento = respostaFinal.tratamento.replace(new RegExp("<br />", 'g'), "")
        nav.dispatch(NavigationActions.navigate({routeName: 'Manifestacao', key: 'editar', params: {manifestacao, encaminhamentos,respostaFinal, spinner: this.spinner.bind(this)}}))
      }else{s
        Alert.alert('Manifestação não encontrada')
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  mascaraCodigo(codigo){
    codigo = codigo.replace(/[^0-9]/g, '');
    this.setState({codigo},() => {
        if(codigo.length>3)
          codigo = codigo.substring(0,3)+"."+ codigo.substring(3,15)
        if(codigo.length>7)
          codigo = codigo.substring(0,7)+"."+ codigo.substring(7,15)
        if(codigo.length>11)
          codigo = codigo.substring(0,11)+"."+ codigo.substring(11,14)
        this.setState({codigo})
    })
  }

  spinner(bol){
    this.setState({spinner: bol})    
  }
  
  render() {
    return (
      <View style={styles.container}>
        <ImageBackground style={styles.fundo} blurRadius={1} source={this.props.navigation.state.params.fundo} >
          <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
          <View style={styles.blur}>
            <View style={styles.pesquisa}>
              <View style={styles.header}>
                <Text style={styles.manifestacao}>Consultar manifestação</Text>
              </View>
              <View style={styles.body}>
                <View style={styles.inputContainer}>
                  <TextField maxLength={15} labelTextStyle={styles.input} error={this.state.codigoErro} onChangeText={(codigo) => {this.mascaraCodigo(codigo)}} value={this.state.codigo} style={styles.input} label={"Código da manifestação"} keyboardType={"numeric"}/>
                </View>
                <Button title="Buscar" onPress={() => this.pesquisar()} color="green" />
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

let width = Dimensions.get('window').width
let height = Dimensions.get('window').height

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#2C3E50',
    overflow: 'hidden',
  },
  texto:{
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold'
  },  
  manifestacao:{
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold'
  },
  inputContainer:{
    width: "80%",
    marginBottom: 10,
  },
  input:{
    textAlign: 'center',
  },
  fundo: {
    width: null,
    height: null,
    flex:1 ,
  },
  blur:{
    backgroundColor: "rgba(255, 255, 255, 0.5)", 
    height: "100%", 
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  pesquisa:{
    height: height*0.4,
    width: width*0.8,
    borderRadius: 10,
    elevation: 15,
    borderRadius: 10,
  },
  header:{
    height: "25%",
    backgroundColor: "rgba(44, 62, 80, 1)",
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  body:{
    height: "75%",
    backgroundColor: "rgba(255, 255, 255, 1)", 
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
})