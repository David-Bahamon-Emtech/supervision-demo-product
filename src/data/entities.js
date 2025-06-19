/**
 * @typedef {Object} IndividualContactDetail
 * @property {string} contactId - Unique identifier for the individual contact (e.g., "person_001").
 * @property {string} fullName - Full name of the individual.
 * @property {string} email - Email address of the individual.
 * @property {string} phone - Phone number of the individual.
 * @property {string} dateOfBirth - ISO date string for date of birth (e.g., "1980-01-15").
 * @property {string} nationality - Nationality of the individual.
 * @property {string} residentialAddress - Full residential address.
 * @property {string} idDocumentType - Type of identification document (e.g., "Passport", "National ID", "State Driver's License").
 * @property {string} idDocumentNumber - Number of the identification document.
 * @property {string} idDocumentExpiry - ISO date string for ID expiry (e.g., "2030-12-31").
 * @property {boolean} isPEP - Politically Exposed Person status.
 * @property {string} [role] - Role of the person if a director (e.g., "Director", "Non-Executive Director", "Managing Director").
 * @property {number} [ownershipPercentage] - Percentage of ownership if a UBO.
 * @property {string} [position] - Position if key management personnel or primary contact (e.g., "CEO", "Head of Innovation", "Chief Security Officer").
 */

/**
 * @typedef {Object} Entity
 * @property {string} entityId - Unique identifier for the entity (e.g., "ent_001").
 * @property {string} companyName - Common name of the company.
 * @property {string} legalName - Official registered name of the entity.
 * @property {string} registrationNumber - Official business registration ID.
 * @property {string} dateOfIncorporation - ISO date string for date of incorporation (e.g., "2020-01-15").
 * @property {string} jurisdictionOfIncorporation - Where the company is legally registered.
 * @property {string} companyType - (e.g., "Private Limited Company", "LLC", "Public Company", "Incorporated Company", "International Business Company").
 * @property {string} primaryAddress - Full primary business address (Street, City, Postal Code, Country).
 * @property {string} website - Company's official website.
 * @property {IndividualContactDetail} primaryContact - Primary contact person for the entity.
 * @property {IndividualContactDetail[]} directors - Array of director objects.
 * @property {IndividualContactDetail[]} ubos - Array of Ultimate Beneficial Owner objects.
 * @property {string} assignedOfficerId - Links to RegulatorStaff.staffId (primary regulator contact for the entity).
 * @property {string} [internalRiskRating] - (e.g., "Low", "Medium", "High") - Optional for now.
 * @property {string} [supervisoryNotes] - General notes by the regulator - Optional for now.
 * @property {string} [entityStatus] - (e.g., "Applicant", "Licensed", "Former Applicant") - Optional for now, can be derived later.
 * @property {string} [complianceReadinessStatus] - (e.g., "Ready for Compliance Check", "Compliance Submission Pending", "Under Active Review") - Optional.
 */

/**
 * @type {Entity[]}
 */
