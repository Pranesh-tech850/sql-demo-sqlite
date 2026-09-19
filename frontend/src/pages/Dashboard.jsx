import {
    Database,
    Users,
    Package,
    ShoppingCart,
    Wallet,
    ArrowRight,
    Activity
} from "lucide-react";

import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {

    const cards = [
        {
            title: "Students",
            description: "Manage student records and information",
            icon: Users,
            path: "/students",
            className: "students-card"
        },
        {
            title: "Products",
            description: "Manage products and inventory",
            icon: Package,
            path: "/products",
            className: "products-card"
        },
        {
            title: "Orders",
            description: "View and manage customer orders",
            icon: ShoppingCart,
            path: "/orders",
            className: "orders-card"
        },
        {
            title: "Balance",
            description: "Manage user balances and purchases",
            icon: Wallet,
            path: "/balance",
            className: "balance-card"
        }
    ];

    return (
        <div className="dashboard">

            {/* Background decoration */}
            <div className="dashboard-glow glow-one"></div>
            <div className="dashboard-glow glow-two"></div>

            {/* Header */}
            <header className="dashboard-header">

                <div className="brand-section">

                    <div className="brand-icon">
                        <Database size={28} />
                    </div>

                    <div>
                        <h1>SQLite Dashboard</h1>

                        <p>
                            Manage your database from one place
                        </p>
                    </div>

                </div>

                <div className="status">

                    <span className="status-dot"></span>

                    <span>
                        Database Connected
                    </span>

                </div>

            </header>


            {/* Welcome Section */}
            <section className="welcome-section">

                <div>

                    <span className="welcome-label">
                        DATABASE MANAGEMENT
                    </span>

                    <h2>
                        Welcome back 👋
                    </h2>

                    <p>
                        Choose a section below to manage
                        your SQLite database.
                    </p>

                </div>

                <div className="activity-icon">
                    <Activity size={26} />
                </div>

            </section>


            {/* Cards */}
            <section className="dashboard-grid">

                {cards.map((card) => {

                    const Icon = card.icon;

                    return (
                        <Link
                            key={card.title}
                            to={card.path}
                            className={`dashboard-card ${card.className}`}
                        >

                            <div className="card-top">

                                <div className="card-icon">
                                    <Icon size={25} />
                                </div>

                                <div className="card-arrow">
                                    <ArrowRight size={20} />
                                </div>

                            </div>


                            <div className="card-content">

                                <h3>
                                    {card.title}
                                </h3>

                                <p>
                                    {card.description}
                                </p>

                            </div>


                            <div className="card-footer">

                                <span>
                                    Open {card.title}
                                </span>

                                <ArrowRight size={16} />

                            </div>

                        </Link>
                    );
                })}

            </section>


            {/* Bottom Info */}
            <div className="dashboard-footer">

                <div className="footer-line"></div>

                <p>
                    SQLite Database Management System
                </p>

                <div className="footer-line"></div>

            </div>

        </div>
    );
}

export default Dashboard;