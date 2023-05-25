// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract Lottery is VRFConsumerBase, Ownable {
    // The struct for a lottery ticket
    struct Ticket {
        uint256 number;
        uint256 amount;
        uint256 round;
    }

    // Lottery state
    mapping(address => mapping(uint256 => Ticket)) public tickets;
    //For the new round user can buy ticket
    //Track the number of tickets bought per round
    mapping(uint256 => address[]) public roundPlayers;
    // Keep track of the refund status of each ticket
    //For batch refund
    mapping(address => mapping(uint256 => bool)) public refunded;
    uint256 public winningNumber;
    bool public lotteryOpen = true;
    uint256 public round = 0;

    // Token related
    ERC20 public token;
    uint256 public ticketPrice;

    // Chainlink VRF related
    bytes32 internal keyHash;
    uint256 internal fee;
 
    constructor(address _vrfCoordinator, address _link, bytes32 _keyHash, uint256 _fee, ERC20 _token, uint256 _ticketPrice) 
    VRFConsumerBase(_vrfCoordinator, _link) {
        keyHash = _keyHash;
        fee = _fee;
        token = _token;
        ticketPrice = _ticketPrice;
    }

    function buyTicket(uint256 _number, uint256 _amount) external {
        require(lotteryOpen, "Lottery is not open");
        require(_number >= 1 && _number <= 10, "Number must be between 1 and 10");
        require(_amount >= ticketPrice && _amount % ticketPrice == 0, "Amount must be a multiple of the ticket price");

        // Transfer tokens from the user to the contract
        token.transferFrom(msg.sender, address(this), _amount);
        
        // Record the user's ticket
        tickets[msg.sender][round] = Ticket(_number, _amount, round);

         // Record the user as a player for this round
        roundPlayers[round].push(msg.sender);
    }

    function drawWinningNumber() external onlyOwner {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        requestRandomness(keyHash, fee);
    }

    function claimPrize() external {
        require(!lotteryOpen, "Lottery is still open");
        require(tickets[msg.sender][round-1].number == winningNumber, "Sorry, you didn't win");

        uint256 prize = tickets[msg.sender][round-1].amount * 10;
        require(token.balanceOf(address(this)) >= prize, "Not enough tokens in contract to give the prize");

        // Transfer the prize to the winner
        token.transfer(msg.sender, prize);

        // Delete the winner's ticket
        delete tickets[msg.sender][round-1];
    }

    // Function to fulfill randomness
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        winningNumber = (randomness % 10) + 1;  // get a number between 1 and 10
        lotteryOpen = false;  // close the lottery
    }

    // Function to start a new round
    function startNewRound() external onlyOwner {
        require(!lotteryOpen, "Close the current round before starting a new one");
         // Refund tokens to the players of the previous round, excluding the winner
        for (uint i = 0; i < roundPlayers[round-1].length; i++) {
            address player = roundPlayers[round-1][i];
            uint256 amountToRefund = tickets[player][round-1].amount;
            if (amountToRefund > 0 && tickets[player][round-1].number != winningNumber) {
                token.transfer(player, amountToRefund);
                delete tickets[player][round-1];
            } else if (tickets[player][round-1].number == winningNumber) {
                // Do nothing, don't refund the winner
            }
        }

        // Clean up the player list from the previous round
        delete roundPlayers[round-1];

        // Increment the round number and reopen the lottery
        round++;
        lotteryOpen = true;
    }
    
    // Functions to manage the token <-> ETH swap
    function withdrawETH(uint256 _amount) external onlyOwner {
             require(!lotteryOpen, "Cannot withdraw during an open round");
        require(!refunded[msg.sender][_round], "Refund already withdrawn");
        require(tickets[msg.sender][_round].number != winningNumber, "Winning tickets cannot be refunded");

        uint256 amountToRefund = tickets[msg.sender][_round].amount;
        if (amountToRefund > 0) {
            token.transfer(msg.sender, amountToRefund);
            refunded[msg.sender][_round] = true;
            delete tickets[msg.sender][_round];
        }
    }

    }

    function buyTokens(uint256 _amount) external payable {
        uint256 amountInWei = _amount * 1 ether;
        require(msg.value == amountInWei, "The amount of ETH sent is not correct");

        // Transfer tokens from the contract to the user
        token.transfer(msg.sender, _amount);

        // Keep the ETH in the contract
    }
}