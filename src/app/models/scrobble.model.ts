export interface Scrobble {
    artist: Album;
    album: Album;
    image: Image[];
    streamable: string;
    date: DateClass;
    url: string;
    name: string;
    mbid: string;
  }

export interface Album {
    mbid: string;
    '#text': string;
}

export interface DateClass {
    uts: string;
    '#text': string;
}

export interface Image {
    size: string;
    '#text': string;
}
