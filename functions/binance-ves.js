// funciones/binance-rate.js
export async function handler(event, context) {
  // Solo permitir GET
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: "Método no permitido",
    };
  }

  try {
    const body = {
      asset: "USDT",
      fiat: "VES",
      tradeType: "BUY",
      page: 1,
      rows: 20,
      payTypes: ["Pago Movil"],
    };

    // Llamar a Binance
    const resp = await fetch(
      "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: "Error al obtener datos de Binance",
      };
    }

    const data = await resp.json();

    // Filtrar ofertas
    const ofertas = (data.data || [])
      .map((o) => ({
        price: parseFloat(o.adv.price),
        min: parseFloat(o.adv.minSingleTransQuantity),
        max: parseFloat(o.adv.maxSingleTransQuantity),
      }))
      .filter((o) => o.max >= 15 && o.min <= 100)
      .sort((a, b) => a.price - b.price);

    const mejor = ofertas[1] ?? ofertas[0];
    if (!mejor) {
      return { statusCode: 404, body: "Sin ofertas disponibles" };
    }

    // ⭐ Ajustes solicitados
    const precioAjustado = mejor.price + 100; // tu ajuste original
    const precioFinal = precioAjustado + 2;   // ➕ sumar 2 puntos más

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
      body: precioFinal.toFixed(2),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Error interno: " + err.message,
    };
  }
}
