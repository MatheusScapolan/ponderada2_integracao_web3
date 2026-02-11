const btnConectar = document.getElementById("btnConectar");
const spanConta = document.getElementById("conta");
const btnDefinir = document.getElementById("btnDefinir");
const inputNumero = document.getElementById("novoNumero");
const spanNumeroAtual = document.getElementById("numeroAtual");
const spanUltimoUsuario = document.getElementById("ultimoUsuario");
const spanTaxasGastas = document.getElementById("taxasGastas");

let provider;
let signer;
let contrato;

// ABI atualizado com lerUltimoUsuario e evento NumeroDefinido
const abiContrato = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_novoNumero", "type": "uint256" }
    ],
    "name": "definirNumero",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lerNumero",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lerUltimoUsuario",
    "outputs": [ { "internalType": "address", "name": "", "type": "address" } ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "usuario", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "novoNumero", "type": "uint256" }
    ],
    "name": "NumeroDefinido",
    "type": "event"
  }
];

// Endereço do contrato (atualize para o endereço correto após deploy)
const enderecoContrato = "0x2505BDba93dc2e211E9552093A54897EA55B78c5";

btnConectar.onclick = async () => {
  if (window.ethereum === undefined) {
    alert("MetaMask não encontrada!");
    return;
  }
  const contas = await window.ethereum.request({ method: "eth_requestAccounts" });
  const conta = contas[0];
  spanConta.innerText = conta;
  provider = new ethers.providers.Web3Provider(window.ethereum);
  signer = provider.getSigner();
  contrato = new ethers.Contract(enderecoContrato, abiContrato, signer);
  await atualizarNumeroAtual();
  await calcularTaxasGastas();
};

btnDefinir.onclick = async () => {
  if (!contrato) {
    alert("Conecte a MetaMask primeiro!");
    return;
  }
  const valor = inputNumero.value;
  try {
    const tx = await contrato.definirNumero(valor);
    await tx.wait();
    await atualizarNumeroAtual();
    await calcularTaxasGastas();
    alert("Transação realizada com sucesso!");
  } catch (e) {
    alert("Erro ao enviar transação: " + e.message);
  }
};

async function atualizarNumeroAtual() {
  if (!contrato) return;
  const numero = await contrato.lerNumero();
  spanNumeroAtual.innerText = numero;
  // Buscar e mostrar o último usuário
  const ultimoUsuario = await contrato.lerUltimoUsuario();
  spanUltimoUsuario.innerText = ultimoUsuario;
}

async function calcularTaxasGastas() {
  if (!provider || !signer) return;
  const conta = await signer.getAddress();
  const filtro = {
    address: enderecoContrato,
    fromBlock: 0,
    toBlock: "latest"
  };
  let totalTaxas = ethers.BigNumber.from(0);
  const logs = await provider.getLogs(filtro);
  for (const log of logs) {
    const tx = await provider.getTransaction(log.transactionHash);
    if (tx.from.toLowerCase() === conta.toLowerCase()) {
      const receipt = await provider.getTransactionReceipt(log.transactionHash);
      const taxa = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      totalTaxas = totalTaxas.add(taxa);
    }
  }
  const totalEth = ethers.utils.formatEther(totalTaxas);
  spanTaxasGastas.innerText = Number(totalEth).toFixed(6);
}

if (window.ethereum) {
  window.ethereum.on('accountsChanged', () => { location.reload(); });
  window.ethereum.on('chainChanged', () => { location.reload(); });
}