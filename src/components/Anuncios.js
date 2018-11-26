import React, { Component } from 'react'
import { Alert, Dimensions, AppRegistry, StyleSheet, View, Text, Button, ScrollView, ReactNative, AsyncStorage, TouchableHighlight, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions } from 'react-navigation';
import ModalFilterPicker from 'react-native-modal-filter-picker'
import SearchBar from 'react-native-searchbar';
import FastImage from 'react-native-fast-image'

export default class Anuncios extends Component {

    constructor(props){
    super(props);
        this.state = {
            anuncios: [],
            dadosAnuncios: [],
            categoria_id: "",
            cidade_id: "",
            cidadeNome: "",
            id: "",
            pesquisa: "",
            spinner: false,
            pagina: 1,
            cidades: [
                {"key": "", "label": "Todas as cidades"}, 
                {"key": 1, "label": "Caraguatatuba"},
                {"key": 2, "label": "Ilha Bela"},
                {"key": 3, "label": "São Sebastião"},
                {"key": 4, "label": "Ubatuba"}, 
            ],
            modalOpen: false,
            cidadeVisible: false,
            scrollMax: 0,
            heightLayout: 0,
            fim: false,
            pesquisaVisible: false,
        };  
    }

    componentWillMount(){
        this.carregarHeader()
        this.spinner(true)
        this.setState({categoria_id: this.props.navigation.state.params.categoria_id, id: this.props.navigation.state.params.id}, () => {
            AsyncStorage.multiGet(["cidade_id",'cidadeNome']).then((val) => {
                if(val[0][1] == null)
                    val[0][1] = ""
                if(val[1][1] == null)
                    val[1][1] = "Todas as cidades"
                this.setState({cidade_id: val[0][1],cidadeNome: val[1][1]},() => this.carregarAnuncios())
            })
        })
    }

    carregarHeader(){
        this.props.navigation.setParams({ 
            headerRight: (
                <TouchableOpacity onPress={() => {this.searchBar.show()}}>
                    <Icon style={{marginRight: 15}} name="search" size={28} color="white" />
                </TouchableOpacity>
            )
        })
    }
    
