const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const sources = {
    testing: [
        'https://software-testing.ru/',
        'https://habr.com/ru/hub/it_testing/',
        'https://habr.com/ru/hub/web_testing/',
        'https://habr.com/ru/hub/game_testing/',
        'https://habr.com/ru/hub/mobile_testing/',
        'https://www.lambdatest.com/blog/',
        'https://www.softwaretestinghelp.com/',
    ],
    development: [
        'https://habr.com/ru/hub/css/',
        'https://habr.com/ru/hub/devops/',
        'https://habr.com/ru/hub/javascript/',
        'https://habr.com/ru/hub/reactjs/',
        'https://habr.com/ru/hub/algorithms/',
        'https://habr.com/ru/hub/infosecurity/',
        'https://habr.com/ru/hub/crypto/',
        'https://habr.com/ru/hub/webdev/',
    ],
    crypto: [
        'https://habr.com/ru/hub/cryptocurrency/',
        'https://ru.investing.com/',
    ],
    itNews: [
        'https://itel.am/am',
        'https://www.techcult.ru/',
        'https://tproger.ru/',
        'https://proglib.io/',
        'https://habr.com/ru/all/',
        'https://habr.com/ru/news/',
    ],
};

const app = express();
const port = 3000;

const getWebsiteContent = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error occurred while fetching data from ${url}: ${error}`);
    }
};

const extractHeadings = async (url) => {
    const content = await getWebsiteContent(url);
    const $ = cheerio.load(content);
    const headings = new Set();

    $('h1, h2, h3, h4, h5, h6').each((index, element) => {
        const childAnchor = $(element).find('a');
        const link = childAnchor.length ? childAnchor.attr('href') : null;
        const text = $(element).text();
        if (text) {
            headings.add({
                text: text,
                link: link ? new URL(link, url).href : null,
            });
        }
    });

    return Array.from(headings);
};

app.get('/', async (req, res) => {
    let allHeadings = [];
    for (const category in sources) {
        for (const url of sources[category]) {
            const headings = await extractHeadings(url);
            allHeadings = [...allHeadings, ...headings];
        }
    }

    let html = '';
    allHeadings.forEach(heading => {
        html += `<h2>`;
        if (heading.link) {
            html += `<a href="${heading.link}">${heading.text}</a>`;
        }
        html += '</h2>';
    });

    res.send(html);
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// extractHeadings(sources[0]).then(headings => console.log(headings));
