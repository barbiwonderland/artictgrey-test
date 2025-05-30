import {useOptimisticCart} from '@shopify/hydrogen';
import {Await, Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Common/Aside';
import {CartLineItem} from '~/components/Cart/CartLineItem';
import {ProductProvider, useCart} from '@shopify/hydrogen-react';
import {
  CartLine,
  ComponentizableCartLine,
  Product,
} from '@shopify/hydrogen-react/storefront-api-types';

import {Suspense, useEffect, useRef, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {AiOutlineArrowLeft, AiOutlineArrowRight} from 'react-icons/ai';
import CartRecomendations from './CartRecommendations';
export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  featuredProducts: Promise<Product[] | null> | undefined;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({
  layout,
  cart: originalCart,
  featuredProducts,
}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);
  const {lines, cost, checkoutUrl} = useCart();

  //progress to get free shipping to pass props to progress component
  const [freeShippingProgress, setFreeShipingProgress] = useState(0);

  //price to get for free shipping
  const shippingAmount = 80;

  //cost remainder to get free shipping
  const [remainderFreeShipping, setRemainderFreeShipping] = useState(0);

  const getRemainder = () => {
    if (lines?.length) {
      setRemainderFreeShipping(
        shippingAmount - Number(cost?.subtotalAmount?.amount),
      );
    } else {
      setRemainderFreeShipping(shippingAmount);
    }
  };
  //function tu update progress
  const getProgress = () => {
    if (lines!.length > 0) {
      let costCart = Number(cost?.subtotalAmount?.amount);
      let newProgress = costCart && (costCart / 80) * 100;
      setFreeShipingProgress(newProgress);
    } else {
      setFreeShipingProgress(0);
    }
  };

  useEffect(() => {
    getProgress();
    getRemainder();
  }, [lines]);

  return (
    <div className="h-full w-full overflow-y-auto ">
      {lines!.length < 1 && <CartEmpty hidden={false} layout={layout} />}
      <div className="text-center mt-2 text-black font-bold">
        {freeShippingProgress < shippingAmount
          ? `You are $${remainderFreeShipping.toFixed(2)} away from eligible for free shipping`
          : 'Congratulations! You have free shipping'}
      </div>
      <div className="freeshiping flex justify-around my-4 items-center flex-wrap">
        <div className="">$0</div>
        <ProgressBar value={freeShippingProgress} />
        <div className="">$80</div>
      </div>

      <div className="cart-details flex flex-col bg-[#F6F6F5] gap-2 p-2  max-h-[250px] overflow-y-auto">
        <div aria-labelledby="cart-lines   ">
          <ul>
            {lines &&
              lines.map((line) => (
                <CartLineItem
                  key={line?.id}
                  line={line as CartLine | ComponentizableCartLine}
                  layout={layout}
                />
              ))}
          </ul>
        </div>
        {/* {cartHasItems && <CartSummary cart={cart} layout={layout} />} */}
      </div>
      <div className="carousel-featured">
        {/* <CarouselCards products={featuredProducts}/> */}
        <Suspense>
          <Await resolve={featuredProducts}>
            {(result) => {
              console.log(result, 'productos desde carrito');
              //Swipper
              const swiperRef = useRef<any>(null);

              const handleScrollRight = () => {
                swiperRef.current?.slideNext();
              };

              const handleScrollLeft = () => {
                swiperRef.current?.slidePrev();
              };
              return (
                <>
                  <div className="carousel w-full pt-4  ">
                    {/* <div className="cards w-full flex flex-row flex-nowrap overflow-x-auto  md:gap-8 md:px-0"> */}
                    <div className="titles flex flex-row justify-between  items-center text-center py-2.5">
                      <div className="text font-main text-[18px]">
                        <div className="font-normal font-main ">
                          Enhance Your Performance
                        </div>
                      </div>
                      <div className="arrows flex">
                        <div
                          className="left-arrow h-10 w-10 border-2 border-gray-300 rounded-lg text-center flex justify-center items-center mr-5 hover:bg-black hover:text-white"
                          onClick={handleScrollLeft}
                        >
                          <AiOutlineArrowLeft />
                        </div>
                        <div
                          className="right-arrow h-10 w-10 border-2 border-gray-300 rounded-lg text-center flex justify-center items-center hover:bg-black hover:text-white"
                          onClick={handleScrollRight}
                        >
                          <AiOutlineArrowRight />
                        </div>
                      </div>
                    </div>
                    <Swiper
                      onSlideChange={() => console.log('slide change')}
                      onSwiper={(swiper) => (swiperRef.current = swiper)}
                      simulateTouch={true}
                      className="w-full"
                      direction="horizontal"
                      breakpoints={{
                        375: {
                          slidesPerView: 1.5,
                          spaceBetween: 5,
                        },
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 10,
                        },
                        1024: {
                          slidesPerView: 2,
                          spaceBetween: 5,
                        },
                      }}
                    >
                      {result?.map((product, key) => (
                        <SwiperSlide key={key}>
                          <ProductProvider data={product}>
                            <CartRecomendations />
                          </ProductProvider>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div className="cart-total flex justify-around mt-5 w-full md:mx-4 mx-0 font-main">
                      <div className="subtotal-title  ">
                        <h3 className=" font-medium text-[14px}!">Subtotal</h3>
                        <p className="text-gray-500 text-xs md:text-[14px]">
                          Tax included. Shipping calculated at checkout.
                        </p>
                      </div>
                      <div className="subtotal-price font-medium text-xs md:text-[17px]">
                        ${cost?.totalAmount?.amount}
                      </div>
                    </div>
                    <div className="bg-[#0d0e10] mt-3 text-white md:py-6 py-3.5 flex items-center justify-center rounded-xl w-[90%] mx-auto mb-26">
                      <a
                        className="text-white! font-medium text-xs md:text-[18px] hover:no-underline! hover:font-bold"
                        href={checkoutUrl}
                      >
                        Checkout
                      </a>
                    </div>
                  </div>
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p className="text-center">
        Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
        started!
      </p>
      <br />
    </div>
  );
}

export function ProgressBar({value}: {value: number}) {
  return (
    <>
      <div className="w-[80%] bg-gray-300 rounded-full h-1.5 overflow-hidden">
        <div
          className={`bg-gray-900 h-full transition-all duration-300 ${value === 0 ? 'hidden' : ''}`}
          style={{width: `${value}%`}}
        />
      </div>
    </>
  );
}
