export interface NewsType {
  _id: string;
  web_url: string;
  abstract: string;
  pub_date: string;
  multimedia: MultimediaType[];
  source: string;
  headline: {
    main: string;
  };
}

export interface MultimediaType {
  url: string;
}