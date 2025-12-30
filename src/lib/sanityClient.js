// lib/sanityClient.js
import  { createClient }  from '@sanity/client';
import imageUrlBuilder from "@sanity/image-url";

const sanityClient = createClient({
  projectId: "dc7bo6bv", 
  dataset: "production",
  apiVersion: "2025-05-23", 
  token: "",
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);

// This returns the builder object, which has `.url()` function
export const urlFor = (source) => builder.image(source);

export default sanityClient;
