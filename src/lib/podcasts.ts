import type { Item } from 'podcast'
import he from 'he'
import { parseHTML } from 'linkedom'

const filter = (item) => item.title?.match(/friedman/gi) || item.description?.match(/friedman/gi)

interface Podcast {
	url: string
	filter: (item: Partial<Item>) => boolean
	team?: string
}

export const podcasts: Record<string, Podcast> = {
	'32-thoughts': {
		url: 'https://feeds.simplecast.com/fYqFr5h_',
		filter: (item) => filter(item) || item.description.match(/Elliotte/gi)
	},
	'jeff-marek-show': {
		url: 'https://podcast.sportsnet.ca/shows/hockey-central/feed/podcast/',
		filter
	},
	'tim-and-friends': {
		url: 'https://feeds.simplecast.com/EjXSVgwK',
		filter
	},
	'the-fan-morning-show': {
		url: 'https://podcast.sportsnet.ca/shows/good-show/feed/podcast/',
		filter,
		team: 'TOR'
	},
	'donnie-and-dhali': {
		url: 'https://www.spreaker.com/show/4836063/episodes/feed',
		filter,
		team: 'VAN'
	},
	'oilers-now-bob-stauffer': {
		url: 'https://www.omnycontent.com/d/playlist/fdc2ad13-d199-4e97-b2db-a59300cb6cc2/5f246e03-36fc-496e-ad5f-a5bc0108b5f0/2e927caf-b673-4c33-9ae0-a5bc010933fc/podcast.rss',
		filter,
		team: 'EDM'
	},
	'flames-talk': {
		url: 'https://feeds.simplecast.com/HAqm0QNa',
		filter,
		team: 'CGY'
	},
	'darren-daunic-chase': {
		url: 'https://audioboom.com/channels/5008648.rss',
		filter,
		team: 'NSH'
	},
	'the-instigators': {
		url: 'https://www.omnycontent.com/d/playlist/4b5f9d6d-9214-48cb-8455-a73200038129/00af1d7c-dcc0-49fc-87fe-a92b00371885/92403436-0131-415a-b1b2-a92b00371885/podcast.rss',
		filter,
		team: 'BUF'
	}
}

export function getEpisodesFromXml(xml: string) {
	const { document } = parseHTML(xml)
	const podcastTitle = document.querySelector('channel title')?.innerHTML

	return Array.from(document.querySelectorAll('item')).map((item) => {
		function get(selector: string): string | undefined {
			return sanitizeInnerHtml(item.querySelector(selector)?.innerHTML)
		}

		function addPodcastTitle(text: string) {
			return `[${podcastTitle}] ${text}`
		}

		if (item) {
			const enclosure = item.querySelector('enclosure')

			return {
				title: addPodcastTitle(get('title')),
				author: podcastTitle,
				guid: get('guid'),
				description: get('description'),
				content: get('description'),
				date: get('pubDate'),
				enclosure: enclosure
					? {
							url: enclosure.getAttribute('url')!,
							type: enclosure.getAttribute('type')!,
							size: parseInt(enclosure.getAttribute('length')!)
					  }
					: undefined,
				itunesTitle: addPodcastTitle(get('itunes\\:title')),
				itunesAuthor: get('itunes\\:author'),
				itunesSubtitle: get('itunes\\:subtitle'),
				itunesSummary: get('itunes\\:summary'),
				itunesDuration: get('itunes\\:duration'),
				itunesExplicit: get('itunes\\:explicit') === 'yes',
				itunesImage: get('itunes\\:image')
			}
		}
	})
}

function sanitizeInnerHtml(text: string) {
	if (text) {
		return he.decode(text).replace('<!--[CDATA[', '').replace(']]-->', '')
	}
}
