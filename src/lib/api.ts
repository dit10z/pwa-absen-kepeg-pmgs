import axios from "axios";

const api = axios.create({
  baseURL: "/tirta-wibawa-mukti/kepegawaian-api",
    // withCredentials: true,
});

const apiPrivate = axios.create({});

export default api;
