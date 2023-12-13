class CustomAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const handleCatchError = (req, res) => {};

module.exports = { CustomAPIError };
