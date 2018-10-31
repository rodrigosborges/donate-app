import React, { PureComponent } from 'react'
import { StatusBar,Alert, AppRegistry, StyleSheet, View , Picker, Text, TextInput, Button, Image,ScrollView, ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground } from 'react-native'
import Modal from 'react-native-modal'
import { TextField } from 'react-native-material-textfield'
import Icon from 'react-native-vector-icons/FontAwesome'
import {cpfValido} from './Helper.js'
import ModalFilterPicker from 'react-native-modal-filter-picker'
import Spinner from 'react-native-loading-spinner-overlay';

export default class Cadastro extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            nome: "",
            email: "",
            password: "",
            passwordConfirm: "",

            mensagem: [],
            cadastrado: false,
            titulo: "",

            erroForm: true,

            modalOpen: false,

            spinner: false,
        };
    }


    componentWillMount(){
        this.props.navigation.state.params.spinner(false)
        setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
    }

    buscarCepIds(bairro, cidade, estado){
        fetch('http://10.10.209.11/ouvidoria/app/buscaCep', {
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
            this.valida("cidade","cidadeErro",1)
            this.valida("estado","estadoErro",1)
            this.spinner(false)
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            this.spinner(false)
        });
    }

    buscarCep(){
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
            }
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });
    }

    cadastrar(){
        const { navigate } = this.props.navigation;
        fetch('http://10.10.209.11/ouvidoria/app/cadastroUsuario', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: this.state.nome,
                cpf: this.state.cpf,
                telefonePrincipal: this.state.telefonePrincipal,
                telefoneSecundario: this.state.telefoneSecundario,

                email: this.state.email,
                password: this.state.password,
                password_confirmation: this.state.passwordConfirm,

                cep: this.state.cep,
                rua: this.state.logradouro,
                numero: this.state.numero,
                referencia: this.state.referencia,
                cidade_id: this.state.cidade,
                bairro: this.state.bairro,
            }),
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson[1][0] == "Cadastro efetuado com sucesso!")
                var titulo = "SUCESSO"
            else
                var titulo = "ERRO"
            this.setState({cadastrado: responseJson[0],titulo: titulo, mensagem: responseJson[1], isVisible: true})
            this.spinner(false)
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            this.spinner(false)
        })
    }

    estados(){
        fetch('http://10.10.209.11/ouvidoria/app/estados', {
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
                this.valida("cidade","cidadeErro",1)
                this.find("bairro","")
            })
        }else{
            this.setState({cidade: "", cidadeNome: "Selecione uma opção"},() => {
                this.find("bairro","")
            })  
        }
        
        fetch('http://10.10.209.11/ouvidoria/app/cidades/'+estado_id, {
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
        fetch('http://10.10.209.11/ouvidoria/app/bairros', {
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

    localizacaoAtual(){
        this.spinner(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.preencherEnderecoAtual(position.coords.latitude, position.coords.longitude)
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

    mascaraCep(cep){
        cep = cep.replace(/[^0-9]/g, '');
        this.setState({cep},() => {
            if(cep.length>4)
                cep = cep.substring(0,5)+"-"+ cep.substring(5,8)
            this.setState({cep})
        })
    }

    mascaraTelefonePrimario(telefonePrincipal){
        telefonePrincipal = telefonePrincipal.replace(/[^0-9]/g, '');
        this.setState({telefonePrincipal},() => {
            if(telefonePrincipal.length >= 2)
                telefonePrincipal = "("+ telefonePrincipal.substring(0,2)+")"+telefonePrincipal.substring(2,12)
            if(telefonePrincipal.length > 8 && telefonePrincipal.length <= 12)
                telefonePrincipal = telefonePrincipal.substring(0,8)+ "-" + telefonePrincipal.substring(8,12)
            else if(telefonePrincipal.length > 8 && telefonePrincipal.length > 12)
                telefonePrincipal = telefonePrincipal.substring(0,9)+ "-"+ telefonePrincipal.substring(9,13)
            this.setState({telefonePrincipal})
        })
    }

    mascaraTelefoneSecundario(telefoneSecundario){
        telefoneSecundario = telefoneSecundario.replace(/[^0-9]/g, '');
        this.setState({telefoneSecundario},() => {
            if(telefoneSecundario.length >= 2)
                telefoneSecundario = "("+ telefoneSecundario.substring(0,2)+")"+telefoneSecundario.substring(2,12)
            if(telefoneSecundario.length > 8 && telefoneSecundario.length <= 12)
                telefoneSecundario = telefoneSecundario.substring(0,8)+ "-" + telefoneSecundario.substring(8,12)
            else if(telefoneSecundario.length > 8 && telefoneSecundario.length > 12)
                telefoneSecundario = telefoneSecundario.substring(0,9)+ "-"+ telefoneSecundario.substring(9,13)
            this.setState({telefoneSecundario})
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
                if(!cpfValido(val))
                    mensagemErro += "Digite um "+ref+" válido"
                break
            case 3:
                if(val.length < 13 && val.length != 0)
                    mensagemErro += "Digite um telefone válido"
                break
            case 4:
                if(val.length < 9 && val.length != 0)
                    mensagemErro += "Digite um CEP válido"
                else if(val.length == 9)
                    this.buscarCep()
                break
            case 5:
                if(val.length == 0 || !val.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) && val.length != 0)
                    mensagemErro += "Digite um e-mail válido"
                break
            case 6:
                if(!val.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/))
                    mensagemErro += "Deve conter números, letras e caractere especial"
                break
            case 7:
                if(val != this.state.password)
                    mensagemErro += "As senhas não conferem"
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
            this.valida("nome","nomeErro",1)
            this.valida("cpf","cpfErro",2)
            this.valida("telefonePrincipal","telefonePrincipalErro",3)
            this.valida("telefoneSecundario","telefoneSecundarioErro",3)
            this.valida("cidade","cidadeErro",1)
            this.valida("estado","estadoErro",1)
            this.valida("bairro","bairroErro",1)
            this.valida("logradouro","logradouroErro",1)
            this.valida("numero","numeroErro",1)
            this.valida("email","emailErro",5)
            this.valida("password","passwordErro",6)
            this.valida("passwordConfirm","passwordConfirmErro",7)

            if(this.state.erroForm == true){
                this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true})
                this.spinner(false)
            }else
                this.cadastrar()
        }, 1)            
    }
    
    mascaraCpf(cpf){
        cpf = cpf.replace(/[^0-9]/g, '');
        this.setState({cpf},() => {
            if(cpf.length>3)
            cpf = cpf.substring(0,3)+ "."+ cpf.substring(3,13)
            if(cpf.length>7)
            cpf = cpf.substring(0,7)+ "."+ cpf.substring(7,13)
            if(cpf.length>11)
                cpf = cpf.substring(0,11)+ "-"+ cpf.substring(11,13)
            this.setState({cpf})
        })
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
                {this._renderButton("Fechar", () => (this.state.cadastrado) ? (goBack()) : (this.setState({ isVisible: false })))}
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

    spinner(bol){
        this.setState({spinner: bol})
    }
    
    render() {
        var cpf = ""
        const { navigate } = this.props.navigation
        const { goBack } = this.props.navigation
        const bairroSelectInput = this.state.cidade == 4826? 
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
                <Modal
                    isVisible={this.state.isVisible}
                    animationIn="slideInLeft"
                    animationOut="slideOutRight"
                    >
                    {this._renderModalContent(goBack)}
                </Modal>
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <ScrollView keyboardShouldPersistTaps="handled" ref="_scrollView" contentContainerStyle={styles.scroll}>
                    <View style={styles.formulario}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Dados Pessoais</Text>
                        </View>
                        <View style={styles.inputs}>
                            <TextField label="Nome" error={this.state.nomeErro} value={this.state.nome} onChangeText={(nome) => this.setState({nome})} onEndEditing={(e) => this.valida("nome","nomeErro",1)}/>
                        </View>
                        <View style={styles.inputs}>
                            <TextField error={this.state.emailErro} autoCapitalize="none" onChangeText={(email) => this.setState({email})} label={"E-mail"} keyboardType={'email-address'} onEndEditing={() => this.valida("email","emailErro",5)}/>
                        </View>
                        <View style={styles.inputs}>
                            <TextField autoCapitalize="none" error={this.state.passwordErro} onChangeText={(password) => this.setState({password})} label={"Senha"} secureTextEntry={true} onEndEditing={() => this.valida("password","passwordErro",6)}/>
                        </View>
                        <View style={styles.inputs}>
                            <TextField autoCapitalize="none" disabled={this.state.password == ""} error={this.state.passwordConfirmErro} onChangeText={(passwordConfirm) => this.setState({passwordConfirm})} label={"Confirmar Senha"} secureTextEntry={true} onEndEditing={() => this.valida("passwordConfirm","passwordConfirmErro",7)}/>
                        </View>
                    </View>
                    <View style={styles.cadastrar}>
                        <Button disabled={this.state.spinner} onPress={() => {this.spinner(true), setTimeout(() => this.resetarFormulario(),1)}} title="Cadastrar" color="#800000" />
                    </View>
                </ScrollView>
            </View>
        );
    }
}



let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
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
    cadastrar: {
        width: width*0.9,
        marginLeft: width*0.05,
        marginTop: height*0.02,
        marginBottom: height*0.02,
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

})