function getInitialThreadPrompt({  name }) {
  return `[SISTEMA - INICIO]${
    name
      ? `O nome do contato em que você está conversando, sugerido pelo WhatsApp é "${name}", mas não sei se este é o nome ou só um apelido, então deve perguntar.`
      : "O contato em que você está conversando não tem um nome no sistema, é necessário que solicite o nome."
  }O produto na venda da cantina para retirada no próximo domingo, 09 de fevereiro de 2025, será Cachorro-quente, no valor unitário de R$10.[SISTEMA - FIM]`;
}

module.exports = { getInitialThreadPrompt };
