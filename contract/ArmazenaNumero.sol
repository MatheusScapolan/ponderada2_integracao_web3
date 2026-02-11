// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArmazenaNumero {
    uint256 private numero;
    address private ultimoUsuario;
    event NumeroDefinido(address usuario, uint256 novoNumero);

    function definirNumero(uint256 _novoNumero) public {
        numero = _novoNumero;
        ultimoUsuario = msg.sender;
        emit NumeroDefinido(msg.sender, _novoNumero);
    }

    function lerNumero() public view returns (uint256) {
        return numero;
    }

    function lerUltimoUsuario() public view returns (address) {
        return ultimoUsuario;
    }
}