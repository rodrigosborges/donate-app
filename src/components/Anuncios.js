import React, { Component } from 'react'
import { Alert, Dimensions, AppRegistry, StyleSheet, View, Text, Button, ScrollView, ReactNative, AsyncStorage, TouchableHighlight, Image, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions } from 'react-navigation';
import ModalFilterPicker from 'react-native-modal-filter-picker'


export default class Anuncios extends Component {
    constructor(props){
    super(props);
        this.state = {
            anuncios: [],
            categoria_id: null,
            cidade: null,
            cidadeNome: null,
            spinner: false,
            pagina: 1,
            cidades: [
                {"key": 0, "label": "Todas as cidades"}, 
                {"key": 1, "label": "Caraguatatuba"},
                {"key": 2, "label": "Ilha Bela"},
                {"key": 3, "label": "São Sebastião"},
                {"key": 4, "label": "Ubatuba"}, 
            ],
            cidadeVisible: false,
            scrollMax: 0,
            heightLayout: 0,
        };  
    }

    componentWillMount(){
        this.spinner(true)
        this.carregarHeader()
        this.setState({categoria_id: this.props.navigation.state.params.categoria_id}, () => this.carregarAnuncios())
    }
    
    carregarAnuncios(cidade_id = ""){
        fetch('http://10.10.209.11/donate/app/anuncios?categoria_id='+this.state.categoria_id+'&cidade_id='+cidade_id, {
        method: 'GET',
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson != ""){
                this.setState({anuncios:this.state.anuncios.concat(responseJson.data)})
            }
            this.spinner(false)
        })
        .catch((error) => {
          Alert.alert("Algo deu errado")
          this.spinner(false)
        });
        this.setState({pagina: this.state.pagina+1})
    }

    atualizaAnuncios(categoria, cidade){

    }

    carregarHeader(){
        this.props.navigation.setParams({ 
            headerRight: (
                <TouchableOpacity onPress={() => { this.setState({cidadeVisible: true}) }}>
                    <Icon style={{marginRight: 15}} name="map-marker-alt" size={25} color="#E0E0E0" />
                </TouchableOpacity>
            )
        })
    }

    static navigationOptions = ({ navigation, screenProps }) => ({
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>,
    });

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

    anuncios(){
        const anuncios = [];
        let i = 1;
        if(this.state.anuncios.length > 0){
            this.state.anuncios.map((anuncio) => {(
            anuncios.push(
                <TouchableHighlight underlayColor="#ffffff" key={i++} onPress={() => {}} style={[styles.manifestContainer]}>
                    <View style={{flex:1, flexDirection: 'row'}}>
                        <Image source={{uri: "http://10.10.209.11/donate/storage/app/anuncio_"+anuncio.id+"/DonateImage_0.jpg?time=" + new Date()}} style={styles.imagem}/>
                        <View style={[styles.containerInformacoes]}>
                            <View><Text style={styles.texto}>{anuncio.titulo}</Text></View>
                            <View style={{position: "absolute", bottom:8}}>
                                <View style={{marginBottom: 8}}><Text style={styles.textoSecundario}><Icon size={14} name="map-marker-alt"/> {anuncio.bairro_nome+", "+anuncio.cidade_nome }</Text></View>
                                <View><Text style={styles.textoSecundario}><Icon size={14} name="clock"/> {anuncio.data} </Text></View>
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
            )
            )})
        }else{
            anuncios.push(
                <Text style={styles.texto}>Não há anúncios cadastrados </Text>
            )
        }
        return this.state.spinner ? (<View/>) : anuncios;
    }

    spinner(bol){
        this.setState({spinner: bol})
    }

    onContentSizeChange = (contentWidth, contentHeight) => {
        setTimeout(() => {
            this.setState({scrollMax: contentHeight - this.state.heightLayout})
        },1)
    };

    render() {
        return (
            <View style={styles.container} onLayout={(event) => {this.setState({heightLayout: event.nativeEvent.layout.height})}}>
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <ModalFilterPicker
                    title="Cidade"
                    visible={this.state.cidadeVisible}
                    onSelect={(cidade) => {this.cidades(cidade, 0), this.find("cidade",cidade)}}
                    onCancel={() => this.setState({cidadeVisible: false})}
                    noResultsText={"Nenhum resultado encontrado"}
                    placeholderText="Filtro..."
                    options={this.state.cidades}
                    selectedOption={this.state.cidadeNome}
                    cancelButtonText={"Cancelar"}
                />
                <ScrollView onContentSizeChange={this.onContentSizeChange} onScroll={({nativeEvent}) => {if(nativeEvent.contentOffset.y == this.state.scrollMax) { alert("imagine mais carregamentos aqui")}}} ref="_scrollView" contentContainerStyle={styles.scroll} style={{backgroundColor: "white"}}>
                    <View style={styles.anuncios}>
                        {this.anuncios()}
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
        width: "56%",
        marginLeft: "2%",
    },
    containerTitulo:{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#2c3E50",
        elevation: 3,
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
        fontSize: 17,
        color: 'black',
        fontWeight: 'bold'
    },
    textoSecundario:{
        fontSize: 14,
        color: 'black',
    },
    informacoes:{
        fontSize: 18,
        color: 'black',
    },
    manifestContainer: {
        height: height*0.25,
        width: width*0.95,
        backgroundColor: "white",
        elevation:8,
        marginBottom: 20
    },
    anuncios: {
        paddingTop: 20,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    imagem: {
        width: "40%",
        height: "100%",
    },
    filtros:{
        position: "relative",
        height:60,
        width: "100%",
        top: 0,
        elevation: 5,
        backgroundColor: "white",
        flexDirection: 'row',
    },
    filtrosOptions:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})