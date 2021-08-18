import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.get(`/reactivesearch`, (req, res) => {
  console.log({p: req.params});
	res.status(200).send({
		success: true,
    p: req.params,
	});
});

app.listen(PORT, () => {
	console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
