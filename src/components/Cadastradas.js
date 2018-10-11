import React, { PureComponent } from 'react'
import { Alert, Dimensions, AppRegistry, StyleSheet, View, Text, Button, ScrollView, ReactNative, AsyncStorage, TouchableHighlight } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions } from 'react-navigation';

export default class Cadastro extends PureComponent {
    constructor(props){
    super(props);
        this.state = {
            manifestacoes: [],
            spinner: false,
        };  
    }

    componentDidMount(){
        this.setState({manifestacoes: this.props.navigation.state.params.manifestacoes})
    }

    componentWillMount(){
        this.props.navigation.state.params.spinner(false)
        setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
    }

    formatarData(data){
        data = data.substring(0,10)
        return (data.substring(8,10) + '/' + data.substring(5,7) + '/' +  data.substring(0,4))
    }

    verManifestacao(codigo) {
        this.spinner(true)
        const { navigate } = this.props.navigation
        
        fetch(`http://192.168.11.51/ouvidoria/app/pesquisaManifestacao?codigo=`+codigo, {
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
                var encaminhamentos = responseJson.encaminhamentos
                var respostaFinal = responseJson.respostaFinal
                if(respostaFinal != "")
                    respostaFinal.tratamento = respostaFinal.tratamento.replace(new RegExp("<br />", 'g'), "")
                    this.props.navigation.dispatch(NavigationActions.navigate({
                        routeName: 'Manifestacao', 
                        key: 'manifestacao',
                        params:{
                            manifestacao, 
                            encaminhamentos, 
                            respostaFinal,
                            spinner    : this.spinner.bind(this)
                        }
                    }));
              }else{
                Alert.alert('Manifestação não encontrada')
              }
        })
        .catch((error) => {
          Alert.alert("Algo deu errado")
        });
    
      }

    manifestacoes(){
        const manifestacoes = [];
        let i = 1;
        if(this.state.manifestacoes.length > 0){
            this.state.manifestacoes.map((manifestacao) => {(
                manifestacoes.push(
                    <View key={i++} style={{ alignItems: 'center', marginBottom: "10%"}}>
                        <View style={[styles.manifestContainer, {borderLeftColor: manifestacao.status_id > 4 ? "green" : "red"}]}>
                            <View style={{flex:1, flexDirection: 'column',justifyContent: "space-between",marginBottom:"6%"}}>
                                <View style={styles.containerTitulo}>
                                    <Text style={styles.titulo}>{manifestacao.codigo}</Text>
                                </View>
                                <Text style={[styles.containerInformacoes]}>
                                    <Text style={styles.texto}>Assunto: </Text>
                                    <Text style={styles.informacoes}>{manifestacao.assunto_nome}</Text>
                                </Text>
                                <Text style={[styles.containerInformacoes]}>
                                    <Text style={styles.texto}>Status: </Text>
                                    <Text style={styles.informacoes}>{manifestacao.status_nome}</Text>
                                </Text>
                                <Text style={[styles.containerInformacoes]}>
                                    <Text style={styles.texto}>Data: </Text>
                                    <Text style={styles.informacoes}>{this.formatarData(manifestacao.created_at)}</Text>
                                </Text>
                            </View>
                        </View>
                        <TouchableHighlight onPress={() => {this.verManifestacao(manifestacao.codigo)}} style={styles.buttonContainer}>
                            <View style={styles.button}><Text style={{color: "white", fontSize: 17, fontWeight: 'bold'}}>Ver <Icon name="arrow-right" size={15}/></Text></View>
                        </TouchableHighlight>
                    </View>
                )
            )})
        }else{
            manifestacoes.push(
                    <Text style={[styles.containerInformacoes]}>
                        <Text style={styles.texto}>Não há manifestações cadastradas </Text>
                    </Text>
            )
        }

        return manifestacoes;
    }

    spinner(bol){
        this.setState({spinner: bol})
    }

    render() {
        return (
            <View style={styles.container}>
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <ScrollView ref="_scrollView" contentContainerStyle={styles.scroll}>
                    <View style={styles.manifestacoes}>
                        {this.manifestacoes()}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
    buttonContainer:{
        position: 'absolute', 
        bottom: height*0.03, 
        right: -width*0.04, 
        elevation: 20,
        borderRadius: 5,
    },
    button:{
        width: width*0.22,
        height: height*0.06,
        backgroundColor: "#2C3E50",
        alignItems: 'center',
        justifyContent: 'center',
        right:0,
        elevation: 2,
        borderRadius: 5,
    },
    containerInformacoes:{
        marginLeft: "2%"
    },
    containerTitulo:{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#2c3E50",
        elevation: 3,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        width: "100%",
        height: "22%",
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    container: {
        flex:1,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    texto:{
        fontSize: 18,
        color: 'black',
        fontWeight: 'bold'
    },
    informacoes:{
        fontSize: 18,
        color: 'black',
    },
    manifestContainer: {
        height: height*0.30,
        width: width*0.85,
        backgroundColor: "white",
        elevation:8,
        borderRadius: 10,
    },
    manifestacoes: {
        marginTop: height*0.05,
        alignItems: 'center',
    },
})