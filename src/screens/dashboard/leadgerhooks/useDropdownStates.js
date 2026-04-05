import { useState, useEffect } from "react";
import APIService from "../../services/APIService";

export const useDropdownStates = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [dropdownValue, setDropdownValue] = useState(null);
  const [dropdownItems, setDropdownItems] = useState([
    { label: 'fanter', value: '1' },
    { label: 'cash agent', value: '2' },
    { label: 'direct expense', value: '3' },
    { label: 'distributer', value: '4' },
    { label: 'profit & loss', value: '5' },
    { label: 'indirect expense', value: '6' },
    { label: 'company', value: '7' },
  ]);

  // Debug logging
  useEffect(() => {
    console.log('Dropdown items updated:', dropdownItems);
    console.log('Dropdown value updated:', dropdownValue);
  }, [dropdownItems, dropdownValue]);

  // Ensure dropdown value is valid
  useEffect(() => {
    if (dropdownValue && dropdownItems.length > 0) {
      const isValidValue = dropdownItems.some(item => item.value === dropdownValue);
      if (!isValidValue) {
        console.log('Invalid dropdown value detected, resetting to null');
        setDropdownValue(null);
      } else {
        const selectedItem = dropdownItems.find(item => item.value === dropdownValue);
        console.log('Selected item:', selectedItem);
      }
    }
  }, [dropdownValue, dropdownItems]);

  // Helper function to get label for a given value
  const getDropdownLabel = (value) => {
    const item = dropdownItems.find(item => item.value === value);
    return item ? item.label : null;
  };

  const [openDropdownParty, setOpenDropdownParty] = useState(false);
  const [dropdownValueParty, setDropdownValueParty] = useState(null);
  const [dropdownItemsParty, setDropdownItemsParty] = useState([]);

  const [openDropdownWapsiParty, setOpenDropdownWapsiParty] = useState(false);
  const [dropdownValueWapsiParty, setDropdownValueWapsiParty] = useState(null);
  const [dropdownItemsWapsiParty, setDropdownItemsWapsiParty] = useState([]);

  const [openDropdownPattiParty, setOpenDropdownPattiParty] = useState(false);
  const [dropdownValuePattiParty, setDropdownValuePattiParty] = useState(null);
  const [dropdownItemsPattiParty, setDropdownItemsPattiParty] = useState([]);

  const [openDropdownDistributor, setOpenDropdownDistributor] = useState(false);
  const [dropdownValueDistributor, setDropdownValueDistributor] = useState(null);
  const [dropdownItemsDistributor, setDropdownItemsDistributor] = useState([]);

  const [openDropdown3, setOpenDropdown3] = useState(false);
  const [dropdownValue3, setDropdownValue3] = useState(null);
  const [dropdownItems3, setDropdownItems3] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [distributorLoading, setDistributorLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchAgentData();
    fetchLedgerData();
    fetchDistributorData();
  }, []);

  // Fetch agent dropdown data
  const fetchAgentData = async () => {
    try {
      setAgentLoading(true);
      const response = await APIService.GetAgentDropDownDataData();
      console.log('Agent data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for agents
        const transformedAgents = response.data.map((agent) => ({
          label: agent.agent_name || agent.name || 'Unknown Agent',
          value: agent.id?.toString() || agent.agent_id?.toString() || ''
        }));
        setDropdownItems3(transformedAgents);
        console.log('Transformed agent items:', transformedAgents);
      } else {
        console.log('No agent data found or API error');
        setDropdownItems3([]);
      }
    } catch (error) {
      console.error('Error fetching agent data:', error);
      setDropdownItems3([]);
    } finally {
      setAgentLoading(false);
    }
  };

  // Fetch ledger dropdown data for party dropdowns
  const fetchLedgerData = async () => {
    try {
      setLedgerLoading(true);
      const response = await APIService.GetLedgerDropDownDataData();
      console.log('Ledger data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for ledgers
        const transformedLedgers = response.data.map((ledger) => ({
          label: ledger.real_name || ledger.name || 'Unknown Ledger',
          value: ledger.id?.toString() || ledger.ledger_id?.toString() || ''
        }));
        
        // Set the same data for all party dropdowns
        setDropdownItemsParty(transformedLedgers);
        setDropdownItemsWapsiParty(transformedLedgers);
        setDropdownItemsPattiParty(transformedLedgers);
        
        console.log('Transformed ledger items:', transformedLedgers);
      } else {
        console.log('No ledger data found or API error');
        setDropdownItemsParty([]);
        setDropdownItemsWapsiParty([]);
        setDropdownItemsPattiParty([]);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setDropdownItemsParty([]);
      setDropdownItemsWapsiParty([]);
      setDropdownItemsPattiParty([]);
    } finally {
      setLedgerLoading(false);
    }
  };

  // Fetch distributor dropdown data
  const fetchDistributorData = async () => {
    try {
      setDistributorLoading(true);
      const response = await APIService.GetDistributorDropDownDataData();
      console.log('Distributor data response:', response);
      
      if (response && response.success && response.data) {
        // Transform the API response to match dropdown format for distributors
        const transformedDistributors = response.data.map((distributor) => ({
          label: distributor.name || distributor.distributor_name || 'Unknown Distributor',
          value: distributor.id?.toString() || distributor.distributor_id?.toString() || ''
        }));
        
        setDropdownItemsDistributor(transformedDistributors);
        console.log('Transformed distributor items:', transformedDistributors);
      } else {
        console.log('No distributor data found or API error');
        setDropdownItemsDistributor([]);
      }
    } catch (error) {
      console.error('Error fetching distributor data:', error);
      setDropdownItemsDistributor([]);
    } finally {
      setDistributorLoading(false);
    }
  };

  const [openDropdownLimit, setOpenDropdownLimit] = useState(false);
  const [dropdownValueLimit, setDropdownValueLimit] = useState('1'); // Default to 'Yes'
  const [dropdownItemsLimit, setDropdownItemsLimit] = useState([
    { label: 'Yes', value: '1' },
    { label: 'No', value: '2' },
  ]);

  // Function to clear all dropdown states
  const clearAllDropdownStates = () => {
    setDropdownValue(null);
    setDropdownValueParty(null);
    setDropdownValueWapsiParty(null);
    setDropdownValuePattiParty(null);
    setDropdownValueDistributor(null);
    setDropdownValue3(null);
    setDropdownValueLimit('1'); // Reset to default 'Yes'
    
    // Close all dropdowns
    setOpenDropdown(false);
    setOpenDropdownParty(false);
    setOpenDropdownWapsiParty(false);
    setOpenDropdownPattiParty(false);
    setOpenDropdownDistributor(false);
    setOpenDropdown3(false);
    setOpenDropdownLimit(false);
  };

  return {
    // Group dropdown
    openDropdown, setOpenDropdown, dropdownValue, setDropdownValue, dropdownItems, setDropdownItems,
    // Party dropdown
    openDropdownParty, setOpenDropdownParty, dropdownValueParty, setDropdownValueParty, dropdownItemsParty, setDropdownItemsParty,
    // Wapsi Party dropdown
    openDropdownWapsiParty, setOpenDropdownWapsiParty, dropdownValueWapsiParty, setDropdownValueWapsiParty, dropdownItemsWapsiParty, setDropdownItemsWapsiParty,
    // Patti Party dropdown
    openDropdownPattiParty, setOpenDropdownPattiParty, dropdownValuePattiParty, setDropdownValuePattiParty, dropdownItemsPattiParty, setDropdownItemsPattiParty,
    // Distributor dropdown
    openDropdownDistributor, setOpenDropdownDistributor, dropdownValueDistributor, setDropdownValueDistributor, dropdownItemsDistributor, setDropdownItemsDistributor,
    // Agent dropdown
    openDropdown3, setOpenDropdown3, dropdownValue3, setDropdownValue3, dropdownItems3, setDropdownItems3, agentLoading,
    // Limit dropdown
    openDropdownLimit, setOpenDropdownLimit, dropdownValueLimit, setDropdownValueLimit, dropdownItemsLimit, setDropdownItemsLimit,
    // Loading states
    ledgerLoading, distributorLoading,
    // Helper function
    getDropdownLabel,
    // Clear function
    clearAllDropdownStates,
  };
};
