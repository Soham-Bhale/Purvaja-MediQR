'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROOT_ADMIN_ADDRESS, VERIFIED_DOCTORS, getStoredHospitals } from './blockchain';

export const DEFAULT_DOCTOR = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

export type UserConsortiumRole = 'ROOT_ADMIN' | 'HOSPITAL_ADMIN' | 'DOCTOR' | 'UNVERIFIED';

interface DoctorContextType {
  activeDoctor: string;
  setActiveDoctor: (address: string) => void;
  isVerified: boolean;
  isRootAdmin: boolean;
  isHospitalAdmin: boolean;
  activeRole: UserConsortiumRole;
  doctorDetails?: { name: string; hospital: string };
}

const DoctorContext = createContext<DoctorContextType>({
  activeDoctor: DEFAULT_DOCTOR,
  setActiveDoctor: () => {},
  isVerified: true,
  isRootAdmin: false,
  isHospitalAdmin: true,
  activeRole: 'DOCTOR',
  doctorDetails: VERIFIED_DOCTORS[DEFAULT_DOCTOR],
});

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const [activeDoctor, setActiveDoctorState] = useState<string>(DEFAULT_DOCTOR);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mediqr_active_doctor');
      if (saved) {
        setActiveDoctorState(saved.toLowerCase());
      }
    }
  }, []);

  function setActiveDoctor(address: string) {
    const normalized = address.toLowerCase();
    setActiveDoctorState(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mediqr_active_doctor', normalized);
    }
  }

  const normalized = activeDoctor.toLowerCase();
  const doctorDetails = VERIFIED_DOCTORS[normalized];
  const isRootAdmin = normalized === ROOT_ADMIN_ADDRESS.toLowerCase();

  const hospitals = getStoredHospitals();
  const isHospitalAdmin = isRootAdmin || hospitals.some(
    (h) => h.adminWallet.toLowerCase() === normalized && h.isActive
  );

  const isVerified = isRootAdmin || !!doctorDetails;

  let activeRole: UserConsortiumRole = 'UNVERIFIED';
  if (isRootAdmin) {
    activeRole = 'ROOT_ADMIN';
  } else if (isHospitalAdmin) {
    activeRole = 'HOSPITAL_ADMIN';
  } else if (isVerified) {
    activeRole = 'DOCTOR';
  }

  return (
    <DoctorContext.Provider
      value={{
        activeDoctor,
        setActiveDoctor,
        isVerified,
        isRootAdmin,
        isHospitalAdmin,
        activeRole,
        doctorDetails,
      }}
    >
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  return useContext(DoctorContext);
}
