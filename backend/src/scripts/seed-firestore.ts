import * as admin from 'firebase-admin';
import * as bcrypt from 'bcryptjs';
import { 
  User, ContractorProfile, Project, Milestone,
  UserRole, ProjectCategory, ProjectStatus, Priority, MilestoneStatus 
} from '../types/firestore';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function clearCollections() {
  console.log('🧹 Clearing existing collections...');
  
  const collections = [
    'auditLogs', 'notifications', 'reports', 'inspections',
    'teamMembers', 'documents', 'approvals', 'submissions',
    'milestones', 'projects', 'contractorProfiles', 'users'
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`  ✓ Cleared ${collectionName}`);
  }
}

async function seedData() {
  console.log('🌱 Starting Firestore seeding...\n');

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const now = admin.firestore.Timestamp.now();

  // ============================================================================
  // CREATE USERS
  // ============================================================================
  console.log('👥 Creating users...');

  const adminUser: User = {
    id: 'admin-001',
    email: 'admin@abia.gov.ng',
    password: hashedPassword,
    firstName: 'Government',
    lastName: 'Administrator',
    phone: '+234-801-234-5678',
    role: UserRole.GOVERNMENT_ADMIN,
    department: 'Ministry of Works',
    jobTitle: 'Director General',
    address: 'Government House, Umuahia',
    city: 'Umuahia',
    state: 'Abia',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const officerUser: User = {
    id: 'officer-001',
    email: 'officer@abia.gov.ng',
    password: hashedPassword,
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+234-802-345-6789',
    role: UserRole.GOVERNMENT_OFFICER,
    department: 'Ministry of Works',
    jobTitle: 'Project Officer',
    address: 'Government House, Umuahia',
    city: 'Umuahia',
    state: 'Abia',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const meOfficer: User = {
    id: 'me-001',
    email: 'me@abia.gov.ng',
    password: hashedPassword,
    firstName: 'Michael',
    lastName: 'Adebayo',
    phone: '+234-803-456-7890',
    role: UserRole.ME_OFFICER,
    department: 'M&E Department',
    jobTitle: 'Senior M&E Officer',
    address: 'Government House, Umuahia',
    city: 'Umuahia',
    state: 'Abia',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const contractor1User: User = {
    id: 'contractor-001',
    email: 'contractor1@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
    phone: '+234-804-567-8901',
    role: UserRole.CONTRACTOR,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const contractor2User: User = {
    id: 'contractor-002',
    email: 'contractor2@example.com',
    password: hashedPassword,
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+234-805-678-9012',
    role: UserRole.CONTRACTOR,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const users = [adminUser, officerUser, meOfficer, contractor1User, contractor2User];
  
  for (const user of users) {
    await db.collection('users').doc(user.id).set(user);
  }
  console.log(`  ✓ Created ${users.length} users\n`);

  // ============================================================================
  // CREATE CONTRACTOR PROFILES
  // ============================================================================
  console.log('🏢 Creating contractor profiles...');

  const contractor1: ContractorProfile = {
    id: 'contractor-profile-001',
    userId: contractor1User.id,
    companyName: 'Alpha Construction Ltd',
    registrationNo: 'RC-123456',
    contactPerson: 'John Doe',
    companyEmail: 'info@alphaconstruction.com',
    companyPhone: '+234-804-567-8901',
    companyAddress: '12 Construction Avenue, Aba, Abia State',
    rating: 4.5,
    isVerified: true,
    isCertified: true,
    yearsExperience: 15,
    specialization: ['Transportation', 'Infrastructure', 'Road Construction'],
    createdAt: now,
    updatedAt: now,
  };

  const contractor2: ContractorProfile = {
    id: 'contractor-profile-002',
    userId: contractor2User.id,
    companyName: 'Beta Engineering Solutions',
    registrationNo: 'RC-789012',
    contactPerson: 'Jane Smith',
    companyEmail: 'contact@betaeng.com',
    companyPhone: '+234-805-678-9012',
    companyAddress: '45 Engineering Road, Umuahia, Abia State',
    rating: 4.8,
    isVerified: true,
    isCertified: true,
    yearsExperience: 20,
    specialization: ['Healthcare', 'Education', 'Public Buildings'],
    createdAt: now,
    updatedAt: now,
  };

  await db.collection('contractorProfiles').doc(contractor1.id).set(contractor1);
  await db.collection('contractorProfiles').doc(contractor2.id).set(contractor2);
  console.log('  ✓ Created 2 contractor profiles\n');

  // ============================================================================
  // CREATE PROJECTS
  // ============================================================================
  console.log('🏗️ Creating projects...');

  const project1: Project = {
    id: 'project-001',
    name: 'Aba-Umuahia Expressway Rehabilitation',
    description: 'Complete rehabilitation of the 45km Aba-Umuahia expressway including drainage systems, streetlights, and road markings.',
    category: ProjectCategory.TRANSPORTATION,
    lga: 'Aba North',
    priority: Priority.HIGH,
    status: ProjectStatus.IN_PROGRESS,
    progress: 65,
    budget: 2500000000,
    allocatedBudget: 2500000000,
    spentBudget: 1625000000,
    fundingSource: 'State Budget 2024',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-15')),
    expectedEndDate: admin.firestore.Timestamp.fromDate(new Date('2025-06-30')),
    beneficiaries: 'Estimated 500,000 road users daily',
    contractorId: contractor1.id,
    projectManagerId: officerUser.id,
    location: {
      coordinates: { lat: 5.1167, lng: 7.3667 },
      address: 'Aba-Umuahia Expressway, Abia State',
    },
    isPublic: true,
    qualityScore: 8.5,
    safetyCompliance: 'Excellent',
    weatherDelay: 3,
    safetyIncidents: 0,
    createdAt: now,
    updatedAt: now,
  };

  const project2: Project = {
    id: 'project-002',
    name: 'Abia State General Hospital Modernization',
    description: 'Modernization and expansion of Abia State General Hospital including new emergency wing, diagnostic center, and medical equipment.',
    category: ProjectCategory.HEALTHCARE,
    lga: 'Umuahia South',
    priority: Priority.CRITICAL,
    status: ProjectStatus.IN_PROGRESS,
    progress: 45,
    budget: 1800000000,
    allocatedBudget: 1800000000,
    spentBudget: 810000000,
    fundingSource: 'Federal Grant + State Budget',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-03-01')),
    expectedEndDate: admin.firestore.Timestamp.fromDate(new Date('2025-12-31')),
    beneficiaries: '2 million Abia State residents',
    contractorId: contractor2.id,
    projectManagerId: officerUser.id,
    location: {
      coordinates: { lat: 5.5333, lng: 7.4833 },
      address: 'Umuahia, Abia State',
    },
    isPublic: true,
    qualityScore: 9.0,
    safetyCompliance: 'Excellent',
    weatherDelay: 0,
    safetyIncidents: 0,
    createdAt: now,
    updatedAt: now,
  };

  const project3: Project = {
    id: 'project-003',
    name: 'Smart School Initiative - Phase 1',
    description: 'ICT infrastructure upgrade for 50 secondary schools including computer labs, internet connectivity, and digital learning tools.',
    category: ProjectCategory.EDUCATION,
    lga: 'Aba South',
    priority: Priority.MEDIUM,
    status: ProjectStatus.IN_PROGRESS,
    progress: 30,
    budget: 950000000,
    allocatedBudget: 950000000,
    spentBudget: 285000000,
    fundingSource: 'State Budget + Private Partnership',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-05-01')),
    expectedEndDate: admin.firestore.Timestamp.fromDate(new Date('2025-10-31')),
    beneficiaries: '25,000 students across 50 schools',
    contractorId: contractor2.id,
    projectManagerId: officerUser.id,
    location: {
      coordinates: { lat: 5.1067, lng: 7.3667 },
      address: 'Multiple locations, Aba South LGA',
    },
    isPublic: true,
    qualityScore: 7.8,
    safetyCompliance: 'Good',
    weatherDelay: 0,
    safetyIncidents: 0,
    createdAt: now,
    updatedAt: now,
  };

  const project4: Project = {
    id: 'project-004',
    name: 'Aba Marina Waterfront Development',
    description: 'Development of recreational waterfront facility with parks, walkways, and commercial areas.',
    category: ProjectCategory.TOURISM,
    lga: 'Aba North',
    priority: Priority.MEDIUM,
    status: ProjectStatus.NOT_STARTED,
    progress: 0,
    budget: 3200000000,
    allocatedBudget: 800000000,
    spentBudget: 0,
    fundingSource: 'State Budget + Investment',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2025-01-15')),
    expectedEndDate: admin.firestore.Timestamp.fromDate(new Date('2026-12-31')),
    beneficiaries: 'Residents and tourists',
    location: {
      coordinates: { lat: 5.1167, lng: 7.3667 },
      address: 'Marina, Aba, Abia State',
    },
    isPublic: true,
    qualityScore: 0,
    safetyCompliance: 'Not Started',
    weatherDelay: 0,
    safetyIncidents: 0,
    createdAt: now,
    updatedAt: now,
  };

  const project5: Project = {
    id: 'project-005',
    name: 'Aba South Water Supply Project',
    description: 'Installation of water treatment plant and distribution network to provide clean water to 200,000 residents.',
    category: ProjectCategory.WATER_SANITATION,
    lga: 'Aba South',
    priority: Priority.HIGH,
    status: ProjectStatus.IN_PROGRESS,
    progress: 55,
    budget: 1500000000,
    allocatedBudget: 1500000000,
    spentBudget: 825000000,
    fundingSource: 'World Bank Loan',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-02-01')),
    expectedEndDate: admin.firestore.Timestamp.fromDate(new Date('2025-08-31')),
    beneficiaries: '200,000 residents of Aba South',
    contractorId: contractor1.id,
    projectManagerId: officerUser.id,
    location: {
      coordinates: { lat: 5.0933, lng: 7.3650 },
      address: 'Aba South LGA, Abia State',
    },
    isPublic: true,
    qualityScore: 8.2,
    safetyCompliance: 'Good',
    weatherDelay: 5,
    safetyIncidents: 1,
    createdAt: now,
    updatedAt: now,
  };

  const projects = [project1, project2, project3, project4, project5];
  
  for (const project of projects) {
    await db.collection('projects').doc(project.id).set(project);
  }
  console.log(`  ✓ Created ${projects.length} projects\n`);

  // ============================================================================
  // CREATE MILESTONES
  // ============================================================================
  console.log('🎯 Creating milestones...');

  const milestones: Milestone[] = [
    // Project 1 milestones
    {
      id: 'milestone-001',
      projectId: project1.id,
      name: 'Site Clearance and Mobilization',
      description: 'Clear site and mobilize equipment and personnel',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-02-28')),
      completedDate: admin.firestore.Timestamp.fromDate(new Date('2024-02-25')),
      status: MilestoneStatus.COMPLETED,
      progress: 100,
      budget: 250000000,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'milestone-002',
      projectId: project1.id,
      name: 'Road Reconstruction - Phase 1',
      description: 'Reconstruct first 15km section',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-06-30')),
      completedDate: admin.firestore.Timestamp.fromDate(new Date('2024-06-28')),
      status: MilestoneStatus.COMPLETED,
      progress: 100,
      budget: 750000000,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'milestone-003',
      projectId: project1.id,
      name: 'Road Reconstruction - Phase 2',
      description: 'Reconstruct second 15km section',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-11-30')),
      status: MilestoneStatus.IN_PROGRESS,
      progress: 80,
      budget: 750000000,
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'milestone-004',
      projectId: project1.id,
      name: 'Final Phase and Finishing',
      description: 'Complete final section, streetlights, and markings',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2025-06-30')),
      status: MilestoneStatus.PENDING,
      progress: 0,
      budget: 750000000,
      order: 4,
      createdAt: now,
      updatedAt: now,
    },
    // Project 2 milestones
    {
      id: 'milestone-005',
      projectId: project2.id,
      name: 'Structural Assessment and Design',
      description: 'Complete structural assessment and finalize designs',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-04-30')),
      completedDate: admin.firestore.Timestamp.fromDate(new Date('2024-04-28')),
      status: MilestoneStatus.COMPLETED,
      progress: 100,
      budget: 180000000,
      order: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'milestone-006',
      projectId: project2.id,
      name: 'Emergency Wing Construction',
      description: 'Build new emergency wing',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2024-12-31')),
      status: MilestoneStatus.IN_PROGRESS,
      progress: 60,
      budget: 720000000,
      order: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'milestone-007',
      projectId: project2.id,
      name: 'Diagnostic Center Equipment',
      description: 'Install diagnostic equipment',
      dueDate: admin.firestore.Timestamp.fromDate(new Date('2025-06-30')),
      status: MilestoneStatus.PENDING,
      progress: 0,
      budget: 540000000,
      order: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const milestone of milestones) {
    await db.collection('milestones').doc(milestone.id).set(milestone);
  }
  console.log(`  ✓ Created ${milestones.length} milestones\n`);

  console.log('✅ Firestore seeding completed successfully!\n');
  console.log('📊 Created:');
  console.log('  - 5 Users (1 Admin, 1 Officer, 1 M&E Officer, 2 Contractors)');
  console.log('  - 2 Contractor Profiles');
  console.log('  - 5 Projects');
  console.log('  - 7 Milestones\n');
  console.log('🔐 Login Credentials:');
  console.log('  Admin:      admin@abia.gov.ng / Password123!');
  console.log('  Officer:    officer@abia.gov.ng / Password123!');
  console.log('  M&E:        me@abia.gov.ng / Password123!');
  console.log('  Contractor: contractor1@example.com / Password123!');
  console.log('  Contractor: contractor2@example.com / Password123!\n');
}

async function main() {
  try {
    await clearCollections();
    await seedData();
    console.log('🎉 All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();

