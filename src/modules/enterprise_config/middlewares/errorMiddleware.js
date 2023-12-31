// src\modules\authentication\middleware\errorMiddleware.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log the error
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  };
  
  export default errorHandler;
  