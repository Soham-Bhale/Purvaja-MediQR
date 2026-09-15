export const MEDICAL_RECORD_LEDGER_ABI = [
  "function owner() view returns (address)",
  "function isPractitionerActive(address practitioner) view returns (bool)",
  
  // Hospital Management
  "function onboardHospital(address adminWallet, string name, string endpoint, string licenseId)",
  "function suspendHospital(address adminWallet)",
  "function reactivateHospital(address adminWallet)",
  "function getHospitals() view returns (address[])",
  "function hospitals(address adminWallet) view returns (bool isActive, string name, string endpoint, string licenseId, address adminWallet, uint256 registeredAt)",

  // Doctor Credentialing
  "function registerDoctor(address doctorWallet, string name, string licenseNumber, string department, address hospitalAdmin)",
  "function revokeDoctor(address doctorWallet)",
  "function getPractitioners() view returns (address[])",
  "function verifiedPractitioners(address doctorWallet) view returns (bool isVerified, string name, string licenseNumber, string department, address hospitalAdmin, uint256 registeredAt)",

  // Records, Batch Migration & Audit Trail
  "function addRecord(bytes32 patientHash, bytes32 fileHash, string storageURI, string recordType)",
  "function batchImportHistoricalRecords(tuple(bytes32 patientHash, bytes32 fileHash, string storageURI, string recordType, address practitionerAddress, uint256 historicalTimestamp)[] imports)",
  "function getPatientRecords(bytes32 patientHash) returns (tuple(bytes32 fileHash, string storageURI, address practitionerAddress, uint256 timestamp, string recordType)[])",
  "function viewPatientRecords(bytes32 patientHash) view returns (tuple(bytes32 fileHash, string storageURI, address practitionerAddress, uint256 timestamp, string recordType)[])",
  "function getRecordCount(bytes32 patientHash) view returns (uint256)",

  // Events
  "event HospitalOnboarded(address indexed adminWallet, string name, string endpoint, string licenseId, uint256 registeredAt)",
  "event HospitalStatusChanged(address indexed adminWallet, bool isActive, uint256 timestamp)",
  "event PractitionerRegistered(address indexed practitioner, string name, string licenseNumber, string department, address indexed hospitalAdmin, uint256 registeredAt)",
  "event PractitionerRevoked(address indexed practitioner, address indexed revokedBy, uint256 revokedAt)",
  "event RecordAdded(bytes32 indexed patientHash, bytes32 indexed fileHash, string storageURI, address indexed practitioner, uint256 timestamp, string recordType)",
  "event RecordAccessed(bytes32 indexed patientHash, address indexed practitioner, uint256 timestamp, uint256 recordCount)",
  "event LegacyBatchImported(uint256 indexed batchSize, address indexed authority, uint256 timestamp)"
];
