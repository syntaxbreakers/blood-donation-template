import { useState, useEffect } from 'react';

export interface LocationData {
  state: string;
  districts: string[];
}

export const useLocations = () => {
  const [data, setData] = useState<LocationData[]>([]);
  const [states, setStates] = useState<{state_name: string}[]>([]);
  const [districts, setDistricts] = useState<{district_name: string}[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingStates(true);
      try {
        const response = await fetch('https://raw.githubusercontent.com/KTBsomen/Indian-state-district-json/main/india-states-districts-latest.json');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const json = await response.json();
        const stateData = Array.isArray(json) ? json : [];
        setData(stateData);
        setStates(stateData.map((s: any) => ({ state_name: s.state })));
      } catch (error) {
        console.error('Error fetching Indian states:', error);
      } finally {
        setLoadingStates(false);
      }
    };

    fetchLocations();
  }, []);

  const fetchDistricts = (stateName: string) => {
    setLoadingDistricts(true);
    if (!stateName) {
      setDistricts([]);
      setLoadingDistricts(false);
      return;
    }
    
    const selectedState = data.find(s => s.state === stateName);
    if (selectedState) {
      setDistricts(selectedState.districts.map(d => ({ district_name: d })));
    } else {
      setDistricts([]);
    }
    setLoadingDistricts(false);
  };

  return {
    states,
    districts,
    loadingStates,
    loadingDistricts,
    fetchDistricts
  };
};
