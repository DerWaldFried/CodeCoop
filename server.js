import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const app = express();
const httpserver = createServer(app);
const io = new Server(httpserver);

const __dirname = dirname(fileURLToPath(import.meta.url))

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
})

io.on('connection', (socket) => {
    console.log(`${socket.id} User`);

    let userid = socket.id;
    let userdata = join(__dirname, userid+'data.txt');

    if(fs.existsSync(userdata)){
        fs.readFile(userdata, 'utf8', (err, newCode) => {
            if(err) throw err;
            socket.emit('loadCode', newCode);
        })
    }else{
        fs.readFile(join(__dirname, 'data.txt'), 'utf8', (err,newCode) => {
            if(err) throw err;
            socket.emit('loadCode', newCode);
        });

        fs.writeFile(userdata, '', 'utf8', (err) =>{
            if(err) throw err;
        });
    }

    socket.on('codeChange', (newCode) => {
        fs.writeFile(userdata, newCode, 'utf8', (err) =>{
            if(err) throw err;
        });
        socket.broadcast.emit('codeChange', newCode);
    });
})

httpserver.listen(3000, () => {
    console.log('Server läuft');
});
