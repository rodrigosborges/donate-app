import React, { Component } from 'react'
import { StatusBar,Alert, AppRegistry, StyleSheet, View , Picker, Text, TextInput, Button, Image,ScrollView, ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground, WebView } from 'react-native'
import Modal from 'react-native-modal'
import { TextField } from 'react-native-material-textfield'
import Icon from 'react-native-vector-icons/FontAwesome5'
import {cpfValido} from './Helper.js'
import ModalFilterPicker from 'react-native-modal-filter-picker'
import MapView from 'react-native-maps'
import { Marker } from 'react-native-maps'
import RNFileSelector from 'react-native-file-selector'
import Spinner from 'react-native-loading-spinner-overlay'
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button'
import { NavigationActions } from 'react-navigation'
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker'
import ImagePicker from 'react-native-image-picker';
import FastImage from 'react-native-fast-image'

export default class CadastroAnuncio extends Component {
    constructor(props){
        super(props);
        var date = new Date()
        this.state = {

            tituloAnuncio: "",
            descricao: "",
            id: "",

            cidade: "",
            bairro: "",
            categoria: "",
            cidadeNome: "Selecione uma opção",
            bairroNome: "Selecione uma opção",
            categoriaNome: "Selecione uma opção",       

            mensagem: [],
            cadastrado: false,
            titulo: "",

            cidadesOptions: [{"key": 1, "label":"Caraguatatuba"},{"key": 2, "label":"Ilha Bela"},{"key": 3, "label":"São Sebastião"},{"key": 4, "label":"Ubatuba"}],
            bairrosOptions: [],
            categoriasOptions: [{"key": 1, "label":"Animal"},{"key": 2, "label":"Doméstico"},{"key": 3, "label":"Educação"},{"key": 4, "label":"Eletrônico"},{"key": 5, "label":"Esporte e Lazer"},{"key": 6, "label":"Infantil"},{"key": 7, "label":"Música"},{"key": 8, "label":"Vestuário"}],

            erroForm: true,

            cidadeVisible: false,
            bairroVisible: false,
            categoriaVisible: false,

            modalOpen: false,

            cidadeErro: "",
            bairroErro: "",
            categoriaErro: "",

            spinner: false,
            concluido: false,
            
            arquivo: [],

            editar: false,
            arquivoExcluir: [],
            idAnuncio: "",
        };
    }

    componentDidMount(){
        AsyncStorage.getItem('id').then((id) => {
            this.setState({id})
        })
        AsyncStorage.getItem('token').then((val) => {
            this.setState({token: val})
        })
        var anuncio = this.props.navigation.state.params.anuncio
        if(anuncio != null){
            this.setState({
                editar: true,
                tituloAnuncio: anuncio.titulo,
                descricao: anuncio.descricao,
                categoriaNome: anuncio.categoriaNome,
                cidadeNome: anuncio.cidadeNome,
                bairroNome: anuncio.bairroNome,
                categoria: anuncio.categoria,
                cidade: anuncio.cidade,
                arquivo: anuncio.imagens,
                idAnuncio: anuncio.id,
            })
            this.bairros(anuncio.cidade, anuncio.bairro, anuncio.bairroNome)
        }
    }

    static navigationOptions = ({ navigation, screenProps }) => ({
        title: navigation.state.params.title,
    });

    arquivo(){
        const options = {
            mediaType: 'photo',
            storageOptions: {
              skipBackup: true,
            },
            quality: 0.3,
        };
        ImagePicker.launchImageLibrary(options, (res) => {
            if(res.uri){
                this.setState({arquivo: [ ...this.state.arquivo, {uri: res.uri, type: res.type, name: res.fileName}]})
                setTimeout( () => { this.valida("arquivo","arquivoErro",2)}, 1)
            }
        });
    }

