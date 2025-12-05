export async function handler(event, context) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
    body: "ACTUALIZACIÓN EXITOSA - v1",
  };
}
