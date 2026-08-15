# Órbita Conector SISREG

Extensão Chrome/Edge Manifest V3 para piloto institucional de integração assistida com o SISREG III.

## Instalação local para homologação

1. Abra `chrome://extensions` ou `edge://extensions`.
2. Ative o modo de desenvolvedor.
3. Escolha **Carregar sem compactação** e selecione esta pasta.
4. Abra o SISREG III e autentique-se exclusivamente na página oficial.
5. Clique no ícone da extensão para abrir o painel lateral.
6. Use **Capturar campos permitidos** e revise o JSON.
7. Copie o pacote e cole na página **Integração SISREG** do Órbita.

## Limites de segurança

- Não captura ou armazena credenciais.
- Não aciona botões de autorização, devolução, negativa, cancelamento ou agendamento.
- Bloqueia rótulos associados a nome, CNS, CPF, telefone, filiação, nascimento e endereço.
- A narrativa clínica fica desabilitada por padrão.
- A captura é iniciada apenas por comando do regulador.
- O adaptador deve ser revalidado após mudanças na versão ou no DOM do SISREG.

## Status

Piloto técnico, não homologado para produção. O mapeamento foi construído a partir da versão SISREG observada em agosto de 2026 e precisa de validação controlada em ambiente de homologação ou com solicitações sintéticas.