    adicionarFoto(){
        const options = {
            mediaType: 'photo',
            storageOptions: {
              skipBackup: true,
            },
            quality: 0.3,
        };
        
        ImagePicker.launchCamera(options, (res) => {
            if(res.uri){
                this.setState({arquivo: [ ...this.state.arquivo, {uri: res.uri, type: res.type, name: res.fileName}]})
                setTimeout( () => { this.valida("arquivo","arquivoErro",2)}, 1)
            }
        });
    }

    excluirArquivo(i){
        var arquivos = this.state.arquivo
        this.setState({arquivoExcluir: [ ...this.state.arquivoExcluir, arquivos[i]]})
        arquivos.splice(i,1)
        this.setState({arquivo: arquivos})
    }

    cadastrar(){
        const { navigate } = this.props.navigation;
        
        var body = new FormData();
        this.state.arquivo.map(function(v,i){
            if(typeof v != "string")
                body.append('anexos['+i+']',v)
        })

        body.append('descricao', this.state.descricao)
        body.append('titulo', this.state.tituloAnuncio)
        body.append('bairro_id', this.state.bairro)
        body.append('categoria_id', this.state.categoria)
        body.append('usuario_id', this.state.id)
        body.append('token', this.state.token)
        if(this.state.editar){
            this.state.arquivoExcluir.map(function(v,i){
                body.append('arquivoExcluir['+i+']', v)
            })
            body.append('id', this.state.idAnuncio)
        }

        config = { 
            method: 'POST', 
            headers: { 
                Accept: 'application/json', 'Content-Type': 'multipart/form-data;', 
            }, 
            body: body 
        };

        fetch(('http://donate-ifsp.ga/app/doacoes/'+(this.state.editar ? "update" : "insert")), config)

        .then((response) => response.json()).then((responseJson) => {
            var titulo = responseJson[0] == true ? "SUCESSO" : "ERRO"
            this.setState({cadastrado: responseJson[0],titulo: titulo, mensagem: responseJson[1], isVisible: true, concluido: (titulo == "SUCESSO"), codigo: responseJson[2]})
            setTimeout(() => {this.spinner(false)}, 1)
        })
        .catch((error) => {
            Alert.alert(
                'Sem conexão',
                'Verifique sua conexão com a internet',
            );
            this.spinner(false)
        })
    }

