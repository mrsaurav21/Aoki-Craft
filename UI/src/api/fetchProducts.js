import axios from "axios";
import { API_BASE_URL, API_URLS } from "./constant";

export const getAllProducts = async (categoryId, typeId) => {
    let url = API_BASE_URL + API_URLS.GET_PRODUCTS;

    // ✅ add categoryId only if present
    if (categoryId) {
        url += `?categoryId=${categoryId}`;
    }

    // ✅ add typeId safely
    if (typeId) {
        url += `${categoryId ? "&" : "?"}typeId=${typeId}`;
    }

    try {
        const result = await axios.get(url);
        return result.data || [];
    } catch (err) {
        console.error("Error fetching products:", err);
        return [];
    }
};

export const getProductBySlug = async (slug) => {
    const url = API_BASE_URL + API_URLS.GET_PRODUCTS + `?slug=${slug}`;

    try {
        const result = await axios.get(url);
        return result?.data?.[0];
    } catch (err) {
        console.error("Error fetching product by slug:", err);
        return null;
    }
};
