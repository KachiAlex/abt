import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { JwtPayload, AuthenticatedUser } from '../types';
import { UserRole } from '@prisma/client';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, config.jwtSecret, {
    expiresIn: '30d',
  });
};

export const createAuthenticatedUser = (user: any): AuthenticatedUser => {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    contractorId: user.contractorProfile?.id,
  };
};

export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isGovernmentUser = (role: UserRole): boolean => {
  return [UserRole.GOVERNMENT_ADMIN, UserRole.GOVERNMENT_OFFICER].includes(role);
};

export const isMEOfficer = (role: UserRole): boolean => {
  return role === UserRole.ME_OFFICER;
};

export const isContractor = (role: UserRole): boolean => {
  return role === UserRole.CONTRACTOR;
};

export const canAccessProject = (
  userRole: UserRole,
  userId: string,
  contractorId?: string,
  projectContractorId?: string
): boolean => {
  // Government users and M&E officers can access all projects
  if (isGovernmentUser(userRole) || isMEOfficer(userRole)) {
    return true;
  }
  
  // Contractors can only access their own projects
  if (isContractor(userRole) && contractorId) {
    return contractorId === projectContractorId;
  }
  
  return false;
};

export const canModifyProject = (
  userRole: UserRole,
  userId: string,
  contractorId?: string,
  projectContractorId?: string
): boolean => {
  // Only government admins can modify project details
  if (userRole === UserRole.GOVERNMENT_ADMIN) {
    return true;
  }
  
  // Contractors can submit updates but not modify core project details
  return false;
};

export const canApproveSubmissions = (userRole: UserRole): boolean => {
  return isMEOfficer(userRole) || userRole === UserRole.GOVERNMENT_ADMIN;
};
