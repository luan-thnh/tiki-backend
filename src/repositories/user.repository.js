const executeQuery = require('../utils/executeQuery.util');

module.exports = UserRepository = {
  // GET: Get All User
  findAllUser: async ({ email, username, fullName, phoneNumber, sortByName, sortByDate, limit, offset }) => {
    let query = `SELECT * FROM users WHERE is_activated = 1`;

    if (email) query += ` AND email = '${email}'`;
    if (username) query += ` AND username = '${username}'`;
    if (phoneNumber) query += ` AND phone_number = '${phoneNumber}'`;
    if (fullName) query += ` AND full_name LIKE '%${fullName}%'`;
    if (sortByName === 'asc') {
      query += ' ORDER BY email ASC';
    } else if (sortByName === 'desc') {
      query += ' ORDER BY email DESC';
    }

    if (sortByDate === 'newest') {
      query += ' , updated_at DESC';
    } else if (sortByDate === 'oldest') {
      query += ' , updated_at ASC';
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    return await executeQuery(query);
  },

  // GET: Get User by ID
  findUserById: async (userId) => {
    let query = `SELECT * FROM users WHERE uuid = '${userId}'`;
    const res = await executeQuery(query);

    return res[0];
  },

  // GET: Get User by Something
  findUserByOne: async (attributes, operator = 'AND') => {
    let query = 'SELECT * FROM users WHERE ';
    const conditions = Object.keys(attributes).map(
      (key, index) =>
        `${key} = '${attributes[key]}'${
          index < Object.keys(attributes).length - 1 ? ` ${operator.toUpperCase()} ` : ''
        }`
    );
    query += conditions.join('');

    const res = await executeQuery(query);
    return res[0];
  },

  // POST: Create New User
  createOneUser: async (user) => {
    const query = `INSERT INTO users (
                      uuid,
                      username,
                      email,
                      full_name,
                      password,
                      phone_number,
                      country,
                      state,
                      address,
                      role,
                      avatar,
                      gender,
                      day_of_birth,
                      is_public,
                      created_at,
                      updated_at
                      )
                  VALUES (
                    '${user.uuid}',
                    '${user.username}',
                    '${user.email}',
                    '${user.fullName}',
                    '${user.password}',
                    '${user.phoneNumber}',
                    '${user.country}',
                    '${user.state}',
                    '${user.address}',
                    '${user.role}',
                    '${user.avatar}',
                    '${user.gender}',
                    '${user.dayOfBirth}',
                    '${user.isPublic}', 
                    '${user.createdAt}', 
                    '${user.updatedAt}'
                  )`;
    await executeQuery(query);
    return user;
  },

  // PUT: Update User By ID
  findUpdateUserById: async (user, userId) => {
    const query = `UPDATE users  
                   SET username = '${user.username}', 
                      email = '${user.email}', 
                      full_name = '${user.fullName}',  
                      password = '${user.password}', 
                      phone_number = '${user.phoneNumber}', 
                      address = '${user.address}', 
                      role = '${user.role}', 
                      avatar = '${user.avatar}', 
                      is_public = '${user.isPublic}'
                   WHERE uuid = '${userId}'`;

    await executeQuery(query);
    return user;
  },

  // DELETE: Remove User by ID
  findRemoveUserById: async (userId) => {
    const query = `DELETE FROM users WHERE uuid = '${userId}'`;

    await executeQuery(query);
  },
};
