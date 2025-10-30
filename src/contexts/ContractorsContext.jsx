import { createContext, useContext, useState, useEffect } from 'react';

const ContractorsContext = createContext();

// Initial mock data
const initialContractors = [
  {
    id: 'CON-001',
    name: 'Abia Infrastructure Ltd',
    email: 'info@abiainfra.com',
    phone: '+234 801 234 5678',
    contact: 'Adebayo Johnson',
    specialization: 'Road Construction',
    rating: 4.8,
    status: 'Active',
    projects: { completed: 12, ongoing: 3 },
    location: 'Umuahia',
    joinDate: '2021-03-15',
    totalValue: '₦8.5B'
  },
  {
    id: 'CON-002',
    name: 'Medical Facilities Nigeria',
    email: 'contact@medfacilities.ng',
    phone: '+234 802 345 6789',
    contact: 'Sarah Okafor',
    specialization: 'Healthcare Infrastructure',
    rating: 4.5,
    status: 'Active',
    projects: { completed: 8, ongoing: 1 },
    location: 'Abuja',
    joinDate: '2020-11-20',
    totalValue: '₦3.2B'
  },
  {
    id: 'CON-003',
    name: 'Aqua Systems Ltd',
    email: 'info@aquasystems.com',
    phone: '+234 803 456 7890',
    contact: 'Michael Ade',
    specialization: 'Water Infrastructure',
    rating: 4.2,
    status: 'Active',
    projects: { completed: 5, ongoing: 2 },
    location: 'Port Harcourt',
    joinDate: '2022-01-10',
    totalValue: '₦2.8B'
  },
  {
    id: 'CON-004',
    name: 'Road Masters Nigeria',
    email: 'info@roadmasters.ng',
    phone: '+234 804 567 8901',
    contact: 'Funke Akindele',
    specialization: 'Road Construction',
    rating: 4.7,
    status: 'Active',
    projects: { completed: 15, ongoing: 2 },
    location: 'Kano',
    joinDate: '2019-08-05',
    totalValue: '₦6.1B'
  },
  {
    id: 'CON-005',
    name: 'Coastal Developers Ltd',
    email: 'contact@coastaldev.com',
    phone: '+234 805 678 9012',
    contact: 'John Obi',
    specialization: 'Marine Infrastructure',
    rating: 4.0,
    status: 'Inactive',
    projects: { completed: 3, ongoing: 0 },
    location: 'Umuahia',
    joinDate: '2023-02-28',
    totalValue: '₦1.5B'
  }
];

export const ContractorsProvider = ({ children }) => {
  const [contractors, setContractors] = useState([]);

  // Load contractors from localStorage on mount
  useEffect(() => {
    // Check both old and new localStorage keys for migration
    const newKey = 'gpt_contractors';
    const oldKey = 'abt_contractors';
    
    let savedContractors = localStorage.getItem(newKey);
    
    // If no data with new key, check old key for migration
    if (!savedContractors) {
      savedContractors = localStorage.getItem(oldKey);
      if (savedContractors) {
        console.log('Migrating contractors from old key to new key');
        localStorage.setItem(newKey, savedContractors);
        localStorage.removeItem(oldKey);
      }
    }
    
    if (savedContractors) {
      try {
        const parsed = JSON.parse(savedContractors);
        console.log('Loaded contractors from localStorage:', parsed);
        setContractors(parsed);
      } catch (error) {
        console.error('Error loading contractors from localStorage:', error);
        setContractors(initialContractors);
      }
    } else {
      console.log('No saved contractors found, using initial data');
      setContractors(initialContractors);
    }
  }, []);

  // Save contractors to localStorage whenever the list changes
  useEffect(() => {
    if (contractors.length > 0) {
      console.log('Saving contractors to localStorage:', contractors);
      localStorage.setItem('gpt_contractors', JSON.stringify(contractors));
      console.log('Contractors saved to localStorage successfully');
    }
  }, [contractors]);

  const addContractor = (contractorData) => {
    console.log('Adding contractor with data:', contractorData);
    console.log('Current contractors count:', contractors.length);
    
    // Generate a new contractor ID
    const newId = `CON-${String(contractors.length + 1).padStart(3, '0')}`;
    console.log('Generated new contractor ID:', newId);
    
    // Create contractor object with the expected structure
    const newContractor = {
      id: newId,
      name: contractorData.companyName,
      email: contractorData.email,
      phone: contractorData.phone,
      contact: contractorData.contactPerson,
      specialization: contractorData.specialization,
      rating: 0, // New contractors start with 0 rating
      status: contractorData.isActive ? 'Active' : 'Inactive',
      projects: { 
        completed: 0, 
        ongoing: contractorData.assignedProjects?.length || 0 
      },
      location: contractorData.address || 'Not specified',
      joinDate: contractorData.createdAt ? new Date(contractorData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      totalValue: '₦0', // New contractors start with 0 value
      // Store additional data for future use
      registrationNumber: contractorData.registrationNumber,
      username: contractorData.username,
      yearsInBusiness: contractorData.yearsInBusiness,
      employeeCount: contractorData.employeeCount,
      annualRevenue: contractorData.annualRevenue,
      certifications: contractorData.certifications,
      insuranceDetails: contractorData.insuranceDetails,
      description: contractorData.description,
      previousProjects: contractorData.previousProjects,
      assignedProjects: contractorData.assignedProjects || [],
      documents: contractorData.documents || []
    };

    console.log('Created new contractor object:', newContractor);
    
    setContractors(prev => {
      const updated = [newContractor, ...prev];
      console.log('Updated contractors list:', updated);
      return updated;
    });
    
    return newContractor;
  };

  const updateContractor = (id, updates) => {
    setContractors(prev => 
      prev.map(contractor => 
        contractor.id === id ? { ...contractor, ...updates } : contractor
      )
    );
  };

  const deleteContractor = (id) => {
    setContractors(prev => prev.filter(contractor => contractor.id !== id));
  };

  const getContractor = (id) => {
    return contractors.find(contractor => contractor.id === id);
  };

  const value = {
    contractors,
    addContractor,
    updateContractor,
    deleteContractor,
    getContractor
  };

  return (
    <ContractorsContext.Provider value={value}>
      {children}
    </ContractorsContext.Provider>
  );
};

export const useContractors = () => {
  const context = useContext(ContractorsContext);
  if (!context) {
    throw new Error('useContractors must be used within a ContractorsProvider');
  }
  return context;
};