    bairros(cidade, bairro = "", bairroNome= ""){
        fetch('http://donate-ifsp.ga/app/bairros/'+cidade, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({bairrosOptions: responseJson, bairroNome: "Selecione uma opção", bairro: ""})
            if(bairro != "")[
                this.setState({bairro: bairro, bairroNome: bairroNome})
            ]
        })
        .catch((error) => {
            Alert.alert(
                'Sem conexão',
                'Verifique sua conexão com a internet',
            );
        });
    }
    
    valida(ref, refErro, caso){
        var mensagemErro = ""
        var val = this.state[ref]
        switch(caso) {
            case 1:
                if(val.length == 0)
                    mensagemErro += "Campo obrigatório"
                break
            case 2:
                if(val.length == 0)
                    mensagemErro += "Necessário adicionar ao menos uma foto ao anúncio"
                break
        }
        this.setState({[refErro]: mensagemErro});

        if(mensagemErro != "" && this.state.erroForm == false)
            this.setState({erroForm: true})
        
    }
    
    resetarFormulario(){
        this.setState({erroForm: false})
        setTimeout(() => {this.validarFormulario()}, 1)
    }

    validarFormulario(){
        this.spinner(true)
        setTimeout(() => {
            this.valida("categoria","categoriaErro",1)
            this.valida("descricao","descricaoErro",1)
            this.valida("tituloAnuncio","tituloAnuncioErro",1)
            this.valida("cidade","cidadeErro",1)
            this.valida("bairro","bairroErro",1)
            this.valida("arquivo","arquivoErro",2)

            if(this.state.erroForm == true){
                this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true})
                this.spinner(false)
            }else
                this.cadastrar()
            
        }, 1)
    }

    mensagens() {
        return this.state.mensagem.map(function(mensagem, i){
            return(
                <View key={i}>
                <Text style={{fontSize: 16, marginBottom: 3}}>{mensagem}</Text>
                </View>
            );
        });
    }

    header(){
        if(this.state.titulo == "SUCESSO"){
            return (<View style={[styles.successError, {borderWidth: 2, borderColor: '#B2FF59'}]}><View style={styles.icone}><Icon color="#B2FF59" size={35} name="check-circle"/></View><Text style={styles.mensagemAlerta}>SUCESSO</Text></View>)
        }else{
            return (<View style={[styles.successError, {borderWidth: 2, borderColor: '#F44336'}]}><View style={styles.icone}><Icon size={35} color="#F44336" name="times-circle"/></View><Text style={styles.mensagemAlerta}>ERRO</Text></View>)
        }
    }

    _renderButton = (text, onPress) => (
        <TouchableOpacity style={styles.modalButton} onPress={onPress}>
        <View style={styles.button}>
            <Text>{text}</Text>
        </View>
        </TouchableOpacity>
    );

    _renderModalContent = (goBack) => (
        <View style={styles.modalContent}>
            <View style={styles.header}>
                {this.header()}
            </View>
            <ScrollView style={styles.modalMensagem} contentContainerStyle={{flexGrow: 1, justifyContent : 'center'}}>
                <View style={{alignItems: 'center'}}>
                    {this.mensagens()}
                </View>
            </ScrollView>
            <View>
                {this._renderButton("Fechar", () => {(this.state.concluido) ? (this.setState({ isVisible: false }),this.props.navigation.navigate("Anuncios",{title: "Meus anúncios", id: this.state.id})) : ((this.state.cadastrado) ? (goBack()) : (this.setState({ isVisible: false })))})}
            </View>
        </View>
    );
    
    onShow = (nome) => {
        this.setState({ [nome]: true, modalOpen: true });
    }
    
    onCancel = (nome) => {
        this.setState({
            [nome]: false,
            modalOpen: false,
        });
    }


    find(name, key){
        var aux = "Selecione uma opção"
        for(var i=0; i < this.state[name+"sOptions"].length; i++){
            if(this.state[name+"sOptions"][i].key == key){
                aux = this.state[name+"sOptions"][i].label
            }
        }

        if(name == "cidade")
            this.bairros(key)

        this.setState({[name+"Nome"]: aux, modalOpen: false, [name]: key, [name+"Visible"]: false})
    }

    spinner(bol){
        this.setState({spinner: bol})
    }
    
    render() {
        const { navigate } = this.props.navigation
        const { goBack } = this.props.navigation
        const arquivos = this.state.arquivo.map((arquivo,index) => {
            return (
                <View style={styles.arquivosAdicionados} >
                    <FastImage source={{uri: (typeof arquivo == "string" ? arquivo : arquivo.uri)}} style={{width: "100%",height: 150}}/>
                    <TouchableOpacity style={{height: 40, width:40,position: 'absolute',right: 5, top:5}} onPress={() => this.excluirArquivo(index)}>
                        <Icon name="window-close" color="white" size={40}/>
                    </TouchableOpacity>
                </View>
            )   
        })
        return (
            <View style={styles.container}>
                {this.state.modalOpen == true && (<View style={styles.modalOpen}></View>)}
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <Modal
                    isVisible={this.state.isVisible}
                    animationIn="slideInLeft"
                    animationOut="slideOutRight"
                    >
                    {this._renderModalContent(goBack)}
                </Modal>
                <ScrollView keyboardShouldPersistTaps="handled" ref="_scrollView" contentContainerStyle={styles.scroll}>
                    <View style={styles.formulario}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Anúncio</Text>
                        </View>
                        <TextField maxLength={50} error={this.state.tituloAnuncioErro} onChangeText={(tituloAnuncio) => { this.setState( {tituloAnuncio}) }} value={this.state.tituloAnuncio} label={"Título"} onEndEditing={() => this.valida("tituloAnuncio","tituloAnuncioErro",1)}/>
                        <TextField multiline={true} error={this.state.descricaoErro} onChangeText={(descricao) => {this.setState({descricao})}} value={this.state.descricao} label={"Descrição"} onEndEditing={() => this.valida("descricao","descricaoErro",1)}/>
                        <View style={{paddingBottom: "6%"}} ></View>
                        <TouchableOpacity style={[styles.picker, { borderBottomWidth: (this.state.categoriaErro == "" ? 0.5 : 2),borderBottomColor: ( this.state.categoriaErro == "" ? "black" : "#d50000" )} ]} onPress={() => this.onShow("categoriaVisible")}>
                            <Text style={{ fontSize: 12, color: ( this.state.categoriaErro == "" ? "#989898" : "#d50000" ) }}>Categoria</Text>
                            <View style={{flexDirection: 'row', flex: 1}}>
                                <Text style={{fontSize: 18, marginBottom: "1%", marginTop: "1%", width: "90%", color: ( this.state.categoriaErro == "" ? "black" : "#d50000" )}}>{this.state.categoriaNome}</Text>
                                <View style={{right:-8, bottom:-3, width: 12, height:"100%"}}><Icon name="sort-down" color={( this.state.categoriaErro == "" ? "#989898" : "#d50000" )} size={18}/></View>
                            </View>
                        </TouchableOpacity>
                        <ModalFilterPicker
                            title="Categoria"
                            visible={this.state.categoriaVisible}
                            onSelect={(categoria) => {this.find("categoria",categoria), setTimeout(() => this.valida("categoria","categoriaErro",1), 1)}}
                            onCancel={() => this.onCancel("categoriaVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.categoriasOptions}
                            selectedOption={this.state.categoriaNome}
                            cancelButtonText={"Cancelar"}
                        />
                        <View style={{paddingBottom: "8%"}} ></View>
                        <TouchableOpacity style={[styles.picker, { borderBottomWidth: (this.state.cidadeErro == "" ? 0.5 : 2),borderBottomColor: ( this.state.cidadeErro == "" ? "black" : "#d50000" )} ]} onPress={() => {this.onShow("cidadeVisible")}}>
                            <Text style={{fontSize: 12, color: ( this.state.cidadeErro == "" ? "#989898" : "#d50000" )}}>Cidade</Text>
                            <View style={{flexDirection: 'row', flex: 1}}>
                                <Text style={{fontSize: 18, marginBottom: "1%", marginTop: "1%", width: "90%", color: ( this.state.cidadeErro == "" ? "black" : "#d50000" )}}>{this.state.cidadeNome}</Text>
                                <View style={{right:-8, bottom:-3, width: 12, height:"100%"}}><Icon name="sort-down" color={( this.state.cidadeErro == "" ? "#989898" : "#d50000" )} size={18}/></View>
                            </View>
                        </TouchableOpacity>
                        <ModalFilterPicker
                            title="Cidade"
                            visible={this.state.cidadeVisible}
                            onSelect={(cidade) => {this.find("cidade",cidade), setTimeout(() => this.valida("cidade","cidadeErro",1),1)}}
                            onCancel={() => this.onCancel("cidadeVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.cidadesOptions}
                            selectedOption={this.state.cidadeNome}
                            cancelButtonText={"Cancelar"}
                        />
                        <View style={{paddingBottom: "8%"}} ></View>
                        <TouchableOpacity style={[styles.picker, { borderBottomWidth: (this.state.bairroErro == "" ? 0.5 : 2),borderBottomColor: ( this.state.bairroErro == "" ? "black" : "#d50000" )} ]} onPress={() => this.onShow("bairroVisible")}>
                            <Text style={{fontSize: 12, color: ( this.state.bairroErro == "" ? "#989898" : "#d50000" )}}>Bairro</Text>
                            <View style={{flexDirection: 'row', flex: 1}}>
                                <Text style={{fontSize: 18, marginBottom: "1%", marginTop: "1%", width: "90%", color: ( this.state.bairroErro == "" ? "black" : "#d50000" )}}>{this.state.bairroNome}</Text>
                                <View style={{right:-8, bottom:-3, width: 12, height:"100%"}}><Icon name="sort-down" color={( this.state.bairroErro == "" ? "#989898" : "#d50000" )} size={18}/></View>
                            </View>
                        </TouchableOpacity>
                        <ModalFilterPicker
                            title="Bairro"
                            visible={this.state.bairroVisible}
                            onSelect={(bairro) => {this.find("bairro",bairro),setTimeout(() => {this.valida("bairro","bairroErro",1)}, 1)}}
                            onCancel={() => this.onCancel("bairroVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.bairrosOptions}
                            selectedOption={this.state.bairroNome}
                            cancelButtonText={"Cancelar"}
                        />
                    </View>
                    <View>
                    <View style={[styles.formulario,{alignItems:"center"}]}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Arquivos</Text>
                        </View>
                        <View style={{paddingBottom: "10%"}} ></View>
                        <View style={{flexDirection: "row", flex: 1}}>
                            <TouchableOpacity style={styles.arquivoContent} onPress={() => this.arquivo()}>
                                <Icon name="images" size={40}/>
                                <View><Text style={{fontSize:16}}>Foto da</Text></View>
                                <View><Text style={{fontSize:16}}>galeria</Text></View>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.arquivoContent,{marginLeft: 10}]} onPress={() => this.adicionarFoto()}>
                                <Icon name="camera" size={40}/>
                                <View><Text style={{fontSize:16}}>Tirar</Text></View>
                                <View><Text style={{fontSize:16}}>foto</Text></View>
                            </TouchableOpacity>
                        </View>
                        <View style={{paddingBottom: "6%"}} ></View>
                        <View style={{width: "100%"}}>
                            <ScrollView horizontal={true}>
                                {arquivos}
                            </ScrollView>
                        </View>

                        <View style={{paddingBottom: "6%"}} ></View>
                        {   this.state.arquivoErro != "" &&
                            (<Text style={{color:"#d50000"}}>{this.state.arquivoErro}</Text>)
                        }
                    </View>
                    </View>

                    <View style={styles.cadastrar}>
                        <Button disabled={this.state.spinner} onPress={() => {this.spinner(true), setTimeout(() => this.resetarFormulario(),1)}} title={this.state.editar ? "Editar" : "Cadastrar"} color="#800" />
                    </View>
                </ScrollView>
            </View>
        );
    }
}



let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
    mapaErro:{
        height: height*0.08,
        backgroundColor: "#ff6666",
        alignItems: 'center',
        width: width*0.9,
        marginLeft: width*0.05,
        borderRadius: 10,
        padding: width*0.05,
        justifyContent: 'center',
    },
    modalOpen: {
        position: 'absolute',
        right: 0,
        left: 0,
        top: -64,
        bottom: 0,
        width: width,
        height: height,
        elevation: 5,
        backgroundColor: "rgba(0,0,0,0.7)"
    },
    picker:{
        textDecorationLine: 'underline'
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
    inputs: {
    },
    mapa:{
        margin: '5%',
        backgroundColor: 'white',
        elevation: 10,
        height: height*0.5,
    },
    mapaContainer:{
        height: height*0.5,
    },
    formulario:{
        margin: '5%',
        padding: "5%",
        borderColor: '#FFFFFF',
        borderWidth: 1,
        backgroundColor: 'white',
        elevation: 10,
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#800',
    },
    tituloContent: {
        alignItems: 'center',
    },
    arquivoContent: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#7f8c8d",
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        height: 100,
    },
    arquivosAdicionados: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#7f8c8d",
        flexDirection: 'row',
        width: width*0.5,
    },
    cadastrar: {
        width: width*0.9,
        marginTop: width*0.05,
        marginLeft: width*0.05,
        marginBottom: width*0.05,
    },
    container: {
        flex:1,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },

    texto:{
        marginTop: 20,
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold'
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
    picker:{
        borderBottomWidth: 0.5,
        borderBottomColor: "#989898",
    },
    radio: {
        color: "black",
        fontSize: 18,
    },

})