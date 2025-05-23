import express from 'express';
import argon2 from 'argon2';
import prisma from './configs/index.js';
import cors from 'cors';
import { exec } from 'child_process';
import { generateToken, verifyToken, authMiddleware } from './utils/index.js';


const app = express();
app.use(express.json({limit: '5mb'}));  
app.use(express.urlencoded({limit: '5mb', extended: true}))
app.use(cors());


//create user
app.post('/api/users/create', async (req, res) => {
  const { name, email, password } = req.body;
  const foundUser = await prisma.user.findUnique({
    where: { email },
  });
  if (foundUser) {
    return res.status(401).json({ message: 'Tài khoản đã tồn tại' });
  }
  const hashedPassword = await argon2.hash(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  res.json({token: token, message: 'Tạo tài khoản thành công'});
});

//login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
  }
  const foundUser = await prisma.user.findUnique({
      where: { email },
  });
  if (!foundUser) {
    return res.status(401).json({ message: 'Tài khoản không tồn tại', token: null });
  }
  const isPasswordCorrect = await argon2.verify(foundUser.password, password);
  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Mật khẩu không chính xác', token: null });
  }
  const token = generateToken({ id: foundUser.id, email: foundUser.email, name: foundUser.name });
  res.json({token: token, message: 'Đăng nhập thành công'});
});


//create sessionTransport and transportCodes
app.post('/api/session-transport/create', authMiddleware, async (req, res) => {
  try {
    // Extract and verify token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { sessionCode, note, transportCode, transportCodeQuantity, transporter, goodsStatus, sessionType } = req.body;

    // Validate required fields
    if (!sessionCode || !transportCode) {
      return res.status(400).json({ error: 'Session code and transport codes are required' });
    }
    
    const sessionTransport = await prisma.sessionTransport.create({
      data: {
        sessionCode,
        sessionType,
        transportCodeQuantity,
        transporter,
        goodsStatus,
        note,
        transportCode: {
          create: transportCode.map((code) => ({
            code: code.code,
            transporter: transporter,
            goodsStatus: goodsStatus,
            note: note,
            author: user.name,
            userId: user.id,
          })),
        },
        author: user.name,
        user: { connect: { id: user.id } },
      },
    });

    return res.json(sessionTransport);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'An error occurred while creating the session transport' });
  } finally {
    await prisma.$disconnect();
  }
});

//get sessionTransport list
app.get('/api/session-transport', authMiddleware, async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 10;
  const skip = (currentPage - 1) * pageSize;
  const sessionTransport = await prisma.sessionTransport.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    skip: skip,
    take: pageSize,
  });
  const total = Math.ceil(await prisma.sessionTransport.count() / pageSize);
  res.json({sessionTransport: sessionTransport, total: total});
});

//get sessionTransport by id
app.get('/api/session-transport/:id', authMiddleware, async (req, res) => {
  const sessionTransport = await prisma.transportCode.findMany({
    where: { sessionTransportId: parseInt(req.params.id) },
  });
  if (!sessionTransport) {
    return res.status(404).json({ error: 'Không tìm thấy phiên' });
  }
  res.json(sessionTransport);
});

//export excel
app.post('/api/export', authMiddleware, async (req, res) => {
  try {
    const ids = req.body.ids
    if (!ids) {
      return res.status(400).json({ error: 'Không có mã vận đơn nào được chọn' });
    }
    const data = await prisma.transportCode.findMany({
    where: {
      sessionTransportId: {
        in: ids,
      },
    },
    });
    res.json(data);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi xuất dữ liệu' });
  } finally {
    await prisma.$disconnect();
  }
});

//tracking transport
app.post('/api/tracking-transport', async (req, res) => {
  const { codes } = req.body;

  if(!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ error: 'Mã vận đơn không hợp lệ' });
  }

  try {
    const transport = await prisma.transportCode.findMany({
      where: { code: { in: codes }   },
      orderBy: [
        { code: "asc" },
        { createdAt: "desc" },
      ],
    });
    
    const totalCodes = codes.length;
    const foundCodes = transport.map(item => item.code);
    const notFoundCodes = codes.filter(code => !foundCodes.includes(code));

    res.json({
      totalCodes,
      totalFoundCodes: totalCodes - notFoundCodes.length,
      totalNotFoundCodes: notFoundCodes.length,
      notFoundCodes,
      transport,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Có lỗi xảy ra khi tìm kiếm vận đơn' });
  } finally {
    await prisma.$disconnect();
  }
});

//system health check
app.get("/api/health", (req, res) => {
  exec("/root/monitoring/system_monitoring.sh 2>/dev/null", (error, stdout) => {
      if (error) {
          return res.status(500).json({ error: "Error executing script" });
      }
      try {
          res.json(JSON.parse(stdout.trim()));
      } catch (err) {
          res.status(500).json({ error: "Invalid JSON output", details: stdout.trim() });
      }
  });
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});