import axios from "@lib/axios";
import api from "@lib/api";
import Shop from "@models/shop.model";
import Brand from "@models/Brand.model";
import Product from "@models/product.model";
import Service from "@models/service.model";
import Category from "@models/category.model";
import { Banner } from "@models/market-1.model";

const getTopRatedProduct = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/toprated-product");
  return response.data;
};

const getTopRatedBrand = async () => {
  const response = await axios.get("/api/market-1/toprated-brand");
  return response.data;
};

const getNewArrivalList = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/new-arrivals");
  return response.data;
};

const getCarBrands = async (): Promise<Brand[]> => {
  const response = await axios.get("/api/market-1/car-brand-list");
  return response.data;
};

const getCarList = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/car-list");
  return response.data;
};

const getMobileBrands = async (): Promise<Brand[]> => {
  const response = await axios.get("/api/market-1/mobile-brand-list");
  return response.data;
};

const getMobileShops = async (): Promise<Shop[]> => {
  const response = await axios.get("/api/market-1/mobile-shop-list");
  return response.data;
};

const getMobileList = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/mobile-list");
  return response.data;
};

const getOpticsBrands = async (): Promise<Brand[]> => {
  const response = await axios.get("/api/market-1/optics/watch-brands");
  return response.data;
};

const getOpticsShops = async (): Promise<Shop[]> => {
  const response = await axios.get("/api/market-1/optics/watch-shops");
  return response.data;
};

const getOpticsList = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/optics-list");
  return response.data;
};

const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get("/api/market-1/bottom-categories");
  return response.data;
};

const getMoreItems = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/get-more-items");
  return response.data;
};

const getServiceList = async (): Promise<Service[]> => {
  const response = await axios.get("/api/market-1/get-service-list");
  return response.data;
};

const getMainCarousel = async (): Promise<Banner[]> => {
  const response = await api.get("/banners");
  return response.data;
};

const getFlashDeals = async (): Promise<Product[]> => {
  try {
    // Use real API for flash deals
    const response = await api.get("/flash-deals", {
      params: { limit: 10 },
    });
    const flashDeals = response.data.data || [];

    // Transform flash deal data to Product format
    return flashDeals.map((fd: {
      id: string;
      ad: {
        id: string;
        title: string;
        price: number;
        discountedPrice: number | null;
        thumbnail: string | null;
        city: string;
        category?: { id: string; name: Record<string, string>; slug: string };
      };
    }) => {
      // Calculate discount percentage from original price
      const originalPrice = fd.ad.price;
      const discountedPrice = fd.ad.discountedPrice;
      const discount = discountedPrice && originalPrice
        ? Math.round((1 - discountedPrice / originalPrice) * 100)
        : 0;

      // Build thumbnail URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const thumbnail = fd.ad.thumbnail ? `${apiUrl}/api/files/${fd.ad.thumbnail}` : "/assets/images/products/no-image.png";

      return {
        id: fd.ad.id,
        slug: fd.ad.id, // Use id as slug for now
        title: fd.ad.title,
        price: originalPrice, // Original price (shown crossed out)
        salePrice: discountedPrice, // Exact discounted price from DB
        discount, // Discount percentage for badge
        thumbnail,
        images: [thumbnail],
        rating: 4, // Default rating
        categories: [],
      } as Product;
    });
  } catch (error) {
    console.error("Error fetching flash deals:", error);
    // Fallback to mock data if API fails
    const fallbackResponse = await axios.get("/api/market-1/flash-deals");
    return fallbackResponse.data;
  }
};

const getTopCategories = async (): Promise<Category[]> => {
  const response = await axios.get("/api/market-1/top-categories");
  return response.data;
};

const getBigDiscountList = async (): Promise<Product[]> => {
  const response = await axios.get("/api/market-1/big-discounts");
  return response.data;
};

export default {
  getCarList,
  getCarBrands,
  getMoreItems,
  getFlashDeals,
  getMobileList,
  getCategories,
  getOpticsList,
  getServiceList,
  getMobileShops,
  getOpticsShops,
  getMainCarousel,
  getMobileBrands,
  getOpticsBrands,
  getTopCategories,
  getTopRatedBrand,
  getNewArrivalList,
  getBigDiscountList,
  getTopRatedProduct
};
