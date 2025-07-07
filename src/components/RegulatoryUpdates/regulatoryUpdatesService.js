// src/components/RegulatoryUpdates/regulatoryUpdatesService.js
import regulatoryContentData from '../../data/regulatoryUpdates.js'; // Updated import
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

// Renamed from getAllUpdates to be more generic
export const getAllContent = async () => {
  return simulateApiCall(() => regulatoryContentData);
};

// Renamed from getUpdateById
export const getContentById = async (contentId) => {
  return simulateApiCall(() => regulatoryContentData.find(c => c.id === contentId) || null);
};

// Renamed from addOrUpdateRegulatoryUpdate
export const addOrUpdateContent = async (contentData) => {
  return simulateApiCall(() => {
    if (contentData.id) {
      // Update
      const index = regulatoryContentData.findIndex(c => c.id === contentData.id);
      if (index !== -1) {
        regulatoryContentData[index] = { ...regulatoryContentData[index], ...contentData, lastUpdated: new Date().toISOString() };
        return regulatoryContentData[index];
      }
    } else {
      // Create
      const prefix = contentData.contentType === 'Publication' ? 'PUB' : 'RU';
      const newContent = {
        ...contentData,
        id: `${prefix}-${new Date().getFullYear()}-${String(regulatoryContentData.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        acknowledgments: contentData.contentType === 'Update' ? [] : undefined,
      };
      regulatoryContentData.push(newContent);
      return newContent;
    }
  });
};

// Renamed from getFullUpdateDetails
export const getFullContentDetails = async (contentId) => {
    const content = await getContentById(contentId);
    if (!content) return null;

    const [document, creator, categories] = await Promise.all([
        content.documentId ? getDocumentById(content.documentId) : Promise.resolve(null),
        getStaffById(content.createdByStaffId),
        content.applicableCategories ? Promise.all(content.applicableCategories.map(catId => licenseCategoriesData.find(c => c.id === catId))) : Promise.resolve([])
    ]);

    return {
        ...content,
        documentDetails: document,
        creatorDetails: creator,
        categoryDetails: categories.filter(c => c)
    };
};