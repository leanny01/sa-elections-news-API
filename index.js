const PORT = 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const news_sources = [
  {
    name: "Aljazeera",
    address: "https://www.aljazeera.com/search/south%20africa%20elections",
    base: "",
  },
  {
    name: "IOL",
    address: "https://www.iol.co.za/tags/elections",
    base: "https://www.iol.co.za",
  },
  {
    name: "The conversation",
    address:
      "https://theconversation.com/africa/search?q=south+africa+election&sort=relevancy&language=en&date=week&date_from=&date_to=",
    base: "",
  },
  {
    name: "Brookings",
    address:
      "https://www.brookings.edu/search/?s=south+africa+election&post_type%5B%5D=&topic%5B%5D=&pcp=&date_range=&start_date=&end_date=",
    base: "",
  },
  {
    name: "Businesstech",
    address: "https://businesstech.co.za/news/?s=south+africa+election",
    base: "",
  },
];
let highligts = [];

news_sources.forEach((source) => {
  axios.get(source.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("elections")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      highligts.push({
        title,
        url: source.base + url,
        source: source.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json(`Welcome to my news API`);
});
app.get("/news/:sourcename", async (req, res) => {
  const req_source_name = req.params.sourcename;
  const news_source = news_sources.filter(
    (source) =>
      source.name.toLocaleLowerCase() == req_source_name.toLocaleLowerCase()
  )[0]; 
  const news_source_address = news_source.address;
  const news_source_base = news_source.base;
  const news_source_name = news_source.name;
  const article = [];

  await axios.get(news_source_address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("elections")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      article.push({
        title,
        url: news_source_base + news_source_address,
        source: news_source_name,
      });
    });
  });
  res.json(article || "Nothing returned");
});
app.get("/news", (req, res) => {
  res.json(highligts);
});
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
