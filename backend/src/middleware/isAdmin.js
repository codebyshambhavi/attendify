const isAdmin = (req, res, next) => {
  if (req.user.role !== 'faculty') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};

module.exports = isAdmin;
