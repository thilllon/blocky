# blocky

- `blockies`, `ethereum-blockies` (동일): js로 작성. ethereum mist library에 사용됨.

  - https://github.com/ethereum/blockies
  - createIcon, render도 제공됨

- `blockies-ts`: ts로 포팅.

  - https://github.com/pedrouid/blockies-ts/blob/bda2f2c124a3ab404dcf5077ac7a3545548edfb1/src/index.ts

- `ethereum-blockies-png`: output을 buffer, png로 변환.

  - https://github.com/petejkim/ethereum-blockies-png/blob/master/index.js
  - render사용하지 않고, png로 만들어줌
  - https://github.com/MyCryptoHQ/ethereum-blockies-base64/blob/master/src/main.js

- `react-blockies`: output을 react 컴포넌트로 랩핑

  - https://github.com/stephensprinkle-zz/react-blockies/blob/master/src/main.jsx

- 참고
- https://github.com/download13/blockies/blob/master/src/blockies.mjs
  <!-- return 'data:image/png;base64,' + buf.toString('base64') -->
