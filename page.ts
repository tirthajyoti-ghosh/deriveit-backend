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
    await page.goto('https://deriveit.org/coding/recursion/151', {
        waitUntil: "domcontentloaded",
    });

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    if (await page.$(qs.codeContent)) {
        await page.waitForSelector('.monaco-editor .view-lines');
    }

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

        if (!content?.children) return;

        const flattenSubsections = (section: Element) => {
            const subsection = section?.querySelector(qs.subsection);
            if (subsection) {
                flattenSubsections(subsection);
            }

            const children = Array.from(section.children);
            for (let child of children) {
                section.parentNode?.insertBefore(child, section);
            }

            return section.parentNode?.children;
        }

        let position = 1;

        const getExtractedContent = (children: HTMLCollection) => {
            const contentArr: { position: number, type: string, data: string }[] = [];
            for (let i = 0; i < children?.length; i++) {
                const content = {
                    position,
                    type: '',
                    data: '',
                }

                const isKatexSection = children[i].classList.value.includes(qs.katexContent.replace('.', ''));
                const isCodeSection = children[i].classList.value.includes(qs.codeContent.replace('.', ''));
                const isSpoilerSection = children[i].classList.value.includes(qs.spoilerSection.replace('.', ''));
                const isImageSection = children[i].querySelector('img');

                if (isKatexSection) {
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
                } else if (isCodeSection) {
                    content['type'] = 'code';
                    let code = '';
                    children[i].querySelector(qs.codeLines)?.childNodes.forEach((node) => {
                        code += node.textContent?.replace(/\u00A0/g, " ") + '\n';
                    });
                    content['data'] = code;
                } else if (isSpoilerSection) {
                    const spoilerContent = children[i].querySelector(qs.spoilerContent);
                    const spoilerContentArr = spoilerContent ? getExtractedContent(spoilerContent.children) : [];
                    contentArr.push(...spoilerContentArr);
                    continue;
                } else if (isImageSection) {
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
                    const katexSpans = children[i].querySelectorAll(qs.inlineKatex);
                    katexSpans.forEach((span) => {
                        const katexSpan = document.createElement('span');
                        katexSpan.className = 'katex';
                        katexSpan.textContent = span.querySelector('.katex-html')?.textContent?.replace(/\u00A0/g, " ") || '';

                        span.parentNode?.replaceChild(katexSpan, span);
                    });
                    content['data'] = children[i].outerHTML.replace(/\u00A0/g, " ");
                }

                contentArr.push(content);
                position++;
            }

            return contentArr;
        };

        const subsection = content.querySelector(qs.subsection);
        const contentArr = subsection
            ? getExtractedContent((flattenSubsections(subsection)) as HTMLCollection)
            : getExtractedContent(content?.children);

        const problemSubsection = problemSection?.querySelector(qs.subsection);
        const problemContentArr = problemSubsection
            ? getExtractedContent((flattenSubsections(problemSubsection)) as HTMLCollection)
            : problemSection
                ? getExtractedContent(problemSection.children)
                : [];

        const solutionSubsection = solutionSection?.querySelector(qs.subsection);
        const solutionContentArr = solutionSubsection
            ? getExtractedContent((flattenSubsections(solutionSubsection)) as HTMLCollection)
            : solutionSection
                ? getExtractedContent(solutionSection.children)
                : [];

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
            fs.writeFileSync('./content/recursion-151.json', JSON.stringify(content))
        );
    });
})()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        browser?.close();
    });
