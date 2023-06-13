import React, { useState, useEffect } from "react";
import axios from "axios";
import MainTopHeader from "./MainTopHeader";
import NoMenu from "./Cart_NoMenu";
import Cookies from "js-cookie";
import "../css/Cart.css";

function Cart() {
  const [cartItems, setCartItems] = useState([]); // 메뉴 정보
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false); // 메뉴 옵션 수정 창

  // 메뉴 상세 정보
  const [userId, setUserId] = useState(""); // 장바구니 확인용 user ID
  const [name, setName] = useState(""); // 메뉴 이름
  const [size, setSize] = useState(""); // 메뉴 사이즈
  const [cnt, setCnt] = useState(""); // 메뉴 선택 수량(기본값 1)
  const [price, setPrice] = useState(""); // 메뉴 가격(개당)

  // 메뉴 상세 정보 호출
  const getMenuInfo = async (pizzaId, cartItem) => {
    try {
      const response = await axios.get(`/pizzaInfo/${pizzaId}`);
      const menu = response.data;
      const pizzaInfoItem = {
        id: cartItem.cartId,
        name: menu.pizzaName,
        size: "large",
        cnt: cartItem.count,
        price: menu.largePrice,
      };
      return pizzaInfoItem;
    } catch (error) {
      console.error("Failed to fetch menu info:", error);
      return null;
    }
  };

  // 장바구니 내역 호출
  const getCartList = async () => {
    const userId = Cookies.get("userId");
    try {
      const response = await axios.get(`http://localhost:3001/getCart?userId=${userId}`);
      const cartList = response.data;
      const pizzaInfoList = await Promise.all(cartList.map((cartItem) => getMenuInfo(cartItem.menuId, cartItem)));
      setCartItems(pizzaInfoList.filter(Boolean));
    } catch (error) {
      console.error("Failed to fetch cart list:", error);
    }
  };

  // 페이지에 접속하면 장바구니 내역 호출
  useEffect(() => {
    getCartList();
  }, []);

  // 옵션 변경
  const changOption = (item) => {
    // 기존 선택된 아이템 정보 저장
    setUserId(item.id);
    setName(item.name);
    setSize(item.size);
    setCnt(item.cnt);
    setPrice(item.price);
    setIsOptionModalOpen(true);
  };

  // 메뉴 수량 증가
  const increaseCnt = (item) => {
    const newCartItems = [...cartItems];
    const index = newCartItems.findIndex((cartItem) => cartItem.id === item.id);
    newCartItems[index] = { ...newCartItems[index], cnt: newCartItems[index].cnt + 1 };
    setCartItems(newCartItems);
  };

  // 메뉴 수량 감소
  const decreaseCnt = (item) => {
    const newCartItems = [...cartItems];
    const index = newCartItems.findIndex((cartItem) => cartItem.id === item.id);
    if (newCartItems[index].cnt > 1) {
      newCartItems[index] = { ...newCartItems[index], cnt: newCartItems[index].cnt - 1 };
      setCartItems(newCartItems);
    }
  };

  // 메뉴 리스트 추가
  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  // 메뉴 리스트 삭제
  const removeFromCart = (item) => {
    const newCartItems = cartItems.filter((cartItem) => cartItem.id !== item.id);
    setCartItems(newCartItems);
  };

  // 주문 후 장바구니 초기화
  const clearCart = () => {
    alert("주문이 완료되었습니다.");
    setCartItems([]);
  };

  const saveCartItems = async () => {
    try {
      const response = await axios.post("api/cart", { cartItems });
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page">
      {/* <MainTopHeader /> */}
      {/* 네비게이션 */}

      <div className="content">
        <div className="header">
          <h1>장바구니</h1>
        </div>

        {cartItems.length === 0 ? (
          <NoMenu /> // if(No menu)
        ) : (
          // if(menu)
          <div className="cartList">
            <div className="column">
              <ul className="attribute">
                <li id="A">메뉴</li>
                <li id="B">수량</li>
                <li id="C">가격</li>
                <li id="D">변경</li>
                <li id="E">삭제</li>

                {/* 메뉴 리스트 */}
                {cartItems.map((item) => (
                  <li key={item.id}>
                    <div className="menuPic"></div>
                    <div className="menuInfo">
                      <li id="menuName">{item.name}</li>
                      <li id="menuSize">{item.size}</li>
                      <button className="changeOpt" onClick={() => changOption(item)}>
                        옵션변경
                      </button>
                    </div>

                    <div className="menuN">
                      <button className="decrease" onClick={() => decreaseCnt(item)} id="cntBtn">
                        -
                      </button>
                      <div className="menuCnt">{item.cnt}</div>
                      <button className="increase" onClick={() => increaseCnt(item)} id="cntBtn">
                        +
                      </button>
                    </div>

                    <div className="menuP">
                      <div className="menuPrice">{item.price}</div>
                    </div>

                    <button className="save" onClick={() => saveCartItems()}>
                      변경저장
                    </button>
                    <button className="delete" onClick={() => removeFromCart(item)}>
                      X
                    </button>
                  </li>
                ))}
                {/* Menu */}
              </ul>
            </div>

            <div className="selected_info"></div>
            <div className="information">
              <div className="total">합계</div>
              <div className="totalPrice">
                {`${cartItems.reduce((accumulator, item) => accumulator + item.price * item.cnt, 0)}`}
                <span>원</span>
              </div>
            </div>

            <div className="order">
              <button className="order_btn" onClick={clearCart}>
                주문하기
              </button>
            </div>
          </div>
        )}
        {/* Cart */}
      </div>
    </div>
  ); //return
} // function

export default Cart;
