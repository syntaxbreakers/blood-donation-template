import { useState, useEffect } from 'react';
import { indianStatesAndDistricts } from '../data/indianStatesAndDistricts';
import type { LocationData } from '../data/indianStatesAndDistricts';

export type { LocationData };

export const useLocations = () => {
  const [data, setData] = useState<LocationData[]>([]);
  const [states, setStates] = useState<{state_name: string}[]>([]);
  const [districts, setDistricts] = useState<{district_name: string}[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    setLoadingStates(true);
    setData(indianStatesAndDistricts);
    setStates(indianStatesAndDistricts.map((s: any) => ({ state_name: s.state })));
    setLoadingStates(false);
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
