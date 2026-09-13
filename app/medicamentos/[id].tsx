import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { colors } from "../../src/constants/theme";
import { buscarMedicamento, excluirMedicamento } from "../../src/database/database";
import { diasRestantes, formatarData, getStatusValidade, Medicamento } from "../../src/types/medicamento";
import { StatusBadge } from "../../src/components/StatusBadge";

export default function Detalhes() {
  const { id } = useLocalSearchParams<{id:string}>();
  const [item, setItem] = useState<Medicamento | null>(null);
  const carregar = useCallback(async()=>setItem(await buscarMedicamento(Number(id))),[id]);
  useEffect(()=>{carregar()},[carregar]);
  useFocusEffect(useCallback(()=>{carregar()},[carregar]));

  if (!item) return <View style={styles.center}><Text>Carregando...</Text></View>;
  const status=getStatusValidade(item.validade), dias=diasRestantes(item.validade);

  const excluir=()=>Alert.alert("Excluir medicamento", "Deseja realmente excluir este medicamento?", [
    {text:"Cancelar",style:"cancel"}, {text:"Excluir",style:"destructive",onPress:async()=>{await excluirMedicamento(item.id);router.back();}}
  ]);

  const sec=[["Indicação",item.indicacao],["Contraindicações",item.contraindicacoes],["Posologia",item.posologia],["Efeitos adversos",item.efeitos_adversos],["Precauções",item.precaucoes],["Observações",item.observacoes]];

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.hero}><View style={styles.bigIcon}><Text style={{fontSize:35}}>💊</Text></View><Text style={styles.name}>{item.nome}</Text>{!!item.laboratorio&&<Text style={styles.lab}>{item.laboratorio}</Text>}<StatusBadge status={status}/></View>
    <View style={styles.validity}><Text style={styles.validityLabel}>VALIDADE</Text><Text style={styles.date}>{formatarData(item.validade)}</Text><Text style={styles.days}>{status==="vencido"?`Vencido há ${Math.abs(dias)} dia(s)`: `${dias} dia(s) restantes`}</Text></View>
    {sec.map(([title,text])=>text?<View key={title} style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.body}>{text}</Text></View>:null)}
    <View style={styles.actions}><Pressable style={styles.primary} onPress={()=>router.push(`/bula/${item.id}`)}><Text style={styles.primaryText}>📖  Ver bula</Text></Pressable><Pressable style={styles.secondary} onPress={()=>Alert.alert("Edição","Para esta versão, altere o cadastro criando uma nova versão do registro.")}><Text style={styles.secondaryText}>Editar</Text></Pressable><Pressable style={styles.delete} onPress={excluir}><Text style={styles.deleteText}>Excluir</Text></Pressable></View>
  </ScrollView>;
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.background},content:{padding:20,paddingBottom:40},center:{flex:1,alignItems:"center",justifyContent:"center"},
 hero:{alignItems:"center",backgroundColor:colors.card,borderRadius:20,padding:22,borderWidth:1,borderColor:colors.border},
 bigIcon:{width:72,height:72,borderRadius:22,backgroundColor:colors.primaryLight,alignItems:"center",justifyContent:"center",marginBottom:10},
 name:{fontSize:23,fontWeight:"900",color:colors.text,textAlign:"center"},lab:{color:colors.muted,marginTop:3,marginBottom:10},
 validity:{backgroundColor:colors.card,borderRadius:18,padding:18,marginTop:13,borderWidth:1,borderColor:colors.border},validityLabel:{fontSize:11,fontWeight:"900",color:colors.muted},date:{fontSize:22,fontWeight:"900",color:colors.text,marginTop:4},days:{color:colors.warning,fontWeight:"700",marginTop:3},
 section:{backgroundColor:colors.card,borderRadius:16,padding:16,marginTop:12,borderWidth:1,borderColor:colors.border},sectionTitle:{fontWeight:"900",color:colors.text,marginBottom:7},body:{color:colors.muted,lineHeight:20},
 actions:{gap:10,marginTop:18},primary:{height:50,borderRadius:14,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center"},primaryText:{color:"white",fontWeight:"900"},secondary:{height:50,borderRadius:14,borderWidth:1,borderColor:colors.primary,alignItems:"center",justifyContent:"center"},secondaryText:{color:colors.primary,fontWeight:"900"},delete:{height:50,borderRadius:14,alignItems:"center",justifyContent:"center"},deleteText:{color:colors.danger,fontWeight:"800"}
});
