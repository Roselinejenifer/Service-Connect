
import { useEffect, useState } from "react";
import "./App.css";

function App() {
    // Store the services received from the backend
    const [services, setServices] = useState([]);

    // Track whether the services are loading
    const [loading, setLoading] = useState(true);

    // Store any error message
    const [error, setError] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
);

    // Fetch services when the component first loads
    useEffect(() => {
        async function fetchServices() {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/services"
                );

                // Check whether the request succeeded
                if (!response.ok) {
                    throw new Error("Failed to fetch services");
                }

                const data = await response.json();

                // Save the services in React state
                setServices(data.services);
            } catch (err) {
                setError(
                    "Unable to load services. Please check your backend server."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchServices();
    }, []);

   
return (
    <div className="app">
        <header className="header">
            <h1>Service Connect</h1>
            <p>Find the right professional for your home</p>
        </header>

        <main className="container">
            {selectedService ? (
                // Page 2: Selected service details
                <div className="service-details">
                   <button
    type="button"
    className="back-button"
    onClick={() => setSelectedService(null)}
>
    ← Back to Services
</button>

                    <h2>{selectedService.name}</h2>

                    <p>{selectedService.description}</p>

                    <p className="price">
                        ₹{Number(selectedService.base_price).toFixed(2)}
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            alert("Booking feature will be added next!");
                        }}
                    >
                        Book This Service
                    </button>
                </div>
            ) : (
                // Page 1: All available services
                <>
                    <h2>Available Services</h2>

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for a service..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />

                    {loading && <p>Loading services...</p>}

                    {error && <p className="error">{error}</p>}

                    {!loading && !error && (
                        <div className="services-grid">
                            {filteredServices.map((service) => (
                                <div
                                    className="service-card"
                                    key={service.id}
                                >
                                    <h3>{service.name}</h3>

                                    <p>{service.description}</p>

                                    <p className="price">
                                        ₹{Number(
                                            service.base_price
                                        ).toFixed(2)}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedService(service)
                                        }
                                    >
                                        View Service
                                    </button>
                                </div>
                            ))}

                            {filteredServices.length === 0 && (
                                <p>
                                    No services found. Try another search.
                                </p>
                            )}
                        </div>
                    )}
                </>
            )}
        </main>
    </div>
);

}

export default App;
