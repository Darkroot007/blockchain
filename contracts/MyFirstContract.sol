// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MyFirstContract {
    mapping(address => uint256) public balances;

    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event Transferred(address indexed from, address indexed to, uint256 amount);

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value, balances[msg.sender]);
    }

    function withdraw(uint256 amount) public {
        if (amount > balances[msg.sender]) {
            revert("not enough balance");
        }
        // Effects before interaction: balance is reduced before the external
        // call below, so a reentrant call back into withdraw() during the ETH
        // transfer sees the already-reduced balance and can't drain more than
        // the caller actually had.
        balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount, balances[msg.sender]);

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
    }

    function transfer(address to, uint256 amount) public {
        require(to != address(0), "cannot transfer to zero address");
        if (amount > balances[msg.sender]) {
            revert("not enough balance");
        }
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transferred(msg.sender, to, amount);
    }
}
