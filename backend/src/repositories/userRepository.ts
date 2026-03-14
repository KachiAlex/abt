import { objectToSnakeCase, query, rowToCamelCase } from '../config/database';
import { CreateUserInput, DbUser, UpdateUserInput } from '../types/models';

const baseColumns = `
  id, email, password, first_name, last_name, phone, role, is_active,
  profile_image, department, job_title, address, city, state,
  last_login, created_at, updated_at
`;

const mapUser = (row: any): DbUser => {
  const user = rowToCamelCase(row);
  return {
    ...user,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  } as DbUser;
};

const buildUpdateSet = (updates: UpdateUserInput) => {
  const snake = objectToSnakeCase(updates);
  const entries = Object.entries(snake).filter(([, value]) => value !== undefined);

  const fields: string[] = [];
  const values: any[] = [];

  entries.forEach(([key, value]) => {
    fields.push(`${key} = $${fields.length + 1}`);
    values.push(value);
  });

  return { fields, values };
};

export const userRepository = {
  async findByEmail(email: string): Promise<DbUser | null> {
    const result = await query(`SELECT ${baseColumns} FROM users WHERE email = $1 LIMIT 1`, [email]);
    if (result.rows.length === 0) return null;
    return mapUser(result.rows[0]);
  },

  async findById(id: string): Promise<DbUser | null> {
    const result = await query(`SELECT ${baseColumns} FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;
    return mapUser(result.rows[0]);
  },

  async create(data: CreateUserInput): Promise<DbUser> {
    const result = await query(
      `INSERT INTO users (
        email, password, first_name, last_name, phone, role,
        profile_image, department, job_title, address, city, state
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      ) RETURNING ${baseColumns}`,
      [
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone ?? null,
        data.role,
        data.profileImage ?? null,
        data.department ?? null,
        data.jobTitle ?? null,
        data.address ?? null,
        data.city ?? null,
        data.state ?? null,
      ]
    );
    return mapUser(result.rows[0]);
  },

  async update(id: string, updates: UpdateUserInput): Promise<DbUser | null> {
    const { fields, values } = buildUpdateSet(updates);

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING ${baseColumns}`,
      values
    );

    if (result.rows.length === 0) return null;
    return mapUser(result.rows[0]);
  },

  async updateLastLogin(id: string): Promise<void> {
    await query('UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1', [id]);
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [passwordHash, id]);
  }
};

export default userRepository;
