// src/data/regulatoryUpdates.js

/**
 * @typedef {Object} RegulatoryContent
 * @property {string} id - Unique ID (e.g., "RU-2025-001" or "PUB-2025-001").
 * @property {'Update' | 'Publication' | 'Event'} contentType - The type of content.
 * @property {string} title - Official title of the content.
 * @property {string} [documentId] - Links to the master document in documents.js.
 * @property {string} type - The nature of the update (e.g., 'Regulation', 'Guidance', 'Research Paper', 'Economic Report', 'Consultation', 'Webinar').
 * @property {'Draft' | 'Published' | 'Superseded' | 'Archived' | 'Scheduled' | 'Completed' | 'Cancelled'} status - The lifecycle status.
 * @property {string} [issueDate] - ISO date string the content was officially issued/published.
 * @property {string} [effectiveDate] - ISO date string rules come into effect (for Updates).
 * @property {string[]} [applicableCategories] - Array of licenseCategory.id this update applies to (for Updates).
 * @property {string} summary - A concise, plain-language summary or abstract.
 * @property {string} [promptUsed] - The prompt used to generate the content.
 * @property {string} [textContent] - The full, AI-generated text content or event details.
 * @property {string} createdByStaffId - Links to regulatorStaff.js.
 * @property {string} createdAt - ISO date string of creation.
 * @property {string} lastUpdated - ISO date string of last modification.
 * @property {Array<{entityId: string, acknowledgedAt: string}>} [acknowledgments] - Tracks entity acknowledgments (for Updates).
 * @property {string} [author] - The author or department for a Publication.
 * @property {string[]} [tags] - Keywords for searchability (for Publications).
 * @property {string} [eventDate] - ISO date string for the event's start time.
 * @property {string} [eventEndDate] - ISO date string for the event's end time.
 * @property {string} [location] - Physical or virtual location of the event.
 */

/** @type {RegulatoryContent[]} */
const regulatoryContent = [
  // --- Regulatory Updates ---
  {
    id: "RU-2025-001",
    contentType: "Update",
    title: "New Capital Adequacy Requirements for CASPs",
    documentId: "doc_013",
    type: "Regulation",
    status: "Published",
    issueDate: "2025-06-10",
    effectiveDate: "2025-09-01",
    applicableCategories: ["cat_crypto_asset"],
    summary: "This regulation introduces a new tiered capital adequacy framework...",
    createdByStaffId: "reg_001",
    createdAt: "2025-06-01T10:00:00Z",
    lastUpdated: "2025-06-10T11:00:00Z",
    acknowledgments: [{ entityId: "ent_002", acknowledgedAt: "2025-06-12T14:00:00Z" }],
  },
  // --- Research & Publications ---
  {
    id: "PUB-2025-001",
    contentType: "Publication",
    title: "The Impact of Decentralized Finance on Traditional Banking",
    documentId: "doc_001",
    author: "Risk Management Unit",
    type: "Research Paper",
    tags: ["DeFi", "Systemic Risk", "Banking"],
    status: "Published",
    issueDate: "2025-05-20",
    summary: "This paper explores the potential contagion effects of DeFi protocols...",
    createdByStaffId: "reg_008",
    createdAt: "2025-05-15T10:00:00Z",
    lastUpdated: "2025-05-20T09:00:00Z",
  },
  // --- Events ---
  {
    id: "EVT-2025-001",
    contentType: "Event",
    title: "Industry Consultation on Proposed Data Reporting Standards",
    type: "Consultation",
    status: "Scheduled",
    summary: "A consultation with industry leaders to discuss the new proposed data reporting standards for all licensed entities.",
    eventDate: "2025-07-15T10:00:00.000Z",
    eventEndDate: "2025-07-15T12:00:00.000Z",
    location: "Virtual - Link to be provided",
    createdByStaffId: "reg_002",
    createdAt: "2025-06-20T10:00:00Z",
    lastUpdated: "2025-06-20T10:00:00Z",
  },
  {
    id: "EVT-2025-002",
    contentType: "Event",
    title: "Webinar: Understanding the New Capital Adequacy Requirements",
    type: "Webinar",
    status: "Scheduled",
    summary: "A detailed webinar explaining the new capital adequacy requirements for CASPs (RU-2025-001).",
    eventDate: "2025-08-05T14:00:00.000Z",
    eventEndDate: "2025-08-05T15:30:00.000Z",
    location: "Virtual",
    createdByStaffId: "reg_001",
    createdAt: "2025-07-01T11:00:00Z",
    lastUpdated: "2025-07-01T11:00:00Z",
  },
  {
    id: "EVT-2025-003",
    contentType: "Event",
    title: "Annual FinTech Conference 2025",
    type: "Conference",
    status: "Scheduled",
    summary: "The regulator's annual conference on financial technology and innovation.",
    eventDate: "2025-09-10T09:00:00.000Z",
    eventEndDate: "2025-09-11T17:00:00.000Z",
    location: "Grand Conference Center, Room 3A",
    createdByStaffId: "reg_005",
    createdAt: "2025-06-15T12:00:00Z",
    lastUpdated: "2025-06-15T12:00:00Z",
  },
  {
    id: "EVT-2025-004",
    contentType: "Event",
    title: "Training: AML/CFT Best Practices for MSBs",
    type: "Training",
    status: "Completed",
    summary: "A training session on Anti-Money Laundering and Counter-Financing of Terrorism best practices for Money Service Businesses.",
    eventDate: "2025-06-25T09:30:00.000Z",
    eventEndDate: "2025-06-25T12:30:00.000Z",
    location: "Regulator HQ, Training Room 1",
    createdByStaffId: "reg_003",
    createdAt: "2025-05-20T13:00:00Z",
    lastUpdated: "2025-06-26T09:00:00Z",
  },
  {
    id: "EVT-2025-005",
    contentType: "Event",
    title: "Public Consultation on E-Money Licensing Framework",
    type: "Consultation",
    status: "Scheduled",
    summary: "Seeking public and industry feedback on proposed changes to the e-money licensing framework.",
    eventDate: "2025-08-20T10:00:00.000Z",
    eventEndDate: "2025-08-20T11:00:00.000Z",
    location: "Virtual",
    createdByStaffId: "reg_002",
    createdAt: "2025-07-10T14:00:00Z",
    lastUpdated: "2025-07-10T14:00:00Z",
  },
  {
    id: "EVT-2025-006",
    contentType: "Event",
    title: "Cybersecurity Threat Briefing (Quarterly)",
    type: "Webinar",
    status: "Scheduled",
    summary: "Quarterly briefing on the latest cybersecurity threats and vulnerabilities in the financial sector.",
    eventDate: "2025-07-22T11:00:00.000Z",
    eventEndDate: "2025-07-22T12:00:00.000Z",
    location: "Virtual - Invite Only",
    createdByStaffId: "reg_006",
    createdAt: "2025-07-02T15:00:00Z",
    lastUpdated: "2025-07-02T15:00:00Z",
  },
];

export default regulatoryContent;