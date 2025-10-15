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
    const body = {
      asset: "USDT",
      fiat: "COP",
      tradeType: "BUY",
      page: 1,
      rows: 20,
      payTypes: ["Nequi"],
    };

    // Llamar a Binance
    const resp = await fetch("https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      return { statusCode: resp.status, body: "Error al obtener datos de Binance" };
    }

    const data = await resp.json();

    // Filtrar ofertas válidas (al menos 15 USDT)
    const ofertas = (data.data || [])
      .map(o => ({
        price: parseFloat(o.adv.price),
        min: parseFloat(o.adv.minSingleTransQuantity),
        max: parseFloat(o.adv.maxSingleTransQuantity),
      }))
      .filter(o => o.max >= 15 && o.min <= 100)
      .sort((a, b) => a.price - b.price);

    const mejor = ofertas[1] ?? ofertas[3];
    if (!mejor) {
      return { statusCode: 404, body: "Sin ofertas disponibles" };
    }

    // Solo devolver el número puro
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
      body: mejor.price.toString(),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Error interno: " + err.message,
    };
  }
}

