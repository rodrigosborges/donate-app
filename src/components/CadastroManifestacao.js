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
import { NavigationActions } from 'react-navigation';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

export default class CadastroManifestacao extends Component {
    constructor(props){
        super(props);
        var date = new Date()
        this.state = {
            
            hora: date.getHours() + ":" + ((date.getMinutes() < 10)?"0":"") + date.getMinutes(),
            data: ((date.getDate() < 10)?"0":"") + date.getDate() +"/"+(((date.getMonth()+1) < 10)?"0":"") + (date.getMonth()+1) +"/"+ date.getFullYear(),
            descricao: "",
            envolvidos: "",
            manifestacaoAnterior: "",

            cep: "",
            logradouro: "",
            referencia: "",
            numero: "",
            estado: 26,
            cidade: 4826,
            bairro: "",
            estadoNome: "São Paulo",
            cidadeNome: "Caraguatatuba",
            bairroNome: "Selecione uma opção",

            categoria: "",
            unidade: "",
            assunto: "",
            categoriaNome: "Selecione uma opção",
            unidadeNome: "Selecione uma opção",
            assuntoNome: "Selecione uma opção",
            identificacao: 1,
            documento: "",
            

            mensagem: [],
            cadastrado: false,
            titulo: "",

            estadosOptions: [],
            cidadesOptions: [],
            bairrosOptions: [],
            categoriasOptions: [],
            unidadesOptions: [],
            assuntosOptions: [],

            erroForm: true,

            estadoVisible: false,
            cidadeVisible: false,
            bairroVisible: false,
            categoriaVisible: false,
            unidadeVisible: false,
            assuntoVisible: false,

            modalOpen: false,

            cidadeErro: "",
            estadoErro: "",
            bairroErro: "",
            categoriaErro: "",
            unidadeErro: "",
            assuntoErro: "",
            mapaErro: "",

            latitude: -23.62659639859563,
            longitude: -45.42417526245117,

            locationResult: null,

            enderecoLocation: {x: 0 , y:0},
            mapaLocation: {x: 0 , y:0},

            spinner: false,
            concluido: false,
            codigo: "",

            arquivo: [],
        };
    }


    componentWillMount(){
        StatusBar.setHidden(false)
        AsyncStorage.getItem('cpf').then((value) => {
            this.setState({documento: value})
        }).done()
        this.estados()
        this.cidades(26, 4826)
        this.bairros()
        this.categorias()
        this.unidades()
        this.props.navigation.state.params.spinner(false)
        setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
    }

    arquivo(){
        DocumentPicker.show({
            filetype: [DocumentPickerUtil.allFiles()],
        },(error,res) => {
            if(res != null){
                var ext = res.fileName.split(".").pop()
                if(ext == "jpg" || ext == "png" || ext == "jpeg" || ext == "pdf" || ext == "doc" || ext== "xls" || ext== "xlsx" || ext== "docx")
                    this.setState({arquivo: [ ...this.state.arquivo, {uri: res.uri, type: res.type, name: res.fileName}]})
                else
                    this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Formato de arquivo inválido", "Favor inserir um dos seguintes tipos:", "jpg, png, jpeg, pdf, doc, xls, xlsx, docx"], isVisible: true})
            }
        });
    }

    excluirArquivo(i){
        var arquivos = this.state.arquivo
        arquivos.splice(i,1)
        this.setState({arquivo: arquivos})
    }

