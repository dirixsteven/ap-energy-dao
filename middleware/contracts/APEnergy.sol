// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract APEnergy is AccessControl {
  bytes32 private immutable RESOURCE_ROLE = keccak256("RESOURCE");
  bytes32 private immutable PARTICIPANT_ROLE = keccak256("PARTICIPANT");

  address[] public participants;
  
  mapping(address => Resource) private resources;
  mapping(address => address[]) private participantResources;
  mapping(address => LoggedPower[]) private ResourceLoggedPower;

  struct LoggedPower {
    uint256 timestamp;
    string dayConsumption;
    string dayProduction;
  }

  // struct Participant {
  //   uint256 id;
  //   string name;
  // }

  struct Resource {
    string resourceType;
    // additional resource parameters can be added here
  }

  event ParticipantAdded (
    address indexed participant,
    uint256 timestamp
  );

  event ResourceAdded (
    address indexed participant,
    address indexed resource,
    uint256 timestamp,
    string resourceType
  );

  event PowerLogged (
    address indexed resource,
    uint256 timestamp,
    string dayConsumption,
    string dayProduction
  );

  modifier participantOnly(string memory message) {
    require(hasRole(PARTICIPANT_ROLE, msg.sender), message);
    _;
  }

  modifier resourceOnly(string memory message) {
    require(hasRole(RESOURCE_ROLE, msg.sender), message);
    _;
  }

  function addParticipant() public {
    // require(!(participants[msg.sender] > 0), "address can only be registered once");
    // can also require the participant to buy a token at this point
    for (uint i = 0; i < participants.length; i++) {
      if (participants[i] == msg.sender) {
        revert("addresses can only be registered once");
      }
    }
    participants.push(msg.sender);
    _setupRole(PARTICIPANT_ROLE, msg.sender);

    emit ParticipantAdded(msg.sender, block.timestamp);
  }

  function getParticipants() public view returns (address[] memory participants_) {
    participants_ = new address[](participants.length);

    for (uint256 i = 0; i < participants.length; i++) {
      participants_[i] = participants[i];
    }
  }

  function addResource(address _resourceAddress, string calldata _resourceType) public participantOnly("Only participants can register DERs") {
    Resource storage resource = resources[_resourceAddress];
    _setupRole(RESOURCE_ROLE, _resourceAddress);

    resource.resourceType = _resourceType;

    // Link participant to DER
    participantResources[msg.sender].push(_resourceAddress);

    emit ResourceAdded(msg.sender, _resourceAddress, block.timestamp, _resourceType);
  }

  function getParticipantResources(address _participantAddress) public view returns (address[] memory resources_) {
    resources_ = new address[](participantResources[_participantAddress].length);

    for (uint256 i = 0; i < participantResources[_participantAddress].length; i++) {
      resources_[i] = participantResources[_participantAddress][i];
    }
  }

  function logPowerConsumption(uint256 _timestamp, string calldata _dayConsumption, string calldata _dayProduction) public resourceOnly("Only Resources can log power") {
    // note: timestamp can possible be replaced with block.timestamp
    ResourceLoggedPower[msg.sender].push(LoggedPower(_timestamp, _dayConsumption, _dayProduction));
    
    emit PowerLogged(msg.sender, _timestamp, _dayConsumption, _dayProduction);
  }

  function getResourcePowerConsumption(address _resource) public view returns (LoggedPower[] memory) {
    return ResourceLoggedPower[_resource];
  }
}