import express, { Request, Response } from 'express';

require('dotenv').config();

// import web3middleware, { Web3Middleware } from './contract';
// export interface Web3Request extends Request {
//   web3: Web3Middleware;
// }

const app = express();
app.use(express.json())

// app.use( async (req: Web3Request, res, next) => {
//   req.web3 = await web3middleware();
//   next();
// });

app.get('/', (req: Request, res: Response) => {
  res.send('middleware server');
});

const port = process.env.PORT || '3001';

app.listen(port, () => {
  console.log(`middleware server is listening on port ${port}`);
});
