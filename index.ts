import fs from 'fs';
import html from './html';
import qs from './query-selectors';

const root = html('https://deriveit.org/coding/problems');

root.then((root) => {
    const contentModules = root.querySelectorAll(qs.content);

    const modules = [];
    const pages = []

    for (let i = 0; i < contentModules.length; i++) {
        const module = contentModules[i];

        const submodulesArr = [];

        const moduleHeading = module.firstChild?.textContent;

        const submodules = module.querySelectorAll(qs.submodule);
        for (let j = 0; j < submodules.length; j++) {
            const chaptersArr = [];

            const submodule = submodules[j];
            const submoduleHeading = submodule.querySelector(qs.submoduleHeading)?.textContent;
            const submoduleHeadingDesc = submodule.querySelector(qs.submoduleHeadingDesc)?.textContent;
            const submoduleHeadingImg = submodule.querySelector(qs.submoduleHeadingImg)?.getAttribute('src');

            const chapters = submodule.querySelectorAll(qs.chapter);
            for (let k = 0; k < chapters.length; k++) {
                const problemsArr = [];

                const chapter = chapters[k];
                const chapterHeading = chapter.firstChild?.textContent;
                const chapterLink = chapter.children[0].querySelector('a')?.getAttribute('href');

                pages.push(chapterLink); // ------- Add chapter link to pages array -------

                const problems = chapter.querySelectorAll(qs.problem);
                for (let l = 1; l < problems.length; l++) { // ---------- 0th position has chapter heading ----------
                    const problem = problems[l];

                    const problemName = problem.querySelector(qs.problemName)?.textContent;
                    const problemLink = problem.querySelector(qs.problemLink)?.getAttribute('href');
                    const isProblemB75 = problem.querySelector(qs.problemInfo)?.textContent?.includes('B75');
                    const problemLevel = problem.querySelector(qs.problemInfo)?.textContent?.toLowerCase().match(/easy|medium|hard/)?.[0];

                    pages.push(problemLink); // ------- Add problem link to pages array -------

                    problemsArr.push({
                        name: problemName,
                        link: problemLink,
                        isB75: isProblemB75,
                        level: problemLevel,
                    })
                }

                chaptersArr.push({
                    heading: {
                        text: chapterHeading,
                        link: chapterLink,
                    },
                    problems: problemsArr,
                })
            }

            submodulesArr.push({
                heading: {
                    text: submoduleHeading,
                    desc: submoduleHeadingDesc,
                    img: submoduleHeadingImg,
                },
                chapters: chaptersArr,
            })
        }

        modules.push({
            heading: moduleHeading,
            submodules: submodulesArr,
        })
    }

    fs.writeFileSync('./content/data.json', JSON.stringify(modules, null, 4));
    fs.writeFileSync('./content/pages.json', JSON.stringify(pages, null, 4));
});
