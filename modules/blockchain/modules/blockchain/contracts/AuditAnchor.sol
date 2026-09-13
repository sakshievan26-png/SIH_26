// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// One deployment per journal. No PII, document hash, or risk score on-chain.
contract AuditAnchor {
    address public immutable owner;
    mapping(address => bool) public writers;
    mapping(uint256 => bytes32) public hashes;
    uint256 public count;
    bytes32 public head;

    event Anchored(uint256 indexed sequence, bytes32 digest, address indexed writer);
    event WriterChanged(address indexed writer, bool allowed);

    constructor() {
        owner = msg.sender;
        writers[msg.sender] = true;
    }

    function setWriter(address writer, bool allowed) external {
        require(msg.sender == owner, "owner only");
        require(writer != address(0), "zero writer");
        writers[writer] = allowed;
        emit WriterChanged(writer, allowed);
    }

    function anchor(uint256 sequence, bytes32 previous, bytes32 digest) external {
        require(writers[msg.sender], "writer only");
        require(digest != bytes32(0), "zero digest");
        // Exact retries are safe; rewriting any old commitment is impossible.
        if (sequence > 0 && sequence <= count) {
            require(hashes[sequence] == digest, "conflicting retry");
            return;
        }
        require(sequence == count + 1 && previous == head, "out of order");
        hashes[sequence] = digest;
        head = digest;
        count = sequence;
        emit Anchored(sequence, digest, msg.sender);
    }
}
