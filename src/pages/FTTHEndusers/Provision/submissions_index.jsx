import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/sideBar';
import TopBar from '../../../components/topBar';
import { IoMdSearch } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    AlertCircle,
    Clock,
    XCircle,
    FileOutput,
    Loader2
} from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const total = Math.max(totalPages, 1);
        const pages = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            if (currentPage > 3) pages.push(1, '...');
            for (let i = Math.max(1, currentPage - 2); i <= Math.min(total, currentPage + 2); i++) {
                pages.push(i);
            }
            if (currentPage < total - 2) pages.push('...', total);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-100 disabled:opacity-50"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, index) =>
                page === '...' ? (
                    <span key={index} className="px-2 text-gray-400">
                        ...
                    </span>
                ) : (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-1 rounded border ${page === currentPage
                            ? 'bg-blue-500  border-blue-500'
                            : 'border-blue-800 text-blue-500 hover:bg-blue-100'
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-100 disabled:opacity-50"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function SubmissionsIndex() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const STATE_CONFIG = {
        requires_fix: { icon: AlertCircle, color: 'text-slate-500', label: 'Requires Fix' },
        pending: { icon: Clock, color: 'text-pending', label: 'Pending' },
        new_fix_submitted: { icon: FileOutput, color: 'text-primary', label: 'New Fix Submitted' },
        checking: { icon: Loader2, color: 'text-success', label: 'Checking' },
        rejected: { icon: XCircle, color: 'text-danger', label: 'Rejected' }
    };

    const fetchSubmissions = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authorization token is missing. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const myHeaders = new Headers();
            myHeaders.append('Authorization', token);

            const response = await fetch(
                `http://192.168.69.50:8069/jt_api/ftth_enduser/provision/submissions?page=${currentPage}&search=${searchQuery}`,
                {
                    method: 'GET',
                    headers: myHeaders
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            const result = await response.json();
            if (result.status === 'success') {
                setSubmissions(result.data);
                setTotalPages(result.last_page);
            } else {
                throw new Error(result.message || 'Failed to fetch submissions');
            }
        } catch (error) {
            setError(error.message || 'An error occurred while fetching submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleRowClick = (id) => {
        navigate(`/provision/${id}`);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchSubmissions();
    }, [currentPage, searchQuery]);

    if (error) {
        return (
            <div className="flex py-5 pr-10 pl-5 pb-20">
                <Sidebar isMobile={false} />
                <div className="content flex-1">
                    <TopBar />
                    <div className="mt-5 text-center text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex py-5 pr-10 pl-5 pb-20">
            <Sidebar isMobile={false} />
            <div className="content flex-1">
                <TopBar />
                <h2 className="intro-y text-lg font-medium mt-10">Submission List</h2>
                <div className="grid grid-cols-12 gap-6 mt-5">
                    <div className="intro-y col-span-12 flex flex-wrap sm:flex-nowrap items-center justify-between mt-2">
                        <input
                            type="text"
                            className="form-control w-56 box pr-10"
                            placeholder="Search by phone or username..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="intro-y col-span-12 overflow-auto lg:overflow-visible">
                        <table className="table table-report -mt-2">
                            <thead>
                                <tr>
                                    <th className="whitespace-nowrap">ID</th>
                                    <th className="whitespace-nowrap">NAME</th>
                                    <th className=" whitespace-nowrap">USER NAME</th>
                                    <th className="text-center whitespace-nowrap">PHONE</th>
                                    <th className="text-center whitespace-nowrap">STATUS</th>
                                    {/* <th className="text-center whitespace-nowrap">CREATE AT</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">Loading...</td>
                                    </tr>
                                ) : (
                                    submissions.map((submission) => (
                                        <tr
                                            key={submission.id}
                                            className="intro-x cursor-pointer"
                                            onClick={() => handleRowClick(submission.id)}
                                        >
                                            <td>#{submission.id}</td>
                                            <td>{submission.first_name} {submission.mid_name} {submission.last_name}</td>
                                            <td>{submission.name}</td>
                                            <td>{submission.phone}</td>
                                            <td>
                                                <div
                                                    className={`flex items-center justify-center gap-2 ${STATE_CONFIG[submission.state]?.color}`}
                                                >
                                                    {STATE_CONFIG[submission.state]?.icon &&
                                                        React.createElement(STATE_CONFIG[submission.state].icon, {
                                                            className: 'w-4 h-4'
                                                        })}
                                                    {STATE_CONFIG[submission.state]?.label}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
