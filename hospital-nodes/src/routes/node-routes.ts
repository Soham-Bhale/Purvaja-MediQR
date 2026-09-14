import { Router, Request, Response } from 'express';
import { NodeStorageEngine, calculateSHA256 } from '../services/storage-engine';

export function createHospitalNodeRouter(
  nodeId: string,
  hospitalName: string,
  storageEngine: NodeStorageEngine,
  port: number
): Router {
  const router = Router();

  // Health and info
  router.get('/health', (_req: Request, res: Response) => {
    const records = storageEngine.listRecords();
    res.json({
      status: 'UP',
      nodeId,
      hospitalName,
      port,
      storageEngine: 'AES-256-GCM Local Content-Addressable FS',
      recordsStoredCount: records.length,
      timestamp: Date.now(),
    });
  });

  // List records stored on this node
  router.get('/api/records', (_req: Request, res: Response) => {
    const records = storageEngine.listRecords();
    res.json({
      nodeId,
      records,
    });
  });

  // Upload/Store a new medical record
  router.post('/api/records/upload', (req: Request, res: Response) => {
    try {
      const { recordId, patientHash, medicalData } = req.body;

      if (!patientHash || !medicalData) {
        return res.status(400).json({
          error: 'Missing required parameters: patientHash and medicalData are mandatory',
        });
      }

      const effectiveRecordId = recordId || `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const { encryptedPackage, fileHash } = storageEngine.storeRecord(
        effectiveRecordId,
        patientHash,
        nodeId,
        medicalData
      );

      const storageURI = `http://localhost:${port}/api/records/${effectiveRecordId}`;

      return res.status(201).json({
        success: true,
        recordId: effectiveRecordId,
        patientHash,
        fileHash, // Exact SHA-256 fingerprint to commit on-chain
        storageURI,
        hospitalNodeId: nodeId,
        hospitalName,
        encryptedAt: encryptedPackage.encryptedAt,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Failed to process and encrypt record',
        details: err.message,
      });
    }
  });

  // Fetch encrypted package for verification & decryption
  router.get('/api/records/:recordId', (req: Request, res: Response) => {
    const { recordId } = req.params;
    const pkg = storageEngine.getRecord(recordId);

    if (!pkg) {
      return res.status(404).json({
        error: `Record ${recordId} not found on node ${nodeId}`,
      });
    }

    // Also include the current computed hash of the stored file
    const currentFileHash = calculateSHA256(pkg);

    return res.json({
      ...pkg,
      currentFileHash,
    });
  });

  // SIMULATOR: Tamper with record file on disk
  router.post('/api/simulator/tamper/:recordId', (req: Request, res: Response) => {
    const { recordId } = req.params;
    const mode = (req.body.mode as 'ciphertext' | 'authTag') || 'ciphertext';

    const success = storageEngine.tamperRecord(recordId, mode);
    if (!success) {
      return res.status(404).json({ error: `Record ${recordId} not found` });
    }

    const tamperedPkg = storageEngine.getRecord(recordId);
    const tamperedHash = tamperedPkg ? calculateSHA256(tamperedPkg) : null;

    return res.json({
      success: true,
      message: `Record ${recordId} has been tampered on ${nodeId} (${mode} mutated).`,
      recordId,
      tamperedHash,
    });
  });

  // SIMULATOR: Restore pristine record
  router.post('/api/simulator/restore/:recordId', (req: Request, res: Response) => {
    const { recordId } = req.params;
    const success = storageEngine.restoreRecord(recordId);
    if (!success) {
      return res.status(404).json({ error: `Record ${recordId} backup not found` });
    }

    const restoredPkg = storageEngine.getRecord(recordId);
    const restoredHash = restoredPkg ? calculateSHA256(restoredPkg) : null;

    return res.json({
      success: true,
      message: `Record ${recordId} restored to original cryptographic state.`,
      recordId,
      restoredHash,
    });
  });

  return router;
}
