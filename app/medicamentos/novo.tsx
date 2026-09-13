import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { colors } from "../../src/constants/theme";
import { inserirMedicamento } from "../../src/database/database";
import { sincronizar } from "../../src/services/sync";

const campos = [
  ["laboratorio", "Laboratório"],
  ["indicacao", "Indicação"],
  ["contraindicacoes", "Contraindicações"],
  ["posologia", "Posologia"],
  ["efeitos_adversos", "Efeitos adversos"],
  ["precaucoes", "Precauções"],
  ["observacoes", "Observações"],
] as const;

export default function NovoMedicamento() {
  const [form, setForm] = useState({ nome:"", laboratorio:"", validade:"", indicacao:"", contraindicacoes:"", posologia:"", efeitos_adversos:"", precaucoes:"", observacoes:"" });
  const [salvando, setSalvando] = useState(false);
  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  async function salvar() {
    if (!form.nome.trim() || !/^\\d{2}\\/\\d{2}\\/\\d{4}$/.test(form.validade)) {
      Alert.alert("Dados incompletos", "Informe o nome e a validade no formato DD/MM/AAAA.");
      return;
    }
    const [dia, mes, ano] = form.validade.split("/");
    const validade = `${ano}-${mes}-${dia}`;
    setSalvando(true);
    try {
      await inserirMedicamento({ ...form, nome: form.nome.trim(), validade });
      await sincronizar();
      Alert.alert("Sucesso", "Medicamento cadastrado com sucesso.", [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o medicamento.");
    } finally { setSalvando(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Cadastrar medicamento</Text>
        <Text style={styles.sub}>Preencha as informações para acompanhar a validade e a bula.</Text>

        <Text style={styles.label}>Nome do medicamento *</Text>
        <TextInput value={form.nome} onChangeText={v=>set("nome",v)} placeholder="Ex.: Dipirona" style={styles.input} />

        <Text style={styles.label}>Data de validade *</Text>
        <TextInput value={form.validade} onChangeText={v=>set("validade",v)} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} style={styles.input} />

        {campos.map(([key, label]) => <View key={key}>
          <Text style={styles.label}>{label}</Text>
          <TextInput value={form[key]} onChangeText={v=>set(key,v)} placeholder={`Informe ${label.toLowerCase()}`} style={[styles.input, styles.textarea]} multiline />
        </View>)}

        <Pressable disabled={salvando} style={[styles.button, salvando && { opacity:.6 }]} onPress={salvar}>
          <Text style={styles.buttonText}>{salvando ? "Salvando..." : "Salvar medicamento"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background}, content:{padding:20,paddingBottom:40},
  heading:{fontSize:25,fontWeight:"900",color:colors.text}, sub:{color:colors.muted,lineHeight:19,marginTop:5,marginBottom:22},
  label:{fontWeight:"800",color:colors.text,fontSize:13,marginBottom:7,marginTop:13},
  input:{backgroundColor:colors.card,borderWidth:1,borderColor:colors.border,borderRadius:13,padding:13,color:colors.text,minHeight:48},
  textarea:{minHeight:85,textAlignVertical:"top"},
  button:{backgroundColor:colors.primary,borderRadius:15,height:54,alignItems:"center",justifyContent:"center",marginTop:25},
  buttonText:{color:"white",fontSize:15,fontWeight:"900"},
});