    carregarAnuncios(){
        fetch('http://donate-ifsp.ga/app/anuncios?categoria_id='
        +(this.state.categoria_id == null ? "" : this.state.categoria_id)+'&cidade_id='
        +(this.state.cidade_id == null ? "" : this.state.cidade_id)+'&page='
        +this.state.pagina+'&pesquisa='
        +this.state.pesquisa+'&id='
        +(this.state.id == null ? "" : this.state.id), {
        method: 'GET',
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson != "")
                this.anuncios(responseJson.data)
            this.setState({pagina: this.state.pagina+1})
            this.spinner(false)
        })
        .catch((error) => {
            Alert.alert("Sem conexão", 'Verifique sua conexão com a internet')
            this.props.navigation.goBack()
        });
    }

    pesquisar(){
        this.setState({pesquisa: this.searchBar.getValue(), pagina: 1, fim: false, spinner: true, anuncios: [], dadosAnuncios: []}, () => {
            this.refs._scrollView.scrollTo(0)
            this.carregarAnuncios()
            this.searchBar.hide()
        })
    }

    atualizarAnuncios(cidade){
        var cidadeNome = (cidade == "" ? "Todas as cidades" : (cidade == 1 ? "Caraguatatuba" : (cidade == 2 ? "Ilha Bela" : (cidade == 3 ? "São Sebastião" : "Ubatuba"))))
        this.setState({cidadeVisible: false, pagina: 1, fim: false, spinner: true, anuncios: [], dadosAnuncios: [],cidade_id: cidade, cidadeNome}, () => {
            this.refs._scrollView.scrollTo(0)
            AsyncStorage.setItem("cidade_id",cidade != "" ? JSON.stringify(cidade) : "")
            AsyncStorage.setItem("cidadeNome", cidadeNome)
            this.carregarAnuncios()
        })
    }

    formatadata(data){
        return data.substr(0, 10).split('-').reverse().join('/')+data.substr(10,6)
    }

    static navigationOptions = ({ navigation, screenProps }) => ({
        title: navigation.state.params.title,
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>
    });

    verAnuncio(id) {
        const { navigate } = this.props.navigation
        this.props.navigation.dispatch(NavigationActions.navigate({
            routeName: 'Anuncio', 
            key: 'anuncio',
            params:{
                anuncio: this.state.dadosAnuncios[id],
            }
        }));
    }

    editar(id){
        const { navigate } = this.props.navigation
        this.props.navigation.dispatch(NavigationActions.navigate({
            routeName: 'CadastroAnuncio', 
            key: 'anuncio',
            params:{
                anuncio: this.state.dadosAnuncios[id],
                title: "Edição"
            }
        }));
    }

    anuncios(anunciosnovos){
        const anuncios = [];
        var i = 1;
        const num = this.state.dadosAnuncios.length
        if(anunciosnovos.length > 0){
            anunciosnovos.map((anuncio,key) => {(
            anuncios.push(
                <View style={[styles.manifestContainer]}>
                    <TouchableHighlight underlayColor="#ffffff" key={i++} onPress={() => {this.verAnuncio(num+key)}} style={{width: "100%", height: "100%"}}>
                        <View style={{flex:1, flexDirection: 'row'}}>
                            <FastImage style={styles.imagem} 
                                source={{
                                    uri: anuncio.imagens[0],
                                    headers:{ Authorization: 'someAuthToken' },
                                    priority: FastImage.priority.normal,
                                }}
                            />
                            <View style={[styles.containerInformacoes]}>
                                <View><Text style={styles.texto}>{anuncio.titulo}</Text></View>
                                <View style={{position: "absolute", bottom:8}}>
                                    <View style={{marginBottom: 8}}><Text style={styles.textoSecundario}><Icon size={14} name="map-marker-alt"/> Status: { anuncio.deleted_at != null ? "Deletado" : (anuncio.aprovado == 0 ? "Aguardando aprovação" : (anuncio.doado == 1 ? "Doado" : "Disponível")) }</Text></View>
                                    <View style={{marginBottom: 8}}><Text style={styles.textoSecundario}><Icon size={14} name="map-marker-alt"/> {anuncio.bairroNome+", "+anuncio.cidadeNome }</Text></View>
                                    <View><Text style={styles.textoSecundario}><Icon size={14} name="clock"/> {this.formatadata(anuncio.data)} </Text></View>
                                </View>
                            </View>
                        </View>
                    </TouchableHighlight>
                    {this.state.id != null && 
                        <TouchableHighlight underlayColor="#FFFFCC" onPress={() => {this.editar(num+key)}} style={styles.botaoEditar}>
                            <Icon size={22} name="edit"/>
                        </TouchableHighlight>
                    }
                    {this.state.id != null && 
                        <TouchableHighlight underlayColor="#bf7f7f" onPress={() => {this.excluir(num+key)}} style={[styles.botaoExcluir, anuncio.deleted_at != null ? {backgroundColor: "#4ca64c"} : {}]}>
                            <Icon size={18} name={anuncio.deleted_at != null ? "undo" : "times"}/>
                        </TouchableHighlight>
                    }
                </View>
            )
            )})
        }
        if(anunciosnovos.length < 10){
            anuncios.push(
                <View style={{marginBottom:"5%"}}>
                <Text style={styles.texto}>Não há mais anúncios disponíveis </Text>
                </View>
            )
            this.setState({fim: true})
        }
        this.setState({anuncios : this.state.anuncios.concat(anuncios), dadosAnuncios: this.state.dadosAnuncios.concat(anunciosnovos)})
    }

    spinner(bol){
        this.setState({spinner: bol})
    }

    onContentSizeChange = (contentWidth, contentHeight) => {
        setTimeout(() => {
            this.setState({scrollMax: contentHeight - this.state.heightLayout})
        },1)
    };

    onShow = (nome) => {
        this.setState({ [nome]: true, modalOpen: true });
    }
    
    onCancel = (nome) => {
        this.setState({
            [nome]: false,
            modalOpen: false,
        });
    }

    render() {
        return (
            <View style={styles.container} 
            onLayout={(event) => {this.setState({heightLayout: event.nativeEvent.layout.height})}}>
                <ModalFilterPicker
                    title="Cidade"
                    visible={this.state.cidadeVisible}
                    onSelect={(cidade) => {this.atualizarAnuncios(cidade)}}
                    onCancel={() => this.setState({cidadeVisible: false})}
                    noResultsText={"Nenhum resultado encontrado"}
                    placeholderText="Filtro..."
                    options={this.state.cidades}
                    cancelButtonText={"Cancelar"}
                />
                {this.state.id == "" || this.state.id == null && (
                <TouchableOpacity style={styles.filtros} onPress={() => { this.setState({cidadeVisible: true}) }}>
                    <Text style={{fontSize: 22}}><Icon style={{marginRight: 15}} name="map-marker-alt" size={25} color="black" /> {this.state.cidadeNome}</Text>
                </TouchableOpacity>
                )}
                <ScrollView ref='_scrollView' 
                    onContentSizeChange={this.onContentSizeChange} 
                    onScroll={
                    ({nativeEvent}) => {
                        if(nativeEvent.contentOffset.y+2 > this.state.scrollMax && !this.state.fim && !this.state.spinner) {
                            this.spinner(true),this.carregarAnuncios() 
                        }
                    }} 
                    contentContainerStyle={styles.scroll} 
                    style={{backgroundColor: "#ededed"}}>
                    <SearchBar
                        ref={(ref) => this.searchBar = ref}
                        onSubmitEditing={() =>this.pesquisar()}
                        placeholder="Procure algo aqui"
                    />
                    <View style={styles.anuncios}>
                        {this.state.anuncios}
                    </View>
                    <ActivityIndicator size="large" color="#a64c4c" animating={this.state.spinner} />
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
        backgroundColor: '#ededed',
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
        backgroundColor: '#ededed',
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
        elevation: 3,
        backgroundColor: "white",
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtrosOptions:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoEditar:{
        position: "absolute",
        top: 0,
        left:0,
        height: "28%",
        width: "15%",
        backgroundColor: "#FFFF66",
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    botaoExcluir:{
        position: "absolute",
        top: 0,
        right:0,
        height: "20%",
        width: "10%",
        backgroundColor: "#a64c4c",
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
})