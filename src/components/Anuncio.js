import React, { Component } from 'react';
import { Alert, AppRegistry, StyleSheet, View , Text, TextInput, Button, Image, ScrollView, Keyboard,TouchableOpacity,AsyncStorage, Dimensions } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import RNFetchBlob from 'rn-fetch-blob'

export default class Anuncio extends Component {
  constructor(props){
    super(props);
    this.state = {
      post: null,
      seila: null,
      codigo: null,
      erro: null,
      token: null,
    };
  }

  componentDidMount(){
  }

  componentWillMount(){
    // this.props.navigation.state.params.spinner(false)
    // setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
  }

  formatarData(data){
    return (data.substring(8,10) + '/' + data.substring(5,7) + '/' +  data.substring(0,4)) 
  }

  formatarDataCompleta(data){
    return (data.substring(8,10) + '/' + data.substring(5,7) + '/' +  data.substring(0,4) + " " + data.substring(11,19)) 
  }

  download(anexo_id){
    RNFetchBlob.config({
      addAndroidDownloads : {
          useDownloadManager : true, // <-- this is the only thing required
          // Optional, override notification setting (default to true)
          notification : true,
          // Optional, but recommended since android DownloadManager will fail when
          // the url does not contains a file extension, by default the mime type will be text/plain
          mime : 'application/zip',
          description : 'Download do arquivo da manifestação.'
      }
    })
    .fetch('GET', 'http://192.168.11.51/ouvidoria/app/anexo/'+anexo_id+"?token="+this.state.token)
  }

  
  
  render() {
    const {state} = this.props.navigation;
    const anuncio = state.params.anuncio
    return (
      <ScrollView style={styles.container}>
        <View style={styles.containerInformacoes}>
          <Image source={{uri: "http://192.168.11.51/donate/storage/app/anuncio_"+anuncio.id+"/DonateImage_0.png?time=" + new Date()}} style={styles.imagem}/>
          <Text style={styles.titulo}> {anuncio.titulo}</Text>
          <Text style={styles.manifestacao}> {this.formatarDataCompleta(anuncio.created_at)}</Text>
          <View style={styles.linhaText} />
          <Text style={styles.manifestacao}> <Icon style={{marginRight: 15}} name="map-marker-alt" size={18} color="black" /> {anuncio.bairroNome+", "+anuncio.cidadeNome}</Text>
          <View style={styles.linhaText} />
          <Text style={styles.manifestacao}> <Text style={styles.texto}>Categoria:</Text> {anuncio.categoriaNome}</Text>
          <Text style={styles.manifestacao}> <Text style={styles.texto}>Descrição:</Text> {anuncio.descricao}</Text>
          <Text style={styles.manifestacao}> <Text style={styles.texto}>Doador:</Text> {anuncio.usuarioNome}</Text>
        </View>
      </ScrollView>
    );
  }
}
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1
  },
  manifestacao:{
    marginTop: 5,
    fontSize: 18,
    color: '#424242',
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
    marginBottom: "2%",
  },
  center: {
    alignItems: 'center',
  },
  informacoes:{
    marginTop: "5%",
    marginBottom: '5%',
    width: "100%",
    backgroundColor: 'white',
    borderRadius:10,
    elevation: 10,
    padding: "2%",
  },
  texto: {
    fontWeight: 'bold',
    textAlign: 'justify',
  },
  arquivosAdicionados: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#424242",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "2%",
    flexDirection: 'row',
    width: "100%",
    height: 45,
  },
  imagem:{
    width: "100%",
    height: height*0.4,
  },
  titulo:{
    fontWeight: 'bold',
    fontSize: 22,
    color: 'black',
  }

})