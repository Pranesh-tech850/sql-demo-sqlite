import { useState } from "react";

import {
    Wallet,
    RefreshCw,
    ShoppingCart,
    X,
    Package,
    Minus,
    Plus,
    ArrowLeft
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Balance.css";


function Balance() {

    // =========================================
    // API URL
    // =========================================

    const API_URL = import.meta.env.VITE_API_URL;


    // =========================================
    // STATES
    // =========================================

    const [balances, setBalances] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [showBuyModal, setShowBuyModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);

    const [buyQuantity, setBuyQuantity] = useState(1);


    // =========================================
    // FETCH BALANCES
    // =========================================

    const fetchBalances = async () => {

        try {

            setLoading(true);

            setError("");


            const response = await fetch(
                `${API_URL}/balance`
            );


            // -------------------------------------
            // READ RESPONSE AS TEXT FIRST
            // -------------------------------------

            const text = await response.text();

            console.log(
                "Balance response:",
                text
            );


            let data;

            try {

                data = JSON.parse(text);

            } catch (jsonError) {

                console.error(
                    "Balance API returned invalid JSON:",
                    text
                );

                throw new Error(
                    "Backend returned an invalid response"
                );

            }


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Failed to fetch balances"
                );

            }


            console.log(
                "Balances received:",
                data
            );


            setBalances(
                Array.isArray(data)
                    ? data
                    : []
            );


        } catch (err) {

            console.error(
                "Fetch balance error:",
                err
            );


            setError(
                err.message ||
                "Failed to fetch balances"
            );


            setBalances([]);


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // OPEN BUY MODAL
    // =========================================

    const handleBuy = (user) => {

        console.log(
            "Selected balance:",
            user
        );


        setSelectedUser(user);

        setBuyQuantity(1);

        setShowBuyModal(true);

    };


    // =========================================
    // CLOSE BUY MODAL
    // =========================================

    const closeBuyModal = () => {

        setShowBuyModal(false);

        setSelectedUser(null);

        setBuyQuantity(1);

    };


    // =========================================
    // DECREASE QUANTITY
    // =========================================

    const decreaseQuantity = () => {

        setBuyQuantity((previous) => {

            if (previous <= 1) {

                return 1;

            }

            return previous - 1;

        });

    };


    // =========================================
    // INCREASE QUANTITY
    // =========================================

    const increaseQuantity = () => {

        setBuyQuantity((previous) => {

            if (
                selectedUser &&
                previous >=
                Number(selectedUser.quantity)
            ) {

                return previous;

            }

            return previous + 1;

        });

    };


    // =========================================
    // BUY PURCHASE
    // =========================================

    const handlePurchase = async (e) => {

        e.preventDefault();


        // -------------------------------------
        // CHECK SELECTED USER
        // -------------------------------------

        if (!selectedUser) {

            alert(
                "No balance selected"
            );

            return;

        }


        // -------------------------------------
        // CHECK QUANTITY
        // -------------------------------------

        if (
            !buyQuantity ||
            !Number.isInteger(
                Number(buyQuantity)
            ) ||
            Number(buyQuantity) <= 0
        ) {

            alert(
                "Please enter a valid quantity"
            );

            return;

        }


        // -------------------------------------
        // CHECK AVAILABLE QUANTITY
        // -------------------------------------

        if (
            Number(buyQuantity) >
            Number(selectedUser.quantity)
        ) {

            alert(
                `Only ${selectedUser.quantity} quantity is available.`
            );

            return;

        }


        // -------------------------------------
        // CHECK BALANCE ID
        // -------------------------------------

        if (
            selectedUser.balance_id === undefined ||
            selectedUser.balance_id === null
        ) {

            alert(
                "Balance ID is missing"
            );

            console.error(
                "Selected user does not contain balance_id:",
                selectedUser
            );

            return;

        }


        try {

            setLoading(true);


            setError("");


            // =====================================
            // API REQUEST
            // =====================================

            const url =
                `${API_URL}/balance/buy/${selectedUser.balance_id}`;


            console.log(
                "BUY URL:",
                url
            );


            console.log(
                "BUY BODY:",
                {
                    quantity: Number(buyQuantity)
                }
            );


            const response = await fetch(
                url,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        quantity:
                            Number(buyQuantity)
                    })
                }
            );


            // =====================================
            // READ RESPONSE AS TEXT
            // =====================================

            const text =
                await response.text();


            console.log(
                "BUY STATUS:",
                response.status
            );


            console.log(
                "BUY RAW RESPONSE:",
                text
            );


            // =====================================
            // PARSE JSON SAFELY
            // =====================================

            let data;


            try {

                data = JSON.parse(text);

            } catch (jsonError) {

                console.error(
                    "Backend returned non-JSON response:",
                    text
                );


                throw new Error(
                    `Backend returned invalid response. Status: ${response.status}`
                );

            }


            // =====================================
            // HANDLE BACKEND ERROR
            // =====================================

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Purchase failed"
                );

            }


            // =====================================
            // SUCCESS
            // =====================================

            console.log(
                "Purchase response:",
                data
            );


            alert(
                data.message ||
                `Purchase successful! Remaining quantity: ${data.remaining_quantity}`
            );


            // =====================================
            // CLOSE MODAL
            // =====================================

            closeBuyModal();


            // =====================================
            // FETCH UPDATED BALANCE
            // =====================================

            await fetchBalances();


        } catch (err) {

            console.error(
                "Purchase error:",
                err
            );


            alert(
                err.message ||
                "Purchase failed"
            );


        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // RETURN UI
    // =========================================

    return (

        <div className="balance-page">


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="balance-header">

                <div>

                    <div className="balance-title">

                        <Link
                            to="/"
                            className="back-button"
                        >

                            <ArrowLeft
                                size={19}
                            />

                        </Link>


                        <Wallet
                            size={28}
                        />


                        <h1>
                            Balance
                        </h1>

                    </div>


                    <p>
                        Manage user quantities
                        and purchases
                    </p>

                </div>


                <button
                    className="fetch-button"
                    onClick={fetchBalances}
                    disabled={loading}
                >

                    <RefreshCw
                        size={18}
                        className={
                            loading
                                ? "spin"
                                : ""
                        }
                    />


                    {loading
                        ? "Fetching..."
                        : "Fetch Balance"}

                </button>

            </div>


            {/* =========================================
                ERROR MESSAGE
            ========================================= */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* =========================================
                BALANCE CARD
            ========================================= */}

            <div className="balance-card">


                {/* TABLE HEADER */}

                <div className="table-header">

                    <div>

                        <h2>
                            Users
                        </h2>

                        <p>
                            Available user quantities
                        </p>

                    </div>


                    <span>

                        {
                            balances.length.toLocaleString()
                        }

                        {" "}

                        Records

                    </span>

                </div>


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading ? (

                    <div className="loading">

                        <RefreshCw
                            size={24}
                            className="spin"
                        />

                        <span>
                            Loading quantities...
                        </span>

                    </div>


                ) : balances.length === 0 ? (

                    <div className="empty">

                        <Package
                            size={40}
                        />

                        <h3>
                            No records found
                        </h3>

                        <p>
                            There are no balance
                            records available.
                        </p>

                    </div>


                ) : (

                    /* =================================
                       TABLE
                    ================================= */

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Balance ID
                                    </th>

                                    <th>
                                        User ID
                                    </th>

                                    <th>
                                        User Name
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {balances.map(
                                    (user) => (

                                        <tr
                                            key={
                                                user.balance_id
                                            }
                                        >

                                            {/* BALANCE ID */}

                                            <td>

                                                <span className="id-badge">

                                                    #

                                                    {
                                                        user.balance_id
                                                    }

                                                </span>

                                            </td>


                                            {/* USER ID */}

                                            <td>

                                                {
                                                    user.user_id
                                                }

                                            </td>


                                            {/* USER NAME */}

                                            <td>

                                                <div className="user-name">

                                                    <div className="user-avatar">

                                                        {
                                                            user.user_name
                                                                ?.charAt(0)
                                                                ?.toUpperCase()
                                                        }

                                                    </div>


                                                    <span>

                                                        {
                                                            user.user_name
                                                        }

                                                    </span>

                                                </div>

                                            </td>


                                            {/* QUANTITY */}

                                            <td>

                                                <span className="quantity-badge">

                                                    {
                                                        Number(
                                                            user.quantity
                                                        ).toLocaleString()
                                                    }

                                                </span>

                                            </td>


                                            {/* BUY */}

                                            <td>

                                                <button
                                                    className="buy-button"
                                                    onClick={() =>
                                                        handleBuy(
                                                            user
                                                        )
                                                    }
                                                    disabled={
                                                        Number(
                                                            user.quantity
                                                        ) <= 0
                                                    }
                                                >

                                                    <ShoppingCart
                                                        size={16}
                                                    />

                                                    Buy

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =========================================
                BUY MODAL
            ========================================= */}

            {showBuyModal &&
                selectedUser && (

                    <div
                        className="modal-overlay"
                        onClick={closeBuyModal}
                    >

                        <div
                            className="buy-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >


                            {/* =================================
                                MODAL HEADER
                            ================================= */}

                            <div className="modal-header">


                                <div className="modal-icon">

                                    <ShoppingCart
                                        size={24}
                                    />

                                </div>


                                <div>

                                    <h2>
                                        Purchase Product
                                    </h2>

                                    <p>
                                        Enter quantity to purchase
                                    </p>

                                </div>


                                <button
                                    className="close-modal"
                                    onClick={
                                        closeBuyModal
                                    }
                                >

                                    <X
                                        size={20}
                                    />

                                </button>

                            </div>


                            {/* =================================
                                SELECTED USER
                            ================================= */}

                            <div className="selected-user">


                                <div className="selected-user-avatar">

                                    {
                                        selectedUser.user_name
                                            ?.charAt(0)
                                            ?.toUpperCase()
                                    }

                                </div>


                                <div className="selected-user-info">

                                    <strong>

                                        {
                                            selectedUser.user_name
                                        }

                                    </strong>


                                    <span>

                                        User ID:
                                        {" "}
                                        {
                                            selectedUser.user_id
                                        }

                                    </span>

                                </div>


                                <div className="available-quantity">

                                    <span>
                                        Available
                                    </span>


                                    <strong>

                                        {
                                            Number(
                                                selectedUser.quantity
                                            ).toLocaleString()
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* =================================
                                FORM
                            ================================= */}

                            <form
                                onSubmit={
                                    handlePurchase
                                }
                                className="buy-form"
                            >


                                {/* QUANTITY */}

                                <div className="form-group">

                                    <label>

                                        <ShoppingCart
                                            size={16}
                                        />

                                        Quantity

                                    </label>


                                    <div className="quantity-control">


                                        {/* MINUS */}

                                        <button
                                            type="button"
                                            onClick={
                                                decreaseQuantity
                                            }
                                            disabled={
                                                buyQuantity <= 1
                                            }
                                        >

                                            <Minus
                                                size={16}
                                            />

                                        </button>


                                        {/* QUANTITY INPUT */}

                                        <input
                                            type="number"
                                            min="1"
                                            max={
                                                Number(
                                                    selectedUser.quantity
                                                )
                                            }
                                            value={
                                                buyQuantity
                                            }
                                            onChange={(e) => {

                                                const value =
                                                    Number(
                                                        e.target
                                                            .value
                                                    );


                                                if (
                                                    value >= 1 &&
                                                    value <=
                                                    Number(
                                                        selectedUser.quantity
                                                    )
                                                ) {

                                                    setBuyQuantity(
                                                        value
                                                    );

                                                }

                                            }}
                                        />


                                        {/* PLUS */}

                                        <button
                                            type="button"
                                            onClick={
                                                increaseQuantity
                                            }
                                            disabled={
                                                buyQuantity >=
                                                Number(
                                                    selectedUser.quantity
                                                )
                                            }
                                        >

                                            <Plus
                                                size={16}
                                            />

                                        </button>

                                    </div>


                                    <small>

                                        Maximum available:
                                        {" "}
                                        {
                                            Number(
                                                selectedUser.quantity
                                            ).toLocaleString()
                                        }

                                    </small>

                                </div>


                                {/* =================================
                                    MODAL ACTIONS
                                ================================= */}

                                <div className="modal-actions">


                                    {/* CANCEL */}

                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={
                                            closeBuyModal
                                        }
                                    >

                                        Cancel

                                    </button>


                                    {/* BUY */}

                                    <button
                                        type="submit"
                                        className="confirm-buy-button"
                                        disabled={loading}
                                    >

                                        <ShoppingCart
                                            size={17}
                                        />

                                        {loading
                                            ? "Processing..."
                                            : "Buy Now"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

        </div>

    );

}


export default Balance;