import axios from "axios";

const sportmonksAxios = axios.create({
  baseURL: "https://api.sportmonks.com/v3/football",
  params: {
    api_token: import.meta.env.VITE_SPORTMONKS_API_KEY,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export default sportmonksAxios;
