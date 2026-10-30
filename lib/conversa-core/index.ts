// conversa-core — produto da Fujiex: motor de conversa de qualificação.
// Regra da pasta: nenhum arquivo aqui importa nada de fora de lib/conversa-core/
// nem cita cliente algum. Conferir com um grep por "@/" e por nome de cliente nesta pasta.
export * from "./tipos";
export { avaliar } from "./condicoes";
export { renderTemplate, renderTexto } from "./texto";
export { criarMotor, type Motor, type EtapaResolvida } from "./motor";
export { recomendar } from "./recomendacao";
export { pontuar, rotaDe } from "./pontuacao";
export { comTimeout, rotularComJev } from "./jev";
export { validarValor, normalizar, aplicarMascara, sugerirEmpresa, primeiroNome } from "./util";
