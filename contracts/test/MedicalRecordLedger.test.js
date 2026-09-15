const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicalRecordLedger Consortium Smart Contract", function () {
  let ledger;
  let rootAdmin;
  let hospitalAdminA;
  let hospitalAdminB;
  let doctorA;
  let doctorB;
  let unauthorizedUser;

  const dummyPatientHash = "0x" + "aa".repeat(32);
  const dummyFileHash = "0x" + "bb".repeat(32);
  const dummyStorageURI = "http://localhost:5001/api/records/REC-2026-09-001";
  const recordType = "CONSULTATION";

  beforeEach(async function () {
    [rootAdmin, hospitalAdminA, hospitalAdminB, doctorA, doctorB, unauthorizedUser] = await ethers.getSigners();

    const MedicalRecordLedger = await ethers.getContractFactory("MedicalRecordLedger");
    ledger = await MedicalRecordLedger.deploy();
    await ledger.waitForDeployment();
  });

  describe("Consortium Initialization & Root Governance", function () {
    it("should set deployer as root admin and register Root Authority Hospital", async function () {
      expect(await ledger.owner()).to.equal(rootAdmin.address);
      expect(await ledger.isPractitionerActive(rootAdmin.address)).to.be.true;

      const rootHosp = await ledger.hospitals(rootAdmin.address);
      expect(rootHosp.isActive).to.be.true;
      expect(rootHosp.name).to.equal("MediQR Consortium Root Authority");
    });

    it("should allow root admin to onboard a certified hospital", async function () {
      await expect(
        ledger.connect(rootAdmin).onboardHospital(
          hospitalAdminA.address,
          "Apollo Speciality Hospital",
          "http://localhost:5001",
          "HOSP-LIC-APOLLO-001"
        )
      )
        .to.emit(ledger, "HospitalOnboarded")
        .withArgs(hospitalAdminA.address, "Apollo Speciality Hospital", "http://localhost:5001", "HOSP-LIC-APOLLO-001", (val) => val > 0);

      const hosp = await ledger.hospitals(hospitalAdminA.address);
      expect(hosp.isActive).to.be.true;
      expect(hosp.name).to.equal("Apollo Speciality Hospital");
    });

    it("should reject non-admin onboarding a hospital", async function () {
      await expect(
        ledger.connect(unauthorizedUser).onboardHospital(
          hospitalAdminB.address,
          "Rogue Hospital",
          "http://rogue:5000",
          "FAKE-001"
        )
      ).to.be.revertedWith("MediQR: Caller is not consortium root admin");
    });

    it("should allow root admin to suspend and reactivate a hospital", async function () {
      await ledger.connect(rootAdmin).onboardHospital(
        hospitalAdminA.address,
        "Apollo Speciality Hospital",
        "http://localhost:5001",
        "HOSP-LIC-APOLLO-001"
      );

      // Suspend
      await expect(ledger.connect(rootAdmin).suspendHospital(hospitalAdminA.address))
        .to.emit(ledger, "HospitalStatusChanged")
        .withArgs(hospitalAdminA.address, false, (val) => val > 0);

      let hosp = await ledger.hospitals(hospitalAdminA.address);
      expect(hosp.isActive).to.be.false;

      // Reactivate
      await expect(ledger.connect(rootAdmin).reactivateHospital(hospitalAdminA.address))
        .to.emit(ledger, "HospitalStatusChanged")
        .withArgs(hospitalAdminA.address, true, (val) => val > 0);

      hosp = await ledger.hospitals(hospitalAdminA.address);
      expect(hosp.isActive).to.be.true;
    });
  });

  describe("Hierarchical Doctor Credentialing", function () {
    beforeEach(async function () {
      await ledger.connect(rootAdmin).onboardHospital(
        hospitalAdminA.address,
        "Apollo Speciality Hospital",
        "http://localhost:5001",
        "HOSP-LIC-APOLLO-001"
      );
    });

    it("should allow Hospital Admin to register a doctor under their facility", async function () {
      await expect(
        ledger.connect(hospitalAdminA).registerDoctor(
          doctorA.address,
          "Dr. Ramesh Gupta",
          "MCI-DEL-10294",
          "Emergency Medicine",
          hospitalAdminA.address
        )
      )
        .to.emit(ledger, "PractitionerRegistered")
        .withArgs(doctorA.address, "Dr. Ramesh Gupta", "MCI-DEL-10294", "Emergency Medicine", hospitalAdminA.address, (val) => val > 0);

      expect(await ledger.isPractitionerActive(doctorA.address)).to.be.true;
    });

    it("should allow Root Admin to register a doctor under any active hospital", async function () {
      await expect(
        ledger.connect(rootAdmin).registerDoctor(
          doctorB.address,
          "Dr. Ananya Sharma",
          "MCI-BOM-88392",
          "Pathology",
          hospitalAdminA.address
        )
      ).to.emit(ledger, "PractitionerRegistered");

      expect(await ledger.isPractitionerActive(doctorB.address)).to.be.true;
    });

    it("should reject unauthorized user registering a doctor", async function () {
      await expect(
        ledger.connect(unauthorizedUser).registerDoctor(
          doctorA.address,
          "Dr. Imposter",
          "FAKE-LIC",
          "General",
          hospitalAdminA.address
        )
      ).to.be.revertedWith("MediQR: Unauthorized. Only accredited hospital admin or root admin can register doctor");
    });

    it("should allow hospital admin to revoke their doctor", async function () {
      await ledger.connect(hospitalAdminA).registerDoctor(
        doctorA.address,
        "Dr. Ramesh Gupta",
        "MCI-DEL-10294",
        "Emergency Medicine",
        hospitalAdminA.address
      );

      await expect(ledger.connect(hospitalAdminA).revokeDoctor(doctorA.address))
        .to.emit(ledger, "PractitionerRevoked")
        .withArgs(doctorA.address, hospitalAdminA.address, (val) => val > 0);

      expect(await ledger.isPractitionerActive(doctorA.address)).to.be.false;
    });
  });

  describe("Record Operations & Cascading Hospital Suspension", function () {
    beforeEach(async function () {
      await ledger.connect(rootAdmin).onboardHospital(
        hospitalAdminA.address,
        "Apollo Speciality Hospital",
        "http://localhost:5001",
        "HOSP-LIC-APOLLO-001"
      );

      await ledger.connect(hospitalAdminA).registerDoctor(
        doctorA.address,
        "Dr. Ramesh Gupta",
        "MCI-DEL-10294",
        "Emergency Medicine",
        hospitalAdminA.address
      );
    });

    it("should allow active doctor to add record and emit RecordAdded", async function () {
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

    it("should automatically block doctor operations when their affiliated hospital is suspended", async function () {
      // Suspend Hospital A
      await ledger.connect(rootAdmin).suspendHospital(hospitalAdminA.address);

      // Doctor check should now return false
      expect(await ledger.isPractitionerActive(doctorA.address)).to.be.false;

      // Doctor attempting to add record must revert
      await expect(
        ledger.connect(doctorA).addRecord(dummyPatientHash, dummyFileHash, dummyStorageURI, recordType)
      ).to.be.revertedWith("MediQR: Access restricted to authorized active practitioner");

      // Reactivating Hospital A restores doctor permissions
      await ledger.connect(rootAdmin).reactivateHospital(hospitalAdminA.address);
      expect(await ledger.isPractitionerActive(doctorA.address)).to.be.true;

      await expect(
        ledger.connect(doctorA).addRecord(dummyPatientHash, dummyFileHash, dummyStorageURI, recordType)
      ).to.emit(ledger, "RecordAdded");
    });

    it("should allow verified doctor to query records and emit RecordAccessed audit event", async function () {
      await ledger.connect(doctorA).addRecord(
        dummyPatientHash,
        dummyFileHash,
        dummyStorageURI,
        recordType
      );

      const tx = await ledger.connect(doctorA).getPatientRecords(dummyPatientHash);
      await expect(tx)
        .to.emit(ledger, "RecordAccessed")
        .withArgs(dummyPatientHash, doctorA.address, (val) => val > 0, 1);

      const records = await ledger.connect(doctorA).viewPatientRecords(dummyPatientHash);
      expect(records.length).to.equal(1);
      expect(records[0].fileHash).to.equal(dummyFileHash);
    });

    it("should block unauthorized user from adding or viewing records", async function () {
      await expect(
        ledger.connect(unauthorizedUser).addRecord(dummyPatientHash, dummyFileHash, dummyStorageURI, recordType)
      ).to.be.revertedWith("MediQR: Access restricted to authorized active practitioner");

      await expect(
        ledger.connect(unauthorizedUser).viewPatientRecords(dummyPatientHash)
      ).to.be.revertedWith("MediQR: Access restricted to authorized active practitioner");
    });
  });

  describe("Highest Authority Historical Data Migration", function () {
    it("should allow Root Admin (Highest Authority) to bulk import legacy records with historical timestamps", async function () {
      const legacyImports = [
        {
          patientHash: "0x" + "11".repeat(32),
          fileHash: "0x" + "33".repeat(32),
          storageURI: "http://localhost:5001/api/records/LEGACY-001",
          recordType: "CONSULTATION",
          practitionerAddress: doctorA.address,
          historicalTimestamp: 1672531199
        },
        {
          patientHash: "0x" + "22".repeat(32),
          fileHash: "0x" + "44".repeat(32),
          storageURI: "http://localhost:5002/api/records/LEGACY-002",
          recordType: "LAB_RESULT",
          practitionerAddress: doctorB.address,
          historicalTimestamp: 1680000000
        }
      ];

      await expect(
        ledger.connect(rootAdmin).batchImportHistoricalRecords(legacyImports)
      )
        .to.emit(ledger, "LegacyBatchImported")
        .withArgs(2, rootAdmin.address, (val) => val > 0);

      // Verify records are retrievable
      const recordsP1 = await ledger.connect(rootAdmin).viewPatientRecords(legacyImports[0].patientHash);
      expect(recordsP1.length).to.equal(1);
      expect(recordsP1[0].fileHash).to.equal(legacyImports[0].fileHash);
      expect(recordsP1[0].timestamp).to.equal(1672531199);
      expect(recordsP1[0].practitionerAddress).to.equal(doctorA.address);

      const recordsP2 = await ledger.connect(rootAdmin).viewPatientRecords(legacyImports[1].patientHash);
      expect(recordsP2.length).to.equal(1);
      expect(recordsP2[0].fileHash).to.equal(legacyImports[1].fileHash);
      expect(recordsP2[0].timestamp).to.equal(1680000000);
      expect(recordsP2[0].practitionerAddress).to.equal(doctorB.address);
    });

    it("should reject non-root admin from executing batch historical import", async function () {
      const legacyImports = [
        {
          patientHash: "0x" + "11".repeat(32),
          fileHash: "0x" + "33".repeat(32),
          storageURI: "http://localhost:5001/api/records/LEGACY-001",
          recordType: "CONSULTATION",
          practitionerAddress: doctorA.address,
          historicalTimestamp: 1672531199
        }
      ];

      await expect(
        ledger.connect(doctorA).batchImportHistoricalRecords(legacyImports)
      ).to.be.revertedWith("MediQR: Caller is not consortium root admin");
    });
  });
});
