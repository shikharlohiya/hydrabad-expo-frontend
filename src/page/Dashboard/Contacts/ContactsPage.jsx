import React, { useState } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    UserIcon,
    PencilIcon,
    TrashIcon,
    FunnelIcon,
    ChevronDownIcon,
    StarIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    TagIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useDialer from '../../../hooks/useDialer';

const ContactsPage = () => {
    const { initiateCall } = useDialer();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    // Mock contacts data
    const contacts = [
        {
            id: 1,
            name: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            email: 'rajesh.kumar@email.com',
            company: 'Tech Solutions Pvt Ltd',
            position: 'Senior Manager',
            category: 'client',
            location: 'Mumbai, Maharashtra',
            lastCall: '2 hours ago',
            callCount: 15,
            isFavorite: true,
            avatar: null,
            tags: ['VIP', 'Premium Account'],
            notes: 'Prefers morning calls. Technical issues expert.'
        },
        {
            id: 2,
            name: 'Priya Sharma',
            phone: '+91 87654 32109',
            email: 'priya.sharma@gmail.com',
            company: 'Independent Trader',
            position: 'Trader',
            category: 'trader',
            location: 'Delhi, Delhi',
            lastCall: '1 day ago',
            callCount: 8,
            isFavorite: false,
            avatar: null,
            tags: ['Active Trader'],
            notes: 'Usually available after 2 PM. Interested in options trading.'
        },
        {
            id: 3,
            name: 'Amit Patel',
            phone: '+91 76543 21098',
            email: 'amit.patel@business.com',
            company: 'Patel Enterprises',
            position: 'CEO',
            category: 'prospect',
            location: 'Ahmedabad, Gujarat',
            lastCall: '3 days ago',
            callCount: 3,
            isFavorite: true,
            avatar: null,
            tags: ['Potential Client', 'High Value'],
            notes: 'Interested in corporate trading accounts. Follow up needed.'
        },
        {
            id: 4,
            name: 'Sneha Reddy',
            phone: '+91 65432 10987',
            email: 'sneha.reddy@tech.com',
            company: 'TechCorp India',
            position: 'Financial Analyst',
            category: 'client',
            location: 'Bangalore, Karnataka',
            lastCall: '1 week ago',
            callCount: 12,
            isFavorite: false,
            avatar: null,
            tags: ['Regular Client'],
            notes: 'Expert in equity markets. Provides good referrals.'
        },
        {
            id: 5,
            name: 'Vikram Singh',
            phone: '+91 54321 09876',
            email: 'vikram.singh@investment.com',
            company: 'Singh Investments',
            position: 'Investment Advisor',
            category: 'partner',
            location: 'Jaipur, Rajasthan',
            lastCall: '2 weeks ago',
            callCount: 25,
            isFavorite: true,
            avatar: null,
            tags: ['Partner', 'Referral Source'],
            notes: 'Business partner. Sends regular client referrals.'
        }
    ];

    const categories = [
        { value: 'all', label: 'All Contacts', count: contacts.length },
        { value: 'client', label: 'Clients', count: contacts.filter(c => c.category === 'client').length },
        { value: 'trader', label: 'Traders', count: contacts.filter(c => c.category === 'trader').length },
        { value: 'prospect', label: 'Prospects', count: contacts.filter(c => c.category === 'prospect').length },
        { value: 'partner', label: 'Partners', count: contacts.filter(c => c.category === 'partner').length }
    ];

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.phone.includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || contact.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleCall = (contact) => {
        initiateCall(contact.phone, {
            name: contact.name,
            company: contact.company
        });
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'client': return 'bg-green-100 text-green-800';
            case 'trader': return 'bg-blue-100 text-blue-800';
            case 'prospect': return 'bg-yellow-100 text-yellow-800';
            case 'partner': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const ContactCard = ({ contact }) => (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#F68A1F] to-[#e5791c] rounded-full flex items-center justify-center text-white font-semibold">
                        {getInitials(contact.name)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-600">{contact.position}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setSelectedContact(contact)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <StarIcon className={`w-5 h-5 ${contact.isFavorite ? 'text-yellow-400 fill-current' : ''}`} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                        <EllipsisVerticalIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {contact.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    {contact.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                    {contact.company}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {contact.location}
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(contact.category)}`}>
                    {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
                </span>
                <div className="text-xs text-gray-500">
                    {contact.callCount} calls • Last: {contact.lastCall}
                </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
                {contact.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => handleCall(contact)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                >
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    Call
                </button>
                <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <PencilIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const ContactRow = ({ contact }) => (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F68A1F] to-[#e5791c] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                        {getInitials(contact.name)}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                            {contact.name}
                            {contact.isFavorite && <StarSolidIcon className="w-4 h-4 text-yellow-400 ml-2" />}
                        </div>
                        <div className="text-sm text-gray-500">{contact.position}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{contact.phone}</div>
                <div className="text-sm text-gray-500">{contact.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{contact.company}</div>
                <div className="text-sm text-gray-500">{contact.location}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(contact.category)}`}>
                    {contact.category.charAt(0).toUpperCase() + contact.category.slice(1)}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div>{contact.callCount} calls</div>
                <div>{contact.lastCall}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleCall(contact)}
                        className="inline-flex items-center px-3 py-1 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                    >
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        Call
                    </button>
                    <button className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <PencilIcon className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
                        <p className="text-gray-600 mt-2">Manage your customer and business contacts</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Contact
                    </button>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F68A1F] focus:border-[#F68A1F]"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {categories.map((category) => (
                                <button
                                    key={category.value}
                                    onClick={() => setSelectedCategory(category.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.value
                                        ? 'bg-[#F68A1F] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.label} ({category.count})
                                </button>
                            ))}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-1 rounded text-sm ${viewMode === 'grid' ? 'bg-[#F68A1F] text-white' : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-[#F68A1F] text-white' : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                List
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
                <p className="text-sm text-gray-600">
                    Showing {filteredContacts.length} of {contacts.length} contacts
                </p>
            </div>

            {/* Contacts Display */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredContacts.map((contact) => (
                        <ContactCard key={contact.id} contact={contact} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact Info
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredContacts.map((contact) => (
                                <ContactRow key={contact.id} contact={contact} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {filteredContacts.length === 0 && (
                <div className="text-center py-12">
                    <UserIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                    <p className="text-gray-600 mb-6">
                        {searchTerm || selectedCategory !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by adding your first contact'
                        }
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-[#F68A1F] text-white rounded-lg hover:bg-[#e5791c] transition-colors"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Contact
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContactsPage;