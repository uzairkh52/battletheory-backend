const express = require('express');
const router = express.Router();
const {
  getBattles,
  getBattleByIdOrSlug,
  createBattle,
  updateBattle, // 🌟 Imported updateBattle
  deleteBattle,
  addBattleComment,
  toggleLikeBattleComment,
  editBattleComment,
  deleteBattleComment,
} = require('../controllers/battleController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getBattles);
router.get('/:idOrSlug', getBattleByIdOrSlug);

// Protected Comment Routes
router.post('/:id/comments', protect, addBattleComment);
router.put('/comments/:commentId/like', protect, toggleLikeBattleComment);
router.put('/comments/:commentId', protect, editBattleComment);
router.delete('/comments/:commentId', protect, deleteBattleComment);

// Protected Admin Routes
router.post('/', protect, admin, createBattle);
router.put('/:id', protect, admin, updateBattle); // 🌟 Added PUT route for updating battles
router.delete('/:id', protect, admin, deleteBattle);

module.exports = router;