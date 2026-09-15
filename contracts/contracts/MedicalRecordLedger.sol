// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MedicalRecordLedger
 * @notice Enterprise-grade Consortium Blockchain Ledger for MediQR Healthcare Archives.
 * @dev Implements Hierarchical Role-Based Access Control (RBAC):
 *      - Root Consortium Admin: Onboards/suspends hospitals, network-wide governance.
 *      - Hospital Administrators: Manage certified facility endpoints and accredited medical staff.
 *      - Verified Practitioners: Commit SHA-256 fingerprints, query patient records with audit logs.
 *      ZERO PII OR PLAIN HEALTH DATA COMMITTED ON-CHAIN.
 */
contract MedicalRecordLedger {
    address public owner;

    struct Hospital {
        bool isActive;
        string name;
        string endpoint;
        string licenseId;
        address adminWallet;
        uint256 registeredAt;
    }

    struct Practitioner {
        bool isVerified;
        string name;
        string licenseNumber;
        string department;
        address hospitalAdmin;
        uint256 registeredAt;
    }

    struct RecordMetadata {
        bytes32 fileHash;            // SHA-256 integrity checksum of encrypted off-chain document
        string storageURI;           // Content-addressable URI (e.g. http://hospital-a:5001/api/records/rec-123)
        address practitionerAddress; // Wallet address of doctor committing the record
        uint256 timestamp;           // Block timestamp of creation
        string recordType;           // CONSULTATION, PRESCRIPTION, LAB_RESULT, etc.
    }

    struct LegacyRecordImport {
        bytes32 patientHash;
        bytes32 fileHash;
        string storageURI;
        string recordType;
        address practitionerAddress;
        uint256 historicalTimestamp;
    }

    // --- STATE REGISTRIES ---
    mapping(address => Hospital) public hospitals;
    address[] public hospitalList;

    mapping(address => Practitioner) public verifiedPractitioners;
    address[] public practitionerList;

    // patientHash (HMAC-SHA256) => array of RecordMetadata
    mapping(bytes32 => RecordMetadata[]) private patientRecords;

    // Access audit trail count
    mapping(bytes32 => uint256) public accessAuditCount;

    // --- EVENTS ---
    event HospitalOnboarded(
        address indexed adminWallet,
        string name,
        string endpoint,
        string licenseId,
        uint256 registeredAt
    );

    event HospitalStatusChanged(
        address indexed adminWallet,
        bool isActive,
        uint256 timestamp
    );

    event PractitionerRegistered(
        address indexed practitioner,
        string name,
        string licenseNumber,
        string department,
        address indexed hospitalAdmin,
        uint256 registeredAt
    );

    event PractitionerRevoked(
        address indexed practitioner,
        address indexed revokedBy,
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

    event LegacyBatchImported(
        uint256 indexed batchSize,
        address indexed authority,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // --- MODIFIERS ---
    modifier onlyOwner() {
        require(msg.sender == owner, "MediQR: Caller is not consortium root admin");
        _;
    }

    modifier onlyAuthorizedPractitioner() {
        require(isPractitionerActive(msg.sender), "MediQR: Access restricted to authorized active practitioner");
        _;
    }

    constructor() {
        owner = msg.sender;

        // Auto-register Root Authority Hospital
        hospitals[msg.sender] = Hospital({
            isActive: true,
            name: "MediQR Consortium Root Authority",
            endpoint: "https://root.mediqr.org",
            licenseId: "GOV-MOH-CONSORTIUM-001",
            adminWallet: msg.sender,
            registeredAt: block.timestamp
        });
        hospitalList.push(msg.sender);

        // Auto-register deployer as initial lead practitioner
        verifiedPractitioners[msg.sender] = Practitioner({
            isVerified: true,
            name: "Consortium Root Officer",
            licenseNumber: "MCI-ROOT-001",
            department: "Consortium Administration",
            hospitalAdmin: msg.sender,
            registeredAt: block.timestamp
        });
        practitionerList.push(msg.sender);

        emit HospitalOnboarded(msg.sender, "MediQR Consortium Root Authority", "https://root.mediqr.org", "GOV-MOH-CONSORTIUM-001", block.timestamp);
        emit PractitionerRegistered(msg.sender, "Consortium Root Officer", "MCI-ROOT-001", "Consortium Administration", msg.sender, block.timestamp);
    }

    // --- ROOT ADMIN: HOSPITAL MANAGEMENT ---

    /**
     * @notice Onboards a certified hospital to the organizational consortium blockchain.
     * @dev Only callable by the consortium root admin.
     */
    function onboardHospital(
        address adminWallet,
        string calldata name,
        string calldata endpoint,
        string calldata licenseId
    ) external onlyOwner {
        require(adminWallet != address(0), "MediQR: Invalid hospital admin address");
        require(bytes(name).length > 0, "MediQR: Hospital name required");
        require(bytes(endpoint).length > 0, "MediQR: Hospital endpoint required");
        require(bytes(licenseId).length > 0, "MediQR: Hospital license ID required");
        require(!hospitals[adminWallet].isActive && hospitals[adminWallet].registeredAt == 0, "MediQR: Hospital already registered");

        hospitals[adminWallet] = Hospital({
            isActive: true,
            name: name,
            endpoint: endpoint,
            licenseId: licenseId,
            adminWallet: adminWallet,
            registeredAt: block.timestamp
        });

        hospitalList.push(adminWallet);

        emit HospitalOnboarded(adminWallet, name, endpoint, licenseId, block.timestamp);
    }

    /**
     * @notice Suspends a hospital node due to regulatory, security, or audit non-compliance.
     */
    function suspendHospital(address adminWallet) external onlyOwner {
        require(hospitals[adminWallet].registeredAt > 0, "MediQR: Hospital not found");
        require(hospitals[adminWallet].isActive, "MediQR: Hospital already suspended");

        hospitals[adminWallet].isActive = false;
        emit HospitalStatusChanged(adminWallet, false, block.timestamp);
    }

    /**
     * @notice Reactivates a suspended hospital node.
     */
    function reactivateHospital(address adminWallet) external onlyOwner {
        require(hospitals[adminWallet].registeredAt > 0, "MediQR: Hospital not found");
        require(!hospitals[adminWallet].isActive, "MediQR: Hospital is already active");

        hospitals[adminWallet].isActive = true;
        emit HospitalStatusChanged(adminWallet, true, block.timestamp);
    }

    /**
     * @notice Transfers root ownership to a new governance address.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MediQR: New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // --- PRACTITIONER CREDENTIALING (HOSPITAL ADMIN OR ROOT ADMIN) ---

    /**
     * @notice Registers and approves a doctor under a specific hospital facility.
     * @dev Callable by either the affiliated Hospital Admin or the Consortium Root Admin.
     */
    function registerDoctor(
        address doctorWallet,
        string calldata name,
        string calldata licenseNumber,
        string calldata department,
        address hospitalAdmin
    ) external {
        require(doctorWallet != address(0), "MediQR: Invalid doctor address");
        require(bytes(name).length > 0, "MediQR: Doctor name required");
        require(bytes(licenseNumber).length > 0, "MediQR: License number required");

        // Auth check: caller must be Root Admin OR the hospital admin for the target hospital
        require(
            msg.sender == owner || (msg.sender == hospitalAdmin && hospitals[hospitalAdmin].isActive),
            "MediQR: Unauthorized. Only accredited hospital admin or root admin can register doctor"
        );

        // Ensure the affiliated hospital is active
        require(hospitals[hospitalAdmin].isActive, "MediQR: Affiliated hospital is not active");

        bool isNew = (verifiedPractitioners[doctorWallet].registeredAt == 0);

        verifiedPractitioners[doctorWallet] = Practitioner({
            isVerified: true,
            name: name,
            licenseNumber: licenseNumber,
            department: department,
            hospitalAdmin: hospitalAdmin,
            registeredAt: block.timestamp
        });

        if (isNew) {
            practitionerList.push(doctorWallet);
        }

        emit PractitionerRegistered(doctorWallet, name, licenseNumber, department, hospitalAdmin, block.timestamp);
    }

    /**
     * @notice Revokes a doctor's access.
     * @dev Callable by the doctor's hospital admin or the Consortium Root Admin.
     */
    function revokeDoctor(address doctorWallet) external {
        require(verifiedPractitioners[doctorWallet].registeredAt > 0, "MediQR: Doctor not registered");
        require(verifiedPractitioners[doctorWallet].isVerified, "MediQR: Doctor already revoked");

        address affiliatedHospital = verifiedPractitioners[doctorWallet].hospitalAdmin;
        require(
            msg.sender == owner || msg.sender == affiliatedHospital,
            "MediQR: Unauthorized to revoke this doctor"
        );

        verifiedPractitioners[doctorWallet].isVerified = false;
        emit PractitionerRevoked(doctorWallet, msg.sender, block.timestamp);
    }

    /**
     * @notice Checks if a practitioner is currently authorized and their affiliated hospital is active.
     */
    function isPractitionerActive(address practitioner) public view returns (bool) {
        if (practitioner == owner) return true;
        Practitioner memory doc = verifiedPractitioners[practitioner];
        if (!doc.isVerified) return false;
        // Check if affiliated hospital is active
        return hospitals[doc.hospitalAdmin].isActive;
    }

    // --- RECORD LEDGER OPERATIONS ---

    /**
     * @notice Appends a new medical record fingerprint to a patient's on-chain history.
     */
    function addRecord(
        bytes32 patientHash,
        bytes32 fileHash,
        string calldata storageURI,
        string calldata recordType
    ) external onlyAuthorizedPractitioner {
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
     * @notice Bulk imports existing historical records into the consortium ledger.
     * @dev Restrictable exclusively to the Consortium Root Admin (Highest Authority).
     *      Preserves original historical timestamps and practitioner signatures from legacy systems.
     */
    function batchImportHistoricalRecords(
        LegacyRecordImport[] calldata imports
    ) external onlyOwner {
        uint256 count = imports.length;
        require(count > 0, "MediQR: Empty batch");

        for (uint256 i = 0; i < count; i++) {
            bytes32 pHash = imports[i].patientHash;
            bytes32 fHash = imports[i].fileHash;
            require(pHash != bytes32(0), "MediQR: Patient hash cannot be zero");
            require(fHash != bytes32(0), "MediQR: File hash cannot be zero");
            require(bytes(imports[i].storageURI).length > 0, "MediQR: Storage URI required");

            address signer = imports[i].practitionerAddress == address(0) ? msg.sender : imports[i].practitionerAddress;
            uint256 recordTime = imports[i].historicalTimestamp == 0 ? block.timestamp : imports[i].historicalTimestamp;

            patientRecords[pHash].push(RecordMetadata({
                fileHash: fHash,
                storageURI: imports[i].storageURI,
                practitionerAddress: signer,
                timestamp: recordTime,
                recordType: imports[i].recordType
            }));

            emit RecordAdded(pHash, fHash, imports[i].storageURI, signer, recordTime, imports[i].recordType);
        }

        emit LegacyBatchImported(count, msg.sender, block.timestamp);
    }

    /**
     * @notice Retrieves all record metadata pointers for a patient.
     * @dev Emits an immutable `RecordAccessed` audit event on the blockchain.
     */
    function getPatientRecords(bytes32 patientHash)
        external
        onlyAuthorizedPractitioner
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
     * @notice Read-only view of patient records (for frontend queries without gas, audit event not emitted).
     */
    function viewPatientRecords(bytes32 patientHash)
        external
        view
        onlyAuthorizedPractitioner
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

    // --- CONSORTIUM INTROSPECTION HELPERS ---

    /**
     * @notice Returns array of all registered hospital admin addresses.
     */
    function getHospitals() external view returns (address[] memory) {
        return hospitalList;
    }

    /**
     * @notice Returns array of all registered practitioner addresses.
     */
    function getPractitioners() external view returns (address[] memory) {
        return practitionerList;
    }
}
