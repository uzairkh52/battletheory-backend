const express = require('express');
const router = express.Router();
const {
  getBattles,
  getBattleByIdOrSlug,
  createBattle,
  deleteBattle,
} = require('../controllers/battleController');

router.get('/', getBattles);
router.get('/:idOrSlug', getBattleByIdOrSlug);
router.post('/', createBattle);
router.delete('/:id', deleteBattle);

module.exports = router;