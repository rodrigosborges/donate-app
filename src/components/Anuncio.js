import React, { Component } from 'react';
import { Alert, BackHandler, AppRegistry, StyleSheet, View , Text, TextInput, Button, Image, ScrollView, Keyboard,TouchableOpacity,AsyncStorage, Dimensions, TouchableHighlight } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import RNFetchBlob from 'rn-fetch-blob'
import ImageSlider from 'react-native-image-slider';
import { Header } from 'react-navigation';

export default class Anuncio extends Component {
  constructor(props){
    super(props);
    this.state = {
      post: null,
      seila: null,
      codigo: null,
      erro: null,
      token: null,
      imagemFull: false,
    };
  }

  componentWillMount(){
    this.props.navigation.setParams({hideHeader: {backgroundColor: "green"}})
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if(this.state.imagemFull){
        this.setState({imagemFull: false})
        this.props.navigation.setParams({hideHeader: false})
        return true
      }
    });
  }

  formatarDataCompleta(data){
    return (data.substring(8,10) + '/' + data.substring(5,7) + '/' +  data.substring(0,4) + " " + data.substring(11,16)) 
  }      
  
  static navigationOptions = ({ navigation }) => {

    if (navigation.state.params.hideHeader == true) {
      return {
        header: null,
      }
    }
  };
  
  render() {
    const {state} = this.props.navigation
    const anuncio = state.params.anuncio
    return (
      <View style={{flex:1}}>
        {this.state.imagemFull && 
          <View style={{flex: 1}}>
            <ImageSlider resizeMode={"contain"} style={styles.imagemFull}
              images={anuncio.imagens}
            />
            <TouchableOpacity onPress={() => {this.setState({imagemFull: false}),this.props.navigation.setParams({hideHeader: false})}} style={styles.buttonClose}>
              <Icon name="times" size={35} color="white" />
            </TouchableOpacity>   
          </View>   
        }
        {!this.state.imagemFull && 
        <ScrollView style={styles.container}>
          <ImageSlider style={styles.imagem}
            images={anuncio.imagens}
            onPress={() => {this.setState({imagemFull: true}), this.props.navigation.setParams({hideHeader: true})}}
          />
          {!this.state.imagemFull && 
          <View style={styles.containerInformacoes}>
            <Text style={styles.titulo}>{anuncio.titulo}</Text>
            <Text style={styles.anuncio}><Icon size={14} name="clock"/> {this.formatarDataCompleta(anuncio.data)}</Text>
            <View style={styles.linhaText} />
            <Text style={styles.anuncio}><Icon style={{marginRight: 15}} name="map-marker-alt" size={18} color="black" /> {anuncio.bairroNome+", "+anuncio.cidadeNome}</Text>
            <View style={styles.linhaText} />
            <Text style={styles.anuncio}><Text style={styles.texto}>Categoria:</Text> {anuncio.categoriaNome}</Text>
            <View style={styles.linhaText} />
            <Text style={styles.anuncio}>{anuncio.descricao}</Text>
          </View>
          } 
        </ScrollView>}
      </View>
    );
  }
}
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1
  },
  containerInformacoes:{
    padding:"2%"
  },
  anuncio:{
    marginTop: 5,
    fontSize: 18,
    color: 'black',
  },  
  titulo:{
    marginTop: 15,
    fontSize:  25,
    fontWeight: 'bold',
    color: '#424242',
  },
  linhaTitulo:{
    borderWidth: 0,
    height:1,
    elevation: 3,
    marginBottom: "2%",
  },
  linhaText:{
    borderWidth: 0,
    height:1,
    elevation: 1,
    marginTop: "2%",
    marginBottom: "1%",
  },
  center: {
    alignItems: 'center',
  },
  texto: {
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  imagem:{
    width: "100%",
    height: height*0.4,
  },
  imagemFull:{
    width: "100%",
    height: height,
  },
  titulo:{
    fontWeight: 'bold',
    fontSize: 22,
    color: 'black',
  },
  buttonClose:{
    position: "absolute",
    top: 15,
    right: 15,
    height: 40,
    width:40,
    borderRadius:20,
    alignItems: 'center',
    justifyContent: 'center',
  },

})