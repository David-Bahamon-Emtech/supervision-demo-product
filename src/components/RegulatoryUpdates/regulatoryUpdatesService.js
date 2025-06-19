// src/components/RegulatoryUpdates/regulatoryUpdatesService.js
import regulatoryUpdatesData from '../../data/regulatoryUpdates.js';
import licenseCategoriesData from '../../data/licenseCategories.js';
import { getDocumentById, getStaffById } from '../Licensing/licensingService.js';

const SIMULATED_DELAY = 50;

const simulateApiCall = (dataFunction) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dataFunction());
    }, SIMULATED_DELAY);
  });
};

export const getAllUpdates = async () => {
  return simulateApiCall(() => regulatoryUpdatesData);
};

export const getUpdateById = async (updateId) => {
  return simulateApiCall(() => regulatoryUpdatesData.find(u => u.updateId === updateId) || null);
};

export const addOrUpdateRegulatoryUpdate = async (updateData) => {
  return simulateApiCall(() => {
    if (updateData.updateId) {
      // Update
      const index = regulatoryUpdatesData.findIndex(u => u.updateId === updateData.updateId);
      if (index !== -1) {
        regulatoryUpdatesData[index] = { ...regulatoryUpdatesData[index], ...updateData, lastUpdated: new Date().toISOString() };
        return regulatoryUpdatesData[index];
      }
    } else {
      // Create
      const newUpdate = {
        ...updateData,
        updateId: `RU-${new Date().getFullYear()}-${String(regulatoryUpdatesData.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        acknowledgments: [],
      };
      regulatoryUpdatesData.push(newUpdate);
      return newUpdate;
    }
  });
};

export const getFullUpdateDetails = async (updateId) => {
    const update = await getUpdateById(updateId);
    if (!update) return null;

    const [document, creator, categories] = await Promise.all([
        getDocumentById(update.documentId),
        getStaffById(update.createdByStaffId),
        Promise.all(update.applicableCategories.map(catId => licenseCategoriesData.find(c => c.id === catId)))
    ]);

    return {
        ...update,
        documentDetails: document,
        creatorDetails: creator,
        categoryDetails: categories.filter(c => c)
    };
};