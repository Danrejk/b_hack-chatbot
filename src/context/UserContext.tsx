import React, { createContext, useContext, useState } from 'react';

export type UserProfile = {
  name: string;
  surname: string;
  age: string;
  gender: string;
  phone: string;
  emergencyContact: string;
  bloodType: string;
  medicalData: string;
  healthIssues: string;
  disabilities: string;
  other: string;
  avatar: any;
};

type UserContextType = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
};

const defaultUser: UserProfile = {
  name: 'Raphael',
  surname: 'Schmidt',
  age: '35',
  gender: 'Male',
  phone: '+49 4012345678',
  emergencyContact: 'Sarah Smith (Sister) - +49 213706967',
  bloodType: 'O Positive (O+)',
  medicalData: 'Regular checkups normal. No recent surgeries.',
  healthIssues: 'Mild Asthma',
  disabilities: 'Missing a kneecap and toothless',
  other: '',
  avatar: require('../../assets/images/user.jpg'), 
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}