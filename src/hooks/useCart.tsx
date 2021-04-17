import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const { data: product} = await api.get<Product>(`/products/${productId}`);
      
      const productAmountInStock = await api.get<Stock>(`/stock/${productId}`).then(response => response.data.amount);

      if (productAmountInStock <= 0 ) {
        toast.error('Quantidade solicitada fora de estoque.');
        return;
      }

      const productExistsInCart = cart.find(product => product.id === productId);

      let updatedCart;

      if (productExistsInCart) {
        updatedCart = cart.map(product => {
          if (product.id === productId) {
            product.amount += 1;
          }
          
          return product;
        });
      } else {
        updatedCart = [
          ...cart,
          {
            ...product,
            amount: 1
          }
        ]
      }

      setCart(updatedCart);

      api.put(`/stock/${productId}`, { amount: productAmountInStock - 1});

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const cartUpdated = cart.map(product => {
        if (product.id === productId) {
          product.amount = amount;
        }

        return product;
      });

      setCart(cartUpdated);
    } catch {
      toast('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
