import { DataAPIClient } from "@datastax/astra-db-ts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import OpenAI from "openai";
import "dotenv/config";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

const { ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, ASTRA_DB_API_TOKEN, OPENAI_API_KEY } = process.env;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const REData = [
  'https://data.indianarealtors.com/reports/geography/18057/',
  'https://www.redfin.com/county/842/IN/Hamilton-County/housing-market',
  'https://rocket.com/homes/market-reports/in/hamilton-county',
  'https://www.realtor.com/realestateandhomes-search/Hamilton-County_IN/overview',
  'https://fred.stlouisfed.org/series/MEDDAYONMARYY18057',
  'https://the-brokerage.co/2024/06/18/hamilton-county-housing-market-whats-next/',
  'https://www.talktotucker.com/talk/marketwatch/'
];

const client = new DataAPIClient(ASTRA_DB_API_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100
});

const createCollection = async (similarityMetric: SimilarityMetric = 'dot_product') => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric
    }
  });
  console.log(res);
}

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  for await (const url of REData) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
        encoding_format: 'float'
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk
      });
      console.log(res);
    }
  }
}

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true
    },
    gotoOptions: {
      waitUntil: 'domcontentloaded'
    },
    evaluate: async (pageXOffset, browser) => {
      const result = await pageXOffset.evaluate(() => document.body.innerHTML)
      await browser.close();
      return result;
    }
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, '');
}

createCollection().then(() => loadSampleData());
