const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const FILE_PATH = path.join(__dirname, 'productos.txt');

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Método no permitido' }));
        return;
    }

    if (req.method === 'GET') {
        try {
            const data = await fs.readFile(FILE_PATH, 'utf-8');
            const productos = data.trim().split('\n').map(line => {
                const [nombre, precio] = line.split(',');
                return { nombre: nombre.trim(), precio: parseInt(precio.trim()) };
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(productos));
        } catch (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Error leyendo archivo' }));
        }
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const nuevoProducto = JSON.parse(body);
                if (!nuevoProducto.nombre || !nuevoProducto.precio) throw new Error();

                const linea = `\n${nuevoProducto.nombre}, ${nuevoProducto.precio}`;
                await fs.appendFile(FILE_PATH, linea);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Producto agregado' }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'JSON inválido o datos faltantes' }));
            }
        });
    }
});

server.listen(3000, () => console.log('🚀 Servidor de productos en http://localhost:3000'));