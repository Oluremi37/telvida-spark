module.exports = function requireOrganization(req, res, next) {
  if (!req.user.organizationId) {
    return res.status(400).json({
      success: false,
      message: "Please complete organization setup before continuing",
    });
  }
  next();
};
