import axios from "axios";

const API = axios.create({
  baseURL: "https://tt-project-ecommerce.onrender.com"
});

export const getLoggedInUserId = () => localStorage.getItem("userId");

const toNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toUserId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d+$/.test(trimmed)) {
      return Number(trimmed);
    }

    return null;
  }

  return null;
};

export const extractUserIdFromLoginResponse = (data) => {
  if (data === null || data === undefined) {
    return null;
  }

  const directId = toUserId(data);
  if (directId !== null) {
    return directId;
  }

  if (typeof data === "object") {
    const candidateKeys = ["userId", "userid", "userID", "user_id", "id"];

    for (const key of candidateKeys) {
      const parsed = toUserId(data[key]);
      if (parsed !== null) {
        return parsed;
      }
    }

    if (data.user && typeof data.user === "object") {
      for (const key of candidateKeys) {
        const parsed = toUserId(data.user[key]);
        if (parsed !== null) {
          return parsed;
        }
      }

      // Spring wrappers sometimes use nested payload objects.
      if (data.user.data && typeof data.user.data === "object") {
        for (const key of candidateKeys) {
          const parsed = toUserId(data.user.data[key]);
          if (parsed !== null) {
            return parsed;
          }
        }
      }
    }

    if (data.data && typeof data.data === "object") {
      for (const key of candidateKeys) {
        const parsed = toUserId(data.data[key]);
        if (parsed !== null) {
          return parsed;
        }
      }
    }
  }

  return null;
};

const buildAuthPayload = (data = {}) => {
  const email = (data.email || "").trim();
  const name = (data.name || data.username || "").trim();
  const password = data.password || "";

  return {
    ...data,
    email,
    password,
    // Include common alternatives used in Spring DTOs.
    name,
    username: data.username || email || name,
    userName: data.userName || email || name
  };
};

export const registerUser = (data) => API.post("/auth/register", buildAuthPayload(data));
export const loginUser = (data) => API.post("/auth/login", buildAuthPayload(data));

export const getProducts = () => API.get("/products");
export const searchProducts = (keyword) =>
  API.get(`/products/search?keyword=${keyword}`);
export const getProductById = (id) => API.get(`/products/${id}`);
export const addProduct = (data) => API.post("/products/add", data);
export const deleteProduct = async (id) => {
  try {
    return await API.delete(`/products/${id}`);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 405) {
      return API.delete(`/products/delete/${id}`);
    }
    throw err;
  }
};

export const addToCart = (data) => API.post("/cart/add", data);
export const getCart = (userId) => API.get(`/cart/${userId}`);
export const removeFromCart = (id) => API.delete(`/cart/${id}`);

export const placeOrder = (data) => API.post("/orders/place", data);
export const getOrders = (userId) => API.get(`/orders/${userId}`);

export const resolveLineItemTotal = (item = {}) => {
  const quantity = toNumber(item.quantity) || 0;
  const unitPriceCandidates = [
    item.price,
    item.unitPrice,
    item.productPrice,
    item.product?.price
  ];

  for (const candidate of unitPriceCandidates) {
    const unit = toNumber(candidate);
    if (unit !== null) {
      return quantity * unit;
    }
  }

  const lineTotalCandidates = [item.total, item.lineTotal, item.amount, item.subtotal];
  for (const candidate of lineTotalCandidates) {
    const total = toNumber(candidate);
    if (total !== null) {
      return total;
    }
  }

  return 0;
};

export const resolveOrderTotal = (order = {}) => {
  const directTotalCandidates = [
    order.total,
    order.totalAmount,
    order.grandTotal,
    order.orderTotal,
    order.amount
  ];

  for (const candidate of directTotalCandidates) {
    const total = toNumber(candidate);
    if (total !== null) {
      return total;
    }
  }

  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => sum + resolveLineItemTotal(item), 0);
  }

  return 0;
};

export const enrichCartWithProductPrices = async (cartItems = []) => {
  const enriched = await Promise.all(
    cartItems.map(async (item) => {
      if (
        item.price !== undefined ||
        item.unitPrice !== undefined ||
        item.productPrice !== undefined ||
        item.product?.price !== undefined
      ) {
        return item;
      }

      if (!item.productId) {
        return item;
      }

      try {
        const productRes = await getProductById(item.productId);
        const product = productRes?.data;
        if (!product) {
          return item;
        }

        return {
          ...item,
          product,
          unitPrice: product.price
        };
      } catch (err) {
        return item;
      }
    })
  );

  return enriched;
};

export default API;