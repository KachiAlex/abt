import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { hashPassword, comparePassword, generateToken, createAuthenticatedUser } from '../utils/auth';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler, AppError } from '../middleware/errorHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    department,
    jobTitle,
    // Contractor-specific fields
    companyName,
    registrationNo,
    contactPerson,
    companyEmail,
    companyPhone,
    companyAddress,
    yearsExperience,
    specialization,
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const userData = {
    email,
    password: hashedPassword,
    firstName,
    lastName,
    phone,
    role: role as UserRole,
    department,
    jobTitle,
  };

  const user = await prisma.user.create({
    data: userData,
    include: {
      contractorProfile: true,
    },
  });

  // Create contractor profile if role is CONTRACTOR
  if (role === UserRole.CONTRACTOR && companyName) {
    await prisma.contractorProfile.create({
      data: {
        userId: user.id,
        companyName,
        registrationNo,
        contactPerson: contactPerson || `${firstName} ${lastName}`,
        companyEmail: companyEmail || email,
        companyPhone: companyPhone || phone,
        companyAddress,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        specialization: specialization || [],
      },
    });

    // Refetch user with contractor profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        contractorProfile: true,
      },
    });

    const authenticatedUser = createAuthenticatedUser(updatedUser);
    const token = generateToken({
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      contractorId: authenticatedUser.contractorId,
    });

    return sendSuccess(res, {
      user: authenticatedUser,
      token,
    }, 'User registered successfully', 201);
  }

  const authenticatedUser = createAuthenticatedUser(user);
  const token = generateToken({
    userId: authenticatedUser.id,
    email: authenticatedUser.email,
    role: authenticatedUser.role,
    contractorId: authenticatedUser.contractorId,
  });

  sendSuccess(res, {
    user: authenticatedUser,
    token,
  }, 'User registered successfully', 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with contractor profile
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      contractorProfile: true,
    },
  });

  if (!user || !user.isActive) {
    throw new AppError('Invalid credentials or inactive account', 401);
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const authenticatedUser = createAuthenticatedUser(user);
  const token = generateToken({
    userId: authenticatedUser.id,
    email: authenticatedUser.email,
    role: authenticatedUser.role,
    contractorId: authenticatedUser.contractorId,
  });

  sendSuccess(res, {
    user: authenticatedUser,
    token,
  }, 'Login successful');
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      contractorProfile: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      department: true,
      jobTitle: true,
      profileImage: true,
      address: true,
      city: true,
      state: true,
      lastLogin: true,
      createdAt: true,
      contractorProfile: {
        select: {
          id: true,
          companyName: true,
          registrationNo: true,
          contactPerson: true,
          companyEmail: true,
          companyPhone: true,
          companyAddress: true,
          rating: true,
          isVerified: true,
          isCertified: true,
          yearsExperience: true,
          specialization: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  sendSuccess(res, user, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    firstName,
    lastName,
    phone,
    department,
    jobTitle,
    address,
    city,
    state,
    // Contractor-specific updates
    companyName,
    contactPerson,
    companyEmail,
    companyPhone,
    companyAddress,
    specialization,
  } = req.body;

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      phone,
      department,
      jobTitle,
      address,
      city,
      state,
    },
    include: {
      contractorProfile: true,
    },
  });

  // Update contractor profile if user is a contractor
  if (updatedUser.role === UserRole.CONTRACTOR && updatedUser.contractorProfile) {
    await prisma.contractorProfile.update({
      where: { userId },
      data: {
        companyName,
        contactPerson,
        companyEmail,
        companyPhone,
        companyAddress,
        specialization,
      },
    });
  }

  // Fetch updated user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      contractorProfile: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      department: true,
      jobTitle: true,
      profileImage: true,
      address: true,
      city: true,
      state: true,
      lastLogin: true,
      createdAt: true,
      contractorProfile: {
        select: {
          id: true,
          companyName: true,
          registrationNo: true,
          contactPerson: true,
          companyEmail: true,
          companyPhone: true,
          companyAddress: true,
          rating: true,
          isVerified: true,
          isCertified: true,
          yearsExperience: true,
          specialization: true,
        },
      },
    },
  });

  sendSuccess(res, user, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });

  sendSuccess(res, null, 'Password changed successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists or not
    return sendSuccess(res, null, 'If the email exists, a reset link has been sent');
  }

  // TODO: Implement email sending for password reset
  // For now, just return success
  sendSuccess(res, null, 'Password reset link sent to your email');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // TODO: Implement password reset token verification
  // For now, just return success
  sendSuccess(res, null, 'Password reset successfully');
});
