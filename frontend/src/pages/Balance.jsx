
import { useState } from "react";
import {
    Wallet,
    RefreshCw,
    ShoppingCart,
    X,
    Package,
    Hash,
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


    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [productId, setProductId] = useState("");
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

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to fetch balances"
                );

            }

            console.log(
                "Balances received:",
                data
            );

            setBalances(data);

        } catch (err) {

            console.error(
                "Fetch balance error:",
                err
            );

            setError(err.message);
            setBalances([]);

        } finally {

            setLoading(false);

        }
    };


    // useEffect(() => {
    //     fetchBalances();
    // }, []);


    // =========================================
    // OPEN BUY POPUP
    // =========================================

    const handleBuy = (user) => {

        setSelectedUser(user);

        setProductId("");
        setBuyQuantity(1);

        setShowBuyModal(true);

    };


    // =========================================
    // CLOSE BUY POPUP
    // =========================================

    const closeBuyModal = () => {

        setShowBuyModal(false);
        setSelectedUser(null);

        setProductId("");
        setBuyQuantity(1);

    };


    // =========================================
    // QUANTITY MINUS
    // =========================================

    const decreaseQuantity = () => {

        setBuyQuantity((prev) => {

            if (prev <= 1) {

                return 1;

            }

            return prev - 1;

        });

    };


    // =========================================
    // QUANTITY PLUS
    // =========================================

    const increaseQuantity = () => {

        setBuyQuantity((prev) => {

            if (
                selectedUser &&
                prev >= selectedUser.quantity
            ) {

                return prev;

            }

            return prev + 1;

        });

    };


    // =========================================
    // BUY SUBMIT
    // =========================================

    const handlePurchase = async (e) => {

        e.preventDefault();

        if (!productId.trim()) {

            alert(
                "Please enter Product ID"
            );

            return;

        }

        if (!buyQuantity || buyQuantity <= 0) {

            alert(
                "Please enter a valid quantity"
            );

            return;

        }

        if (
            selectedUser &&
            buyQuantity > selectedUser.quantity
        ) {

            alert(
                `Only ${selectedUser.quantity} quantity is available.`
            );

            return;

        }

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/balance/buy`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id:
                            selectedUser.user_id,

                        product_id:
                            Number(productId),

                        quantity:
                            Number(buyQuantity)

                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Purchase failed"
                );

            }

            alert(
                `Purchase successful! Remaining quantity: ${data.remaining_quantity}`
            );


            // Close popup

            closeBuyModal();


            // Fetch latest balance
            // from database

            await fetchBalances();

        } catch (err) {

            console.error(
                "Purchase error:",
                err
            );

            alert(err.message);

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="balance-page">


            {/* HEADER */}

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

                        <Wallet size={28} />

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


            {/* ERROR */}

            {error && (

                <div className="error-message">

                    {error}

                </div>

            )}


            {/* TABLE CARD */}

            <div className="balance-card">

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

                        {balances.length.toLocaleString()}
                        {" "}Records

                    </span>

                </div>


                {/* LOADING */}

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

                        <Package size={40} />

                        <h3>
                            No records found
                        </h3>

                        <p>
                            There are no balance
                            records available.
                        </p>

                    </div>

                ) : (

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

                                        <td>

                                            <span className="id-badge">

                                                #
                                                {user.balance_id}

                                            </span>

                                        </td>


                                        <td>

                                            {user.user_id}

                                        </td>


                                        <td>

                                            <div className="user-name">

                                                <div className="user-avatar">

                                                    {user.user_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}

                                                </div>

                                                <span>

                                                    {user.user_name}

                                                </span>

                                            </div>

                                        </td>


                                        <td>

                                            <span className="quantity-badge">

                                                {Number(
                                                    user.quantity
                                                ).toLocaleString()}

                                            </span>

                                        </td>


                                        <td>

                                            <button
                                                className="buy-button"
                                                onClick={() =>
                                                    handleBuy(
                                                        user
                                                    )
                                                }
                                            >

                                                <ShoppingCart
                                                    size={16}
                                                />

                                                Buy

                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* BUY MODAL */}

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


                        {/* MODAL HEADER */}

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
                                    Enter the product details
                                </p>

                            </div>


                            <button
                                className="close-modal"
                                onClick={
                                    closeBuyModal
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* USER INFO */}

                        <div className="selected-user">

                            <div className="selected-user-avatar">

                                {selectedUser.user_name
                                    ?.charAt(0)
                                    ?.toUpperCase()}

                            </div>

                            <div className="selected-user-info">

                                <strong>

                                    {
                                        selectedUser.user_name
                                    }

                                </strong>

                                <span>

                                    User ID:{" "}
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

                                    {Number(
                                        selectedUser.quantity
                                    ).toLocaleString()}

                                </strong>

                            </div>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handlePurchase
                            }
                            className="buy-form"
                        >


                            {/* PRODUCT ID */}

                            <div className="form-group">

                                <label>

                                    <Hash size={16} />

                                    Product ID

                                </label>

                                <div className="input-wrapper">

                                    <Package size={18} />

                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Enter product ID"
                                        value={productId}
                                        onChange={(e) =>
                                            setProductId(
                                                e.target.value
                                            )
                                        }
                                        autoFocus
                                    />

                                </div>

                            </div>


                            {/* QUANTITY */}

                            <div className="form-group">

                                <label>

                                    <ShoppingCart
                                        size={16}
                                    />

                                    Quantity

                                </label>

                                <div className="quantity-control">

                                    <button
                                        type="button"
                                        onClick={
                                            decreaseQuantity
                                        }
                                        disabled={
                                            buyQuantity <=
                                            1
                                        }
                                    >

                                        <Minus
                                            size={16}
                                        />

                                    </button>


                                    <input
                                        type="number"
                                        min="1"
                                        max={
                                            selectedUser.quantity
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
                                                value <=
                                                selectedUser.quantity
                                            ) {

                                                setBuyQuantity(
                                                    value
                                                );

                                            }

                                        }}
                                    />


                                    <button
                                        type="button"
                                        onClick={
                                            increaseQuantity
                                        }
                                        disabled={
                                            buyQuantity >=
                                            selectedUser.quantity
                                        }
                                    >

                                        <Plus
                                            size={16}
                                        />

                                    </button>

                                </div>

                                <small>

                                    Maximum available:{" "}
                                    {
                                        selectedUser.quantity
                                    }

                                </small>

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeBuyModal
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="confirm-buy-button"
                                >

                                    <ShoppingCart
                                        size={17}
                                    />

                                    Buy Now

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



