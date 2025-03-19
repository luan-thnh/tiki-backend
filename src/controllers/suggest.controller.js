// const SuggestResponse = require('../data/response/suggest.response');
// const SuggestRepository = require('../repositories/suggest.repository');

// const suggestController = {
//   getAllSuggest: async (req, res, next) => {
//     try {
//       const suggests = (await SuggestRepository.findAllSuggest()) || [];

//       const suggestsRes = suggests?.map((suggest) => new SuggestResponse(suggest));

//       res.status(200).json({
//         message: 'Success',
//         data: suggestsRes,
//       });
//     } catch (error) {
//       next(error);
//     }
//   },

//   addToKeyWord: async (req, res, next) => {
//     try {
//       const keyword = req.body.keyword.toLowerCase();
//       await SuggestRepository.createOneSuggest(keyword);

//       res.status(200).json({
//         message: 'success',
//       });
//     } catch (error) {
//       next(error);
//     }
//   },
// };

// module.exports = suggestController;
