export function badRequest(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: message }),
  };
}

export function forbidden(message: string) {
  return {
    statusCode: 403,
    body: JSON.stringify({ error: message }),
  };
}

export function notFound(message: string) {
  return {
    statusCode: 404,
    body: JSON.stringify({ error: message }),
  };
}

export function serverError(message: string) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: message }),
  };
}

export function tooManyRequests(message: string) {
  return {
    statusCode: 429,
    body: JSON.stringify({ error: message }),
  };
}
