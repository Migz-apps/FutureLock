// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract FutureLock is ReentrancyGuard, Ownable {
    struct Insight {
        address creator;
        string cid;          // IPFS hash of encrypted content
        uint256 unlockTime;
        uint256 price;
        bool exists;
    }

    mapping(uint256 => Insight) public insights;
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    uint256 public nextInsightId;

    event InsightCreated(uint256 id, address creator, uint256 unlockTime, uint256 price);
    event InsightPurchased(uint256 id, address buyer);

    constructor() Ownable(msg.sender) {}

    function createInsight(string memory _cid, uint256 _unlockTime, uint256 _price) external {
        require(_unlockTime > block.timestamp, "Unlock must be in future");
        insights[nextInsightId] = Insight(msg.sender, _cid, _unlockTime, _price, true);
        emit InsightCreated(nextInsightId, msg.sender, _unlockTime, _price);
        nextInsightId++;
    }

    function purchaseInsight(uint256 _id) external payable nonReentrant {
        Insight storage insight = insights[_id];
        require(insight.exists, "Not found");
        require(msg.value >= insight.price, "Insufficient funds");
        require(!hasAccess[_id][msg.sender], "Already purchased");

        hasAccess[_id][msg.sender] = true;
        payable(insight.creator).transfer(msg.value);
        emit InsightPurchased(_id, msg.sender);
    }
}