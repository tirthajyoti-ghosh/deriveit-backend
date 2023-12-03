import fs from 'fs';
import html from './html';
import qs from './query-selectors';

const pages = JSON.parse(fs.readFileSync('./content/pages.json', 'utf-8'));

// Promise.all(pages.map(async (page: string) => {
//     const document = await html(`https://www.deriveit.org${page}`);
//     const content = document.querySelector(qs.pageContent)?.innerHTML;
// }));

html(`https://www.deriveit.org${pages[0]}`).then((document) => {
    const data = document.querySelector(qs.pageContent + ' > div:first-child');

    const heading = data?.querySelector('h1');
    const isConcept = data?.textContent?.includes('Concept');

    const content = data?.querySelector('article');
});
