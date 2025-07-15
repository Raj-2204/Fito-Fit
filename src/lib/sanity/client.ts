import {createClient} from "@sanity/client"
import imageUrlBuilder from "node_modules/@sanity/image-url"

//Client safe
export const config = {
  projectId: "kt943bpa",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
};

export const client = createClient(config);

const adminConfig ={
    ...config,
    token: process.env.EXPO_PUBLIC_SANITY_API_TOKEN,   
}
export const adminClient = createClient(adminConfig)

const builder = imageUrlBuilder(config);
export const urlFor = (source: string) => builder.image(source)