// resolvedor de módulos pros testes (ver registrar.mjs): import relativo sem
// extensão tenta "<x>.ts" e "<x>/index.ts". Arquivo .tsx não roda aqui (JSX).
export async function resolve(especificador, contexto, proximo) {
  try {
    return await proximo(especificador, contexto);
  } catch (erro) {
    const relativo = especificador.startsWith("./") || especificador.startsWith("../");
    if (relativo && !/\.[cm]?[jt]sx?$/.test(especificador)) {
      for (const fim of [".ts", "/index.ts"]) {
        try {
          return await proximo(especificador + fim, contexto);
        } catch {
          // tenta o próximo
        }
      }
    }
    throw erro;
  }
}
