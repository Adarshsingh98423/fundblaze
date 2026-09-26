const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const ACCESS_SECRET = () => process.env.JWT_ACCESS_SECRET || 'access_secret_change_me';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.fb_access_token)
    token = req.cookies.fb_access_token;

  if (!token)
    return res.status(401).json({ success:false, message:'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET());
    const user    = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!user)           return res.status(401).json({ success:false, message:'User no longer exists.' });
    if (!user.isActive)  return res.status(401).json({ success:false, message:'Account deactivated.' });
    req.user = user;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    res.status(401).json({ success:false, message: msg });
  }
};

const optionalAuth = async (req, _res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];
  else if (req.cookies?.fb_access_token)
    token = req.cookies.fb_access_token;

  if (!token) return next();
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET());
    const user    = await User.findById(decoded.id).select('-password -refreshTokens');
    if (user?.isActive) req.user = user;
  } catch (_) { /* ignore – optional */ }
  next();
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success:false, message:'Not authenticated.' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success:false, message:`Access denied. Required role: ${roles.join(' or ')}.` });
  next();
};

module.exports = { protect, optionalAuth, authorize };
