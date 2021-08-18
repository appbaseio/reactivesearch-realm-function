import express from 'express';
import cors from 'cors';

import { Realm } from './';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.post(`/_reactivesearch`, (req, res) => {
	res.status(200).send({
		data: req.body,
	});
});

app.post(`/_reactivesearch/validate`, (req, res) => {
	const ref = new Realm({ url: `` });

	res.status(200).send({
		aggPipeline: ref.query(req.body.query),
	});
});

app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
