require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("public"));

const PORT = 3000;

app.get("/api/user", async (req, res) => {
  try {
    /* ===== RANDOM USER ===== */
    const userRes = await axios.get("https://randomuser.me/api/");
    const u = userRes.data.results[0];

    const userData = {
      firstName: u.name.first,
      lastName: u.name.last,
      gender: u.gender,
      age: u.dob.age,
      dob: u.dob.date.split("T")[0],
      picture: u.picture.large,
      city: u.location.city,
      country: u.location.country,
      address: `${u.location.street.name} ${u.location.street.number}`
    };

    /* ===== COUNTRY (REST COUNTRIES API) ===== */
    let countryData = {
      name: userData.country,
      capital: "N/A",
      languages: "N/A",
      currency: "USD",
      flag: ""
    };

    try {
      const cRes = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(userData.country)}`
      );

      const c = cRes.data[0];
      const currencyCode = c.currencies
        ? Object.keys(c.currencies)[0]
        : "USD";

      countryData = {
        name: c.name.common,
        capital: c.capital?.[0] || "N/A",
        languages: c.languages
          ? Object.values(c.languages).join(", ")
          : "N/A",
        currency: currencyCode,
        flag: c.flags?.png || ""
      };
    } catch {
      console.log("REST Countries API failed");
    }

    /* ===== EXCHANGE RATE ===== */
    let exchangeData = {
      base: countryData.currency,
      usd: "N/A",
      kzt: "N/A"
    };

    try {
      const exchangeRes = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${countryData.currency}`
      );

      const rates = exchangeRes.data.conversion_rates;

      exchangeData = {
        base: countryData.currency,
        usd: rates.USD ? rates.USD.toFixed(2) : "N/A",
        kzt: rates.KZT ? rates.KZT.toFixed(2) : "N/A"
      };
    } catch {
      console.log("Exchange Rate API failed");
    }

    /* ===== NEWS ===== */
    let newsData = [];

    try {
      const nRes = await axios.get(
        `https://newsapi.org/v2/everything?q=${countryData.name}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
      );

      newsData = nRes.data.articles.map(a => ({
        title: a.title,
        description: a.description,
        image: a.urlToImage,
        url: a.url
      }));
    } catch {
      console.log("News API failed");
    }

    /* ===== RESPONSE ===== */
    res.json({
      user: userData,
      country: countryData,
      exchange: exchangeData,
      news: newsData
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/favicon.ico", (req, res) => res.status(204));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
