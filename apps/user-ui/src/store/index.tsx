import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../actions/track-user';

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishList: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;

  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;

  addToWishList: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;

  removeFromWishList: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any,
  ) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishList: [],

      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart?.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                  : item,
              ),
            };
          }

          if (user?.id && location && deviceInfo) {
            sendKafkaEvent({
              userId: user?.id,
              productId: product.id,
              shopId: product?.shopId,
              action: 'add_to_cart',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo || 'Unknown Device',
            });
          }

          return {
            cart: [...state.cart, { ...product, quantity: product?.quantity }],
          };
        });
      },

      removeFromCart: (id, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => item.id === id);

        if (user?.id && location && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: user?.id,
            productId: removeProduct.id,
            shopId: removeProduct?.shopId,
            action: 'remove_from_cart',
            country: location?.country || 'Unknown',
            city: location?.city || 'Unknown',
            device: deviceInfo || 'Unknown Device',
          });
        }

        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },

      addToWishList: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.wishList?.find(
            (item) => item.id === product.id,
          );
          if (existing) {
            return {
              wishList: state.wishList.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                  : item,
              ),
            };
          }

          if (user?.id && location && deviceInfo) {
            console.log('kfbwjflefnenfwef');
            sendKafkaEvent({
              userId: user?.id,
              productId: product.id,
              shopId: product?.shopId,
              action: 'add_to_wishlist',
              country: location?.country || 'Unknown',
              city: location?.city || 'Unknown',
              device: deviceInfo || 'Unknown Device',
            });
          }

          return {
            wishList: [...state.wishList, { ...product, quantity: product?.quantity }],
          };
        });
      },

      removeFromWishList: (id, user, location, deviceInfo) => {
        const removeProduct = get().wishList.find((item) => item.id === id);
        if (user?.id && location && deviceInfo && removeProduct) {
          sendKafkaEvent({
            userId: user?.id,
            productId: removeProduct.id,
            shopId: removeProduct?.shopId,
            action: 'remove_from_wishlist',
            country: location?.country || 'Unknown',
            city: location?.city || 'Unknown',
            device: deviceInfo || 'Unknown Device',
          });
        }
        set((state) => ({
          wishList: state.wishList.filter((item) => item.id !== id),
        }));
      },
    }),
    { name: 'store-storage' },
  ),
);
