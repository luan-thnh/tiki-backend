// const executeQuery = require('../utils/executeQuery.util');

// module.exports = SuggestRepository = {
//   findAllSuggest: async () => {
//     let query = `SELECT * FROM suggests`;

//     return await executeQuery(query);
//   },

//   // POST: Create New Suggest
//   createOneSuggest: async (keyword) => {
//     const suggestQuery = `INSERT INTO suggests (keyword)
//                           VALUES ('${keyword}')
//                           ON DUPLICATE KEY UPDATE search_count = search_count + 1;
//                           `;

//     await executeQuery(suggestQuery);
//   },
// };
