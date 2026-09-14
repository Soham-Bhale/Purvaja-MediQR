// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MedicalRecordLedger
 * @notice Enterprise-grade on-chain ledger for MediQR healthcare archives.
 * @dev STORES ZERO PII OR PLAIN MEDICAL DATA.
 *      Only SHA-256 hashes (fingerprints), storage pointers/URIs, practitioner signatures,
 *      and immutable access audit logs are maintained on-chain.
 */
contract MedicalRecordLedger {
    address public immutable owner;

    struct Practitioner {
        bool isVerified;
        string name;
        string hospitalName;
        uint256 registeredAt;
    }

    struct RecordMetadata {
        bytes32 fileHash;            // SHA-256 integrity checksum of encrypted off-chain document
        string storageURI;           // Content-addressable URI (e.g. http://hospital-a:5001/api/records/rec-123)
        address practitionerAddress; // Wallet address of doctor/hospital node committing the record
        uint256 timestamp;           // Block timestamp of creation
        string recordType;           // CONSULTATION, PRESCRIPTION, LAB_RESULT, etc.
    }

    // Registry of authorized healthcare providers
    mapping(address => Practitioner) public verifiedPractitioners;

    // Mapping: patientHash (HMAC-SHA256 of national ID + salt) => array of RecordMetadata
    mapping(bytes32 => RecordMetadata[]) private patientRecords;

    // Access audit trail count
    mapping(bytes32 => uint256) public accessAuditCount;

    // --- EVENTS ---
    event PractitionerRegistered(
        address indexed practitioner,
        string name,
        string hospitalName,
        uint256 registeredAt
    );

    event PractitionerRevoked(
        address indexed practitioner,
        uint256 revokedAt
    );

    event RecordAdded(
        bytes32 indexed patientHash,
        bytes32 indexed fileHash,
        string storageURI,
        address indexed practitioner,
        uint256 timestamp,
        string recordType
    );

    event RecordAccessed(
        bytes32 indexed patientHash,
        address indexed practitioner,
        uint256 timestamp,
        uint256 recordCount
    );

    // --- MODIFIERS ---
    modifier onlyOwner() {
        require(msg.sender == owner, "MediQR: Caller is not contract owner");
        _;
    }

    modifier onlyVerifiedPractitioner() {
        require(
            verifiedPractitioners[msg.sender].isVerified || msg.sender == owner,
            "MediQR: Access restricted to verified healthcare providers"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        // Automatically verify the deployer as initial federation authority
        verifiedPractitioners[msg.sender] = Practitioner({
            isVerified: true,
            name: "MediQR Federation Authority",
            hospitalName: "Health System Root",
            registeredAt: block.timestamp
        });
        emit PractitionerRegistered(msg.sender, "MediQR Federation Authority", "Health System Root", block.timestamp);
    }

    // --- PRACTITIONER MANAGEMENT ---

    /**
     * @notice Registers and approves a healthcare practitioner wallet address.
     */
    function registerPractitioner(
        address practitioner,
        string calldata name,
        string calldata hospitalName
    ) external onlyOwner {
        require(practitioner != address(0), "MediQR: Invalid practitioner address");
        require(!verifiedPractitioners[practitioner].isVerified, "MediQR: Practitioner already registered");

        verifiedPractitioners[practitioner] = Practitioner({
            isVerified: true,
            name: name,
            hospitalName: hospitalName,
            registeredAt: block.timestamp
        });

        emit PractitionerRegistered(practitioner, name, hospitalName, block.timestamp);
    }

    /**
     * @notice Revokes a practitioner's access.
     */
    function revokePractitioner(address practitioner) external onlyOwner {
        require(verifiedPractitioners[practitioner].isVerified, "MediQR: Practitioner not active");
        verifiedPractitioners[practitioner].isVerified = false;

        emit PractitionerRevoked(practitioner, block.timestamp);
    }

    /**
     * @notice Checks if an address is an active verified practitioner.
     */
    function isPractitionerVerified(address practitioner) external view returns (bool) {
        return verifiedPractitioners[practitioner].isVerified || practitioner == owner;
    }

    // --- RECORD LEDGER & AUDIT TRAIL ---

    /**
     * @notice Appends a new medical record fingerprint to a patient's on-chain history.
     * @param patientHash Salted HMAC-SHA256 patient identifier.
     * @param fileHash SHA-256 checksum of the encrypted record document.
     * @param storageURI Off-chain storage location pointer / CID.
     * @param recordType Type of record (e.g. CONSULTATION, PRESCRIPTION, LAB_RESULT).
     */
    function addRecord(
        bytes32 patientHash,
        bytes32 fileHash,
        string calldata storageURI,
        string calldata recordType
    ) external onlyVerifiedPractitioner {
        require(patientHash != bytes32(0), "MediQR: Patient hash cannot be zero");
        require(fileHash != bytes32(0), "MediQR: File hash cannot be zero");
        require(bytes(storageURI).length > 0, "MediQR: Storage URI required");

        RecordMetadata memory newRecord = RecordMetadata({
            fileHash: fileHash,
            storageURI: storageURI,
            practitionerAddress: msg.sender,
            timestamp: block.timestamp,
            recordType: recordType
        });

        patientRecords[patientHash].push(newRecord);

        emit RecordAdded(
            patientHash,
            fileHash,
            storageURI,
            msg.sender,
            block.timestamp,
            recordType
        );
    }

    /**
     * @notice Retrieves all record metadata pointers for a patient.
     * @dev Emits an immutable `RecordAccessed` audit event on the blockchain.
     * @param patientHash Salted HMAC-SHA256 patient identifier.
     */
    function getPatientRecords(bytes32 patientHash)
        external
        onlyVerifiedPractitioner
        returns (RecordMetadata[] memory)
    {
        require(patientHash != bytes32(0), "MediQR: Patient hash cannot be zero");
        RecordMetadata[] memory records = patientRecords[patientHash];

        accessAuditCount[patientHash] += 1;

        emit RecordAccessed(
            patientHash,
            msg.sender,
            block.timestamp,
            records.length
        );

        return records;
    }

    /**
     * @notice Read-only view of patient records (for frontend queries without gas, audit event is not emitted).
     */
    function viewPatientRecords(bytes32 patientHash)
        external
        view
        onlyVerifiedPractitioner
        returns (RecordMetadata[] memory)
    {
        require(patientHash != bytes32(0), "MediQR: Patient hash cannot be zero");
        return patientRecords[patientHash];
    }

    /**
     * @notice Returns total count of records stored for a given patient hash.
     */
    function getRecordCount(bytes32 patientHash) external view returns (uint256) {
        return patientRecords[patientHash].length;
    }
}
