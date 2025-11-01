import { createContext, useContext, useState, useEffect } from 'react';
import { contractorAPI, authAPI } from '../services/api';

const ContractorsContext = createContext();

export const ContractorsProvider = ({ children }) => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading contractors from API...');
      const response = await contractorAPI.getAll();
      console.log('Load contractors response:', response);
      
      if (response.success && response.data && response.data.contractors) {
        // Transform API data to match frontend structure
        const transformed = response.data.contractors.map(contractor => ({
          id: contractor.id,
          name: contractor.companyName,
          email: contractor.companyEmail,
          phone: contractor.companyPhone,
          contact: contractor.contactPerson,
          specialization: contractor.specialization?.[0] || 'General',
          rating: contractor.rating || 0,
          status: contractor.isVerified ? 'Active' : 'Inactive',
          projects: { completed: 0, ongoing: 0 },
          location: contractor.companyAddress || 'Not specified',
          joinDate: (() => {
            if (!contractor.createdAt) return new Date().toISOString().split('T')[0];
            try {
              if (typeof contractor.createdAt.toDate === 'function') {
                return new Date(contractor.createdAt.toDate()).toISOString().split('T')[0];
              }
              const date = new Date(contractor.createdAt);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.error('Error parsing date:', e);
            }
            return new Date().toISOString().split('T')[0];
          })(),
          totalValue: '₦0',
          userId: contractor.userId,
          registrationNumber: contractor.registrationNo,
          isVerified: contractor.isVerified,
          isCertified: contractor.isCertified,
          yearsExperience: contractor.yearsExperience,
          user: contractor.user
        }));
        console.log('Transformed contractors:', transformed);
        setContractors(transformed);
      } else {
        console.log('No contractors found in response');
        setContractors([]);
      }
    } catch (error) {
      if (error.message && error.message.includes('Authentication expired')) {
        console.log('Authentication expired, skipping contractors load');
        setContractors([]);
      } else {
        console.error('Error loading contractors:', error);
        setError(error.message);
        setContractors([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load contractors from API on mount - only if authenticated
  useEffect(() => {
    // Check if we have an auth token before trying to load contractors
    const authToken = localStorage.getItem('gpt_auth');
    if (authToken) {
      try {
        const parsed = JSON.parse(authToken);
        if (parsed.token) {
          console.log('Auth token found, loading contractors...');
          loadContractors();
          return;
        }
      } catch (e) {
        console.log('Invalid auth data, skipping contractors load');
      }
    }
    console.log('No auth token, skipping contractors load');
    // No auth token, just mark as loaded
    setLoading(false);
  }, []);

  const addContractor = async (contractorData) => {
    try {
      // Step 1: Register the user first
      const userRegistrationData = {
      email: contractorData.email,
        password: contractorData.password,
        firstName: contractorData.contactPerson?.split(' ')[0] || contractorData.contactPerson,
        lastName: contractorData.contactPerson?.split(' ').slice(1).join(' ') || '',
        role: 'CONTRACTOR',
      phone: contractorData.phone,
      };

      console.log('Registering user:', userRegistrationData);
      const userResponse = await authAPI.register(userRegistrationData);
      
      if (!userResponse.success) {
        throw new Error(userResponse.message || 'Failed to register user');
      }

      const userId = userResponse.data.user.id;
      console.log('User registered successfully with ID:', userId);

      // Step 2: Create contractor profile using the user ID
      const contractorProfileData = {
        userId: userId,
        companyName: contractorData.companyName,
        registrationNo: contractorData.registrationNumber,
        contactPerson: contractorData.contactPerson,
        companyEmail: contractorData.email,
        companyPhone: contractorData.phone,
        companyAddress: contractorData.address || `${contractorData.city}, ${contractorData.state}`,
        yearsExperience: contractorData.yearsInBusiness,
        specialization: contractorData.specialization ? [contractorData.specialization] : []
      };

      console.log('Creating contractor profile:', contractorProfileData);
      const response = await contractorAPI.create(contractorProfileData);
      
      if (response.success) {
        await loadContractors();
        return response.data.contractor;
      }
      throw new Error(response.message || 'Failed to create contractor profile');
    } catch (error) {
      console.error('Error adding contractor:', error);
      throw error;
    }
  };

  const updateContractor = async (id, updates) => {
    try {
      const response = await contractorAPI.update(id, updates);
      if (response.success) {
        await loadContractors();
        return response.data.contractor;
      }
      throw new Error(response.message || 'Failed to update contractor');
    } catch (error) {
      console.error('Error updating contractor:', error);
      throw error;
    }
  };

  const deleteContractor = async (id) => {
    try {
      // Note: Need to check if delete endpoint exists in backend
      await loadContractors();
    } catch (error) {
      console.error('Error deleting contractor:', error);
      throw error;
    }
  };

  const getContractor = (id) => {
    return contractors.find(contractor => contractor.id === id);
  };

  const value = {
    contractors,
    loading,
    error,
    addContractor,
    updateContractor,
    deleteContractor,
    getContractor,
    refreshContractors: loadContractors
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
