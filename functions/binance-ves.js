// funciones/binance-rate.js
export async function handler(event, context) {
  // Solo permitir método GET
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Método no permitido",
    };
  }

  try {
    // Cuerpo de la petición a Binance
    const body = {
      asset: "USDT",
      fiat: "VES",
      tradeType: "BUY",
      page: 1,
      rows: 20,
      payTypes: ["SpecificBank"],
    };

    // Solicitud a Binance
    const resp = await fetch(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      return { statusCode: resp.status, body: "Error al obtener datos de Binance" };
    }

    const data = await resp.json();

    // Tomar ofertas válidas (mínimo 15 USDT)
    const ofertas = (data.data || [])
      .map(o => ({
        price: parseFloat(o.adv.price),
        min: parseFloat(o.adv.minSingleTransQuantity),
        max: parseFloat(o.adv.maxSingleTransQuantity),
      }))
      .filter(o => o.max >= 15)  // permite comprar 15 USDT
      .sort((a, b) => a.price - b.price);

    // Seleccionar el tercer comprador (index 2)
    const tercer = ofertas[2];

    if (!tercer) {
      return {
        statusCode: 404,
        body: "Sin ofertas suficientes (no hay tercer vendedor)",
      };
    }

    // Sumarle +2 puntos como pediste
    const tasaFinal = tercer.price + 2;

    // Devolver SOLO el número en texto
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
      body: tasaFinal.toString(),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Error interno: " + err.message,
    };
  }
}