    preencherEnderecoAtual(lat, lng){
        fetch('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBdOhvMaCRWAOo1goFQtbRO2lDY-Y2ONLw&latlng='+lat+","+lng, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            var loc = responseJson.results[0].address_components
            this.setState({numero: loc[0].long_name, logradouro: loc[1].long_name, cep: loc[6].long_name }, () => {
                this.valida("numero","numeroErro",1)
                this.buscarCepIds(loc[2].long_name, loc[3].long_name, loc[4].short_name)
            })
            this.setState({cadastrado: false, titulo: "SUCESSO", mensagem: ["Endereço encontrado","Verifique os dados preenchidos"], isVisible: true})
            this.refs._scrollView.scrollTo({x: this.state.enderecoLocation.x, y: this.state.enderecoLocation.y, animated: true})
        })
        .catch((error) => {
            this.spinner(false)
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    localizacaoAtual(){
        this.spinner(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.preencherEnderecoAtual(position.coords.latitude, position.coords.longitude)
                this.marcarMapa(position.coords.latitude, position.coords.longitude)
            },
            (error) => {
                if(error != null){
                    this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro ao tentar localizar sua posição","Favor verificar a internet e o gps"], isVisible: true})
                    this.spinner(false)
                }
            },
            { enableHighAccuracy: false, timeout: 25000},
        );
    }

    buscarLatLong(){
        this.spinner(true)
        this.setState({erroForm: false})
        setTimeout(() => {        
            this.valida("cidade","cidadeErro",6)
            this.valida("estado","estadoErro",1)
            this.valida("bairro","bairroErro",1)
            this.valida("logradouro","logradouroErro",1)
            this.valida("numero","numeroErro",1)

            if(this.state.erroForm == true){
                this.refs._scrollView.scrollTo({x: this.state.enderecoLocation.x, y: this.state.enderecoLocation.y, animated: true})
                this.spinner(false)
            }
            else{
                var bairro = (Number.isInteger(this.state.bairro)) ? this.state.bairroNome : this.state.bairro;
                var address = this.state.logradouro+", "+this.state.numero+", "+bairro+", "+this.state.cidadeNome+", "+this.state.estadoNome;
                fetch('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyACLqECyyZOnm0EtZZVmm19U_CTUd231SQ&new_forward_geocoder=true&address='+address, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }).then((response) => response.json())
                .then((responseJson) => {
                    if(responseJson.status == "OK"){
                        this.refs._scrollView.scrollToEnd({animated: true})
                        this.marcarMapa(responseJson.results[0].geometry.location.lat, responseJson.results[0].geometry.location.lng)
                    }else{
                        this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Endereço não encontrado, favor marcar no mapa manualmente"], isVisible: true})
                    }
                    this.spinner(false)
                })
                .catch((error) => {
                    this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
                    this.spinner(false)
                });
            }
        }, 1)
    }

    marcarMapa(lat,lng){
        this.setState({latitude: lat, longitude: lng}, () => {
            this._map.animateToCoordinate({latitude: lat, longitude:  lng}, 500);
        })
        setTimeout(() => {this.validarMapa()}, 1)
    }

