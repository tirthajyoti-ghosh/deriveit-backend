import fs from 'fs';
import puppeteer, { Browser } from 'puppeteer';
import qs from './query-selectors';

// const pages = JSON.parse(fs.readFileSync('./content/pages.json', 'utf-8'));

// Promise.all(pages.map(async (page: string) => {
//     const document = await html(`https://www.deriveit.org${page}`);
//     const content = document.querySelector(qs.pageContent)?.innerHTML;
// }));

// html(`https://www.deriveit.org${pages[0]}`).then((document) => {
//     const data = document.querySelector(qs.pageContent + ' > div:first-child');

//     const heading = data?.querySelector('h1');
//     const isConcept = data?.textContent?.includes('Concept');

//     const content = data?.querySelector('article');
// });

let browser: Browser | undefined;

(async () => {
    // Launch the browser and open a new blank page
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto('https://deriveit.org/coding/data-structures/252');

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // wait for '.monaco-editor .view-lines' and print inner html of '#__next > div.width-before-scroll-bar.deriveit-e9zu4n > div > div.deriveit-1sb5885 > div.deriveit-em6nbc'

    await page.waitForSelector('.monaco-editor .view-lines');

    page.on('console', async (msg) => {
        const msgArgs = msg.args();
        for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
        }
    });

    const content = await page.evaluate((qs) => {
        const data = document.querySelector(qs.pageContent);
        const heading = data?.querySelector('h1');
        const isConcept = data?.textContent?.includes('Concept');

        const content = data?.querySelector('article');

        const problemSection = content?.querySelector(qs.problemContent);
        let solutionSection = content?.querySelector(qs.solutionContent);
        
        if (problemSection) content?.removeChild(problemSection);
        if (solutionSection) content?.removeChild(solutionSection);

        solutionSection = solutionSection?.querySelector('div:last-child'); // select the actual solution content

        const children = content?.children;

        if (!children) return;

        let position = 1;

        const getExtractedContent = (children: HTMLCollection) => {
            const contentArr = [];
            for (let i = 0; i < children?.length; i++) {
                const content = {
                    position,
                    type: '',
                    data: '',
                }
        
                if (children[i].classList.value.includes(qs.katexContent.replace('.', ''))) {
                    content['type'] = 'katex';
                    const katexMRow = children[i].querySelector(qs.katexText)?.querySelectorAll('mrow');
                    const katexText: string[] = [];
                    katexMRow?.forEach((mrow) => {
                        if (mrow.children[0] && mrow.children[0].tagName === 'mtext') {
                            let text = '';
                            mrow.querySelectorAll('mtext').forEach((mtext) => {
                                text += mtext.textContent?.replace(/\u00A0/g, " ") || '';
                            });
                            katexText.push(text);
                        }
                    })
                    content['data'] = katexText.join('\n');
                } else if (children[i].classList.value.includes(qs.codeContent.replace('.', ''))) {
                    content['type'] = 'code';
                    let code = '';
                    children[i].querySelector(qs.codeLines)?.childNodes.forEach((node) => {
                        code += node.textContent?.replace(/\u00A0/g, " ") + '\n';
                    });
                    content['data'] = code;
                } else if (children[i].querySelector('img')) {
                    const images = children[i].querySelectorAll('img');
                    images.forEach((image) => {
                        contentArr.push({
                            position,
                            type: 'image',
                            data: image.getAttribute('src') || '',
                        });
                        position++;
                    });
                    
                    continue;
                } else {
                    content['type'] = 'content';
                    content['data'] = children[i].outerHTML;
                }
        
                contentArr.push(content);
                position++;
            }
        
            return contentArr;
        };

        const contentArr = getExtractedContent(children);

        const problemContentArr = problemSection ? getExtractedContent(problemSection.children) : [];
        const solutionContentArr = solutionSection ? getExtractedContent(solutionSection.children) : [];

        return {
            heading: heading?.innerHTML,
            isConcept,
            content: contentArr,
            problem: problemContentArr,
            solution: solutionContentArr,
        };

    }, qs);

    await new Promise((resolve) => {
        resolve(
            fs.writeFileSync('./content/data-structures-252.json', JSON.stringify(content))
        );
    });
})()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        browser?.close();
    });
