'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { VERIFIED_DOCTORS } from './blockchain';

export const DEFAULT_DOCTOR = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';

interface DoctorContextType {
  activeDoctor: string;
  setActiveDoctor: (address: string) => void;
  isVerified: boolean;
  doctorDetails?: { name: string; hospital: string };
}

const DoctorContext = createContext<DoctorContextType>({
  activeDoctor: DEFAULT_DOCTOR,
  setActiveDoctor: () => {},
  isVerified: true,
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
  const isVerified = !!doctorDetails;

  return (
    <DoctorContext.Provider value={{ activeDoctor, setActiveDoctor, isVerified, doctorDetails }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  return useContext(DoctorContext);
}
