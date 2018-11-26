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
            
            erroForm: true,
            spinner: false,
        };
    }


    componentWillMount(){
        this.props.navigation.state.params.spinner(false)
        setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
    }


    cadastrar(){
        const { navigate } = this.props.navigation;
        fetch('http://donate-ifsp.ga/app/usuario/insert', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: this.state.nome,
                email: this.state.email,
                password: this.state.password,
                passwordConfirm: this.state.passwordConfirm,
            }),
        }).then((response) => response.json())
        .then((responseJson) => {
            const { navigation } = this.props.navigation
            if(responseJson == true){
                Alert.alert(
                    'Sucesso',
                    'Cadastro realizado!',
                    [{text: 'Ok', onPress: () => navigation.goBack()}],
                    {cancelable: false}
                );
            }else{
                Alert.alert(
                    'Sem conexão',
                    'Verifique sua conexão com a internet',
                );
            }
            this.spinner(false)
        })
        .catch((error) => {
            Alert.alert(
                'Sem conexão',
                'Verifique sua conexão com a internet',
            );
            this.spinner(false)
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

    mensagens() {
        return this.state.mensagem.map(function(mensagem, i){
            return(
                <View key={i}>
                <Text style={{fontSize: 16, marginBottom: 3}}>{mensagem}</Text>
                </View>
            );
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
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <ScrollView keyboardShouldPersistTaps="handled" ref="_scrollView" contentContainerStyle={styles.scroll}>
                    <View style={styles.formulario}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Dados cadastrais</Text>
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
        color: '#800000',
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