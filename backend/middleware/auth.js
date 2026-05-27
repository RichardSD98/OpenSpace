const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ message: 'Not authorized, token failed' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = { ...user, ...profile, _id: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

const requireLister = (req, res, next) => {
  if (req.user && req.user.role === 'lister') return next();
  res.status(403).json({ message: 'Only listers can perform this action' });
};

module.exports = { protect, requireLister };