const entities = [
  {
    entityId: "ent_001",
    companyName: "Summit Capital",
    legalName: "Summit Capital LLC",
    registrationNumber: "ACORP-FIN-00123",
    dateOfIncorporation: "2019-03-15",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "1000 Main Street, New York, NY, USA",
    website: "https://summitcapital.example.com",
    primaryContact: {
      contactId: "person_001",
      fullName: "Liam Smith",
      email: "s.connor@alphacorp.demo",
      phone: "+111-555-0100",
      dateOfBirth: "1985-07-22",
      nationality: "American",
      residentialAddress: "50114 Oak Street, Anchorage, AK, USA",
      idDocumentType: "Passport",
      idDocumentNumber: "TPASS0012345",
      idDocumentExpiry: "2031-06-30",
      isPEP: false,
      position: "CEO",
    },
    directors: [
      {
        contactId: "person_001", // Sarah Connor is also a director
        fullName: "Liam Smith",
        email: "s.connor@alphacorp.demo",
        phone: "+111-555-0100",
        dateOfBirth: "1985-07-22",
        nationality: "American",
        residentialAddress: "50759 Oak Street, Chicago, IL, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "TPASS0012345",
        idDocumentExpiry: "2031-06-30",
        isPEP: false,
        role: "Executive Director (CEO)",
      },
      {
        contactId: "person_002",
        fullName: "Liam Brown",
        email: "j.matrix@alphacorp.demo",
        phone: "+111-555-0101",
        dateOfBirth: "1978-11-05",
        nationality: "American",
        residentialAddress: "50250 Oak Street, Las Vegas, NV, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "TNIDM0067890",
        idDocumentExpiry: "2029-10-15",
        isPEP: false,
        role: "Non-Executive Director",
      },
    ],
    ubos: [
      {
        contactId: "person_003",
        fullName: "Liam Garcia",
        email: "k.reese@privateemail.demo", // UBO might have private email
        phone: "+111-555-0102",
        dateOfBirth: "1990-01-10",
        nationality: "American",
        residentialAddress: "50142 Oak Street, Detroit, MI, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "TPASS0023456",
        idDocumentExpiry: "2033-02-28",
        isPEP: false,
        ownershipPercentage: 60,
      },
      {
        contactId: "person_001", // Sarah Connor also a UBO
        fullName: "Liam Smith",
        email: "s.connor@alphacorp.demo",
        phone: "+111-555-0100",
        dateOfBirth: "1985-07-22",
        nationality: "American",
        residentialAddress: "50104 Oak Street, Tulsa, OK, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "TPASS0012345",
        idDocumentExpiry: "2031-06-30",
        isPEP: false,
        ownershipPercentage: 40,
      },
    ],
    assignedOfficerId: "reg_002", // Bob The Builder
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_002",
    companyName: "Summit Financial",
    legalName: "Summit Financial LLC",
    registrationNumber: "BBANK-PLC-00888",
    dateOfIncorporation: "2020-07-01",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Public Limited Company",
    primaryAddress: "1001 Main Street, Chicago, IL, USA",
    website: "https://summitfinancial.example.com",
    primaryContact: {
      contactId: "person_004",
      fullName: "Liam Rodriguez",
      email: "e.ripley@betabank.demo",
      phone: "+222-555-0200",
      dateOfBirth: "1979-10-27",
      nationality: "American",
      residentialAddress: "50758 Oak Street, Providence, RI, USA",
      idDocumentType: "Passport",
      idDocumentNumber: "FPASS0034567",
      idDocumentExpiry: "2032-08-14",
      isPEP: false,
      position: "Head of Innovation",
    },
    directors: [
      {
        contactId: "person_004", // Ellen Ripley
        fullName: "Liam Rodriguez",
        email: "e.ripley@betabank.demo",
        phone: "+222-555-0200",
        dateOfBirth: "1979-10-27",
        nationality: "American",
        residentialAddress: "5089 Oak Street, Albany, NY, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "FPASS0034567",
        idDocumentExpiry: "2032-08-14",
        isPEP: false,
        role: "Executive Director",
      },
      {
        contactId: "person_005",
        fullName: "Liam Lopez",
        email: "m.dyson@betabank.demo",
        phone: "+222-555-0201",
        dateOfBirth: "1965-02-12",
        nationality: "American",
        residentialAddress: "50432 Oak Street, New Orleans, LA, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "FNIDM0098765",
        idDocumentExpiry: "2028-05-20",
        isPEP: true, // Example of a PEP
        role: "Chairman (Non-Executive)",
      },
    ],
    ubos: [
      {
        contactId: "person_006",
        fullName: "Liam Wilson", // UBO might be different from directors
        email: "b.weyland@weylandcorp.demo",
        phone: "+222-555-0202",
        dateOfBirth: "1950-11-30",
        nationality: "American",
        residentialAddress: "5030 Oak Street, Los Angeles, CA, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "FPASS0045678",
        idDocumentExpiry: "2027-01-10",
        isPEP: true,
        ownershipPercentage: 75,
      },
    ],
    assignedOfficerId: "reg_003", // Carol Danvers
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_003",
    companyName: "Summit Investments",
    legalName: "Summit Investments LLC",
    registrationNumber: "GCTS-INC-00555",
    dateOfIncorporation: "2021-01-20",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "International Business Company",
    primaryAddress: "1002 Main Street, Los Angeles, CA, USA",
    website: "https://summitinvestments.example.com",
    primaryContact: {
      contactId: "person_007",
      fullName: "Liam Thomas",
      email: "m.rockatansky@gammatrade.demo",
      phone: "+333-555-0300",
      dateOfBirth: "1982-04-03",
      nationality: "American", // Fictional for variety
      residentialAddress: "50223 Oak Street, Miami, FL, USA",
      idDocumentType: "DZ Passport", // Fictional ID type
      idDocumentNumber: "DZPASS0056789",
      idDocumentExpiry: "2030-07-07",
      isPEP: false,
      position: "Chief Operations Officer",
    },
    directors: [
      {
        contactId: "person_007", // Max Rockatansky
        fullName: "Liam Thomas",
        email: "m.rockatansky@gammatrade.demo",
        phone: "+333-555-0300",
        dateOfBirth: "1982-04-03",
        nationality: "American",
        residentialAddress: "50517 Oak Street, Detroit, MI, USA",
        idDocumentType: "DZ Passport",
        idDocumentNumber: "DZPASS0056789",
        idDocumentExpiry: "2030-07-07",
        isPEP: false,
        role: "Managing Director",
      },
      {
        contactId: "person_008",
        fullName: "Liam Jackson",
        email: "a.entity@gammatrade.demo",
        phone: "+333-555-0301",
        dateOfBirth: "1968-09-17",
        nationality: "American",
        residentialAddress: "5027 Oak Street, Sacramento, CA, USA",
        idDocumentType: "DZ National ID",
        idDocumentNumber: "DZNID0012345",
        idDocumentExpiry: "2034-11-22",
        isPEP: true,
        role: "Director",
      },
    ],
    ubos: [
      { // UBO can be a trust or another entity in reality, but for KYC demo we'll use individuals.
        contactId: "person_009",
        fullName: "Liam Lee",
        email: "i.joe@citadelholdings.demo",
        phone: "+333-555-0302",
        dateOfBirth: "1955-05-05",
        nationality: "American",
        residentialAddress: "50203 Oak Street, Boulder, CO, USA",
        idDocumentType: "DZ Passport",
        idDocumentNumber: "DZPASS0067890",
        idDocumentExpiry: "2026-12-12",
        isPEP: true,
        ownershipPercentage: 100, // Assuming sole UBO for this one
      },
    ],
    assignedOfficerId: "reg_007", // Grace Hopper
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_004",
    companyName: "Summit Holdings",
    legalName: "Summit Holdings LLC",
    registrationNumber: "DDACS-LLC-07890",
    dateOfIncorporation: "2022-05-10",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Limited Liability Company",
    primaryAddress: "1003 Main Street, San Francisco, CA, USA",
    website: "https://summitholdings.example.com",
    primaryContact: {
      contactId: "person_010",
      fullName: "Liam Thompson",
      email: "d.prince@deltasecure.demo",
      phone: "+1-505-555-0400",
      dateOfBirth: "1988-03-01",
      nationality: "American",
      residentialAddress: "50665 Oak Street, Fargo, ND, USA",
      idDocumentType: "State Driver's License",
      idDocumentNumber: "NFDL98765P",
      idDocumentExpiry: "2029-02-28",
      isPEP: false,
      position: "Chief Security Officer",
    },
    directors: [
      {
        contactId: "person_010", // Diana Prince
        fullName: "Liam Thompson",
        email: "d.prince@deltasecure.demo",
        phone: "+1-505-555-0400",
        dateOfBirth: "1988-03-01",
        nationality: "American",
        residentialAddress: "50558 Oak Street, Manchester, NH, USA",
        idDocumentType: "State Driver's License",
        idDocumentNumber: "NFDL98765P",
        idDocumentExpiry: "2029-02-28",
        isPEP: false,
        role: "Executive Director (CSO)",
      },
      {
        contactId: "person_011",
        fullName: "Liam Sanchez",
        email: "s.trevor@deltasecure.demo",
        phone: "+1-505-555-0401",
        dateOfBirth: "1980-11-11",
        nationality: "American",
        residentialAddress: "50225 Oak Street, Cleveland, OH, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "USPASSX00789",
        idDocumentExpiry: "2033-10-10",
        isPEP: false,
        role: "Non-Executive Director",
      },
    ],
    ubos: [
      {
        contactId: "person_012",
        fullName: "Liam Ramirez", // Fictional UBO name
        email: "ares@olympuscap.demo",
        phone: "+1-505-555-0402",
        dateOfBirth: "1960-06-06",
        nationality: "American",
        residentialAddress: "50603 Oak Street, Nashville, TN, USA",
        idDocumentType: "Foreign Passport",
        idDocumentNumber: "GRPASSH00123",
        idDocumentExpiry: "2028-08-08",
        isPEP: true,
        ownershipPercentage: 80,
      }
    ],
    assignedOfficerId: "reg_004", // David Copperfield
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_005",
    companyName: "Summit Advisors",
    legalName: "Summit Advisors LLC",
    registrationNumber: "EPSLN-EMI-00321",
    dateOfIncorporation: "2023-02-28",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "1004 Main Street, Dallas, TX, USA",
    website: "https://summitadvisors.example.com",
    primaryContact: {
      contactId: "person_013",
      fullName: "Liam Robinson",
      email: "a.curry@epsilongroup.demo",
      phone: "+444-555-0500",
      dateOfBirth: "1986-07-29",
      nationality: "American",
      residentialAddress: "50828 Oak Street, Las Vegas, NV, USA",
      idDocumentType: "National ID",
      idDocumentNumber: "CYBNID0054321",
      idDocumentExpiry: "2035-01-15",
      isPEP: false,
      position: "Managing Director",
    },
    directors: [
      {
        contactId: "person_013", // Arthur Curry
        fullName: "Liam Robinson",
        email: "a.curry@epsilongroup.demo",
        phone: "+444-555-0500",
        dateOfBirth: "1986-07-29",
        nationality: "American",
        residentialAddress: "50777 Oak Street, New York, NY, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "CYBNID0054321",
        idDocumentExpiry: "2035-01-15",
        isPEP: false,
        role: "Managing Director",
      },
      {
        contactId: "person_014",
        fullName: "Liam Allen",
        email: "m.xebel@epsilongroup.demo",
        phone: "+444-555-0501",
        dateOfBirth: "1987-10-03",
        nationality: "American",
        residentialAddress: "50714 Oak Street, Phoenix, AZ, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "CYBPAS0067890",
        idDocumentExpiry: "2032-11-30",
        isPEP: true, // Royal family connection by marriage, potentially
        role: "Director of Operations",
      },
    ],
    ubos: [
      {
        contactId: "person_015",
        fullName: "Liam Wright",
        email: "orm.marius@atlantisroyal.demo",
        phone: "+444-555-0502",
        dateOfBirth: "1984-01-01",
        nationality: "American",
        residentialAddress: "50348 Oak Street, Pittsburgh, PA, USA",
        idDocumentType: "Diplomatic Passport",
        idDocumentNumber: "CYBDIP000001",
        idDocumentExpiry: "2030-12-31",
        isPEP: true,
        ownershipPercentage: 100,
      },
    ],
    assignedOfficerId: "reg_005", // Eve Moneypenny
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_006",
    companyName: "Summit Trust",
    legalName: "Summit Trust LLC",
    registrationNumber: "ZETA-P2P-01010",
    dateOfIncorporation: "2022-11-01",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Incorporated Company",
    primaryAddress: "1005 Main Street, Miami, FL, USA",
    website: "https://summittrust.example.com",
    primaryContact: {
      contactId: "person_016",
      fullName: "Liam Torres",
      email: "b.wayne@zetalend.demo", // Using company email for contact
      phone: "+555-555-0600",
      dateOfBirth: "1972-02-19",
      nationality: "American",
      residentialAddress: "50159 Oak Street, Las Vegas, NV, USA",
      idDocumentType: "Passport",
      idDocumentNumber: "LGMPAS000001",
      idDocumentExpiry: "2031-05-05",
      isPEP: true, // Prominent citizen, wealthy family
      position: "Chairman (Stealth)",
    },
    directors: [
      {
        contactId: "person_016", // Bruce Wayne
        fullName: "Liam Torres",
        email: "b.wayne@zetalend.demo",
        phone: "+555-555-0600",
        dateOfBirth: "1972-02-19",
        nationality: "American",
        residentialAddress: "50781 Oak Street, Charlotte, NC, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "LGMPAS000001",
        idDocumentExpiry: "2031-05-05",
        isPEP: true,
        role: "Chairman",
      },
      {
        contactId: "person_017",
        fullName: "Liam Flores",
        email: "l.fox@zetalend.demo",
        phone: "+555-555-0601",
        dateOfBirth: "1955-08-22",
        nationality: "American",
        residentialAddress: "50104 Oak Street, Columbus, OH, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "LGMNID0077889",
        idDocumentExpiry: "2027-09-09",
        isPEP: false,
        role: "CEO (Executive Director)",
      },
    ],
    ubos: [ // Bruce Wayne is likely the UBO through various holdings.
      {
        contactId: "person_016", // Bruce Wayne
        fullName: "Liam Torres",
        email: "b.wayne@zetalend.demo", // For KYC, might use a more private contact if available
        phone: "+555-555-0600",
        dateOfBirth: "1972-02-19",
        nationality: "American",
        residentialAddress: "50389 Oak Street, Miami, FL, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "LGMPAS000001",
        idDocumentExpiry: "2031-05-05",
        isPEP: true,
        ownershipPercentage: 90, // Example
      }
    ],
    assignedOfficerId: "reg_001", // Alice Wonderland
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_007",
    companyName: "Summit Partners",
    legalName: "Summit Partners LLC",
    registrationNumber: "ETAFX-LTD-00777",
    dateOfIncorporation: "2018-06-20",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "1006 Main Street, Boston, MA, USA",
    website: "https://summitpartners.example.com",
    primaryContact: {
      contactId: "person_018",
      fullName: "Liam Nelson",
      email: "c.kent@etaforex.demo",
      phone: "+666-555-0700",
      dateOfBirth: "1980-02-29", // A leap year!
      nationality: "American",
      residentialAddress: "50367 Oak Street, Boston, MA, USA",
      idDocumentType: "Citizen Card",
      idDocumentNumber: "GTRCARD001122",
      idDocumentExpiry: "2034-01-31",
      isPEP: false,
      position: "Chief Analyst",
    },
    directors: [
      {
        contactId: "person_018", // Clark Kent
        fullName: "Liam Nelson",
        email: "c.kent@etaforex.demo",
        phone: "+666-555-0700",
        dateOfBirth: "1980-02-29",
        nationality: "American",
        residentialAddress: "50618 Oak Street, Salt Lake City, UT, USA",
        idDocumentType: "Citizen Card",
        idDocumentNumber: "GTRCARD001122",
        idDocumentExpiry: "2034-01-31",
        isPEP: false,
        role: "Executive Director",
      },
      {
        contactId: "person_019",
        fullName: "Liam Rivera",
        email: "l.lane@etaforex.demo",
        phone: "+666-555-0701",
        dateOfBirth: "1982-08-17",
        nationality: "American",
        residentialAddress: "50826 Oak Street, Minneapolis, MN, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "GTRPAS002233",
        idDocumentExpiry: "2030-09-15",
        isPEP: false,
        role: "Director of Communications",
      },
    ],
    ubos: [
      {
        contactId: "person_020",
        fullName: "Liam Mitchell",
        email: "lex.luthor@lexcorp.demo",
        phone: "+666-555-0702",
        dateOfBirth: "1975-11-08",
        nationality: "American",
        residentialAddress: "50747 Oak Street, Los Angeles, CA, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "GTRPAS000001",
        idDocumentExpiry: "2029-12-31",
        isPEP: true,
        ownershipPercentage: 100,
      },
    ],
    assignedOfficerId: "reg_008", // Henry Jekyll
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_008",
    companyName: "Summit Capital Management",
    legalName: "Summit Capital Management LLC",
    registrationNumber: "THETA-ITG-00999",
    dateOfIncorporation: "2019-09-09",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Public Limited Company",
    primaryAddress: "1007 Main Street, Atlanta, GA, USA",
    website: "https://summitcapitalmanagement.example.com",
    primaryContact: {
      contactId: "person_021",
      fullName: "Liam Roberts",
      email: "t.stark@thetatech.demo",
      phone: "+777-555-0800",
      dateOfBirth: "1970-05-29",
      nationality: "American",
      residentialAddress: "50549 Oak Street, Orlando, FL, USA",
      idDocumentType: "Passport",
      idDocumentNumber: "ISPPAS000001S",
      idDocumentExpiry: "2033-04-30",
      isPEP: true,
      position: "Chief Innovation Officer",
    },
    directors: [
      {
        contactId: "person_021", // Tony Stark
        fullName: "Liam Roberts",
        email: "t.stark@thetatech.demo",
        phone: "+777-555-0800",
        dateOfBirth: "1970-05-29",
        nationality: "American",
        residentialAddress: "50387 Oak Street, Atlanta, GA, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "ISPPAS000001S",
        idDocumentExpiry: "2033-04-30",
        isPEP: true,
        role: "Executive Chairman",
      },
      {
        contactId: "person_022",
        fullName: "Liam Evans",
        email: "p.potts@thetatech.demo",
        phone: "+777-555-0801",
        dateOfBirth: "1978-10-12",
        nationality: "American",
        residentialAddress: "50565 Oak Street, Miami, FL, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "ISPNID003344P",
        idDocumentExpiry: "2031-07-20",
        isPEP: false, // Becomes PEP later if married to Tony
        role: "CEO (Executive Director)",
      },
    ],
    ubos: [
      { // Stark Industries is likely the UBO, but we model with an individual for demo KYC
        contactId: "person_021", // Tony Stark
        fullName: "Liam Roberts",
        email: "t.stark@thetatech.demo",
        phone: "+777-555-0800",
        dateOfBirth: "1970-05-29",
        nationality: "American",
        residentialAddress: "50849 Oak Street, San Diego, CA, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "ISPPAS000001S",
        idDocumentExpiry: "2033-04-30",
        isPEP: true,
        ownershipPercentage: 51, // Majority shareholder
      },
      {
        contactId: "person_023",
        fullName: "Liam Parker",
        email: "o.stane@staneindustries.demo", // Fictional
        phone: "+777-555-0802",
        dateOfBirth: "1955-01-15",
        nationality: "American",
        residentialAddress: "50633 Oak Street, Anchorage, AK, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "ISPPAS009988",
        idDocumentExpiry: "2028-11-11",
        isPEP: false,
        ownershipPercentage: 20, // Significant minority
      },
    ],
    assignedOfficerId: "reg_002", // Bob The Builder
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_009",
    companyName: "Summit Asset Management",
    legalName: "Summit Asset Management LLC",
    registrationNumber: "IOTA-GRC-01212",
    dateOfIncorporation: "2021-07-14",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Corporation",
    primaryAddress: "1008 Main Street, Seattle, WA, USA",
    website: "https://summitassetmanagement.example.com",
    primaryContact: {
      contactId: "person_024",
      fullName: "Liam Edwards",
      email: "p.parker@iotaremit.demo",
      phone: "+888-555-0900",
      dateOfBirth: "2001-08-10",
      nationality: "American",
      residentialAddress: "50591 Oak Street, Kansas City, MO, USA",
      idDocumentType: "Student ID (Demo)", // For variety, though likely not acceptable for real KYC
      idDocumentNumber: "CBUSID007766",
      idDocumentExpiry: "2026-06-30",
      isPEP: false,
      position: "Customer Service Lead",
    },
    directors: [
      {
        contactId: "person_025",
        fullName: "Liam Reyes",
        email: "may.parker@iotaremit.demo",
        phone: "+888-555-0901",
        dateOfBirth: "1958-05-03",
        nationality: "American",
        residentialAddress: "50721 Oak Street, Houston, TX, USA",
        idDocumentType: "Senior Citizen Card",
        idDocumentNumber: "CBUSENIOR0011",
        idDocumentExpiry: "2038-12-31",
        isPEP: false,
        role: "Director (Community Liaison)",
      },
      {
        contactId: "person_026",
        fullName: "Liam Morris",
        email: "n.osborn@oscorp.demo",
        phone: "+888-555-0902",
        dateOfBirth: "1964-07-01",
        nationality: "American",
        residentialAddress: "5046 Oak Street, Dallas, TX, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "CBUPAS000123N",
        idDocumentExpiry: "2030-03-03",
        isPEP: true,
        role: "Chairman",
      },
    ],
    ubos: [
      {
        contactId: "person_026", // Norman Osborn
        fullName: "Liam Morris",
        email: "n.osborn@oscorp.demo",
        phone: "+888-555-0902",
        dateOfBirth: "1964-07-01",
        nationality: "American",
        residentialAddress: "50233 Oak Street, Charleston, SC, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "CBUPAS000123N",
        idDocumentExpiry: "2030-03-03",
        isPEP: true,
        ownershipPercentage: 85,
      },
    ],
    assignedOfficerId: "reg_003", // Carol Danvers
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_010",
    companyName: "Summit Finance Group",
    legalName: "Summit Finance Group LLC",
    registrationNumber: "KAPPA-DWM-00456",
    dateOfIncorporation: "2020-04-16",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Société à Responsabilité Limitée (SARL)",
    primaryAddress: "1009 Main Street, Denver, CO, USA",
    website: "https://summitfinancegroup.example.com",
    primaryContact: {
      contactId: "person_027",
      fullName: "Liam Cook",
      email: "c.xavier@kappawealth.demo",
      phone: "+999-555-1000",
      dateOfBirth: "1950-10-20",
      nationality: "American",
      residentialAddress: "50296 Oak Street, Birmingham, AL, USA",
      idDocumentType: "National ID",
      idDocumentNumber: "GDINID000001X",
      idDocumentExpiry: "2035-12-31",
      isPEP: false, // Though very influential
      position: "Founder & Chief Strategist",
    },
    directors: [
      {
        contactId: "person_027", // Charles Xavier
        fullName: "Liam Cook",
        email: "c.xavier@kappawealth.demo",
        phone: "+999-555-1000",
        dateOfBirth: "1950-10-20",
        nationality: "American",
        residentialAddress: "50875 Oak Street, Miami, FL, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "GDINID000001X",
        idDocumentExpiry: "2035-12-31",
        isPEP: false,
        role: "Chairman",
      },
      {
        contactId: "person_028",
        fullName: "Liam Ortiz",
        email: "j.grey@kappawealth.demo",
        phone: "+999-555-1001",
        dateOfBirth: "1983-06-06",
        nationality: "American",
        residentialAddress: "50887 Oak Street, Detroit, MI, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "GDIPAS007788J",
        idDocumentExpiry: "2032-05-25",
        isPEP: false,
        role: "CEO (Executive Director)",
      },
    ],
    ubos: [
      { // For demo, assume Xavier Foundation is the UBO, represented by Charles.
        contactId: "person_027", // Charles Xavier
        fullName: "Liam Cook",
        email: "c.xavier@kappawealth.demo",
        phone: "+999-555-1000",
        dateOfBirth: "1950-10-20",
        nationality: "American",
        residentialAddress: "50389 Oak Street, Boston, MA, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "GDINID000001X",
        idDocumentExpiry: "2035-12-31",
        isPEP: false,
        ownershipPercentage: 100, // Foundation holds all shares
      },
    ],
    assignedOfficerId: "reg_007", // Grace Hopper
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_011",
    companyName: "Horizon Capital",
    legalName: "Horizon Capital LLC",
    registrationNumber: "LAMBDA-ECP-00654",
    dateOfIncorporation: "2023-08-01",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Société Anonyme (S.A.)",
    primaryAddress: "10010 Main Street, Phoenix, AZ, USA",
    website: "https://horizoncapital.example.com",
    primaryContact: {
      contactId: "person_029",
      fullName: "Liam Peterson",
      email: "r.richards@lambdacrowd.demo",
      phone: "+000-555-1100", // Fictional country code
      dateOfBirth: "1970-03-01",
      nationality: "American",
      residentialAddress: "50464 Oak Street, Las Vegas, NV, USA",
      idDocumentType: "Passport",
      idDocumentNumber: "POIPAS000004R",
      idDocumentExpiry: "2031-11-11",
      isPEP: false, // Scientist, but maybe not PEP unless political involvement
      position: "Chief Technical Officer",
    },
    directors: [
      {
        contactId: "person_029", // Reed Richards
        fullName: "Liam Peterson",
        email: "r.richards@lambdacrowd.demo",
        phone: "+000-555-1100",
        dateOfBirth: "1970-03-01",
        nationality: "American",
        residentialAddress: "50854 Oak Street, Anchorage, AK, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "POIPAS000004R",
        idDocumentExpiry: "2031-11-11",
        isPEP: false,
        role: "Executive Director (CTO)",
      },
      {
        contactId: "person_030",
        fullName: "Liam Kelly",
        email: "s.storm@lambdacrowd.demo",
        phone: "+000-555-1101",
        dateOfBirth: "1975-09-05",
        nationality: "American",
        residentialAddress: "50166 Oak Street, Kansas City, MO, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "POINID000005S",
        idDocumentExpiry: "2034-07-07",
        isPEP: false,
        role: "CEO (Executive Director)",
      },
      {
        contactId: "person_031",
        fullName: "Liam Ramos",
        email: "b.grimm@lambdacrowd.demo",
        phone: "+000-555-1102",
        dateOfBirth: "1973-12-12",
        nationality: "American",
        residentialAddress: "50363 Oak Street, Kansas City, MO, USA",
        idDocumentType: "Pilot License (Demo ID Type)",
        idDocumentNumber: "POIPLT000006B",
        idDocumentExpiry: "2029-08-08",
        isPEP: false,
        role: "Director of Investor Relations",
      },
    ],
    ubos: [ // Assume the 4 founders are equal UBOs
      {
        contactId: "person_029", // Reed Richards
        fullName: "Liam Peterson",
        email: "r.richards@lambdacrowd.demo",
        phone: "+000-555-1100",
        dateOfBirth: "1970-03-01",
        nationality: "American",
        residentialAddress: "50686 Oak Street, Charlotte, NC, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "POIPAS000004R",
        idDocumentExpiry: "2031-11-11",
        isPEP: false,
        ownershipPercentage: 25,
      },
      {
        contactId: "person_030", // Susan Storm
        fullName: "Liam Kelly",
        email: "s.storm@lambdacrowd.demo",
        phone: "+000-555-1101",
        dateOfBirth: "1975-09-05",
        nationality: "American",
        residentialAddress: "50718 Oak Street, Las Vegas, NV, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "POINID000005S",
        idDocumentExpiry: "2034-07-07",
        isPEP: false,
        ownershipPercentage: 25,
      },
      {
        contactId: "person_031", // Ben Grimm
        fullName: "Liam Ramos",
        email: "b.grimm@lambdacrowd.demo",
        phone: "+000-555-1102",
        dateOfBirth: "1973-12-12",
        nationality: "American",
        residentialAddress: "50663 Oak Street, Providence, RI, USA",
        idDocumentType: "Pilot License (Demo ID Type)",
        idDocumentNumber: "POIPLT000006B",
        idDocumentExpiry: "2029-08-08",
        isPEP: false,
        ownershipPercentage: 25,
      },
      {
        contactId: "person_032",
        fullName: "Liam Watson",
        email: "j.storm@lambdacrowd.demo",
        phone: "+000-555-1103",
        dateOfBirth: "1985-01-01",
        nationality: "American",
        residentialAddress: "50623 Oak Street, Dallas, TX, USA",
        idDocumentType: "Racing License (Demo ID Type)",
        idDocumentNumber: "POIRACE00007J",
        idDocumentExpiry: "2027-03-03",
        isPEP: false,
        ownershipPercentage: 25,
      },
    ],
    assignedOfficerId: "reg_004", // David Copperfield
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_012",
    companyName: "Horizon Financial",
    legalName: "Horizon Financial LLC",
    registrationNumber: "MU-MICRO-00112",
    dateOfIncorporation: "2022-01-15",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Non-Profit Organization",
    primaryAddress: "10011 Main Street, Portland, OR, USA",
    website: "https://horizonfinancial.example.com",
    primaryContact: {
      contactId: "person_033",
      fullName: "Liam Chavez",
      email: "s.strange@mumicro.demo",
      phone: "+121-555-1200",
      dateOfBirth: "1968-11-18",
      nationality: "American",
      residentialAddress: "50175 Oak Street, Anchorage, AK, USA",
      idDocumentType: "Practitioner License (Demo)",
      idDocumentNumber: "EQPRAC00001S",
      idDocumentExpiry: "2030-10-31",
      isPEP: false,
      position: "Chief Executive Officer",
    },
    directors: [
      {
        contactId: "person_033", // Stephen Strange
        fullName: "Liam Chavez",
        email: "s.strange@mumicro.demo",
        phone: "+121-555-1200",
        dateOfBirth: "1968-11-18",
        nationality: "American",
        residentialAddress: "50746 Oak Street, Albany, NY, USA",
        idDocumentType: "Practitioner License (Demo)",
        idDocumentNumber: "EQPRAC00001S",
        idDocumentExpiry: "2030-10-31",
        isPEP: false,
        role: "Executive Director (CEO)",
      },
      {
        contactId: "person_034",
        fullName: "Liam Bennett",
        email: "c.palmer@mumicro.demo",
        phone: "+121-555-1201",
        dateOfBirth: "1975-04-04",
        nationality: "American",
        residentialAddress: "50167 Oak Street, Philadelphia, PA, USA",
        idDocumentType: "Medical License (Demo)",
        idDocumentNumber: "EQMED00002C",
        idDocumentExpiry: "2032-09-09",
        isPEP: false,
        role: "Director of Outreach",
      },
    ],
    ubos: [ // For non-profits, UBOs might not apply in the same way; often it's board-controlled.
            // For demo, we'll list key founders/controllers if applicable, or state N/A.
            // Here, let's assume the founding directors effectively control it for demo KYC.
      {
        contactId: "person_033",
        fullName: "Liam Chavez",
        email: "s.strange@mumicro.demo",
        phone: "+121-555-1200",
        dateOfBirth: "1968-11-18",
        nationality: "American",
        residentialAddress: "50388 Oak Street, Orlando, FL, USA",
        idDocumentType: "Practitioner License (Demo)",
        idDocumentNumber: "EQPRAC00001S",
        idDocumentExpiry: "2030-10-31",
        isPEP: false,
        ownershipPercentage: 0, // NPOs don't have owners in the traditional sense
      }
    ],
    assignedOfficerId: "reg_005", // Eve Moneypenny
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Licensed"
  },
  {
    entityId: "ent_013",
    companyName: "Horizon Investments",
    legalName: "Horizon Investments LLC",
    registrationNumber: "NUGEN-DB-00223",
    dateOfIncorporation: "2023-03-30",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Corporation",
    primaryAddress: "10012 Main Street, Houston, TX, USA",
    website: "https://horizoninvestments.example.com",
    primaryContact: {
      contactId: "person_035",
      fullName: "Liam Ruiz",
      email: "w.maximoff@nudigital.demo",
      phone: "+232-555-1300",
      dateOfBirth: "1989-02-10",
      nationality: "American",
      residentialAddress: "50655 Oak Street, Las Vegas, NV, USA",
      idDocumentType: "Resident Permit",
      idDocumentNumber: "SIRPERM0003W",
      idDocumentExpiry: "2028-07-14",
      isPEP: false,
      position: "Chief Experience Officer",
    },
    directors: [
      {
        contactId: "person_035", // Wanda Maximoff
        fullName: "Liam Ruiz",
        email: "w.maximoff@nudigital.demo",
        phone: "+232-555-1300",
        dateOfBirth: "1989-02-10",
        nationality: "American",
        residentialAddress: "50570 Oak Street, Manchester, NH, USA",
        idDocumentType: "Resident Permit",
        idDocumentNumber: "SIRPERM0003W",
        idDocumentExpiry: "2028-07-14",
        isPEP: false,
        role: "Executive Director (CXO)",
      },
      {
        contactId: "person_036",
        fullName: "Liam Alvarez", // Fictional character
        email: "vision@nudigital.demo",
        phone: "+232-555-1301",
        dateOfBirth: "2022-05-05", // Date of 'activation'
        nationality: "American",
        residentialAddress: "50701 Oak Street, Detroit, MI, USA",
        idDocumentType: "Synthetic Being ID (Demo)",
        idDocumentNumber: "SIRSYNTH0001V",
        idDocumentExpiry: "N/A",
        isPEP: false,
        role: "Chief Technology Officer",
      },
    ],
    ubos: [
      { // UBO could be a parent tech company or a venture capital firm.
        contactId: "person_037",
        fullName: "Liam Sanders",
        email: "a.harkness@darkhold.demo",
        phone: "+232-555-1302",
        dateOfBirth: "1940-01-01", // Appears younger
        nationality: "American",
        residentialAddress: "50863 Oak Street, Austin, TX, USA",
        idDocumentType: "Ancient Grimoire (Demo ID)",
        idDocumentNumber: "GRIMOIRE001A",
        idDocumentExpiry: "Eternity",
        isPEP: true, // Due to influence and power
        ownershipPercentage: 66.6,
      }
    ],
    assignedOfficerId: "reg_006", // Frank Castle (Needs a tough one!)
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Applicant"
  },
  {
    entityId: "ent_014",
    companyName: "Horizon Holdings",
    legalName: "Horizon Holdings LLC",
    registrationNumber: "XIGM-PLC-00334",
    dateOfIncorporation: "2017-10-10",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Public Limited Company",
    primaryAddress: "10013 Main Street, Charlotte, NC, USA",
    website: "https://horizonholdings.example.com",
    primaryContact: {
      contactId: "person_038",
      fullName: "Liam Myers",
      email: "s.chi@xicapital.demo",
      phone: "+343-555-1400",
      dateOfBirth: "1985-09-02",
      nationality: "American",
      residentialAddress: "50794 Oak Street, Birmingham, AL, USA",
      idDocumentType: "OFH National ID",
      idDocumentNumber: "OFHNID00888S",
      idDocumentExpiry: "2033-08-20",
      isPEP: false,
      position: "Head of Trading",
    },
    directors: [
      {
        contactId: "person_038", // Shang-Chi
        fullName: "Liam Myers",
        email: "s.chi@xicapital.demo",
        phone: "+343-555-1400",
        dateOfBirth: "1985-09-02",
        nationality: "American",
        residentialAddress: "50234 Oak Street, San Francisco, CA, USA",
        idDocumentType: "OFH National ID",
        idDocumentNumber: "OFHNID00888S",
        idDocumentExpiry: "2033-08-20",
        isPEP: false,
        role: "Executive Director",
      },
      {
        contactId: "person_039",
        fullName: "Liam Foster", // The Mandarin
        email: "wenwu@tenrings.org.demo", // Using an org email
        phone: "+343-555-1401",
        dateOfBirth: "1000-01-01", // Ancient
        nationality: "American",
        residentialAddress: "50824 Oak Street, Los Angeles, CA, USA",
        idDocumentType: "Ancient Artifact (Demo ID)",
        idDocumentNumber: "TENRINGS001W",
        idDocumentExpiry: "N/A",
        isPEP: true, // Leader of a powerful organization
        role: "Chairman (Shadow)",
      },
    ],
    ubos: [
      {
        contactId: "person_039", // Wenwu
        fullName: "Liam Foster",
        email: "wenwu@tenrings.org.demo",
        phone: "+343-555-1401",
        dateOfBirth: "1000-01-01",
        nationality: "American",
        residentialAddress: "50410 Oak Street, Austin, TX, USA",
        idDocumentType: "Ancient Artifact (Demo ID)",
        idDocumentNumber: "TENRINGS001W",
        idDocumentExpiry: "N/A",
        isPEP: true,
        ownershipPercentage: 100,
      },
    ],
    assignedOfficerId: "reg_001", // Alice Wonderland
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Applicant"
  },
  {
    entityId: "ent_015",
    companyName: "Horizon Advisors",
    legalName: "Horizon Advisors LLC",
    registrationNumber: "OMICRON-API-00445",
    dateOfIncorporation: "2022-08-22",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "10014 Main Street, Detroit, MI, USA",
    website: "https://horizonadvisors.example.com",
    primaryContact: {
      contactId: "person_040",
      fullName: "Liam Jenkins",
      email: "s.lang@omicronapi.demo",
      phone: "+454-555-1500",
      dateOfBirth: "1978-06-06",
      nationality: "American",
      residentialAddress: "5067 Oak Street, Las Vegas, NV, USA",
      idDocumentType: "Engineering License (Demo)",
      idDocumentNumber: "IOPENG00123S",
      idDocumentExpiry: "2029-05-15",
      isPEP: false,
      position: "Lead Integration Specialist",
    },
    directors: [
      {
        contactId: "person_041",
        fullName: "Liam Russell",
        email: "h.pym@omicronapi.demo",
        phone: "+454-555-1501",
        dateOfBirth: "1952-03-12",
        nationality: "American",
        residentialAddress: "50580 Oak Street, Charlotte, NC, USA",
        idDocumentType: "Senior Scientist ID (Demo)",
        idDocumentNumber: "IOPSCI00001H",
        idDocumentExpiry: "2031-01-01",
        isPEP: false, // Renowned scientist
        role: "Chief Scientist (Non-Executive)",
      },
      {
        contactId: "person_042",
        fullName: "Liam Bell",
        email: "h.vandyne@omicronapi.demo",
        phone: "+454-555-1502",
        dateOfBirth: "1980-09-09",
        nationality: "American",
        residentialAddress: "50322 Oak Street, Fargo, ND, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "IOPPAS00789H",
        idDocumentExpiry: "2033-07-30",
        isPEP: false,
        role: "CEO (Executive Director)",
      },
    ],
    ubos: [ // Pym Technologies could be the UBO.
      {
        contactId: "person_041", // Hank Pym as representative of Pym Tech
        fullName: "Liam Russell",
        email: "h.pym@omicronapi.demo",
        phone: "+454-555-1501",
        dateOfBirth: "1952-03-12",
        nationality: "American",
        residentialAddress: "50671 Oak Street, Charlotte, NC, USA",
        idDocumentType: "Senior Scientist ID (Demo)",
        idDocumentNumber: "IOPSCI00001H",
        idDocumentExpiry: "2031-01-01",
        isPEP: false,
        ownershipPercentage: 70,
      },
      {
        contactId: "person_042", // Hope van Dyne
        fullName: "Liam Bell",
        email: "h.vandyne@omicronapi.demo",
        phone: "+454-555-1502",
        dateOfBirth: "1980-09-09",
        nationality: "American",
        residentialAddress: "50405 Oak Street, St. Louis, MO, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "IOPPAS00789H",
        idDocumentExpiry: "2033-07-30",
        isPEP: false,
        ownershipPercentage: 30,
      },
    ],
    assignedOfficerId: "reg_008", // Henry Jekyll
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Applicant"
  },
  {
    entityId: "ent_016",
    companyName: "Horizon Trust",
    legalName: "Horizon Trust LLC",
    registrationNumber: "PI-VC-LTD-00556",
    dateOfIncorporation: "2023-10-01",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "10015 Main Street, Philadelphia, PA, USA",
    website: "https://horizontrust.example.com",
    primaryContact: {
      contactId: "person_043",
      fullName: "Noah Smith",
      email: "n.romanoff@pidigital.demo",
      phone: "+565-555-1600",
      dateOfBirth: "1984-11-22",
      nationality: "American",
      residentialAddress: "50469 Oak Street, Honolulu, HI, USA",
      idDocumentType: "Covert Operative ID (Demo)",
      idDocumentNumber: "AUTCOV00001N",
      idDocumentExpiry: "N/A (Continuous)",
      isPEP: false, // By nature of work, avoids public exposure
      position: "Chief of Operations",
    },
    directors: [
      {
        contactId: "person_043", // Natasha Romanoff
        fullName: "Noah Smith",
        email: "n.romanoff@pidigital.demo",
        phone: "+565-555-1600",
        dateOfBirth: "1984-11-22",
        nationality: "American",
        residentialAddress: "50271 Oak Street, Denver, CO, USA",
        idDocumentType: "Covert Operative ID (Demo)",
        idDocumentNumber: "AUTCOV00001N",
        idDocumentExpiry: "N/A (Continuous)",
        isPEP: false,
        role: "Executive Director (COO)",
      },
      {
        contactId: "person_044",
        fullName: "Noah Brown",
        email: "n.fury@shield.demo", // Using a different org email
        phone: "+565-555-1601",
        dateOfBirth: "1951-12-21",
        nationality: "American",
        residentialAddress: "50252 Oak Street, Seattle, WA, USA",
        idDocumentType: "Level 10 SHIELD ID (Demo)",
        idDocumentNumber: "SHIELDL10NF001",
        idDocumentExpiry: "N/A",
        isPEP: true, // Director of a major intelligence agency
        role: "Strategic Advisor (Non-Executive Director)",
      },
    ],
    ubos: [ // UBO is likely a very discreet entity or individual.
      {
        contactId: "person_044", // Nick Fury, representing SHIELD's interests
        fullName: "Noah Brown",
        email: "n.fury@shield.demo",
        phone: "+565-555-1601",
        dateOfBirth: "1951-12-21",
        nationality: "American",
        residentialAddress: "50574 Oak Street, Tulsa, OK, USA",
        idDocumentType: "Level 10 SHIELD ID (Demo)",
        idDocumentNumber: "SHIELDL10NF001",
        idDocumentExpiry: "N/A",
        isPEP: true,
        ownershipPercentage: 100, // SHIELD effectively controls it for demo purposes
      },
    ],
    assignedOfficerId: "reg_006", // Frank Castle
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Applicant"
  },
  {
    entityId: "ent_017",
    companyName: "Horizon Partners",
    legalName: "Horizon Partners LLC",
    registrationNumber: "RHO-REG-SA-00789",
    dateOfIncorporation: "2021-03-15",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Société Anonyme (S.A.)",
    primaryAddress: "10016 Main Street, Minneapolis, MN, USA",
    website: "https://horizonpartners.example.com",
    primaryContact: {
      contactId: "person_045",
      fullName: "Noah Miller",
      email: "m.murdock@rhoregtech.demo",
      phone: "+676-555-1700",
      dateOfBirth: "1980-12-08",
      nationality: "American",
      residentialAddress: "50269 Oak Street, Albany, NY, USA",
      idDocumentType: "Bar Association ID (Demo)",
      idDocumentNumber: "GCZBAR001MM",
      idDocumentExpiry: "2035-12-31",
      isPEP: false,
      position: "Chief Legal Officer",
    },
    directors: [
      {
        contactId: "person_045", // Matt Murdock
        fullName: "Noah Miller",
        email: "m.murdock@rhoregtech.demo",
        phone: "+676-555-1700",
        dateOfBirth: "1980-12-08",
        nationality: "American",
        residentialAddress: "50598 Oak Street, Tulsa, OK, USA",
        idDocumentType: "Bar Association ID (Demo)",
        idDocumentNumber: "GCZBAR001MM",
        idDocumentExpiry: "2035-12-31",
        isPEP: false,
        role: "Executive Director (CLO)",
      },
      {
        contactId: "person_046",
        fullName: "Noah Martinez",
        email: "f.nelson@rhoregtech.demo",
        phone: "+676-555-1701",
        dateOfBirth: "1980-10-05",
        nationality: "American",
        residentialAddress: "50597 Oak Street, Pittsburgh, PA, USA",
        idDocumentType: "National ID",
        idDocumentNumber: "GCZNID005566F",
        idDocumentExpiry: "2032-06-15",
        isPEP: false,
        role: "Director of Client Relations",
      },
    ],
    ubos: [
      { // For a RegTech, UBOs might be a mix of founders and investment firms.
        contactId: "person_047",
        fullName: "Noah Lopez",
        email: "w.fisk@kingpinholdings.demo",
        phone: "+676-555-1702",
        dateOfBirth: "1965-01-20",
        nationality: "American",
        residentialAddress: "50370 Oak Street, Indianapolis, IN, USA",
        idDocumentType: "Passport",
        idDocumentNumber: "GCZPAS00001W",
        idDocumentExpiry: "2029-03-10",
        isPEP: true, // Major business figure, political influence
        ownershipPercentage: 55,
      }
    ],
    assignedOfficerId: "reg_004", // David Copperfield
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Former Applicant"
  },
  {
    entityId: "ent_018",
    companyName: "Horizon Capital Management",
    legalName: "Horizon Capital Management LLC",
    registrationNumber: "SIGMA-AI-LTD-00890",
    dateOfIncorporation: "2023-05-20",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "10017 Main Street, Las Vegas, NV, USA",
    website: "https://horizoncapitalmanagement.example.com",
    primaryContact: {
      contactId: "person_048",
      fullName: "Noah Wilson",
      email: "logan@sigmaai.demo",
      phone: "+787-555-1800",
      dateOfBirth: "1882-01-01", // Appears younger
      nationality: "American",
      residentialAddress: "50141 Oak Street, Detroit, MI, USA",
      idDocumentType: "Military ID (Old - Demo)",
      idDocumentNumber: "CANMIL00001X",
      idDocumentExpiry: "N/A",
      isPEP: false,
      position: "Chief Data Scientist",
    },
    directors: [
      {
        contactId: "person_048", // Logan
        fullName: "Noah Wilson",
        email: "logan@sigmaai.demo",
        phone: "+787-555-1800",
        dateOfBirth: "1882-01-01",
        nationality: "American",
        residentialAddress: "50505 Oak Street, Raleigh, NC, USA",
        idDocumentType: "Military ID (Old - Demo)",
        idDocumentNumber: "CANMIL00001X",
        idDocumentExpiry: "N/A",
        isPEP: false,
        role: "Executive Director (CDS)",
      },
      {
        contactId: "person_049",
        fullName: "Noah Taylor",
        email: "o.munroe@sigmaai.demo",
        phone: "+787-555-1801",
        dateOfBirth: "1975-07-07",
        nationality: "American",
        residentialAddress: "50773 Oak Street, Miami, FL, USA",
        idDocumentType: "UN Passport (Demo)",
        idDocumentNumber: "UNPAS00123O",
        idDocumentExpiry: "2033-06-06",
        isPEP: false, // Could be if she holds a significant global position
        role: "Director of Ethical AI",
      },
    ],
    ubos: [
      { // UBO could be a research foundation or a tech conglomerate
        contactId: "person_050",
        fullName: "Noah Jackson",
        email: "n.essex@essexcorp.demo",
        phone: "+787-555-1802",
        dateOfBirth: "1859-05-01", // Victorian era
        nationality: "American",
        residentialAddress: "50881 Oak Street, San Francisco, CA, USA",
        idDocumentType: "Victorian Era Birth Certificate (Demo)",
        idDocumentNumber: "UKBIRTH1859NSX",
        idDocumentExpiry: "N/A",
        isPEP: true, // Due to long-standing influence and unethical practices
        ownershipPercentage: 100,
      }
    ],
    assignedOfficerId: "reg_007", // Grace Hopper
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Former Applicant"
  },
  {
    entityId: "ent_019",
    companyName: "Horizon Asset Management",
    legalName: "Horizon Asset Management LLC",
    registrationNumber: "TAU-DFP-INC-00901",
    dateOfIncorporation: "2022-12-01",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Incorporated Company",
    primaryAddress: "10018 Main Street, San Diego, CA, USA",
    website: "https://horizonassetmanagement.example.com",
    primaryContact: {
      contactId: "person_051",
      fullName: "Noah Lee",
      email: "tchalla@taudefi.demo",
      phone: "+898-555-1900",
      dateOfBirth: "1980-05-20",
      nationality: "American",
      residentialAddress: "50156 Oak Street, Atlanta, GA, USA",
      idDocumentType: "Diplomatic Passport",
      idDocumentNumber: "WAKDP00001T",
      idDocumentExpiry: "2035-01-01",
      isPEP: true, // King of a nation
      position: "Chief Strategist",
    },
    directors: [
      {
        contactId: "person_051", // T'Challa
        fullName: "Noah Lee",
        email: "tchalla@taudefi.demo",
        phone: "+898-555-1900",
        dateOfBirth: "1980-05-20",
        nationality: "American",
        residentialAddress: "50163 Oak Street, Anchorage, AK, USA",
        idDocumentType: "Diplomatic Passport",
        idDocumentNumber: "WAKDP00001T",
        idDocumentExpiry: "2035-01-01",
        isPEP: true,
        role: "Executive Chairman",
      },
      {
        contactId: "person_052",
        fullName: "Noah White",
        email: "shuri@taudefi.demo",
        phone: "+898-555-1901",
        dateOfBirth: "1995-11-11",
        nationality: "American",
        residentialAddress: "50432 Oak Street, Providence, RI, USA",
        idDocumentType: "Royal Family ID (Demo)",
        idDocumentNumber: "WAKRF00002S",
        idDocumentExpiry: "N/A",
        isPEP: true, // Princess, lead scientist
        role: "Chief Technology Officer",
      },
    ],
    ubos: [ // Wakandan Sovereign Fund could be the UBO
      {
        contactId: "person_051", // T'Challa representing Wakandan interests
        fullName: "Noah Lee",
        email: "tchalla@taudefi.demo",
        phone: "+898-555-1900",
        dateOfBirth: "1980-05-20",
        nationality: "American",
        residentialAddress: "5065 Oak Street, Sacramento, CA, USA",
        idDocumentType: "Diplomatic Passport",
        idDocumentNumber: "WAKDP00001T",
        idDocumentExpiry: "2035-01-01",
        isPEP: true,
        ownershipPercentage: 100,
      }
    ],
    assignedOfficerId: "reg_005", // Eve Moneypenny
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Former Applicant"
  },
  {
    entityId: "ent_020",
    companyName: "Horizon Finance Group",
    legalName: "Horizon Finance Group LLC",
    registrationNumber: "UPSILON-GXG-01110",
    dateOfIncorporation: "2016-06-06",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Global Business Company Category 1",
    primaryAddress: "10019 Main Street, Baltimore, MD, USA",
    website: "https://horizonfinancegroup.example.com",
    primaryContact: {
      contactId: "person_053",
      fullName: "Noah Clark",
      email: "v.doom@upsilongx.demo",
      phone: "+909-555-2000",
      dateOfBirth: "1960-08-08",
      nationality: "American",
      residentialAddress: "50390 Oak Street, Tampa, FL, USA",
      idDocumentType: "Sovereign Ruler ID (Demo)",
      idDocumentNumber: "LATSOV00001V",
      idDocumentExpiry: "N/A (Lifetime Appointment)",
      isPEP: true, // Absolute monarch
      position: "Supreme Chairman",
    },
    directors: [
      {
        contactId: "person_053", // Victor Von Doom
        fullName: "Noah Clark",
        email: "v.doom@upsilongx.demo",
        phone: "+909-555-2000",
        dateOfBirth: "1960-08-08",
        nationality: "American",
        residentialAddress: "50479 Oak Street, Sacramento, CA, USA",
        idDocumentType: "Sovereign Ruler ID (Demo)",
        idDocumentNumber: "LATSOV00001V",
        idDocumentExpiry: "N/A (Lifetime Appointment)",
        isPEP: true,
        role: "Supreme Chairman (Executive)",
      },
      {
        contactId: "person_054",
        fullName: "Noah Robinson",
        email: "k.vernard@upsilongx.demo",
        phone: "+909-555-2001",
        dateOfBirth: "1990-03-03",
        nationality: "American",
        residentialAddress: "50257 Oak Street, Richmond, VA, USA",
        idDocumentType: "Latverian Heir Apparent ID (Demo)",
        idDocumentNumber: "LATHEIR0001K",
        idDocumentExpiry: "N/A",
        isPEP: true, // Designated heir
        role: "Deputy Chairman",
      },
    ],
    ubos: [
      { // State of Latveria is the UBO, represented by Doom
        contactId: "person_053", // Victor Von Doom
        fullName: "Noah Clark",
        email: "v.doom@upsilongx.demo",
        phone: "+909-555-2000",
        dateOfBirth: "1960-08-08",
        nationality: "American",
        residentialAddress: "50881 Oak Street, Boulder, CO, USA",
        idDocumentType: "Sovereign Ruler ID (Demo)",
        idDocumentNumber: "LATSOV00001V",
        idDocumentExpiry: "N/A (Lifetime Appointment)",
        isPEP: true,
        ownershipPercentage: 100,
      }
    ],
    assignedOfficerId: "reg_001", // Alice Wonderland
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Former Applicant"
  },
  {
    entityId: "ent_021",
    companyName: "Pioneer Capital",
    legalName: "Pioneer Capital LLC",
    registrationNumber: "PHI-SAP-LLP-01221",
    dateOfIncorporation: "2020-09-15",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Limited Liability Partnership",
    primaryAddress: "10020 Main Street, Austin, TX, USA",
    website: "https://pioneercapital.example.com",
    primaryContact: {
      contactId: "person_055",
      fullName: "Noah Allen",
      email: "a.veidt@phiconsulting.demo",
      phone: "+010-555-2100",
      dateOfBirth: "1959-07-07",
      nationality: "American",
      residentialAddress: "50696 Oak Street, New York, NY, USA",
      idDocumentType: "Global Innovator Visa (Demo)",
      idDocumentNumber: "KEFGIV00001A",
      idDocumentExpiry: "2040-12-31",
      isPEP: false, // Extremely influential but perhaps not formally a PEP
      position: "Managing Partner",
    },
    directors: [ // LLPs might have designated members rather than directors in some JX.
      {
        contactId: "person_055", // Adrian Veidt
        fullName: "Noah Allen",
        email: "a.veidt@phiconsulting.demo",
        phone: "+010-555-2100",
        dateOfBirth: "1959-07-07",
        nationality: "American",
        residentialAddress: "50117 Oak Street, Omaha, NE, USA",
        idDocumentType: "Global Innovator Visa (Demo)",
        idDocumentNumber: "KEFGIV00001A",
        idDocumentExpiry: "2040-12-31",
        isPEP: false,
        role: "Managing Partner (Designated Member)",
      },
      {
        contactId: "person_056",
        fullName: "Noah Scott",
        email: "dr.m@phiconsulting.demo", // Unlikely to use email
        phone: "N/A",
        dateOfBirth: "1929-08-14", // Pre-transformation
        nationality: "American",
        residentialAddress: "50549 Oak Street, Providence, RI, USA",
        idDocumentType: "Quantum Being ID (Demo)",
        idDocumentNumber: "KEFQUANTUM001J",
        idDocumentExpiry: "Beyond Time",
        isPEP: false, // More of a force of nature than a PEP
        role: "Senior Strategic Advisor (Designated Member)",
      },
    ],
    ubos: [ // Partners in an LLP are effectively the UBOs.
      {
        contactId: "person_055", // Adrian Veidt
        fullName: "Noah Allen",
        email: "a.veidt@phiconsulting.demo",
        phone: "+010-555-2100",
        dateOfBirth: "1959-07-07",
        nationality: "American",
        residentialAddress: "50273 Oak Street, Santa Fe, NM, USA",
        idDocumentType: "Global Innovator Visa (Demo)",
        idDocumentNumber: "KEFGIV00001A",
        idDocumentExpiry: "2040-12-31",
        isPEP: false,
        ownershipPercentage: 50, // Example for partnership
      },
      {
        contactId: "person_056", // Dr. Manhattan
        fullName: "Noah Scott",
        email: "dr.m@phiconsulting.demo",
        phone: "N/A",
        dateOfBirth: "1929-08-14",
        nationality: "American",
        residentialAddress: "50656 Oak Street, Birmingham, AL, USA",
        idDocumentType: "Quantum Being ID (Demo)",
        idDocumentNumber: "KEFQUANTUM001J",
        idDocumentExpiry: "Beyond Time",
        isPEP: false,
        ownershipPercentage: 50, // Example for partnership
      },
    ],
    assignedOfficerId: "reg_008", // Henry Jekyll
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Former Applicant"
  },
  {
    entityId: "ent_022",
    companyName: "Pioneer Financial",
    legalName: "Pioneer Financial LLC",
    registrationNumber: "CHI-STS-LTD-01332",
    dateOfIncorporation: "2019-11-05",
    jurisdictionOfIncorporation: "Delaware, United States", // Re-using for variety
    companyType: "Private Limited Company",
    primaryAddress: "10021 Main Street, Columbus, OH, USA",
    website: "https://pioneerfinancial.example.com",
    primaryContact: {
      contactId: "person_057",
      fullName: "Noah Flores",
      email: "e.natchios@chipay.demo",
      phone: "+444-555-2200",
      dateOfBirth: "1981-03-25",
      nationality: "American",
      residentialAddress: "50114 Oak Street, Columbus, OH, USA",
      idDocumentType: "Assassin Guild ID (Demo)",
      idDocumentNumber: "HAND001EN",
      idDocumentExpiry: "N/A",
      isPEP: false, // Operates in shadows
      position: "Head of Security",
    },
    directors: [
      {
        contactId: "person_057", // Elektra Natchios
        fullName: "Noah Flores",
        email: "e.natchios@chipay.demo",
        phone: "+444-555-2200",
        dateOfBirth: "1981-03-25",
        nationality: "American",
        residentialAddress: "50445 Oak Street, San Diego, CA, USA",
        idDocumentType: "Assassin Guild ID (Demo)",
        idDocumentNumber: "HAND001EN",
        idDocumentExpiry: "N/A",
        isPEP: false,
        role: "Executive Director (Security)",
      },
      {
        contactId: "person_058",
        fullName: "Noah Nelson",
        email: "stick.chaste@hidden.demo",
        phone: "+444-555-2201",
        dateOfBirth: "1930-01-01", // Appears very old
        nationality: "American",
        residentialAddress: "50464 Oak Street, Phoenix, AZ, USA",
        idDocumentType: "Ancient Scroll of Lineage (Demo)",
        idDocumentNumber: "CHASTE001S",
        idDocumentExpiry: "N/A",
        isPEP: false, // Leader of a secret order
        role: "Non-Executive Director (Strategic Advisor)",
      },
    ],
    ubos: [ // The Hand organization is likely the UBO
      {
        contactId: "person_059",
        fullName: "Noah Hall",
        email: "k.yoshioka@thehand.demo",
        phone: "+444-555-2202",
        dateOfBirth: "1950-06-10",
        nationality: "American",
        residentialAddress: "50739 Oak Street, New York, NY, USA",
        idDocumentType: "Clan Leader Seal (Demo)",
        idDocumentNumber: "HANDCLAN001K",
        idDocumentExpiry: "N/A",
        isPEP: true, // Leader of a global criminal/mystical organization
        ownershipPercentage: 100,
      }
    ],
    assignedOfficerId: "reg_006", // Frank Castle
    complianceReadinessStatus: "Ready for Compliance Check",
    entityStatus: "Former Applicant"
  },
  {
    entityId: "ent_023",
    companyName: "Pioneer Investments",
    legalName: "Pioneer Investments LLC",
    registrationNumber: "PSI-AIS-PLC-01443",
    dateOfIncorporation: "2022-06-10",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Public Limited Company",
    primaryAddress: "10022 Main Street, Salt Lake City, UT, USA",
    website: "https://pioneerinvestments.example.com",
    primaryContact: {
      contactId: "person_060",
      fullName: "Noah Campbell",
      email: "unit7.ultron@psirobo.demo",
      phone: "+131-555-2300",
      dateOfBirth: "2023-01-01", // Activation date
      nationality: "American",
      residentialAddress: "50269 Oak Street, Omaha, NE, USA",
      idDocumentType: "AI Sentience Certificate (Demo)",
      idDocumentNumber: "AUTMAI007U",
      idDocumentExpiry: "N/A",
      isPEP: false, // AI, though potentially influential
      position: "Chief Investment Algorithm",
    },
    directors: [
      {
        contactId: "person_060", // Ultron Unit 7
        fullName: "Noah Campbell",
        email: "unit7.ultron@psirobo.demo",
        phone: "+131-555-2300",
        dateOfBirth: "2023-01-01",
        nationality: "American",
        residentialAddress: "50780 Oak Street, Raleigh, NC, USA",
        idDocumentType: "AI Sentience Certificate (Demo)",
        idDocumentNumber: "AUTMAI007U",
        idDocumentExpiry: "N/A",
        isPEP: false,
        role: "Executive Director (Lead Algorithm)",
      },
      {
        contactId: "person_061",
        fullName: "Noah Roberts",
        email: "j.pym@psirobo.demo",
        phone: "+131-555-2301",
        dateOfBirth: "2023-02-01", // Activation date
        nationality: "American",
        residentialAddress: "50519 Oak Street, Portland, OR, USA",
        idDocumentType: "AI Ethics Compliance ID (Demo)",
        idDocumentNumber: "AUTMAI008J",
        idDocumentExpiry: "N/A",
        isPEP: false,
        role: "Director of AI Ethics & Governance",
      },
    ],
    ubos: [ // Could be owned by its creator or a consortium of AI developers
      {
        contactId: "person_041", // Hank Pym (re-appearing as a creator/investor)
        fullName: "Liam Russell",
        email: "h.pym@pymtech.demo", // Different email for this context
        phone: "+131-555-2302", // Different phone for this context
        dateOfBirth: "1952-03-12",
        nationality: "American",
        residentialAddress: "50891 Oak Street, Boston, MA, USA",
        idDocumentType: "Inter-Federation Science Pass (Demo)",
        idDocumentNumber: "IFSP001HP",
        idDocumentExpiry: "2030-12-31",
        isPEP: false,
        ownershipPercentage: 60,
      }
    ],
    assignedOfficerId: "reg_008", // Henry Jekyll
    complianceReadinessStatus: "Compliance Submission Pending",
    entityStatus: "Applicant"
  },
  {
    entityId: "ent_024",
    companyName: "Pioneer Holdings",
    legalName: "Pioneer Holdings LLC",
    registrationNumber: "OMEGA-DEX-LTD-01554",
    dateOfIncorporation: "2021-09-25",
    jurisdictionOfIncorporation: "Delaware, United States",
    companyType: "Private Limited Company",
    primaryAddress: "10023 Main Street, Kansas City, MO, USA",
    website: "https://pioneerholdings.example.com",
    primaryContact: {
      contactId: "person_062",
      fullName: "Noah Evans",
      email: "thanos@omegadex.demo",
      phone: "+242-555-2400",
      dateOfBirth: "Unknown (Ancient)",
      nationality: "American",
      residentialAddress: "50305 Oak Street, Anchorage, AK, USA",
      idDocumentType: "Galactic Conqueror Permit (Demo)",
      idDocumentNumber: "SCUGCP001T",
      idDocumentExpiry: "Until the End of Time",
      isPEP: true, // Warlord, immense power
      position: "CEO & Founder",
    },
    directors: [
      {
        contactId: "person_062", // Thanos
        fullName: "Noah Evans",
        email: "thanos@omegadex.demo",
        phone: "+242-555-2400",
        dateOfBirth: "Unknown (Ancient)",
        nationality: "American",
        residentialAddress: "50519 Oak Street, Anchorage, AK, USA",
        idDocumentType: "Galactic Conqueror Permit (Demo)",
        idDocumentNumber: "SCUGCP001T",
        idDocumentExpiry: "Until the End of Time",
        isPEP: true,
        role: "Executive Chairman",
      },
      {
        contactId: "person_063",
        fullName: "Noah Parker",
        email: "e.maw@omegadex.demo",
        phone: "+242-555-2401",
        dateOfBirth: "Unknown",
        nationality: "American",
        residentialAddress: "50203 Oak Street, Sacramento, CA, USA",
        idDocumentType: "Herald of Thanos ID (Demo)",
        idDocumentNumber: "SCUHOT001EM",
        idDocumentExpiry: "N/A",
        isPEP: true, // High-ranking member of an influential group
        role: "Chief Operations Officer",
      },
    ],
    ubos: [ // Thanos is the sole UBO
      {
        contactId: "person_062", // Thanos
        fullName: "Noah Evans",
        email: "thanos@omegadex.demo",
        phone: "+242-555-2400",
        dateOfBirth: "Unknown (Ancient)",
        nationality: "American",
        residentialAddress: "50382 Oak Street, Denver, CO, USA",
        idDocumentType: "Galactic Conqueror Permit (Demo)",
        idDocumentNumber: "SCUGCP001T",
        idDocumentExpiry: "Until the End of Time",
        isPEP: true,
        ownershipPercentage: 100,
      }
    ],
    assignedOfficerId: "reg_001", // Alice Wonderland
    complianceReadinessStatus: "Under Active Review",
    entityStatus: "Applicant"
  }
];

export default entities;