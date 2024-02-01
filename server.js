// Ich importiere die benötigten Module.
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Ich erstelle eine neue Express-Anwendung und einen HTTP-Server.
const app = express();
const httpserver = createServer(app);

// Ich erstelle einen neuen Socket.IO-Server, der an den HTTP-Server gebunden ist.
const io = new Server(httpserver);

// Ich bestimme den Pfad des aktuellen Verzeichnisses.
const __dirname = dirname(fileURLToPath(import.meta.url))

// Ich definiere eine Route für GET-Anfragen an die Startseite.
app.get('/', (req, res) => {
    // Ich sende die index.html-Datei als Antwort.
    res.sendFile(join(__dirname, 'index.html'));
})

// Ich höre auf 'connection'-Ereignisse, die ausgelöst werden, wenn ein Client eine Verbindung herstellt.
io.on('connection', (socket) => {
    // Ich protokolliere die ID des verbundenen Benutzers.
    console.log(`${socket.id} User`);

    // Ich bestimme die ID und den Datenpfad des Benutzers.
    let userid = socket.id;
    let userdata = join(__dirname, userid+'data.txt');

    // Ich überprüfe, ob eine Datei für diesen Benutzer existiert.
    if(fs.existsSync(userdata)){
        // Wenn ja, lese ich die Datei und sende den Inhalt an den Client.
        fs.readFile(userdata, 'utf8', (err, newCode) => {
            if(err) throw err;
            socket.emit('loadCode', newCode);
        })
    }else{
        // Wenn nicht, lese ich die Standard-Datei und sende den Inhalt an den Client.
        fs.readFile(join(__dirname, 'data.txt'), 'utf8', (err,newCode) => {
            if(err) throw err;
            socket.emit('loadCode', newCode);
        });

        // Ich erstelle eine neue Datei für diesen Benutzer.
        fs.writeFile(userdata, '', 'utf8', (err) =>{
            if(err) throw err;
        });
    }

    // Ich höre auf 'codeChange'-Ereignisse, die ausgelöst werden, wenn der Client seinen Code ändert.
    socket.on('codeChange', (newCode) => {
        // Ich aktualisiere die Datei des Benutzers mit dem neuen Code.
        fs.writeFile(userdata, newCode, 'utf8', (err) =>{
            if(err) throw err;
        });
        // Ich sende den neuen Code an alle anderen verbundenen Clients.
        socket.broadcast.emit('codeChange', newCode);
    });

    // Ich höre auf 'disconnect'-Ereignisse, die ausgelöst werden, wenn ein Benutzer die Verbindung trennt.
    socket.on('disconnect', () => {
        // Ich speichere den aktuellen Inhalt des Editors in der data.txt-Datei.
        fs.writeFile(join(__dirname, 'data.txt'), editor.getValue(), 'utf8', (err) =>{
            if(err) throw err;
        });
    });
})

// Ich starte den HTTP-Server auf Port 3000.
httpserver.listen(3000, () => {
    // Ich protokolliere eine Nachricht, um anzuzeigen, dass der Server läuft.
    console.log('Server läuft');
});
