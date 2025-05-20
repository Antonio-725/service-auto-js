// controllers/userController.js
const getProfile = (req, res) => {
  const { id, username, email, role, phone } = req.user;
  res.json({ id, username, email, role, phone });
};

module.exports = { getProfile };
