const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying MedicalRecordLedger smart contract...");

  const [deployer, doctorA, doctorB] = await hre.ethers.getSigners();
  console.log(`Deployer address: ${deployer.address}`);

  const MedicalRecordLedger = await hre.ethers.getContractFactory("MedicalRecordLedger");
  const ledger = await MedicalRecordLedger.deploy();
  await ledger.waitForDeployment();

  const contractAddress = await ledger.getAddress();
  console.log(`MedicalRecordLedger deployed at: ${contractAddress}`);

  // Register Doctor A (Hospital A lead physician)
  if (doctorA) {
    const txA = await ledger.registerPractitioner(
      doctorA.address,
      "Dr. Ramesh Gupta (Lead Emergency Physician)",
      "Hospital Node A - Apollo Speciality"
    );
    await txA.wait();
    console.log(`Registered Practitioner Doctor A: ${doctorA.address}`);
  }

  // Register Doctor B (Hospital B chief pathologist)
  if (doctorB) {
    const txB = await ledger.registerPractitioner(
      doctorB.address,
      "Dr. Ananya Sharma (Chief Pathologist)",
      "Hospital Node B - Fortis Healthcare"
    );
    await txB.wait();
    console.log(`Registered Practitioner Doctor B: ${doctorB.address}`);
  }

  // Write deployment info to deployment.json
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1337,
    address: contractAddress,
    deployer: deployer.address,
    registeredDoctors: [
      {
        address: doctorA ? doctorA.address : deployer.address,
        name: "Dr. Ramesh Gupta (Lead Emergency Physician)",
        hospital: "Hospital Node A - Apollo Speciality",
      },
      {
        address: doctorB ? doctorB.address : deployer.address,
        name: "Dr. Ananya Sharma (Chief Pathologist)",
        hospital: "Hospital Node B - Fortis Healthcare",
      },
    ],
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment metadata saved to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
