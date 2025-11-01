import { createContext, useContext, useState, useEffect } from 'react';
import { contractorAPI } from '../services/api';

const ContractorsContext = createContext();

export const ContractorsProvider = ({ children }) => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load contractors from API on mount
  useEffect(() => {
    loadContractors();
  }, []);

  const loadContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractorAPI.getAll();
      
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
          projects: { completed: 0, ongoing: 0 }, // Will be populated from projects data
          location: contractor.companyAddress || 'Not specified',
          joinDate: contractor.createdAt ? new Date(contractor.createdAt.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          totalValue: '₦0',
          // Store full data for reference
          userId: contractor.userId,
          registrationNumber: contractor.registrationNumber,
          isVerified: contractor.isVerified,
          isCertified: contractor.isCertified,
          yearsExperience: contractor.yearsExperience,
          user: contractor.user
        }));
        setContractors(transformed);
      } else {
        setContractors([]);
      }
    } catch (error) {
      // Silently handle auth errors when not logged in (e.g., on public pages)
      if (error.message && error.message.includes('Authentication expired')) {
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

  const addContractor = async (contractorData) => {
    try {
      const response = await contractorAPI.create(contractorData);
      if (response.success) {
        await loadContractors();
        return response.data.contractor;
      }
      throw new Error(response.message || 'Failed to create contractor');
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
