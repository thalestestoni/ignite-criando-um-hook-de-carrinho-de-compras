import { createContext, ReactNode, useContext, useState } from 'react';
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
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: product} = await api.get<Product>(`/products/${productId}`)

      if (!product) {
        toast.error('Produto não encontrado. Não será adicionado ao carrinho.');
      }
      
      const productAmountInStock = await api.get<Stock>(`/stock/${productId}`).then(response => response.data?.amount);

      if (productAmountInStock && productAmountInStock <= 0 ) {
        toast.error('Quantidade solicitada fora de estoque.');
      }

      const productExistsInCart = cart.find(product => product.id === productId);

      if (productExistsInCart) {
        const updatedCart = cart.map(product => {
          if (product.id === productId) {
            product.amount += 1;
          }

          return product;
        });

        return setCart(updatedCart);
      }

      setCart([...cart, {
        ...product, 
        amount: 1
      }]);

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
      // TODO
    } catch {
      // TODO
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
