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

    let countryData = {
      name: userData.country,
      capital: "N/A",
      languages: "N/A",
      currency: "USD",
      flag: ""
    };

    try {
      const cRes = await axios.get(
        `http://api.countrylayer.com/v2/name/${userData.country}?access_key=${process.env.COUNTRY_API_KEY}`
      );

      if (Array.isArray(cRes.data) && cRes.data.length > 0) {
        const c = cRes.data[0];
        countryData = {
          name: c.name,
          capital: c.capital || "N/A",
          languages: c.languages?.map(l => l.name).join(", ") || "N/A",
          currency: c.currencies?.[0]?.code || "USD",
          flag: c.flag || ""
        };
      }
    } catch {
      console.log("Country API failed");
    }

    let exchangeData = {
      base: countryData.currency,
      usd: "N/A",
      kzt: "N/A"
    };

    try {
      const exchangeRes = await axios.get(
        `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${countryData.currency}`
      );

      exchangeData = {
        base: countryData.currency,
        usd: exchangeRes.data.conversion_rates.USD,
        kzt: exchangeRes.data.conversion_rates.KZT
      };
    } catch (error) {
      console.log("Exchange Rate API failed");
    }

    let newsData = [];

    try {
      const nRes = await axios.get(
        `https://newsapi.org/v2/everything?q=${userData.country}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
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

    /* ===== FINAL RESPONSE ===== */
    res.json({
      user: userData,
      country: countryData,
      exchange: exchangeData,
      news: newsData
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
