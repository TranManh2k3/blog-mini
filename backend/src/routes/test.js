const router = require('express').Router();
router.get('/', (req, res) => {
  res.json({ success:true, message:'Server & Atlas connected!' });
});
module.exports = router;
