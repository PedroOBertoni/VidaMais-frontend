import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { colors } from "../../src/constants/theme";
import { atualizarMedicamento, buscarMedicamento, inserirMedicamento } from "../../src/database/database";
import { sincronizar } from "../../src/services/sync";
import { converterDataParaISO, formatarData } from "../../src/types/medicamento";

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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = Boolean(id);
  const [form, setForm] = useState({ nome:"", laboratorio:"", validade:"", indicacao:"", contraindicacoes:"", posologia:"", efeitos_adversos:"", precaucoes:"", observacoes:"" });
  const [salvando, setSalvando] = useState(false);
  const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    buscarMedicamento(Number(id)).then(item => {
      if (!item) {
        Alert.alert("Medicamento não encontrado", "O registro solicitado não existe.", [{ text: "OK", onPress: () => router.back() }]);
        return;
      }
      setForm({
        nome: item.nome,
        laboratorio: item.laboratorio,
        validade: formatarData(item.validade),
        indicacao: item.indicacao,
        contraindicacoes: item.contraindicacoes,
        posologia: item.posologia,
        efeitos_adversos: item.efeitos_adversos,
        precaucoes: item.precaucoes,
        observacoes: item.observacoes,
      });
    }).catch(() => Alert.alert("Erro", "Não foi possível carregar o medicamento."));
  }, [id]);

  async function salvar() {
    const validade = converterDataParaISO(form.validade);
    if (!form.nome.trim() || !validade) {
      Alert.alert("Dados inválidos", "Informe o nome e uma data de validade válida no formato DD/MM/AAAA.");
      return;
    }
    setSalvando(true);
    try {
      const dados = { ...form, nome: form.nome.trim(), validade };
      if (id) await atualizarMedicamento(Number(id), dados);
      else await inserirMedicamento(dados);
      const sync = await sincronizar();
      const mensagem = sync.ok
        ? `Medicamento ${editando ? "atualizado" : "cadastrado"} com sucesso.`
        : `Medicamento salvo neste aparelho. Sincronização pendente: ${sync.message}`;
      Alert.alert("Sucesso", mensagem, [{ text: "OK", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o medicamento.");
    } finally { setSalvando(false); }
  }

  return (
    <KeyboardAvoidingView style={{ flex:1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Stack.Screen options={{ title: editando ? "Editar medicamento" : "Novo medicamento" }} />
        <Text style={styles.heading}>{editando ? "Editar medicamento" : "Cadastrar medicamento"}</Text>
        <Text style={styles.sub}>Preencha as informações para acompanhar a validade e a bula.</Text>

        <Text style={styles.label}>Nome do medicamento *</Text>
        <TextInput accessibilityLabel="Nome do medicamento" value={form.nome} onChangeText={v=>set("nome",v)} placeholder="Ex.: Dipirona" style={styles.input} />

        <Text style={styles.label}>Data de validade *</Text>
        <TextInput accessibilityLabel="Data de validade" value={form.validade} onChangeText={v=>set("validade",v)} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} style={styles.input} />

        {campos.map(([key, label]) => <View key={key}>
          <Text style={styles.label}>{label}</Text>
          <TextInput accessibilityLabel={label} value={form[key]} onChangeText={v=>set(key,v)} placeholder={`Informe ${label.toLowerCase()}`} style={[styles.input, styles.textarea]} multiline />
        </View>)}

        <Pressable accessibilityRole="button" accessibilityLabel="Salvar medicamento" disabled={salvando} style={[styles.button, salvando && { opacity:.6 }]} onPress={salvar}>
          <Text style={styles.buttonText}>{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Salvar medicamento"}</Text>
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
