import { JSDOM } from 'jsdom';
import https from 'https';

const body = new Promise<string>((resolve, reject) => {
    https.get('https://deriveit.org/coding/problems', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
    }).on('error', reject);
});

const dom = async () => {
    const html = await body;
    return new JSDOM(html).window.document;
}

export default dom();
