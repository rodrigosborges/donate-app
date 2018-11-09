import React, { Component } from 'react';
import { Alert, BackHandler, AppRegistry, StyleSheet, View , Text, StatusBar, TextInput, Button, Image, ScrollView, Keyboard,TouchableOpacity,AsyncStorage, Dimensions, TouchableHighlight } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import RNFetchBlob from 'rn-fetch-blob'
import ImageSlider from 'react-native-image-slider';
import { Header } from 'react-navigation';
import Stars from 'react-native-stars';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';

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
      id: null,
      nivel: 0,
    };
  }

  componentDidMount(){
    var that = this
    setTimeout(function(){that.carregarHeader()}, 1)  
    AsyncStorage.getItem('id').then((id) => {
      this.setState({id: JSON.parse(id)})
    })
  }

  componentWillMount(){
    this.props.navigation.setParams({hideHeader: {backgroundColor: "green"}})
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if(this.state.imagemFull){
        this.setState({imagemFull: false})
        this.props.navigation.setParams({hideHeader: false})
        StatusBar.setHidden(false)
        return true
      }
    });
  }

  carregarHeader(){
    if(this.state.id != this.props.navigation.state.params.anuncio.doador_id){
      this.props.navigation.setParams({ 
        headerRight: (
          <TouchableOpacity onPress={() => {this.chat()}}>
              <Icon style={{marginRight: 15}} name="comments" size={30} color="white" />
          </TouchableOpacity>
        )
      })
    }
  }

  formatarDataCompleta(data){
    return (data.substring(8,10) + '/' + data.substring(5,7) + '/' +  data.substring(0,4) + " " + data.substring(11,16)) 
  } 
  
  chat(){
    
  }
  
  static navigationOptions = ({ navigation }) => {
    if (navigation.state.params.hideHeader == true) {
      return {
        header: null,
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>
      }
    }else{
      return {
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>
      }
    }
  };

  avaliar(nivel){
    this.setState({nivel})
    fetch('http://192.168.11.51/donate/avaliacoes/avaliar?avaliador_id='
    +this.state.id+'&avaliado_id='
    +this.props.navigation.state.params.anuncio.doador_id+'&nivel='
    +nivel, {
    method: 'GET',
    }).catch((error) => {
        Alert.alert("Sem conexão", 'Verifique sua conexão com a internet')
    });
  }
  
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
            <TouchableOpacity onPress={() => {StatusBar.setHidden(false),this.setState({imagemFull: false}),this.props.navigation.setParams({hideHeader: false})}} style={styles.buttonClose}>
              <Icon name="times" size={35} color="white" />
            </TouchableOpacity>   
          </View>   
        }
        {!this.state.imagemFull && 
        <ScrollView style={styles.container}>
          <ImageSlider style={styles.imagem}
            images={anuncio.imagens}
            onPress={() => {this.setState({imagemFull: true}),StatusBar.setHidden(true), this.props.navigation.setParams({hideHeader: true})}}
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
            <Text style={styles.anuncio}><Text style={styles.texto}>Doador:</Text> {anuncio.usuarioNome}</Text>
            <View style={styles.linhaText} />
            <Text style={styles.anuncio}>{anuncio.descricao}</Text>
            {this.state.id != anuncio.doador_id && 
              <View style={{width: "100%", alignItems: 'center', justifyContent: 'center', height: 120}}>
                {this.state.nivel == 0 &&
                  <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text>Avalie este doador!</Text>
                    <Stars
                      count={5}
                      half={false}
                      fullStar={<Icon2 name={'star'} size={45} style={[styles.myStarStyle]}/>}
                      emptyStar={<Icon2 name={'star-outline'} size={45} style={[styles.myStarStyle, styles.myEmptyStarStyle]}/>}
                      update={(nivel) => setTimeout(() => this.avaliar(nivel), 500)}
                    />
                    </View>
                  }
                {this.state.nivel != 0 && 
                  <View>
                    <Text style={{textAlign: 'center'}}>Você avaliou este doador com {this.state.nivel} estrelas!</Text>
                    <TouchableOpacity onPress={() => this.setState({nivel: 0})}>
                      <Text style={{color: "blue",textAlign: 'center'}}>Clique aqui para mudar a sua avaliação.</Text>
                    </TouchableOpacity>
                  </View>
                }
              </View>
            }
          </View>
          } 
        </ScrollView>}
      </View>
    );
  }
}
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
  myStarStyle: {
    color: 'gold',
    backgroundColor: 'transparent',
    textShadowColor: 'black',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  myEmptyStarStyle: {
    color: 'white',
  },
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
    height: height*0.5,
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
  chat:{
    width: "50%",
    marginLeft: "25%",
    height: 50,
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#800000",
    borderRadius: 20
  },
})