export const MEDICAL_RECORD_LEDGER_ABI = [
  "function owner() view returns (address)",
  "function isPractitionerVerified(address practitioner) view returns (bool)",
  "function registerPractitioner(address practitioner, string name, string hospitalName)",
  "function revokePractitioner(address practitioner)",
  "function addRecord(bytes32 patientHash, bytes32 fileHash, string storageURI, string recordType)",
  "function getPatientRecords(bytes32 patientHash) returns (tuple(bytes32 fileHash, string storageURI, address practitionerAddress, uint256 timestamp, string recordType)[])",
  "function viewPatientRecords(bytes32 patientHash) view returns (tuple(bytes32 fileHash, string storageURI, address practitionerAddress, uint256 timestamp, string recordType)[])",
  "function getRecordCount(bytes32 patientHash) view returns (uint256)",
  "event PractitionerRegistered(address indexed practitioner, string name, string hospitalName, uint256 registeredAt)",
  "event PractitionerRevoked(address indexed practitioner, uint256 revokedAt)",
  "event RecordAdded(bytes32 indexed patientHash, bytes32 indexed fileHash, string storageURI, address indexed practitioner, uint256 timestamp, string recordType)",
  "event RecordAccessed(bytes32 indexed patientHash, address indexed practitioner, uint256 timestamp, uint256 recordCount)"
];
