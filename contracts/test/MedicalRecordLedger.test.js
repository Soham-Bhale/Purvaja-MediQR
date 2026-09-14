const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecordLedger Smart Contract", function () {
  let ledger;
  let owner;
  let doctorA;
  let doctorB;
  let unauthorizedUser;

  const dummyPatientHash = "0x" + "aa".repeat(32);
  const dummyFileHash = "0x" + "bb".repeat(32);
  const dummyStorageURI = "http://localhost:5001/api/records/REC-2026-09-001";
  const recordType = "CONSULTATION";

  beforeEach(async function () {
    [owner, doctorA, doctorB, unauthorizedUser] = await ethers.getSigners();

    const MedicalRecordLedger = await ethers.getContractFactory("MedicalRecordLedger");
    ledger = await MedicalRecordLedger.deploy();
    await ledger.waitForDeployment();
  });

  describe("Initialization & Practitioner Management", function () {
    it("should set deployer as owner and auto-verify owner", async function () {
      expect(await ledger.owner()).to.equal(owner.address);
      expect(await ledger.isPractitionerVerified(owner.address)).to.be.true;
    });

    it("should allow owner to register a verified practitioner", async function () {
      await expect(
        ledger.registerPractitioner(
          doctorA.address,
          "Dr. Ramesh Gupta",
          "Apollo Speciality Hospital"
        )
      )
        .to.emit(ledger, "PractitionerRegistered")
        .withArgs(doctorA.address, "Dr. Ramesh Gupta", "Apollo Speciality Hospital", (val) => val > 0);

      expect(await ledger.isPractitionerVerified(doctorA.address)).to.be.true;
    });

    it("should reject non-owner registering a practitioner", async function () {
      await expect(
        ledger.connect(unauthorizedUser).registerPractitioner(
          doctorB.address,
          "Dr. Fake",
          "Fake Clinic"
        )
      ).to.be.revertedWith("MediQR: Caller is not contract owner");
    });

    it("should allow owner to revoke an authorized practitioner", async function () {
      await ledger.registerPractitioner(doctorA.address, "Dr. Gupta", "Hospital A");
      expect(await ledger.isPractitionerVerified(doctorA.address)).to.be.true;

      await expect(ledger.revokePractitioner(doctorA.address))
        .to.emit(ledger, "PractitionerRevoked")
        .withArgs(doctorA.address, (val) => val > 0);

      expect(await ledger.isPractitionerVerified(doctorA.address)).to.be.false;
    });
  });

  describe("Record Ledger Operations", function () {
    beforeEach(async function () {
      await ledger.registerPractitioner(doctorA.address, "Dr. Gupta", "Hospital A");
    });

    it("should allow a verified practitioner to add a record and emit RecordAdded", async function () {
      const tx = await ledger.connect(doctorA).addRecord(
        dummyPatientHash,
        dummyFileHash,
        dummyStorageURI,
        recordType
      );

      await expect(tx)
        .to.emit(ledger, "RecordAdded")
        .withArgs(
          dummyPatientHash,
          dummyFileHash,
          dummyStorageURI,
          doctorA.address,
          (val) => val > 0,
          recordType
        );

      expect(await ledger.getRecordCount(dummyPatientHash)).to.equal(1);
    });

    it("should block unverified user from adding a record", async function () {
      await expect(
        ledger.connect(unauthorizedUser).addRecord(
          dummyPatientHash,
          dummyFileHash,
          dummyStorageURI,
          recordType
        )
      ).to.be.revertedWith("MediQR: Access restricted to verified healthcare providers");
    });

    it("should reject invalid zero hashes", async function () {
      const zeroHash = ethers.ZeroHash;
      await expect(
        ledger.connect(doctorA).addRecord(zeroHash, dummyFileHash, dummyStorageURI, recordType)
      ).to.be.revertedWith("MediQR: Patient hash cannot be zero");

      await expect(
        ledger.connect(doctorA).addRecord(dummyPatientHash, zeroHash, dummyStorageURI, recordType)
      ).to.be.revertedWith("MediQR: File hash cannot be zero");
    });

    it("should allow verified practitioner to retrieve records and emit RecordAccessed audit event", async function () {
      // Add record first
      await ledger.connect(doctorA).addRecord(
        dummyPatientHash,
        dummyFileHash,
        dummyStorageURI,
        recordType
      );

      // Query records
      const tx = await ledger.connect(doctorA).getPatientRecords(dummyPatientHash);
      await expect(tx)
        .to.emit(ledger, "RecordAccessed")
        .withArgs(dummyPatientHash, doctorA.address, (val) => val > 0, 1);

      // Check viewPatientRecords
      const records = await ledger.connect(doctorA).viewPatientRecords(dummyPatientHash);
      expect(records.length).to.equal(1);
      expect(records[0].fileHash).to.equal(dummyFileHash);
      expect(records[0].storageURI).to.equal(dummyStorageURI);
      expect(records[0].practitionerAddress).to.equal(doctorA.address);
      expect(records[0].recordType).to.equal(recordType);
    });

    it("should block unverified user from viewing or accessing patient records", async function () {
      await ledger.connect(doctorA).addRecord(
        dummyPatientHash,
        dummyFileHash,
        dummyStorageURI,
        recordType
      );

      await expect(
        ledger.connect(unauthorizedUser).getPatientRecords(dummyPatientHash)
      ).to.be.revertedWith("MediQR: Access restricted to verified healthcare providers");

      await expect(
        ledger.connect(unauthorizedUser).viewPatientRecords(dummyPatientHash)
      ).to.be.revertedWith("MediQR: Access restricted to verified healthcare providers");
    });
  });
});
