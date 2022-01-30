import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import queryString from "query-string";
import cryptoSrc from "./json/cryptoIcon.json";

function Finance() {
  //queryString
  const location = useLocation();
  const navigation = useNavigate();
  const { search = "" } = queryString.parse(location.search);
  //table
  const [currency, setCurrency] = useState([]);
  const [defaultCurrency, setDefaultCurrency] = useState([]);
  const [searchTerm, setSearchTerm] = useState(search);
  const [sortCol, setSortCol] = useState();
  const [order, setOrder] = useState("DEF");
  const [favorite, setFavorite] = useState([]);
  const [marketDisplay, setMarketDisplay] = useState("USDT");
  // calc
  const [baseCurrency, setBaseCurrency] = useState();
  const [quoteCurrency, setQuoteCurrency] = useState();
  const [uniqBaseCurrency, setUniqBaseCurrency] = useState([]);
  const [uniqQuoteCurrency, setUniqQuoteCurrency] = useState([]);
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState("BTC");
  const [selectedQuoteCurrency, setSelectedQuoteCurrency] = useState("USDT");
  const [reverseIcon, setReverseIcon] = useState(false);
  //Ref
  const searchRef = useRef(null);

  // currency.map((item) => {
  //   const mapitem = item
  // })
  // const temp = cryptoSrc.filter(item => item["symbol"] === mapItem["baseAsset"] )

  const sorting = (obj1, obj2) => {
    setSortCol(obj2);
    if (sortCol === obj2) {
      if (obj1 === "stats") {
        if (order === "DEF") {
          const sorted = currency.sort((a, b) =>
            Number(a[obj1][obj2]) > Number(b[obj1][obj2]) ? 1 : -1
          );
          setCurrency(sorted);
          setOrder("ASC");
        } else if (order === "ASC") {
          const sorted = currency.sort((a, b) =>
            Number(a[obj1][obj2]) < Number(b[obj1][obj2]) ? 1 : -1
          );
          setCurrency(sorted);
          setOrder("DSC");
        } else {
          const sorted = defaultCurrency;
          setCurrency(sorted);
          setOrder("DEF");
        }
      } else {
        if (order === "DEF") {
          const sorted = currency.sort((a, b) => (a[obj1] > b[obj1] ? 1 : -1));
          setCurrency(sorted);
          setOrder("ASC");
        }
        if (order === "ASC") {
          const sorted = currency.sort((a, b) => (a[obj1] < b[obj1] ? 1 : -1));
          setCurrency(sorted);
          setOrder("DSC");
        }
        if (order === "DSC") {
          const sorted = defaultCurrency;
          setCurrency(sorted);
          setOrder("DEF");
        }
      }
    } else if (obj1 === "stats") {
      const sorted = currency.sort((a, b) =>
        Number(a[obj1][obj2]) > Number(b[obj1][obj2]) ? 1 : -1
      );
      setCurrency(sorted);
      setOrder("ASC");
    } else {
      const sorted = currency.sort((a, b) => (a[obj1] > b[obj1] ? 1 : -1));
      setCurrency(sorted);
      setOrder("ASC");
    }
  };

  useEffect(() => {
    axios
      .get("https://api.wallex.ir/v1/markets")
      .then((res1) => Object.values(res1.data.result.symbols))
      // .then((res2) =>
      //   res2.map((item) => {
      //     item["isFavorite"] = false;
      //     return item;
      //   })
      // )
      .then((res3) => setCurrency(res3))
      .catch((e) => console.log(e));
    searchRef.current.focus();
  }, []);

  useEffect(() => {
    setDefaultCurrency([...currency]);

    const quoteSeen = new Set();
    const filteredQuoteCurrency = currency.filter((el) => {
      const duplicate = quoteSeen.has(el["quoteAsset"]);
      quoteSeen.add(el["quoteAsset"]);
      return !duplicate;
    });
    setUniqQuoteCurrency(filteredQuoteCurrency);

    const baseSeen = new Set();
    const filteredBaseCurrency = currency.filter((el) => {
      const duplicate = baseSeen.has(el["baseAsset"]);
      baseSeen.add(el["baseAsset"]);
      return !duplicate;
    });
    setUniqBaseCurrency(filteredBaseCurrency);
  }, [currency]);

  useEffect(() => {
    let url = {
      search: searchTerm ? searchTerm : undefined,
    };
    const urlStringfy = queryString.stringify(url);
    navigation(`?${urlStringfy}`);
  }, [searchTerm]);

  function convertToQuote(baseCrncy) {
    const baseCurrencyThatShouldConvert = currency.filter((item) => {
      return (
        item["baseAsset"] === selectedBaseCurrency &&
        item["quoteAsset"] === selectedQuoteCurrency
      );
    });
    if (baseCrncy !== 0) {
      setQuoteCurrency(
        baseCrncy *
          Number(baseCurrencyThatShouldConvert[0]["stats"]["bidPrice"])
      );
    }
  }

  // useEffect(() => {
  //   setConvertPermission(true);
  //   if (convertPermission === true) {
  //     convertToQuote();
  //   }
  //   return () => setConvertPermission(false);
  // }, [baseCurrency]);

  function convertToBase(quoteCrncy) {
    const quoteCurrencyThatShouldConvert = currency.filter((item) => {
      return (
        item["baseAsset"] === selectedBaseCurrency &&
        item["quoteAsset"] === selectedQuoteCurrency
      );
    });
    if (quoteCrncy !== 0) {
      setBaseCurrency(
        quoteCrncy /
          Number(quoteCurrencyThatShouldConvert[0]["stats"]["bidPrice"])
      );
    }
  }

  // useEffect(() => {
  //   setConvertPermission(true);
  //   if (convertPermission === true) {
  //     convertToBase();
  //   }
  //   return () => setConvertPermission(false);
  // }, [quoteCurrency]);

  // useEffect(() => {
  //   let timeout;
  //   timeout = setTimeout(() => {
  //     const quoteCurrencyThatShouldConvert = currency.filter((item) => {
  //       return (
  //         item["baseAsset"] === selectedBaseCurrency &&
  //         item["quoteAsset"] === selectedQuoteCurrency
  //       );
  //     });
  //     setBaseCurrency(
  //       quoteCurrency /
  //         Number(quoteCurrencyThatShouldConvert[0]["stats"]["bidPrice"])
  //     );
  //   }, 1000);
  //   return () => clearTimeout(timeout);
  // }, [quoteCurrency]);

  function handleChangeCurrency(event) {
    setSearchTerm(event.target.value);
  }

  function handleFavorite(item) {
    setFavorite(
      !favorite.includes(item)
        ? [...favorite, item].reverse()
        : favorite.filter((i) => i !== item)
    );
    // if(item["isFavorite"] === false) {
    //   item["isFavorite"] = true
    // }else {
    //   item["isFavorite"] = false
    // }
  }
  function handleChangeBaseCurrency(event) {
    convertToQuote(event.target.value);
    setBaseCurrency(event.target.value);
  }
  function handleChangeQuoteCurrency(event) {
    convertToBase(event.target.value);
    setQuoteCurrency(event.target.value);
  }
  function handleMarketDisplay(crncy) {
    setMarketDisplay(crncy);
  }

  return (
    <>
      <div className="container">
        <h1>بازار معامله گری ارزهای دیجیتال</h1>
        <div className="calcBody">
          <div className="pairCurrency">
            <div
              className={` baseCurrency ${
                reverseIcon === true ? "baseCurrencyReverse" : ""
              }`}
            >
              {" "}
              {/* <label>ارز پایه</label> */}
              <div className="dropDown divDropDown currencyParts">
                <img
                  className="dropDownIcon"
                  src={require("./assets/image/dropDown-Arrow.png")}
                  width="15px"
                />
                <select
                  value={selectedBaseCurrency}
                  onChange={(e) => setSelectedBaseCurrency(e.target.value)}
                  className=" dropDown"
                  id="baseSelect"
                >
                  {uniqBaseCurrency.map((item) => {
                    // const mapItem = item;
                    // console.log(mapItem);
                    // const temp = cryptoSrc.filter((item) => {
                    //   return item["symbol"] === mapItem["baseAsset"];
                    // });
                    return (
                      <>
                        <option
                          key={item["symbol"]}
                          value={item["faBaseAsset"]}
                        >
                          {/* <img src={require(`${temp[0]["src"]}`)} /> */}
                          {item["faBaseAsset"]}
                        </option>
                      </>
                    );
                  })}
                </select>
              </div>
              <div>
                <input
                  placeholder="مقدار را وارد کنید"
                  onChange={handleChangeBaseCurrency}
                  value={baseCurrency || ""}
                  className="inputCurrency currencyParts "
                />
              </div>
            </div>
            <div
              onClick={() => {
                reverseIcon === false
                  ? setReverseIcon(true)
                  : setReverseIcon(false);
              }}
              className={` convertIcon ${
                reverseIcon === true ? "convertIconReverse" : ""
              }`}
            >
              &#8646;
            </div>
            <div
              className={` quoteCurrency ${
                reverseIcon === true ? "quoteCurrencyReverse" : ""
              }`}
            >
              {" "}
              {/* <label>ارز متقابل</label> */}
              <div className="dropDown divDropDown currencyParts">
                <img
                  className="dropDownIcon"
                  src={require("./assets/image/dropDown-Arrow.png")}
                  width="15px"
                />
                <select
                  value={selectedQuoteCurrency}
                  onChange={(e) => setSelectedQuoteCurrency(e.target.value)}
                  className="dropDown"
                  id="quoteSelect"
                >
                  {uniqQuoteCurrency.map((item) => {
                    return (
                      <option key={item["symbol"]} value={item["faQuoteAsset"]}>
                        {item["faQuoteAsset"]}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <input
                  placeholder="مقدار را وارد کنید"
                  onChange={handleChangeQuoteCurrency}
                  value={quoteCurrency || ""}
                  className="inputCurrency currencyParts "
                />
              </div>
            </div>
          </div>
        </div>
        <br />
        <div className="tableContainer">
          <div className="tableDiv">
            <table>
              <thead>
                <tr className="marketBaseDisplay">
                  <th colSpan="3">
                    <div className="searchDiv">
                      <img
                        src={require("./assets/image/magnifying-glass.png")}
                        width="20px"
                      />
                      <input
                        className="searchInput"
                        type="text"
                        placeholder="جستجو"
                        value={searchTerm}
                        onChange={handleChangeCurrency}
                        ref={searchRef}
                      />
                    </div>
                  </th>
                  <th>
                    <span>پایه بازار :</span>
                  </th>
                  <th colSpan="2">
                    <div className="marketbaseBtns">
                      <button
                        onClick={() => handleMarketDisplay("TMN")}
                        className={`marketBaseDisplayBtn ${
                          marketDisplay === "TMN"
                            ? "marketBaseDisplayBtnSelected"
                            : ""
                        }`}
                      >
                        تومان
                      </button>
                      {/* </th> */}
                      {/* <th> */}
                      <button
                        onClick={() => handleMarketDisplay("USDT")}
                        className={`marketBaseDisplayBtn ${
                          marketDisplay === "USDT"
                            ? "marketBaseDisplayBtnSelected"
                            : ""
                        }`}
                      >
                        USDT
                      </button>
                      {/* </th>
                <th> */}
                      <button
                        onClick={() => handleMarketDisplay("BTC")}
                        className={`marketBaseDisplayBtn ${
                          marketDisplay === "BTC"
                            ? "marketBaseDisplayBtnSelected"
                            : ""
                        }`}
                      >
                        BTC
                      </button>
                    </div>
                  </th>
                </tr>
                <tr className="theadRow">
                  <th className="tableHeader rowsNumber"> ردیف </th>
                  <th
                    className={` tableHeader ${
                      sortCol === "currency" && order === "ASC"
                        ? "ascending"
                        : sortCol === "currency" && order === "DSC"
                        ? "decending"
                        : ""
                    }`}
                    onClick={() => sorting("faBaseAsset", "currency")}
                  >
                    نام ارز
                    {/* {
                  sortCol === "currency" && order === "ASC" ? <img /> : ""
                } */}
                  </th>
                  <th
                    className={` tableHeader ${
                      sortCol === "bidPrice" && order === "ASC"
                        ? "ascending"
                        : sortCol === "bidPrice" && order === "DSC"
                        ? "decending"
                        : ""
                    }`}
                    onClick={() => sorting("stats", "bidPrice")}
                  >
                    قیمت خرید
                  </th>
                  <th
                    className={` tableHeader ${
                      sortCol === "askPrice" && order === "ASC"
                        ? "ascending"
                        : sortCol === "askPrice" && order === "DSC"
                        ? "decending"
                        : ""
                    }`}
                    onClick={() => sorting("stats", "askPrice")}
                  >
                    قیمت فروش
                  </th>
                  <th
                    className={` tableHeader ${
                      sortCol === "24h_ch" && order === "ASC"
                        ? "ascending"
                        : sortCol === "24h_ch" && order === "DSC"
                        ? "decending"
                        : ""
                    }`}
                    onClick={() => sorting("stats", "24h_ch")}
                  >
                    تغییرات
                  </th>
                  <th
                    lang="fa"
                    className={` tableHeader ${
                      sortCol === "24h_volume" && order === "ASC"
                        ? "ascending"
                        : sortCol === "24h_volume" && order === "DSC"
                        ? "decending"
                        : ""
                    }`}
                    onClick={() => sorting("stats", "24h_volume")}
                  >
                    حجم معامله
                  </th>
                </tr>
              </thead>
              <tbody>
                {favorite
                  .filter((item) => item["quoteAsset"] === marketDisplay)
                  .filter((item) => {
                    return searchTerm === ""
                      ? item["faBaseAsset"]
                      : item["faBaseAsset"]
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase());
                  })
                  .map((item, index) => {
                    let mapItem = item;
                    const temp = cryptoSrc.filter((item) => {
                      return item["symbol"] === mapItem["baseAsset"];
                    });
                    return (
                      <tr className="tbodyRows" key={item["symbol"]}>
                        <td> {index + 1} </td>
                        <td className="currency">
                          <span
                            onClick={() => handleFavorite(item)}
                            className="star"
                          >
                            {!favorite.includes(item) ? (
                              <img
                                draggable="false"
                                className="starOff"
                                src={require("./starOff.png")}
                                width="20px"
                                height="20px"
                                alt="starOff"
                              />
                            ) : (
                              <img
                                draggable="false"
                                className="starOn"
                                src={require("./starOn.png")}
                                width="20px"
                                height="20px"
                                alt="starOn"
                              />
                            )}
                          </span>
                          <img
                            className="currencyIcon"
                            src={require(`${temp[0]["src"]}`)}
                            alt={temp[0]["symbol"]}
                            width="20px"
                            height="20px"
                          />
                          {item["faBaseAsset"]}
                        </td>
                        <td className="numericTd">
                          {item["stats"]["bidPrice"] !== "-"
                            ? Number(item["stats"]["bidPrice"])
                                .toFixed(3)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                .replace(/\d/g, function (v) {
                                  return String.fromCharCode(
                                    v.charCodeAt(0) + 0x06c0
                                  );
                                })
                            : "-"}
                        </td>
                        <td className="numericTd">
                          {item["stats"]["askPrice"] !== "-"
                            ? Number(item["stats"]["askPrice"])
                                .toFixed(3)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                .replace(/\d/g, function (v) {
                                  return String.fromCharCode(
                                    v.charCodeAt(0) + 0x06c0
                                  );
                                })
                            : "-"}
                        </td>
                        <td
                          className={` numericTd
                        ${
                          Number(item["stats"]["24h_ch"]) > 0
                            ? "posetive"
                            : Number(item["stats"]["24h_ch"]) < 0
                            ? "negetive"
                            : ""
                        }
                        `}
                        >
                          {item["stats"]["24h_ch"] !== "-"
                            ? Number(item["stats"]["24h_ch"])
                                .toFixed(3)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                .replace(/\d/g, function (v) {
                                  return String.fromCharCode(
                                    v.charCodeAt(0) + 0x06c0
                                  );
                                })
                            : 0}
                        </td>
                        <td className="numericTd">
                          {item["stats"]["24h_volume"] !== "-"
                            ? Number(item["stats"]["24h_volume"])
                                .toFixed(3)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                .replace(/\d/g, function (v) {
                                  return String.fromCharCode(
                                    v.charCodeAt(0) + 0x06c0
                                  );
                                })
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                {currency
                  .filter((item) => item["quoteAsset"] === marketDisplay)
                  .filter((item) => {
                    return !favorite.includes(item);
                  })
                  .filter((item) => {
                    return searchTerm === ""
                      ? item["faBaseAsset"]
                      : item["faBaseAsset"]
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase());
                  })
                  .map((item, index) => {
                    let mapItem = item;
                    const temp = cryptoSrc.filter((item) => {
                      return item["symbol"] === mapItem["baseAsset"];
                    });
                    console.log(`"${temp[0]["src"]}"`);
                    // item["isFavorite"] = false;
                    // item["id"] = index;
                    return (
                      <>
                        <tr className="tbodyRows" key={item["symbol"]}>
                          <td>
                            {" "}
                            {!favorite.length
                              ? index + 1
                              : favorite.length + index + 1}{" "}
                          </td>
                          <td className="currency">
                            <span
                              onClick={() => handleFavorite(item)}
                              className="star"
                            >
                              {/* {favorite ? <starOn /> : <starOff />} */}
                              {/* {favorite ? <span>&#9733;</span> : <span>&#9734;</span>} */}
                              {/* <span>&#9734;</span>
                        <span>&#9733;</span> */}
                              {!favorite.includes(item) ? (
                                <img
                                  draggable="false"
                                  className="starOff"
                                  src={require("./starOff.png")}
                                  width="20px"
                                  height="20px"
                                  alt="starOff"
                                />
                              ) : (
                                <img
                                  draggable="false"
                                  className="starOn"
                                  src={require("./starOn.png")}
                                  width="20px"
                                  height="20px"
                                  alt="starOn"
                                />
                              )}
                            </span>
                            <img
                              className="currencyIcon"
                              src={require(`${temp[0]["src"]}`)}
                              alt={temp[0]["symbol"]}
                              width="20px"
                              height="20px"
                            />
                            <span>{item["faBaseAsset"]}</span>
                          </td>

                          <td className="numericTd">
                            {item["stats"]["bidPrice"] !== "-"
                              ? Number(item["stats"]["bidPrice"])
                                  .toFixed(3)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  .replace(/\d/g, function (v) {
                                    return String.fromCharCode(
                                      v.charCodeAt(0) + 0x06c0
                                    );
                                  })
                              : "-"}
                          </td>
                          <td className="numericTd">
                            {item["stats"]["askPrice"] !== "-"
                              ? Number(item["stats"]["askPrice"])
                                  .toFixed(3)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  .replace(/\d/g, function (v) {
                                    return String.fromCharCode(
                                      v.charCodeAt(0) + 0x06c0
                                    );
                                  })
                              : "-"}
                          </td>
                          <td
                            className={` numericTd
                      ${
                        Number(item["stats"]["24h_ch"]) > 0
                          ? "posetive"
                          : Number(item["stats"]["24h_ch"]) < 0
                          ? "negetive"
                          : ""
                      }
                      `}
                          >
                            {item["stats"]["24h_ch"] !== "-"
                              ? Number(item["stats"]["24h_ch"])
                                  .toFixed(3)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  .replace(/\d/g, function (v) {
                                    return String.fromCharCode(
                                      v.charCodeAt(0) + 0x06c0
                                    );
                                  })
                              : "-"}
                          </td>
                          <td className="numericTd">
                            {item["stats"]["24h_volume"] !== "-"
                              ? Number(item["stats"]["24h_volume"])
                                  .toFixed(3)
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                  .replace(/\d/g, function (v) {
                                    return String.fromCharCode(
                                      v.charCodeAt(0) + 0x06c0
                                    );
                                  })
                              : "-"}
                          </td>
                        </tr>
                      </>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
export default Finance;
