export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    /* 
      The stack trace will be captured starting from the line where AppError was created,
      and it will exclude the AppError constructor from the stack.
      This makes the stack trace cleaner and more useful,
      because it hides the internals of the custom error class
      and focuses on where in your app the error occurred.
    */
  }
}