document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("btn");
  const content = document.getElementById("content");

  button.addEventListener("click", async () => {
    content.innerHTML = "<p>Loading data...</p>";

    try {
      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      const data = await response.json();

      if (!data.user || !data.country || !data.exchange || !data.news) {
        throw new Error("Invalid data structure");
      }

      content.innerHTML = `
        <div class="top-section">
          <div class="card user-card">
            <h2>User</h2>
            <img src="${data.user.picture}" alt="User picture">
            <p><b>Name:</b> ${data.user.firstName} ${data.user.lastName}</p>
            <p><b>Gender:</b> ${data.user.gender}</p>
            <p><b>Age:</b> ${data.user.age}</p>
            <p><b>Date of Birth:</b> ${data.user.dob}</p>
            <p><b>Address:</b> ${data.user.address}, ${data.user.city}, ${data.user.country}</p>
          </div>

          <div class="card country-card">
            <h2>Country</h2>
            ${data.country.flag ? `<img class="flag" src="${data.country.flag}" alt="Flag">` : ""}
            <p><b>Country:</b> ${data.country.name}</p>
            <p><b>Capital:</b> ${data.country.capital}</p>
            <p><b>Languages:</b> ${data.country.languages}</p>
            <p><b>Currency:</b> ${data.country.currency}</p>
          </div>
        </div>

        <div class="card">
          <h2>Exchange Rates</h2>
          <p>1 ${data.exchange.base} = ${data.exchange.usd} USD</p>
          <p>1 ${data.exchange.base} = ${data.exchange.kzt} KZT</p>
        </div>

        <div class="card">
          <h2>News Headlines</h2>
          ${data.news.length === 0 ? "<p>No news available</p>" : ""}
          ${data.news.map(n => `
            <div class="news-item">
              ${n.image ? `<img src="${n.image}" alt="News image">` : ""}
              <div class="news-content">
                <h4>${n.title}</h4>
                <p>${n.description || ""}</p>
                <a href="${n.url}" target="_blank">Read more</a>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    } catch (error) {
      console.error(error.message);
      content.innerHTML =
        "<p style='color:red'>Failed to load data. Please try again.</p>";
    }
  });
});
