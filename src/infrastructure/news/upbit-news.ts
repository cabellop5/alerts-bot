import { News } from "../../domain/news";
import axios from 'axios'

export const upbitNews = async (): Promise<Array<News>> => {
    const result = []

    try {
        const url = 'https://api-manager.upbit.com/api/v1/announcements?os=web&page=1&per_page=20&category=trade'
        const response = await axios.get(url, {headers: {'Accept-Language': 'en-KR, en;q=1, es-ES;q=0.1'}})

        for (const article of response.data.data.notices) {
            if (article.title.includes('New digital asset')) {
                result.push({
                    title: article.title,
                    code: article.id,
                    source: 'UPBIT',
                    url: `https://upbit.com/service_center/notice?id=${article.id}`,
                })
            }
        }
    } catch (error) {}

    return result
}