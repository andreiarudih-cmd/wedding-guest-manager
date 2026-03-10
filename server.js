const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DB_PATH = path.join(__dirname, 'data', 'guests.json');

function readDB() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ guests: [], event: {
      name: "Casamento Ana & Bruno",
      date: "2025-11-15",
      time: "18:00",
      location: "Espaço Villa Jardim",
      address: "Rua das Flores, 123 - São Paulo, SP",
      mapsUrl: "https://maps.google.com/?q=Rua+das+Flores+123+São+Paulo",
      story: "Nos conhecemos numa tarde de outubro de 2019, numa livraria cheia de histórias esperando para serem vividas. Desde então, cada dia ao lado um do outro virou a nossa história favorita.",
      cover: ""
    }}), null, 2);
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
};

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function generateCSV(guests) {
  const header = 'ID,Nome,Telefone,Acompanhantes,Restrição Alimentar,Confirmado,Check-in,Horário de Entrada\n';
  const rows = guests.map(g =>
    `"${g.id}","${g.name}","${g.phone}","${g.companions}","${g.dietary || ''}","${g.confirmed ? 'Sim' : 'Não'}","${g.checkin ? 'Sim' : 'Não'}","${g.checkinTime || ''}"`
  ).join('\n');
  return header + rows;
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  if (pathname === '/api/event' && method === 'GET') {
    const db = readDB();
    return json(res, db.event);
  }

  if (pathname === '/api/event' && method === 'PUT') {
    const body = await parseBody(req);
    const db = readDB();
    db.event = { ...db.event, ...body };
    writeDB(db);
    return json(res, { ok: true, event: db.event });
  }

  if (pathname === '/api/guests' && method === 'GET') {
    const db = readDB();
    return json(res, db.guests);
  }

  if (pathname === '/api/guests' && method === 'POST') {
    const body = await parseBody(req);
    if (!body.name || !body.phone) return json(res, { error: 'Nome e telefone obrigatórios' }, 400);
    const db = readDB();
    const guest = {
      id: generateId(),
      name: body.name.trim(),
      phone: body.phone.trim(),
      companions: parseInt(body.companions) || 0,
      dietary: body.dietary?.trim() || '',
      confirmed: true,
      checkin: false,
      checkinTime: null,
      createdAt: new Date().toISOString()
    };
    db.guests.push(guest);
    writeDB(db);
    return json(res, { ok: true, guest });
  }

  if (pathname === '/api/checkin' && method === 'POST') {
    const body = await parseBody(req);
    if (!body.id) return json(res, { error: 'ID obrigatório' }, 400);
    const db = readDB();
    const guest = db.guests.find(g => g.id === body.id);
    if (!guest) return json(res, { ok: false, status: 'not_found', message: 'Convidado não encontrado' }, 404);
    if (guest.checkin) return json(res, { ok: false, status: 'duplicate', message: 'Convidado já realizou check-in', guest });
    guest.checkin = true;
    guest.checkinTime = new Date().toLocaleString('pt-BR');
    writeDB(db);
    return json(res, { ok: true, status: 'success', message: 'Check-in realizado com sucesso!', guest });
  }

  if (pathname.startsWith('/api/guests/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    const db = readDB();
    db.guests = db.guests.filter(g => g.id !== id);
    writeDB(db);
    return json(res, { ok: true });
  }

  if (pathname.startsWith('/api/guests/') && pathname.endsWith('/reset-checkin') && method === 'PUT') {
    const id = pathname.split('/')[3];
    const db = readDB();
    const guest = db.guests.find(g => g.id === id);
    if (!guest) return json(res, { error: 'Not found' }, 404);
    guest.checkin = false;
    guest.checkinTime = null;
    writeDB(db);
    return json(res, { ok: true, guest });
  }

  if (pathname === '/api/stats' && method === 'GET') {
    const db = readDB();
    const total = db.guests.length;
    const confirmed = db.guests.filter(g => g.confirmed).length;
    const checkedIn = db.guests.filter(g => g.checkin).length;
    const totalPeople = db.guests.reduce((s, g) => s + 1 + g.companions, 0);
    const checkedInPeople = db.guests.filter(g => g.checkin).reduce((s, g) => s + 1 + g.companions, 0);
    return json(res, { total, confirmed, checkedIn, notShown: confirmed - checkedIn, totalPeople, checkedInPeople });
  }

  if (pathname === '/api/export' && method === 'GET') {
    const db = readDB();
    const csv = generateCSV(db.guests);
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="convidados.csv"'
    });
    return res.end('\uFEFF' + csv);
  }

  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'index.html');
  } else if (pathname === '/checkin' || pathname === '/checkin.html') {
    filePath = path.join(__dirname, 'checkin.html');
  } else if (pathname === '/admin' || pathname === '/admin.html') {
    filePath = path.join(__dirname, 'admin.html');
  } else if (pathname === '/rsvp' || pathname === '/rsvp.html') {
    filePath = path.join(__dirname, 'rsvp.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      return res.end('<h1>404 - Página não encontrada</h1>');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n💒 Sistema de Casamento rodando em http://localhost:${PORT}`);
  console.log(`   🏠 Site:    http://localhost:${PORT}/`);
  console.log(`   📋 RSVP:    http://localhost:${PORT}/rsvp`);
  console.log(`   📷 Check-in: http://localhost:${PORT}/checkin`);
  console.log(`   📊 Admin:   http://localhost:${PORT}/admin\n`);
});
