/**
 * @typedef {Object} RegulatorStaffMember
 * @property {string} staffId - Unique identifier for the staff member (e.g., "reg_001").
 * @property {string} name - Full name of the staff member.
 * @property {string} role - Role of the staff member within the regulatory body.
 * @property {string} team - The team or department the staff member belongs to.
 * @property {string} email - Email address of the staff member.
 */

/**
 * @type {RegulatorStaffMember[]}
 */
const regulatorStaff = [
  {
    staffId: "reg_001",
    name: "Alice Wonderland",
    role: "Head of Licensing",
    team: "Licensing Department",
    email: "awonderland@regulator.demo",
  },
  {
    staffId: "reg_002",
    name: "Bobby Mack",
    role: "Senior Licensing Officer",
    team: "Alpha Review Team",
    email: "bbuilder@regulator.demo",
  },
  {
    staffId: "reg_003",
    name: "Carol Danvers",
    role: "Licensing Officer",
    team: "Alpha Review Team",
    email: "cdanvers@regulator.demo",
  },
  {
    staffId: "reg_004",
    name: "David Copperfield",
    role: "Senior Compliance Analyst",
    team: "Compliance & Oversight",
    email: "dcopperfield@regulator.demo",
  },
  {
    staffId: "reg_005",
    name: "Eve Moneypenny",
    role: "Supervisory Lead",
    team: "Banking Supervision Dept.",
    email: "emoneypenny@regulator.demo",
  },
  {
    staffId: "reg_006",
    name: "Frank Castle",
    role: "Enforcement Officer", // For future use in other modules
    team: "Enforcement Division",
    email: "fcastlet@regulator.demo",
  },
  {
    staffId: "reg_007",
    name: "Grace Hopper",
    role: "Licensing Officer",
    team: "Beta Review Team",
    email: "ghopper@regulator.demo",
  },
  {
    staffId: "reg_008",
    name: "Henry Jekyll",
    role: "Risk Assessment Specialist",
    team: "Risk Management Unit",
    email: "hjekyll@regulator.demo",
  }
];

export default regulatorStaff;