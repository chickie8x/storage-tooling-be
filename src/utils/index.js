import jwt from 'jsonwebtoken';
const SECRET_KEY = process.env.SECRET_KEY; 


// Generate JWT
export function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY);
}

// Verify JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

//auth middleware
export const authMiddleware = (req, res, next) => {
  console.log(req.headers);
  if(!req.headers.authorization) {
    return res.status(401).json({ message: 'Không có quyền truy cập' });
  }
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token không tồn tại' });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}