    buscarCepIds(bairro, cidade, estado){
        fetch('http://192.168.11.51/ouvidoria/app/buscaCep', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bairro: bairro,
                cidade: cidade,
                estado: estado,
            }),
        }).then((response) => response.json())
        .then((responseJson) => {
            this.cidades(responseJson.estado, responseJson.cidade)
            this.setState({estado: responseJson.estado, cidade: responseJson.cidade},() => {
                this.find("bairro",(responseJson.cidade == 4826 ? responseJson.bairro : bairro))
                this.find("estado",responseJson.estado)
                this.find("cidade",responseJson.cidade)
            })
            this.valida("bairro","bairroErro",1)
            this.valida("cidade","cidadeErro",6)
            this.valida("estado","estadoErro",1)
            this.valida("logradouro","logradouroErro",1)
            this.spinner(false)
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            this.spinner(false)
        });
    }

    buscarCep(){
        this.spinner(true)
        fetch('https://viacep.com.br/ws/'+this.state.cep+'/json/', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson.logradouro){
                this.setState({logradouro: responseJson.logradouro})
                this.buscarCepIds(responseJson.bairro, responseJson.localidade, responseJson.uf)
            }else{
                this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Endereço não encontrado"], isVisible: true})
                this.spinner(false)
            }   
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            this.spinner(false)
        });
    }

    cadastrar(){
        const { navigate } = this.props.navigation;
        
        var body = new FormData();
        this.state.arquivo.map(function(v,i){
            body.append('anexos['+i+']',v)
        })

        body.append('documento', this.state.documento)
        body.append('hora', this.state.hora)
        body.append('data', this.state.data)
        body.append('descricao', this.state.descricao)
        body.append('envolvidos', this.state.envolvidos)
        body.append('manifestacaoAnterior', this.state.manifestacaoAnterior)

        body.append('cep', this.state.cep)
        body.append('rua', this.state.logradouro)
        body.append('referencia', this.state.referencia)
        body.append('numero', this.state.numero)
        body.append('cidade_id', this.state.cidade)
        body.append('bairro', this.state.bairro)
        body.append('latitude', this.state.latitude)
        body.append('longitude', this.state.longitude)

        body.append('categoria_id', this.state.categoria)
        body.append('unidade_id', this.state.unidade)
        body.append('assunto_id', this.state.assunto)
        body.append('identificacao_id', this.state.identificacao)

        config = { 
            method: 'POST', 
            headers: { 
                Accept: 'application/json', 'Content-Type': 'multipart/form-data;', 
            }, 
            body: body 
        };

        fetch('http://192.168.11.51/ouvidoria/app/cadastroManifestacao', config)

        .then((response) => response.json()).then((responseJson) => {
            var titulo = responseJson[1][0] == "Manifestação cadastrada" ? "SUCESSO" : "ERRO"
            this.setState({cadastrado: responseJson[0],titulo: titulo, mensagem: responseJson[1], isVisible: true, concluido: (titulo == "SUCESSO"), codigo: responseJson[2]})
            setTimeout(() => {this.spinner(false)}, 1)
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            setTimeout(() => {this.spinner(false)}, 1)
        })
    }

    estados(){
        fetch('http://192.168.11.51/ouvidoria/app/estados', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({estadosOptions: responseJson})
        })
        .catch((error) => {
            this.setState({cadastrado: true, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    cidades(estado_id, cidade){
        if(estado_id == 26){
            this.setState({cidade: 4826, cidadeNome: "Caraguatatuba"},() => {
                this.valida("cidade","cidadeErro",6)
                this.find("bairro","")
            })
        }else{
            this.setState({cidade: "", cidadeNome: "Selecione uma opção"},() => {
                this.find("bairro","")
            })  
        }
        
        fetch('http://192.168.11.51/ouvidoria/app/cidades/'+estado_id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({cidadesOptions: responseJson}, () => {
                if(!(estado_id == 26 && cidade == 0)){
                    this.find("cidade",cidade)
                }
            })                
        })
        .catch((error) => {
            this.setState({cadastrado: true, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    bairros(){
        fetch('http://192.168.11.51/ouvidoria/app/bairros', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({bairrosOptions: responseJson})
        })
        .catch((error) => {
            this.setState({cadastrado: true, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    categorias(){
        fetch('http://192.168.11.51/ouvidoria/app/categorias', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({categoriasOptions: responseJson})
        })
        .catch((error) => {
            this.setState({cadastrado: true, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    unidades(){
        fetch('http://192.168.11.51/ouvidoria/app/unidades', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({unidadesOptions: responseJson})
        })
        .catch((error) => {
            this.setState({cadastrado: true, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    assuntos(unidade_id){
        fetch('http://192.168.11.51/ouvidoria/app/assuntos/'+unidade_id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({assuntosOptions: responseJson, assunto: "", assuntoNome: "Selecione uma opção"})
        })
        .catch((error) => {
            this.setState({cadastrado: true, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    mascaraCep(cep){
        cep = cep.replace(/[^0-9]/g, '');
        this.setState({cep},() => {
            if(cep.length>4)
                cep = cep.substring(0,5)+"-"+ cep.substring(5,8)
            this.setState({cep})
        })
    }

    mascaraHora(hora){
        hora = hora.replace(/[^0-9]/g, '');
        this.setState({hora},() => {
            if(hora.length>2)
                hora = hora.substring(0,2)+":"+ hora.substring(2,5)
            this.setState({hora})
        })
    }

    mascaraData(data){
        data = data.replace(/[^0-9]/g, '');
        this.setState({data},() => {
            if(data.length>2)
                data = data.substring(0,2)+"/"+ data.substring(2,15)
            if(data.length>5)
                data = data.substring(0,5)+"/"+data.substring(5,15)
            this.setState({data})
        })
    }


    valida(ref, refErro, caso){
        var mensagemErro = ""
        var val = this.state[ref]
        switch(caso) {
            case 1:
                if(val.length == 0)
                    mensagemErro += "Digite um "+ ref +" válido"
                break
            case 2:
                if(val != "" && !val.match(/\d{3}\.\d{3}\.\d{3}\.\d{3}/) )
                    mensagemErro += "Digite uma manifestação anterior válida"
                break
            case 3:
                if(val == "" || !val.match(/^([0-9]|0[0-9]|1?[0-9]|2[0-3]):[0-5]?[0-9]$/))
                    mensagemErro += "Digite uma hora válida"
                break
            case 4:
                if(!val.match(/\d{5}\-\d{3}/) && val.length != 0)
                    mensagemErro += "Digite um CEP válido"
                else if(val.length == 9)
                    this.buscarCep()
                break
            case 5:
                if(val == "" || !val.match(/^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$/))
                    mensagemErro += "Digite uma data válida"
                break
            case 6:
                if(val.length == 0)
                    mensagemErro += "Digite uma "+ ref +" válida"
                break
        }
        this.setState({[refErro]: mensagemErro});

        if(mensagemErro != "" && this.state.erroForm == false)
            this.setState({erroForm: true})
        
    }

    mascaraCodigo(manifestacaoAnterior){
        manifestacaoAnterior = manifestacaoAnterior.replace(/[^0-9]/g, '');
        this.setState({manifestacaoAnterior},() => {
            if(manifestacaoAnterior.length>3)
              manifestacaoAnterior = manifestacaoAnterior.substring(0,3)+"."+ manifestacaoAnterior.substring(3,15)
            if(manifestacaoAnterior.length>7)
              manifestacaoAnterior = manifestacaoAnterior.substring(0,7)+"."+ manifestacaoAnterior.substring(7,15)
            if(manifestacaoAnterior.length>11)
              manifestacaoAnterior = manifestacaoAnterior.substring(0,11)+"."+ manifestacaoAnterior.substring(11,14)
            this.setState({manifestacaoAnterior})
        })
    }    

    resetarFormulario(){
        this.setState({erroForm: false})
        setTimeout(() => {this.validarFormulario()}, 1)
    }

    validarMapa(){
        if(this.state.latitude == -23.62659639859563 && this.state.longitude == -45.42417526245117){
            this.setState({mapaErro: "Selecione o local no mapa ou clique no botão de busca"})
            return false
        }else{
            this.setState({mapaErro: ""})
            return true
        }
    }

    validarFormulario(){
        this.spinner(true)
        setTimeout(() => {
            this.valida("data","dataErro",5)
            this.valida("hora","horaErro",3)
            this.valida("categoria","categoriaErro",6)
            this.valida("unidade","unidadeErro",6)
            this.valida("assunto","assuntoErro",1)
            this.valida("descricao","descricaoErro",6)
            this.valida("manifestacaoAnterior","manifestacaoAnteriorErro",2)
            this.valida("cep","cepErro",4)
            this.valida("estado","estadoErro",1)
            this.valida("cidade","cidadeErro",6)
            this.valida("bairro","bairroErro",1)
            this.valida("logradouro","logradouroErro",1)
            this.valida("numero","numeroErro",1)

            if(this.state.erroForm == true){
                this.validarMapa()
                this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true})
                this.spinner(false)
            }else{
                if(this.validarMapa())
                    this.cadastrar()
                else{
                    this.refs._scrollView.scrollToEnd({animated: true})
                }
            }
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
                {this._renderButton("Fechar", () => (this.state.concluido) ? (this.pesquisar(this.state.codigo)) : ((this.state.cadastrado) ? (goBack()) : (this.setState({ isVisible: false }))))}
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
        if(name == "bairro" && aux == "Selecione uma opção" && this.state.cidade == 4826){
            key = ""
        }

        this.setState({[name+"Nome"]: aux, modalOpen: false, [name]: key, [name+"Visible"]: false})
    }

    _onPress () {   
    
        RNFileSelector.Show(
          {
            title: 'Select File',
            closeMenu: true,
            editable: true,
            onDone: (path) => {
              console.log('file selected: ' + path)
            },
            onCancel: () => {
              console.log('cancelled')
            }
          }
        )
    }

    pesquisar(codigo) {
        const { navigate } = this.props.navigation
        this.setState({isVisible: false})
    
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
            
            if(this.state.documento){
                this.props.navigation.dispatch(new NavigationActions.reset({
                    index: 1,
                    actions: [
                        NavigationActions.navigate({ routeName: 'Menu', params:{ fundo: this.props.navigation.state.params.fundo, logo: this.props.navigation.state.params.logo}}),
                        NavigationActions.navigate({ routeName: 'Manifestacao', params:{ manifestacao, encaminhamentos, respostaFinal, spinner: this.spinner.bind(this), fundo: this.props.navigation.state.params.fundo, logo: this.props.navigation.state.params.logo}})
                    ]
                }));
            }else{
                this.props.navigation.goBack()
            }
          }else{
              this.props.navigation.goBack()
          }
        })
        .catch((error) => {
          console.error(error);
        });
    
    }

    spinner(bol){
        this.setState({spinner: bol})
    }
    
    render() {
        var cpf = ""
        const { navigate } = this.props.navigation
        const { goBack } = this.props.navigation
        const arquivos = this.state.arquivo.map((arquivo,index) => {
            return (
                <View style={styles.arquivosAdicionados} >
                    <Text style={{marginBottom: "2%",position: 'absolute',left: 5, width:"70%"}}>{arquivo.name}</Text>
                    <TouchableOpacity style={{height: 40, width:40,position: 'absolute',right: 5}} onPress={() => this.excluirArquivo(index)}>
                        <Icon name="window-close" size={40}/>
                    </TouchableOpacity>
                </View>
            )   
        })
        const bairroSelectInput = this.state.cidade == 4826 ? 
            (<View>
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
                <View style={{paddingBottom: "2%"}} ></View>
            </View>
        ):
            (<View><View style={{paddingBottom: "2%"}} ></View><TextField error={this.state.bairroErro} onChangeText={(bairro) => this.setState({bairro})} onEndEditing={(e) => this.valida("bairro","bairroErro",1)} value={this.state.bairro+""} label={"Bairro"}/></View>)
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
                            <Text style={styles.titulo}>Manifestação</Text>
                        </View>
                        <View style={styles.inputs}>
                            <TextField label="Data da ocorrência" error={this.state.dataErro} maxLength={10} value={this.state.data} onChangeText={(data) => this.mascaraData(data)} keyboardType={"numeric"} onEndEditing={(e) => this.valida("data","dataErro",5)}/>
                        </View>
                        <View style={styles.inputs}>
                            <TextField label="Hora" error={this.state.horaErro} maxLength={5} value={this.state.hora} onChangeText={(hora) => (this.mascaraHora(hora))} keyboardType={"numeric"} onEndEditing={() => this.valida("hora","horaErro",3)}/>
                        </View>

                        { this.state.documento != null && this.state.documento != "" && 
                        (<View><Text style={{ fontSize: 12, color: "#989898", paddingTop: "6%"}}>Identificação</Text>
                        <RadioGroup style={{ flex: 1, flexDirection: 'row', justifyContent: 'center'}} selectedIndex={0} thickness={2} color='#989898' size={24} onSelect = {(value) => {this.setState({identificacao: value})}}>
                            <RadioButton style={{flex:1}} color='#989898' value={1} >
                                <Text style={styles.radio}>Aberta</Text>
                            </RadioButton>
                            <RadioButton style={{flex:1}} color='#989898' value={2} >
                                <Text style={styles.radio}>Sigilosa</Text>
                            </RadioButton>
                        </RadioGroup></View>)
                        }

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
                            onSelect={(categoria) => {this.find("categoria",categoria), setTimeout(() => this.valida("categoria","categoriaErro",1),1)}}
                            onCancel={() => this.onCancel("categoriaVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.categoriasOptions}
                            selectedOption={this.state.categoriaNome}
                            cancelButtonText={"Cancelar"}
                        />
                        <View style={{paddingBottom: "8%"}} ></View>
                        <TouchableOpacity style={[styles.picker, { borderBottomWidth: (this.state.unidadeErro == "" ? 0.5 : 2),borderBottomColor: ( this.state.unidadeErro == "" ? "black" : "#d50000" )} ]} onPress={() => this.onShow("unidadeVisible")}>
                            <Text style={{ fontSize: 12, color: ( this.state.unidadeErro == "" ? "#989898" : "#d50000" ) }}>Unidade</Text>
                            <View style={{flexDirection: 'row', flex: 1}}>
                                <Text style={{fontSize: 18, marginBottom: "1%", marginTop: "1%", width: "90%", color: ( this.state.unidadeErro == "" ? "black" : "#d50000" )}}>{this.state.unidadeNome}</Text>
                                <View style={{right:-8, bottom:-3, width: 12, height:"100%"}}><Icon name="sort-down" color={( this.state.unidadeErro == "" ? "#989898" : "#d50000" )} size={18}/></View>
                            </View>
                        </TouchableOpacity>
                        <ModalFilterPicker
                            title="Unidade"
                            visible={this.state.unidadeVisible}
                            onSelect={(unidade) => {this.assuntos(unidade), this.find("unidade",unidade), setTimeout(() => this.valida("unidade","unidadeErro",1),1)}}
                            onCancel={() => this.onCancel("unidadeVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.unidadesOptions}
                            selectedOption={this.state.unidadeNome}
                            cancelButtonText={"Cancelar"}
                        />
                        <View style={{paddingBottom: "8%"}} ></View>
                        <TouchableOpacity style={[styles.picker, { borderBottomWidth: (this.state.assuntoErro == "" ? 0.5 : 2),borderBottomColor: ( this.state.assuntoErro == "" ? "black" : "#d50000" )} ]} onPress={() => this.onShow("assuntoVisible")}>
                            <Text style={{ fontSize: 12, color: ( this.state.assuntoErro == "" ? "#989898" : "#d50000" ) }}>Assunto</Text>
                            <View style={{flexDirection: 'row', flex: 1}}>
                                <Text style={{fontSize: 18, marginBottom: "1%", marginTop: "1%", width: "90%", color: ( this.state.assuntoErro == "" ? "black" : "#d50000" )}}>{this.state.assuntoNome}</Text>
                                <View style={{right:-8, bottom:-3, width: 12, height:"100%"}}><Icon name="sort-down" color={( this.state.assuntoErro == "" ? "#989898" : "#d50000" )} size={18}/></View>
                            </View>
                        </TouchableOpacity>
                        <ModalFilterPicker
                            title="Assunto"
                            visible={this.state.assuntoVisible}
                            onSelect={(assunto) => {this.find("assunto",assunto), setTimeout(() => this.valida("assunto","assuntoErro",1),1)}}
                            onCancel={() => this.onCancel("assuntoVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.assuntosOptions}
                            selectedOption={this.state.assuntoNome}
                            cancelButtonText={"Cancelar"}
                        />
                        <View style={{paddingBottom: "2%"}} ></View>
                        <TextField multiline={true} error={this.state.descricaoErro} onChangeText={(descricao) => {this.setState({descricao})}} value={this.state.descricao} label={"Descrição"} onEndEditing={() => this.valida("descricao","descricaoErro",6)}/>
                        <TextField multiline={true} error={this.state.envolvidosErro} onChangeText={(envolvidos) => {this.setState({envolvidos})}} value={this.state.envolvidos} label={"Envolvidos"}/>
                        <TextField maxLength={15} error={this.state.manifestacaoAnteriorErro} onChangeText={(codigo) => {this.mascaraCodigo(codigo)}} value={this.state.manifestacaoAnterior} label={"Manifestação anterior"} onEndEditing={() => this.valida("manifestacaoAnterior","manifestacaoAnteriorErro",2)} keyboardType={"numeric"}/>
                    </View>
                    <View style={[styles.formulario,{alignItems:"center"}]}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Arquivos</Text>
                        </View>
                        <View style={{paddingBottom: "20%"}} ></View>
                        <TouchableOpacity style={styles.arquivoContent} onPress={() => this.arquivo()}>
                            <Icon name="file-upload" size={40}/>
                            <Text style={{fontSize:16}}>Adicionar arquivo</Text>
                        </TouchableOpacity>
                        <View style={{paddingBottom: "6%"}} ></View>
                        {arquivos}
                    </View>
                    <View style={styles.cadastrar}>
                        <Button onPress={() => this.localizacaoAtual()} title="Preencher meu endereço atual" color="#2C3E50" />
                    </View>
                    <View style={styles.formulario} onLayout={(event) => {this.setState({enderecoLocation: {x: event.nativeEvent.layout.x,y: event.nativeEvent.layout.y}})}}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Local da ocorrência</Text>
                        </View>
                        <TextField maxLength={9} ref="CEP" error={this.state.cepErro} onChangeText={(cep) => {this.mascaraCep(cep)}} value={this.state.cep} label={"CEP"} keyboardType={"numeric"} onEndEditing={() => this.valida("cep","cepErro",4)}/>
                        <View style={{paddingBottom: "6%"}} ></View>
                        <TouchableOpacity style={[styles.picker, { borderBottomWidth: (this.state.estadoErro == "" ? 0.5 : 2),borderBottomColor: ( this.state.estadoErro == "" ? "black" : "#d50000" )} ]} onPress={() => this.onShow("estadoVisible")}>
                            <Text style={{ fontSize: 12, color: ( this.state.estadoErro == "" ? "#989898" : "#d50000" ) }}>Estado</Text>
                            <View style={{flexDirection: 'row', flex: 1}}>
                                <Text style={{fontSize: 18, marginBottom: "1%", marginTop: "1%", width: "90%", color: ( this.state.estadoErro == "" ? "black" : "#d50000" )}}>{this.state.estadoNome}</Text>
                                <View style={{right:-8, bottom:-3, width: 12, height:"100%"}}><Icon name="sort-down" color={( this.state.estadoErro == "" ? "#989898" : "#d50000" )} size={18}/></View>
                            </View>
                        </TouchableOpacity>
                        <ModalFilterPicker
                            title="Estado"
                            visible={this.state.estadoVisible}
                            onSelect={(estado) => {this.cidades(estado, 0), this.find("estado",estado)}}
                            onCancel={() => this.onCancel("estadoVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.estadosOptions}
                            selectedOption={this.state.estadoNome}
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
                            onSelect={(cidade) => {this.setState({bairro: "", bairroNome: "Selecione uma opção"}), this.find("cidade",cidade), this.valida("cidade","cidadeErro",6)}}
                            onCancel={() => this.onCancel("cidadeVisible")}
                            noResultsText={"Nenhum resultado encontrado"}
                            placeholderText="Filtro..."
                            options={this.state.cidadesOptions}
                            selectedOption={this.state.cidadeNome}
                            cancelButtonText={"Cancelar"}
                        />
                        {bairroSelectInput}
                        <TextField value={this.state.logradouro} error={this.state.logradouroErro} onChangeText={(logradouro) => this.setState({logradouro})} label={"Logradouro"} onEndEditing={() => this.valida("logradouro","logradouroErro",1)}/>
                        <TextField  keyboardType={"numeric"} value={this.state.numero} maxLength={5} error={this.state.numeroErro} onChangeText={(numero) => this.setState({numero})} label={"Número"} onEndEditing={() => this.valida("numero","numeroErro",1)}/>
                        <TextField onChangeText={(referencia) => this.setState({referencia})} label={"Referência"}/>
                    </View>
                    <View style={styles.cadastrar}>
                        <Button onPress={() => this.buscarLatLong()} title="Buscar no mapa" color="#2C3E50" />
                    </View>
                    <View style={styles.mapa}>
                        <MapView
                            style={styles.mapaContainer}
                            initialRegion={{
                                latitude: -23.62659639859563,
                                longitude: -45.42417526245117,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01
                            }}
                            ref={component => this._map = component}
                            onPress={(e) => {this.marcarMapa(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}}
                        >
                        <Marker
                            coordinate={{latitude: this.state.latitude,longitude: this.state.longitude}}
                        />
                        </MapView>
                    </View>
                    {this.state.mapaErro != "" && (
                    <View style={styles.mapaErro}>
                        <Text style={{ flexWrap: 'wrap',textAlign: 'left', fontSize: 15}}>{this.state.mapaErro}</Text>
                    </View>
                    )}
                    <View style={styles.cadastrar}>
                        <Button disabled={this.state.spinner} onPress={() => {this.spinner(true), setTimeout(() => this.resetarFormulario(),1)}} title="Cadastrar" color="#2C3E50" />
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
        color: '#7f8c8d',
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
        width: 150,
        height: 80,
    },
    arquivosAdicionados: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#7f8c8d",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
        flexDirection: 'row',
        width: "95%",
        height: 45,
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