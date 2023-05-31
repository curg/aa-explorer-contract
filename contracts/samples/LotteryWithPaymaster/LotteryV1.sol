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
    mapping(uint256 => address[]) public roundPlayers;
    mapping(address => mapping(uint256 => bool)) public refunded;
    uint256 public winningNumber;
    bool public lotteryOpen = false;
    uint256 public round = 0;
    uint256 public maxTickets = 100;  // max tickets per round

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
        require(!lotteryOpen, "Lottery is not open");
        require(_number >= 1 && _number <= 10, "Number must be between 1 and 10");
        require(_amount >= ticketPrice && _amount % ticketPrice == 0, "Amount must be a multiple of the ticket price");
        //복권이 열려 있을 때(즉, 모든 티켓이 매진된 경우) 구매를 방지하기 위해 buyTicket 함수에 확인을 추가했습니다.
        require(roundPlayers[round].length < maxTickets, "All tickets for this round are sold");

        token.transferFrom(msg.sender, address(this), _amount);
        
        tickets[msg.sender][round] = Ticket(_number, _amount, round);

        roundPlayers[round].push(msg.sender);

        if(roundPlayers[round].length >= maxTickets) {
            lotteryOpen = true;
        }
    }
 //drawWinningNumber 함수는 복권이 오픈된 경우에만 호출할 수 있음.
    function drawWinningNumber() external onlyOwner {
        require(lotteryOpen, "Lottery is not ready yet");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        requestRandomness(keyHash, fee);
    }

    function claimPrize() external {
        require(!lotteryOpen, "Lottery is still open");
        require(tickets[msg.sender][round-1].number == winningNumber, "Sorry, you didn't win");

        uint256 prize = tickets[msg.sender][round-1].amount * 10;
        require(token.balanceOf(address(this)) >= prize, "Not enough tokens in contract to give the prize");

        delete tickets[msg.sender][round-1];

        token.transfer(msg.sender, prize);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        winningNumber = (randomness % 10) + 1;
        lotteryOpen = false;
    }
// 즉시 토큰을 전송하지 않고 환불 가능한 것으로 표시합니다.
    function startNewRound() external onlyOwner {
        require(!lotteryOpen, "Close the current round before starting a new one");

        for (uint i = 0; i < roundPlayers[round-1].length; i++) {
            address player = roundPlayers[round-1][i];
            uint256 amountToRefund = tickets[player][round-1].amount;
            if (amountToRefund > 0 && tickets[player][round-1].number != winningNumber) {
                refunded[player][round-1] = true;
            }
        }

        delete roundPlayers[round-1];

        round++;
    }
//플레이어는 원할 때 환불을 철회할 수 있습니다.
//복권이 시작할 때 열려 있지 않습니다(생성자가 lotteryOpen을 false로 설정). 현재 라운드의 모든 티켓이 매진되면 새로운 라운드가 시작됩니다.
    function withdrawRefund(uint256 _round) external {
        require(!refunded[msg.sender][_round], "Refund already withdrawn");
        require(tickets[msg.sender][_round].number != winningNumber, "Winning tickets cannot be refunded");

        uint256 amountToRefund = tickets[msg.sender][_round].amount;
        if (amountToRefund > 0) {
            token.transfer(msg.sender, amountToRefund);
            refunded[msg.sender][_round] = true;
            delete tickets[msg.sender][_round];
        }
    }

    function buyTokens(uint256 _amount) external payable {
        uint256 amountInWei = _amount * 1 ether;
        require(msg.value == amountInWei, "The amount of ETH sent is not correct");

        token.transfer(msg.sender, _amount);
    }
}