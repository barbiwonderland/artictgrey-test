import {CgClose} from 'react-icons/cg';

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {Product} from '@shopify/hydrogen/storefront-api-types';
import {useCart} from '@shopify/hydrogen-react';

type AsideType = 'search' | 'cart' | 'mobile' | 'closed' | 'product-detail';
type AsideContextValue = {
  type: AsideType;
  product?: Partial<Product>;
  open: (mode: AsideType, product?: Partial<Product>) => void; //get data optional
  close: () => void;
};

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */

/**Property width its not using by props now, it was set on css */
export function Aside({
  children,
  heading,
  type,
  width,
}: {
  children?: React.ReactNode;
  type: AsideType;
  heading: React.ReactNode;
  width: number | string;
}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const {totalQuantity} = useCart();

  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event: KeyboardEvent) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);
  return (
    <div
      aria-modal
      className={`overlay${expanded ? ' expanded' : ''}`}
      role="dialog"
    >
      <button className="close-outside " onClick={close} />
      <aside>
        <header
          className={
            expanded && type === 'product-detail'
              ? 'border-0! md:h-[30px]! w-full h-full'
              : ''
          }
        >
          <div className="flex items-center ">
            <h3
              className={
                expanded && type === 'cart' ? 'font-medium text-[34px] font-main' : ''
              }
            >
              {heading}
            </h3>
            {expanded && type === 'cart' && (
              <div className="ml-5 cart-badge flex  bg-[#0d0e10] px-1.5  rounded-full text-white justify-center content-center flex-wrap w-9 h-9 text-xl font-medium ">
                {totalQuantity ?? 0}
              </div>
            )}
          </div>

          <button className="close reset " onClick={close} aria-label="Close">
            <CgClose size={24} />
          </button>
        </header>
        <main className="h-full">{children}</main>
      </aside>
    </div>
  );
}

const AsideContext = createContext<AsideContextValue | null>(null);

Aside.Provider = function AsideProvider({children}: {children: ReactNode}) {
  const [type, setType] = useState<AsideType>('closed');
  const [product, setProduct] = useState<Partial<Product> | undefined>();

  const open = (mode: AsideType, product?: Partial<Product>) => {
    setType(mode);
    /**Allow passing by props product details on aside when click a product */
    setProduct(mode === 'product-detail' ? product : undefined);
  };
  const close = () => {
    setType('closed');
    setProduct(undefined);
  };
  return (
    <AsideContext.Provider
      value={{
        type,
        product,
        open,
        close,
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}
