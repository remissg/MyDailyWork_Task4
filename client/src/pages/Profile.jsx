import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [pageUser, setPageUser] = useState(user);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Add Address State
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: ''
    });

    // Profile Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (user) {
            setPageUser(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            };

            const { data } = await axios.put('/api/auth/profile', formData, config);
            setPageUser(data.user);
            showToast('Profile updated successfully', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            };

            // Append new address to existing list
            const updatedAddresses = [...(pageUser.addresses || []), newAddress];

            const { data } = await axios.put('/api/auth/profile', { addresses: updatedAddresses }, config);

            setPageUser(data.user);
            setShowAddAddress(false);
            setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', phone: '' }); // Reset form
            showToast('Address added successfully', 'success');

        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to add address', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const updatedAddresses = pageUser.addresses.filter(addr => addr._id !== addressId);
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            };

            const { data } = await axios.put('/api/auth/profile', { addresses: updatedAddresses }, config);
            setPageUser(data.user);
            showToast('Address deleted', 'success');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to delete address', 'error');
        }
    };

    if (!pageUser) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading profile...</div>;

    return (
        <div className="profile-container">
            {/* Sidebar */}
            <aside className="profile-sidebar">
                <div className="user-badge">
                    <div className="avatar-placeholder">
                        {pageUser.name?.charAt(0) || 'U'}
                    </div>
                    <h3>{pageUser.name || 'User'}</h3>
                    <p>{pageUser.email || 'No Email'}</p>
                </div>

                <nav className="profile-nav">
                    <button
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <span>👤</span> Profile Info
                    </button>
                    {pageUser.role !== 'admin' && (
                        <>
                            <button
                                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                <span>📍</span> Address Book
                            </button>
                            <Link to="/orders" className="nav-item">
                                <span>📦</span> My Orders
                            </Link>
                        </>
                    )}

                    {pageUser.role === 'admin' && (
                        <Link to="/admin" className="nav-item">
                            <span>📊</span> Admin Dashboard
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Content Area */}
            <main className="profile-content">
                {activeTab === 'profile' && (
                    <div className="fade-in">
                        <div className="section-header">
                            <h2 className="section-title">Personal Information</h2>
                        </div>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+91 99999 99999"
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="fade-in">
                        <div className="section-header">
                            <h2 className="section-title">Address Book</h2>
                            {!showAddAddress && (
                                <button className="btn-add" onClick={() => setShowAddAddress(true)}>
                                    <span>+</span> Add New Address
                                </button>
                            )}
                        </div>

                        {showAddAddress && (
                            <div className="add-address-form">
                                <h3>New Address Details</h3>
                                <form onSubmit={handleAddAddress}>
                                    <div className="form-group">
                                        <label>Street Address</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={newAddress.street}
                                            onChange={handleAddressChange}
                                            className="form-input"
                                            required
                                            placeholder="House No, Street Area"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={newAddress.city}
                                                onChange={handleAddressChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={newAddress.state}
                                                onChange={handleAddressChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Zip Code</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={newAddress.zipCode}
                                                onChange={handleAddressChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={newAddress.country}
                                                onChange={handleAddressChange}
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number (Optional)</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={newAddress.phone}
                                            onChange={handleAddressChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="btn-save" disabled={loading}>
                                            {loading ? 'Saving...' : 'Save Address'}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-cancel"
                                            onClick={() => setShowAddAddress(false)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {pageUser.addresses && pageUser.addresses.length > 0 ? (
                            <div className="address-grid">
                                {pageUser.addresses.map((addr) => (
                                    <div key={addr._id} className="address-card">
                                        <div className="address-type-badge">Home</div>
                                        <div className="address-details">
                                            <h4>{pageUser.name}</h4>
                                            <p>{addr.street}</p>
                                            <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                                            <p>{addr.country}</p>
                                            {addr.phone && <p>📞 {addr.phone}</p>}
                                        </div>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteAddress(addr._id)}
                                        >
                                            Remove Address
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            !showAddAddress && (
                                <div className="no-addresses">
                                    <p>No addresses saved yet.</p>
                                    <button className="btn-add" onClick={() => setShowAddAddress(true)} style={{ marginTop: '16px' }}>
                                        Add Your First Address
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
