import express from 'express';

import webhookRoutes from './routes/webhookRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', webhookRoutes);

app.listen(port, () => {
    try {
      console.log(`Listening on port ${port}`);
    } catch (error) {
      console.error(error);
    }
});
