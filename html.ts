import { JSDOM } from 'jsdom';
import axios from 'axios';

async function html(url: string) {   
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
    });
    
    const dom = new JSDOM(response.data);
    return dom.window.document;
}

export default html;
