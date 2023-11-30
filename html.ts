import { JSDOM } from 'jsdom';
import https from 'https';

async function html(url: string) {   
    const body = new Promise<string>((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
    
    return new JSDOM(await body).window.document;
}

export default html;
