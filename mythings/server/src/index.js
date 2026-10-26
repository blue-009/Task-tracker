import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { auth } from './auth.js';
import authR from './routes/auth.js';
import meR from './routes/me.js';
import itemsR from './routes/items.js';
import journalR from './routes/journal.js';
import filesR from './routes/files.js';

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '4mb' }));

app.use('/api/auth', authR);
app.use('/api/me', auth, meR);
app.use('/api/items', auth, itemsR);
app.use('/api/journal', auth, journalR);
app.use('/api/files', auth, filesR);

app.use((e, req, res, next) => { console.error(e); res.status(500).json({ error: 'Server error.' }); });
app.listen(process.env.PORT || 4000, () => console.log('API ready'));
