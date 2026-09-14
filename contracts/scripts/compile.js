const hre = require("hardhat");

async function main() {
  console.log("Compiling MediQR Solidity contracts with Hardhat...");
  await hre.run("compile");
  console.log("Contracts compiled successfully. Artifacts generated in contracts/artifacts.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
