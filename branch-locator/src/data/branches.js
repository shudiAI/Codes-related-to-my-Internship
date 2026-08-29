// DEMO / PROTOTYPE DATA ONLY. Replace these records with approved organizational data.
export const organizations = [
  { id: 'motls', name: 'Ministry of Transport and Logistics Services' },
  { id: 'wtc', name: 'Water Transmission Company' },
  { id: 'sec', name: 'Saudi Electricity Company' },
  { id: 'nwc', name: 'National Water Company' },
  { id: 'national-guard', name: 'National Guard' },
  { id: 'border-guard', name: 'Border Guard' },
  { id: 'future-authority', name: 'Future Authority (No demo branches)' },
];

export const branches = [
  { id: 'motls-riyadh', organizationId: 'motls', branchName: 'Central Region Branch', city: 'Riyadh', latitude: 24.7136, longitude: 46.6753 },
  { id: 'motls-jeddah', organizationId: 'motls', branchName: 'Western Region Branch', city: 'Jeddah', latitude: 21.5433, longitude: 39.1728 },
  { id: 'motls-dammam', organizationId: 'motls', branchName: 'Eastern Region Branch', city: 'Dammam', latitude: 26.4207, longitude: 50.0888 },
  { id: 'motls-abha', organizationId: 'motls', branchName: 'Southern Region Branch', city: 'Abha', latitude: 18.2465, longitude: 42.5117 },

  { id: 'wtc-riyadh', organizationId: 'wtc', branchName: 'Riyadh Operations Branch', city: 'Riyadh', latitude: 24.7743, longitude: 46.7386 },
  { id: 'wtc-taif', organizationId: 'wtc', branchName: 'Taif Operations Branch', city: 'Taif', latitude: 21.4373, longitude: 40.5127 },
  { id: 'wtc-buraydah', organizationId: 'wtc', branchName: 'Qassim Operations Branch', city: 'Buraydah', latitude: 26.3592, longitude: 43.9818 },

  { id: 'sec-riyadh', organizationId: 'sec', branchName: 'Central Customer Services Branch', city: 'Riyadh', latitude: 24.6877, longitude: 46.7219 },
  { id: 'sec-dammam', organizationId: 'sec', branchName: 'Eastern Customer Services Branch', city: 'Dammam', latitude: 26.3927, longitude: 49.9777 },
  { id: 'sec-jeddah', organizationId: 'sec', branchName: 'Western Customer Services Branch', city: 'Jeddah', latitude: 21.4858, longitude: 39.1925 },
  { id: 'sec-tabuk', organizationId: 'sec', branchName: 'Northwestern Services Branch', city: 'Tabuk', latitude: 28.3838, longitude: 36.5550 },

  { id: 'nwc-riyadh', organizationId: 'nwc', branchName: 'Riyadh City Branch', city: 'Riyadh', latitude: 24.7505, longitude: 46.6541 },
  { id: 'nwc-madinah', organizationId: 'nwc', branchName: 'Madinah City Branch', city: 'Madinah', latitude: 24.5247, longitude: 39.5692 },
  { id: 'nwc-jeddah', organizationId: 'nwc', branchName: 'Jeddah City Branch', city: 'Jeddah', latitude: 21.6120, longitude: 39.1564 },

  { id: 'ng-riyadh', organizationId: 'national-guard', branchName: 'Central Sector Branch', city: 'Riyadh', latitude: 24.7484, longitude: 46.8612 },
  { id: 'ng-jeddah', organizationId: 'national-guard', branchName: 'Western Sector Branch', city: 'Jeddah', latitude: 21.6289, longitude: 39.2004 },
  { id: 'ng-dammam', organizationId: 'national-guard', branchName: 'Eastern Sector Branch', city: 'Dammam', latitude: 26.4051, longitude: 50.1154 },

  { id: 'bg-jazan', organizationId: 'border-guard', branchName: 'Jazan Sector Branch', city: 'Jazan', latitude: 16.8894, longitude: 42.5706 },
  { id: 'bg-tabuk', organizationId: 'border-guard', branchName: 'Tabuk Sector Branch', city: 'Tabuk', latitude: 28.3998, longitude: 36.5715 },
  { id: 'bg-arar', organizationId: 'border-guard', branchName: 'Northern Borders Branch', city: 'Arar', latitude: 30.9753, longitude: 41.0381 },
];
