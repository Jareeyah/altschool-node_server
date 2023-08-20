const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'items.json');

let items = [];
try {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  items = JSON.parse(data);
} catch (error) {
  console.error('Error reading items file:', error);
}

function saveItems() {
  fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), err => {
    if (err) {
      console.error('Error writing items file:', err);
    }
  });
}

function createItem(item) {
  item.id = String(items.length + 1);
  items.push(item);
  saveItems();
  return item;
}

function getAllItems() {
  return items;
}

function getOneItem(id) {
  return items.find(item => item.id === id);
}

function updateItem(id, updatedItem) {
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updatedItem };
    saveItems();
    return items[index];
  }
  return null;
}

function deleteItem(id) {
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    const deletedItem = items.splice(index, 1)[0];
    saveItems();
    return deletedItem;
  }
  return null;
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/items') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getAllItems()));
    } else if (req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      const item = getOneItem(itemId);
      if (item) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(item));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Item not found' }));
      }
    }
  } else if (req.method === 'POST') {
    if (req.url === '/items') {
      let body = '';
      req.on('data', chunk => {
        body = body + chunk.toString();
      });
      req.on('end', () => {
        const newItem = JSON.parse(body);
        const createdItem = createItem(newItem);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(createdItem));
      });
    }
  } else if (req.method === 'PUT') {
    if (req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      let body = '';
      req.on('data', chunk => {
        body = body + chunk.toString();
      });
      req.on('end', () => {
        const updatedItem = JSON.parse(body);
        const result = updateItem(itemId, updatedItem);
        if (result) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Item not found' }));
        }
      });
    }
  } else if (req.method === 'DELETE') {
    if (req.url.startsWith('/items/')) {
      const itemId = req.url.split('/')[2];
      const deletedItem = deleteItem(itemId);
      if (deletedItem) {
        res.writeHead(204);
        res.end();
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Item not found' }));
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});