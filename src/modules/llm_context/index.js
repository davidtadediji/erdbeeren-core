// src\modules\llm_context\index.js
import express from 'express';
import fileRoutes from './routes/fileRoutes.js';
import cors from 'cors';
import errorMiddleware from './middleware/errorMiddleware.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

const PORT = process.env.PORT || 3000;


app.use('/files', fileRoutes);
app.use(errorMiddleware); // Use the error handling middleware

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
