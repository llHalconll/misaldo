export async function handler(event) {
  // ✅ Permitir CORS desde cualquier origen (puedes restringir luego a tu dominio)
  const headers = {
    "Access-Control-Allow-Origin": "*", // o "https://droxpay.com"
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // ✅ Responder las solicitudes preflight (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "CORS preflight OK",
    };
  }

  // ✅ Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // Validar campos requeridos
    if (!body.asset || !body.fiat || !body.tradeType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Solicitud inválida" }),
      };
    }

    // Enviar la solicitud a Binance
    const resp = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers,
        body: JSON.stringify({ error: "Error al obtener datos de Binance" }),
      };
    }

    const data = await resp.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
