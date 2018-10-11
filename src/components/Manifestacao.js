import React, { Component } from 'react';
import { Alert, AppRegistry, StyleSheet, View , Text, TextInput, Button, Image, ScrollView, Keyboard,TouchableOpacity,AsyncStorage } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import RNFetchBlob from 'rn-fetch-blob'

export default class Manifestacao extends Component {
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
    Keyboard.dismiss()
    AsyncStorage.getItem("token").then((val) => {
      this.setState({token: val})
    }).done()
  }

  componentWillMount(){
    this.props.navigation.state.params.spinner(false)
    setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
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
    const manifestacao = state.params.manifestacao
    const respostaFinal = state.params.respostaFinal
    const encaminhamentos = state.params.encaminhamentos.map((enc, index) => (
      <View style={{elevation: 2, padding: "3%", borderWidth: 0, marginTop: 10, marginBottom: 10}} key={index}>
        <Text style={styles.manifestacao}><Text style={styles.texto}>Data:</Text> {this.formatarData(enc.created_at)}</Text><View style={styles.linhaText} />
        <Text style={styles.manifestacao}><Text style={styles.texto}>Remetente:</Text> {enc.remetenteNome}</Text><View style={styles.linhaText} />
        <Text style={styles.manifestacao}><Text style={styles.texto}>Responsável:</Text> {enc.responsavelNome}</Text><View style={styles.linhaText} />
        <Text style={styles.manifestacao}><Text style={styles.texto}>Destinatário:</Text> {enc.destinatarioNome}</Text>
        { enc.destinatario.unidade_id != 3 &&
        <View>
          <View style={styles.linhaText} />
          <Text style={styles.manifestacao}><Text style={styles.texto}>Prazo até:</Text> {this.formatarData(enc.dataResposta)}</Text>
        </View>
        }
      </View> 
      ))
    return (
      <ScrollView style={styles.container}>
        <View style={styles.center}>
          <View style={styles.informacoes}>
            <Text style={styles.titulo}>Informações</Text><View style={styles.linhaTitulo} />
            <View style={styles.containerInformacoes}>
              <Text style={styles.manifestacao}><Text style={styles.texto}>Código:</Text> {manifestacao.codigo}</Text><View style={styles.linhaText} />
              <Text style={styles.manifestacao}><Text style={styles.texto}>Data:</Text> {this.formatarDataCompleta(manifestacao.date)}</Text><View style={styles.linhaText} />
              <Text style={styles.manifestacao}><Text style={styles.texto}>Categoria:</Text> {manifestacao.cat_nome}</Text><View style={styles.linhaText} />
              <Text style={styles.manifestacao}><Text style={styles.texto}>Unidade:</Text> {manifestacao.u_nome}</Text><View style={styles.linhaText} />
              <Text style={styles.manifestacao}><Text style={styles.texto}>Assunto:</Text> {manifestacao.ast_nome}</Text><View style={styles.linhaText} />
              {manifestacao.envolvidos != 0 &&
                (<View><Text style={styles.manifestacao}><Text style={styles.texto}>Envolvidos:</Text> {manifestacao.envolvidos}</Text><View style={styles.linhaText} /></View>)
              }
              {manifestacao.manifestacaoAnterior != 0 &&
                (<View><Text style={styles.manifestacao}><Text style={styles.texto}>Manifestação anterior:</Text> {manifestacao.manifestacaoAnterior}</Text><View style={styles.linhaText} /></View>)
              }
              {manifestacao.local_formatado != null &&
                (<View><Text style={styles.manifestacao}><Text style={styles.texto}>Local da ocorrência:</Text> {manifestacao.local_formatado}</Text><View style={styles.linhaText} /></View>)
              }
              {manifestacao.token &&
                (<View><TouchableOpacity style={styles.arquivosAdicionados} onPress={() => this.download(manifestacao.anexo_id)}>
                  <Text style={{marginBottom: "2%",position: 'absolute',left: 5, width:"70%", fontSize: 18, color: '#424242'}}>{manifestacao.anexo.nome}</Text>
                  <View style={{height: 28, width:28,position: 'absolute',right: 5}}>
                      <Icon name="download" size={28}/>
                  </View>
                </TouchableOpacity>
                <View style={styles.linhaText} />
                </View>
                )
              }
              <Text style={styles.manifestacao}><Text style={styles.texto}>Descrição:</Text> {manifestacao.descricao}</Text>
            </View>
          </View>
          {encaminhamentos.length > 0 &&
            <View style={styles.informacoes}>
              <View><Text style={styles.titulo}>Encaminhamentos ( { encaminhamentos.length } )</Text><View style={styles.linhaTitulo} /></View>
              {encaminhamentos}
            </View>
          }
          {respostaFinal != "" &&
            <View style={styles.informacoes}> 
              <Text style={styles.titulo}>Resposta Final</Text><View style={styles.linhaTitulo} />
              <View style={styles.containerInformacoes}>
                <Text style={styles.manifestacao}><Text style={styles.texto}>Data:</Text> {this.formatarData(respostaFinal.created_at)}</Text><View style={styles.linhaText} />
                <Text style={styles.manifestacao}><Text style={styles.texto}>Responsável:</Text> {respostaFinal.responsavelNome}</Text><View style={styles.linhaText} />
                <Text style={styles.manifestacao}><Text style={styles.texto}>Tratamento:</Text> {respostaFinal.tratamento}</Text>
              </View>
            </View>
          }
        </View>
        
      </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C3E50',
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
    padding: "2%",
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
  containerInformacoes:{
    padding: "3%",
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

})