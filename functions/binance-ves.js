// funciones/binance-rate.js
export async function handler(event) {
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
      rows: 30,
      payTypes: ["SpecificBank"],
    };

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

    const ofertas = data.data
      ?.map((o) => ({
        price: Number(o.adv.price),
        min: Number(o.adv.minSingleTransQuantity),
        max: Number(o.adv.maxSingleTransQuantity),
      }))
      // 👉 mínimo 15, máximo 50
      .filter((o) => o.min <= 50 && o.max >= 15)
      .sort((a, b) => a.price - b.price);

    if (!ofertas || ofertas.length === 0) {
      return {
        statusCode: 404,
        body: "Sin ofertas disponibles",
      };
    }

    // 👉 tercer vendedor (o segundo, o primero)
    const elegido = ofertas[2] ?? ofertas[1] ?? ofertas[0];

    // 👉 sumar +2
    const precioFinal = elegido.price + 2;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
      body: precioFinal.toString(),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Error interno: " + err.message,
    };
  }
}
