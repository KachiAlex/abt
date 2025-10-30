import { PrismaClient, UserRole, ProjectCategory, ProjectStatus, Priority, MilestoneStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧹 Clearing existing data...');
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.inspection.deleteMany();
    await prisma.projectTeamMember.deleteMany();
    await prisma.document.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.project.deleteMany();
    await prisma.contractorProfile.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create Users
  console.log('👥 Creating users...');
  
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.create({
    data: {
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
    },
  });

  const officerUser = await prisma.user.create({
    data: {
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
    },
  });

  const meOfficer = await prisma.user.create({
    data: {
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
    },
  });

  const contractor1User = await prisma.user.create({
    data: {
      email: 'contractor1@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+234-804-567-8901',
      role: UserRole.CONTRACTOR,
      isActive: true,
    },
  });

  const contractor2User = await prisma.user.create({
    data: {
      email: 'contractor2@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+234-805-678-9012',
      role: UserRole.CONTRACTOR,
      isActive: true,
    },
  });

  // Create Contractor Profiles
  console.log('🏢 Creating contractor profiles...');
  
  const contractor1 = await prisma.contractorProfile.create({
    data: {
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
    },
  });

  const contractor2 = await prisma.contractorProfile.create({
    data: {
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
    },
  });

  // Create Projects
  console.log('🏗️ Creating projects...');
  
  const project1 = await prisma.project.create({
    data: {
      name: 'Aba-Umuahia Expressway Rehabilitation',
      description: 'Complete rehabilitation of the 45km Aba-Umuahia expressway including drainage systems, streetlights, and road markings.',
      category: ProjectCategory.TRANSPORTATION,
      lga: 'Aba North',
      priority: Priority.HIGH,
      status: ProjectStatus.IN_PROGRESS,
      progress: 65,
      budget: 2500000000, // ₦2.5B
      allocatedBudget: 2500000000,
      spentBudget: 1625000000, // 65%
      fundingSource: 'State Budget 2024',
      startDate: new Date('2024-01-15'),
      expectedEndDate: new Date('2025-06-30'),
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
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Abia State General Hospital Modernization',
      description: 'Modernization and expansion of Abia State General Hospital including new emergency wing, diagnostic center, and medical equipment.',
      category: ProjectCategory.HEALTHCARE,
      lga: 'Umuahia South',
      priority: Priority.CRITICAL,
      status: ProjectStatus.IN_PROGRESS,
      progress: 45,
      budget: 1800000000, // ₦1.8B
      allocatedBudget: 1800000000,
      spentBudget: 810000000, // 45%
      fundingSource: 'Federal Grant + State Budget',
      startDate: new Date('2024-03-01'),
      expectedEndDate: new Date('2025-12-31'),
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
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Smart School Initiative - Phase 1',
      description: 'ICT infrastructure upgrade for 50 secondary schools including computer labs, internet connectivity, and digital learning tools.',
      category: ProjectCategory.EDUCATION,
      lga: 'Aba South',
      priority: Priority.MEDIUM,
      status: ProjectStatus.IN_PROGRESS,
      progress: 30,
      budget: 950000000, // ₦950M
      allocatedBudget: 950000000,
      spentBudget: 285000000, // 30%
      fundingSource: 'State Budget + Private Partnership',
      startDate: new Date('2024-05-01'),
      expectedEndDate: new Date('2025-10-31'),
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
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Aba Marina Waterfront Development',
      description: 'Development of recreational waterfront facility with parks, walkways, and commercial areas.',
      category: ProjectCategory.TOURISM,
      lga: 'Aba North',
      priority: Priority.MEDIUM,
      status: ProjectStatus.NOT_STARTED,
      progress: 0,
      budget: 3200000000, // ₦3.2B
      allocatedBudget: 800000000, // 25% allocated
      spentBudget: 0,
      fundingSource: 'State Budget + Investment',
      startDate: new Date('2025-01-15'),
      expectedEndDate: new Date('2026-12-31'),
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
    },
  });

  const project5 = await prisma.project.create({
    data: {
      name: 'Aba South Water Supply Project',
      description: 'Installation of water treatment plant and distribution network to provide clean water to 200,000 residents.',
      category: ProjectCategory.WATER_SANITATION,
      lga: 'Aba South',
      priority: Priority.HIGH,
      status: ProjectStatus.IN_PROGRESS,
      progress: 55,
      budget: 1500000000, // ₦1.5B
      allocatedBudget: 1500000000,
      spentBudget: 825000000, // 55%
      fundingSource: 'World Bank Loan',
      startDate: new Date('2024-02-01'),
      expectedEndDate: new Date('2025-08-31'),
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
    },
  });

  // Create Milestones for Project 1
  console.log('🎯 Creating milestones...');
  
  await prisma.milestone.createMany({
    data: [
      {
        projectId: project1.id,
        name: 'Site Clearance and Mobilization',
        description: 'Clear site and mobilize equipment and personnel',
        dueDate: new Date('2024-02-28'),
        completedDate: new Date('2024-02-25'),
        status: MilestoneStatus.COMPLETED,
        progress: 100,
        budget: 250000000,
        order: 1,
      },
      {
        projectId: project1.id,
        name: 'Road Reconstruction - Phase 1',
        description: 'Reconstruct first 15km section',
        dueDate: new Date('2024-06-30'),
        completedDate: new Date('2024-06-28'),
        status: MilestoneStatus.COMPLETED,
        progress: 100,
        budget: 750000000,
        order: 2,
      },
      {
        projectId: project1.id,
        name: 'Road Reconstruction - Phase 2',
        description: 'Reconstruct second 15km section',
        dueDate: new Date('2024-11-30'),
        status: MilestoneStatus.IN_PROGRESS,
        progress: 80,
        budget: 750000000,
        order: 3,
      },
      {
        projectId: project1.id,
        name: 'Final Phase and Finishing',
        description: 'Complete final section, streetlights, and markings',
        dueDate: new Date('2025-06-30'),
        status: MilestoneStatus.PENDING,
        progress: 0,
        budget: 750000000,
        order: 4,
      },
    ],
  });

  // Create Milestones for Project 2
  await prisma.milestone.createMany({
    data: [
      {
        projectId: project2.id,
        name: 'Structural Assessment and Design',
        description: 'Complete structural assessment and finalize designs',
        dueDate: new Date('2024-04-30'),
        completedDate: new Date('2024-04-28'),
        status: MilestoneStatus.COMPLETED,
        progress: 100,
        budget: 180000000,
        order: 1,
      },
      {
        projectId: project2.id,
        name: 'Emergency Wing Construction',
        description: 'Build new emergency wing',
        dueDate: new Date('2024-12-31'),
        status: MilestoneStatus.IN_PROGRESS,
        progress: 60,
        budget: 720000000,
        order: 2,
      },
      {
        projectId: project2.id,
        name: 'Diagnostic Center Equipment',
        description: 'Install diagnostic equipment',
        dueDate: new Date('2025-06-30'),
        status: MilestoneStatus.PENDING,
        progress: 0,
        budget: 540000000,
        order: 3,
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log('  - 5 Users (1 Admin, 1 Officer, 1 M&E Officer, 2 Contractors)');
  console.log('  - 2 Contractor Profiles');
  console.log('  - 5 Projects');
  console.log('  - 7 Milestones');
  console.log('\n🔐 Login Credentials:');
  console.log('  Admin:      admin@abia.gov.ng / Password123!');
  console.log('  Officer:    officer@abia.gov.ng / Password123!');
  console.log('  M&E:        me@abia.gov.ng / Password123!');
  console.log('  Contractor: contractor1@example.com / Password123!');
  console.log('  Contractor: contractor2@example.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

