// conversa-core — produto da Fujiex: motor de conversa de qualificação.
// Regra da pasta: nenhum arquivo aqui importa nada de fora de lib/conversa-core/
// nem cita cliente algum. Conferir com um grep por "@/" e por nome de cliente nesta pasta.
export * from "./tipos";
export { avaliar, geradoValido } from "./condicoes";
export { renderTemplate, renderTexto } from "./texto";
export { criarMotor, type Motor, type EtapaResolvida } from "./motor";
export { recomendar } from "./recomendacao";
export { pontuar, rotaDe, rotuloFinal } from "./pontuacao";
export { lerSinais, sinaisDoCaminho, resolverOrigem, casa, casaOrigem } from "./origem";
export { montarMapa } from "./mapa";
export { dominioDe, pedirEmpresa } from "./enriquecimento";
export { comTimeout, rotularComJev, pedirGeracao, novaSessao } from "./jev";
// o lado do servidor (LLM, Jev, custo) fica em "./servidor" e só entra em rota de API
export { validarValor, normalizar, aplicarMascara, sugerirEmpresa, sugerirNome, primeiroNome } from "./util";
