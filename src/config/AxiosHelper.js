import axios from "axios";
export const baseURL = "https://hush-txhq.onrender.com";
export const httpClient = axios.create({
  baseURL: baseURL,
});
